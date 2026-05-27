export interface Service {
  id: string
  centerId: string
  name: string
  description: string
  type: string
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
