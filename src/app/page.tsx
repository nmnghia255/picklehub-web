import { redirect } from "next/navigation"

import { LandingCTA } from "@/components/landing-cta"
import { LandingFeatures } from "@/components/landing-features"
import { LandingFooter } from "@/components/landing-footer"
import { LandingHero } from "@/components/landing-hero"
import { LandingHowItWorks } from "@/components/landing-how-it-works"
import { LandingPageHeader } from "@/components/landing-page-header"
import { getSession } from "@/lib/session"

export default async function HomePage() {
  const session = await getSession()

  // Redirect to /home if user is already logged in
  if (session.user) {
    redirect("/home")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors selection:bg-emerald-500 selection:text-white">
      <LandingPageHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
