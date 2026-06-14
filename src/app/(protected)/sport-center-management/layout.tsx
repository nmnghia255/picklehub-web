import { redirect } from "next/navigation"

import { SubscriptionService } from "@/features/subscriptions/api/subscriptions-service"
import { getSession } from "@/lib/session"

export const dynamic = "force-dynamic"

export default async function SportCenterManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session.user) {
    redirect("/login")
  }

  try {
    const subscriptions = await SubscriptionService.getMySubscriptions()
    const hasSportCenterManagerPlan = subscriptions.some(
      (sub) =>
        sub.status === "ACTIVE" && sub.plan.type === "SPORT_CENTER_MANAGER"
    )

    if (!hasSportCenterManagerPlan) {
      redirect("/home")
    }
  } catch (error) {
    console.error(
      "Failed to check subscription for sport center management:",
      error
    )
    redirect("/home")
  }

  return <>{children}</>
}
