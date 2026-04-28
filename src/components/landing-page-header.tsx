"use client"

import { BoxIcon, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useLayoutEffect, useState } from "react"

import { Button } from "@/components/ui/button"

export function LandingPageHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  return (
    <div className="flex items-center justify-between px-6 py-4 md:px-10">
      <Link
        href="/"
        className="flex items-center gap-2 font-semibold text-foreground transition-opacity hover:opacity-80"
      >
        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <BoxIcon className="size-4" />
        </div>
        PickleHub
      </Link>
      <div className="flex gap-3">
        {mounted ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        ) : (
          <div className="h-10 w-10" />
        )}
      </div>
    </div>
  )
}
