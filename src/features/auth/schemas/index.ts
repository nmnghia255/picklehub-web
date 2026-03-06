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
