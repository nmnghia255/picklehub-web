"use client"

import { Layers3, PackagePlus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { PageContainer } from "@/components/page-container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { MOCK_SELECTED_COURT } from "../mock-court"
import { MOCK_COURT_INVENTORY } from "../mock-data"
import type {
  CourtInventoryRecord,
  InventoryItem,
  InventoryKind,
  ProductInventoryItem,
  ServiceInventoryItem,
} from "../types"
import { getInventoryStatusClass } from "../utils"
import { CourtContextCard } from "./court-context-card"
import { InventoryDetailSheet } from "./inventory-detail-sheet"
import { InventoryFilters } from "./inventory-filters"
import { InventoryFormDialog } from "./inventory-form-dialog"
import { InventoryTable } from "./inventory-table"

type DialogMode = "create" | "edit"

const lowStockThreshold = 5

export function ServicesProductsPage() {
  const [courts, setCourts] = useState<CourtInventoryRecord[]>([
    MOCK_SELECTED_COURT,
    ...MOCK_COURT_INVENTORY,
  ])
  const [selectedCourtId, setSelectedCourtId] = useState(
    MOCK_SELECTED_COURT.courtId
  )
  const [activeTab, setActiveTab] = useState<InventoryKind>("product")
  const [isLoading, setIsLoading] = useState(true)

  const [productSearch, setProductSearch] = useState("")
  const [productStatus, setProductStatus] = useState("all")
  const [productType, setProductType] = useState("Tất cả loại")

  const [serviceSearch, setServiceSearch] = useState("")
  const [serviceStatus, setServiceStatus] = useState("all")
  const [serviceType, setServiceType] = useState("Tất cả loại")

  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null)
  const [detailKind, setDetailKind] = useState<InventoryKind>("product")
  const [detailOpen, setDetailOpen] = useState(false)

  const [dialogKind, setDialogKind] = useState<InventoryKind>("product")
  const [dialogMode, setDialogMode] = useState<DialogMode>("create")
  const [dialogItem, setDialogItem] = useState<
    ProductInventoryItem | ServiceInventoryItem | null
  >(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 650)
    return () => window.clearTimeout(timer)
  }, [])

  const selectedCourt = useMemo(
    () =>
      courts.find((court) => court.courtId === selectedCourtId) ??
      courts[0] ??
      null,
    [courts, selectedCourtId]
  )

  const productItems = useMemo(
    () => selectedCourt?.products ?? [],
    [selectedCourt]
  )
  const serviceItems = useMemo(
    () => selectedCourt?.services ?? [],
    [selectedCourt]
  )

  const filteredProducts = useMemo(() => {
    return productItems.filter((item) => {
      const matchesSearch = [item.name, item.description, item.courtName]
        .join(" ")
        .toLowerCase()
        .includes(productSearch.toLowerCase())
      const matchesStatus =
        productStatus === "all" || item.status === productStatus
      const matchesType =
        productType === "Tất cả loại" || item.category === productType

      return matchesSearch && matchesStatus && matchesType
    })
  }, [productItems, productSearch, productStatus, productType])

  const filteredServices = useMemo(() => {
    return serviceItems.filter((item) => {
      const matchesSearch = [item.name, item.description, item.courtName]
        .join(" ")
        .toLowerCase()
        .includes(serviceSearch.toLowerCase())
      const matchesStatus =
        serviceStatus === "all" || item.status === serviceStatus
      const matchesType =
        serviceType === "Tất cả loại" || item.category === serviceType

      return matchesSearch && matchesStatus && matchesType
    })
  }, [serviceItems, serviceSearch, serviceStatus, serviceType])

  const productSummary = useMemo(() => {
    return {
      total: productItems.length,
      inStock: productItems.filter((item) => item.status === "in_stock").length,
      lowStock: productItems.filter(
        (item) => item.stock > 0 && item.stock <= lowStockThreshold
      ).length,
      outOfStock: productItems.filter((item) => item.status === "out_of_stock")
        .length,
    }
  }, [productItems])

  const serviceSummary = useMemo(() => {
    return {
      total: serviceItems.length,
      active: serviceItems.filter((item) => item.status === "active").length,
      paused: serviceItems.filter((item) => item.status === "paused").length,
    }
  }, [serviceItems])

  const openCreateDialog = (kind: InventoryKind) => {
    setDialogKind(kind)
    setDialogMode("create")
    setDialogItem(null)
    setDialogOpen(true)
  }

  const openEditDialog = (kind: InventoryKind, item: InventoryItem) => {
    setDialogKind(kind)
    setDialogMode("edit")
    setDialogItem(item)
    setDialogOpen(true)
  }

  const openDetailSheet = (kind: InventoryKind, item: InventoryItem) => {
    setDetailKind(kind)
    setDetailItem(item)
    setDetailOpen(true)
  }

  const updateCourtItems = (
    updater: (court: CourtInventoryRecord) => CourtInventoryRecord
  ) => {
    setCourts((current) =>
      current.map((court) =>
        court.courtId === selectedCourtId ? updater(court) : court
      )
    )
  }

  const handleSave = (
    payload:
      | Omit<
          ProductInventoryItem,
          "id" | "kind" | "courtId" | "courtName" | "updatedAt"
        >
      | Omit<
          ServiceInventoryItem,
          "id" | "kind" | "courtId" | "courtName" | "updatedAt"
        >
  ) => {
    if (!selectedCourt) return

    const updatedAt = new Date().toISOString()

    if (dialogKind === "product") {
      const nextPayload = payload as Omit<
        ProductInventoryItem,
        "id" | "kind" | "courtId" | "courtName" | "updatedAt"
      >
      updateCourtItems((court) => {
        const nextProducts =
          dialogMode === "create"
            ? [
                {
                  kind: "product" as const,
                  id: `prod-${court.courtId}-${Date.now()}`,
                  courtId: court.courtId,
                  courtName: court.courtName,
                  updatedAt,
                  ...nextPayload,
                  status:
                    nextPayload.stock > 0 ? nextPayload.status : "out_of_stock",
                },
                ...court.products,
              ]
            : court.products.map((product) =>
                product.id === dialogItem?.id
                  ? {
                      ...product,
                      ...nextPayload,
                      status:
                        nextPayload.stock > 0
                          ? nextPayload.status
                          : "out_of_stock",
                      updatedAt,
                    }
                  : product
              )

        return {
          ...court,
          products: nextProducts,
          updatedAt,
        }
      })

      toast.success(
        dialogMode === "create"
          ? "Đã thêm sản phẩm mock"
          : "Đã cập nhật sản phẩm mock"
      )
    } else {
      const nextPayload = payload as Omit<
        ServiceInventoryItem,
        "id" | "kind" | "courtId" | "courtName" | "updatedAt"
      >
      updateCourtItems((court) => {
        const nextServices =
          dialogMode === "create"
            ? [
                {
                  kind: "service" as const,
                  id: `svc-${court.courtId}-${Date.now()}`,
                  courtId: court.courtId,
                  courtName: court.courtName,
                  updatedAt,
                  ...nextPayload,
                },
                ...court.services,
              ]
            : court.services.map((service) =>
                service.id === dialogItem?.id
                  ? {
                      ...service,
                      ...nextPayload,
                      updatedAt,
                    }
                  : service
              )

        return {
          ...court,
          services: nextServices,
          updatedAt,
        }
      })

      toast.success(
        dialogMode === "create"
          ? "Đã thêm dịch vụ mock"
          : "Đã cập nhật dịch vụ mock"
      )
    }

    setDialogOpen(false)
  }

  const handleToggleStatus = (item: InventoryItem) => {
    const updatedAt = new Date().toISOString()

    if (item.kind === "product") {
      updateCourtItems((court) => ({
        ...court,
        products: court.products.map((product) =>
          product.id === item.id
            ? {
                ...product,
                stock: 0,
                status: "out_of_stock",
                updatedAt,
              }
            : product
        ),
        updatedAt,
      }))

      toast.success("Đã đánh dấu sản phẩm hết hàng")
      return
    }

    updateCourtItems((court) => ({
      ...court,
      services: court.services.map((service) =>
        service.id === item.id
          ? {
              ...service,
              status: service.status === "active" ? "paused" : "active",
              updatedAt,
            }
          : service
      ),
      updatedAt,
    }))

    toast.success(
      item.status === "active" ? "Đã tạm ngưng dịch vụ" : "Đã bật dịch vụ"
    )
  }

  const getKindCountBadge = (kind: InventoryKind) => {
    const count =
      kind === "product" ? productSummary.total : serviceSummary.total
    return <Badge variant="secondary">{count}</Badge>
  }

  if (isLoading) {
    return (
      <PageContainer variant="wide" className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-5 w-[560px]" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-[460px] w-full rounded-2xl" />
      </PageContainer>
    )
  }

  return (
    <PageContainer variant="wide" className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Dịch vụ & Sản phẩm tại sân
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Quản lý sản phẩm và dịch vụ hỗ trợ tại từng sân pickleball, hoàn
            toàn bằng mock data nội bộ.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => openCreateDialog("product")}
            className="gap-2"
          >
            <PackagePlus className="size-4" />
            Thêm sản phẩm
          </Button>
          <Button onClick={() => openCreateDialog("service")} className="gap-2">
            <Layers3 className="size-4" />
            Thêm dịch vụ
          </Button>
        </div>
      </div>

      <CourtContextCard
        courts={courts}
        selectedCourtId={selectedCourtId}
        onSelectedCourtChange={setSelectedCourtId}
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">
                Danh sách sân để kiểm tra
              </h2>
              <p className="text-xs text-muted-foreground">
                Chọn nhanh sân demo để xem sản phẩm và dịch vụ.
              </p>
            </div>
            <Badge variant="secondary">{courts.length} sân</Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {courts.map((court) => {
              const isSelected = court.courtId === selectedCourtId

              return (
                <button
                  key={court.courtId}
                  type="button"
                  onClick={() => setSelectedCourtId(court.courtId)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-primary/50 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{court.courtName}</p>
                      <p className="text-xs text-muted-foreground">
                        {court.courtType} · {court.location}
                      </p>
                    </div>
                    <Badge
                      className={getInventoryStatusClass(
                        "service",
                        court.status
                      )}
                    >
                      {court.status === "active"
                        ? "Đang hoạt động"
                        : "Tạm ngưng"}
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm text-muted-foreground">Sản phẩm</p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-2xl font-semibold">{productSummary.total}</p>
              <Badge variant="secondary">
                {productSummary.inStock} còn hàng
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm text-muted-foreground">Hết hàng</p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-2xl font-semibold">
                {productSummary.outOfStock}
              </p>
              <Badge className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
                Cần bổ sung
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm text-muted-foreground">Dịch vụ</p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-2xl font-semibold">{serviceSummary.total}</p>
              <Badge variant="secondary">
                {serviceSummary.active} đang hoạt động
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm text-muted-foreground">Dịch vụ tạm ngưng</p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-2xl font-semibold">{serviceSummary.paused}</p>
              <Badge className={getInventoryStatusClass("service", "paused")}>
                Chờ kích hoạt
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as InventoryKind)}
      >
        <TabsList className="grid w-full grid-cols-2 sm:w-auto">
          <TabsTrigger value="product" className="gap-2">
            Sản phẩm
            {getKindCountBadge("product")}
          </TabsTrigger>
          <TabsTrigger value="service" className="gap-2">
            Dịch vụ
            {getKindCountBadge("service")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="product" className="mt-6 space-y-4">
          <InventoryFilters
            kind="product"
            search={productSearch}
            status={productStatus}
            type={productType}
            onSearchChange={setProductSearch}
            onStatusChange={setProductStatus}
            onTypeChange={setProductType}
            onCreateNew={() => openCreateDialog("product")}
          />

          <InventoryTable
            kind="product"
            items={filteredProducts}
            onView={(item) => openDetailSheet("product", item)}
            onEdit={(item) => openEditDialog("product", item)}
            onToggleStatus={handleToggleStatus}
          />
        </TabsContent>

        <TabsContent value="service" className="mt-6 space-y-4">
          <InventoryFilters
            kind="service"
            search={serviceSearch}
            status={serviceStatus}
            type={serviceType}
            onSearchChange={setServiceSearch}
            onStatusChange={setServiceStatus}
            onTypeChange={setServiceType}
            onCreateNew={() => openCreateDialog("service")}
          />

          <InventoryTable
            kind="service"
            items={filteredServices}
            onView={(item) => openDetailSheet("service", item)}
            onEdit={(item) => openEditDialog("service", item)}
            onToggleStatus={handleToggleStatus}
          />
        </TabsContent>
      </Tabs>

      <InventoryDetailSheet
        kind={detailKind}
        item={detailItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <InventoryFormDialog
        key={`${dialogKind}-${dialogMode}-${dialogItem?.id ?? "new"}-${dialogOpen ? "open" : "closed"}-${selectedCourtId}`}
        kind={dialogKind}
        open={dialogOpen}
        mode={dialogMode}
        selectedCourt={selectedCourt}
        item={dialogItem}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />
    </PageContainer>
  )
}
