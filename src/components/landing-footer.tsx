"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { useLayoutEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

export function LandingFooter() {
  const { t } = useTranslation("common")
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const currentYear = new Date().getFullYear()

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <footer className="border-t border-border/40 bg-card/40 py-12 backdrop-blur-md md:py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link
              href="/"
              className="group flex w-fit items-center gap-3 font-semibold text-foreground transition-opacity hover:opacity-90"
            >
              {mounted ? (
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 p-1 shadow-xs",
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
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("landing.footer.description")}
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold tracking-wider text-foreground uppercase">
              {t("landing.footer.sections.company")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/#features"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {t("landing.header.features")}
                </Link>
              </li>
              <li>
                <Link
                  href="/socials"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {t("landing.header.socials")}
                </Link>
              </li>
              <li>
                <Link
                  href="/tournaments"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {t("landing.header.tournaments")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold tracking-wider text-foreground uppercase">
              {t("landing.footer.sections.support")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {t("landing.howItWorks.title")}
                </Link>
              </li>
              <li>
                <Link
                  href="/learner"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {t("landing.features.items.groups.title")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold tracking-wider text-foreground uppercase">
              {t("landing.footer.sections.legal")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {t("landing.footer.links.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {t("landing.footer.links.terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>{t("landing.footer.copyright", { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  )
}
