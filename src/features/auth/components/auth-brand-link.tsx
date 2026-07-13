"use client"

import { BoxIcon } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"

export function AuthBrandLink({ href = "/" }: { href?: string }) {
  const { t } = useTranslation("common")

  return (
    <Link href={href} className="flex items-center gap-2 font-medium">
      <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <BoxIcon className="size-4" />
      </div>
      {t("brand")}
    </Link>
  )
}
