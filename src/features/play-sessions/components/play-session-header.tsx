import Link from "next/link"

import { Button } from "@/components/ui/button"

interface PlaySessionHeaderProps {
  title: string
  backHref: string
  action?: React.ReactNode
}

export function PlaySessionHeader({
  title,
  backHref,
  action,
}: PlaySessionHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {action}
        <Button variant="outline" asChild>
          <Link href={backHref}>Quay lại</Link>
        </Button>
      </div>
    </div>
  )
}
