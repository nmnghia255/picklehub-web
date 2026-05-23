import type {
  GroupActivityGroup,
  GroupEvent,
  GroupMember,
  Venue,
} from "./group-activity-schedule.types"

const now = new Date()

function toIso(date: Date) {
  return date.toISOString()
}

function withTime(baseDate: Date, hour: number, minute: number) {
  const date = new Date(baseDate)
  date.setHours(hour, minute, 0, 0)
  return date
}

function dayOffset(offset: number) {
  const date = new Date(now)
  date.setDate(now.getDate() + offset)
  return date
}

export const MOCK_GROUPS: GroupActivityGroup[] = [
  {
    id: "group-weekend",
    name: "Pickleball Weekend Team",
    description:
      "Nhóm chơi cuối tuần, social nhẹ và giao lưu theo trình độ trung bình khá.",
    avatarFallback: "WT",
    memberCount: 6,
  },
  {
    id: "group-sunrise",
    name: "Sunrise Pickleball Club",
    description:
      "Nhóm thi đấu và social tại Sunrise, thiên về luyện kỹ thuật và mini tournament.",
    avatarFallback: "SC",
    memberCount: 5,
  },
  {
    id: "group-riverside",
    name: "Riverside Social Squad",
    description:
      "Nhóm giao lưu thân thiện, ưu tiên thuê sân và meetup chia sẻ chiến thuật.",
    avatarFallback: "RS",
    memberCount: 4,
  },
]

export const MOCK_MEMBERS: GroupMember[] = [
  {
    id: "m-01",
    groupId: "group-weekend",
    name: "Nguyen Quang Huy",
    email: "huy.nguyen@picklehub.vn",
    phone: "0902 123 456",
    level: "3.5",
    avatarFallback: "NH",
  },
  {
    id: "m-02",
    groupId: "group-weekend",
    name: "Tran Minh Anh",
    email: "anh.tran@picklehub.vn",
    phone: "0903 987 654",
    level: "3.0",
    avatarFallback: "TA",
  },
  {
    id: "m-03",
    groupId: "group-weekend",
    name: "Le Bao Chau",
    email: "chau.le@picklehub.vn",
    phone: "0911 200 800",
    level: "4.0",
    avatarFallback: "LC",
  },
  {
    id: "m-04",
    groupId: "group-sunrise",
    name: "Pham Duc Long",
    email: "long.pham@picklehub.vn",
    phone: "0988 500 600",
    level: "3.8",
    avatarFallback: "PL",
  },
  {
    id: "m-05",
    groupId: "group-sunrise",
    name: "Vo Thao Nhi",
    email: "nhi.vo@picklehub.vn",
    phone: "0934 010 203",
    level: "2.8",
    avatarFallback: "VN",
  },
  {
    id: "m-06",
    groupId: "group-riverside",
    name: "Dang Gia Bao",
    email: "bao.dang@picklehub.vn",
    phone: "0972 801 999",
    level: "3.2",
    avatarFallback: "DB",
  },
  {
    id: "m-07",
    groupId: "group-riverside",
    name: "Doan Phuong Linh",
    email: "linh.doan@picklehub.vn",
    phone: "0964 111 555",
    level: "3.1",
    avatarFallback: "DL",
  },
  {
    id: "m-08",
    groupId: "group-riverside",
    name: "Hoang Minh Khoa",
    email: "khoa.hoang@picklehub.vn",
    phone: "0908 009 909",
    level: "3.6",
    avatarFallback: "HK",
  },
]

export const MOCK_VENUES: Venue[] = [
  {
    id: "v-01",
    groupId: "group-weekend",
    name: "PickleHub Arena Quận 7",
    shortLabel: "Arena Q7",
    address: "12 Nguyen Luong Bang, Quan 7, TP.HCM",
  },
  {
    id: "v-02",
    groupId: "group-weekend",
    name: "The Smash Yard Thao Dien",
    shortLabel: "Smash Yard",
    address: "45 Quoc Huong, Thao Dien, TP. Thu Duc",
  },
  {
    id: "v-03",
    groupId: "group-sunrise",
    name: "Sunrise Pickleball Club",
    shortLabel: "Sunrise Club",
    address: "108 Tran Nao, An Khanh, TP. Thu Duc",
  },
  {
    id: "v-04",
    groupId: "group-sunrise",
    name: "Sân giao lưu Riverside",
    shortLabel: "Riverside",
    address: "25 Vo Van Kiet, Quan 1, TP.HCM",
  },
  {
    id: "v-05",
    groupId: "group-riverside",
    name: "Riverside Court Center",
    shortLabel: "Riverside Court",
    address: "88 Vo Van Kiet, Quan 5, TP.HCM",
  },
  {
    id: "v-06",
    groupId: "group-riverside",
    name: "Binh Thanh Match Point",
    shortLabel: "Match Point",
    address: "210 Nguyen Huu Canh, Binh Thanh, TP.HCM",
  },
]

export const MOCK_EVENTS: GroupEvent[] = [
  {
    id: "e-01",
    groupId: "group-weekend",
    groupName: "Pickleball Weekend Team",
    title: "Buoi choi toi Thu 5",
    activityType: "CHOI_THUONG",
    status: "SAP_DIEN_RA",
    startAt: toIso(withTime(dayOffset(1), 19, 0)),
    endAt: toIso(withTime(dayOffset(1), 21, 0)),
    venueId: "v-01",
    description:
      "Buoi choi dinh ky cho thanh vien trong nhom, tap trung danh doi co ban.",
    createdById: "m-01",
    participantIds: ["m-01", "m-02", "m-03"],
    createdAt: toIso(withTime(dayOffset(-4), 9, 15)),
    updatedAt: toIso(withTime(dayOffset(-1), 10, 0)),
    updatedById: "m-01",
  },
  {
    id: "e-02",
    groupId: "group-weekend",
    groupName: "Pickleball Weekend Team",
    title: "Social cuoi tuan tai Thao Dien",
    activityType: "SOCIAL",
    status: "SAP_DIEN_RA",
    startAt: toIso(withTime(dayOffset(3), 8, 0)),
    endAt: toIso(withTime(dayOffset(3), 11, 0)),
    venueId: "v-02",
    description:
      "Social mo rong cho ban be va thanh vien moi, co mini game giao luu.",
    createdById: "m-03",
    participantIds: ["m-01", "m-02", "m-03"],
    createdAt: toIso(withTime(dayOffset(-7), 15, 30)),
    updatedAt: toIso(withTime(dayOffset(-2), 20, 10)),
    updatedById: "m-03",
  },
  {
    id: "e-03",
    groupId: "group-weekend",
    groupName: "Pickleball Weekend Team",
    title: "Giai dau noi bo thang nay",
    activityType: "GIAI_DAU",
    status: "SAP_DIEN_RA",
    startAt: toIso(withTime(dayOffset(8), 7, 30)),
    endAt: toIso(withTime(dayOffset(8), 12, 30)),
    venueId: "v-01",
    description:
      "Giai dau noi bo theo bang dau 8 doi, co tong ket va trao giai nho.",
    createdById: "m-02",
    participantIds: ["m-01", "m-02", "m-03"],
    createdAt: toIso(withTime(dayOffset(-10), 13, 0)),
    updatedAt: toIso(withTime(dayOffset(-1), 8, 45)),
    updatedById: "m-02",
  },
  {
    id: "e-04",
    groupId: "group-sunrise",
    groupName: "Sunrise Pickleball Club",
    title: "Thue san giao luu lien nhom",
    activityType: "THUE_SAN_GIAO_LUU",
    status: "DANG_DIEN_RA",
    startAt: toIso(withTime(dayOffset(0), 18, 0)),
    endAt: toIso(withTime(dayOffset(0), 20, 0)),
    venueId: "v-03",
    description:
      "Tran giao luu lien nhom 12 nguoi, uu tien danh cap doi trung binh kha.",
    createdById: "m-04",
    participantIds: ["m-04", "m-05"],
    createdAt: toIso(withTime(dayOffset(-2), 11, 30)),
    updatedAt: toIso(withTime(dayOffset(0), 12, 15)),
    updatedById: "m-04",
  },
  {
    id: "e-05",
    groupId: "group-sunrise",
    groupName: "Sunrise Pickleball Club",
    title: "Meetup chia se chien thuat",
    activityType: "MEETUP",
    status: "DA_KET_THUC",
    startAt: toIso(withTime(dayOffset(-3), 20, 0)),
    endAt: toIso(withTime(dayOffset(-3), 21, 30)),
    venueId: "v-04",
    description:
      "Gap mat trao doi chien thuat danh doi va tong hop kinh nghiem thi dau.",
    createdById: "m-05",
    participantIds: ["m-04", "m-05"],
    createdAt: toIso(withTime(dayOffset(-9), 9, 0)),
    updatedAt: toIso(withTime(dayOffset(-3), 22, 0)),
    updatedById: "m-05",
  },
  {
    id: "e-06",
    groupId: "group-riverside",
    groupName: "Riverside Social Squad",
    title: "Social toi thu 7",
    activityType: "SOCIAL",
    status: "DA_HUY",
    startAt: toIso(withTime(dayOffset(6), 19, 30)),
    endAt: toIso(withTime(dayOffset(6), 22, 0)),
    venueId: "v-05",
    description:
      "Buoi social toi bi huy do trung lich giai phong trao khu vuc.",
    createdById: "m-06",
    participantIds: ["m-06", "m-07"],
    createdAt: toIso(withTime(dayOffset(-5), 18, 10)),
    updatedAt: toIso(withTime(dayOffset(-1), 16, 20)),
    updatedById: "m-06",
  },
  {
    id: "e-07",
    groupId: "group-riverside",
    groupName: "Riverside Social Squad",
    title: "Buoi choi giao luu buoi sang",
    activityType: "CHOI_THUONG",
    status: "SAP_DIEN_RA",
    startAt: toIso(withTime(dayOffset(4), 7, 0)),
    endAt: toIso(withTime(dayOffset(4), 9, 0)),
    venueId: "v-06",
    description:
      "Buoi choi nhe cho thanh vien Riverside, uu tien gap mat va khop doi.",
    createdById: "m-07",
    participantIds: ["m-06", "m-07", "m-08"],
    createdAt: toIso(withTime(dayOffset(-1), 10, 0)),
    updatedAt: toIso(withTime(dayOffset(0), 8, 20)),
    updatedById: "m-07",
  },
]
