import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "auth.validation.emailRequired")
    .email("auth.validation.emailInvalid"),
  password: z.string().min(1, "auth.validation.passwordRequired"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "auth.validation.emailRequired")
    .email("auth.validation.emailInvalid"),
  password: z
    .string()
    .min(1, "auth.validation.passwordRequired")
    .min(6, "auth.validation.passwordMinLength"),
  name: z.string().min(1, "auth.validation.nameRequired"),
})

export type RegisterFormData = z.infer<typeof registerSchema>

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "auth.validation.tokenRequired"),
})

export const resendVerificationSchema = z.object({
  email: z
    .string()
    .min(1, "auth.validation.emailRequired")
    .email("auth.validation.emailInvalid"),
})

export type ResendVerificationFormData = z.infer<
  typeof resendVerificationSchema
>

export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "auth.validation.passwordRequired")
      .min(8, "auth.validation.passwordMinLength8"),
    confirmPassword: z
      .string()
      .min(1, "auth.validation.confirmPasswordRequired"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "auth.validation.passwordsNotMatch",
    path: ["confirmPassword"],
  })

export type SetPasswordFormData = z.infer<typeof setPasswordSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "auth.validation.currentPasswordRequired"),
    newPassword: z
      .string()
      .min(1, "auth.validation.newPasswordRequired")
      .min(8, "auth.validation.newPasswordMinLength"),
    confirmNewPassword: z
      .string()
      .min(1, "auth.validation.confirmNewPasswordRequired"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "auth.validation.newPasswordsNotMatch",
    path: ["confirmNewPassword"],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export const magicLinkSchema = z.object({
  email: z
    .string()
    .min(1, "auth.validation.emailRequired")
    .email("auth.validation.emailInvalid"),
})

export type MagicLinkFormData = z.infer<typeof magicLinkSchema>
