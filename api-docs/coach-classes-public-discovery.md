# Coach Classes — Public Discovery (2 APIs)

## 1. Discover Open Classes

- **API Name:** Discover Open Classes
- **Endpoint:** `GET /api/classes`
- **Purpose:** Browse and discover open classes. Guest accessible.
- **User Role / Permission:** Any (guest allowed)
- **Authentication:** None

### Query Parameters

| Parameter | Type   | Required | Description                          |
| --------- | ------ | -------- | ------------------------------------ |
| city      | string | No       | Filter by coach's city               |
| level     | string | No       | Beginner/Intermediate/Advanced/Pro   |
| from      | string | No       | Filter by start date (ISO 8601)      |
| to        | string | No       | Filter by end date (ISO 8601)        |
| page      | number | No       | Page number (default: 1)             |
| limit     | number | No       | Items per page (default: 20)         |

### Request Example

```
GET /api/classes?city=HCMC&level=Beginner&page=1&limit=12
```

### Response — `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Yoga Fundamentals",
      "description": "A beginner-friendly yoga course.",
      "level": "Beginner",
      "capacity": 20,
      "enrolledCount": 3,
      "priceVnd": 500000,
      "locationDescription": "District 1, HCMC",
      "coverImageUrl": "https://example.com/cover.jpg",
      "status": "OPEN",
      "startDate": "2026-07-10T00:00:00.000Z",
      "endDate": "2026-08-10T00:00:00.000Z",
      "schedules": [
        {
          "id": "uuid",
          "scheduledAt": "2026-07-12T08:00:00.000Z",
          "durationMinutes": 60,
          "topic": "Introduction"
        }
      ],
      "coachProfile": {
        "displayName": "John Doe",
        "avatarUrl": "https://example.com/avatar.jpg",
        "verificationStatus": "VERIFIED",
        "locationCity": "HCMC",
        "bank": {
          "bankName": "Vietcombank",
          "bankAccountNumber": "****1234",
          "bankAccountName": "John Doe"
        }
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4
  }
}
```

#### Response Fields

| Field                            | Type   | Description                     |
| -------------------------------- | ------ | ------------------------------- |
| data[].id                        | string | UUID of the class               |
| data[].title                     | string | Class title                     |
| data[].description               | string | Class description               |
| data[].level                     | string | Difficulty level                |
| data[].capacity                  | number | Max learners                    |
| data[].enrolledCount             | number | Current enrolled count          |
| data[].priceVnd                  | number | Price in VND                    |
| data[].locationDescription       | string | Location description            |
| data[].coverImageUrl             | string | Cover image URL                 |
| data[].status                    | string | Class status                    |
| data[].startDate                 | string | ISO 8601 date                   |
| data[].endDate                   | string | ISO 8601 date                   |
| data[].schedules                 | array  | Schedule preview entries        |
| data[].coachProfile.displayName  | string | Coach display name              |
| data[].coachProfile.avatarUrl    | string | Coach avatar URL                |
| data[].coachProfile.verificationStatus | string | Coach verification status |
| data[].coachProfile.locationCity | string | Coach's city                    |
| data[].coachProfile.bank         | object | Bank info for payment (masked)  |
| meta.page                        | number | Current page                    |
| meta.limit                       | number | Items per page                  |
| meta.total                       | number | Total results                   |
| meta.totalPages                  | number | Total pages                     |

### Error Responses

| Status | Description                        |
| ------ | ---------------------------------- |
| 400    | Invalid query parameters           |

### Frontend Notes

- **Discovery page** with filter sidebar (city, level, date range).
- Show **coach avatar**, **class title**, **price**, and **schedule preview** in cards.
- Include **pagination** at the bottom.
- Show enrollment progress indicator (e.g., "3/20 enrolled").
- Mask bank account numbers for security.

---

## 2. Get Class Public Detail

- **API Name:** Get Class Public Detail
- **Endpoint:** `GET /api/classes/{classId}`
- **Purpose:** View full detail of a published class. Guest accessible.
- **User Role / Permission:** Any (guest allowed)
- **Authentication:** None

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| classId   | string | Yes      | UUID of the class |

### Request Example

```
GET /api/classes/550e8400-e29b-41d4-a716-446655440000
```

### Response — `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "coachProfileId": "uuid",
  "title": "Yoga Fundamentals",
  "description": "A beginner-friendly yoga course.",
  "level": "Beginner",
  "capacity": 20,
  "enrolledCount": 3,
  "priceVnd": 500000,
  "locationDescription": "District 1, HCMC",
  "coverImageUrl": "https://example.com/cover.jpg",
  "status": "OPEN",
  "startDate": "2026-07-10T00:00:00.000Z",
  "endDate": "2026-08-10T00:00:00.000Z",
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2026-07-02T12:00:00.000Z",
  "schedules": [
    {
      "id": "uuid",
      "scheduledAt": "2026-07-12T08:00:00.000Z",
      "durationMinutes": 60,
      "topic": "Introduction",
      "note": "Bring your own mat"
    },
    {
      "id": "uuid",
      "scheduledAt": "2026-07-19T08:00:00.000Z",
      "durationMinutes": 60,
      "topic": "Basic Poses",
      "note": ""
    }
  ],
  "coachProfile": {
    "displayName": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "verificationStatus": "VERIFIED",
    "locationCity": "HCMC",
    "bank": {
      "bankName": "Vietcombank",
      "bankAccountNumber": "****1234",
      "bankAccountName": "John Doe"
    }
  }
}
```

#### Response Fields

| Field                            | Type   | Description                     |
| -------------------------------- | ------ | ------------------------------- |
| id                               | string | UUID of the class               |
| coachProfileId                   | string | UUID of the coach profile       |
| title                            | string | Class title                     |
| description                      | string | Class description               |
| level                            | string | Difficulty level                |
| capacity                         | number | Max learners                    |
| enrolledCount                    | number | Current enrolled count          |
| priceVnd                         | number | Price in VND                    |
| locationDescription              | string | Location description            |
| coverImageUrl                    | string | Cover image URL                 |
| status                           | string | Class status                    |
| startDate                        | string | ISO 8601 date                   |
| endDate                          | string | ISO 8601 date                   |
| createdAt                        | string | ISO 8601 timestamp              |
| updatedAt                        | string | ISO 8601 timestamp              |
| schedules                        | array  | Full schedule entries           |
| coachProfile.displayName         | string | Coach display name              |
| coachProfile.avatarUrl           | string | Coach avatar URL                |
| coachProfile.verificationStatus  | string | Coach verification status       |
| coachProfile.locationCity        | string | Coach's city                    |
| coachProfile.bank                | object | Bank info for payment (masked)  |

### Error Responses

| Status | Description                        |
| ------ | ---------------------------------- |
| 404    | Class not found or not OPEN/ONGOING|

### Frontend Notes

- **Class detail page** — hero section with cover image, title, price, coach info.
- Show full schedule timeline.
- **Enroll button** — visible only if status is OPEN and capacity not reached.
- Show bank info for payment transfer (account number masked).
- If class is not OPEN/ONGOING, show 404 or "Class is no longer available" message.
