# Mock Data Audit Report

## Legend
- **API**: Real backend API exists for this data
- **No API**: No backend API; component must use empty/loading states
- **Dead**: File exists but is not imported anywhere

---

## 1. Friends

| File | Feature | Current Source | Proposed Replacement | Risk |
|------|---------|---------------|---------------------|------|
| `src/features/friend/mock-data.ts` | Friends | Hardcoded `MOCK_USERS`, `TAB_TITLES`, `SORT_LABELS` | **Delete** — file is dead code (not imported by any component; real API used via `_data.ts` → `friend-service.ts` + `find-users.ts`) | Low |

**API exists**: `getFindUsers()`, `listFriends()`, `listIncomingRequests()`, `listOutgoingRequests()` in `friend-service.ts`

### Chat actions to remove
| File | What to remove |
|------|---------------|
| `src/app/(protected)/friend/FriendClient.tsx:464-467` | Chat button (`<MessageCircle>` + "Chat") in friends tab |
| `src/app/(protected)/friend/FriendClient.tsx:4` | `MessageCircle` import from `lucide-react` (if unused after removal) |

---

## 2. Groups

| File | Feature | Current Source | Proposed Replacement | Risk |
|------|---------|---------------|---------------------|------|
| `src/features/groups/mock-data/chat-messages.ts` | Group Chat | Hardcoded `mockGroupChatMessages` array | **Delete** — chat feature is being removed entirely | Low |

**API exists**: `getGroup()`, `getGroupMembers()`, `getGroupInvitations()`, etc. in `groups-service.ts` (but no chat API).

### Chat actions to remove
| File | What to remove |
|------|---------------|
| `src/features/groups/components/group-chat.tsx` | Entire `GroupChat` component |
| `src/features/groups/components/group-detail-tabs.tsx` | `"chat"` from `GroupDetailTabValue` union; remove `chat` prop from `GroupDetailTabsProps`; remove chat `TabsTrigger` + `TabsContent` |
| `src/features/groups/components/group-detail-panels.tsx` | Remove `GroupChat` import; remove chat panel JSX |
| `src/app/(protected)/groups/[groupId]/page.tsx:41` | Remove `view === "chat"` defaultTab logic |
| `src/app/(protected)/groups/[groupId]/chat/page.tsx` | Delete entire chat route page |

---

## 3. Coaches

| File | Feature | Current Source | Proposed Replacement | Risk |
|------|---------|---------------|---------------------|------|
| `src/features/coach/data/coach-mock-data.ts` | Coach (various) | `coachStats`, `upcomingSchedules`, `students`, `monthlyIncome`, `incomeTransactions`, `videoFeedbackSamples` | **Delete** — no imports found from this file. Types moved if needed. | Low |
| `src/features/coach/data/mockDashboard.ts` | Coach Dashboard | `dashboardStats`, `todaySchedule`, `quickActions` | **Delete** — remove imports from `CoachDashboardStats` and `CoachQuickSchedule`; use empty state | High |
| `src/features/coach/data/mockCoachProfile.ts` | Coach Profile | `CoachProfile`, `coachProfile`, `skillOptions` | **Delete** — remove imports from `CoachProfileForm`; initialize with empty state | High |
| `src/features/coach/data/mockRevenue.ts` | Coach Income | `revenuePoints`, `revenueTransactions` | **Delete** — remove imports from `CoachIncomeOverview`; use empty state | High |
| `src/features/coach/data/mockReviews.ts` | Coach Reviews | `CoachReview`, `coachReviews`, `recommendationTags` | **Delete** — remove imports from `CoachReviews` and `CoachRecommendation`; use empty state | High |
| `src/features/coach/data/mockSchedule.ts` | Coach Schedule | `ScheduleBlock`, `ScheduleView`, `scheduleBlocks`, `weekDays`, `daySlots` | **Delete** — remove imports from `CoachWeekSchedule`; use empty state | High |
| `src/features/coach/data/mockStudents.ts` | Coach Students | `StudentRecord`, `StudentProfile`, `StudentLessonHistoryItem`, `StudentProgressSkill`, `students`, `studentProfiles` | **Delete** — `StudentRecord` type moved to component; remove imports from `CoachStudentsTable` and `coach-learner-relationship.ts` | High |
| `src/features/coach/data/coach-learner-relationship.ts` | Coach-Student mapping | `coachLearnerMapping` (hardcoded), imports from `coach-mock-data`, `mockStudents`, `learner-mock-data` | **Delete** — remove file with all dependent imports | High |

**No dedicated API** — Coach feature has no backend client. Components will show empty states.

### Components affected
| Component | File | Change |
|-----------|------|--------|
| `CoachDashboardStats` | `coach-dashboard-stats.tsx` | Remove mock imports; show empty state |
| `CoachProfileForm` | `coach-profile-form.tsx` | Remove mock imports; init with empty state |
| `CoachStudentsTable` | `coach-students-table.tsx` | Remove `StudentLevel`/`StudentRecord` type import from mock; define locally |
| `CoachWeekSchedule` | `coach-week-schedule.tsx` | Remove mock imports; init with empty array |
| `CoachIncomeOverview` | `coach-income-overview.tsx` | Remove mock imports; show empty state |
| `CoachReviews` | `coach-reviews.tsx` | Remove mock imports; show empty state |
| `CoachRecommendation` | `coach-recommendation.tsx` | Remove mock imports; show empty state |
| `CoachQuickSchedule` | `coach-quick-schedule.tsx` | Remove mock type import; define locally |
| `CoachDetailTabs` | `coach-detail-tabs.tsx` | Remove `students` import from `mockStudents` and `getCoachStudents`; pass empty array |
| `CoachStudentsPage` | `coach/students/page.tsx` | Remove `students` import; pass empty array |
| `CoachSchedulePage` | `coach/schedule/page.tsx` | No direct mock import (indirect via component) |
| `CoachIncomePage` | `coach/income/page.tsx` | No direct mock import (indirect via component) |
| `CoachProfilePage` | `coach/profile/page.tsx` | No direct mock import (indirect via component) |

---

## 4. Learners

| File | Feature | Current Source | Proposed Replacement | Risk |
|------|---------|---------------|---------------------|------|
| `src/features/learner/data/learner-mock-data.ts` | Learner (all) | `learnerProfile`, `learnerSchedules`, `learnerPayments`, `coachList`, `learnerCoachRegistrations`, `weekDays`, `daySlots`, helper functions | **Delete** — components must use empty state or props | High |

**No dedicated API** — Learner feature has no backend client. Components will show empty states.

### Components affected
| Component | File | Change |
|-----------|------|--------|
| `LearnerOverview` | `learner-overview.tsx` | Remove mock imports; show empty state |
| `LearnerProfile` | `learner-profile.tsx` | Remove mock imports; show empty state |
| `LearnerSchedule` | `learner-schedule.tsx` | Remove mock imports; show empty state |
| `LearnerPayments` | `learner-payments.tsx` | Remove mock imports; show empty state |
| `LearnerCoachDiscovery` | `learner-coach-discovery.tsx` | Remove mock imports; show empty state |

---

## 5. Home

| File | Feature | Current Source | Proposed Replacement | Risk |
|------|---------|---------------|---------------------|------|
| `src/app/(protected)/home/page.tsx` (lines 10-40) | Home Dashboard | Inline `mockGroups` and `mockPendingInvites` arrays | **Replace** with real API calls: `getMyGroups()` from `groups-service.ts` and use the group data already available | Medium |

**API exists**: `getMyGroups()` in `groups-service.ts` returns `Group[]`

---

## 6. Notifications / Feed

| File | Feature | Current Source | Proposed Replacement | Risk |
|------|---------|---------------|---------------------|------|
| `src/features/feed/mock-data/feed-notifications.ts` | Feed/Notifications | Hardcoded `feedNotifications` array with 10 mock items | **Delete** — initial atom value replaced with `[]`; real data loaded via `fetchMyNotifications()` | Medium |
| `src/features/feed/store/feed-store.ts` | Feed store | Initializes `notificationFeedAtom` with `feedNotifications` from mock | **Replace** with `[]` empty array | Medium |

**API exists**: `fetchMyNotifications()` in `user-notifications.ts` hits `/api/notification`

---

## 7. My Calendar

| File | Feature | Current Source | Proposed Replacement | Risk |
|------|---------|---------------|---------------------|------|
| `src/features/personal-calendar/personal-calendar.mock.ts` | Personal Calendar | `getMockPersonalEvents()` returning 12 mock events | **Delete** — dead code (not imported by any component; real API via `useMyCalendar()`) | Low |

**API exists**: `getMyCalendar()` in `calendar-client.ts` hits `/api/users/me/calendar`

---

## Summary

| Feature | Mock Files | API Exists | Risk |
|---------|-----------|------------|------|
| Friends | 1 (dead) | ✅ Yes | Low |
| Groups | 1 (chat) | ✅ Yes (no chat API) | Low |
| Coaches | 8 | ❌ No | High |
| Learners | 1 | ❌ No | High |
| Home | Inline | ✅ Yes | Medium |
| Notifications | 1 | ✅ Yes | Medium |
| My Calendar | 1 (dead) | ✅ Yes | Low |

**Total mock files to delete**: 13  
**Components to update**: 20+  
**Chat actions to remove**: 6 locations  
**Files to delete (dead code)**: `friend/mock-data.ts`, `personal-calendar.mock.ts`
