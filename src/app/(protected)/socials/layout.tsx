import SocialsI18nProvider from "@/features/socials/socials-i18n-provider"

export default function SocialsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SocialsI18nProvider>{children}</SocialsI18nProvider>
}
