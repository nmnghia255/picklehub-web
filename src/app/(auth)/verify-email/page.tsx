import axios from "axios"

import { VerifyEmailResult } from "@/features/auth/components/verify-email-result"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return <VerifyEmailResult status="missing" />
  }

  let status: "success" | "error" = "success"
  let message: string | null = null

  try {
    await axios.post(`${API_BASE_URL}/api/auth/verify-email`, { token })
  } catch (error) {
    status = "error"
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || "auth.errors.verifyFailed"
    } else {
      message = "auth.errors.generic"
    }
  }

  return <VerifyEmailResult status={status} message={message} />
}
