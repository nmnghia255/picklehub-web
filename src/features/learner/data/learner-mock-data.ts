export type LearnerProfile = {
  id: string
  name: string
  avatar: string
  email: string
  phone: string
  level: string
  joinedAt: string
  bio: string
}

export type LearnerScheduleBlock = {
  id: string
  day: string
  date: string
  startTime: string
  endTime: string
  sessionName: string
  coachName: string
  coachId: string
  groupName: string
  location: string
  status: "Đã xác nhận" | "Chờ xác nhận" | "Hoàn thành" | "Đã hủy"
}

export type LearnerPayment = {
  id: string
  date: string
  amount: number
  description: string
  method: string
  status: "Đã thanh toán" | "Chờ xác nhận" | "Chưa thanh toán"
}

export type CoachInfo = {
  id: string
  name: string
  avatar: string
  specialty: string
  rating: number
  reviewCount: number
  experience: number
  price: number
  location: string
  bio: string
}

export type LearnerCoachRegistration = {
  learnerId: string
  coachId: string
  registeredAt: string
}

export const learnerProfile: LearnerProfile = {
  id: "l-1",
  name: "Trần Minh Anh",
  avatar: "/mock/avatar.png",
  email: "minhanh.tran@example.com",
  phone: "0908 123 456",
  level: "Trung cấp",
  joinedAt: "2026-02-15",
  bio: "Đam mê pickleball, mong muốn cải thiện kỹ thuật qua các buổi tập với HLV chuyên nghiệp.",
}

export const learnerSchedules: LearnerScheduleBlock[] = [
  {
    id: "ls-1",
    day: "Thứ 2",
    date: "06/07/2026",
    startTime: "18:00",
    endTime: "20:00",
    sessionName: "Kỹ thuật cơ bản",
    coachName: "Nguyễn Văn A",
    coachId: "c1",
    groupName: "Nhóm A",
    location: "Sân A2 - PickleHub Center",
    status: "Đã xác nhận",
  },
  {
    id: "ls-2",
    day: "Thứ 4",
    date: "08/07/2026",
    startTime: "19:00",
    endTime: "21:00",
    sessionName: "Tập thể lực",
    coachName: "Lê Hoàng B",
    coachId: "c2",
    groupName: "Nhóm B",
    location: "Sân B1 - PickleHub Center",
    status: "Chờ xác nhận",
  },
  {
    id: "ls-3",
    day: "Thứ 6",
    date: "10/07/2026",
    startTime: "17:30",
    endTime: "19:30",
    sessionName: "Chiến thuật thi đấu",
    coachName: "Lê Hoàng B",
    coachId: "c2",
    groupName: "Học cá nhân",
    location: "Sân A1 - PickleHub Center",
    status: "Hoàn thành",
  },
  {
    id: "ls-4",
    day: "Thứ 3",
    date: "07/07/2026",
    startTime: "18:00",
    endTime: "19:30",
    sessionName: "Kỹ thuật giao bóng",
    coachName: "Nguyễn Văn A",
    coachId: "c1",
    groupName: "Nhóm A",
    location: "Sân A2 - PickleHub Center",
    status: "Đã xác nhận",
  },
  {
    id: "ls-5",
    day: "Thứ 5",
    date: "09/07/2026",
    startTime: "17:00",
    endTime: "18:30",
    sessionName: "Phản xạ nhanh",
    coachName: "Trần Thị C",
    coachId: "c3",
    groupName: "Nhóm C",
    location: "Sân B2 - PickleHub Center",
    status: "Đã xác nhận",
  },
  {
    id: "ls-6",
    day: "Thứ 7",
    date: "11/07/2026",
    startTime: "08:00",
    endTime: "10:00",
    sessionName: "Thi đấu giao hữu",
    coachName: "Nguyễn Văn A",
    coachId: "c1",
    groupName: "Nhóm A",
    location: "Sân A2 - PickleHub Center",
    status: "Đã hủy",
  },
]

export const learnerPayments: LearnerPayment[] = [
  {
    id: "lp-1",
    date: "2026-04-01",
    amount: 1200000,
    description: "Gói 4 buổi tập - Tháng 4 (HLV Nguyễn Văn A)",
    method: "Chuyển khoản",
    status: "Đã thanh toán",
  },
  {
    id: "lp-2",
    date: "2026-04-02",
    amount: 2000000,
    description: "Gói 4 buổi tập - Tháng 4 (HLV Lê Hoàng B)",
    method: "Ví điện tử",
    status: "Đã thanh toán",
  },
  {
    id: "lp-3",
    date: "2026-03-15",
    amount: 1500000,
    description: "Gói 5 buổi tập - Tháng 3",
    method: "Ví điện tử",
    status: "Đã thanh toán",
  },
  {
    id: "lp-4",
    date: "2026-02-20",
    amount: 1200000,
    description: "Gói 4 buổi tập - Tháng 2",
    method: "Tiền mặt",
    status: "Đã thanh toán",
  },
]

export const coachList: CoachInfo[] = [
  {
    id: "c1",
    name: "Nguyễn Văn A",
    avatar: "/mock/avatar.png",
    specialty: "Dạy người mới, Kỹ thuật căn bản",
    rating: 4.8,
    reviewCount: 45,
    experience: 5,
    price: 350000,
    location: "TP.HCM",
    bio: "Huấn luyện viên pickleball với 5 năm kinh nghiệm, chuyên dạy người mới bắt đầu và kỹ thuật căn bản.",
  },
  {
    id: "c2",
    name: "Lê Hoàng B",
    avatar: "/mock/avatar.png",
    specialty: "Nâng cao, Chiến thuật thi đấu",
    rating: 4.9,
    reviewCount: 32,
    experience: 8,
    price: 500000,
    location: "TP.HCM",
    bio: "Cựu VĐV pickleball với nhiều năm kinh nghiệm thi đấu, chuyên huấn luyện chiến thuật nâng cao.",
  },
  {
    id: "c3",
    name: "Trần Thị C",
    avatar: "/mock/avatar.png",
    specialty: "Dạy trẻ em, Kỹ thuật cơ bản",
    rating: 4.7,
    reviewCount: 28,
    experience: 4,
    price: 300000,
    location: "Hà Nội",
    bio: "HLV pickleball cho trẻ em, phương pháp giảng dạy thân thiện và dễ hiểu.",
  },
  {
    id: "c4",
    name: "Phạm Văn D",
    avatar: "/mock/avatar.png",
    specialty: "Kỹ thuật nâng cao, Phân tích video",
    rating: 4.6,
    reviewCount: 19,
    experience: 6,
    price: 400000,
    location: "TP.HCM",
    bio: "Chuyên phân tích kỹ thuật qua video, giúp học viên cải thiện nhanh chóng.",
  },
]

export const learnerCoachRegistrations: LearnerCoachRegistration[] = [
  { learnerId: "l-1", coachId: "c1", registeredAt: "2026-02-15" },
  { learnerId: "l-1", coachId: "c2", registeredAt: "2026-03-01" },
  { learnerId: "l-2", coachId: "c1", registeredAt: "2026-01-10" },
  { learnerId: "l-2", coachId: "c3", registeredAt: "2026-02-20" },
  { learnerId: "l-3", coachId: "c1", registeredAt: "2025-11-25" },
]

export const weekDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]
export const daySlots = ["08:00", "17:00", "17:30", "18:00", "19:00"]

export function getRegisteredCoachesByLearner(learnerId: string): CoachInfo[] {
  const registrationIds = learnerCoachRegistrations
    .filter((r) => r.learnerId === learnerId)
    .map((r) => r.coachId)
  return coachList.filter((c) => registrationIds.includes(c.id))
}

export function getLearnersByCoach(coachId: string): string[] {
  return learnerCoachRegistrations
    .filter((r) => r.coachId === coachId)
    .map((r) => r.learnerId)
}
