# I18n Audit Report

**Generated:** 2026-07-07  
**Scope:** Full codebase scan — `src/app`, `src/features`, `src/components`, `src/hooks`, `src/lib`, `src/i18n`  
**Languages:** English (`en`), Vietnamese (`vi`)  
**i18n Framework:** react-i18next via i18next  
**Namespaces:** `common`, `profile`, `sport-center`, `sport-center-management`, `subscriptions`, `socials`, `tournament`

---

## Summary

| Feature / Module | Status | Est. Missing Strings |
|---|---|---|
| Authentication / Auth | ❌ Not localized | ~153 |
| Coach | ❌ Not localized | ~600+ |
| Groups | ❌ Not localized | ~600+ |
| Feed / Notifications | ❌ Not localized | ~80+ |
| Learner | ❌ Not localized | ~150 |
| Notifications (Group) | ❌ Not localized | ~35 |
| Recurring Socials | ❌ Not localized | ~120+ |
| Sport Center Management (most sub-features) | ❌ Not localized | ~400+ |
| Landing Pages | ❌ Not localized | ~50 |
| Dashboard Components | ❌ Not localized | ~30 |
| Personal Calendar | ❌ Not localized | ~50 |
| Settings | ❌ Not localized | ~25 |
| Booking Detail | ❌ Not localized | ~25 |
| Invitation Accept | ❌ Not localized | ~8 |
| Shared Components (error-state, back-navigation) | ❌ Not localized | ~5 |
| Friends | ⚠️ Partially localized | ~3 (+ API defaults) |
| Socials | ⚠️ Partially localized | ~30 |
| Tournaments | ⚠️ Partially localized | ~15 |
| Sport Center (listing, detail, booking) | ⚠️ Partially localized | ~10 |
| Profile | ✅ Fully localized | ~8 (minor) |
| Score | ✅ Fully localized | ~2 (minor) |
| Subscriptions | ✅ Fully localized | ~1 (minor) |
| Sport Center Management (court-credits only) | ✅ Fully localized | ~5 (minor) |
| Pagination | ✅ Fully localized | 0 |
| Sidebar | ✅ Fully localized | 0 |
| Header | ✅ Fully localized | 0 |
| Back Button | ✅ Fully localized | 0 |

---

## ❌ Not Localized Features

These features contain zero `useTranslation` / `t()` usage. Every user-facing string is hardcoded (mostly in Vietnamese).

---

### 1. Authentication

**Files:**

| File | Path |
|---|---|
| login-form.tsx | `src/features/auth/components/login-form.tsx` |
| register-form.tsx | `src/features/auth/components/register-form.tsx` |
| magic-link-form.tsx | `src/features/auth/components/magic-link-form.tsx` |
| set-password-form.tsx | `src/features/auth/components/set-password-form.tsx` |
| change-password-form.tsx | `src/features/auth/components/change-password-form.tsx` |
| facebook-auth-button.tsx | `src/features/auth/components/facebook-auth-button.tsx` |
| google-auth-button.tsx | `src/features/auth/components/google-auth-button.tsx` |
| link-facebook-button.tsx | `src/features/auth/components/link-facebook-button.tsx` |
| link-google-button.tsx | `src/features/auth/components/link-google-button.tsx` |
| schemas/index.ts | `src/features/auth/schemas/index.ts` |
| actions/index.ts | `src/features/auth/actions/index.ts` |
| actions/facebook.ts | `src/features/auth/actions/facebook.ts` |
| actions/google.ts | `src/features/auth/actions/google.ts` |
| login/page.tsx | `src/app/(auth)/login/page.tsx` |
| register/page.tsx | `src/app/(auth)/register/page.tsx` |
| magic-link/page.tsx | `src/app/(auth)/magic-link/page.tsx` |
| set-password/page.tsx | `src/app/(auth)/set-password/page.tsx` |
| verify-email/page.tsx | `src/app/(auth)/verify-email/page.tsx` |
| register/verify-email/page.tsx | `src/app/(auth)/register/verify-email/page.tsx` |
| magic-link-verify-client.tsx | `src/app/(auth)/auth/magic/magic-link-verify-client.tsx` |

**Hardcoded strings categories:**
- All form labels, placeholders, button texts, headings
- All Zod validation messages (21 strings)
- All server action error/success messages (25+ strings)
- All toast messages
- All brand references ("PickleHub")
- All image alt texts

**Estimated missing strings:** ~153

---

### 2. Coach

**Files (26 .tsx files, all except `coach-onboarding/index.tsx` have zero i18n):**

| File | Path |
|---|---|
| coach-bookings-panel.tsx | `src/features/coach/components/coach-bookings-panel.tsx` |
| coach-classes-panel.tsx | `src/features/coach/components/coach-classes-panel.tsx` |
| coach-dashboard-gate.tsx | `src/features/coach/components/coach-dashboard-gate.tsx` |
| coach-dashboard-stats.tsx | `src/features/coach/components/coach-dashboard-stats.tsx` |
| coach-detail-tabs.tsx | `src/features/coach/components/coach-detail-tabs.tsx` |
| coach-discovery-detail.tsx | `src/features/coach/components/coach-discovery-detail.tsx` |
| coach-income-overview.tsx | `src/features/coach/components/coach-income-overview.tsx` |
| coach-learner-detail-panel.tsx | `src/features/coach/components/coach-learner-detail-panel.tsx` |
| coach-profile-form.tsx | `src/features/coach/components/coach-profile-form.tsx` |
| coach-quick-schedule.tsx | `src/features/coach/components/coach-quick-schedule.tsx` |
| coach-recommendation.tsx | `src/features/coach/components/coach-recommendation.tsx` |
| coach-reviews.tsx | `src/features/coach/components/coach-reviews.tsx` |
| coach-students-table.tsx | `src/features/coach/components/coach-students-table.tsx` |
| coach-week-schedule.tsx | `src/features/coach/components/coach-week-schedule.tsx` |
| coach-discovery-page-content.tsx | `src/features/coach/components/coach-discovery-page-content.tsx` |
| index.tsx (onboarding) | `src/features/coach/components/coach-onboarding/index.tsx` — **partial usage of `t()`** |
| classes page | `src/app/(protected)/coach/classes/[classId]/page.tsx` |
| income page | `src/app/(protected)/coach/income/page.tsx` |
| profile page | `src/app/(protected)/coach/profile/page.tsx` |
| schedule page | `src/app/(protected)/coach/schedule/page.tsx` |
| students page | `src/app/(protected)/coach/students/page.tsx` |
| student detail page | `src/app/(protected)/coach/students/[studentId]/page.tsx` |
| coaches listing page | `src/app/(protected)/coaches/page.tsx` |

**Common hardcoded patterns:**
- All tab labels, status badges, filter options
- All table headers, stat labels, card titles
- All toast error/success messages
- All dialog titles, descriptions, button labels
- All validation error messages
- All empty states, error states
- All placeholders, helper text
- Week day labels, view mode labels, sort options

**Only 1 file uses `t()`:** `coach-onboarding/index.tsx` uses `useTranslation("common")` but still has ~55 hardcoded strings (validation messages, select options, placeholders) alongside the translated ones.

**Estimated missing strings:** ~600+

---

### 3. Groups

**Files (37 .tsx files, 2 have partial `t()`, 35 have zero i18n):**

**Zero i18n files:**
- `src/features/groups/components/add-group-drawer.tsx`
- `src/features/groups/components/invite-dialog.tsx`
- `src/features/groups/components/invitations-table.tsx`
- `src/features/groups/components/guest-member-section.tsx`
- `src/features/groups/components/groups-page-content.tsx`
- `src/features/groups/components/group-tabs.tsx`
- `src/features/groups/components/group-overview-card.tsx`
- `src/features/groups/components/group-members-card.tsx`
- `src/features/groups/components/group-member-actions.tsx`
- `src/features/groups/components/group-invite-member-button.tsx`
- `src/features/groups/components/group-finance-section.tsx`
- `src/features/groups/components/group-detail-tabs.tsx`
- `src/features/groups/components/group-detail-actions-menu.tsx`
- `src/features/groups/components/group-court-bookings-section.tsx`
- `src/features/groups/components/group-card.tsx`
- `src/features/groups/components/finance-item-actions.tsx`
- `src/features/groups/components/edit-group-drawer.tsx`
- `src/features/groups/components/deprecated-invite-links-drawer.tsx`
- `src/features/groups/components/create-guest-member-dialog.tsx`
- `src/features/groups/components/archive-group-dialog.tsx`
- `src/features/groups/components/group-activity-schedule/` (8 files)
- `src/app/(protected)/groups/[groupId]/page.tsx`

**Partial `t()` usage files:**
- `group-equipment-section.tsx` — imports `useTranslation("common")` but ~90% of strings remain hardcoded
- `favorite-templates-selector.tsx` — imports `useTranslation("common")` but minimal usage

**Estimated missing strings:** ~600+

---

### 4. Feed / Notifications

**Files:**
- `src/features/feed/components/feed-page.tsx`
- `src/features/notifications/components/group-feed-notifications.tsx`
- `src/features/notifications/components/group-feed-notification-sender.tsx`

**Hardcoded strings include:**
- All filter tab labels: "Tất cả", "Chưa đọc", "Lời mời", "Phiên chơi", "Nhóm", "Hệ thống"
- All notification type metadata labels
- All button labels: "Từ chối", "Chấp nhận", "Xem chi tiết", "Đánh dấu đã đọc", "Xóa"
- All hero/banner text
- All stat card labels
- All sidebar text
- All empty states
- All form labels, validation messages, toast messages for notification sender

**Estimated missing strings:** ~80+

---

### 5. Learner

**Files:**
- `src/app/(protected)/learner/page.tsx`
- `src/features/learner/components/learner-bookings-panel.tsx`
- `src/features/learner/components/learner-coach-recommendation-dialog.tsx`
- `src/features/learner/components/learner-detail-tabs.tsx`
- `src/features/learner/components/learner-enrollments-panel.tsx`
- `src/features/learner/components/learner-overview.tsx`
- `src/features/learner/components/learner-profile.tsx`
- `src/features/learner/components/learner-schedule.tsx`

**Estimated missing strings:** ~150

---

### 6. Sport Center Management (sub-features)

**Entirely untranslated sub-features:**

**Courts Management (~10 files):**
- `src/features/sport-center-management/courts-management/` — all components (court-slot, court-schedule, booking-modal, legend, filters, quick-booking-modal, sport-center-selector)

**Booking List (~12 files):**
- `src/features/sport-center-management/booking-list/` — table, row, actions, filters, stats, items, cards, dialogs, sections

**Services & Products Management (~5 files):**
- `src/features/sport-center-management/services-products-management/` — inventory-table, form-dialog, filters, detail-sheet, badges

**Revenue Report (~8 files):**
- `src/features/sport-center-management/revenue-report/` — filters, summary-cards, transactions-table, transaction-drawer, empty-state, daily-chart, cancellations-cards

**Customer Management (~12 files):**
- `src/features/sport-center-management/customer/` — page-header, stats-cards, filters, table, table-row, selector, results, pagination, empty-state
- `src/features/sport-center-management/customer/customer-detail/` — page-header, profile-card, summary-grid, basic-info-section, center-section, booking-section

**Estimated missing strings:** ~400+

---

### 7. Recurring Socials

**Files:**
- `src/features/recurring-socials/components/confirm-create-modal.tsx`
- `src/features/recurring-socials/components/recurring-socials-preview.tsx`
- `src/features/recurring-socials/components/recurring-socials-form.tsx` (813 lines, entirely hardcoded)
- `src/features/recurring-socials/components/recurring-socials-filters.tsx`
- `src/features/recurring-socials/components/recurring-socials-list.tsx`
- `src/features/recurring-socials/components/recurring-socials-page.tsx`
- `src/app/(protected)/recurring-socials/page.tsx`

**Estimated missing strings:** ~120+

---

### 8. Landing Pages

**Files:**
- `src/components/landing-hero.tsx`
- `src/components/landing-features.tsx`
- `src/components/landing-footer.tsx`
- `src/components/landing-page-header.tsx`

**Estimated missing strings:** ~50

---

### 9. Dashboard Components

**Files:**
- `src/components/dashboard-groups.tsx`
- `src/components/dashboard-pending-invites.tsx`
- `src/components/dashboard-quick-actions.tsx`
- `src/components/dashboard-stats.tsx`
- `src/components/error-section.tsx`
- `src/components/shared/error-state.tsx`
- `src/components/common/back-navigation.tsx`
- `src/app/(protected)/home/page.tsx`

**Estimated missing strings:** ~35

---

### 10. Other Not Localized Pages

| Page | File | Est. Strings |
|---|---|---|
| Settings | `src/app/(protected)/settings/page.tsx` | ~25 |
| Personal Calendar | `src/features/personal-calendar/components/personal-calendar-page.tsx` | ~50 |
| Booking Detail | `src/app/(protected)/bookings/[bookingId]/page.tsx` | ~25 |
| Invitation Accept | `src/app/invitation/accept/accept-invitation-client.tsx` | ~8 |
| Calendar page | `src/app/(protected)/calendar/page.tsx` (metadata) | ~2 |

---

## ⚠️ Partially Localized Features

---

### 1. Socials

**Status:** Mostly localized via `useSocialsTranslation()`. Many files use `t()` but with hardcoded English/Vietnamese `defaultValue` fallbacks. Some files still have genuinely hardcoded strings.

**Files with hardcoded strings not wrapped in `t()`:**

| File | Line(s) | Hardcoded Strings |
|---|---|---|
| `src/features/socials/components/play-session/play-session-participants.tsx` | 53-71 | `"Guest"`, `"Unknown"`, `"Host"` (fallback names) |
| `src/features/socials/components/play-session/play-session-overview.tsx` | 95-124 | Toast fallbacks: `"Play session started successfully!"`, `"Failed to start play session"`, etc. |
| `src/features/socials/components/play-session/play-session-form.tsx` | 343, 352, 368 | `"0"`, `"VND"`, `"10"` (placeholders/labels) |
| `src/features/socials/components/play-session/match-result-dialog.tsx` | 48, 246, 253-254, 289-290, 301-302 | `"Unknown Team"`, `"VS"`, `"Team A"`, `"Team B"` |
| `src/features/socials/components/play-session/index.tsx` | 63, 66 | `"Unknown Player"` |
| `src/features/socials/components/matches/player-card.tsx` | 92 | `` aria-label={`Xóa ${player.name}`} `` (Vietnamese) |
| `src/features/socials/components/matches/index.tsx` | 111, 121 | `"Unknown Player"` |
| `src/features/socials/components/social-detail/social-participants-tab.tsx` | 123, 129-130 | `"?"`, `"Unknown User"` |
| `src/features/socials/components/social-detail/social-sidebar.tsx` | 64, 116 | `"Failed to complete"`, `"Failed to publish"` (toast fallbacks) |
| `src/features/socials/components/social-detail/payment-tab/social-payment-tab.tsx` | 40-52 | `"Đã thanh toán"`, `"Đã thanh toán nhưng chờ xác nhận"`, `"Chưa thanh toán"` (Vietnamese) |
| `src/features/socials/components/social-detail/payment-tab/upload-payment-proof-card.tsx` | 71 | `"Failed to submit payment proof."` |
| `src/features/socials/components/social-detail/expense-tab/participant-payment-tracking-card.tsx` | 225, 228, 240-241 | `"Unknown"`, `"Host"`, `"Credit: "` |
| `src/features/socials/components/social-detail/expense-tab/refund-dialog.tsx` | ALL | **Entire file has zero i18n** — `"Issue Refund"`, `"Cancel"`, `"Confirm Refund"`, etc. |
| `src/features/socials/components/social-detail/expense-tab/pricing-calculator-dialog.tsx` | 242, 284, 319 | `"VND"`, `"Session"` (fallback) |
| `src/features/socials/components/play-session/play-session-modal.tsx` | 98, 111 | `"e.g., Morning Session - Courts 1 & 2"`, `"Sports Center ABC, 123 Main St"` |

**`defaultValue` issues:** Many files use `t("key", { defaultValue: "Vietnamese text" })` — the fallback is Vietnamese, not English. Examples:
- `filters-drawer.tsx`: `{ defaultValue: "Áp dụng" }`
- `match-result-dialog.tsx`: `{ defaultValue: "Cập nhật kết quả trận đấu" }`, `{ defaultValue: "Nhập tỷ số các set đấu..." }`, `{ defaultValue: "Team A" }`, etc.
- `social-statistics-cards.tsx`: `{ defaultValue: "Revenue Earned" }`, etc.

**Missing namespace key `socials/labels` vs actual usage:** Some files reference `t("labels.host")` but the `general.json` locale file does not have a `"host"` key under `labels`.

**Estimated missing strings:** ~30 hardcoded + ~50 with incorrect locale fallbacks

---

### 2. Tournaments

**Status:** Excellent coverage — nearly all components use `useTournamentTranslation()` / `t()`. Only minor hardcoded strings remain.

| File | Line(s) | Hardcoded Strings |
|---|---|---|
| `src/app/(protected)/tournaments/[tournamentId]/page.tsx` | 92 | `"Đang tải thông tin giải đấu..."` |
| `src/features/tournaments/components/tournament-player-side/tabs/referee-tab.tsx` | 131 | `"vs"` |
| `src/features/tournaments/components/create-tournament/step-1-basic-info.tsx` | 93 | `alt="Banner preview"` |
| `src/features/tournaments/components/payment-tab/payment.tsx` | 323, 359, 603 | `alt="QR Code Preview"`, `"PNG, JPG up to 5MB"`, `alt="Payment QR Code"` |
| `src/features/tournaments/components/sponsors-tab/add-sponsor-form.tsx` | 186 | `alt="Logo preview"` |
| `src/features/tournaments/components/dashboard-tab/tournament-dashboard.tsx` | 319 | `alt="Tournament Poster"` |
| `src/features/tournaments/components/personnel-tab/match-assignments.tsx` | 366 | `title="Unassign Referee"` |
| `src/features/tournaments/components/booking-page/confirm-booking-dialog.tsx` | 261, 280 | `placeholder="e.g. John Doe"`, `"e.g. 0912345678"` |
| `src/features/tournaments/components/tournament-player-side/event-page/event-prizes-card.tsx` | 34-57 | `"1st Place"`, `"2nd Place"`, `"3rd Place"`, `"Placement Reward"` (internal mapping keys) |

**Estimated missing strings:** ~15 (mostly alt texts, placeholders)

---

### 3. Sport Center

**Status:** Mostly localized via `useSportCenterTranslation()`. Two files have minor issues.

| File | Line(s) | Hardcoded Strings |
|---|---|---|
| `src/features/sport-center/components/sport-center-card.tsx` | 20, 24 | `"Đang hoạt động"` / `"Tạm ngưng"`, `"Chưa có đánh giá"` |
| `src/features/sport-center/components/empty-state.tsx` | 23-25 | `variant="booking"` branch has hardcoded strings |

Files in `src/features/sport-center/booking/`, `src/features/sport-center/listing/`, `src/features/sport-center/detail/` are **fully localized**.

**Estimated missing strings:** ~5-10

---

### 4. Friends

**Status:** The main `FriendClient.tsx` properly uses `t("friends.*")` for all UI strings. However, 3 hardcoded Vietnamese strings appear in optimistic data updates, and API service files return hardcoded Vietnamese defaults.

| File | Line(s) | Hardcoded Strings |
|---|---|---|
| `src/app/(protected)/friend/FriendClient.tsx` | 162 | `"Lời mời kết bạn đã gửi"` (optimistic bio) |
| `src/app/(protected)/friend/FriendClient.tsx` | 209 | `"Đã là bạn bè"` (optimistic bio) |
| `src/app/(protected)/friend/FriendClient.tsx` | 211 | `"Vừa kết bạn"` (optimistic label) |
| `src/features/friend/api/find-users.ts` | 50-52 | `"Đã là bạn bè"`, `"Người dùng trên hệ thống"`, `"Chưa cập nhật"` |
| `src/features/friend/api/friend-service.ts` | 56-58, 72-77, 98-104 | `"Da la ban be"`, `"Nguoi dung tren he thong"`, `"Chua cap nhat"`, `"Dang tai"`, `"Loi moi ket ban da gui"`, `"Loi moi ket ban da nhan"` |

**Estimated missing strings:** ~3 in UI + ~12 in API service files

---

## ✅ Fully Localized Features

These features have complete or near-complete i18n coverage:

| Feature | Notes |
|---|---|
| Profile | `useProfileTranslation()` used everywhere. Minor: `"U"` initial, `"User "` prefix, `"Google"`/`"Facebook"` brand names, `"Avatar URL"` label |
| Score | `useTournamentTranslation()` used. Minor: `"Set"` in ScoreBoard, `"Đang tải bảng ghi điểm..."` in page |
| Subscriptions | `useSubscriptionTranslation()` used. Minor: `"ngày"` hardcoded in duration label |
| Sport Center (court-credits) | `useCourtCreditsTranslation()` used. Minor: CreditTabs has hardcoded "All", "Active", etc. |
| Sidebar | `useTranslation("common")` used for all nav labels |
| Header | `useTranslation("common")` used for all dropdown and notification strings |
| Pagination | `useTranslation("common")` used |
| Back Button | `useTranslation("common")` used |

---

## Locale File Analysis

### Namespaces overview

| Namespace | Files (en) | Files (vi) | Key Count (approx) |
|---|---|---|---|
| `common` | `common.json` | `common.json` | ~110 |
| `profile` | `profile.json` | `profile.json` | ~80 |
| `sport-center` | `sport-center.json` | `sport-center.json` | ~200 |
| `sport-center-management` | `sport-center-management.json` | `sport-center-management.json` | ~100 |
| `subscriptions` | `subscriptions.json` | `subscriptions.json` | ~25 |
| `socials` | socials/* (4 JSON + index.ts) | socials/* (4 JSON + index.ts) | ~450 |
| `tournament` | tournament/* (13 JSON + index.ts) | tournament/* (13 JSON + index.ts) | ~500+ |

---

### Missing Locale Keys

#### `common.json`
- No keys for **Auth** feature (login, register, password, magic link, verification)
- No keys for **Coach** feature
- No keys for **Groups** feature
- No keys for **Learner** feature
- No keys for **Feed/Notifications** feature
- No keys for **Landing page**
- No keys for **Dashboard** components (quick actions, pending invites, stats)
- No keys for **Settings** page
- No keys for **Personal Calendar**
- No keys for **Booking Detail** page
- No keys for **Recurring Socials** feature
- Missing `common.back` only has "Back" — no support for "Quay lại" or other back variants
- Missing `common.loading`, `common.error`, `common.success`, `common.retry`
- Missing empty state keys for features not yet covered

#### `sport-center-management.json`
- Only contains keys for **court-credits** sub-feature
- Missing keys for: courts-management, booking-list, services-products-management, revenue-report, customer-management, customer-detail
- Status keys contain Vietnamese values mixed in English file (lines like `"ACTIVE": "Đang hoạt động"`)
- Reason keys contain Vietnamese values in English file (`"CUSTOMER_CANCELLED": "Khách hàng hủy"`)

#### `profile.json`
- No missing keys — appears complete
- The `edit.avatar` section has all needed keys

#### `subscriptions.json`
- No missing keys — appears complete

#### `socials/` namespace
- `general.json`: Missing `labels.host` key (referenced in `social-participants-tab.tsx` and `participant-payment-tracking-card.tsx`)
- `general.json`: Missing `common.playSession` key (referenced in `social-join-dialog.tsx`)
- `forms.json`: Missing `form.pickDate` key (referenced in `social-form-schedule-card.tsx`)
- `forms.json`: Missing `form.submitError`, `form.deleteError` (referenced in social-form/index.tsx)
- `detail.json`: Missing `detail.approveSuccess`, `detail.kickSuccess`, `detail.noParticipantsDescription` (referenced in social-participants-tab.tsx)
- `detail.json`: Missing `sidebar.completeSuccess`, `sidebar.publishSuccess`, `sidebar.completing`, `sidebar.completeSocial`, `sidebar.publishConfirmTitle`, `sidebar.publishConfirmDescription`, `sidebar.publishValidation.noSessions`, `sidebar.publishValidation.noPayment` — all used in social-sidebar.tsx
- `detail.json`: Missing `expenses.pricing.*` keys (pricing-calculator-dialog.tsx)
- `detail.json`: Missing `expenses.extra.*` keys (extra-expenses-card.tsx)
- `detail.json`: Missing `expenses.summary.*` keys (expense-summary-grid.tsx)
- `detail.json`: Missing `expenses.breakdown.*` keys (expense-breakdown-card.tsx)
- `detail.json`: Missing `expenses.progress.*` keys (social-expense-tab.tsx)
- `detail.json`: Missing `expenses.paymentInfo.*` keys (payment-information-card.tsx)
- `detail.json`: Missing `payment.proof`, `payment.proofDescription` keys (display-payment-proof-card.tsx)
- `detail.json`: Missing `expenses.actions.*` keys
- `listing.json`: Missing `filters.apply` key (filters-drawer.tsx references `t("filters.apply")`)
- `listing.json`: Missing social-card specific status/level keys

#### `tournament/` namespace
- `general.json`: Missing `list.registered` key (tournament-list.tsx references `t("list.registered")`)
- `general.json`: Missing `manager.tabs.more` key (tournament-manager.tsx references `t("manager.tabs.more")`)
- `general.json`: Missing `public.hero.title`, `public.hero.location`, `public.hero.dates`, `public.hero.inProgress` keys
- `general.json`: Missing `public.venue.location` key
- `seeding.json`: Missing `seeding.selectEvent`, `seeding.chooseEvent` keys
- `live-control.json`: Missing `live.scoreboard.*` keys for scoreboard components
- `brackets.json`: Missing bracket status labels used in bracket components
- `dashboard.json`: Missing dashboard chart/stat labels used in tournament-dashboard.tsx

---

### Unused Locale Keys

#### `sport-center-management.json`
- `status.playSessions`, `status.addPlaySession`, `status.sessionTitle`, `status.sessionLabel`, `status.sessionTitlePlaceholder`, `status.maxSlots`, `status.status`, `status.privateEvent`, `status.autoApproveJoinRequests`, `status.deleteSocial`, `status.confirmDeleteSocial`, `status.paymentCodePlaceholder`, `status.paymentInstructionsPlaceholder`, `status.validationEndAfterStart`, `status.addPlaySessionsHint`, `status.createSuccess`, `status.updateSuccess`, `status.save`, `status.create`, `status.update` — These appear to be duplicated from `socials/forms.json` and may be unused in the sport-center-management context
- `status.ACTIVE`, `status.PARTIALLY_USED`, `status.USED`, `status.EXPIRED` — Vietnamese values in English locale file
- `reasons.*` — Vietnamese values in English locale file

#### `common.json`
- `equipment.*` keys — These are used only in `group-equipment-section.tsx` which has its own hardcoded strings. The keys exist but may overlap with what's needed in the groups feature.

#### `socials/detail.json` (check against vi version)
- The vi `detail.json` (506 lines) is significantly larger than the en `detail.json` (325 lines), suggesting many keys were added to vi but not to en, or vice versa.

---

### Duplicate Keys

#### Cross-namespace duplicates
- `common.sidebar.friends` ↔ `common.friends.pageTitle` — Both reference the "Friends" concept
- `sport-center-management.status.createSuccess` ↔ `socials/forms.json` `form.createSuccess` — Duplicate social creation messages

#### Within `socials/detail.json` vs `socials/forms.json`
- `form.save` / `form.create` / `form.update` in forms.json overlap conceptually with social CRUD messages
- `sessions.*` in forms.json overlaps with `playSessionOverview.*` in detail.json

#### Within `sport-center-management.json`
- `status.playSessions` through `status.update` are clearly copy/pasted from socials namespace and unused

---

### Incorrect Nesting / Inconsistencies

**Vietnamese in English locale files:**
- `sport-center-management.json` `status.ACTIVE`: `"Đang hoạt động"` (Vietnamese) instead of `"Active"`
- `sport-center-management.json` `status.PARTIALLY_USED`: `"Đã dùng một phần"` (Vietnamese)
- `sport-center-management.json` `status.USED`: `"Đã dùng"` (Vietnamese)
- `sport-center-management.json` `status.EXPIRED`: `"Đã hết hạn"` (Vietnamese)
- `sport-center-management.json` `reasons.*`: All Vietnamese values

**English in Vietnamese locale files:**
- `common.json` `back`: `"Back"` — should be `"Quay lại"` for vi
- `sport-center.json` `listing.previous`: `"Previous"` — should be Vietnamese
- `sport-center.json` `listing.next`: `"Next"` — should be Vietnamese

**Locale count mismatch:**
- `en/socials/detail.json`: 325 lines
- `vi/socials/detail.json`: 506 lines
- The vi version has ~180 more lines of content — many keys present in vi are missing in en

**Inconsistent namespace structure:**
- `socials` namespace is structured as nested JSON files merged via `index.ts`
- `tournament` namespace uses the same pattern
- Other namespaces (`common`, `profile`, `sport-center`, `sport-center-management`, `subscriptions`) are single JSON files
- This inconsistent structure makes it harder to maintain

---

## Recommended Work Order

### Priority 1 (Critical) — Features with zero i18n coverage, high user visibility

| Order | Feature | Rationale |
|---|---|---|
| 1 | **Authentication** | Entry point for all users. Login, register, password reset are the first screens users see. All ~153 strings hardcoded. |
| 2 | **Settings** | Users need to change language/theme settings. Currently entirely hardcoded. |
| 3 | **Dashboard & Landing** | Home page, landing page, dashboard components are high-visibility. All hardcoded. |

### Priority 2 — Core app features with zero i18n coverage

| Order | Feature | Rationale |
|---|---|---|
| 4 | **Groups** | Large feature (~600+ strings). High user engagement. Entirely hardcoded. |
| 5 | **Coach** | Large feature (~600+ strings). High user engagement for coach users. Entirely hardcoded. |
| 6 | **Learner** | Core learner experience (~150 strings). Entirely hardcoded. |
| 7 | **Feed / Notifications** | Notification center (~80+ strings). Entirely hardcoded. |
| 8 | **Personal Calendar** | All users see this. ~50 strings entirely hardcoded. |
| 9 | **Booking Detail** | Part of core booking flow. ~25 strings entirely hardcoded. |

### Priority 3 — Secondary features / cleanup

| Order | Feature | Rationale |
|---|---|---|
| 10 | **Sport Center Management** (non-credits) | Sport center operator features. ~400+ strings. Entirely hardcoded. |
| 11 | **Recurring Socials** | Admin/social host feature. ~120+ strings. Entirely hardcoded. |
| 12 | **Socials — cleanup** | Fix ~30 genuinely hardcoded strings + update `defaultValue` fallbacks from Vietnamese to English |
| 13 | **Tournaments — cleanup** | Fix ~15 minor alt texts, placeholders, tooltips |
| 14 | **Friends — cleanup** | Fix ~3 hardcoded optimistic strings + API service defaults |
| 15 | **Sport Center — cleanup** | Fix ~5-10 hardcoded strings in card and empty-state |
| 16 | **Profile — cleanup** | Fix ~8 minor fallback strings |
| 17 | **Score — cleanup** | Fix `"Set"` label and loading text |
| 18 | **Subscriptions — cleanup** | Fix `"ngày"` hardcoded string |
| 19 | **Admin references cleanup** | Remove/archive obsolete "Admin" references — see § Obsolete Admin References below |
| 20 | **Locale file cleanup** | Remove unused keys, fix Vietnamese-in-English values, align en/vi key parity in socials detail.json, standardize namespace structure |

---

### Obsolete Admin References

**No standalone Admin feature exists in the current codebase.** No Admin pages, routes (`src/app/(protected)/admin/`), components, or locale keys exist. The remaining `"admin"` strings are isolated to 3 files and carry no UI feature weight:

| File | Line(s) | Text | Classification |
|---|---|---|---|
| `src/features/sport-center-management/stores/court-credits-store.ts` | 124, 136, 149, 168, 174, 176 | `"Admin"` (label), `"Manual credit created by admin."` (notes) | Part of **Sport Center Management** — should be i18n'd under `sport-center-management` namespace |
| `src/features/subscriptions/api/subscriptions-service.ts` | 45 | `// Admin only` | Code comment (no UI impact) |
| `src/features/recurring-socials/recurring-socials.mock.ts` | 37 | `createdBy: "Admin User"` | Mock data (no UI impact) |

**Action items:**
1. Replace the 6 hardcoded `"Admin"` / `"Manual credit created by admin."` strings in `court-credits-store.ts` with `t()` calls using `sport-center-management` namespace keys.
2. No action needed for the code comment or mock data — they carry no user-facing strings.

---

## Appendix: Locale Files Index

| # | File |
|---|---|
| 1 | `src/i18n/settings.ts` |
| 2 | `src/i18n/client.ts` |
| 3 | `src/i18n/use-tournament-translation.ts` |
| 4 | `src/i18n/use-sport-center-translation.ts` |
| 5 | `src/i18n/use-socials-translation.ts` |
| 6 | `src/i18n/use-profile-translation.ts` |
| 7 | `src/i18n/use-court-credits-translation.ts` |
| 8 | `src/components/i18n-provider.tsx` |
| 9 | `src/i18n/locales/en/common.json` |
| 10 | `src/i18n/locales/en/profile.json` |
| 11 | `src/i18n/locales/en/sport-center.json` |
| 12 | `src/i18n/locales/en/sport-center-management.json` |
| 13 | `src/i18n/locales/en/subscriptions.json` |
| 14 | `src/i18n/locales/en/socials/general.json` |
| 15 | `src/i18n/locales/en/socials/listing.json` |
| 16 | `src/i18n/locales/en/socials/detail.json` |
| 17 | `src/i18n/locales/en/socials/forms.json` |
| 18 | `src/i18n/locales/en/socials/index.ts` |
| 19 | `src/i18n/locales/en/tournament/general.json` |
| 20 | `src/i18n/locales/en/tournament/dashboard.json` |
| 21 | `src/i18n/locales/en/tournament/create.json` |
| 22 | `src/i18n/locales/en/tournament/events.json` |
| 23 | `src/i18n/locales/en/tournament/registrations.json` |
| 24 | `src/i18n/locales/en/tournament/team-matching.json` |
| 25 | `src/i18n/locales/en/tournament/seeding.json` |
| 26 | `src/i18n/locales/en/tournament/brackets.json` |
| 27 | `src/i18n/locales/en/tournament/scheduling.json` |
| 28 | `src/i18n/locales/en/tournament/live-control.json` |
| 29 | `src/i18n/locales/en/tournament/booking.json` |
| 30 | `src/i18n/locales/en/tournament/group-stage.json` |
| 31 | `src/i18n/locales/en/tournament/personnel.json` |
| 32 | `src/i18n/locales/en/tournament/index.ts` |
| 33-54 | (mirror files for `vi/` locale) |
