import { apiClient, API_BASE_URL } from './axios-client'
import type { ApiSuccessResponse } from '../types/api'
import type { ChatPayload, ChatStreamResult } from '../types/chat'

// Must match RAG's appConfig.chat.streamErrorSentinel exactly — written to the end of
// the stream if the model call fails after the response has already started, since a
// normal { success: false, ... } JSON error is no longer possible at that point.
const STREAM_ERROR_SENTINEL = ' __STREAM_ERROR__ '

export const chatApi = {
  /**
   * POST /chat streams the reply as raw text chunks rather than a single JSON body, so
   * this bypasses apiClient (axios) in favor of fetch, which exposes a readable stream
   * for the response body. onChunk is called with each piece of text as it arrives, so
   * the caller (the sendChatMessage thunk) can render the reply incrementally instead of
   * waiting for the whole thing.
   */
  async streamMessage(payload: ChatPayload, onChunk: (piece: string) => void): Promise<ChatStreamResult> {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      // A non-2xx means the stream never started (auth/validation/etc. failed before any
      // chunk was written) — the body is still the normal { success: false, error, code }
      // envelope in that case.
      const data = await response.json().catch(() => null)
      throw new Error(
        typeof data?.error === 'string' ? data.error : 'Failed to get a response. Please try again.',
      )
    }
    if (!response.body) {
      throw new Error('Streaming is not supported in this browser.')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let full = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const piece = decoder.decode(value, { stream: true })
      full += piece
      onChunk(piece)
    }

    const failed = full.includes(STREAM_ERROR_SENTINEL)
    const reply = failed ? full.split(STREAM_ERROR_SENTINEL).join('').trimEnd() : full

    return { reply, failed }
  },

  /**
   * POST /chat/invoke — the same turn as streamMessage, just as one plain response
   * instead of a live stream. Returns the same ChatStreamResult shape (failed is always
   * false here — a rejected request just throws normally) so sendChatMessage can treat
   * both modes identically after the call resolves.
   */
  async invokeMessage(payload: ChatPayload): Promise<ChatStreamResult> {
    const res = await apiClient.post<ApiSuccessResponse<{ reply: string }>>('/chat/invoke', payload)
    return { reply: res.data.data.reply, failed: false }
  },
}
