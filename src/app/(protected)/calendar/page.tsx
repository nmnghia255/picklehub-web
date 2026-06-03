import { PageContainer } from "@/components/page-container"
import { PersonalCalendarPage } from "@/features/personal-calendar/components/personal-calendar-page"

export const metadata = {
  title: "Lịch của tôi | PickleHub",
  description: "Quản lý và xem lịch trình các hoạt động Pickleball cá nhân của bạn.",
}

export default function CalendarRoutePage() {
  return (
    <PageContainer>
      <PersonalCalendarPage />
    </PageContainer>
  )
}
