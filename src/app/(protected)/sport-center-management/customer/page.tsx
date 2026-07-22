import { redirect } from "next/navigation"

export default function CustomerManagementRedirectPage() {
  redirect("/sport-center-management?tab=customers")
}
