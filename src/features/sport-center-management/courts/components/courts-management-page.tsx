"use client"

import {
  ChevronDown,
  LayoutGrid,
  MapPinned,
  Search,
  ShieldAlert,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { toast } from "sonner"

import { PageContainer } from "@/components/page-container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useCourtsStore } from "../store/courts-store"
import { COURT_STATUS_OPTIONS, COURT_TYPE_OPTIONS } from "../types"
import { CourtDetailDrawer } from "./court-detail-drawer"
import { CourtsTable } from "./courts-table"

export function CourtsManagementPage() {
  const centers = useCourtsStore((state) => state.centers)
  const loadingCenters = useCourtsStore((state) => state.loadingCenters)
  const selectedCenterId = useCourtsStore((state) => state.selectedCenterId)
  const courts = useCourtsStore((state) => state.courts)
  const loadingCourts = useCourtsStore((state) => state.loadingCourts)
  const permissionDenied = useCourtsStore((state) => state.permissionDenied)
  const error = useCourtsStore((state) => state.error)
  const search = useCourtsStore((state) => state.search)
  const statusFilter = useCourtsStore((state) => state.statusFilter)
  const typeFilter = useCourtsStore((state) => state.typeFilter)
  const selectedCourtId = useCourtsStore((state) => state.selectedCourtId)
  const detailOpen = useCourtsStore((state) => state.detailOpen)

  const fetchCenters = useCourtsStore((state) => state.fetchCenters)
  const fetchCourts = useCourtsStore((state) => state.fetchCourts)
  const setSelectedCenter = useCourtsStore((state) => state.setSelectedCenter)
  const setSearch = useCourtsStore((state) => state.setSearch)
  const setStatusFilter = useCourtsStore((state) => state.setStatusFilter)
  const setTypeFilter = useCourtsStore((state) => state.setTypeFilter)
  const openCourt = useCourtsStore((state) => state.openCourt)
  const setDetailOpen = useCourtsStore((state) => state.setDetailOpen)
  const clearError = useCourtsStore((state) => state.clearError)

  useEffect(() => {
    fetchCenters()
  }, [fetchCenters])

  useEffect(() => {
    if (selectedCenterId) {
      fetchCourts()
    }
  }, [selectedCenterId, fetchCourts])

  useEffect(() => {
    if (!error) return
    toast.error(error)
    clearError()
  }, [error, clearError])

  const selectedCenter = centers.find((c) => c.id === selectedCenterId)

  const filteredCourts = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return courts.filter((court) => {
      const matchesSearch =
        keyword === "" || court.name.toLowerCase().includes(keyword)
      const matchesStatus =
        statusFilter === "all" || court.status === statusFilter
      const matchesType = typeFilter === "all" || court.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [courts, search, statusFilter, typeFilter])

  const selectedCourt = useMemo(
    () => courts.find((court) => court.id === selectedCourtId) ?? null,
    [courts, selectedCourtId]
  )

  return (
    <PageContainer variant="wide" className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            <LayoutGrid className="size-4 text-sky-500" />
            Danh sách sân
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Danh sách sân
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Xem danh sách và thông tin chi tiết các sân trong từng trung tâm.
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              disabled={loadingCenters}
            >
              <MapPinned className="size-4" />
              <span>{selectedCenter?.name ?? "Chọn trung tâm"}</span>
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {loadingCenters ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Đang tải...
              </div>
            ) : centers.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Không có trung tâm nào
              </div>
            ) : (
              centers.map((center) => (
                <DropdownMenuItem
                  key={center.id}
                  onClick={() => setSelectedCenter(center.id)}
                  className="flex flex-col items-start"
                >
                  <span className="font-medium">{center.name}</span>
                  {center.address ? (
                    <span className="text-xs text-muted-foreground">
                      {center.address}
                    </span>
                  ) : null}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {permissionDenied ? (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
          <ShieldAlert className="size-5 text-amber-500" />
          Bạn không có quyền truy cập danh sách sân của trung tâm này.
        </div>
      ) : null}

      <section className="space-y-4 rounded-3xl border bg-card/60 p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Tìm kiếm
            </p>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên sân"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Loại sân
            </p>
            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as typeof typeFilter)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {COURT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Trạng thái
            </p>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as typeof statusFilter)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {COURT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Hiển thị {filteredCourts.length} / {courts.length} sân
          </p>
          <Badge variant="secondary">{courts.length} sân</Badge>
        </div>

        <CourtsTable
          courts={filteredCourts}
          loading={loadingCourts}
          onView={openCourt}
        />
      </section>

      <CourtDetailDrawer
        court={selectedCourt}
        centerName={selectedCenter?.name}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </PageContainer>
  )
}
