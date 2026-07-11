// ============================================
// Core User Types
// ============================================

/**
 * Minimal user stored in the encrypted session cookie (id + email only).
 * Keeps cookie payload small to stay within the 4KB browser limit.
 */
export interface SessionUser {
  id: string
  email: string
}

/**
 * Full user data from database schema
 */
export interface User {
  id: string
  email: string
  name: string | null
  role: string
  isVerified: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Authenticated user data returned from API
 * Used in client-side state management
 */
export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
  isEmailVerified?: boolean
}

// ============================================
// Login Types
// ============================================

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: AuthUser
}

// ============================================
// Register Types
// ============================================

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface RegisterResponse {
  message: string
  userId: string
}

// ============================================
// Email Verification Types
// ============================================

export interface VerifyEmailRequest {
  token: string
}

export interface VerifyEmailResponse {
  message: string
}

export interface ResendVerificationRequest {
  email: string
}

export interface ResendVerificationResponse {
  message: string
}

// ============================================
// Token Refresh Types
// ============================================

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  expiresIn: number
}

// ============================================
// Logout Types
// ============================================

export interface LogoutRequest {
  refreshToken: string
}

export interface LogoutResponse {
  message: string
}

// ============================================
// Profile Types
// ============================================

export type GetMeResponse = AuthUser

// ============================================
// Social / Linked Providers
// ============================================

export interface LinkedProvider {
  provider: string
  linkedAt: string
}

export type SocialProvider = "google" | "facebook"

// ============================================
// Link Google Types
// ============================================

export interface LinkGoogleRequest {
  idToken: string
}

export interface LinkGoogleResponse {
  message: string
}

// ============================================
// Accept Invitation Types
// ============================================

export interface AcceptInvitationResponse {
  accessToken: string
  refreshToken: string
  isNewUser: boolean
  groupJoined: boolean
  user: {
    id: string
    email: string
    displayName: string
  }
  group: {
    id: string
    name: string
  }
}

// ============================================
// Password Management Types
// ============================================

export interface SetPasswordRequest {
  password: string
}

export type SetPasswordDto = SetPasswordRequest

export interface SetPasswordResponse {
  message: string
}

export interface ChangePasswordDto {
  oldPassword: string
  newPassword: string
}

export type ChangePasswordRequest = ChangePasswordDto

export interface ChangePasswordResponse {
  message: string
}

export interface ForgotPasswordDto {
  email: string
}

export type ForgotPasswordRequest = ForgotPasswordDto

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordDto {
  token: string
  newPassword: string
}

export type ResetPasswordRequest = ResetPasswordDto

export interface ResetPasswordResponse {
  message: string
}

// ============================================
// Magic Link Types
// ============================================

export interface SendMagicLinkRequest {
  email: string
}

export interface SendMagicLinkResponse {
  message: string
}

export interface VerifyMagicLinkRequest {
  magic: string
}

export interface VerifyMagicLinkResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}
