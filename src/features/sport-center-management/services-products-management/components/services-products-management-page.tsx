"use client"

import { ChevronDown, MapPinned, PackageOpen, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

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

export function ServicesProductsManagementPage({
  lockedCenterId,
  lockedCenterActive = true,
  noContainer = false,
}: {
  lockedCenterId?: string
  lockedCenterActive?: boolean
  noContainer?: boolean
} = {}) {
  const { t } = useSportCenterManagementTranslation()
  const searchParams = useSearchParams()
  const isLocked = Boolean(lockedCenterId)
  const requestedCenterId = lockedCenterId ?? searchParams.get("centerId")
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
    if (!isLocked) fetchCenters()
  }, [fetchCenters, isLocked])

  useEffect(() => {
    if (
      !isLocked &&
      requestedCenterId &&
      centers.some(
        (center) =>
          center.id === requestedCenterId && center.status === "ACTIVE"
      ) &&
      selectedCenterId !== requestedCenterId
    ) {
      setSelectedCenter(requestedCenterId)
    }
  }, [
    centers,
    isLocked,
    requestedCenterId,
    selectedCenterId,
    setSelectedCenter,
  ])

  useEffect(() => {
    const activeCenterId = lockedCenterId ?? selectedCenterId
    if (activeCenterId && (!isLocked || lockedCenterActive)) {
      fetchAll(activeCenterId)
    }
  }, [fetchAll, isLocked, lockedCenterActive, lockedCenterId, selectedCenterId])

  useEffect(() => {
    if (!error) return
    toast.error(error)
  }, [error])

  const selectedCenter = centers.find((c) => c.id === selectedCenterId)
  const activeCenterId = lockedCenterId ?? selectedCenterId

  const retryLoad = () => {
    clearError()
    if (activeCenterId && (!isLocked || lockedCenterActive)) {
      void fetchAll(activeCenterId)
    }
  }

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
        ? await deleteService(deleteTarget.item.id, activeCenterId ?? undefined)
        : await deleteProduct(deleteTarget.item.id, activeCenterId ?? undefined)
    setDeleting(false)

    if (success) {
      toast.success(
        deleteTarget.kind === "service"
          ? t("inventory.toast.deleteServiceSuccess")
          : t("inventory.toast.deleteProductSuccess")
      )
      setDeleteTarget(null)
    }
  }

  const content = (
    <>
      {!isLocked ? (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <PackageOpen className="size-4 text-sky-500" />
              {t("inventory.page.badge")}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("inventory.page.title")}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("inventory.page.subtitle")}
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
                <span>
                  {selectedCenter?.name ?? t("inventory.center.selected")}
                </span>
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {loadingCenters ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {t("inventory.center.loading")}
                </div>
              ) : centers.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {t("inventory.center.noCenters")}
                </div>
              ) : (
                centers.map((center) => (
                  <DropdownMenuItem
                    key={center.id}
                    disabled={center.status !== "ACTIVE"}
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
      ) : null}

      {error ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button variant="outline" onClick={retryLoad}>
            {t("centerList.actions.retry")}
          </Button>
        </div>
      ) : null}

      {permissionDenied ? (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
          <ShieldAlert className="size-5 text-amber-500" />
          {t("revenue.permissionDenied")}
        </div>
      ) : null}

      {!isLocked && !loadingCenters && centers.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {t("inventory.center.noCenters")}
          </p>
          <Button asChild className="mt-4">
            <Link href="/sport-center-management/create">
              {t("centerList.actions.create")}
            </Link>
          </Button>
        </div>
      ) : null}

      {!isLocked && !loadingCenters && centers.length > 0 && !activeCenterId ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t("inventory.center.noActive")}
        </div>
      ) : null}

      {activeCenterId && (!isLocked || lockedCenterActive) ? (
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as InventoryKind)}
          className="gap-4"
        >
          <TabsList>
            <TabsTrigger value="product" className="gap-2">
              {t("servicesProducts.page.product")}
              <Badge variant="secondary">{products.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="service" className="gap-2">
              {t("servicesProducts.page.service")}
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
      ) : null}

      <InventoryFormDialog
        key={`${dialogKind}-${dialogMode}-${dialogItem?.id ?? "new"}`}
        kind={dialogKind}
        mode={dialogMode}
        item={dialogItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        centerId={activeCenterId ?? undefined}
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
            <AlertDialogTitle>
              {t("inventory.deleteDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.deleteDialog.description", {
                name: deleteTarget?.item.name ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t("inventory.deleteDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                handleConfirmDelete()
              }}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleting
                ? t("inventory.deleteDialog.deleting")
                : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )

  if (noContainer) {
    return <div className="space-y-6">{content}</div>
  }

  return (
    <PageContainer variant="wide" className="space-y-6 pb-10">
      {content}
    </PageContainer>
  )
}
