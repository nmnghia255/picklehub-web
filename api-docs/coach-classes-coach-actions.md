# Coach Classes — Coach Actions (6 APIs)

## 1. Create a Class

- **API Name:** Create Class
- **Endpoint:** `POST /api/coach/classes`
- **Purpose:** Creates a class in DRAFT status. Add schedules after creation.
- **User Role / Permission:** Coach (authenticated)
- **Authentication:** Bearer Token

### Request Body — `CreateCoachClassDto`

| Field              | Type   | Required | Description              |
| ------------------ | ------ | -------- | ------------------------ |
| title              | string | Yes      | Class title              |
| description        | string | No       | Class description        |
| level              | string | No       | Beginner/Intermediate/Advanced/Pro |
| capacity           | number | Yes      | Maximum learners         |
| priceVnd           | number | Yes      | Price in VND             |
| locationDescription| string | No       | Location description     |
| coverImageUrl      | string | No       | Cover image URL          |
| startDate          | string | No       | ISO 8601 date            |
| endDate            | string | No       | ISO 8601 date            |

### Request Example

```json
{
  "title": "Yoga Fundamentals",
  "description": "A beginner-friendly yoga course.",
  "level": "Beginner",
  "capacity": 20,
  "priceVnd": 500000,
  "locationDescription": "District 1, HCMC",
  "coverImageUrl": "https://example.com/cover.jpg",
  "startDate": "2026-07-10T00:00:00.000Z",
  "endDate": "2026-08-10T00:00:00.000Z"
}
```

### Response — `201 Created`

```json
{
  "id": "uuid",
  "coachProfileId": "uuid",
  "title": "Yoga Fundamentals",
  "description": "A beginner-friendly yoga course.",
  "level": "Beginner",
  "capacity": 20,
  "enrolledCount": 0,
  "priceVnd": 500000,
  "locationDescription": "District 1, HCMC",
  "coverImageUrl": "https://example.com/cover.jpg",
  "status": "DRAFT",
  "startDate": "2026-07-10T00:00:00.000Z",
  "endDate": "2026-08-10T00:00:00.000Z",
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2026-07-02T12:00:00.000Z",
  "schedules": []
}
```

#### Response Fields

| Field              | Type   | Description                     |
| ------------------ | ------ | ------------------------------- |
| id                 | string | UUID of the class               |
| coachProfileId     | string | UUID of the coach profile       |
| title              | string | Class title                     |
| description        | string | Class description               |
| level              | string | Difficulty level                |
| capacity           | number | Max learners                    |
| enrolledCount      | number | Current enrolled (0 on creation)|
| priceVnd           | number | Price in VND                    |
| locationDescription| string | Location description            |
| coverImageUrl      | string | Cover image URL                 |
| status             | string | Always "DRAFT" on creation      |
| startDate          | string | ISO 8601 date                   |
| endDate            | string | ISO 8601 date                   |
| createdAt          | string | ISO 8601 timestamp              |
| updatedAt          | string | ISO 8601 timestamp              |
| schedules          | array  | Empty array on creation         |

### Error Responses

| Status | Description                        |
| ------ | ---------------------------------- |
| 400    | Validation errors                  |
| 401    | Unauthorized (missing/invalid token)|
| 404    | No coach profile found             |

### Frontend Notes

- Show success toast and redirect to class detail page.
- Schedules are added separately after creation.

---

## 2. List My Classes

- **API Name:** List My Classes (Coach)
- **Endpoint:** `GET /api/coach/classes`
- **Purpose:** Retrieve all classes belonging to the authenticated coach.
- **User Role / Permission:** Coach (authenticated)
- **Authentication:** Bearer Token

### Query Parameters

| Parameter | Type   | Required | Description                          |
| --------- | ------ | -------- | ------------------------------------ |
| status    | string | No       | DRAFT/OPEN/FULL/ONGOING/COMPLETED/CANCELLED |
| level     | string | No       | Filter by level                      |
| from      | string | No       | Filter by start date (ISO 8601)      |
| to        | string | No       | Filter by end date (ISO 8601)        |
| page      | number | No       | Page number (default: 1)             |
| limit     | number | No       | Items per page (default: 20)         |

### Request Example

```
GET /api/coach/classes?status=OPEN&page=1&limit=10
```

### Response — `200 OK`

```json
[
  {
    "id": "uuid",
    "coachProfileId": "uuid",
    "title": "Yoga Fundamentals",
    "description": "A beginner-friendly yoga course.",
    "level": "Beginner",
    "capacity": 20,
    "priceVnd": 500000,
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
      }
    ],
    "_count": {
      "enrollments": 3
    }
  }
]
```

#### Response Fields

| Field              | Type   | Description                     |
| ------------------ | ------ | ------------------------------- |
| id                 | string | UUID of the class               |
| coachProfileId     | string | UUID of the coach profile       |
| title              | string | Class title                     |
| description        | string | Class description               |
| level              | string | Difficulty level                |
| capacity           | number | Max learners                    |
| priceVnd           | number | Price in VND                    |
| status             | string | Current status                  |
| startDate          | string | ISO 8601 date                   |
| endDate            | string | ISO 8601 date                   |
| createdAt          | string | ISO 8601 timestamp              |
| updatedAt          | string | ISO 8601 timestamp              |
| schedules          | array  | Array of schedule entries       |
| _count.enrollments | number | Total enrollment count          |

### Error Responses

| Status | Description                        |
| ------ | ---------------------------------- |
| 401    | Unauthorized                       |

### Frontend Notes

- Display classes in a table/card layout with status badges.
- Use filters (status, level, date range) for search experience.
- Show enrollment progress (enrolledCount vs capacity).

---

## 3. Get My Class Detail

- **API Name:** Get My Class Detail (Coach)
- **Endpoint:** `GET /api/coach/classes/{classId}`
- **Purpose:** Get full detail of a specific class owned by the coach.
- **User Role / Permission:** Coach (authenticated, owner)
- **Authentication:** Bearer Token

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| classId   | string | Yes      | UUID of the class |

### Request Example

```
GET /api/coach/classes/550e8400-e29b-41d4-a716-446655440000
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
    }
  ],
  "_count": {
    "enrollments": 3
  }
}
```

### Error Responses

| Status | Description                        |
| ------ | ---------------------------------- |
| 401    | Unauthorized                       |
| 404    | Class not found or not owned by coach |

### Frontend Notes

- Navigate here after creating a class.
- Show schedules list with add/remove actions.
- Display enrollment count and progress bar.

---

## 4. Update a Class

- **API Name:** Update Class (Coach)
- **Endpoint:** `PATCH /api/coach/classes/{classId}`
- **Purpose:** Update class details. Only DRAFT or OPEN classes can be edited.
- **User Role / Permission:** Coach (authenticated, owner)
- **Authentication:** Bearer Token

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| classId   | string | Yes      | UUID of the class |

### Request Body — `UpdateCoachClassDto`

All fields from `CreateCoachClassDto` are optional.

| Field              | Type   | Required | Description              |
| ------------------ | ------ | -------- | ------------------------ |
| title              | string | No       | Class title              |
| description        | string | No       | Class description        |
| level              | string | No       | Beginner/Intermediate/Advanced/Pro |
| capacity           | number | No       | Maximum learners         |
| priceVnd           | number | No       | Price in VND             |
| locationDescription| string | No       | Location description     |
| coverImageUrl      | string | No       | Cover image URL          |
| startDate          | string | No       | ISO 8601 date            |
| endDate            | string | No       | ISO 8601 date            |

### Request Example

```json
{
  "title": "Yoga Fundamentals — Updated",
  "priceVnd": 600000
}
```

### Response — `200 OK`

Returns the updated class object (same shape as Get Class Detail).

### Error Responses

| Status | Description                        |
| ------ | ---------------------------------- |
| 400    | Class is not in editable status (not DRAFT or OPEN) |
| 401    | Unauthorized                       |
| 404    | Class not found or not owned by coach |

### Frontend Notes

- Only enable edit form when status is DRAFT or OPEN.
- Show warning if class is FULL/ONGOING/COMPLETED/CANCELLED (non-editable).
- Auto-save or save button pattern.

---

## 5. Publish a Class

- **API Name:** Publish Class (Coach)
- **Endpoint:** `POST /api/coach/classes/{classId}/publish`
- **Purpose:** Change class status from DRAFT to OPEN, making it visible to learners.
- **User Role / Permission:** Coach (authenticated, owner)
- **Authentication:** Bearer Token

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| classId   | string | Yes      | UUID of the class |

### Request Example

```
POST /api/coach/classes/550e8400-e29b-41d4-a716-446655440000/publish
```

No request body required.

### Response — `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "OPEN",
  "updatedAt": "2026-07-02T12:00:00.000Z"
}
```

### Error Responses

| Status | Description                        |
| ------ | ---------------------------------- |
| 400    | Class is not in DRAFT status       |
| 401    | Unauthorized                       |
| 404    | Class not found or not owned by coach |

### Frontend Notes

- Add confirmation dialog ("Are you sure you want to publish this class? It will be visible to learners.").
- After publish, redirect to class detail or show updated status badge.
- Disable publish button if already OPEN or beyond.

---

## 6. Cancel a Class

- **API Name:** Cancel Class (Coach)
- **Endpoint:** `POST /api/coach/classes/{classId}/cancel`
- **Purpose:** Cancel a class. Changes any status (except CANCELLED/COMPLETED) to CANCELLED.
- **User Role / Permission:** Coach (authenticated, owner)
- **Authentication:** Bearer Token

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| classId   | string | Yes      | UUID of the class |

### Request Example

```
POST /api/coach/classes/550e8400-e29b-41d4-a716-446655440000/cancel
```

No request body required.

### Response — `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "CANCELLED",
  "updatedAt": "2026-07-02T12:00:00.000Z"
}
```

### Error Responses

| Status | Description                        |
| ------ | ---------------------------------- |
| 400    | Class is already CANCELLED or COMPLETED |
| 401    | Unauthorized                       |
| 404    | Class not found or not owned by coach |

### Frontend Notes

- Add confirmation dialog ("This action cannot be undone. Enrolled learners will be notified.").
- Show cancellation reason optional field (to be handled by business logic).
- After cancel, disable further edits and show CANCELLED badge.
