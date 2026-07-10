"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

interface BackNavigationProps {
  fallbackPath?: string
}

export function BackNavigation({ fallbackPath }: BackNavigationProps) {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else if (fallbackPath) {
      router.push(fallbackPath)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
      <ArrowLeft className="h-4 w-4" />
      Quay lại
    </Button>
  )
}
