"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { useLayoutEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

export function AuthBrandLink({ href = "/" }: { href?: string }) {
  const { t } = useTranslation("common")
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 font-semibold text-foreground transition-opacity hover:opacity-90"
    >
      {mounted ? (
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 p-0.5 shadow-xs transition-transform duration-200 group-hover:scale-105",
            isDark ? "bg-white" : "bg-muted/20"
          )}
        >
          <img
            src={isDark ? "/logo-dark.png" : "/logo-light.png"}
            alt={t("brand")}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <div className="size-8 rounded-lg bg-muted/40" />
      )}
      <span className="text-xl font-extrabold tracking-tight text-foreground">
        {t("brand")}
      </span>
    </Link>
  )
}
