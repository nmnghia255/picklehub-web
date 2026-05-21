export type InventoryKind = "product" | "service"

export type CourtStatus = "active" | "paused"
export type ProductStatus = "in_stock" | "out_of_stock"
export type ServiceStatus = "active" | "paused"

export type ProductCategory =
  | "Bóng"
  | "Thiết bị"
  | "Đồ uống"
  | "Thời trang"
  | "Phụ kiện"

export type ServiceCategory =
  | "Cho thuê"
  | "Huấn luyện"
  | "Bảo trì"
  | "Tiện ích"
  | "Media"

export interface CourtInventoryContext {
  courtId: string
  courtName: string
  courtType: string
  location: string
  status: CourtStatus
  updatedAt: string
}

export interface ProductInventoryItem {
  kind: "product"
  id: string
  courtId: string
  courtName: string
  name: string
  category: ProductCategory
  price: number
  stock: number
  status: ProductStatus
  description: string
  imageUrl: string
  updatedAt: string
}

export interface ServiceInventoryItem {
  kind: "service"
  id: string
  courtId: string
  courtName: string
  name: string
  category: ServiceCategory
  price: number
  status: ServiceStatus
  description: string
  updatedAt: string
}

export interface CourtInventoryRecord extends CourtInventoryContext {
  products: ProductInventoryItem[]
  services: ServiceInventoryItem[]
}

export type InventoryItem = ProductInventoryItem | ServiceInventoryItem
