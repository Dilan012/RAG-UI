import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { embeddingApi } from '../../api/embedding-api'
import { extractErrorMessage } from '../extract-error-message'
import type { KnowledgeBaseDocument, KnowledgeBaseFile } from '../../types/knowledge-base'

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

function toFile(doc: KnowledgeBaseDocument): KnowledgeBaseFile {
  return {
    id: doc.id,
    name: doc.fileName,
    size: doc.sizeBytes,
    uploadedAt: Date.parse(doc.createdAt),
    status: 'uploaded',
    source: doc.source,
  }
}

export const fetchKnowledgeBaseFiles = createAsyncThunk<KnowledgeBaseDocument[], undefined, { rejectValue: string }>(
  'knowledgeBase/fetchAll',
  async (_arg, { rejectWithValue }) => {
    try {
      return await embeddingApi.list()
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to load knowledge base'))
    }
  },
)

export const ingestFile = createAsyncThunk<KnowledgeBaseDocument, File, { rejectValue: string }>(
  'knowledgeBase/ingestFile',
  async (file, { rejectWithValue }) => {
    try {
      return await embeddingApi.ingestFile(file)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to upload file'))
    }
  },
)

export const ingestText = createAsyncThunk<KnowledgeBaseDocument, string, { rejectValue: string }>(
  'knowledgeBase/ingestText',
  async (text, { rejectWithValue }) => {
    try {
      return await embeddingApi.ingestText(text)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to add text'))
    }
  },
)

const knowledgeBaseSlice = createSlice({
  name: 'knowledgeBase',
  initialState: initialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKnowledgeBaseFiles.fulfilled, (state, action) => {
        state.files = action.payload.map(toFile)
      })
      .addCase(ingestFile.pending, (state, action) => {
        // action.meta.requestId is unique per dispatch, so it doubles as a stable id
        // linking this pending/fulfilled/rejected trio to the same list entry until
        // the server assigns a real one on success.
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
        const index = state.files.findIndex((f) => f.id === action.meta.requestId)
        if (index !== -1) state.files[index] = toFile(action.payload)
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
        const index = state.files.findIndex((f) => f.id === action.meta.requestId)
        if (index !== -1) state.files[index] = toFile(action.payload)
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

export default knowledgeBaseSlice.reducer
