import type { AxiosInstance } from "axios"
import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""

// Client-side axios instance for non-auth requests.
// Auth tokens are stored in server-side iron-session cookies,
// not accessible here — use server actions or route handlers for authenticated calls.
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Error response type
export interface ApiErrorResponse {
  message: string
  statusCode?: number
  error?: string
}

// Helper to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse
    return data?.message || error.message || "Đã có lỗi xảy ra"
  }
  if (error instanceof Error) {
    return error.message
  }
  return "Đã có lỗi xảy ra"
}
