"use server"

import axios from "axios"
import { redirect } from "next/navigation"

import { getAuthenticatedAxios } from "@/lib/server-api"
import { getSession } from "@/lib/session"

import {
  changePasswordSchema,
  loginSchema,
  magicLinkSchema,
  registerSchema,
  resendVerificationSchema,
  setPasswordSchema,
  verifyEmailSchema,
} from "../schemas"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""
const ACCESS_TOKEN_TTL_MS = 900_000

export interface AuthActionState {
  error?: string
  success?: boolean
  message?: string
}

// ============================================
// Login
// ============================================

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/login`,
      parsed.data
    )
    const { accessToken, refreshToken, expiresIn, user } = response.data

    const session = await getSession()
    session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
    }
    session.accessToken = accessToken
    session.refreshToken = refreshToken
    session.accessTokenExpiresAt = Date.now() + expiresIn * 1000
    await session.save()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }

  redirect("/")
}

// ============================================
// Register
// ============================================

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    await axios.post(`${API_BASE_URL}/api/auth/register`, parsed.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Đăng ký thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }

  redirect(
    `/register/verify-email?email=${encodeURIComponent(parsed.data.email)}`
  )
}

// ============================================
// Verify Email
// ============================================

export async function verifyEmailAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = verifyEmailSchema.safeParse({
    token: formData.get("token"),
  })

  if (!parsed.success) {
    return { error: "Token không hợp lệ." }
  }

  try {
    await axios.post(`${API_BASE_URL}/api/auth/verify-email`, parsed.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Xác thực thất bại. Link có thể đã hết hạn.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }

  redirect("/login")
}

// ============================================
// Resend Verification
// ============================================

export async function resendVerificationAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resendVerificationSchema.safeParse({
    email: formData.get("email"),
  })

  if (!parsed.success) {
    return { error: "Email không hợp lệ." }
  }

  try {
    await axios.post(
      `${API_BASE_URL}/api/auth/resend-verification`,
      parsed.data
    )
    return { success: true, message: "Email xác thực đã được gửi lại!" }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || "Gửi lại thất bại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

// ============================================
// Set Password
// ============================================

export async function setPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const groupId = formData.get("groupId") as string | null

  try {
    const client = await getAuthenticatedAxios()
    await client.post("/api/auth/set-password", {
      password: parsed.data.password,
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Đặt mật khẩu thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }

  redirect(groupId ? `/groups/${groupId}` : "/groups")
}

// ============================================
// Change Password
// ============================================

export async function changePasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmNewPassword: formData.get("confirmNewPassword"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    const client = await getAuthenticatedAxios()
    await client.post("/api/auth/change-password", {
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    })
    return { success: true, message: "Đổi mật khẩu thành công." }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Đổi mật khẩu thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

// ============================================
// Logout
// ============================================

export async function logoutAction() {
  const session = await getSession()
  session.destroy()
  redirect("/login")
}

// ============================================
// Magic Link - Send
// ============================================

export async function sendMagicLinkAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = magicLinkSchema.safeParse({
    email: formData.get("email"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    await axios.post(`${API_BASE_URL}/api/auth/magic-link`, parsed.data)
    return {
      success: true,
      message:
        "Nếu tài khoản tồn tại, một link đăng nhập đã được gửi đến email của bạn.",
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Gửi link thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

// ============================================
// Magic Link - Verify
// ============================================

export async function verifyMagicLinkAction(magic: string): Promise<{
  error?: string
}> {
  if (!magic) {
    return { error: "Link đăng nhập không hợp lệ." }
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/magic-link/verify`,
      { magic }
    )
    const { accessToken, refreshToken, user } = response.data

    const session = await getSession()
    session.user = { id: user.id, email: user.email }
    session.accessToken = accessToken
    session.refreshToken = refreshToken
    session.accessTokenExpiresAt = Date.now() + ACCESS_TOKEN_TTL_MS
    await session.save()

    return {}
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Xác thực thất bại. Link có thể đã hết hạn hoặc không hợp lệ.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}
