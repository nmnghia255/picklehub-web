import { redirect } from "next/navigation"

export default function AnalyticsRedirectPage() {
  redirect("/sport-center-management?tab=analytics")
}
