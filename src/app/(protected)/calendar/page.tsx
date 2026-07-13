import { PageContainer } from "@/components/page-container"
import { PersonalCalendarPage } from "@/features/personal-calendar/components/personal-calendar-page"

export default function CalendarRoutePage() {
  return (
    <PageContainer variant="wide">
      <PersonalCalendarPage />
    </PageContainer>
  )
}
