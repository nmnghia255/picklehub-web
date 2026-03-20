import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  password: z
    .string()
    .min(1, "Mật khẩu không được để trống")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  name: z.string().min(1, "Họ và tên không được để trống"),
})

export type RegisterFormData = z.infer<typeof registerSchema>

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token không được để trống"),
})

export const resendVerificationSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
})

export type ResendVerificationFormData = z.infer<
  typeof resendVerificationSchema
>

export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Mật khẩu không được để trống")
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  })

export type SetPasswordFormData = z.infer<typeof setPasswordSchema>

export const magicLinkSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
})

export type MagicLinkFormData = z.infer<typeof magicLinkSchema>
