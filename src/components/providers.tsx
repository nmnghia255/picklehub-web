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
              defaultTheme="light"
              attribute="class"
            >
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
