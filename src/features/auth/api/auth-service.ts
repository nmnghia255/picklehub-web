import { apiClient } from "@/lib/api-client"

import type {
  GetMeResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  SendMagicLinkRequest,
  SendMagicLinkResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  VerifyMagicLinkRequest,
  VerifyMagicLinkResponse,
} from "../types"

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      "/api/auth/login",
      credentials
    )
    return response.data
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(
      "/api/auth/register",
      data
    )
    return response.data
  },

  verifyEmail: async (
    data: VerifyEmailRequest
  ): Promise<VerifyEmailResponse> => {
    const response = await apiClient.post<VerifyEmailResponse>(
      "/api/auth/verify-email",
      data
    )
    return response.data
  },

  resendVerification: async (
    data: ResendVerificationRequest
  ): Promise<ResendVerificationResponse> => {
    const response = await apiClient.post<ResendVerificationResponse>(
      "/api/auth/resend-verification",
      data
    )
    return response.data
  },

  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>(
      "/api/auth/refresh",
      data
    )
    return response.data
  },

  getMe: async (): Promise<GetMeResponse> => {
    const response = await apiClient.get<GetMeResponse>("/api/auth/me")
    return response.data
  },

  sendMagicLink: async (
    data: SendMagicLinkRequest
  ): Promise<SendMagicLinkResponse> => {
    const response = await apiClient.post<SendMagicLinkResponse>(
      "/api/auth/magic-link",
      data
    )
    return response.data
  },

  verifyMagicLink: async (
    data: VerifyMagicLinkRequest
  ): Promise<VerifyMagicLinkResponse> => {
    const response = await apiClient.post<VerifyMagicLinkResponse>(
      "/api/auth/magic-link/verify",
      data
    )
    return response.data
  },
}
