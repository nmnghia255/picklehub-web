import { apiClient } from "@/lib/api-client"

import type {
  ChangePasswordDto,
  ChangePasswordResponse,
  ForgotPasswordDto,
  ForgotPasswordResponse,
  ResetPasswordDto,
  ResetPasswordResponse,
  SetPasswordDto,
  SetPasswordResponse,
} from "../types"

export const passwordService = {
  setPassword: async (data: SetPasswordDto): Promise<SetPasswordResponse> => {
    const response = await apiClient.post<SetPasswordResponse>(
      "/api/auth/set-password",
      data
    )
    return response.data
  },

  changePassword: async (
    data: ChangePasswordDto
  ): Promise<ChangePasswordResponse> => {
    const response = await apiClient.post<ChangePasswordResponse>(
      "/api/auth/change-password",
      data
    )
    return response.data
  },

  forgotPassword: async (
    data: ForgotPasswordDto
  ): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>(
      "/api/auth/forgot-password",
      data
    )
    return response.data
  },

  resetPassword: async (
    data: ResetPasswordDto
  ): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>(
      "/api/auth/reset-password",
      data
    )
    return response.data
  },
}
