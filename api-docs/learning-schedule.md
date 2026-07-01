# Learning Schedule

> Tag: `Learning Schedule` (2 APIs)

---

## GET /api/learner/schedule

Get the authenticated learner's combined learning schedule (class sessions + booking sessions).

### Auth

- **Bearer Token** (Learner role required)

### Query Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| kind | enum | No | Filter by type: `all` (default) \| `class` \| `booking` |
| state | enum | No | Filter by state: `all` (default) \| `upcoming` \| `live` \| `past` \| `pending` |
| coachProfileId | uuid | No | Filter by coach profile |
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
      "coach": {
        "coachProfileId": "uuid",
        "name": "string",
        "avatar": "string | null"
      },
      "classId": "uuid | null",
      "bookingId": "uuid | null",
      "location": "string | null",
      "meetingUrl": "string | null",
      "isReviewed": "boolean"
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
    "coachProfiles": [
      { "coachProfileId": "uuid", "name": "string" }
    ],
    "classes": [
      { "classId": "uuid", "title": "string" }
    ]
  }
}
```

### Frontend Notes

- This is the main view for the learner's timetable/calendar page.
- The `summary` object can power a segmented filter bar (e.g., tabs for All, Upcoming, Live, Past, Pending).
- The `filters` block provides dynamic filter options — use `coachProfiles` and `classes` to populate dropdown filters without a separate API call.
- Use `isReviewed` on past sessions to show/hide a "Write a review" button.
- Calendar view: map items to calendar events using `startTime`/`endTime` and color-code by `type` (class vs booking).
- List view: group items by date with sticky date headers.

---

## GET /api/learner/schedule/internal/query-by-user

Internal endpoint to query a learner's schedule by user ID.

### Auth

- **Internal Token** (`x-internal-token` header)

### Query Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| userId | uuid | Yes | The user to query schedules for |
| kind | enum | No | Same as above |
| state | enum | No | Same as above |
| from | string (ISO 8601) | No | Same as above |
| to | string (ISO 8601) | No | Same as above |
| page | integer | No | Same as above |
| limit | integer | No | Same as above |
| sort | enum | No | Same as above |

### Response

Same structure as `GET /api/learner/schedule`.

### Frontend Notes

- This endpoint is **not** for direct frontend usage — it serves internal services (admin panels, webhooks, BFF).
- Do not expose this route in client-side code or documentation for public consumption.
