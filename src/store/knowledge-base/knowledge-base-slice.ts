import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { embeddingApi } from '../../api/embedding-api'
import { extractErrorMessage } from '../extract-error-message'
import type { KnowledgeBaseFile } from '../../types/knowledge-base'

interface KnowledgeBaseState {
  files: KnowledgeBaseFile[]
}

function initialState(): KnowledgeBaseState {
  return { files: [] }
}

function textPreviewName(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  return trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed
}

export const ingestFile = createAsyncThunk<void, File, { rejectValue: string }>(
  'knowledgeBase/ingestFile',
  async (file, { rejectWithValue }) => {
    try {
      await embeddingApi.ingestFile(file)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to upload file'))
    }
  },
)

export const ingestText = createAsyncThunk<void, string, { rejectValue: string }>(
  'knowledgeBase/ingestText',
  async (text, { rejectWithValue }) => {
    try {
      await embeddingApi.ingestText(text)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to add text'))
    }
  },
)

const knowledgeBaseSlice = createSlice({
  name: 'knowledgeBase',
  initialState: initialState(),
  reducers: {
    fileRemoved(state, action: PayloadAction<string>) {
      state.files = state.files.filter((f) => f.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ingestFile.pending, (state, action) => {
        // action.meta.requestId is unique per dispatch, so it doubles as a stable id
        // linking this pending/fulfilled/rejected trio to the same list entry.
        state.files.unshift({
          id: action.meta.requestId,
          name: action.meta.arg.name,
          size: action.meta.arg.size,
          uploadedAt: Date.now(),
          status: 'uploading',
          source: 'file',
        })
      })
      .addCase(ingestFile.fulfilled, (state, action) => {
        const entry = state.files.find((f) => f.id === action.meta.requestId)
        if (entry) entry.status = 'uploaded'
      })
      .addCase(ingestFile.rejected, (state, action) => {
        const entry = state.files.find((f) => f.id === action.meta.requestId)
        if (entry) {
          entry.status = 'error'
          entry.errorMessage = action.payload ?? 'Failed to upload file'
        }
      })
      .addCase(ingestText.pending, (state, action) => {
        const text = action.meta.arg
        state.files.unshift({
          id: action.meta.requestId,
          name: textPreviewName(text),
          size: new Blob([text]).size,
          uploadedAt: Date.now(),
          status: 'uploading',
          source: 'text',
        })
      })
      .addCase(ingestText.fulfilled, (state, action) => {
        const entry = state.files.find((f) => f.id === action.meta.requestId)
        if (entry) entry.status = 'uploaded'
      })
      .addCase(ingestText.rejected, (state, action) => {
        const entry = state.files.find((f) => f.id === action.meta.requestId)
        if (entry) {
          entry.status = 'error'
          entry.errorMessage = action.payload ?? 'Failed to add text'
        }
      })
  },
})

export const { fileRemoved } = knowledgeBaseSlice.actions
export default knowledgeBaseSlice.reducer
