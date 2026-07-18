import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { chatApi } from '../../api/chat-api'
import { extractErrorMessage } from '../extract-error-message'
import { makeId } from '../../utils/make-id'
import type { ChatMessage, ChatReply, Conversation, SendChatMessagePayload } from '../../types/chat'

interface ChatState {
  conversations: Conversation[]
  activeId: string
}

function createConversation(title = 'New chat'): Conversation {
  return {
    id: makeId(),
    title,
    messages: [],
    updatedAt: Date.now(),
  }
}

function initialState(): ChatState {
  const welcome = createConversation('Welcome')
  return { conversations: [welcome], activeId: welcome.id }
}

function appendAssistantMessage(state: ChatState, conversationId: string, content: string) {
  const conversation = state.conversations.find((c) => c.id === conversationId)
  if (!conversation) return

  const message: ChatMessage = { id: makeId(), role: 'assistant', content, createdAt: Date.now() }
  conversation.messages.push(message)
  conversation.updatedAt = Date.now()
}

export const sendChatMessage = createAsyncThunk<ChatReply, SendChatMessagePayload, { rejectValue: string }>(
  'chat/sendMessage',
  async ({ customerId, message }, { rejectWithValue }) => {
    try {
      return await chatApi.sendMessage({ customerId, message })
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to get a response. Please try again.'))
    }
  },
)

const chatSlice = createSlice({
  name: 'chat',
  initialState: initialState(),
  reducers: {
    conversationCreated(state) {
      const conversation = createConversation()
      state.conversations.unshift(conversation)
      state.activeId = conversation.id
    },
    conversationDeleted(state, action: PayloadAction<string>) {
      state.conversations = state.conversations.filter((c) => c.id !== action.payload)
      if (action.payload === state.activeId && state.conversations.length > 0) {
        state.activeId = state.conversations[0]!.id
      }
    },
    conversationSelected(state, action: PayloadAction<string>) {
      state.activeId = action.payload
    },
    userMessageSent(state, action: PayloadAction<{ conversationId: string; content: string }>) {
      const conversation = state.conversations.find((c) => c.id === action.payload.conversationId)
      if (!conversation) return

      const message: ChatMessage = {
        id: makeId(),
        role: 'user',
        content: action.payload.content,
        createdAt: Date.now(),
      }
      conversation.title = conversation.messages.length === 0 ? action.payload.content.slice(0, 40) : conversation.title
      conversation.messages.push(message)
      conversation.updatedAt = Date.now()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        appendAssistantMessage(state, action.meta.arg.conversationId, action.payload.reply)
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        appendAssistantMessage(
          state,
          action.meta.arg.conversationId,
          action.payload ?? 'Failed to get a response. Please try again.',
        )
      })
  },
})

export const { conversationCreated, conversationDeleted, conversationSelected, userMessageSent } = chatSlice.actions
export default chatSlice.reducer
