export interface Product {
  id: string
  centerId: string
  name: string
  description: string
  type: string
  imageUrl: string
  price: number
  unit: string
  stock: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductItem {
  productId: string
  quantity: number
}
