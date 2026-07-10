import "@/styles/globals.css"

import type { Metadata, Viewport } from "next"
import Script from "next/script"

import { FacebookSDKScript } from "@/components/facebook-sdk-script"
import { Providers } from "@/components/providers"
import { META_THEME_COLORS, SITE_INFO } from "@/config/site"
import { AuthInitializer } from "@/features/auth/components/auth-initializer"
import { fetchMyNotifications } from "@/features/notifications/actions/user-notifications"
import { defaultLanguage } from "@/i18n/settings"
import { getSession } from "@/lib/session"

// Thanks @shadcn-ui, @tailwindcss
const darkModeScript = String.raw`
  try {
    if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
    }
  } catch (_) {}

  try {
    if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
      document.documentElement.classList.add('os-macos')
    }
  } catch (_) {}
`

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
  const session = await getSession()
  const notifications = session.user ? await fetchMyNotifications() : []

  return (
    <html lang={defaultLanguage} suppressHydrationWarning>
      <head>
        {/*
          Thanks @tailwindcss. We inject the script via the `<Script/>` tag,
          since regular `<script>` tags are not executed when rendering in React components.
         */}
        <Script src={`data:text/javascript;base64,${btoa(darkModeScript)}`} />
        <FacebookSDKScript />
      </head>

      <body suppressHydrationWarning>
        <Providers>
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
