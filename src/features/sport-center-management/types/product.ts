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

export interface ProductRequest {
  name: string
  description: string
  type: string
  imageUrl: string
  price: number
  unit: string
  stock: number
  isActive: boolean
}

export interface CreateProductDtoRequest {
  name: string
  description?: string
  type: string
  price: number
  unit?: string
  imageUrl?: string
  stock?: number
}

export interface UpdateProductDtoRequest {
  name?: string
  description?: string
  type?: string
  price?: number
  unit?: string
  imageUrl?: string
  stock?: number
  isActive?: boolean
}
