"use client"

import { PageContainer } from "@/components/page-container"
import { CoachRegistrationForm } from "@/features/coach/components/coach-registration-form"

export default function CoachRegisterPage() {
  return (
    <PageContainer variant="default" className="py-6">
      <CoachRegistrationForm />
    </PageContainer>
  )
}
