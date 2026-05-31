import type { RecurringSocialFormData } from "../recurring-socials.types"

export async function createRecurringSocial(
  data: RecurringSocialFormData | unknown
): Promise<{ id?: string }> {
  // Minimal stub for TypeScript build: integrate with real API when available.
  return Promise.resolve({ id: "stub-created" })
}
