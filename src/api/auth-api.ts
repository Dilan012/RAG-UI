import { apiClient } from './axios-client'
import type { ApiSuccessResponse } from '../types/api'
import type { AuthResponse, LoginPayload, SignupPayload } from '../types/auth'

export const authApi = {
  signup(payload: SignupPayload) {
    return apiClient
      .post<ApiSuccessResponse<AuthResponse>>('/auth/signup', payload)
      .then((res) => res.data.data)
  },
  login(payload: LoginPayload) {
    return apiClient
      .post<ApiSuccessResponse<AuthResponse>>('/auth/login', payload)
      .then((res) => res.data.data)
  },
}
