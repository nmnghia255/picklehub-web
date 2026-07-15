import "@/styles/globals.css"

import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"

import { FacebookSDKScript } from "@/components/facebook-sdk-script"
import { Providers } from "@/components/providers"
import { META_THEME_COLORS, SITE_INFO } from "@/config/site"
import { AuthInitializer } from "@/features/auth/components/auth-initializer"
import { fetchMyNotifications } from "@/features/notifications/actions/user-notifications"
import { defaultLanguage, languageCookieKey } from "@/i18n/settings"
import { getSession } from "@/lib/session"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_INFO.url),
  alternates: {
    canonical: "/",
  },
  title: {
    template: `%s | ${SITE_INFO.name}`,
    default: SITE_INFO.name,
  },
  description: SITE_INFO.description,
  keywords: SITE_INFO.keywords,
  authors: [
    {
      name: "ncdai",
      url: SITE_INFO.url,
    },
  ],
  creator: "ncdai",
  openGraph: {
    siteName: SITE_INFO.name,
    url: "/",
    type: "website",
    images: [
      {
        url: SITE_INFO.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_INFO.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@iamncdai", // Twitter username
    images: [SITE_INFO.ogImage],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: META_THEME_COLORS.light,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const storedLanguage = cookieStore.get(languageCookieKey)?.value
  const storedTheme = cookieStore.get("theme")?.value
  const initialLanguage =
    storedLanguage === "en" || storedLanguage === "vi"
      ? storedLanguage
      : defaultLanguage
  const initialTheme =
    storedTheme === "dark" || storedTheme === "light" ? storedTheme : undefined

  const session = await getSession()
  const notifications = session.user ? await fetchMyNotifications() : []

  return (
    <html
      lang={initialLanguage}
      className={initialTheme}
      style={initialTheme ? { colorScheme: initialTheme } : undefined}
      suppressHydrationWarning
    >
      <head>
        <FacebookSDKScript />
      </head>

      <body>
        <Providers initialLanguage={initialLanguage}>
          <AuthInitializer
            user={session.user ?? null}
            notifications={notifications}
          />
          {children}
        </Providers>
      </body>
    </html>
  )
}
