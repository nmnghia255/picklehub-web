export interface Announcement {
  id: number
  message: string
  time: string
  type: "info" | "update" | "warning"
}
