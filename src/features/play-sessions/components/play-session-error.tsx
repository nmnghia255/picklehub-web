import Link from "next/link"

import { PageContainer } from "@/components/page-container"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface PlaySessionErrorProps {
  message: string
  backHref: string
}

export function PlaySessionError({ message, backHref }: PlaySessionErrorProps) {
  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={backHref}>Quay lại</Link>
        </Button>
      </div>

      <Alert variant="destructive">
        <AlertTitle>Tải dữ liệu thất bại</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </PageContainer>
  )
}
