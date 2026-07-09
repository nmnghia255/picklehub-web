"use client"

import { BoxIcon } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"

export function LandingFooter() {
  const { t } = useTranslation("common")
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="flex w-fit items-center gap-2 font-semibold text-foreground transition-opacity hover:opacity-80"
            >
              <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BoxIcon className="size-4" />
              </div>
              {t("brand")}
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("landing.footer.description")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold">
              {t("landing.footer.sections.company")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("landing.footer.links.about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("landing.footer.links.blog")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold">
              {t("landing.footer.sections.legal")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("landing.footer.links.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("landing.footer.links.terms")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold">
              {t("landing.footer.sections.support")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("landing.footer.links.contact")}
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("landing.footer.links.faq")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>{t("landing.footer.copyright", { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  )
}
