export interface PersonalEvent {
  id: string
  title: string
  description: string
  startTime: string // ISO string
  endTime: string // ISO string
  location: string
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED"
  type: "SOCIAL" | "BOOKING" | "TOURNAMENT"
  participantsCount: number
  organizer: string
}

export function getMockPersonalEvents(): PersonalEvent[] {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() // 0-indexed

  // Helper to make Date in current month
  const dateInCurrentMonth = (day: number, startHour: number, durationHours: number = 2) => {
    const start = new Date(y, m, day, startHour, 0)
    const end = new Date(y, m, day, startHour + durationHours, 0)
    return {
      startTime: start.toISOString(),
      endTime: end.toISOString()
    }
  }

  // Helper to make Date in previous month
  const dateInPrevMonth = (day: number, startHour: number, durationHours: number = 2) => {
    const start = new Date(y, m - 1, day, startHour, 0)
    const end = new Date(y, m - 1, day, startHour + durationHours, 0)
    return {
      startTime: start.toISOString(),
      endTime: end.toISOString()
    }
  }

  // Helper to make Date in next month
  const dateInNextMonth = (day: number, startHour: number, durationHours: number = 2) => {
    const start = new Date(y, m + 1, day, startHour, 0)
    const end = new Date(y, m + 1, day, startHour + durationHours, 0)
    return {
      startTime: start.toISOString(),
      endTime: end.toISOString()
    }
  }

  const events: PersonalEvent[] = [
    // Current Month Events
    {
      id: "evt-curr-1",
      title: "Social cuối tuần",
      description: "Buổi giao lưu pickleball cuối tuần vui vẻ dành cho tất cả thành viên trong nhóm. Có nước uống miễn phí và bóng thi đấu tiêu chuẩn.",
      ...dateInCurrentMonth(10, 8, 3), // Day 10, 8:00 AM (3 hours)
      location: "Sân Pickleball Hoàng Nam, Quận 7, TP.HCM",
      status: "UPCOMING",
      type: "SOCIAL",
      participantsCount: 12,
      organizer: "Nguyễn Văn A"
    },
    {
      id: "evt-curr-2",
      title: "Social giao lưu trình độ 3.0+",
      description: "Yêu cầu DUPR từ 3.0 trở lên. Các trận đấu đôi kịch tính, ghép cặp ngẫu nhiên và tính điểm xếp hạng vui vẻ.",
      ...dateInCurrentMonth(12, 18, 2), // Day 12, 6:00 PM
      location: "Pickleball Club Bình Thạnh, TP.HCM",
      status: "IN_PROGRESS",
      type: "SOCIAL",
      participantsCount: 8,
      organizer: "Trần Thị B"
    },
    {
      id: "evt-curr-3",
      title: "Social tháng 6",
      description: "Sự kiện giao lưu thường kỳ hàng tháng. Đã tổng kết trao quà lưu niệm cho các người chơi xuất sắc nhất tháng.",
      ...dateInCurrentMonth(5, 14, 4), // Day 5, 2:00 PM
      location: "Sân Pickleball Kỳ Hòa, Quận 10, TP.HCM",
      status: "COMPLETED",
      type: "SOCIAL",
      participantsCount: 16,
      organizer: "Lê Hoàng C"
    },
    {
      id: "evt-curr-4",
      title: "Thuê sân tối thứ 7",
      description: "Buổi đặt sân tự luyện tập cùng các thành viên trong gia đình và bạn bè thân thiết.",
      ...dateInCurrentMonth(15, 20, 2), // Day 15, 8:00 PM
      location: "Trung tâm TDTT Phú Thọ - Sân số 4, Quận 11, TP.HCM",
      status: "UPCOMING",
      type: "BOOKING",
      participantsCount: 4,
      organizer: "Tôi (Cá nhân tự đặt)"
    },
    {
      id: "evt-curr-5",
      title: "Thuê sân luyện tập",
      description: "Luyện tập các kỹ thuật nâng cao: dink dọc dây, giao bóng xoáy và phản xạ lưới.",
      ...dateInCurrentMonth(3, 9, 2), // Day 3, 9:00 AM
      location: "Sân Pickleball Thảo Điền, Quận 2, TP.HCM",
      status: "COMPLETED",
      type: "BOOKING",
      participantsCount: 2,
      organizer: "Tôi (Cá nhân tự đặt)"
    },
    {
      id: "evt-curr-6",
      title: "Giải nội bộ CLB PickleHub",
      description: "Giải đấu nội bộ thường niên chia làm 2 bảng: Pro và Amateur. Cúp lưu niệm và phần thưởng hiện kim cho top 3 cặp đôi xuất sắc nhất.",
      ...dateInCurrentMonth(20, 7, 8), // Day 20, 7:00 AM (8 hours)
      location: "CLB Pickleball Sunrise, Nhà Bè, TP.HCM",
      status: "UPCOMING",
      type: "TOURNAMENT",
      participantsCount: 32,
      organizer: "Ban Quản Trị CLB PickleHub"
    },
    {
      id: "evt-curr-7",
      title: "Giải giao hữu hè 2026",
      description: "Giải đấu giao hữu giữa 4 CLB pickleball mạnh trong khu vực. Đã diễn ra thành công tốt đẹp.",
      ...dateInCurrentMonth(1, 8, 10), // Day 1, 8:00 AM (10 hours)
      location: "Sân Pickleball Lan Anh, Quận 3, TP.HCM",
      status: "COMPLETED",
      type: "TOURNAMENT",
      participantsCount: 24,
      organizer: "Liên đoàn Pickleball Sài Gòn"
    },
    
    // Add additional activities on Day 15 to trigger the "+X hoạt động khác" limit
    {
      id: "evt-curr-8",
      title: "Luyện dink bóng nâng cao",
      description: "Lớp học kèm riêng 1:1 với huấn luyện viên để cải thiện bộ chân di chuyển và dink bóng qua lưới.",
      ...dateInCurrentMonth(15, 16, 1), // Day 15, 4:00 PM
      location: "Sân Pickleball Hoàng Nam, Quận 7, TP.HCM",
      status: "UPCOMING",
      type: "BOOKING",
      participantsCount: 2,
      organizer: "HLV Phan Duy"
    },
    {
      id: "evt-curr-9",
      title: "Giao lưu đôi nam nữ",
      description: "Ghép cặp thi đấu giao lưu cọ sát học hỏi giữa các thành viên trung tuổi.",
      ...dateInCurrentMonth(15, 18, 2), // Day 15, 6:00 PM
      location: "Pickleball Club Bình Thạnh, TP.HCM",
      status: "UPCOMING",
      type: "SOCIAL",
      participantsCount: 8,
      organizer: "Trần Thị B"
    },

    // Previous Month Events (Completed)
    {
      id: "evt-prev-1",
      title: "Social chào hè tháng trước",
      description: "Buổi giao lưu mở đầu mùa hè sôi động với sự tham gia của đông đảo thành viên mới.",
      ...dateInPrevMonth(15, 17, 3), // Day 15 of last month
      location: "Sân Pickleball Thảo Điền, Quận 2, TP.HCM",
      status: "COMPLETED",
      type: "SOCIAL",
      participantsCount: 20,
      organizer: "Lê Hoàng C"
    },
    {
      id: "evt-prev-2",
      title: "Đặt sân tập cuối tuần",
      description: "Tập luyện cùng nhóm bạn thân thiết trước thềm giải đấu.",
      ...dateInPrevMonth(22, 19, 2), // Day 22 of last month
      location: "Trung tâm TDTT Phú Thọ - Sân số 2, Quận 11, TP.HCM",
      status: "COMPLETED",
      type: "BOOKING",
      participantsCount: 4,
      organizer: "Tôi (Cá nhân tự đặt)"
    },

    // Next Month Events (Upcoming)
    {
      id: "evt-next-1",
      title: "Social chào mừng Quốc khánh",
      description: "Giao lưu Pickleball đặc biệt mừng ngày nghỉ lễ lớn. Đăng ký sớm để nhận áo thun lưu niệm.",
      ...dateInNextMonth(2, 8, 4), // Day 2 of next month
      location: "CLB Pickleball Sunrise, Nhà Bè, TP.HCM",
      status: "UPCOMING",
      type: "SOCIAL",
      participantsCount: 40,
      organizer: "Ban Quản Trị CLB PickleHub"
    },
    {
      id: "evt-next-2",
      title: "Đặt sân tập kỹ thuật cơ bản",
      description: "Tập luyện nâng cao cơ bản cho thành viên mới tham gia câu lạc bộ.",
      ...dateInNextMonth(10, 18, 2), // Day 10 of next month
      location: "Sân Pickleball Kỳ Hòa, Quận 10, TP.HCM",
      status: "UPCOMING",
      type: "BOOKING",
      participantsCount: 4,
      organizer: "Tôi (Cá nhân tự đặt)"
    }
  ]

  return events
}
