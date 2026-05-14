"use client"

import { type ExternalToast, toast as sonnerToast } from "sonner"

export interface ToastOptions extends ExternalToast {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    const { title, description, variant = "default", ...rest } = options

    if (variant === "destructive") {
      sonnerToast.error(title || "Error", {
        description,
        ...rest,
      })
    } else {
      sonnerToast.success(title || "Success", {
        description,
        ...rest,
      })
    }
  }

  return { toast }
}
