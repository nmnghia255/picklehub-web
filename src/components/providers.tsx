"use client"

import { AppProgressProvider } from "@bprogress/next"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Provider as JotaiProvider } from "jotai"
import { ThemeProvider } from "next-themes"
import { useState } from "react"
import { Toaster } from "sonner"

import { I18nProvider } from "@/components/i18n-provider"
import { ThemeEffects } from "@/components/theme-effects"

if (typeof window !== "undefined") {
  let googleVal: unknown = undefined
  let lastInitTime = 0
  let lastClientId: string | null = null

  const handler: ProxyHandler<object> = {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver)
      if (prop === "accounts" && val && typeof val === "object") {
        const accountsObj = val as Record<string, unknown>
        const idObj = accountsObj.id as Record<string, unknown> | undefined
        if (idObj && typeof idObj.initialize === "function") {
          const initFn = idObj.initialize as (config: {
            client_id?: string
          }) => void
          const patchedFn = initFn as unknown as { __patched?: boolean }
          if (!patchedFn.__patched) {
            const originalInit = initFn
            idObj.initialize = function (
              this: unknown,
              ...args: [{ client_id?: string }]
            ) {
              const config = args[0]
              const now = Date.now()
              if (
                config &&
                config.client_id === lastClientId &&
                now - lastInitTime < 500
              ) {
                return
              }
              if (config?.client_id) {
                lastClientId = config.client_id
              }
              lastInitTime = now
              return originalInit.apply(this, args)
            }
            ;(idObj.initialize as unknown as { __patched: boolean }).__patched =
              true
          }
        }
      }
      return val
    },
  }

  Object.defineProperty(window, "google", {
    configurable: true,
    enumerable: true,
    get() {
      return googleVal ? new Proxy(googleVal as object, handler) : undefined
    },
    set(val) {
      googleVal = val
    },
  })
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          <I18nProvider>
            <ThemeProvider
              enableSystem
              disableTransitionOnChange
              enableColorScheme
              storageKey="theme"
              defaultTheme="system"
              attribute="class"
            >
              <ThemeEffects />
              <AppProgressProvider
                color="#2563eb"
                height="2px"
                delay={500}
                options={{ showSpinner: false }}
              >
                {children}
              </AppProgressProvider>

              <Toaster position="top-center" richColors />
              <Analytics />
              <SpeedInsights />
            </ThemeProvider>
          </I18nProvider>
        </JotaiProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}
