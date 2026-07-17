import { apiClient } from './axios-client'
import type { AuthResponse, LoginPayload, SignupPayload } from '../types/auth'

export const authApi = {
  signup(payload: SignupPayload) {
    return apiClient.post<AuthResponse>('/auth/signup', payload).then((res) => res.data)
  },
  login(payload: LoginPayload) {
    return apiClient.post<AuthResponse>('/auth/login', payload).then((res) => res.data)
  },
}
