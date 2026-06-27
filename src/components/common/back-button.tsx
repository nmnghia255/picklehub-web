"use client"

import type { VariantProps } from "class-variance-authority"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useTranslation } from "react-i18next"

import type { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface BackButtonProps
  extends
    Omit<React.ComponentProps<"button">, "onClick">,
    VariantProps<typeof buttonVariants> {
  /**
   * The destination URL to navigate to. If not provided, it will call `router.back()`.
   */
  to?: string
  /**
   * Optional custom click handler. If provided, navigation via `to` or `router.back()` will only happen if `onClick` does not prevent default.
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /**
   * Whether to use the custom green/emerald theme style.
   */
  emerald?: boolean
}

export function BackButton({
  to,
  onClick,
  children,
  className,
  variant = "outline",
  size = "sm",
  emerald = false,
  ...props
}: BackButtonProps) {
  const router = useRouter()
  const { t } = useTranslation("common")

  const handleBack = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(event)
    }

    if (!event.defaultPrevented) {
      if (to) {
        router.push(to)
      } else {
        router.back()
      }
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "gap-2",
        emerald &&
          "border-emerald-600 font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-950/20",
        className
      )}
      onClick={handleBack}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      {children || t("back", { defaultValue: "Back" })}
    </Button>
  )
}
