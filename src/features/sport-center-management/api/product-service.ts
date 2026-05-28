import { getAuthenticatedAxios } from "@/lib/server-api"

import type { Product, ProductRequest } from "../types/product"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  pagination?: {
    total: number
    offset: number
    limit: number
  }
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const ProductService = {
  listProducts: async function listProducts(
    centerId: string
  ): Promise<Product[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<Product[]>(
      `/api/sport-centers/${centerId}/products`
    )
    return unwrapApiResponse(response.data)
  },

  createProduct: async function createProduct(
    centerId: string,
    productData: ProductRequest
  ): Promise<Product> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<Product>(
      `/api/sport-centers/${centerId}/products`,
      productData
    )
    return unwrapApiResponse(response.data)
  },

  updateProduct: async function updateProduct(
    centerId: string,
    productId: string,
    productData: ProductRequest
  ): Promise<Product> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.put<Product>(
      `/api/sport-centers/${centerId}/products/${productId}`,
      productData
    )
    return unwrapApiResponse(response.data)
  },

  deleteProduct: async function deleteProduct(
    centerId: string,
    productId: string
  ): Promise<Product> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<Product>(
      `/api/sport-centers/${centerId}/products/${productId}`
    )
    return unwrapApiResponse(response.data)
  },
}
