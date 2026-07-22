import axios from "axios"

export function getSportCenterRouteError(
  error: unknown,
  fallback: string
): { message: string; status: number } {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string }
      | undefined
    return {
      message: responseData?.message ?? error.message ?? fallback,
      status: error.response?.status ?? 500,
    }
  }

  const message = error instanceof Error ? error.message : fallback
  return {
    message,
    status:
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500,
  }
}
