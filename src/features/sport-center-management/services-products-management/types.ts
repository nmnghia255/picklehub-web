// ============================================================================
// Service & Product enums (aligned with sport-centers API)
// ============================================================================

export type ServiceType = "EQUIPMENT_RENTAL" | "COACHING" | "FACILITY_ADD_ON"

export type ProductType = "BEVERAGE" | "CONSUMABLE" | "EQUIPMENT" | "CLOTHING"

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  EQUIPMENT_RENTAL: "Cho thuê thiết bị",
  COACHING: "Huấn luyện",
  FACILITY_ADD_ON: "Tiện ích bổ sung",
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  BEVERAGE: "Đồ uống",
  CONSUMABLE: "Tiêu hao",
  EQUIPMENT: "Thiết bị",
  CLOTHING: "Thời trang",
}

export const SERVICE_TYPE_OPTIONS: { value: ServiceType; label: string }[] = (
  Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]
).map((value) => ({ value, label: SERVICE_TYPE_LABELS[value] }))

export const PRODUCT_TYPE_OPTIONS: { value: ProductType; label: string }[] = (
  Object.keys(PRODUCT_TYPE_LABELS) as ProductType[]
).map((value) => ({ value, label: PRODUCT_TYPE_LABELS[value] }))

export function getServiceTypeLabel(type: string) {
  return SERVICE_TYPE_LABELS[type as ServiceType] ?? type
}

export function getProductTypeLabel(type: string) {
  return PRODUCT_TYPE_LABELS[type as ProductType] ?? type
}

// ============================================================================
// Entities
// ============================================================================

export interface SportCenterService {
  id: string
  centerId: string
  name: string
  description?: string | null
  type: ServiceType | string
  imageUrl?: string | null
  price: number
  unit?: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface SportCenterProduct {
  id: string
  centerId: string
  name: string
  description?: string | null
  type: ProductType | string
  imageUrl?: string | null
  price: number
  unit?: string | null
  stock?: number | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

// ============================================================================
// Request DTOs
// ============================================================================

export interface CreateServicePayload {
  name: string
  type: ServiceType
  price: number
  description?: string
  unit?: string
  imageUrl?: string
}

export interface UpdateServicePayload {
  name?: string
  type?: ServiceType
  price?: number
  description?: string | null
  unit?: string | null
  imageUrl?: string | null
  isActive?: boolean
}

export interface CreateProductPayload {
  name: string
  type: ProductType
  price: number
  description?: string
  unit?: string
  imageUrl?: string
  stock?: number
}

export interface UpdateProductPayload {
  name?: string
  type?: ProductType
  price?: number
  description?: string | null
  unit?: string | null
  imageUrl?: string | null
  stock?: number
  isActive?: boolean
}

export type MediaUploadResult = {
  url: string
  publicId?: string
  format?: string
}
