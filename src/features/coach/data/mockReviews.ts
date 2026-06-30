export interface CoachReview {
  id: string
  coachId: string
  authorName: string
  authorAvatar: string | null
  rating: number
  content: string
  skills: string[]
  strengths: string[]
  sessionType: string
  createdAt: string
}

export const recommendationTags = [
  { value: "beginner", label: "Người mới" },
  { value: "intermediate", label: "Trung cấp" },
  { value: "competitive", label: "Thi đấu" },
  { value: "technique", label: "Kỹ thuật" },
  { value: "tactics", label: "Chiến thuật" },
  { value: "fitness", label: "Thể lực" },
] as const

export const coachReviews: CoachReview[] = [
  {
    id: "rev-1",
    coachId: "c1",
    authorName: "Trần Minh Anh",
    authorAvatar: null,
    rating: 5,
    content:
      "HLV rất nhiệt tình và có phương pháp giảng dạy dễ hiểu. Sau 4 buổi mình đã cải thiện đáng kể kỹ thuật forehand.",
    skills: ["Serve", "Forehand"],
    strengths: ["Giao tiếp tốt", "Kiên nhẫn"],
    sessionType: "Cá nhân",
    createdAt: "2026-06-15",
  },
  {
    id: "rev-2",
    coachId: "c1",
    authorName: "Lê Hoàng Nam",
    authorAvatar: null,
    rating: 4,
    content:
      "Kỹ thuật tốt, chuyên nghiệp. Có thể cần cải thiện thêm về thời gian linh hoạt.",
    skills: ["Backhand", "Footwork"],
    strengths: ["Chuyên môn cao"],
    sessionType: "Nhóm",
    createdAt: "2026-06-10",
  },
  {
    id: "rev-3",
    coachId: "c1",
    authorName: "Phạm Thị Hương",
    authorAvatar: null,
    rating: 5,
    content:
      "Rất hài lòng, HLV đã giúp mình sửa được lỗi giao bóng sau nhiều năm tập sai.",
    skills: ["Serve"],
    strengths: ["Phân tích lỗi tốt"],
    sessionType: "Cá nhân",
    createdAt: "2026-05-28",
  },
  {
    id: "rev-4",
    coachId: "c1",
    authorName: "Nguyễn Văn Bình",
    authorAvatar: null,
    rating: 3,
    content:
      "Ổn, nhưng buổi học hơi ngắn so với giá tiền. HLV có kiến thức nhưng chưa tập trung đủ vào điểm yếu của mình.",
    skills: ["Volley", "Smash"],
    strengths: ["Kiến thức rộng"],
    sessionType: "Nhóm",
    createdAt: "2026-05-20",
  },
  {
    id: "rev-5",
    coachId: "c1",
    authorName: "Đặng Thị Mai",
    authorAvatar: null,
    rating: 5,
    content:
      "Xuất sắc! HLV đã giúp mình tự tin hơn rất nhiều khi thi đấu giao hữu.",
    skills: ["Chiến thuật", "Tâm lý"],
    strengths: ["Truyền cảm hứng", "Tận tâm"],
    sessionType: "Cá nhân",
    createdAt: "2026-05-15",
  },
  {
    id: "rev-6",
    coachId: "c1",
    authorName: "Hoàng Minh Tú",
    authorAvatar: null,
    rating: 4,
    content:
      "HLV dạy tốt, tập trung vào kỹ thuật nền tảng. Phù hợp cho người mới bắt đầu.",
    skills: ["Forehand", "Backhand"],
    strengths: ["Bài bản", "Dễ hiểu"],
    sessionType: "Nhóm",
    createdAt: "2026-05-08",
  },
]
