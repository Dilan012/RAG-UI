import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { isAxiosError } from 'axios'
import { authApi } from '../../api/auth-api'
import type { AuthResponse, AuthUser, LoginPayload, SignupPayload } from '../../types/auth'

function extractErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && typeof error.response?.data?.error === 'string') {
    return error.response.data.error
  }
  return fallback
}

interface AuthState {
  user: AuthUser | null
  token: string | null
}

function loadPersistedAuth(): AuthState {
  const token = localStorage.getItem('token')
  const userJson = localStorage.getItem('user')
  if (!token || !userJson) return { user: null, token: null }

  try {
    return { user: JSON.parse(userJson) as AuthUser, token }
  } catch {
    return { user: null, token: null }
  }
}

function persistAuth(response: AuthResponse) {
  localStorage.setItem('token', response.token)
  localStorage.setItem('user', JSON.stringify(response.user))
}

function clearPersistedAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const signup = createAsyncThunk<AuthResponse, SignupPayload, { rejectValue: string }>(
  'auth/signup',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.signup(payload)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Signup failed'))
    }
  },
)

export const login = createAsyncThunk<AuthResponse, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.login(payload)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Login failed'))
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState: loadPersistedAuth(),
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      clearPersistedAuth()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.fulfilled, applyAuthResponse)
      .addCase(login.fulfilled, applyAuthResponse)
  },
})

function applyAuthResponse(state: AuthState, action: PayloadAction<AuthResponse>) {
  state.user = action.payload.user
  state.token = action.payload.token
  persistAuth(action.payload)
}

export const { logout } = authSlice.actions
export default authSlice.reducer
