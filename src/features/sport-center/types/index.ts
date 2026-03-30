// ============================================
// Sport Center Types
// ============================================

export interface SportCenter {
  id: number
  name: string
  address: string
  region: string
  isFavorite: boolean
  distanceKm: number
  openTime: string
  playTimeTags: string[]
  imageUrl: string
  logoUrl: string
}

// ============================================
// Sport Center Info
// ============================================

export interface SportCenterInfo {
  introduction?: string
  services: { label: string; price: string }[]
  images?: string[]
  policies: string[]
  feedback: { name: string; rating: number; comment: string }[]
}
