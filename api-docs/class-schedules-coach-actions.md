# Class Schedules — Coach Actions (3 APIs)

## 1. Add a Session Slot

- **API Name:** Add Schedule Slot
- **Endpoint:** `POST /api/coach/classes/{classId}/schedules`
- **Purpose:** Add a new session slot to a class.
- **User Role / Permission:** Coach (authenticated, class owner)
- **Authentication:** Bearer Token

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| classId   | string | Yes      | UUID of the class |

### Request Body — `CreateClassScheduleDto`

| Field           | Type   | Required | Description                     |
| --------------- | ------ | -------- | ------------------------------- |
| scheduledAt     | string | Yes      | ISO 8601 UTC datetime           |
| durationMinutes | number | Yes      | Duration in minutes             |
| topic           | string | No       | Learning objective for session  |
| note            | string | No       | Logistics note                  |

### Request Example

```json
{
  "scheduledAt": "2026-07-12T08:00:00.000Z",
  "durationMinutes": 60,
  "topic": "Introduction to Yoga",
  "note": "Bring your own mat and water bottle"
}
```

### Response — `201 Created`

```json
{
  "id": "uuid",
  "classId": "uuid",
  "scheduledAt": "2026-07-12T08:00:00.000Z",
  "durationMinutes": 60,
  "topic": "Introduction to Yoga",
  "note": "Bring your own mat and water bottle",
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2026-07-02T12:00:00.000Z"
}
```

#### Response Fields

| Field           | Type   | Description                     |
| --------------- | ------ | ------------------------------- |
| id              | string | UUID of the schedule entry      |
| classId         | string | UUID of the parent class        |
| scheduledAt     | string | ISO 8601 UTC datetime           |
| durationMinutes | number | Duration in minutes             |
| topic           | string | Learning objective              |
| note            | string | Logistics note                  |
| createdAt       | string | ISO 8601 timestamp              |
| updatedAt       | string | ISO 8601 timestamp              |

### Error Responses

| Status | Description                        |
| ------ | ---------------------------------- |
| 400    | Validation errors                  |
| 401    | Unauthorized                       |
| 404    | Class not found or not owned by coach |

### Frontend Notes

- Show date/time picker for `scheduledAt`.
- Duration can be a dropdown (30, 60, 90, 120 min) or custom input.
- After adding, refresh schedule list inline (no page reload).

---

## 2. List Schedule Entries

- **API Name:** List Schedule Entries (Coach)
- **Endpoint:** `GET /api/coach/classes/{classId}/schedules`
- **Purpose:** List all schedule entries for a class, ordered chronologically.
- **User Role / Permission:** Coach (authenticated, class owner)
- **Authentication:** Bearer Token

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| classId   | string | Yes      | UUID of the class |

### Query Parameters

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| from      | string | No       | Filter by start date (ISO 8601) |
| to        | string | No       | Filter by end date (ISO 8601)   |

### Request Example

```
GET /api/coach/classes/550e8400-e29b-41d4-a716-446655440000/schedules?from=2026-07-01T00:00:00.000Z&to=2026-07-31T00:00:00.000Z
```

### Response — `200 OK`

```json
[
  {
    "id": "uuid",
    "classId": "550e8400-e29b-41d4-a716-446655440000",
    "scheduledAt": "2026-07-12T08:00:00.000Z",
    "durationMinutes": 60,
    "topic": "Introduction to Yoga",
    "note": "Bring your own mat and water bottle",
    "createdAt": "2026-07-02T12:00:00.000Z",
    "updatedAt": "2026-07-02T12:00:00.000Z"
  },
  {
    "id": "uuid",
    "classId": "550e8400-e29b-41d4-a716-446655440000",
    "scheduledAt": "2026-07-19T08:00:00.000Z",
    "durationMinutes": 90,
    "topic": "Advanced Poses",
    "note": "",
    "createdAt": "2026-07-02T12:00:00.000Z",
    "updatedAt": "2026-07-02T12:00:00.000Z"
  }
]
```

#### Response Fields

| Field           | Type   | Description                     |
| --------------- | ------ | ------------------------------- |
| id              | string | UUID of the schedule entry      |
| classId         | string | UUID of the parent class        |
| scheduledAt     | string | ISO 8601 UTC datetime           |
| durationMinutes | number | Duration in minutes             |
| topic           | string | Learning objective              |
| note            | string | Logistics note                  |
| createdAt       | string | ISO 8601 timestamp              |
| updatedAt       | string | ISO 8601 timestamp              |

### Error Responses

| Status | Description                        |
| ------ | ---------------------------------- |
| 401    | Unauthorized                       |
| 404    | Class not found or not owned by coach |

### Frontend Notes

- Display as a timeline or calendar view.
- Use date range filter to narrow down sessions.
- Each entry should have an edit icon (future feature) and delete icon.

---

## 3. Remove a Session Slot

- **API Name:** Remove Schedule Slot
- **Endpoint:** `DELETE /api/coach/classes/{classId}/schedules/{scheduleId}`
- **Purpose:** Remove a session slot from a class schedule.
- **User Role / Permission:** Coach (authenticated, class owner)
- **Authentication:** Bearer Token

### Path Parameters

| Parameter  | Type   | Required | Description              |
| ---------- | ------ | -------- | ------------------------ |
| classId    | string | Yes      | UUID of the class        |
| scheduleId | string | Yes      | UUID of the schedule entry |

### Request Example

```
DELETE /api/coach/classes/550e8400-e29b-41d4-a716-446655440000/schedules/660e8400-e29b-41d4-a716-446655440001
```

No request body required.

### Response — `200 OK`

```json
{
  "message": "Schedule entry removed successfully"
}
```

### Error Responses

| Status | Description                        |
| ------ | ---------------------------------- |
| 401    | Unauthorized                       |
| 404    | Class or schedule entry not found  |

### Frontend Notes

- Show confirmation dialog before deletion ("Are you sure you want to remove this session?").
- After deletion, remove the entry from the list with animation.
- If learners are enrolled, warn that schedule changes may affect them.
