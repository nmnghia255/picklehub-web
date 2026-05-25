export type ServiceType = "EQUIPMENT_RENTAL" | "COACHING"

export interface Service {
  id: string
  centerId: string
  name: string
  description: string
  type: ServiceType
  imageUrl: string
  price: number
  unit: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ServiceItem {
  serviceId: string
  quantity: number
}
