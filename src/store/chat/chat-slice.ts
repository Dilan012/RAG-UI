import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { chatApi } from '../../api/chat-api'
import { conversationApi } from '../../api/conversation-api'
import { messageApi } from '../../api/message-api'
import { extractErrorMessage } from '../extract-error-message'
import { makeId } from '../../utils/make-id'
import type { ChatMessage, ChatStreamResult, MessageSummary, SendChatMessagePayload } from '../../types/chat'
import type { ConversationSummary, UpdateConversationPayload } from '../../types/conversation'

interface ChatState {
  conversations: ConversationSummary[]
  activeId: string | null
  messagesByConversationId: Record<string, ChatMessage[]>
}

function initialState(): ChatState {
  return { conversations: [], activeId: null, messagesByConversationId: {} }
}

function toChatMessage(message: MessageSummary): ChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: new Date(message.createdAt).getTime(),
  }
}

// The in-flight assistant message is always the last entry in the conversation's list —
// assistantMessageStarted (dispatched synchronously before the stream begins) guarantees
// that, so every chunk/completion/failure handler below can just target list[-1] rather
// than searching by id.
function lastAssistantMessage(state: ChatState, conversationId: string): ChatMessage | undefined {
  const messages = state.messagesByConversationId[conversationId]
  const last = messages?.[messages.length - 1]
  return last?.role === 'assistant' ? last : undefined
}

export const fetchConversations = createAsyncThunk<ConversationSummary[], undefined, { rejectValue: string }>(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      return await conversationApi.list()
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to load conversations'))
    }
  },
)

export const createConversation = createAsyncThunk<ConversationSummary, string, { rejectValue: string }>(
  'chat/createConversation',
  async (name, { rejectWithValue }) => {
    try {
      return await conversationApi.create({ name })
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to create conversation'))
    }
  },
)

export const renameConversation = createAsyncThunk<
  ConversationSummary,
  UpdateConversationPayload,
  { rejectValue: string }
>('chat/renameConversation', async (payload, { rejectWithValue }) => {
  try {
    return await conversationApi.update(payload)
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to rename conversation'))
  }
})

export const deleteConversation = createAsyncThunk<{ id: string }, string, { rejectValue: string }>(
  'chat/deleteConversation',
  async (id, { rejectWithValue }) => {
    try {
      return await conversationApi.remove(id)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to delete conversation'))
    }
  },
)

export const fetchMessages = createAsyncThunk<MessageSummary[], string, { rejectValue: string }>(
  'chat/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      return await messageApi.list(conversationId)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to load messages'))
    }
  },
)

export const sendChatMessage = createAsyncThunk<ChatStreamResult, SendChatMessagePayload, { rejectValue: string }>(
  'chat/sendMessage',
  async ({ conversationId, message }, { dispatch, rejectWithValue }) => {
    dispatch(assistantMessageStarted({ conversationId }))
    try {
      const result = await chatApi.streamMessage({ conversationId, message }, (chunk) => {
        dispatch(assistantChunkAppended({ conversationId, chunk }))
      })
      if (result.failed) {
        return rejectWithValue(result.reply || 'Failed to get a response. Please try again.')
      }
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get a response. Please try again.'
      return rejectWithValue(message)
    }
  },
)

const chatSlice = createSlice({
  name: 'chat',
  initialState: initialState(),
  reducers: {
    conversationSelected(state, action: PayloadAction<string>) {
      state.activeId = action.payload
    },
    userMessageSent(state, action: PayloadAction<{ conversationId: string; content: string }>) {
      const messages = state.messagesByConversationId[action.payload.conversationId] ?? []
      messages.push({ id: makeId(), role: 'user', content: action.payload.content, createdAt: Date.now() })
      state.messagesByConversationId[action.payload.conversationId] = messages
    },
    // Appends an empty placeholder the moment a reply starts streaming, so the message
    // list already has a row to grow into — the UI shows a typing indicator in place of
    // empty content until the first chunk arrives (see MessageThread).
    assistantMessageStarted(state, action: PayloadAction<{ conversationId: string }>) {
      const messages = state.messagesByConversationId[action.payload.conversationId] ?? []
      messages.push({ id: makeId(), role: 'assistant', content: '', createdAt: Date.now() })
      state.messagesByConversationId[action.payload.conversationId] = messages
    },
    assistantChunkAppended(state, action: PayloadAction<{ conversationId: string; chunk: string }>) {
      const message = lastAssistantMessage(state, action.payload.conversationId)
      if (message) message.content += action.payload.chunk
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload
        if (!state.activeId && action.payload.length > 0) {
          state.activeId = action.payload[0]!.id
        }
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload)
        state.activeId = action.payload.id
        state.messagesByConversationId[action.payload.id] = []
      })
      .addCase(renameConversation.fulfilled, (state, action) => {
        const conversation = state.conversations.find((c) => c.id === action.payload.id)
        if (conversation) {
          conversation.name = action.payload.name
          conversation.updatedAt = action.payload.updatedAt
        }
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        const deletedId = action.payload.id
        state.conversations = state.conversations.filter((c) => c.id !== deletedId)
        delete state.messagesByConversationId[deletedId]
        if (state.activeId === deletedId) {
          state.activeId = state.conversations[0]?.id ?? null
        }
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesByConversationId[action.meta.arg] = action.payload.map(toChatMessage)
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        // Overwrite with the server's definitive final text rather than trusting
        // whatever the chunk-by-chunk concatenation produced client-side.
        const message = lastAssistantMessage(state, action.meta.arg.conversationId)
        if (message) message.content = action.payload.reply
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        const message = lastAssistantMessage(state, action.meta.arg.conversationId)
        const errorText = action.payload ?? 'Failed to get a response. Please try again.'
        if (message) {
          message.content = errorText
        } else {
          const messages = state.messagesByConversationId[action.meta.arg.conversationId] ?? []
          messages.push({ id: makeId(), role: 'assistant', content: errorText, createdAt: Date.now() })
          state.messagesByConversationId[action.meta.arg.conversationId] = messages
        }
      })
  },
})

export const { conversationSelected, userMessageSent, assistantMessageStarted, assistantChunkAppended } =
  chatSlice.actions
export default chatSlice.reducer
