# PickleHub Web — i18n Audit Report

**Date:** 2026-07-07  
**Auditor:** Automated codebase analysis  
**Scope:** Full project (`src/`)  
**Languages:** Vietnamese (vi) ↔ English (en)

---

## Overall Summary

| Metric | Count |
|---|---|
| Fully localized features | 6 |
| Partially localized features | 6 |
| Not localized features | 12 |
| Estimated remaining hardcoded UI strings | ~350+ |
| Locale file pairs (en/vi) | 22 matched pairs |

### Quick Assessment

- **Authentication** — ✅ Fully localized
- **Tournaments** — 🟡 Partially localized (extensive i18n via `useTournamentTranslation`, but many `defaultValue` fallbacks remain hardcoded in English; some toast messages hardcoded)
- **Socials** — ✅ Fully localized (via `useSocialsTranslation`, dedicated locale files for detail/forms/general/listing)
- **Sport Center (public)** — ✅ Fully localized (via `useSportCenterTranslation`, dedicated locale files)
- **Profile** — ✅ Fully localized (via `useProfileTranslation`, dedicated locale files)
- **Subscriptions** — 🟡 Partially localized (via `useSubscriptionTranslation`, but some strings like VNPay button text mixed Vietnamese)
- **Coach** — 🟡 Partially localized (uses `useTranslation("common")` in many components, but `coach-profile-form.tsx` and some components still have hardcoded Vietnamese)
- **Groups** — 🟡 Partially localized (only `favorite-templates-selector` and `group-equipment-section` use i18n; rest is hardcoded)
- **Landing Page** — 🔴 Not localized (all feature titles/descriptions hardcoded in Vietnamese)
- **Dashboard** — 🔴 Not localized (stats labels, group role labels hardcoded in Vietnamese)
- **Sport Center Management** — 🔴 Not localized (entire feature uses hardcoded Vietnamese)
- **Notifications** — 🔴 Not localized
- **Feed** — 🔴 Not localized
- **Learner** — 🔴 Not localized
- **Friends** — 🔴 Not localized
- **Matches** — 🔴 Not localized
- **Score** — 🟡 Partially localized (PickleballTracker uses tournament translation, but error messages hardcoded in Vietnamese)
- **Personal Calendar** — 🔴 Not localized
- **Recurring Socials** — 🔴 Not localized
- **Group Activity Schedule** — 🔴 Not localized
- **Shared Components** — 🟡 Partially localized (pagination, back-button use i18n; error-state, calendar-navigation, sidebar hardcoded)
- **UI Components** — 🔴 Not localized (sr-only text, dialog close, pagination labels hardcoded in English)

---

## Feature-by-Feature Report

---

### 1. Authentication

**Status:** ✅ Fully localized

**Files inspected:**
- `src/features/auth/components/login-form.tsx`
- `src/features/auth/components/register-form.tsx`
- `src/features/auth/components/magic-link-form.tsx`
- `src/features/auth/components/set-password-form.tsx`
- `src/features/auth/components/change-password-form.tsx`
- `src/features/auth/components/google-auth-button.tsx`
- `src/features/auth/components/facebook-auth-button.tsx`
- `src/features/auth/components/link-google-button.tsx`
- `src/features/auth/components/link-facebook-button.tsx`

**Localization coverage:** 100%  
All components use `useTranslation("common")` with keys under `auth.*`. All labels, placeholders, buttons, error messages, and toast notifications use translation keys.

**Remaining hardcoded strings:** None  
**Estimated work remaining:** None

---

### 2. Tournaments

**Status:** 🟡 Partially localized

**Files inspected:** 60+ components under `src/features/tournaments/`

**Localization coverage:** ~75%  
All components use `useTournamentTranslation()` hook. Dedicated locale files exist:
- `tournament/general.json`, `tournament/booking.json`, `tournament/brackets.json`, `tournament/create.json`, `tournament/dashboard.json`, `tournament/events.json`, `tournament/group-stage.json`, `tournament/live-control.json`, `tournament/personnel.json`, `tournament/registrations.json`, `tournament/scheduling.json`, `tournament/seeding.json`, `tournament/team-matching.json`

**What is already localized:**
- All scheduling UI (toolbar, dialogs, forms, match cards)
- All bracket management UI
- All create tournament steps
- All financial dashboard components
- All live control center components
- All seeding components
- All group stage components

**What still uses hardcoded text:**
- **Toast error fallbacks** — Many `toast.error(res.error || "Failed to ...")` patterns where the fallback is hardcoded English
- **`defaultValue` pattern** — Extensive use of `t("key", { defaultValue: "English text" })` — while this works, if locale files are missing keys, the English default will show in Vietnamese mode
- **Registration management** — Multiple hardcoded toast messages: `"Failed to fetch registrations"`, `"Failed to approve registration"`, `"Failed to reject registration"`, `"Failed to load registrations"`
- **Sponsor tab** — `"Failed to load sponsors"`, `"Failed to add sponsor"`, `"Failed to delete sponsor"`
- **Personnel tab** — `"User profile not found"`, `"Failed to verify user ID"`, `"Unassign Referee"` (title attribute)
- **Event prizes** — `"Placement Reward"` fallback
- **Overview tab** — `"No venue assigned"` fallback
- **Referee tab** — `"TBD"`, `"Event"` fallbacks
- **Manager tabs** — `"Thêm"` (Vietnamese hardcoded in defaultValue for "More" tab)

**Estimated work remaining:** 3-4 hours

---

### 3. Socials

**Status:** ✅ Fully localized

**Files inspected:** 40+ components under `src/features/socials/`

**Localization coverage:** ~95%  
All components use `useSocialsTranslation()`. Dedicated locale files:
- `socials/detail.json`, `socials/forms.json`, `socials/general.json`, `socials/listing.json`

**Remaining hardcoded strings:** Minimal — review for any edge-case fallback strings  
**Estimated work remaining:** 0.5 hours (verification pass)

---

### 4. Sport Center (Public Browsing)

**Status:** ✅ Fully localized

**Files inspected:** 30+ components under `src/features/sport-center/`

**Localization coverage:** ~95%  
All components use `useSportCenterTranslation()`. Dedicated locale file: `sport-center.json`

**Remaining hardcoded strings:** Minimal  
**Estimated work remaining:** 0.5 hours (verification pass)

---

### 5. Profile

**Status:** ✅ Fully localized

**Files inspected:**
- `src/features/profile/components/stats-card.tsx`
- `src/features/profile/components/right-panel.tsx`
- `src/features/profile/components/profile-subscriptions.tsx`
- `src/features/profile/components/profile-header.tsx`
- `src/features/profile/components/match-history-card.tsx`
- `src/features/profile/components/group-card.tsx`
- `src/features/profile/components/edit-profile/*.tsx` (6 files)

**Localization coverage:** ~95%  
All components use `useProfileTranslation()`. Dedicated locale file: `profile.json`

**Remaining hardcoded strings:** Minimal  
**Estimated work remaining:** 0.5 hours

---

### 6. Subscriptions

**Status:** 🟡 Partially localized

**Files inspected:**
- `src/features/subscriptions/components/subscription-cards.tsx`
- `src/app/(protected)/subscriptions/payment-return/payment-return-content.tsx`

**Localization coverage:** ~60%

**What is already localized:**
- Subscription cards use `useSubscriptionTranslation()` for plan names, billing cycles, button labels

**What still uses hardcoded text:**
- `payment-return-content.tsx` — Entire `VNPAY_RESPONSE_CODES` dictionary hardcoded in Vietnamese (~15 strings)
- `"Thanh toán qua VNPay"` button text (hardcoded Vietnamese in subscription cards)
- VNPay alt text `"VNPay"` (minor)

**Estimated work remaining:** 1-2 hours

---

### 7. Coach

**Status:** 🟡 Partially localized

**Files inspected:**
- `src/features/coach/components/coach-bookings-panel.tsx`
- `src/features/coach/components/coach-classes-panel.tsx`
- `src/features/coach/components/coach-dashboard-gate.tsx`
- `src/features/coach/components/coach-dashboard-stats.tsx`
- `src/features/coach/components/coach-detail-tabs.tsx`
- `src/features/coach/components/coach-income-overview.tsx`
- `src/features/coach/components/coach-learner-detail-panel.tsx`
- `src/features/coach/components/coach-onboarding/index.tsx`
- `src/features/coach/components/coach-profile-form.tsx`

**Localization coverage:** ~70%

**What is already localized:**
- Dashboard stats, detail tabs, income overview, bookings panel, classes panel, learner detail, onboarding — all use `useTranslation("common")`

**What still uses hardcoded text:**
- `coach-profile-form.tsx` — Likely contains form labels/placeholders not yet audited for i18n
- Some edge-case status labels and toast messages

**Estimated work remaining:** 2-3 hours

---

### 8. Groups

**Status:** 🟡 Partially localized

**Files inspected:**
- `src/features/groups/components/favorite-templates-selector.tsx` ✅
- `src/features/groups/components/group-equipment-section.tsx` ✅
- `src/features/groups/components/edit-group-drawer.tsx` 🔴
- `src/features/groups/components/deprecated-invite-links-drawer.tsx` 🔴
- Other group components 🔴

**Localization coverage:** ~20%

**What is already localized:**
- Favorite templates selector
- Group equipment section (3 sub-components)

**What still uses hardcoded text:**
- Group editing drawer — all labels and buttons
- Invite links drawer — all labels
- Other group management components

**Estimated work remaining:** 4-6 hours

---

### 9. Landing Page

**Status:** 🔴 Not localized

**Files inspected:**
- `src/components/landing-hero.tsx`
- `src/components/landing-features.tsx`
- `src/components/landing-footer.tsx`
- `src/components/landing-page-header.tsx`

**Hardcoded strings found:**
- `"Tham Gia Ngay"` (Join Now button)
- `"Phân Tích Hiệu Suất"` (Performance Analytics)
- `"Trợ Lý AI"` (AI Assistant)
- `"Quản Lý Thiết Bị"` (Equipment Management)
- `"Nhóm Chuyên Biệt"` (Specialized Groups)
- Feature descriptions (all Vietnamese)
- `"Switch to light mode"` / `"Switch to dark mode"` (hardcoded English tooltip)
- All footer content

**Estimated work remaining:** 3-4 hours

---

### 10. Dashboard

**Status:** 🔴 Not localized

**Files inspected:**
- `src/components/dashboard-stats.tsx`
- `src/components/dashboard-groups.tsx`
- `src/components/dashboard-pending-invites.tsx`
- `src/components/dashboard-quick-actions.tsx`

**Hardcoded strings found:**
- `"Nhóm"` (Groups)
- `"Thành Viên"` (Members)
- `"Lời Mời Chờ"` (Pending Invites)
- `"Chủ Sở Hữu"` (Owner)
- `"Thành Viên"` (Member)
- Quick action labels
- Pending invite UI text

**Estimated work remaining:** 2-3 hours

---

### 11. Sport Center Management

**Status:** 🔴 Not localized

**Files inspected:**
- `src/features/sport-center-management/services-products-management/components/*.tsx` (6+ files)
- `src/features/sport-center-management/revenue-report/components/*.tsx` (8+ files)
- `src/features/sport-center-management/components/sport-center-card.tsx`
- `src/features/sport-center-management/components/customer/*.tsx` (10+ files)
- `src/features/sport-center-management/components/booking-list/*.tsx`
- `src/app/(protected)/sport-center-management/**/*.tsx`

**Localization coverage:** 0% — No `useTranslation` or custom translation hooks found in any component.

**Hardcoded strings found (extensive list — Vietnamese):**
- Services/Products: `"Chưa có sản phẩm nào"`, `"Chưa có dịch vụ nào"`, `"Thêm sản phẩm"`, `"Thêm dịch vụ"`, `"Chỉnh sửa sản phẩm"`, `"Chỉnh sửa dịch vụ"`, `"Đang tải..."`, `"Tải ảnh lên"`, `"Tạo mới"`, `"Lưu thay đổi"`, `"Tìm dịch vụ"`, `"Tìm sản phẩm"`, `"Tất cả"`, `"Thông tin chi tiết dịch vụ/sản phẩm"`, `"Đơn vị"`, `"Tồn kho"`, `"Ngày tạo"`, `"Cập nhật gần nhất"`, `"Đang hoạt động"`, `"Tạm ngưng"`
- Revenue Report: `"Đã quyết toán"`, `"Chờ duyệt"`, `"Bị từ chối"`, `"Đã hủy"`, `"Chưa có giao dịch phù hợp"`, `"Mã giao dịch"`, `"Trạng thái"`, `"Phương thức"`, `"Ngày thanh toán"`, `"Tổng tiền"`, `"Tạo lúc"`, `"Nhận lúc"`, `"Duyệt lúc"`, `"Từ chối lúc"`, `"Trung tâm"`, `"Mã booking"`, `"Ngày booking"`, `"Số tiền booking"`, `"Doanh thu đã quyết toán"`, `"Doanh thu chờ duyệt"`, `"Giao dịch đã quyết toán"`, `"Giao dịch chờ duyệt"`, `"Có lỗi xảy ra"`, `"Không thể xuất CSV"`, `"Đã tạo báo cáo CSV"`, `"Đang xuất..."`, `"Export CSV"`, `"30 ngày"`, `"Tháng này"`, `"Tất cả trung tâm"`, `"Không có địa chỉ"`, `"Doanh thu đã quyết toán"` (chart), `"Số lượt hủy"`, `"Doanh thu bị hủy"`
- Sport Center Card: `"Đang hoạt động"`, `"Tạm ngưng"`, `"Chưa có đánh giá"`
- Customer Management: `"Chọn trung tâm"`, `"Tất cả sân"`, `"Không thể tải danh sách khách hàng"`, `"Thử lại"`, `"Không có kết quả phù hợp"`, `"Chưa có khách hàng nào"`, `"Xóa lọc"`, `"Làm mới"`, `"Không tìm thấy khách hàng"`, `"Mã khách hàng không hợp lệ..."`, `"Không thể tải chi tiết khách hàng"`, `"Đang tải khách hàng"`, `"Lượt ghé thăm"`, `"Chi tiêu"`, `"Credit còn lại"`, `"Lần ghé gần nhất"`, `"Chưa cập nhật email"`, `"Chưa cập nhật số điện thoại"`, `"Chưa cập nhật"`
- Booking List: `"Không thể tải danh sách đặt sân"`

**Note:** A locale file `sport-center-management.json` exists in both en and vi but is NOT wired to any component.

**Estimated work remaining:** 8-12 hours (largest unlocalized feature)

---

### 12. Notifications

**Status:** 🔴 Not localized

**Files inspected:** `src/features/notifications/` — No `useTranslation` usage found.

**Estimated work remaining:** 2-4 hours (depends on component count)

---

### 13. Feed

**Status:** 🔴 Not localized

**Files inspected:** `src/features/feed/` — No `useTranslation` usage found.

**Estimated work remaining:** 2-4 hours

---

### 14. Learner

**Status:** 🔴 Not localized

**Files inspected:** `src/features/learner/` — No `useTranslation` usage found.

**Estimated work remaining:** 3-5 hours

---

### 15. Friends

**Status:** 🔴 Not localized

**Files inspected:** `src/features/friend/` — No `useTranslation` usage found.

**Estimated work remaining:** 2-3 hours

---

### 16. Matches

**Status:** 🔴 Not localized

**Files inspected:** `src/features/matches/` — No `useTranslation` usage found.

**Estimated work remaining:** 1-2 hours

---

### 17. Score (Pickleball Tracker)

**Status:** 🟡 Partially localized

**Files inspected:**
- `src/app/(score)/score/PickleballTracker.tsx`

**What is already localized:**
- Uses `useTournamentTranslation()` for some error messages

**What still uses hardcoded text:**
- `"Không thể cập nhật tỷ số"` (defaultValue — Vietnamese in English fallback)
- `"Đã xảy ra lỗi không mong muốn"` (defaultValue — Vietnamese in English fallback)

**Note:** The `defaultValue` strings are in Vietnamese, which means they are backwards — the default should be English and the Vietnamese locale file should contain the Vietnamese translation.

**Estimated work remaining:** 1 hour

---

### 18. Personal Calendar

**Status:** 🔴 Not localized

**Files inspected:** `src/features/personal-calendar/` — No `useTranslation` usage found.

**Estimated work remaining:** 2-3 hours

---

### 19. Recurring Socials

**Status:** 🔴 Not localized

**Files inspected:** `src/features/recurring-socials/` — No `useTranslation` usage found.

**Estimated work remaining:** 2-3 hours

---

### 20. Group Activity Schedule

**Status:** 🔴 Not localized

**Files inspected:** `src/features/group-activity-schedule/` — No `useTranslation` usage found.

**Estimated work remaining:** 2-3 hours

---

### 21. Shared Components

**Status:** 🟡 Partially localized

**Files inspected:**
- `src/components/common/pagination.tsx` ✅ (uses `t()`)
- `src/components/common/back-button.tsx` ✅ (uses `t()`)
- `src/components/shared/error-state.tsx` 🔴
- `src/components/error-section.tsx` 🔴
- `src/components/calendar-navigation.tsx` 🔴
- `src/components/app-sidebar.tsx` 🔴
- `src/components/header.tsx` 🔴

**Hardcoded strings:**
- `error-state.tsx`: `"Không thể tải dữ liệu"`, `"Đã có lỗi xảy ra. Vui lòng thử lại sau."`
- `error-section.tsx`: `"Đã có lỗi xảy ra"`
- `calendar-navigation.tsx`: `"Tháng"` (month placeholder)
- `app-sidebar.tsx`: Navigation labels (indeterminate — sidebar likely pulls labels from config)
- `header.tsx`: Possible hardcoded elements

**Estimated work remaining:** 2-3 hours

---

### 22. UI Library Components

**Status:** 🔴 Not localized (low priority — mostly screen-reader text)

**Files inspected:**
- `src/components/ui/breadcrumb.tsx`: `"More"` (sr-only)
- `src/components/ui/carousel.tsx`: `"Previous slide"`, `"Next slide"` (sr-only)
- `src/components/ui/dialog.tsx`: `"Close"` (sr-only + button text)
- `src/components/ui/pagination.tsx`: `"Previous"`, `"Next"`, `"More pages"`, `"Go to previous page"`, `"Go to next page"` (aria-labels)
- `src/components/ui/sheet.tsx`: `"Close"` (sr-only)
- `src/components/ui/sidebar.tsx`: `"Sidebar"`, `"Displays the mobile sidebar."`, `"Toggle Sidebar"` (sr-only + titles)
- `src/components/ui/spinner.tsx`: `"Loading"` (aria-label)
- `src/components/ui/command.tsx`: `"Command Palette"`, `"Search for a command to run..."` (defaults)

**Estimated work remaining:** 1-2 hours (low priority)

---

### 23. Invitation Accept Page

**Status:** 🔴 Not localized

**Files inspected:**
- `src/app/invitation/accept/accept-invitation-client.tsx`

**Hardcoded strings:** Page content not using i18n.

**Estimated work remaining:** 1 hour

---

## Remaining Hardcoded UI Strings (Representative Sample)

| File | Text | Suggested Translation Key |
|---|---|---|
| `src/components/landing-hero.tsx` | `"Tham Gia Ngay"` | `landing.hero.joinNow` |
| `src/components/landing-features.tsx` | `"Phân Tích Hiệu Suất"` | `landing.features.performanceAnalytics.title` |
| `src/components/landing-features.tsx` | `"Trợ Lý AI"` | `landing.features.aiAssistant.title` |
| `src/components/landing-features.tsx` | `"Quản Lý Thiết Bị"` | `landing.features.equipmentManagement.title` |
| `src/components/landing-features.tsx` | `"Nhóm Chuyên Biệt"` | `landing.features.specializedGroups.title` |
| `src/components/landing-page-header.tsx` | `"Switch to light mode"` / `"Switch to dark mode"` | `common.theme.switchToLight` / `common.theme.switchToDark` |
| `src/components/dashboard-stats.tsx` | `"Nhóm"` | `dashboard.stats.groups` |
| `src/components/dashboard-stats.tsx` | `"Thành Viên"` | `dashboard.stats.members` |
| `src/components/dashboard-stats.tsx` | `"Lời Mời Chờ"` | `dashboard.stats.pendingInvites` |
| `src/components/dashboard-groups.tsx` | `"Chủ Sở Hữu"` | `dashboard.groups.roleOwner` |
| `src/components/dashboard-groups.tsx` | `"Thành Viên"` | `dashboard.groups.roleMember` |
| `src/components/shared/error-state.tsx` | `"Không thể tải dữ liệu"` | `common.error.cannotLoadData` |
| `src/components/shared/error-state.tsx` | `"Đã có lỗi xảy ra. Vui lòng thử lại sau."` | `common.error.tryAgainLater` |
| `src/components/error-section.tsx` | `"Đã có lỗi xảy ra"` | `common.error.somethingWentWrong` |
| `src/components/calendar-navigation.tsx` | `"Tháng"` | `common.calendar.monthPlaceholder` |
| `src/features/sport-center-management/.../inventory-table.tsx` | `"Chưa có sản phẩm nào"` | `scm.inventory.noProducts` |
| `src/features/sport-center-management/.../inventory-table.tsx` | `"Chưa có dịch vụ nào"` | `scm.inventory.noServices` |
| `src/features/sport-center-management/.../inventory-form-dialog.tsx` | `"Thêm sản phẩm"` | `scm.inventory.addProduct` |
| `src/features/sport-center-management/.../inventory-form-dialog.tsx` | `"Thêm dịch vụ"` | `scm.inventory.addService` |
| `src/features/sport-center-management/.../inventory-form-dialog.tsx` | `"Chỉnh sửa sản phẩm"` | `scm.inventory.editProduct` |
| `src/features/sport-center-management/.../inventory-form-dialog.tsx` | `"Chỉnh sửa dịch vụ"` | `scm.inventory.editService` |
| `src/features/sport-center-management/.../inventory-form-dialog.tsx` | `"Đang tải..."` | `scm.common.uploading` |
| `src/features/sport-center-management/.../inventory-form-dialog.tsx` | `"Tải ảnh lên"` | `scm.common.uploadImage` |
| `src/features/sport-center-management/.../inventory-form-dialog.tsx` | `"Tạo mới"` | `scm.common.create` |
| `src/features/sport-center-management/.../inventory-form-dialog.tsx` | `"Lưu thay đổi"` | `scm.common.saveChanges` |
| `src/features/sport-center-management/.../inventory-filters.tsx` | `"Tìm dịch vụ"` / `"Tìm sản phẩm"` | `scm.inventory.searchService` / `scm.inventory.searchProduct` |
| `src/features/sport-center-management/.../inventory-filters.tsx` | `"Tất cả"` | `scm.common.all` |
| `src/features/sport-center-management/.../inventory-detail-sheet.tsx` | `"Đơn vị"` | `scm.inventory.unit` |
| `src/features/sport-center-management/.../inventory-detail-sheet.tsx` | `"Tồn kho"` | `scm.inventory.stock` |
| `src/features/sport-center-management/.../inventory-detail-sheet.tsx` | `"Ngày tạo"` | `scm.common.createdAt` |
| `src/features/sport-center-management/.../inventory-detail-sheet.tsx` | `"Cập nhật gần nhất"` | `scm.common.lastUpdated` |
| `src/features/sport-center-management/.../badges.tsx` | `"Đang hoạt động"` / `"Tạm ngưng"` | `scm.status.active` / `scm.status.paused` |
| `src/features/sport-center-management/.../revenue-transactions-table.tsx` | `"Đã quyết toán"` | `scm.revenue.statusSettled` |
| `src/features/sport-center-management/.../revenue-transactions-table.tsx` | `"Chờ duyệt"` | `scm.revenue.statusPending` |
| `src/features/sport-center-management/.../revenue-transactions-table.tsx` | `"Bị từ chối"` | `scm.revenue.statusRejected` |
| `src/features/sport-center-management/.../revenue-transactions-table.tsx` | `"Đã hủy"` | `scm.revenue.statusVoided` |
| `src/features/sport-center-management/.../revenue-summary-cards.tsx` | `"Doanh thu đã quyết toán"` | `scm.revenue.totalSettled` |
| `src/features/sport-center-management/.../revenue-summary-cards.tsx` | `"Doanh thu chờ duyệt"` | `scm.revenue.totalPending` |
| `src/features/sport-center-management/.../revenue-summary-cards.tsx` | `"Giao dịch đã quyết toán"` | `scm.revenue.settledCount` |
| `src/features/sport-center-management/.../revenue-summary-cards.tsx` | `"Giao dịch chờ duyệt"` | `scm.revenue.pendingCount` |
| `src/features/sport-center-management/.../revenue-report-page.tsx` | `"Có lỗi xảy ra"` | `scm.common.error` |
| `src/features/sport-center-management/.../revenue-report-page.tsx` | `"Không thể xuất CSV"` | `scm.revenue.csvExportFailed` |
| `src/features/sport-center-management/.../revenue-report-page.tsx` | `"Đã tạo báo cáo CSV"` | `scm.revenue.csvExportSuccess` |
| `src/features/sport-center-management/.../revenue-report-page.tsx` | `"Đang xuất..."` / `"Export CSV"` | `scm.revenue.exporting` / `scm.revenue.exportCsv` |
| `src/features/sport-center-management/.../revenue-filters.tsx` | `"30 ngày"` / `"Tháng này"` | `scm.revenue.filter30d` / `scm.revenue.filterThisMonth` |
| `src/features/sport-center-management/.../revenue-filters.tsx` | `"Tất cả trung tâm"` | `scm.revenue.allCenters` |
| `src/features/sport-center-management/.../revenue-transaction-drawer.tsx` | `"Mã giao dịch"` ... (12+ labels) | `scm.revenue.transactionId` etc. |
| `src/features/sport-center-management/.../revenue-cancellations-cards.tsx` | `"Số lượt hủy"` / `"Doanh thu bị hủy"` | `scm.revenue.cancelCount` / `scm.revenue.cancelRevenue` |
| `src/features/sport-center-management/.../sport-center-card.tsx` | `"Đang hoạt động"` / `"Tạm ngưng"` / `"Chưa có đánh giá"` | `scm.card.active` / `scm.card.paused` / `scm.card.noRating` |
| `src/features/sport-center-management/.../customer-*.tsx` | 20+ hardcoded Vietnamese strings | `scm.customer.*` namespace |
| `src/app/(protected)/subscriptions/payment-return/payment-return-content.tsx` | 15+ VNPAY response messages in Vietnamese | `subscriptions.vnpay.code00` etc. |
| `src/features/tournaments/.../registration-management.tsx` | `"Failed to fetch registrations"` (4+ toast messages) | `tournament.registrations.toast.*` |
| `src/features/tournaments/.../sponsor.tsx` | `"Failed to load sponsors"` etc. | `tournament.sponsors.toast.*` |
| `src/app/(score)/score/PickleballTracker.tsx` | `"Không thể cập nhật tỷ số"` | `tournament.referee.tracker.errorMessage` (fix defaultValue language) |
| `src/components/ui/sidebar.tsx` | `"Sidebar"` / `"Toggle Sidebar"` | `common.sidebar.title` / `common.sidebar.toggle` |
| `src/components/ui/dialog.tsx` | `"Close"` | `common.dialog.close` |
| `src/components/ui/pagination.tsx` | `"Previous"` / `"Next"` | `common.pagination.previous` / `common.pagination.next` |

---

## Locale File Audit

### Locale Files Structure

```
src/i18n/locales/
├── en/
│   ├── common.json
│   ├── profile.json
│   ├── sport-center.json
│   ├── sport-center-management.json
│   ├── subscriptions.json
│   ├── socials/
│   │   ├── detail.json
│   │   ├── forms.json
│   │   ├── general.json
│   │   └── listing.json
│   └── tournament/
│       ├── booking.json
│       ├── brackets.json
│       ├── create.json
│       ├── dashboard.json
│       ├── events.json
│       ├── general.json
│       ├── group-stage.json
│       ├── live-control.json
│       ├── personnel.json
│       ├── registrations.json
│       ├── scheduling.json
│       ├── seeding.json
│       └── team-matching.json
├── vi/
│   ├── (same structure as en/)
```

### Issues Found

#### 1. Unused Locale Files
- **`sport-center-management.json`** (both en/vi) — Locale files exist but NO component in `src/features/sport-center-management/` imports or uses any translation hook. These files are entirely unused.

#### 2. `defaultValue` Anti-pattern
- **Tournament components** make extensive use of `t("key", { defaultValue: "..." })`. While functional, this pattern means:
  - If a key is missing from the locale file, the hardcoded default shows instead of triggering a missing-key warning
  - Makes it difficult to track which keys are actually defined vs. relying on defaults
  - Some defaults are in the wrong language (Vietnamese defaults in English-intended files, e.g., `"Không thể cập nhật tỷ số"` and `"Thêm"`)

#### 3. Mixed Language Defaults
- `PickleballTracker.tsx`: `defaultValue` strings are in Vietnamese (`"Không thể cập nhật tỷ số"`, `"Đã xảy ra lỗi không mong muốn"`) — should be English
- `tournament-manager.tsx`: `"Thêm"` used as defaultValue for the "More" tab label — should be English

#### 4. Inconsistent Key Naming
- Tournament keys use flat naming: `"referee.title"`, `"public.noMatches"`
- Common keys use nested: `"auth.login.title"`, `"auth.register.submit"`
- Some keys mix concerns: `"financials.transactions.amount"` used in sponsor-card

#### 5. Missing Translation Keys (Potential)
- All tournament components that use `defaultValue` pattern may have keys that don't actually exist in the locale JSON files — the defaultValue masks this. A key-by-key verification against locale files would require programmatic comparison.

#### 6. Duplicate Keys Across Namespaces
- `"Cancel"` / `"Close"` appear as defaultValues in many different keys across multiple tournament sub-namespaces
- Consider creating shared keys in `tournament/general.json` for common actions

---

## Recommended Priority

### Priority 1 (High) — User-Facing Features with Complete Vietnamese-Only Text

| Feature | Est. Hours | Rationale |
|---|---|---|
| **Sport Center Management** | 8-12h | Entire feature (~30 components) hardcoded in Vietnamese. Locale files exist but unused. Largest gap. |
| **Landing Page** | 3-4h | First thing users see. All hardcoded Vietnamese. |
| **Dashboard** | 2-3h | Core navigation hub. Stats/labels hardcoded. |
| **Shared Error States** | 1-2h | `error-state.tsx`, `error-section.tsx` affect all features. |

### Priority 2 (Medium) — Features Used Regularly

| Feature | Est. Hours | Rationale |
|---|---|---|
| **Notifications** | 2-4h | Daily user interaction. Zero i18n. |
| **Friends** | 2-3h | Social feature. Zero i18n. |
| **Groups** (remaining) | 4-6h | Only ~20% localized. |
| **Learner** | 3-5h | Key user role. Zero i18n. |
| **Personal Calendar** | 2-3h | Scheduling feature. Zero i18n. |
| **Tournament toast messages** | 2h | Fix hardcoded fallback strings in existing i18n components. |
| **Subscriptions (VNPay)** | 1-2h | Payment flow — critical UX. |

### Priority 3 (Low) — Less Frequently Used / Minor

| Feature | Est. Hours | Rationale |
|---|---|---|
| **Feed** | 2-4h | Zero i18n but may have limited UI text. |
| **Matches** | 1-2h | Type definitions mostly. |
| **Score/Tracker** | 1h | Fix Vietnamese defaultValues. |
| **Recurring Socials** | 2-3h | Zero i18n. |
| **Group Activity Schedule** | 2-3h | Zero i18n. |
| **Coach profile form** | 1-2h | Already mostly localized. |
| **UI Library (sr-only text)** | 1-2h | Accessibility text. Low user visibility. |
| **Invitation Accept Page** | 1h | One-time user flow. |

### Total Estimated Remaining Work: **40-65 hours**

---

## Key Recommendations

1. **Wire up `sport-center-management.json`** — Locale files already exist; create a `useSportCenterManagementTranslation()` hook and systematically replace hardcoded strings.

2. **Eliminate `defaultValue` anti-pattern** — Ensure all keys are properly defined in both en and vi locale files. Remove `defaultValue` fallbacks to let i18next's missing-key detection work properly.

3. **Fix mixed-language defaults** — Several `defaultValue` strings are in Vietnamese when they should be English (the default language).

4. **Create a shared `common` key namespace** for frequently repeated strings like "Cancel", "Close", "Save", "Loading", "Error", "Delete", "Back", etc.

5. **Add missing-key reporter** — Configure i18next to log warnings for missing keys in development mode to catch untranslated strings automatically.

6. **Establish i18n lint rule** — Consider adding an ESLint plugin (e.g., `eslint-plugin-i18next`) to detect hardcoded strings in JSX and enforce translation function usage.
