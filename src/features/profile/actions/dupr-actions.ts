"use server"

import axios from "axios"
import { z } from "zod"

import { inviteDupr, unlinkDupr } from "@/features/profile/api/dupr-service"

export interface DuprActionState {
  error?: string
  success?: boolean
  message?: string
}

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const inviteDuprSchema = z.object({
  fullName: z.string().trim().min(1, "duprCard.link.nameRequired"),
  email: z.string().trim().email("duprCard.link.emailInvalid"),
  isoCode: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .length(2, "duprCard.link.countryInvalid")
      .transform((value) => value.toUpperCase())
      .optional()
  ),
  phone: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
})

export async function linkDuprAction(
  _prevState: DuprActionState,
  formData: FormData
): Promise<DuprActionState> {
  const parsed = inviteDuprSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    isoCode: formData.get("isoCode"),
    phone: formData.get("phone"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    await inviteDupr(parsed.data)
    return { success: true, message: "duprCard.link.success" }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || "duprCard.link.error",
      }
    }

    return { error: "duprCard.link.error" }
  }
}

export async function unlinkDuprAction(): Promise<DuprActionState> {
  try {
    await unlinkDupr()
    return { success: true, message: "duprCard.unlink.success" }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || "duprCard.unlink.error",
      }
    }

    return { error: "duprCard.unlink.error" }
  }
}
