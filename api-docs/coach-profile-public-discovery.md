# Coach Profile — Public Discovery

> Tag: `"Coach Profile — Public Discovery"`

---

## 1. Discover Coaches

### Endpoint

**GET** `/api/coaches`

### Purpose

Returns a paginated list of all **ACTIVE** coaches for public discovery and searching.

### User Role / Permission

Guest — no authentication required. Available to all users (including unauthenticated visitors).

### Authentication

None.

### Path Parameters

None.

### Query Parameters

| Parameter | Type | Required | Default | Max | Description |
|---|---|---|---|---|---|
| `city` | string | No | — | — | Filter by city (case-insensitive, partial match) |
| `level` | string | No | — | — | Filter by level: `Beginner` / `Intermediate` / `Advanced` / `Pro` |
| `page` | number | No | `1` | — | Page number for pagination |
| `limit` | number | No | `10` | `50` | Number of items per page |

### Request Body

None.

### Response

**Status `200 OK`**

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Response Fields

**`data`** — Array of coach profile summaries:

| Field | Type | Description |
|---|---|---|
| `id` | string (UUID) | Coach profile ID |
| `userId` | string (UUID) | Associated user account ID |
| `displayName` | string | Public display name |
| `avatarUrl` | string | Avatar image URL |
| `level` | string | `Beginner` / `Intermediate` / `Advanced` / `Pro` |
| `yearsExperience` | number | Years of coaching experience |
| `specialties` | array[string] | List of coaching specialties |
| `languages` | array[string] | Languages spoken |
| `locationCity` | string | City of operation |
| `hourlyRateVnd` | number | Hourly rate in VND |
| `verificationStatus` | string | `VERIFIED` / `UNVERIFIED` / `REJECTED` |
| `createdAt` | string (ISO 8601) | Profile creation timestamp |
| `averageRating` | number | Average rating from reviews |
| `reviewCount` | number | Total number of reviews |

**`pagination`**:

| Field | Type | Description |
|---|---|---|
| `page` | number | Current page number |
| `limit` | number | Items per page |
| `total` | number | Total number of matching coaches |
| `totalPages` | number | Total number of pages |

### Response Example

```json
{
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "userId": "7d8e9f10-1234-5678-abcd-ef0123456789",
      "displayName": "Nguyễn Văn A",
      "avatarUrl": "https://storage.example.com/avatars/user123.jpg",
      "level": "Pro",
      "yearsExperience": 10,
      "specialties": ["Gym", "Yoga"],
      "languages": ["Tiếng Việt", "English"],
      "locationCity": "Hồ Chí Minh",
      "hourlyRateVnd": 500000,
      "verificationStatus": "VERIFIED",
      "createdAt": "2026-07-02T10:30:00.000Z",
      "averageRating": 4.5,
      "reviewCount": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Error Responses

| Status | Description |
|---|---|
| `400 Bad Request` | Invalid query parameter values (e.g., `limit > 50`) |

### Frontend Notes

- Used for the **Coach Discovery / Search** page (trang tìm kiếm huấn luyện viên).
- Implement **pagination** controls using the `pagination` object.
- Show **filter dropdowns** for:
  - `city` — text input with debounce
  - `level` — dropdown with options: `Beginner`, `Intermediate`, `Advanced`, `Pro`
- **Debounce** the city filter input (recommended: 300–500ms) to avoid excessive API calls.
- **Cache results** locally to reduce repeated requests when navigating between pages.
- Display coach cards showing: avatar, name, level, specialties, location, rate, rating, verification badge.

---

## 2. Get Coach Public Profile

### Endpoint

**GET** `/api/coaches/{coachId}`

### Purpose

Returns the full public profile of a specific coach, including certifications, bank information, and ratings.

### User Role / Permission

Guest — no authentication required.

### Authentication

None.

### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `coachId` | string (UUID) | ✅ Yes | The unique identifier of the coach profile |

### Query Parameters

None.

### Request Body

None.

### Response

**Status `200 OK`**

Returns the full coach profile object (same as the private profile but accessible publicly).

### Response Fields

| Field | Type | Description |
|---|---|---|
| `id` | string (UUID) | Coach profile ID |
| `userId` | string (UUID) | Associated user account ID |
| `displayName` | string | Public display name |
| `bio` | string | Coach biography |
| `avatarUrl` | string | Avatar image URL |
| `level` | string | `Beginner` / `Intermediate` / `Advanced` / `Pro` |
| `yearsExperience` | number | Years of experience |
| `specialties` | array[string] | List of specialties |
| `languages` | array[string] | Languages spoken |
| `locationCity` | string | City |
| `hourlyRateVnd` | number | Hourly rate in VND |
| `paymentAccountName` | string | Bank account holder name |
| `paymentAccountNumber` | string | Bank account number |
| `paymentBankName` | string | Bank name |
| `paymentQrUrl` | string | QR code image URL for payment |
| `status` | string | Profile status (`ACTIVE`) |
| `verificationStatus` | string | `VERIFIED` / `UNVERIFIED` / `REJECTED` |
| `createdAt` | string (ISO 8601) | Profile creation timestamp |
| `updatedAt` | string (ISO 8601) | Last update timestamp |
| `certifications` | array | List of certifications (each with `id`, `name`, `issuingOrganization`, `issuedAt`, `expiresAt`, `documentUrl`, `verificationStatus`) |
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
      "verificationStatus": "VERIFIED"
    }
  ],
  "averageRating": 4.5,
  "reviewCount": 12
}
```

### Error Responses

| Status | Description |
|---|---|
| `404 Not Found` | Coach not found or profile is not publicly available (not ACTIVE) |

### Frontend Notes

- Used for the **Coach Detail Page** (trang chi tiết huấn luyện viên).
- Display all profile information:
  - Avatar, name, bio, level, experience, specialties, languages, location
  - **Bank information** (`paymentAccountName`, `paymentAccountNumber`, `paymentBankName`, `paymentQrUrl`) — shown for payment/booking purposes
- Show certifications with **verification badges**:
  - `VERIFIED` → green badge
  - `UNVERIFIED` → yellow badge
  - `REJECTED` → red badge
- Display the rating section with `averageRating` and `reviewCount`.
- Used in the **booking / enrollment flow** — user can see coach details before booking a class.

---

## 3. List Open Classes for a Coach

### Endpoint

**GET** `/api/coaches/{coachId}/classes`

### Purpose

Returns all **OPEN** and **ONGOING** classes belonging to a specific coach, each including the first 3 upcoming schedule entries.

### User Role / Permission

Guest — no authentication required.

### Authentication

None.

### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `coachId` | string (UUID) | ✅ Yes | The unique identifier of the coach profile |

### Query Parameters

None.

### Request Body

None.

### Response

**Status `200 OK`**

Returns an array of class objects. Each class includes basic info and its first 3 upcoming schedule entries.

### Response Fields

Each class object contains:

| Field | Type | Description |
|---|---|---|
| `id` | string (UUID) | Class ID |
| `name` | string | Class name |
| `description` | string | Class description |
| `status` | string | `OPEN` / `ONGOING` |
| `schedule` | array | First 3 upcoming schedule entries |
| `...` | ... | Other class fields as defined by the Class entity |

Each schedule entry contains:

| Field | Type | Description |
|---|---|---|
| `startTime` | string (ISO 8601) | Scheduled start time |
| `endTime` | string (ISO 8601) | Scheduled end time |
| `location` | string | Location or meeting link |
| `...` | ... | Other schedule fields |

### Response Example

```json
[
  {
    "id": "class-001",
    "name": "Yoga Buổi Sáng",
    "description": "Lớp yoga nhẹ nhàng cho người mới bắt đầu",
    "status": "OPEN",
    "schedule": [
      {
        "startTime": "2026-07-05T06:00:00.000Z",
        "endTime": "2026-07-05T07:00:00.000Z",
        "location": "Phòng tập 101, 123 Nguyễn Huệ, Quận 1"
      },
      {
        "startTime": "2026-07-07T06:00:00.000Z",
        "endTime": "2026-07-07T07:00:00.000Z",
        "location": "Phòng tập 101, 123 Nguyễn Huệ, Quận 1"
      },
      {
        "startTime": "2026-07-09T06:00:00.000Z",
        "endTime": "2026-07-09T07:00:00.000Z",
        "location": "Phòng tập 101, 123 Nguyễn Huệ, Quận 1"
      }
    ]
  },
  {
    "id": "class-002",
    "name": "Gym Cơ Bản",
    "description": "Lớp tập gym cơ bản với huấn luyện viên",
    "status": "ONGOING",
    "schedule": [
      {
        "startTime": "2026-07-04T08:00:00.000Z",
        "endTime": "2026-07-04T09:30:00.000Z",
        "location": "Phòng tập 202, 123 Nguyễn Huệ, Quận 1"
      },
      {
        "startTime": "2026-07-06T08:00:00.000Z",
        "endTime": "2026-07-06T09:30:00.000Z",
        "location": "Phòng tập 202, 123 Nguyễn Huệ, Quận 1"
      },
      {
        "startTime": "2026-07-08T08:00:00.000Z",
        "endTime": "2026-07-08T09:30:00.000Z",
        "location": "Phòng tập 202, 123 Nguyễn Huệ, Quận 1"
      }
    ]
  }
]
```

### Error Responses

| Status | Description |
|---|---|
| `404 Not Found` | Coach not found |

### Frontend Notes

- Display on the **Coach Detail Page** under a section titled **"Available Classes"** / "Lớp học khả dụng".
- For each class show: name, description, status badge (`OPEN` / `ONGOING`), and the next 3 upcoming schedule times.
- Each schedule item should display: date, time range, and location.
- If no classes are available, show an empty state: "No classes available at the moment" / "Hiện chưa có lớp học nào".
- Clicking on a class should navigate the user to the class detail or booking page.
