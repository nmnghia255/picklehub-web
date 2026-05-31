"use client"

import { ChevronDown, MapPinned, PackageOpen, ShieldAlert } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { PageContainer } from "@/components/page-container"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import type { InventoryKind } from "../store/services-products-store"
import { useServicesProductsStore } from "../store/services-products-store"
import type { SportCenterProduct, SportCenterService } from "../types"
import { InventoryDetailSheet } from "./inventory-detail-sheet"
import { InventoryFilters } from "./inventory-filters"
import { InventoryFormDialog } from "./inventory-form-dialog"
import { InventoryTable } from "./inventory-table"

type InventoryRow = SportCenterService | SportCenterProduct
type DialogMode = "create" | "edit"

function matchesStatus(
  isActive: boolean,
  filter: "all" | "active" | "inactive"
) {
  if (filter === "all") return true
  return filter === "active" ? isActive : !isActive
}

export function ServicesProductsManagementPage() {
  const centers = useServicesProductsStore((state) => state.centers)
  const loadingCenters = useServicesProductsStore(
    (state) => state.loadingCenters
  )
  const selectedCenterId = useServicesProductsStore(
    (state) => state.selectedCenterId
  )
  const services = useServicesProductsStore((state) => state.services)
  const products = useServicesProductsStore((state) => state.products)
  const loadingServices = useServicesProductsStore(
    (state) => state.loadingServices
  )
  const loadingProducts = useServicesProductsStore(
    (state) => state.loadingProducts
  )
  const permissionDenied = useServicesProductsStore(
    (state) => state.permissionDenied
  )
  const error = useServicesProductsStore((state) => state.error)

  const serviceSearch = useServicesProductsStore((state) => state.serviceSearch)
  const serviceType = useServicesProductsStore((state) => state.serviceType)
  const serviceStatus = useServicesProductsStore((state) => state.serviceStatus)
  const productSearch = useServicesProductsStore((state) => state.productSearch)
  const productType = useServicesProductsStore((state) => state.productType)
  const productStatus = useServicesProductsStore((state) => state.productStatus)

  const fetchCenters = useServicesProductsStore((state) => state.fetchCenters)
  const fetchAll = useServicesProductsStore((state) => state.fetchAll)
  const setSelectedCenter = useServicesProductsStore(
    (state) => state.setSelectedCenter
  )
  const setServiceSearch = useServicesProductsStore(
    (state) => state.setServiceSearch
  )
  const setServiceType = useServicesProductsStore(
    (state) => state.setServiceType
  )
  const setServiceStatus = useServicesProductsStore(
    (state) => state.setServiceStatus
  )
  const setProductSearch = useServicesProductsStore(
    (state) => state.setProductSearch
  )
  const setProductType = useServicesProductsStore(
    (state) => state.setProductType
  )
  const setProductStatus = useServicesProductsStore(
    (state) => state.setProductStatus
  )
  const deleteService = useServicesProductsStore((state) => state.deleteService)
  const deleteProduct = useServicesProductsStore((state) => state.deleteProduct)
  const clearError = useServicesProductsStore((state) => state.clearError)

  const [activeTab, setActiveTab] = useState<InventoryKind>("product")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<DialogMode>("create")
  const [dialogKind, setDialogKind] = useState<InventoryKind>("product")
  const [dialogItem, setDialogItem] = useState<InventoryRow | null>(null)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailKind, setDetailKind] = useState<InventoryKind>("product")
  const [detailItem, setDetailItem] = useState<InventoryRow | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<{
    kind: InventoryKind
    item: InventoryRow
  } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchCenters()
  }, [fetchCenters])

  useEffect(() => {
    if (selectedCenterId) {
      fetchAll()
    }
  }, [selectedCenterId, fetchAll])

  useEffect(() => {
    if (!error) return
    toast.error(error)
    clearError()
  }, [error, clearError])

  const selectedCenter = centers.find((c) => c.id === selectedCenterId)

  const filteredServices = useMemo(() => {
    const keyword = serviceSearch.trim().toLowerCase()
    return services.filter((item) => {
      const matchesSearch =
        keyword === "" ||
        [item.name, item.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      const matchesType = serviceType === "all" || item.type === serviceType
      return (
        matchesSearch &&
        matchesType &&
        matchesStatus(item.isActive, serviceStatus)
      )
    })
  }, [services, serviceSearch, serviceType, serviceStatus])

  const filteredProducts = useMemo(() => {
    const keyword = productSearch.trim().toLowerCase()
    return products.filter((item) => {
      const matchesSearch =
        keyword === "" ||
        [item.name, item.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      const matchesType = productType === "all" || item.type === productType
      return (
        matchesSearch &&
        matchesType &&
        matchesStatus(item.isActive, productStatus)
      )
    })
  }, [products, productSearch, productType, productStatus])

  const openCreate = (kind: InventoryKind) => {
    setDialogKind(kind)
    setDialogMode("create")
    setDialogItem(null)
    setDialogOpen(true)
  }

  const openEdit = (kind: InventoryKind, item: InventoryRow) => {
    setDialogKind(kind)
    setDialogMode("edit")
    setDialogItem(item)
    setDialogOpen(true)
  }

  const openDetail = (kind: InventoryKind, item: InventoryRow) => {
    setDetailKind(kind)
    setDetailItem(item)
    setDetailOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const success =
      deleteTarget.kind === "service"
        ? await deleteService(deleteTarget.item.id)
        : await deleteProduct(deleteTarget.item.id)
    setDeleting(false)

    if (success) {
      toast.success(
        deleteTarget.kind === "service" ? "Đã xóa dịch vụ." : "Đã xóa sản phẩm."
      )
      setDeleteTarget(null)
    }
  }

  const productSummary = useMemo(
    () => ({
      total: products.length,
      active: products.filter((item) => item.isActive).length,
    }),
    [products]
  )

  const serviceSummary = useMemo(
    () => ({
      total: services.length,
      active: services.filter((item) => item.isActive).length,
    }),
    [services]
  )

  return (
    <PageContainer variant="wide" className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            <PackageOpen className="size-4 text-sky-500" />
            Dịch vụ & Sản phẩm
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Dịch vụ & Sản phẩm
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Quản lý dịch vụ và sản phẩm theo từng trung tâm.
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
          Bạn không có quyền quản lý dịch vụ/sản phẩm của trung tâm này.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm text-muted-foreground">Sản phẩm</p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-2xl font-semibold">{productSummary.total}</p>
              <Badge variant="secondary">
                {productSummary.active} hoạt động
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
                {serviceSummary.active} hoạt động
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as InventoryKind)}
        className="gap-4"
      >
        <TabsList>
          <TabsTrigger value="product" className="gap-2">
            Sản phẩm
            <Badge variant="secondary">{products.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="service" className="gap-2">
            Dịch vụ
            <Badge variant="secondary">{services.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="product" className="space-y-4">
          <InventoryFilters
            kind="product"
            search={productSearch}
            type={productType}
            status={productStatus}
            onSearchChange={setProductSearch}
            onTypeChange={setProductType}
            onStatusChange={setProductStatus}
            onCreate={() => openCreate("product")}
          />
          <InventoryTable
            kind="product"
            items={filteredProducts}
            loading={loadingProducts}
            onView={(item) => openDetail("product", item)}
            onEdit={(item) => openEdit("product", item)}
            onDelete={(item) => setDeleteTarget({ kind: "product", item })}
          />
        </TabsContent>

        <TabsContent value="service" className="space-y-4">
          <InventoryFilters
            kind="service"
            search={serviceSearch}
            type={serviceType}
            status={serviceStatus}
            onSearchChange={setServiceSearch}
            onTypeChange={setServiceType}
            onStatusChange={setServiceStatus}
            onCreate={() => openCreate("service")}
          />
          <InventoryTable
            kind="service"
            items={filteredServices}
            loading={loadingServices}
            onView={(item) => openDetail("service", item)}
            onEdit={(item) => openEdit("service", item)}
            onDelete={(item) => setDeleteTarget({ kind: "service", item })}
          />
        </TabsContent>
      </Tabs>

      <InventoryFormDialog
        key={`${dialogKind}-${dialogMode}-${dialogItem?.id ?? "new"}`}
        kind={dialogKind}
        mode={dialogMode}
        item={dialogItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <InventoryDetailSheet
        kind={detailKind}
        item={detailItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(item) => {
          setDetailOpen(false)
          openEdit(detailKind, item)
        }}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa “{deleteTarget?.item.name}”? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                handleConfirmDelete()
              }}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
