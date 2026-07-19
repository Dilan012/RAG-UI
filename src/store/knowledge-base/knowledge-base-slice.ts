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
  },
})

export const { fileRemoved } = knowledgeBaseSlice.actions
export default knowledgeBaseSlice.reducer
