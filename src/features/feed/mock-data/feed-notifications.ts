export type FeedFilter =
  | "all"
  | "unread"
  | "invitation"
  | "session"
  | "group"
  | "system"

export type FeedNotificationType = "invitation" | "session" | "group" | "system"

export type FeedNotificationStatus = "pending" | "accepted" | "declined"

export interface FeedNotification {
  id: string
  type: FeedNotificationType
  groupId?: string
  section: string
  title: string
  description: string
  actor: string
  timeLabel: string
  unread: boolean
  status?: FeedNotificationStatus
  tags: string[]
  actionHref?: string
}

export const feedNotifications: FeedNotification[] = [
  {
    id: "notif-gchat-001",
    type: "group",
    groupId: "group-1",
    section: "Hôm nay",
    title: "Tin nhắn mới trong nhóm Morning Crew",
    description: "Có 3 tin nhắn mới. Tham gia chat để phản hồi.",
    actor: "Nhóm",
    timeLabel: "1 phút trước",
    unread: true,
    tags: ["Chat nhóm"],
    actionHref: "/groups/group-1/chat",
  },
  {
    id: "notif-gchat-002",
    type: "group",
    groupId: "group-1",
    section: "Hôm nay",
    title: "Nhắc: Buổi chơi ngày mai",
    description: "Nhóm Badminton Club nhắc bạn về buổi chơi ngày mai.",
    actor: "Quản trị viên nhóm",
    timeLabel: "10 phút trước",
    unread: true,
    tags: ["Nhắc lịch", "Nhóm"],
    actionHref: "/groups/group-1/chat",
  },
  {
    id: "notif-001",
    type: "invitation",
    section: "Hôm nay",
    title: "Bạn được mời vào nhóm PickleHub Morning Crew",
    description:
      "Nguyễn An vừa gửi lời mời tham gia nhóm để bạn cùng theo dõi lịch tập buổi sáng.",
    actor: "Nguyễn An",
    timeLabel: "5 phút trước",
    unread: true,
    status: "pending",
    tags: ["Lời mời", "Nhóm", "Quan trọng"],
    actionHref: "/groups",
  },
  {
    id: "notif-002",
    type: "session",
    section: "Hôm nay",
    title: "Phiên chơi Saturday Open Court sắp bắt đầu",
    description:
      "Buổi chơi cộng đồng sẽ bắt đầu lúc 18:00 tại sân Central Court. Bạn đã được giữ chỗ.",
    actor: "Hệ thống",
    timeLabel: "20 phút trước",
    unread: true,
    tags: ["Nhắc lịch", "Phiên chơi", "Sắp diễn ra"],
    actionHref: "/play-sessions",
  },
  {
    id: "notif-003",
    type: "group",
    groupId: "group-1",
    section: "Hôm nay",
    title: "Nhóm Badminton Club cập nhật nội dung mới",
    description:
      "Lịch tập tuần này đã được bổ sung thêm khung giờ tối thứ 6 và thứ 7.",
    actor: "Quản trị viên nhóm",
    timeLabel: "1 giờ trước",
    unread: false,
    tags: ["Cập nhật nhóm", "Lịch", "Đã đọc"],
    actionHref: "/groups",
  },
  {
    id: "notif-004",
    type: "system",
    section: "Hôm qua",
    title: "Hồ sơ của bạn đã được xác minh thành công",
    description:
      "Tài khoản của bạn hiện đã sẵn sàng nhận thông báo và lời mời mới.",
    actor: "PickleHub",
    timeLabel: "Hôm qua",
    unread: false,
    tags: ["Hệ thống", "Xác minh", "Hoàn tất"],
  },
  {
    id: "notif-005",
    type: "invitation",
    section: "Hôm qua",
    title: "Lời mời tham gia nhóm Tennis Social Night",
    description:
      "Bạn được mời tham gia nhóm mới với các buổi chơi vào tối thứ 4 và thứ 6 hằng tuần.",
    actor: "Lê Minh",
    timeLabel: "6 giờ trước",
    unread: true,
    status: "pending",
    tags: ["Lời mời", "Nhóm", "Tennis"],
    actionHref: "/groups",
  },
  {
    id: "notif-006",
    type: "session",
    section: "Tuần này",
    title: "Bạn đã được ghi nhận tham gia phiên chơi",
    description:
      "Buổi luyện tập sáng thứ 3 đã hoàn tất. Kết quả điểm danh được lưu trong lịch sử hoạt động.",
    actor: "Hệ thống",
    timeLabel: "2 ngày trước",
    unread: false,
    tags: ["Phiên chơi", "Hoàn tất", "Lịch sử"],
    actionHref: "/history",
  },
  {
    id: "notif-007",
    type: "group",
    groupId: "group-1",
    section: "Tuần này",
    title: "Thành viên mới gia nhập nhóm của bạn",
    description:
      "Trần Vy đã trở thành thành viên của nhóm PickleHub Community để tham gia các buổi chơi mở.",
    actor: "Trần Vy",
    timeLabel: "3 ngày trước",
    unread: false,
    tags: ["Thành viên mới", "Nhóm"],
    actionHref: "/groups",
  },
  {
    id: "notif-008",
    type: "system",
    section: "Tuần này",
    title: "Bản tóm tắt hoạt động tuần này đã sẵn sàng",
    description:
      "Bạn đã có 3 lời mời mới, 2 phiên chơi sắp diễn ra và 7 hoạt động đã đọc.",
    actor: "PickleHub",
    timeLabel: "4 ngày trước",
    unread: false,
    tags: ["Tóm tắt", "Thống kê", "Tuần này"],
  },
]
