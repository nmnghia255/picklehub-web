import { PageContainer } from "@/components/page-container"
import { PersonalCalendarPage } from "@/features/personal-calendar/components/personal-calendar-page"

export const metadata = {
  title: "My Calendar | PickleHub",
  description: "Manage and view your personal Pickleball activity schedule.",
}

export default function CalendarRoutePage() {
  return (
    <PageContainer variant="wide">
      <PersonalCalendarPage />
    </PageContainer>
  )
}
