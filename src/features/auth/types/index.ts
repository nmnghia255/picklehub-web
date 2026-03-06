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
// Link Google Types
// ============================================

export interface LinkGoogleRequest {
  idToken: string
}

export interface LinkGoogleResponse {
  message: string
}
