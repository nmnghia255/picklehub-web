import React from "react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function FiltersDrawer({
  open,
  onOpenChange,
  filters,
  setFilters,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: {
    status: string
    genderPolicy: string
    ageGroup: string
    format: string
    availableSlots: boolean
  }
  setFilters: (filters: {
    status: string
    genderPolicy: string
    ageGroup: string
    format: string
    availableSlots: boolean
  }) => void
}) {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="flex h-full flex-col">
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-5">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Gender Policy</Label>
                <Select
                  value={filters.genderPolicy}
                  onValueChange={(value) =>
                    setFilters({ ...filters, genderPolicy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="MIXED">Mixed</SelectItem>
                    <SelectItem value="MALE_ONLY">Men Only</SelectItem>
                    <SelectItem value="FEMALE_ONLY">Women Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Age Group</Label>
                <Select
                  value={filters.ageGroup}
                  onValueChange={(value) =>
                    setFilters({ ...filters, ageGroup: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="JUNIOR">Junior</SelectItem>
                    <SelectItem value="ADULT">Adult</SelectItem>
                    <SelectItem value="SENIOR">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Format</Label>
                <Select
                  value={filters.format}
                  onValueChange={(value) =>
                    setFilters({ ...filters, format: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="SOCIAL">Social</SelectItem>
                    <SelectItem value="TOURNAMENT">Tournament</SelectItem>
                    <SelectItem value="TRAINING">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <Button
                className="w-full"
                variant={filters.availableSlots ? "default" : "outline"}
                onClick={() =>
                  setFilters({
                    ...filters,
                    availableSlots: !filters.availableSlots,
                  })
                }
              >
                {filters.availableSlots
                  ? "Showing: Available Slots Only"
                  : "Show All Availability"}
              </Button>
            </div>
          </div>

          <DrawerFooter>
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  status: "ALL",
                  genderPolicy: "ALL",
                  ageGroup: "ALL",
                  format: "ALL",
                  availableSlots: false,
                })
              }
            >
              Clear All
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
