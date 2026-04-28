export type VideoNote = {
  id: string
  timestamp: number
  note: string
}

export type VideoTag = "Forehand" | "Backhand" | "Serve"

export const videoNotes: VideoNote[] = [
  { id: "vn-1", timestamp: 10, note: "Sai tư thế tay khi vào bóng." },
  { id: "vn-2", timestamp: 34, note: "Cần giữ trọng tâm thấp hơn." },
  { id: "vn-3", timestamp: 68, note: "Chuyển động chân còn chậm." },
]

export const videoTags: VideoTag[] = ["Forehand", "Backhand", "Serve"]

export const sampleVideoUrl =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
