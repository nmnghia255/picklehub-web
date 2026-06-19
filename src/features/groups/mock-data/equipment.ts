import type { Equipment } from "../types"

export const mockEquipment: Equipment[] = [
  {
    id: "1",
    name: "Banh thi đấu",
    quantity: 10,
    status: "Đang sử dụng",
    purchaseDate: "2026-06-01",
    notes: "Banh loại tốt",
  },
  {
    id: "2",
    name: "Lưới dự phòng",
    quantity: 2,
    status: "Trong kho",
    purchaseDate: "2026-05-15",
    notes: "Dùng khi lưới chính hỏng",
  },
  {
    id: "3",
    name: "Áo đấu nhóm",
    quantity: 20,
    status: "Đang sử dụng",
    purchaseDate: "2026-04-10",
    notes: "Màu xanh dương",
  },
]
