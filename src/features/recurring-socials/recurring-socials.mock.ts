import type {
  Court,
  RecurringSocialTemplate,
  SchedulePreview,
} from "./recurring-socials.types"

export const MOCK_COURTS: Court[] = [
  {
    id: "1",
    name: "Sân 1 - Tân Phú",
    labelKey: "recurringSocials.courts.tanPhu1",
    capacity: 8,
  },
  {
    id: "2",
    name: "Sân 2 - Tân Phú",
    labelKey: "recurringSocials.courts.tanPhu2",
    capacity: 8,
  },
  {
    id: "3",
    name: "Sân 3 - Tân Phú",
    labelKey: "recurringSocials.courts.tanPhu3",
    capacity: 8,
  },
  {
    id: "4",
    name: "Sân 1 - Quận 7",
    labelKey: "recurringSocials.courts.quan7_1",
    capacity: 8,
  },
  {
    id: "5",
    name: "Sân 2 - Quận 7",
    labelKey: "recurringSocials.courts.quan7_2",
    capacity: 8,
  },
  {
    id: "6",
    name: "Sân 1 - Biên Hòa",
    labelKey: "recurringSocials.courts.bienHoa1",
    capacity: 8,
  },
]

export const MOCK_RECURRING_SOCIALS: RecurringSocialTemplate[] = [
  {
    id: "rs-001",
    name: "Saturday Morning Social",
    nameKey: "recurringSocials.mock.socials.saturdayMorningSocial",
    description: "Buổi Social pickleball vào sáng thứ 7 hàng tuần",
    socialType: "beginner",
    skillLevel: "3.0-3.5",
    startTime: "08:00",
    endTime: "10:00",
    courts: [MOCK_COURTS[0], MOCK_COURTS[1]],
    maxParticipants: 16,
    maxPerCourt: 8,
    maxWaitlist: 5,
    fee: 150000,
    courtRentFee: 200000,
    costNote: "Giá bao gồm đồ uống nhẹ",
    recurrenceType: "weekly",
    daysOfWeek: ["saturday"],
    startDate: "2026-06-06",
    endDate: "2026-12-31",
    status: "active",
    createdBy: "Admin User",
    createdAt: "2026-05-16T10:00:00Z",
    updatedAt: "2026-05-16T10:00:00Z",
  },
  {
    id: "rs-002",
    name: "Mid-Week Evening Social",
    nameKey: "recurringSocials.mock.socials.midWeekEveningSocial",
    description: "Buổi Social vào tối thứ 4 và thứ 5",
    socialType: "intermediate",
    skillLevel: "3.5-4.0",
    startTime: "18:00",
    endTime: "20:00",
    courts: [MOCK_COURTS[3]],
    maxParticipants: 8,
    maxPerCourt: 8,
    maxWaitlist: 3,
    fee: 120000,
    courtRentFee: 150000,
    costNote: "Bao gồm nước uống",
    recurrenceType: "weekly",
    daysOfWeek: ["wednesday", "friday"],
    startDate: "2026-05-20",
    endDate: "2026-12-31",
    status: "active",
    createdBy: "Coach John",
    createdAt: "2026-05-01T14:30:00Z",
    updatedAt: "2026-05-15T09:15:00Z",
  },
  {
    id: "rs-003",
    name: "Monthly Championship",
    nameKey: "recurringSocials.mock.socials.monthlyChampionship",
    description: "Giải đấu hàng tháng vào ngày 15",
    socialType: "competitive",
    skillLevel: "4.0+",
    startTime: "14:00",
    endTime: "18:00",
    courts: [MOCK_COURTS[0], MOCK_COURTS[1], MOCK_COURTS[2]],
    maxParticipants: 32,
    maxPerCourt: 8,
    maxWaitlist: 10,
    fee: 300000,
    courtRentFee: 500000,
    costNote: "Bao gồm quả bóng và giải thưởng",
    recurrenceType: "monthly",
    dayOfMonth: 15,
    startDate: "2026-06-15",
    endDate: "2027-12-31",
    status: "paused",
    createdBy: "Event Manager",
    createdAt: "2026-04-10T11:00:00Z",
    updatedAt: "2026-05-16T08:45:00Z",
  },
  {
    id: "rs-004",
    name: "Quarterly League",
    nameKey: "recurringSocials.mock.socials.quarterlyLeague",
    description: "Giải đấu định kỳ hàng quý",
    socialType: "league",
    skillLevel: "3.5-4.5",
    startTime: "09:00",
    endTime: "17:00",
    courts: [MOCK_COURTS[0], MOCK_COURTS[1], MOCK_COURTS[2], MOCK_COURTS[3]],
    maxParticipants: 64,
    maxPerCourt: 8,
    maxWaitlist: 20,
    fee: 500000,
    courtRentFee: 1000000,
    costNote: "Bao gồm cả ngày chơi, lunch và giải thưởng",
    recurrenceType: "quarterly",
    quarterStartMonth: 1,
    quarterDay: 20,
    startDate: "2026-01-20",
    endDate: "2027-12-20",
    status: "active",
    createdBy: "Director",
    createdAt: "2026-01-05T10:00:00Z",
    updatedAt: "2026-05-10T13:20:00Z",
  },
]

export const MOCK_SCHEDULE_PREVIEW: SchedulePreview[] = [
  {
    date: "2026-06-06",
    dayName: "Saturday",
    startTime: "08:00",
    endTime: "10:00",
    courts: 2,
    totalCapacity: 16,
  },
  {
    date: "2026-06-13",
    dayName: "Saturday",
    startTime: "08:00",
    endTime: "10:00",
    courts: 2,
    totalCapacity: 16,
  },
  {
    date: "2026-06-20",
    dayName: "Saturday",
    startTime: "08:00",
    endTime: "10:00",
    courts: 2,
    totalCapacity: 16,
  },
  {
    date: "2026-06-27",
    dayName: "Saturday",
    startTime: "08:00",
    endTime: "10:00",
    courts: 2,
    totalCapacity: 16,
  },
  {
    date: "2026-07-04",
    dayName: "Saturday",
    startTime: "08:00",
    endTime: "10:00",
    courts: 2,
    totalCapacity: 16,
  },
]

// Social type options
export const SOCIAL_TYPES = [
  { value: "beginner", labelKey: "recurringSocials.form.socialTypes.beginner" },
  {
    value: "intermediate",
    labelKey: "recurringSocials.form.socialTypes.intermediate",
  },
  { value: "advanced", labelKey: "recurringSocials.form.socialTypes.advanced" },
  {
    value: "competitive",
    labelKey: "recurringSocials.form.socialTypes.competitive",
  },
  { value: "league", labelKey: "recurringSocials.form.socialTypes.league" },
  { value: "social", labelKey: "recurringSocials.form.socialTypes.social" },
]

// Skill level options
export const SKILL_LEVELS = [
  { value: "2.5", labelKey: "recurringSocials.form.skillLevels.level_25" },
  { value: "3.0", labelKey: "recurringSocials.form.skillLevels.level_30" },
  {
    value: "3.0-3.5",
    labelKey: "recurringSocials.form.skillLevels.level_30_35",
  },
  { value: "3.5", labelKey: "recurringSocials.form.skillLevels.level_35" },
  {
    value: "3.5-4.0",
    labelKey: "recurringSocials.form.skillLevels.level_35_40",
  },
  { value: "4.0", labelKey: "recurringSocials.form.skillLevels.level_40" },
  {
    value: "4.0+",
    labelKey: "recurringSocials.form.skillLevels.level_40_plus",
  },
  { value: "mixed", labelKey: "recurringSocials.form.skillLevels.mixed" },
]

// Days of week
export const DAYS_OF_WEEK = [
  { value: "monday", labelKey: "recurringSocials.form.weekdays.monday" },
  { value: "tuesday", labelKey: "recurringSocials.form.weekdays.tuesday" },
  { value: "wednesday", labelKey: "recurringSocials.form.weekdays.wednesday" },
  { value: "thursday", labelKey: "recurringSocials.form.weekdays.thursday" },
  { value: "friday", labelKey: "recurringSocials.form.weekdays.friday" },
  { value: "saturday", labelKey: "recurringSocials.form.weekdays.saturday" },
  { value: "sunday", labelKey: "recurringSocials.form.weekdays.sunday" },
]

// Month positions (for "first Saturday of month" pattern)
export const MONTH_POSITIONS = [
  { value: "first", labelKey: "recurringSocials.form.monthPositions.first" },
  { value: "second", labelKey: "recurringSocials.form.monthPositions.second" },
  { value: "third", labelKey: "recurringSocials.form.monthPositions.third" },
  { value: "fourth", labelKey: "recurringSocials.form.monthPositions.fourth" },
  { value: "last", labelKey: "recurringSocials.form.monthPositions.last" },
]

// Quarters
export const QUARTERS = [
  { value: 1, labelKey: "recurringSocials.form.quarters.q1" },
  { value: 4, labelKey: "recurringSocials.form.quarters.q2" },
  { value: 7, labelKey: "recurringSocials.form.quarters.q3" },
  { value: 10, labelKey: "recurringSocials.form.quarters.q4" },
]
