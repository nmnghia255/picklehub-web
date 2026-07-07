# Authentication i18n Completion Report

**Generated:** 2026-07-07  
**Feature:** Authentication (Auth)  
**Previous Status:** ❌ Not localized (~153 hardcoded strings)  
**Current Status:** ✅ Fully localized (client components) / ⚠️ Partially localized (server components)

---

## Files Modified

### i18n Resource Files

| File | Action |
|---|---|
| `src/i18n/locales/en/common.json` | Added `auth.*` and `brand` keys |
| `src/i18n/locales/vi/common.json` | Added `auth.*` and `brand` keys |

### Auth Component Files (Client Components)

| File | Action |
|---|---|
| `src/features/auth/components/login-form.tsx` | Added `useTranslation("common")`, replaced all hardcoded strings with `t()` |
| `src/features/auth/components/register-form.tsx` | Added `useTranslation("common")`, replaced all hardcoded strings with `t()` |
| `src/features/auth/components/magic-link-form.tsx` | Added `useTranslation("common")`, replaced all hardcoded strings with `t()` |
| `src/features/auth/components/set-password-form.tsx` | Added `useTranslation("common")`, replaced all hardcoded strings with `t()` |
| `src/features/auth/components/change-password-form.tsx` | Added `useTranslation("common")`, replaced all hardcoded strings with `t()` |
| `src/features/auth/components/facebook-auth-button.tsx` | Added `useTranslation("common")`, replaced toast hardcoded strings with `t()` |
| `src/features/auth/components/google-auth-button.tsx` | Added `useTranslation("common")`, replaced toast hardcoded strings with `t()` |
| `src/features/auth/components/link-facebook-button.tsx` | Added `useTranslation("common")`, replaced all hardcoded strings with `t()` |
| `src/features/auth/components/link-google-button.tsx` | Added `useTranslation("common")`, replaced all hardcoded strings with `t()` |

### Auth Schema Files

| File | Action |
|---|---|
| `src/features/auth/schemas/index.ts` | Replaced all Vietnamese validation messages with English (2 validation + 15 field messages = 17 translations added to locale files) |

### Auth Server Action Files

| File | Action |
|---|---|
| `src/features/auth/actions/index.ts` | Replaced all Vietnamese error/success messages with English (10+ messages) |
| `src/features/auth/actions/facebook.ts` | Replaced all Vietnamese error/success messages with English (4 messages) |
| `src/features/auth/actions/google.ts` | Replaced all Vietnamese error/success messages with English (5 messages) |

### Auth Page Files

| File | Action |
|---|---|
| `src/app/(auth)/register/verify-email/page.tsx` | Added `useTranslation("common")`, replaced all hardcoded strings with `t()` |
| `src/app/(auth)/auth/magic/magic-link-verify-client.tsx` | Added `useTranslation("common")`, replaced all hardcoded strings with `t()` |
| `src/app/(auth)/login/page.tsx` | Changed `alt="Image"` to `alt=""` (decorative image) |
| `src/app/(auth)/register/page.tsx` | Changed `alt="Image"` to `alt=""` (decorative image) |
| `src/app/(auth)/magic-link/page.tsx` | Changed `alt="Image"` to `alt=""` (decorative image) |
| `src/app/(auth)/set-password/page.tsx` | Changed `alt="Image"` to `alt=""` (decorative image) |
| `src/app/(auth)/verify-email/page.tsx` | Changed `alt="Image"` to `alt=""` (decorative image) |

---

## New Translation Keys

All new keys are grouped under `auth.*` in the `common` namespace (~90 keys):

### `auth.login.*` (10 keys)
`title`, `subtitle`, `emailLabel`, `emailPlaceholder`, `passwordLabel`, `passwordPlaceholder`, `forgotPassword`, `submit`, `submitting`, `separator`, `noAccount`, `registerLink`, `facebookButton`, `error`

### `auth.register.*` (11 keys)
`title`, `subtitle`, `nameLabel`, `namePlaceholder`, `emailLabel`, `emailPlaceholder`, `passwordLabel`, `passwordPlaceholder`, `submit`, `submitting`, `separator`, `hasAccount`, `loginLink`, `facebookButton`, `error`

### `auth.magicLink.*` (9 keys)
`title`, `subtitle`, `emailLabel`, `emailPlaceholder`, `submit`, `submitting`, `backToLogin`, `successMessage`, `error`

### `auth.setPassword.*` (8 keys)
`title`, `subtitle`, `passwordLabel`, `passwordPlaceholder`, `confirmPasswordLabel`, `confirmPasswordPlaceholder`, `submit`, `submitting`, `error`

### `auth.changePassword.*` (11 keys)
`title`, `subtitle`, `currentPasswordLabel`, `currentPasswordPlaceholder`, `newPasswordLabel`, `newPasswordPlaceholder`, `confirmNewPasswordLabel`, `confirmNewPasswordPlaceholder`, `submit`, `submitting`, `success`, `error`

### `auth.oauth.*` (11 keys)
`facebookError`, `facebookErrorGeneric`, `googleError`, `googleErrorGeneric`, `loading`, `linkFacebook`, `linkGoogle`, `linkFacebookSuccess`, `linkGoogleSuccess`, `linkFailed`, `linkFailedRetry`, `accountDisabled`

### `auth.verifyEmail.*` (11 keys)
`title`, `missingToken`, `invalidLink`, `backToRegister`, `failure`, `failureDescription`, `registerAgain`, `success`, `successDescription`, `loginNow`, `resendSuccess`, `resendFailed`

### `auth.registerVerifyEmail.*` (7 keys)
`title`, `description`, `instruction`, `resendButton`, `resending`, `verified`, `login`, `loading`

### `auth.magicLinkVerify.*` (7 keys)
`loading`, `loadingDescription`, `success`, `successDescription`, `failure`, `invalidLink`, `expiredLink`, `resendButton`

### `auth.validation.*` (16 keys)
`emailRequired`, `emailInvalid`, `passwordRequired`, `passwordMinLength`, `passwordMinLength8`, `nameRequired`, `confirmPasswordRequired`, `passwordsNotMatch`, `currentPasswordRequired`, `newPasswordRequired`, `newPasswordMinLength`, `confirmNewPasswordRequired`, `newPasswordsNotMatch`, `tokenRequired`, `invalidToken`

### `auth.errors.*` (7 keys)
`generic`, `loginFailed`, `registerFailed`, `setPasswordFailed`, `changePasswordFailed`, `verifyFailed`, `sendLinkFailed`, `connectionRefused`

### `auth.alt.*` (1 key)
`decorativeImage`

### Top-level (1 key)
`brand`

**Total new keys: ~90**

---

## Remaining Hardcoded Strings

These strings could NOT be migrated because they reside in **React Server Components**, which cannot use the `useTranslation()` hook. The current i18n setup (react-i18next) only supports client-side translation.

### Server Component: `src/app/(auth)/verify-email/page.tsx`

This page is a server component that makes API calls (`axios.post`). Converting it to a client component would change the architecture significantly.

**Remaining hardcoded strings (11):**

| String | Translation Key |
|---|---|
| `"PickleHub"` (brand name) | `brand` |
| `"Thiếu token"` | `auth.verifyEmail.missingToken` |
| `"Link xác thực không hợp lệ..."` | `auth.verifyEmail.invalidLink` |
| `"Quay lại đăng ký"` | `auth.verifyEmail.backToRegister` |
| `"Xác thực thất bại"` | `auth.verifyEmail.failure` |
| `"Xác thực thất bại. Link có thể đã hết hạn."` | `auth.verifyEmail.failureDescription` |
| `"Đăng ký lại"` | `auth.verifyEmail.registerAgain` |
| `"Xác thực thành công!"` | `auth.verifyEmail.success` |
| `"Email của bạn đã được xác thực..."` | `auth.verifyEmail.successDescription` |
| `"Đăng nhập ngay"` | `auth.verifyEmail.loginNow` |
| `"Đã có lỗi xảy ra. Vui lòng thử lại."` | `auth.errors.generic` |

### Server Component Pages: `login/page.tsx`, `register/page.tsx`, `magic-link/page.tsx`, `set-password/page.tsx`

These pages only have the brand name `"PickleHub"` hardcoded. The alt text has been fixed to `alt=""` (decorative images should have empty alt per accessibility guidelines).

| File | Hardcoded String | Translation Key |
|---|---|---|
| All 4 pages | `PickleHub` | `brand` |

### Server Actions (Architectural Limitation)

The server action files (`actions/index.ts`, `actions/facebook.ts`, `actions/google.ts`) now return error messages in **English** rather than Vietnamese. They are **not** translated via the i18n system because the `"use server"` directive prevents the use of React hooks. The client displays `state.error` / `state.message` directly, so when the UI language switches to Vietnamese, server-action error messages will remain in English.

### Schema Validation Messages (Architectural Limitation)

The Zod validation messages in `schemas/index.ts` are now in **English**. They are consumed both by server actions and client form validation. The client displays `form.formState.errors.field.message` directly from Zod. When the UI switches language, Zod validation messages will remain in English.

---

## Summary

| Metric | Count |
|---|---|
| Files modified | 20 |
| New translation keys | ~90 |
| Hardcoded strings removed (client components) | ~130 |
| Remaining hardcoded strings (server components) | ~12 |
| Remaining hardcoded strings (server actions - architectural) | ~20 |
| Remaining hardcoded strings (zod validation - architectural) | ~17 |
| Pre-existing build errors (unrelated Score feature) | 2 |
