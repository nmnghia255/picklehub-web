import type {
  CourtStatus,
  InventoryKind,
  ProductStatus,
  ServiceStatus,
} from "./types"

export function formatCurrencyVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatMockDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function getCourtStatusLabel(status: CourtStatus) {
  return status === "active" ? "Đang hoạt động" : "Tạm ngưng"
}

export function getCourtStatusClass(status: CourtStatus) {
  return status === "active"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
}

export function getProductStatusLabel(status: ProductStatus) {
  return status === "in_stock" ? "Còn hàng" : "Hết hàng"
}

export function getServiceStatusLabel(status: ServiceStatus) {
  return status === "active" ? "Đang hoạt động" : "Tạm ngưng"
}

export function getInventoryStatusClass(kind: InventoryKind, status: string) {
  if (kind === "product") {
    return status === "in_stock"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
      : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
  }

  return status === "active"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
}

export function getProductCategoryLabel(category: string) {
  return category
}

export function getServiceCategoryLabel(category: string) {
  return category
}

export function getInventoryKindLabel(kind: InventoryKind) {
  return kind === "product" ? "Sản phẩm" : "Dịch vụ"
}

export function createMockImageDataUri(label: string, accent = "#0f766e") {
  const initials = label
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="640" height="420" rx="28" fill="url(#bg)" />
      <circle cx="520" cy="96" r="62" fill="rgba(255,255,255,0.08)" />
      <circle cx="116" cy="318" r="84" fill="rgba(255,255,255,0.08)" />
      <text x="50%" y="50%" fill="#ffffff" font-size="92" font-family="Inter, Arial, sans-serif" font-weight="700" text-anchor="middle" dominant-baseline="middle">${initials}</text>
    </svg>
  `.trim()

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
