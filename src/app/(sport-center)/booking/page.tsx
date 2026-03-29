"use client"

import { CalendarClock, Clock3, MapPin, Phone, X } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

const timeSlots = [
  "06:00 - 07:00",
  "07:00 - 08:00",
  "08:00 - 09:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
  "20:00 - 21:00",
]

const bookedSlots: Record<number, string[]> = {
  1: ["06:00 - 07:00", "07:00 - 08:00"],
  2: ["18:00 - 19:00"],
  3: ["17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00"],
  4: [],
  5: ["08:00 - 09:00", "19:00 - 20:00"],
  6: ["06:00 - 07:00"],
  7: [],
  8: ["17:00 - 18:00"],
}

const addOns = [
  { key: "paddle", label: "Paddle rental", price: 3 },
  { key: "balls", label: "Ball set", price: 2 },
  { key: "coach", label: "Warm-up coach (30m)", price: 12 },
] as const

const courtPrice = 14

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedCourts, setSelectedCourts] = useState<
    Record<number, Set<string>>
  >({})
  const [extras, setExtras] = useState<Record<string, boolean>>({
    paddle: true,
    balls: false,
    coach: false,
  })

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
    return addOns.reduce((sum, addon) => {
      if (!extras[addon.key]) return sum
      return sum + addon.price
    }, 0)
  }, [extras])

  const total = courtPrice * totalSlots + addOnTotal

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Book Court</h1>
        <p className="text-sm text-muted-foreground">
          Select one or more courts with available time slots for your booking.
        </p>
      </section>

      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <img
                src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=240&q=80"
                alt="Court overview"
                className="h-32 w-full rounded-lg object-cover sm:w-56"
              />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Pickle Dome Sukhumvit</h2>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  42 Sukhumvit 49, Watthana, Bangkok
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="size-4" />
                  Open daily: 06:00 - 23:00
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="size-4" />
                  +66 2 111 2222
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarClock className="size-5" />
                Select date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-lg border">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Available courts (
                {selectedDate
                  ? `${Object.keys(bookedSlots).length} courts`
                  : "Select date first"}
                )
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <p className="text-sm text-muted-foreground">
                  Please select a date to see court availability.
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(bookedSlots).map(([courtIdStr, booked]) => {
                    const courtId = Number(courtIdStr)
                    const isSelected =
                      selectedCourts[courtId] &&
                      selectedCourts[courtId].size > 0

                    return (
                      <div key={courtId} className="rounded-lg border p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="font-medium">Court {courtId}</h3>
                          {isSelected && (
                            <span className="text-xs font-semibold text-primary">
                              {selectedCourts[courtId].size} slot(s) selected
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {timeSlots.map((slot) => {
                            const isBooked = booked.includes(slot)
                            const isSelectedSlot =
                              selectedCourts[courtId]?.has(slot)

                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={isBooked}
                                onClick={() =>
                                  !isBooked && toggleCourtSlot(courtId, slot)
                                }
                                className={[
                                  "rounded-md border px-2 py-2 text-xs transition-colors sm:text-sm",
                                  isBooked
                                    ? "cursor-not-allowed border-muted bg-muted text-muted-foreground opacity-50"
                                    : isSelectedSlot
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "hover:bg-accent",
                                ].join(" ")}
                              >
                                {slot}
                                {isBooked && " ❌"}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addOns.map((addon) => (
                <label
                  key={addon.key}
                  htmlFor={addon.key}
                  className="flex cursor-pointer items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={addon.key}
                      checked={extras[addon.key]}
                      onCheckedChange={(checked) => {
                        setExtras((prev) => ({
                          ...prev,
                          [addon.key]: checked === true,
                        }))
                      }}
                    />
                    <span className="text-sm">{addon.label}</span>
                  </div>
                  <span className="text-sm font-medium">+${addon.price}</span>
                </label>
              ))}

              <div className="space-y-2">
                <p className="text-sm font-medium">Booking note</p>
                <Textarea
                  placeholder="Optional note for court staff (equipment, player count, request...)"
                  className="min-h-24"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="xl:sticky xl:top-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{selectedDateText}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Courts & slots</span>
                  <span className="font-medium">
                    {totalSlots > 0 ? `${totalSlots} slot(s)` : "None selected"}
                  </span>
                </div>
              </div>

              {totalSlots > 0 && (
                <div className="space-y-2 rounded-lg bg-muted p-3 text-xs">
                  {Object.entries(selectedCourts).map(([courtIdStr, slots]) => (
                    <div key={courtIdStr}>
                      <p className="font-medium">Court {courtIdStr}:</p>
                      <p className="text-muted-foreground">
                        {Array.from(slots).join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Court fee ({totalSlots} × ${courtPrice})
                  </span>
                  <span>${courtPrice * totalSlots}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Add-ons</span>
                  <span>${addOnTotal}</span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>${total}</span>
              </div>

              <Button className="w-full" size="lg">
                Confirm Booking
              </Button>

              <p className="text-xs text-muted-foreground">
                This is a UI preview. Final pricing and availability will be
                validated when API is ready.
              </p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  )
}
