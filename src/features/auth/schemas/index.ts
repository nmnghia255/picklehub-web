import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Full name is required"),
})

export type RegisterFormData = z.infer<typeof registerSchema>

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
})

export const resendVerificationSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
})

export type ResendVerificationFormData = z.infer<
  typeof resendVerificationSchema
>

export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type SetPasswordFormData = z.infer<typeof setPasswordSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export const magicLinkSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
})

export type MagicLinkFormData = z.infer<typeof magicLinkSchema>
