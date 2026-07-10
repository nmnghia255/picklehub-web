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
    const response = await axios.post<{
      accessToken?: string
      refreshToken?: string
      expiresIn?: number
      user?: { id: string; email: string; name?: string | null }
      message?: string | string[]
      error?: string
    }>(`${API_BASE_URL}/api/auth/login`, parsed.data)
    const { accessToken, refreshToken, expiresIn, user, message, error } =
      response.data

    const backendMessage = Array.isArray(message)
      ? message.join(", ")
      : message || error

    if (backendMessage) {
      console.error("Login rejected by backend", {
        status: response.status,
        message: backendMessage,
      })
      return { error: backendMessage }
    }

    if (
      !accessToken ||
      !refreshToken ||
      !expiresIn ||
      !user?.id ||
      !user.email
    ) {
      console.error("Login response missing auth payload", {
        status: response.status,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasExpiresIn: !!expiresIn,
        hasUser: !!user,
      })
      return { error: "auth.errors.loginFailed" }
    }

    const session = await getSession()
    session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    }
    session.accessToken = accessToken
    session.refreshToken = refreshToken
    session.accessTokenExpiresAt = Date.now() + expiresIn * 1000
    await session.save()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as
        | { message?: string | string[]; error?: string }
        | undefined
      const backendMessage = Array.isArray(responseData?.message)
        ? responseData.message.join(", ")
        : responseData?.message || responseData?.error

      if (backendMessage) {
        console.error("auth.errors.loginFailed", {
          status: error.response?.status,
          message: backendMessage,
        })
        return { error: backendMessage }
      }

      return {
        error: "auth.errors.loginFailed",
      }
    }
    return { error: "auth.errors.generic" }
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
        error: error.response?.data?.message || "auth.errors.registerFailed",
      }
    }
    return { error: "auth.errors.generic" }
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
    return { error: "auth.validation.invalidToken" }
  }

  try {
    await axios.post(`${API_BASE_URL}/api/auth/verify-email`, parsed.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || "auth.errors.verifyFailed",
      }
    }
    return { error: "auth.errors.generic" }
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
    return { error: "auth.validation.emailInvalid" }
  }

  try {
    await axios.post(
      `${API_BASE_URL}/api/auth/resend-verification`,
      parsed.data
    )
    return { success: true, message: "auth.verifyEmail.resendSuccess" }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || "auth.verifyEmail.resendFailed",
      }
    }
    return { error: "auth.errors.generic" }
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
        error: error.response?.data?.message || "auth.errors.setPasswordFailed",
      }
    }
    return { error: "auth.errors.generic" }
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
      oldPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    })
    return { success: true, message: "auth.changePassword.success" }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message || "auth.errors.changePasswordFailed",
      }
    }
    return { error: "auth.errors.generic" }
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
      message: "auth.magicLink.successMessage",
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || "auth.errors.sendLinkFailed",
      }
    }
    return { error: "auth.errors.generic" }
  }
}

// ============================================
// Magic Link - Verify
// ============================================

export async function verifyMagicLinkAction(magic: string): Promise<{
  error?: string
}> {
  if (!magic) {
    return { error: "auth.magicLinkVerify.invalidLink" }
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
        error: error.response?.data?.message || "auth.errors.verifyFailed",
      }
    }
    return { error: "auth.errors.generic" }
  }
}
