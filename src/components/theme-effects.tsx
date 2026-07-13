"use client"

import { useEffect } from "react"

import { useMetaColor } from "@/hooks/use-meta-color"

export function ThemeEffects() {
  const { metaColor, setMetaColor } = useMetaColor()

  useEffect(() => {
    setMetaColor(metaColor)
  }, [metaColor, setMetaColor])

  useEffect(() => {
    try {
      if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
        document.documentElement.classList.add("os-macos")
      }
    } catch {
      // Ignore platform detection issues.
    }
  }, [])

  return null
}
