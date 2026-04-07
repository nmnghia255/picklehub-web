export type CoachCertification = {
  id: string
  name: string
  organization: string
  level: 1 | 2 | 3
  year: number
  verified: boolean
  fileUrl: string
  fileName: string
}

export type CoachProfile = {
  id: string
  name: string
  avatar: string
  bio: string
  location: string
  experienceYears: number
  certifications: CoachCertification[]
  skills: string[]
  teachingMethod: string
  stats: {
    totalSessions: number
    totalStudents: number
    rating: number
    totalReviews: number
  }
}

export const skillOptions = [
  { value: "Beginner Coaching", label: "Dạy người mới" },
  { value: "Advanced Strategy", label: "Dạy nâng cao" },
  { value: "Kids Coaching", label: "Dạy trẻ em" },
  { value: "Tournament Coaching", label: "Huấn luyện thi đấu" },
] as const

export const coachProfile: CoachProfile = {
  id: "c1",
  name: "Nguyễn Văn A",
  avatar: "/mock/avatar.png",
  bio: "Huấn luyện viên pickleball với 5 năm kinh nghiệm",
  location: "TP.HCM",
  experienceYears: 5,
  certifications: [
    {
      id: "cert1",
      name: "IPTPA Level 1",
      organization: "IPTPA",
      level: 1,
      year: 2023,
      verified: true,
      fileUrl: "/mock/cert1.pdf",
      fileName: "cert1.pdf",
    },
    {
      id: "cert2",
      name: "PPR Level 2",
      organization: "PPR",
      level: 2,
      year: 2024,
      verified: false,
      fileUrl: "/mock/cert2.pdf",
      fileName: "cert2.pdf",
    },
  ],
  skills: ["Beginner Coaching", "Advanced Strategy"],
  teachingMethod: "Tập trung vào kỹ thuật cơ bản và thực hành thực tế",
  stats: {
    totalSessions: 120,
    totalStudents: 80,
    rating: 4.8,
    totalReviews: 45,
  },
}
