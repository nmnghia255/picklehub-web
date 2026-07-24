import axios from "axios"

export function getSportCenterRouteError(
  error: unknown,
  fallback: string
): { message: string; status: number } {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string | string[]; error?: string; details?: string }
      | undefined
    const status = error.response?.status ?? 500

    let rawMsg: string | undefined
    if (responseData?.message) {
      rawMsg = Array.isArray(responseData.message)
        ? responseData.message.join(" | ")
        : responseData.message
    } else if (responseData?.error) {
      rawMsg = responseData.error
    } else if (responseData?.details) {
      rawMsg = responseData.details
    }

    if (
      !rawMsg ||
      rawMsg.toLowerCase().startsWith("request failed with status code")
    ) {
      if (status === 409) {
        rawMsg =
          "Trung tâm thể thao với tên hoặc số điện thoại này đã tồn tại (Tên/SĐT bị trùng). Vui lòng kiểm tra lại."
      } else if (status === 400) {
        rawMsg =
          "Thông tin không hợp lệ. Vui lòng kiểm tra lại dữ liệu nhập vào."
      } else if (status === 401 || status === 403) {
        rawMsg =
          "Phiên làm việc hết hạn hoặc bạn không có quyền thực hiện thao tác này."
      } else if (
        error.message &&
        !error.message
          .toLowerCase()
          .startsWith("request failed with status code")
      ) {
        rawMsg = error.message
      }
    }

    return {
      message: rawMsg || fallback,
      status,
    }
  }

  const message = error instanceof Error ? error.message : fallback
  let status =
    message === "Not authenticated" || message === "Session expired" ? 401 : 500

  let formattedMessage = message
  if (
    message.toLowerCase().includes("status code 409") ||
    message.includes("409")
  ) {
    status = 409
    formattedMessage =
      "Trung tâm thể thao với tên hoặc số điện thoại này đã tồn tại (Tên/SĐT bị trùng). Vui lòng kiểm tra lại."
  }

  return {
    message: formattedMessage,
    status,
  }
}
