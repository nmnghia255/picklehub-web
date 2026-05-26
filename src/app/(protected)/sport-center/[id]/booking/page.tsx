"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { BookingAddOnsCard } from "@/features/booking/components/booking-add-ons-card"
import { BookingAvailableCourtsCard } from "@/features/booking/components/booking-available-courts-card"
import { BookingCourtInfoCard } from "@/features/booking/components/booking-court-info-card"
import { BookingDateSelectionCard } from "@/features/booking/components/booking-date-selection-card"
import { BookingSummaryCard } from "@/features/booking/components/booking-summary-card"
import {
  ADD_ONS,
  BOOKED_SLOTS,
  COURT_PRICE,
  TIME_SLOTS,
} from "@/features/booking/data"
import type { ExtrasState, SelectedCourts } from "@/features/booking/types"

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedCourts, setSelectedCourts] = useState<SelectedCourts>({})
  const [extras, setExtras] = useState<ExtrasState>({
    paddle: true,
    balls: false,
    coach: false,
  })

  const router = useRouter()

  const selectedDateText = useMemo(() => {
    if (!selectedDate) return "No date selected"
    return selectedDate.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }, [selectedDate])

  const toggleCourtSlot = (courtId: number, slot: string) => {
    setSelectedCourts((prev) => {
      const newSelected = { ...prev }
      if (!newSelected[courtId]) {
        newSelected[courtId] = new Set()
      } else {
        newSelected[courtId] = new Set(newSelected[courtId])
      }

      if (newSelected[courtId].has(slot)) {
        newSelected[courtId].delete(slot)
        if (newSelected[courtId].size === 0) {
          delete newSelected[courtId]
        }
      } else {
        newSelected[courtId].add(slot)
      }

      return newSelected
    })
  }

  const totalSlots = useMemo(() => {
    return Object.values(selectedCourts).reduce(
      (sum, slots) => sum + slots.size,
      0
    )
  }, [selectedCourts])

  const addOnTotal = useMemo(() => {
    return ADD_ONS.reduce((sum, addon) => {
      if (!extras[addon.key]) return sum
      return sum + addon.price
    }, 0)
  }, [extras])

  const total = COURT_PRICE * totalSlots + addOnTotal

  return (
    <PageContainer variant="wide" className="flex flex-col">
      <section className="mb-6 flex items-start justify-between gap-4 space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đặt sân</h1>
          <p className="text-sm text-muted-foreground">
            Chọn ngày, sân và khung giờ bạn muốn đặt. Bạn cũng có thể thêm các
            dịch vụ bổ sung.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="size-4" /> Quay lại
        </Button>
      </section>

      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <BookingCourtInfoCard />
          <BookingDateSelectionCard
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <BookingAvailableCourtsCard
            selectedDate={selectedDate}
            bookedSlots={BOOKED_SLOTS}
            timeSlots={TIME_SLOTS}
            selectedCourts={selectedCourts}
            onToggleCourtSlot={toggleCourtSlot}
          />
          <BookingAddOnsCard
            addOns={ADD_ONS}
            extras={extras}
            onSetExtras={setExtras}
          />
        </div>

        <aside className="xl:sticky xl:top-6">
          <BookingSummaryCard
            selectedDateText={selectedDateText}
            totalSlots={totalSlots}
            selectedCourts={selectedCourts}
            courtPrice={COURT_PRICE}
            addOnTotal={addOnTotal}
            total={total}
          />
        </aside>
      </section>
    </PageContainer>
  )
}
