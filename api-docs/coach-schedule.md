# Coach Schedule

> Tag: `Coach Schedule` (2 APIs)

---

## GET /api/coach/schedule

Get the authenticated coach's combined coaching schedule.

### Auth

- **Bearer Token** (Coach role required)

### Query Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| kind | enum | No | Filter by type: `all` (default) \| `class` \| `booking` |
| state | enum | No | Filter by state: `all` (default) \| `upcoming` \| `live` \| `past` \| `pending` |
| learnerId | uuid | No | Filter by specific learner |
| classId | uuid | No | Filter by specific class |
| from | string (ISO 8601) | No | Start of date range |
| to | string (ISO 8601) | No | End of date range |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |
| sort | enum | No | Sort order: `asc` (default) \| `desc` |

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "class | booking",
      "title": "string",
      "description": "string | null",
      "startTime": "string (ISO 8601)",
      "endTime": "string (ISO 8601)",
      "status": "upcoming | live | past | pending",
      "learners": [
        {
          "userId": "uuid",
          "name": "string",
          "avatar": "string | null"
        }
      ],
      "classId": "uuid | null",
      "bookingId": "uuid | null",
      "location": "string | null",
      "meetingUrl": "string | null",
      "learnerCount": "number"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  },
  "summary": {
    "total": "number",
    "classCount": "number",
    "bookingCount": "number",
    "upcomingCount": "number",
    "liveCount": "number",
    "pastCount": "number",
    "pendingCount": "number"
  },
  "filters": {
    "learners": [
      { "userId": "uuid", "name": "string" }
    ],
    "classes": [
      { "classId": "uuid", "title": "string" }
    ]
  }
}
```

### Frontend Notes

- This is the coach's timetable / calendar dashboard — their main scheduling view.
- The `learners` array inside each item powers attendee avatars (show first 3–5, then "+N" overflow badge).
- `learnerCount` is useful for quick-scan list items without expanding.
- Summary counts drive filter tabs (Upcoming / Live / Past / Pending).
- Coach can click a session to open a detail panel with learner roster, meeting link, and action buttons (start session, cancel, reschedule).
- Apply `from`/`to` filters for week-view or month-view calendar navigation.

---

## GET /api/coach/schedule/internal/query-by-user

Internal endpoint to query a coach's schedule by user ID.

### Auth

- **Internal Token** (`x-internal-token` header)

### Query Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| userId | uuid | Yes | The user to query schedules for |
| kind | enum | No | Same as above |
| state | enum | No | Same as above |
| learnerId | uuid | No | Same as above |
| classId | uuid | No | Same as above |
| from | string (ISO 8601) | No | Same as above |
| to | string (ISO 8601) | No | Same as above |
| page | integer | No | Same as above |
| limit | integer | No | Same as above |
| sort | enum | No | Same as above |

### Response

Same structure as `GET /api/coach/schedule`.

### Frontend Notes

- Internal-use only. Not intended for public frontend consumption.
- Used by admin dashboards and backend service-to-service calls.
