import { redirect } from "next/navigation"

export default function CourtManagementRedirectPage() {
  redirect("/sport-center-management?tab=courts")
}
