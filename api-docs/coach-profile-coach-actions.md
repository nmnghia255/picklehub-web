# Coach Profile — Coach Actions

> Tag: `"Coach Profile — Coach Actions"`

---

## 1. Register as a Coach

### Endpoint

**POST** `/api/coach/profile`

### Purpose

Creates a new coach profile. Bank information is required. The profile status starts as **DRAFT** and is not publicly visible until published.

### User Role / Permission

Any authenticated user (not required to be a coach already).

### Authentication

Requires Bearer Token (JWT).

- Header: `Authorization: Bearer <token>`

### Path Parameters

None.

### Query Parameters

None.

### Request Body

`application/json` — **CreateCoachProfileDto**

| Field | Type | Required | Description |
|---|---|---|---|
| `displayName` | string | ✅ Yes | Public display name on the profile |
| `bio` | string | No | Coach biography |
| `avatarUrl` | string | No | URL of the avatar image |
| `level` | string | No | `Beginner` / `Intermediate` / `Advanced` / `Pro` |
| `yearsExperience` | number | No | Years of coaching experience |
| `specialties` | array[string] | No | List of coaching specialties |
| `languages` | array[string] | No | Languages the coach speaks |
| `locationCity` | string | No | City of operation |
| `hourlyRateVnd` | number | No | Hourly rate in VND |
| `paymentAccountName` | string | ✅ Yes | Bank account holder name |
| `paymentAccountNumber` | string | ✅ Yes | Bank account number |
| `paymentBankName` | string | ✅ Yes | Name of the bank |
| `paymentQrUrl` | string | No | URL of the bank QR code image |

### Request Example

```json
{
  "displayName": "Nguyễn Văn A",
  "bio": "Huấn luyện viên thể hình với 10 năm kinh nghiệm",
  "avatarUrl": "https://storage.example.com/avatars/user123.jpg",
  "level": "Pro",
  "yearsExperience": 10,
  "specialties": ["Gym", "Yoga", "Dinh dưỡng"],
  "languages": ["Tiếng Việt", "English"],
  "locationCity": "Hồ Chí Minh",
  "hourlyRateVnd": 500000,
  "paymentAccountName": "NGUYEN VAN A",
  "paymentAccountNumber": "1234567890",
  "paymentBankName": "Vietcombank",
  "paymentQrUrl": "https://storage.example.com/qr/user123.jpg"
}
```

### Response

**Status `201 Created`**

The full coach profile object is returned.

### Response Fields

| Field | Type | Description |
|---|---|---|
| `id` | string (UUID) | Unique profile identifier |
| `userId` | string (UUID) | ID of the associated user account |
| `displayName` | string | Public display name |
| `bio` | string | Coach biography |
| `avatarUrl` | string | Avatar image URL |
| `level` | string | `Beginner` / `Intermediate` / `Advanced` / `Pro` |
| `yearsExperience` | number | Years of experience |
| `specialties` | array[string] | List of specialties |
| `languages` | array[string] | List of languages |
| `locationCity` | string | City |
| `hourlyRateVnd` | number | Hourly rate in VND |
| `paymentAccountName` | string | Bank account holder name |
| `paymentAccountNumber` | string | Bank account number |
| `paymentBankName` | string | Bank name |
| `paymentQrUrl` | string | QR code image URL |
| `status` | string | Always `"DRAFT"` on creation |
| `verificationStatus` | string | Always `"UNVERIFIED"` on creation |
| `createdAt` | string (ISO 8601) | Timestamp of creation |
| `updatedAt` | string (ISO 8601) | Timestamp of last update |
| `certifications` | array | List of certifications (empty on creation) |
| `averageRating` | number | Average rating (default `0`) |
| `reviewCount` | number | Number of reviews (default `0`) |

### Response Example

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "userId": "7d8e9f10-1234-5678-abcd-ef0123456789",
  "displayName": "Nguyễn Văn A",
  "bio": "Huấn luyện viên thể hình với 10 năm kinh nghiệm",
  "avatarUrl": "https://storage.example.com/avatars/user123.jpg",
  "level": "Pro",
  "yearsExperience": 10,
  "specialties": ["Gym", "Yoga", "Dinh dưỡng"],
  "languages": ["Tiếng Việt", "English"],
  "locationCity": "Hồ Chí Minh",
  "hourlyRateVnd": 500000,
  "paymentAccountName": "NGUYEN VAN A",
  "paymentAccountNumber": "1234567890",
  "paymentBankName": "Vietcombank",
  "paymentQrUrl": "https://storage.example.com/qr/user123.jpg",
  "status": "DRAFT",
  "verificationStatus": "UNVERIFIED",
  "createdAt": "2026-07-02T10:30:00.000Z",
  "updatedAt": "2026-07-02T10:30:00.000Z",
  "certifications": [],
  "averageRating": 0,
  "reviewCount": 0
}
```

### Error Responses

| Status | Description |
|---|---|
| `401 Unauthorized` | Missing or invalid Bearer Token |
| `409 Conflict` | A coach profile already exists for this user (`"message": "Profile already exists"`) |

### Frontend Notes

- Called when the user clicks the **"Register as Coach"** button.
- The registration form **must** collect bank information:
  - `paymentAccountName`, `paymentAccountNumber`, `paymentBankName` are **required** fields.
  - Provide a QR code image upload option (converted to URL before sending).
- After a successful `201` response, redirect the user to the **Coach Dashboard** page.
- The profile will be in **DRAFT** status — the user must publish it before it becomes visible to the public.

---

## 2. Get My Coach Profile

### Endpoint

**GET** `/api/coach/profile/me`

### Purpose

Returns the full coach profile of the authenticated coach, including bank account information and all certifications with their verification statuses.

### User Role / Permission

Coach only (must have already registered as a coach).

### Authentication

Requires Bearer Token (JWT).

- Header: `Authorization: Bearer <token>`

### Path Parameters

None.

### Query Parameters

None.

### Request Body

None.

### Response

**Status `200 OK`**

### Response Fields

Same full profile object as in `POST /api/coach/profile`, plus the `certifications` array populated with full details.

**Certification fields:**

| Field | Type | Description |
|---|---|---|
| `id` | string (UUID) | Certification identifier |
| `name` | string | Certification name |
| `issuingOrganization` | string | Organization that issued the cert |
| `issuedAt` | string (ISO 8601) | Issue date |
| `expiresAt` | string (ISO 8601) | Expiration date |
| `documentUrl` | string | URL of the certification document |
| `verificationStatus` | string | `VERIFIED` / `UNVERIFIED` / `REJECTED` |
| `reviewedByUserId` | string (UUID) | ID of the admin who reviewed (nullable) |
| `reviewNote` | string | Note from reviewer (nullable) |
| `createdAt` | string (ISO 8601) | Timestamp of certification creation |
| `updatedAt` | string (ISO 8601) | Timestamp of last update |

**Additional profile fields:**

| Field | Type | Description |
|---|---|---|
| `averageRating` | number | Average rating from reviews |
| `reviewCount` | number | Total number of reviews |

### Response Example

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "userId": "7d8e9f10-1234-5678-abcd-ef0123456789",
  "displayName": "Nguyễn Văn A",
  "bio": "Huấn luyện viên thể hình với 10 năm kinh nghiệm",
  "avatarUrl": "https://storage.example.com/avatars/user123.jpg",
  "level": "Pro",
  "yearsExperience": 10,
  "specialties": ["Gym", "Yoga", "Dinh dưỡng"],
  "languages": ["Tiếng Việt", "English"],
  "locationCity": "Hồ Chí Minh",
  "hourlyRateVnd": 500000,
  "paymentAccountName": "NGUYEN VAN A",
  "paymentAccountNumber": "1234567890",
  "paymentBankName": "Vietcombank",
  "paymentQrUrl": "https://storage.example.com/qr/user123.jpg",
  "status": "ACTIVE",
  "verificationStatus": "VERIFIED",
  "createdAt": "2026-07-02T10:30:00.000Z",
  "updatedAt": "2026-07-02T11:00:00.000Z",
  "certifications": [
    {
      "id": "cert-001",
      "name": "Certified Personal Trainer",
      "issuingOrganization": "ACE Fitness",
      "issuedAt": "2025-01-15T00:00:00.000Z",
      "expiresAt": "2028-01-15T00:00:00.000Z",
      "documentUrl": "https://storage.example.com/certs/cert-001.pdf",
      "verificationStatus": "VERIFIED",
      "reviewedByUserId": "admin-uuid",
      "reviewNote": "Tài liệu hợp lệ",
      "createdAt": "2026-07-02T10:35:00.000Z",
      "updatedAt": "2026-07-02T10:50:00.000Z"
    }
  ],
  "averageRating": 4.5,
  "reviewCount": 12
}
```

### Error Responses

| Status | Description |
|---|---|
| `401 Unauthorized` | Missing or invalid Bearer Token |
| `404 Not Found` | Coach profile does not exist for this user |

### Frontend Notes

- Used for the **Coach Dashboard** and **Profile Management** page.
- Display all profile fields, **including bank account information** (for the coach to review).
- Show certifications with **verification badges**:
  - `VERIFIED` → green badge
  - `UNVERIFIED` → yellow/orange badge
  - `REJECTED` → red badge
- Use the `averageRating` and `reviewCount` to display the coach's rating summary.

---

## 3. Update My Coach Profile

### Endpoint

**PATCH** `/api/coach/profile/me`

### Purpose

Updates any editable field of the coach profile. All fields in the request body are **optional** — only provided fields will be updated.

### User Role / Permission

Coach only (must have an existing coach profile).

### Authentication

Requires Bearer Token (JWT).

- Header: `Authorization: Bearer <token>`

### Path Parameters

None.

### Query Parameters

None.

### Request Body

`application/json` — **UpdateCoachProfileDto**

Same fields as `CreateCoachProfileDto`, but **all fields are optional**:

| Field | Type | Required | Description |
|---|---|---|---|
| `displayName` | string | No | Public display name |
| `bio` | string | No | Coach biography |
| `avatarUrl` | string | No | Avatar URL |
| `level` | string | No | `Beginner` / `Intermediate` / `Advanced` / `Pro` |
| `yearsExperience` | number | No | Years of experience |
| `specialties` | array[string] | No | List of specialties |
| `languages` | array[string] | No | List of languages |
| `locationCity` | string | No | City |
| `hourlyRateVnd` | number | No | Hourly rate in VND |
| `paymentAccountName` | string | No | Bank account holder name |
| `paymentAccountNumber` | string | No | Bank account number |
| `paymentBankName` | string | No | Bank name |
| `paymentQrUrl` | string | No | QR code image URL |

### Request Example

```json
{
  "displayName": "Nguyễn Văn A - Updated",
  "bio": "Cập nhật thông tin mới",
  "hourlyRateVnd": 600000
}
```

### Response

**Status `200 OK`**

Returns the updated full profile object (same structure as `GET /api/coach/profile/me`).

### Error Responses

| Status | Description |
|---|---|
| `401 Unauthorized` | Missing or invalid Bearer Token |
| `404 Not Found` | Coach profile not found for this user |

### Frontend Notes

- Used for the **Edit Profile** form on the Coach Dashboard.
- **Only send changed fields** — do not send the entire object if only a few fields changed.
- After receiving a `200` response, refresh the displayed profile data.
- For bank info changes, consider showing a confirmation dialog since these are sensitive.

---

## 4. Publish My Profile

### Endpoint

**POST** `/api/coach/profile/me/publish`

### Purpose

Changes the profile status from **DRAFT** to **ACTIVE**, making the profile publicly visible on the coach discovery page.

### User Role / Permission

Coach only (must have an existing coach profile in DRAFT status).

### Authentication

Requires Bearer Token (JWT).

- Header: `Authorization: Bearer <token>`

### Path Parameters

None.

### Query Parameters

None.

### Request Body

None. Empty body.

### Response

**Status `200 OK`**

Returns the profile object with `status` now set to `"ACTIVE"`.

### Response Example

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "userId": "7d8e9f10-1234-5678-abcd-ef0123456789",
  "displayName": "Nguyễn Văn A",
  "status": "ACTIVE",
  "verificationStatus": "UNVERIFIED",
  "averageRating": 0,
  "reviewCount": 0,
  "certifications": [],
  "createdAt": "2026-07-02T10:30:00.000Z",
  "updatedAt": "2026-07-02T11:00:00.000Z"
}
```

### Error Responses

| Status | Description |
|---|---|
| `400 Bad Request` | Profile is already `ACTIVE` or `SUSPENDED` — cannot publish again |
| `401 Unauthorized` | Missing or invalid Bearer Token |
| `404 Not Found` | Coach profile not found for this user |

### Frontend Notes

- Show the **"Publish Profile"** button **only** when the profile status is **DRAFT**.
- After a successful publish:
  - Show a success message: "Profile is live" / "Hồ sơ đã được công khai".
  - Change the UI state to reflect that the profile is now public.
- If the backend returns a `400` error, display an appropriate message (e.g., "Profile is already active").
