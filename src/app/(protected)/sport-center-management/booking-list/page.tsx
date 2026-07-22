import { redirect } from "next/navigation"

export default function BookingListRedirectPage() {
  redirect("/sport-center-management?tab=bookings")
}
