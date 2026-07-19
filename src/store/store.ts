import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth/auth-slice'
import chatReducer from './chat/chat-slice'
import knowledgeBaseReducer from './knowledge-base/knowledge-base-slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    knowledgeBase: knowledgeBaseReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
