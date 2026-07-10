import type { Metadata } from "next"

import { RecurringSocialsPage } from "@/features/recurring-socials/components"

export const metadata: Metadata = {
  title: "Recurring Socials | PickleHub",
  description: "Set up and manage recurring social schedules",
}

export default function RecurringSocialsPageRoute() {
  return <RecurringSocialsPage />
}
