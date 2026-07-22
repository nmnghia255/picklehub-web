"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"

const themeCookieKey = "theme"
const themeCookieMaxAge = 60 * 60 * 24 * 365

export function ThemeSync() {
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    if (typeof window === "undefined") return

    const nextTheme =
      theme === "system" ? (resolvedTheme ?? "light") : (theme ?? "light")

    window.document.cookie = `${themeCookieKey}=${nextTheme}; path=/; max-age=${themeCookieMaxAge}; samesite=lax`
  }, [resolvedTheme, theme])

  return null
}
