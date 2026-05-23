import type { Metadata } from "next"

import { RecurringSocialsPage } from "@/features/recurring-socials/components"

export const metadata: Metadata = {
  title: "Tự động tạo Social | Pickleball Social",
  description: "Quản lý và tạo lịch social tự động định kỳ",
}

export default function RecurringSocialsPageRoute() {
  return <RecurringSocialsPage />
}
