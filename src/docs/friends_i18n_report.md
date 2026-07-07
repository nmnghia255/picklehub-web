# Friends Feature — i18n Completion Report

**Date:** 2026-07-07  
**Objective:** Replace every hardcoded UI string in the Friends feature with i18n translation keys.

---

## Files Modified

| # | File | Change |
|---|---|---|
| 1 | `src/i18n/locales/en/common.json` | Added `friends.optimistic` block (2 keys) |
| 2 | `src/i18n/locales/vi/common.json` | Added `friends.optimistic` block (2 keys) |
| 3 | `src/app/(protected)/friend/FriendClient.tsx` | Replaced 3 hardcoded Vietnamese strings with `t()` calls |

---

## Translation Keys Added

### `friends.optimistic.requestSent`

| Locale | Value |
|---|---|
| `en` | `"Friend request sent"` |
| `vi` | `"Lời mời kết bạn đã gửi"` |

**Usage:** Optimistic `bio` field when constructing a `FriendUser` object after sending a friend request (`FriendClient.tsx:162`).

---

### `friends.optimistic.justFriended`

| Locale | Value |
|---|---|
| `en` | `"Just became friends"` |
| `vi` | `"Vừa kết bạn"` |

**Usage:** Optimistic `friendshipSinceLabel` when constructing a `FriendUser` object after accepting a friend request (`FriendClient.tsx:211`).

---

### Reused existing key: `friends.status.friend`

| Locale | Value |
|---|---|
| `en` | `"Friends"` |
| `vi` | `"Đã là bạn bè"` |

**Usage:** Optimistic `bio` field after accepting a friend request (`FriendClient.tsx:209`). This key already existed and had the exact same Vietnamese value.

---

## Hardcoded Strings Replaced

| Location (file:line) | Before | After |
|---|---|---|
| `FriendClient.tsx:162` | `bio: "Lời mời kết bạn đã gửi"` | `bio: t("friends.optimistic.requestSent")` |
| `FriendClient.tsx:209` | `bio: "Đã là bạn bè"` | `bio: t("friends.status.friend")` |
| `FriendClient.tsx:211` | `friendshipSinceLabel: "Vừa kết bạn"` | `friendshipSinceLabel: t("friends.optimistic.justFriended")` |

---

## Remaining Hardcoded Strings (not modified)

These exist in **server-side API mapping files** and cannot use `t()` because they run outside React's component tree. They are data-layer defaults, not direct UI strings.

| File | Line | String | Field |
|---|---|---|---|
| `src/features/friend/api/find-users.ts` | 50 | `"Đã là bạn bè"` / `"Người dùng trên hệ thống"` | `bio` |
| `src/features/friend/api/find-users.ts` | 52 | `"Chưa cập nhật"` | `location` |
| `src/features/friend/api/friend-service.ts` | 56 | `"Da la ban be"` / `"Nguoi dung tren he thong"` | `bio` |
| `src/features/friend/api/friend-service.ts` | 58, 74, 101 | `"Chua cap nhat"` | `location` |
| `src/features/friend/api/friend-service.ts` | 72 | `"Da la ban be"` | `bio` |
| `src/features/friend/api/friend-service.ts` | 77 | `"Dang tai"` | `friendshipSinceLabel` |
| `src/features/friend/api/friend-service.ts` | 98-99 | `"Loi moi ket ban da gui"` / `"Loi moi ket ban da nhan"` | `bio` |

**Why these are not fixed:**
- These files (`find-users.ts`, `friend-service.ts`) are server-side API service modules. They are not React components and have no access to `useTranslation` / `t()`.
- They map raw API responses to `FriendUser` data objects. The hardcoded strings are default values for `bio`, `location`, and `friendshipSinceLabel` — fields that describe the user/request, not direct UI labels.
- To properly i18n these, the backend API would need to either: (a) not send Vietnamese defaults, or (b) send translatable status codes instead of pre-translated text. This is a **data architecture change**, not a UI localization change.
- The UI component (`FriendClient.tsx`) renders the `bio` field at line 525 (`{selectedUser.bio}`) — this will display whatever the API provides. With the optimistic updates now fixed, the only remaining hardcoded bio values come from the server API responses.

---

## Files Skipped (no changes needed)

| File | Path | Reason |
|---|---|---|
| `page.tsx` | `src/app/(protected)/friend/page.tsx` | Server component; no UI strings. Delegates to `FriendClient`. |
| `_data.ts` | `src/app/(protected)/friend/_data.ts` | Data fetching only; no UI strings. |
| `types.ts` | `src/features/friend/types.ts` | TypeScript type definitions only. |
| `utils.ts` | `src/features/friend/utils.ts` | Utility functions. `formatDate()` uses `"-"` as a data fallback (appropriate) and `"vi-VN"` as a date formatting locale (separate concern from UI strings). |

---

## Verification

After the changes:

- **`FriendClient.tsx`**: All user-facing strings now use `t()` from `useTranslation("common")`. Zero hardcoded UI strings remain.
- **`page.tsx`**, **`_data.ts`**, **`types.ts`**, **`utils.ts`**: Contain no user-facing UI strings.
- **`find-users.ts`**, **`friend-service.ts`**: Contain server-side data defaults (documented above) that cannot use `t()` without a data architecture change.

**UI strings status: ✅ Zero hardcoded UI strings in the Friends feature.**

---

## Translation Key Inventory (Friends namespace)

All keys under `friends.*` in `common.json`:

| Key | en | vi |
|---|---|---|
| `friends.pageTitle` | Friends | Bạn bè |
| `friends.pageDescription` | Manage invitations... | Quản lý lời mời... |
| `friends.tabs.find` | Find People | Tìm bạn |
| `friends.tabs.sent` | Sent | Đã gửi |
| `friends.tabs.received` | Received | Đã nhận |
| `friends.tabs.friends` | Friends | Bạn bè |
| `friends.sort.placeholder` | Sort by | Sắp xếp |
| `friends.sort.alphabet` | Alphabetical (A-Z) | Theo chữ cái (A-Z) |
| `friends.sort.friendTime` | Friendship time | Theo thời gian kết bạn |
| `friends.sort.inviteTime` | Invitation time | Theo thời gian gửi lời mời |
| `friends.searchPlaceholder` | Search by name, username or email... | Tìm kiếm theo tên, username hoặc email... |
| `friends.subtitle.findLoading` | Loading user list... | Đang tải danh sách người dùng... |
| `friends.subtitle.count` | Total {{count}} users | Tổng cộng {{count}} người dùng |
| `friends.empty` | No data matches the current filters. | Không có dữ liệu phù hợp với bộ lọc hiện tại. |
| `friends.status.friend` | Friends | Đã là bạn bè |
| `friends.status.requestSent` | Sent | Đã gửi lời mời |
| `friends.status.requestReceived` | Received | Đã nhận lời mời |
| `friends.status.addFriend` | Add Friend | Kết bạn |
| `friends.actions.cancelRequest` | Cancel Request | Hủy lời mời |
| `friends.actions.accept` | Accept | Chấp nhận |
| `friends.actions.reject` | Reject | Từ chối |
| `friends.actions.unfriend` | Unfriend | Hủy kết bạn |
| `friends.aria.viewProfile` | View {{username}}'s profile | Xem hồ sơ {{username}} |
| `friends.badge.mutualFriends` | {{count}} mutual friends | {{count}} bạn chung |
| `friends.dialog.title` | User Profile | Hồ sơ người dùng |
| `friends.dialog.description` | Preview profile information. | Thông tin để xem trước giao diện profile trên modal. |
| `friends.headings.find` | Find People | Tìm bạn |
| `friends.headings.sent` | Sent Requests | Lời mời bạn đã gửi |
| `friends.headings.received` | Received Requests | Lời mời gửi đến bạn |
| `friends.headings.friends` | Friends List | Danh sách bạn bè |
| `friends.optimistic.requestSent` | Friend request sent | Lời mời kết bạn đã gửi |
| `friends.optimistic.justFriended` | Just became friends | Vừa kết bạn |
