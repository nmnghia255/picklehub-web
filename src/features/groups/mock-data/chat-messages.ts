export interface ChatMessage {
  id: string
  authorId: string
  authorName: string
  kind: "text" | "image"
  text?: string
  imageUrl?: string
  timeLabel: string
}

export const mockGroupChatMessages: ChatMessage[] = [
  {
    id: "m-1",
    authorId: "user-2",
    authorName: "Nguyễn An",
    kind: "text",
    text: "Ai tham gia buổi tối thứ 6 này?",
    timeLabel: "5 phút trước",
  },
  {
    id: "m-2",
    authorId: "user-1",
    authorName: "Bạn",
    kind: "text",
    text: "Mình sẽ tham gia nhé, còn 2 chỗ nữa.",
    timeLabel: "3 phút trước",
  },
  {
    id: "m-3",
    authorId: "user-3",
    authorName: "Lê Minh",
    kind: "text",
    text: "Mọi người cần mang vợt không?",
    timeLabel: "1 phút trước",
  },
]
