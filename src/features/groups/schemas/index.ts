import { z } from "zod"

export const addGroupSchema = z.object({
  name: z.string().min(1, "Tên nhóm không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
})

export type AddGroupFormData = z.infer<typeof addGroupSchema>

export const inviteSchema = z.object({
  email: z.string().email("errors.invalidEmail"),
})

export type InviteFormData = z.infer<typeof inviteSchema>

export const updateGroupSchema = z.object({
  name: z.string().min(1, "Tên nhóm không được để trống").optional(),
  description: z.string().optional(),
  avatarUrl: z
    .string()
    .url("URL ảnh không hợp lệ")
    .optional()
    .or(z.literal("")),
  avatarFile: z.any().optional(),
  maxMembers: z.coerce
    .number()
    .int()
    .min(1, "Số lượng thành viên tối đa phải ít nhất là 1")
    .optional(),
})

export type UpdateGroupFormData = z.infer<typeof updateGroupSchema>
