export const dynamic = "force-dynamic"

import { PageContainer } from "@/components/page-container"
import {
  cancelSubscriptionAction,
  subscribeToPlanAction,
} from "@/features/subscriptions/actions/subscription-actions"
import { SubscriptionService } from "@/features/subscriptions/api/subscriptions-service"
import { SubscriptionCards } from "@/features/subscriptions/components/subscription-cards"
import type {
  AvailableSubscriptionPlan,
  Subscription,
} from "@/features/subscriptions/types/subscriptions"

export default async function SubscriptionsPage() {
  let availablePlans: AvailableSubscriptionPlan[] = []
  let mySubscriptions: Subscription[] = []

  try {
    const [plansPayload, subsPayload] = await Promise.all([
      SubscriptionService.getAllAvailablePlans(),
      SubscriptionService.getMySubscriptions(),
    ])
    availablePlans = plansPayload || []
    mySubscriptions = subsPayload || []
  } catch (error) {
    console.error("Failed to load subscription data:", error)
  }

  return (
    <div className="min-h-screen bg-background py-6 text-foreground">
      <PageContainer variant="wide">
        <SubscriptionCards
          availablePlans={availablePlans}
          mySubscriptions={mySubscriptions}
          onSubscribeToPlan={subscribeToPlanAction}
          onCancelSubscription={cancelSubscriptionAction}
        />
      </PageContainer>
    </div>
  )
}
