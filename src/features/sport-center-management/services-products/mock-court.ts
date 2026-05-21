import type { CourtInventoryRecord } from "./types"
import { createMockImageDataUri } from "./utils"

const now = Date.now()
const hoursAgo = (hours: number) =>
  new Date(now - hours * 60 * 60 * 1000).toISOString()

export const MOCK_SELECTED_COURT: CourtInventoryRecord = {
  courtId: "court-demo-1",
  courtName: "Court Demo 1",
  courtType: "Indoor",
  location: "Tầng 1, khu demo",
  status: "active",
  updatedAt: hoursAgo(1),
  products: [
    {
      kind: "product",
      id: "prod-demo-1",
      courtId: "court-demo-1",
      courtName: "Court Demo 1",
      name: "Bóng pickleball",
      category: "Bóng",
      price: 120000,
      stock: 24,
      status: "in_stock",
      description: "Bóng thi đấu tiêu chuẩn cho sân demo.",
      imageUrl: createMockImageDataUri("Bóng", "#16a34a"),
      updatedAt: hoursAgo(1),
    },
    {
      kind: "product",
      id: "prod-demo-2",
      courtId: "court-demo-1",
      courtName: "Court Demo 1",
      name: "Paddle pickleball",
      category: "Thiết bị",
      price: 980000,
      stock: 6,
      status: "in_stock",
      description: "Paddle cho người mới và người chơi trung cấp.",
      imageUrl: createMockImageDataUri("Paddle", "#7c3aed"),
      updatedAt: hoursAgo(2),
    },
  ],
  services: [
    {
      kind: "service",
      id: "svc-demo-1",
      courtId: "court-demo-1",
      courtName: "Court Demo 1",
      name: "Thuê paddle",
      category: "Cho thuê",
      price: 40000,
      status: "active",
      description: "Thuê paddle theo giờ chơi.",
      updatedAt: hoursAgo(1),
    },
    {
      kind: "service",
      id: "svc-demo-2",
      courtId: "court-demo-1",
      courtName: "Court Demo 1",
      name: "Huấn luyện cá nhân",
      category: "Huấn luyện",
      price: 350000,
      status: "paused",
      description: "Kèm 1:1 với HLV cho người chơi mới.",
      updatedAt: hoursAgo(3),
    },
  ],
}
