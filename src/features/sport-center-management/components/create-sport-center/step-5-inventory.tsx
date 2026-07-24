import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type {
  ProductType,
  ServiceType,
} from "../../services-products-management/types"
import { ImageUploadControl } from "../image-upload-control"
import type { ProductDraft, ServiceDraft } from "./types"

export function Step5Inventory({
  serviceTab,
  setServiceTab,
  serviceDraft,
  setServiceDraft,
  serviceDrafts,
  setServiceDrafts,
  addServiceDraft,
  setServiceImageUploading,
  productDraft,
  setProductDraft,
  productDrafts,
  setProductDrafts,
  addProductDraft,
  setProductImageUploading,
}: {
  serviceTab: "service" | "product"
  setServiceTab: (tab: "service" | "product") => void
  serviceDraft: {
    name: string
    type: ServiceType
    price: string
    unit: string
    description: string
    imageUrl: string
  }
  setServiceDraft: React.Dispatch<
    React.SetStateAction<{
      name: string
      type: ServiceType
      price: string
      unit: string
      description: string
      imageUrl: string
    }>
  >
  serviceDrafts: ServiceDraft[]
  setServiceDrafts: React.Dispatch<React.SetStateAction<ServiceDraft[]>>
  addServiceDraft: () => void
  setServiceImageUploading: (uploading: boolean) => void
  productDraft: {
    name: string
    type: ProductType
    price: string
    unit: string
    stock: string
    description: string
    imageUrl: string
  }
  setProductDraft: React.Dispatch<
    React.SetStateAction<{
      name: string
      type: ProductType
      price: string
      unit: string
      stock: string
      description: string
      imageUrl: string
    }>
  >
  productDrafts: ProductDraft[]
  setProductDrafts: React.Dispatch<React.SetStateAction<ProductDraft[]>>
  addProductDraft: () => void
  setProductImageUploading: (uploading: boolean) => void
}) {
  const { t } = useSportCenterManagementTranslation()

  return (
    <div className="space-y-6">
      <Tabs
        value={serviceTab}
        onValueChange={(value) => setServiceTab(value as typeof serviceTab)}
      >
        <TabsList className="grid w-full grid-cols-2 sm:w-80">
          <TabsTrigger value="service">
            {t("createCenter.tabs.services", {
              defaultValue: "Services",
            })}
          </TabsTrigger>
          <TabsTrigger value="product">
            {t("createCenter.tabs.products", {
              defaultValue: "Products",
            })}
          </TabsTrigger>
        </TabsList>

        {/* Service Tab Content */}
        <TabsContent value="service" className="pt-4">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-4 rounded-xl border bg-muted/20 p-5 lg:col-span-6">
              <h4 className="text-base font-semibold">
                {t("createCenter.sectionTitles.addService", {
                  defaultValue: "Add Service",
                })}
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="service-name">
                    {t("createCenter.fields.serviceName", {
                      defaultValue: "Service name",
                    })}
                  </Label>
                  <Input
                    id="service-name"
                    value={serviceDraft.name}
                    onChange={(e) =>
                      setServiceDraft((current) => ({
                        ...current,
                        name: e.target.value,
                      }))
                    }
                    placeholder={t("createCenter.placeholders.serviceName", {
                      defaultValue: "Ví dụ: Cho thuê vợt Pickleball",
                    })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="service-type">
                    {t("createCenter.fields.serviceType", {
                      defaultValue: "Service type",
                    })}
                  </Label>
                  <Select
                    value={serviceDraft.type}
                    onValueChange={(val) =>
                      setServiceDraft((current) => ({
                        ...current,
                        type: val as ServiceType,
                      }))
                    }
                  >
                    <SelectTrigger id="service-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EQUIPMENT_RENTAL">
                        {t("createCenter.enums.serviceType.equipmentRental", {
                          defaultValue: "Equipment rental",
                        })}
                      </SelectItem>
                      <SelectItem value="COACHING">
                        {t("createCenter.enums.serviceType.coaching", {
                          defaultValue: "Coaching",
                        })}
                      </SelectItem>
                      <SelectItem value="FACILITY_ADD_ON">
                        {t("createCenter.enums.serviceType.facilityAddOn", {
                          defaultValue: "Facility add-on",
                        })}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="service-price">
                    {t("createCenter.fields.price", {
                      defaultValue: "Price",
                    })}
                  </Label>
                  <div className="relative">
                    <Input
                      id="service-price"
                      type="text"
                      inputMode="numeric"
                      value={
                        serviceDraft.price
                          ? Number(
                              serviceDraft.price.toString().replace(/\D/g, "")
                            ).toLocaleString("vi-VN")
                          : ""
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "")
                        setServiceDraft((current) => ({
                          ...current,
                          price: rawValue,
                        }))
                      }}
                      placeholder="50.000"
                      className="pr-12"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-xs font-semibold text-muted-foreground">
                        VND
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="service-unit">
                    {t("createCenter.fields.unit", {
                      defaultValue: "Unit",
                    })}
                  </Label>
                  <Input
                    id="service-unit"
                    value={serviceDraft.unit}
                    onChange={(e) =>
                      setServiceDraft((current) => ({
                        ...current,
                        unit: e.target.value,
                      }))
                    }
                    placeholder={t("createCenter.placeholders.serviceUnit", {
                      defaultValue: "VND / h",
                    })}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label>
                    {t("createCenter.fields.imageUrl", {
                      defaultValue: "Service image",
                    })}
                  </Label>
                  <ImageUploadControl
                    value={serviceDraft.imageUrl}
                    label={t("createCenter.actions.uploadImage", {
                      defaultValue: "Upload image",
                    })}
                    onChange={(value) =>
                      setServiceDraft((current) => ({
                        ...current,
                        imageUrl:
                          typeof value === "string" ? value : (value[0] ?? ""),
                      }))
                    }
                    onUploadingChange={setServiceImageUploading}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="service-description">
                    {t("createCenter.fields.description", {
                      defaultValue: "Description",
                    })}
                  </Label>
                  <Textarea
                    id="service-description"
                    value={serviceDraft.description}
                    onChange={(e) =>
                      setServiceDraft((current) => ({
                        ...current,
                        description: e.target.value,
                      }))
                    }
                    placeholder={t(
                      "createCenter.placeholders.serviceDescription",
                      {
                        defaultValue: "Mô tả ngắn gọn về dịch vụ",
                      }
                    )}
                    className="min-h-20"
                  />
                </div>
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={addServiceDraft}
              >
                <Plus className="mr-2 size-4" />
                {t("createCenter.actions.addService", {
                  defaultValue: "Add service",
                })}
              </Button>
            </div>

            <div className="space-y-3 lg:col-span-6">
              <h4 className="text-base font-semibold">
                {t("createCenter.sectionTitles.configuredServices", {
                  defaultValue: "Configured Services",
                })}{" "}
                ({serviceDrafts.length})
              </h4>
              {serviceDrafts.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  <p>
                    {t("createCenter.review.skippedInventory", {
                      defaultValue: "No services added yet.",
                    })}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {serviceDrafts.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-xs"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.type} • {item.price}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setServiceDrafts((current) =>
                            current.filter((draft) => draft.id !== item.id)
                          )
                        }
                        aria-label={t("common.delete")}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Product Tab Content */}
        <TabsContent value="product" className="pt-4">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-4 rounded-xl border bg-muted/20 p-5 lg:col-span-6">
              <h4 className="text-base font-semibold">
                {t("createCenter.sectionTitles.addProduct", {
                  defaultValue: "Add Product",
                })}
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="product-name">
                    {t("createCenter.fields.productName", {
                      defaultValue: "Product name",
                    })}
                  </Label>
                  <Input
                    id="product-name"
                    value={productDraft.name}
                    onChange={(e) =>
                      setProductDraft((current) => ({
                        ...current,
                        name: e.target.value,
                      }))
                    }
                    placeholder={t("createCenter.placeholders.productName", {
                      defaultValue: "Ví dụ: Nước suối 500ml",
                    })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="product-type">
                    {t("createCenter.fields.productType", {
                      defaultValue: "Product type",
                    })}
                  </Label>
                  <Select
                    value={productDraft.type}
                    onValueChange={(val) =>
                      setProductDraft((current) => ({
                        ...current,
                        type: val as ProductType,
                      }))
                    }
                  >
                    <SelectTrigger id="product-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEVERAGE">
                        {t("createCenter.enums.productType.beverage", {
                          defaultValue: "Beverage",
                        })}
                      </SelectItem>
                      <SelectItem value="CONSUMABLE">
                        {t("createCenter.enums.productType.consumable", {
                          defaultValue: "Consumable",
                        })}
                      </SelectItem>
                      <SelectItem value="EQUIPMENT">
                        {t("createCenter.enums.productType.equipment", {
                          defaultValue: "Equipment",
                        })}
                      </SelectItem>
                      <SelectItem value="CLOTHING">
                        {t("createCenter.enums.productType.clothing", {
                          defaultValue: "Clothing",
                        })}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="product-price">
                    {t("createCenter.fields.price", {
                      defaultValue: "Price",
                    })}
                  </Label>
                  <div className="relative">
                    <Input
                      id="product-price"
                      type="text"
                      inputMode="numeric"
                      value={
                        productDraft.price
                          ? Number(
                              productDraft.price.toString().replace(/\D/g, "")
                            ).toLocaleString("vi-VN")
                          : ""
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "")
                        setProductDraft((current) => ({
                          ...current,
                          price: rawValue,
                        }))
                      }}
                      placeholder="15.000"
                      className="pr-12"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-xs font-semibold text-muted-foreground">
                        VND
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="product-stock">
                    {t("createCenter.fields.stock", {
                      defaultValue: "Stock",
                    })}
                  </Label>
                  <Input
                    id="product-stock"
                    type="number"
                    min={0}
                    value={productDraft.stock}
                    onChange={(e) =>
                      setProductDraft((current) => ({
                        ...current,
                        stock: e.target.value,
                      }))
                    }
                    placeholder={t("createCenter.placeholders.productStock", {
                      defaultValue: "50",
                    })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="product-unit">
                    {t("createCenter.fields.unit", {
                      defaultValue: "Unit",
                    })}
                  </Label>
                  <Input
                    id="product-unit"
                    value={productDraft.unit}
                    onChange={(e) =>
                      setProductDraft((current) => ({
                        ...current,
                        unit: e.target.value,
                      }))
                    }
                    placeholder={t("createCenter.placeholders.productUnit", {
                      defaultValue: "Chai",
                    })}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label>
                    {t("createCenter.fields.imageUrl", {
                      defaultValue: "Product image",
                    })}
                  </Label>
                  <ImageUploadControl
                    value={productDraft.imageUrl}
                    label={t("createCenter.actions.uploadImage", {
                      defaultValue: "Upload image",
                    })}
                    onChange={(value) =>
                      setProductDraft((current) => ({
                        ...current,
                        imageUrl:
                          typeof value === "string" ? value : (value[0] ?? ""),
                      }))
                    }
                    onUploadingChange={setProductImageUploading}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="product-description">
                    {t("createCenter.fields.description", {
                      defaultValue: "Description",
                    })}
                  </Label>
                  <Textarea
                    id="product-description"
                    value={productDraft.description}
                    onChange={(e) =>
                      setProductDraft((current) => ({
                        ...current,
                        description: e.target.value,
                      }))
                    }
                    placeholder={t(
                      "createCenter.placeholders.productDescription",
                      {
                        defaultValue: "Mô tả ngắn gọn về sản phẩm",
                      }
                    )}
                    className="min-h-20"
                  />
                </div>
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={addProductDraft}
              >
                <Plus className="mr-2 size-4" />
                {t("createCenter.actions.addProduct", {
                  defaultValue: "Add product",
                })}
              </Button>
            </div>

            <div className="space-y-3 lg:col-span-6">
              <h4 className="text-base font-semibold">
                {t("createCenter.sectionTitles.configuredProducts", {
                  defaultValue: "Configured Products",
                })}{" "}
                ({productDrafts.length})
              </h4>
              {productDrafts.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  <p>
                    {t("createCenter.review.skippedInventory", {
                      defaultValue: "No products added yet.",
                    })}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {productDrafts.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-xs"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.type} • {item.price}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setProductDrafts((current) =>
                            current.filter((draft) => draft.id !== item.id)
                          )
                        }
                        aria-label={t("common.delete")}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
