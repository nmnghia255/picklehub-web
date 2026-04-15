import { AlertCircle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorSectionProps {
  title?: string
  message: string
  className?: string
}

export function ErrorSection({
  title = "Đã có lỗi xảy ra",
  message,
  className,
}: ErrorSectionProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
