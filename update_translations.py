import json

def update_json(file_path, tournament_data):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if 'tournament' not in data:
        data['tournament'] = {}
    
    # deep merge for tournament object
    def merge(dict1, dict2):
        for k, v in dict2.items():
            if k in dict1 and isinstance(dict1[k], dict) and isinstance(v, dict):
                merge(dict1[k], v)
            else:
                dict1[k] = v
                
    merge(data['tournament'], tournament_data)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

en_data = {
  "manager": {
    "title": "Pickleball Tournament Manager",
    "subtitle": "San Diego Summer Slam 2026",
    "allTournaments": "All Tournaments",
    "tabs": {
      "dashboard": "Dashboard",
      "events": "Events",
      "registrations": "Registrations",
      "teamMatching": "Team Matching",
      "seeding": "Seeding",
      "brackets": "Brackets",
      "schedule": "Schedule",
      "live": "Live",
      "financials": "Financials",
      "public": "Public View"
    }
  },
  "dashboard": {
    "title": "Tournament Dashboard",
    "subtitle": "San Diego Summer Slam 2026 • June 15-17, 2026",
    "registrationProgress": "Registration Progress",
    "full": "Full",
    "tournamentLifecycle": "Tournament Lifecycle",
    "upcomingMatches": "Upcoming Matches",
    "vs": "vs",
    "live": "Live",
    "recentActivities": "Recent Activities",
    "lifecycle": {
      "registration": "Registration",
      "seedingAndScheduling": "Seeding & Scheduling",
      "inProgress": "Tournament In Progress",
      "finalsAndAwards": "Finals & Awards",
      "postEventReports": "Post-Event Reports"
    }
  },
  "list": {
    "title": "Tournaments",
    "subtitle": "Manage and organize pickleball tournaments",
    "createTournament": "Create Tournament",
    "searchPlaceholder": "Search tournaments...",
    "statuses": {
      "all": "All Statuses",
      "draft": "Draft",
      "published": "Published",
      "open_registration": "Open Registration",
      "in_progress": "In Progress",
      "completed": "Completed"
    },
    "registered": "{{count}}/{{capacity}} registered"
  },
  "create": {
    "back": "Back to Tournaments",
    "title": "Create Tournament",
    "subtitle": "Set up a new pickleball tournament",
    "steps": {
      "basicInfo": "Basic Information",
      "registration": "Registration Settings",
      "financial": "Financial Settings",
      "prizes": "Prize Structure",
      "review": "Review & Publish"
    },
    "buttons": {
      "previous": "Previous",
      "next": "Next Step",
      "publish": "Publish Tournament"
    },
    "step1": {
      "nameLabel": "Tournament Name *",
      "namePlaceholder": "e.g., San Diego Summer Slam 2026",
      "descriptionLabel": "Description",
      "descriptionPlaceholder": "Describe your tournament...",
      "bannerLabel": "Tournament Banner",
      "bannerUploadHint": "Click to upload or drag and drop",
      "bannerSizeHint": "PNG, JPG up to 5MB",
      "venueLabel": "Venue *",
      "venuePlaceholder": "e.g., Balboa Park Tennis & Pickleball Center",
      "startDateLabel": "Start Date *",
      "endDateLabel": "End Date *"
    },
    "step2": {
      "regOpenLabel": "Registration Opens *",
      "regCloseLabel": "Registration Closes *",
      "maxParticipantsLabel": "Maximum Participants",
      "enableWaitlist": "Enable Waitlist",
      "enableWaitlistDesc": "Allow players to join waitlist when tournament is full",
      "requirePartner": "Require Partner Registration",
      "requirePartnerDesc": "Require doubles players to register with a partner"
    },
    "step3": {
      "entryFeeLabel": "Entry Fee *",
      "currencyLabel": "Currency",
      "currencies": {
        "usd": "USD ($)",
        "cad": "CAD ($)",
        "eur": "EUR (€)"
      },
      "refundPolicyLabel": "Refund Policy",
      "refundPolicies": {
        "full": "Full refund before registration closes",
        "partial": "50% refund before registration closes",
        "none": "No refunds"
      },
      "lateFeeLabel": "Late Registration Fee (Optional)"
    },
    "step4": {
      "championLabel": "Champion Prize ($)",
      "runnerUpLabel": "Runner-up Prize ($)",
      "thirdPrizeLabel": "Third Place Prize ($)",
      "prizeHint": "💡 Prize amounts can be customized per event after tournament creation"
    },
    "step5": {
      "summaryTitle": "Tournament Summary",
      "name": "Tournament Name",
      "venue": "Venue",
      "dates": "Dates",
      "maxParticipants": "Max Participants",
      "entryFee": "Entry Fee",
      "championPrize": "Champion Prize",
      "reviewHint": "✓ Review all details carefully. You can edit these settings after publishing."
    }
  }
}

vi_data = {
  "manager": {
    "title": "Quản lý Giải đấu Pickleball",
    "subtitle": "San Diego Summer Slam 2026",
    "allTournaments": "Tất cả giải đấu",
    "tabs": {
      "dashboard": "Tổng quan",
      "events": "Sự kiện",
      "registrations": "Đăng ký",
      "teamMatching": "Ghép đội",
      "seeding": "Hạt giống",
      "brackets": "Nhánh đấu",
      "schedule": "Lịch thi đấu",
      "live": "Trực tiếp",
      "financials": "Tài chính",
      "public": "Chế độ xem công khai"
    }
  },
  "dashboard": {
    "title": "Tổng quan Giải đấu",
    "subtitle": "San Diego Summer Slam 2026 • 15-17 tháng 6, 2026",
    "registrationProgress": "Tiến độ đăng ký",
    "full": "Đầy",
    "tournamentLifecycle": "Vòng đời giải đấu",
    "upcomingMatches": "Các trận sắp tới",
    "vs": "vs",
    "live": "Trực tiếp",
    "recentActivities": "Hoạt động gần đây",
    "lifecycle": {
      "registration": "Đăng ký",
      "seedingAndScheduling": "Hạt giống & Lên lịch",
      "inProgress": "Giải đấu đang diễn ra",
      "finalsAndAwards": "Chung kết & Trao giải",
      "postEventReports": "Báo cáo sau sự kiện"
    }
  },
  "list": {
    "title": "Các Giải đấu",
    "subtitle": "Quản lý và tổ chức các giải đấu pickleball",
    "createTournament": "Tạo giải đấu",
    "searchPlaceholder": "Tìm kiếm giải đấu...",
    "statuses": {
      "all": "Tất cả trạng thái",
      "draft": "Bản nháp",
      "published": "Đã công bố",
      "open_registration": "Mở đăng ký",
      "in_progress": "Đang diễn ra",
      "completed": "Đã hoàn thành"
    },
    "registered": "{{count}}/{{capacity}} người đã đăng ký"
  },
  "create": {
    "back": "Quay lại danh sách",
    "title": "Tạo Giải đấu",
    "subtitle": "Thiết lập một giải đấu pickleball mới",
    "steps": {
      "basicInfo": "Thông tin cơ bản",
      "registration": "Cài đặt đăng ký",
      "financial": "Cài đặt tài chính",
      "prizes": "Cơ cấu giải thưởng",
      "review": "Đánh giá & Xuất bản"
    },
    "buttons": {
      "previous": "Trước",
      "next": "Bước tiếp theo",
      "publish": "Xuất bản giải đấu"
    },
    "step1": {
      "nameLabel": "Tên giải đấu *",
      "namePlaceholder": "vd: San Diego Summer Slam 2026",
      "descriptionLabel": "Mô tả",
      "descriptionPlaceholder": "Mô tả giải đấu của bạn...",
      "bannerLabel": "Ảnh bìa giải đấu",
      "bannerUploadHint": "Nhấp để tải lên hoặc kéo thả",
      "bannerSizeHint": "PNG, JPG tối đa 5MB",
      "venueLabel": "Địa điểm *",
      "venuePlaceholder": "vd: Balboa Park Tennis & Pickleball Center",
      "startDateLabel": "Ngày bắt đầu *",
      "endDateLabel": "Ngày kết thúc *"
    },
    "step2": {
      "regOpenLabel": "Mở đăng ký *",
      "regCloseLabel": "Đóng đăng ký *",
      "maxParticipantsLabel": "Số lượng tối đa",
      "enableWaitlist": "Cho phép danh sách chờ",
      "enableWaitlistDesc": "Cho phép người chơi tham gia danh sách chờ khi giải đấu đầy",
      "requirePartner": "Yêu cầu đăng ký theo cặp",
      "requirePartnerDesc": "Yêu cầu người chơi đôi phải đăng ký cùng với bạn đánh"
    },
    "step3": {
      "entryFeeLabel": "Phí tham gia *",
      "currencyLabel": "Tiền tệ",
      "currencies": {
        "usd": "USD ($)",
        "cad": "CAD ($)",
        "eur": "EUR (€)"
      },
      "refundPolicyLabel": "Chính sách hoàn tiền",
      "refundPolicies": {
        "full": "Hoàn tiền 100% trước khi đóng đăng ký",
        "partial": "Hoàn tiền 50% trước khi đóng đăng ký",
        "none": "Không hoàn tiền"
      },
      "lateFeeLabel": "Phí đăng ký muộn (Tùy chọn)"
    },
    "step4": {
      "championLabel": "Giải Nhất ($)",
      "runnerUpLabel": "Giải Nhì ($)",
      "thirdPrizeLabel": "Giải Ba ($)",
      "prizeHint": "💡 Số tiền thưởng có thể được tùy chỉnh cho từng sự kiện sau khi tạo giải đấu"
    },
    "step5": {
      "summaryTitle": "Tóm tắt giải đấu",
      "name": "Tên giải đấu",
      "venue": "Địa điểm",
      "dates": "Ngày diễn ra",
      "maxParticipants": "Số người tham gia tối đa",
      "entryFee": "Phí tham gia",
      "championPrize": "Giải Nhất",
      "reviewHint": "✓ Kiểm tra kỹ tất cả chi tiết. Bạn có thể chỉnh sửa các cài đặt này sau khi xuất bản."
    }
  }
}

update_json('src/i18n/locales/en/common.json', en_data)
update_json('src/i18n/locales/vi/common.json', vi_data)
