import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { gmailApi } from '../../api/gmail-api'
import { extractErrorMessage } from '../extract-error-message'
import type { GmailStatus } from '../../types/connectors'

interface ConnectorsState {
  gmail: GmailStatus
}

function initialState(): ConnectorsState {
  return { gmail: { connected: false } }
}

export const fetchGmailStatus = createAsyncThunk<GmailStatus, undefined, { rejectValue: string }>(
  'connectors/fetchGmailStatus',
  async (_arg, { rejectWithValue }) => {
    try {
      return await gmailApi.getStatus()
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to load Gmail connection status'))
    }
  },
)

export const getGmailAuthUrl = createAsyncThunk<string, undefined, { rejectValue: string }>(
  'connectors/getGmailAuthUrl',
  async (_arg, { rejectWithValue }) => {
    try {
      const { authUrl } = await gmailApi.getAuthUrl()
      return authUrl
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to start Gmail connection'))
    }
  },
)

export const disconnectGmail = createAsyncThunk<void, undefined, { rejectValue: string }>(
  'connectors/disconnectGmail',
  async (_arg, { rejectWithValue }) => {
    try {
      await gmailApi.disconnect()
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to disconnect Gmail'))
    }
  },
)

const connectorsSlice = createSlice({
  name: 'connectors',
  initialState: initialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGmailStatus.fulfilled, (state, action) => {
        state.gmail = action.payload
      })
      .addCase(disconnectGmail.fulfilled, (state) => {
        state.gmail = { connected: false }
      })
  },
})

export default connectorsSlice.reducer
