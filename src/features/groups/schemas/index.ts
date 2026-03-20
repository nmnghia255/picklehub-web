import { z } from "zod"

export const addGroupSchema = z.object({
  name: z.string().min(1, "Tên nhóm không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
})

export type AddGroupFormData = z.infer<typeof addGroupSchema>

export const inviteSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
})

export type InviteFormData = z.infer<typeof inviteSchema>
