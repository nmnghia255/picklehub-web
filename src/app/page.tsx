import { redirect } from "next/navigation"

import { LandingFeatures } from "@/components/landing-features"
import { LandingFooter } from "@/components/landing-footer"
import { LandingHero } from "@/components/landing-hero"
import { LandingPageHeader } from "@/components/landing-page-header"
import { getSession } from "@/lib/session"

export default async function HomePage() {
  const session = await getSession()

  // Redirect to /home if user is already logged in
  if (session.user) {
    redirect("/home")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingPageHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
      </main>
      <LandingFooter />
    </div>
  )
}
