# Coach Learners

> Tag: `Coach Learners` (3 APIs)

---

## GET /api/coach/learners

List learners (Coach perspective).

### Auth

- **Bearer Token** (Coach role required)

### Query Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| search | string | No | Search by name, email, or userId |
| kind | enum | No | Filter by enrollment type: `class` \| `booking` |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "avatar": "string | null",
      "phone": "string | null",
      "enrolledClassCount": "number",
      "completedBookingCount": "number",
      "lastActiveAt": "string (ISO 8601) | null",
      "status": "active | inactive"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Frontend Notes

- Debounce the search input (~300ms) before sending request.
- The `kind` filter toggles between learners from classes vs. bookings; `null`/omitted returns both.
- Use pagination cursor for infinite scroll or traditional page controls.

---

## GET /api/coach/learners/dashboard

Learner management dashboard summary.

### Auth

- **Bearer Token** (Coach role required)

### Response

```json
{
  "success": true,
  "data": {
    "totalLearners": "number",
    "activeLearners": "number",
    "newThisMonth": "number",
    "classLearners": "number",
    "bookingLearners": "number",
    "unenrolledLearners": "number"
  }
}
```

### Frontend Notes

- Display these stats as highlight cards at the top of the learner management page.
- "Active learners" defined as those with activity in the last 30 days.
- Polling not required; refresh on page mount or pull-to-refresh.

---

## GET /api/coach/learners/{learnerId}

Get full detail for one learner.

### Auth

- **Bearer Token** (Coach role required)

### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| learnerId | uuid | Yes | The learner's unique identifier |

### Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "avatar": "string | null",
    "phone": "string | null",
    "bio": "string | null",
    "joinedAt": "string (ISO 8601)",
    "enrollments": [
      {
        "classId": "uuid",
        "className": "string",
        "enrolledAt": "string (ISO 8601)",
        "status": "active | completed | cancelled"
      }
    ],
    "bookings": [
      {
        "bookingId": "uuid",
        "scheduledAt": "string (ISO 8601)",
        "status": "confirmed | completed | cancelled",
        "durationMinutes": "number"
      }
    ],
    "upcomingSessions": [
      {
        "type": "class | booking",
        "title": "string",
        "startTime": "string (ISO 8601)",
        "endTime": "string (ISO 8601)",
        "status": "upcoming | live"
      }
    ],
    "totalSessions": "number",
    "completedSessions": "number"
  }
}
```

### Frontend Notes

- The `upcomingSessions` array is meant for a "next sessions" widget on the learner profile.
- `enrollments` and `bookings` arrays are typically displayed in separate tabs or sections.
- Consider lazy-loading enrollment/booking history if the arrays grow large; the API may add pagination later.
- Show a quick-action button to message the learner or view their full session history.
