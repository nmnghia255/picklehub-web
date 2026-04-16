"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

interface DeleteStatusToastProps {
  status?: string
  successMessage?: string
  errorMessage?: string
  queryParam?: string
}

export function DeleteStatusToast({
  status,
  successMessage = "Buoi choi da duoc xoa thanh cong.",
  errorMessage = "Xoa buoi choi that bai. Vui long thu lai sau.",
  queryParam = "delete",
}: DeleteStatusToastProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const shownStatusRef = useRef<string | null>(null)

  useEffect(() => {
    if (status !== "success" && status !== "error") {
      return
    }

    if (shownStatusRef.current === status) {
      return
    }

    shownStatusRef.current = status

    if (status === "success") {
      toast.success(successMessage)
    } else {
      toast.error(errorMessage)
    }

    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete(queryParam)

    const query = nextParams.toString()
    const nextHref = query ? `${pathname}?${query}` : pathname

    router.replace(nextHref, { scroll: false })
  }, [
    status,
    successMessage,
    errorMessage,
    queryParam,
    searchParams,
    pathname,
    router,
  ])

  return null
}
