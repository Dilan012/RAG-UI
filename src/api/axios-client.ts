import axios, { isAxiosError } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // No response (network/CORS failure) or a 5xx from the server: not something
    // a specific form/page can meaningfully recover from, so bounce to /500.
    const status = isAxiosError(error) ? error.response?.status : undefined
    const isServerOrNetworkError = !isAxiosError(error) || !error.response || (status !== undefined && status >= 500)

    if (isServerOrNetworkError) {
      window.location.assign('/500')
      return new Promise(() => {}) // stop this request's promise chain; navigation is already underway
    }
    return Promise.reject(error)
  },
)
