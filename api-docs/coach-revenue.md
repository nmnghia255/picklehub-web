# Coach Revenue

> Tag: `Coach Revenue` (3 APIs)

---

## GET /api/coach/revenue/summary

Revenue summary aggregated by period.

### Auth

- **Bearer Token** (Coach role required)

### Query Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| period | enum | No | Aggregation period: `month` (default) \| `quarter` \| `year` |
| year | integer | No | Target year (default: current year) |

### Response

```json
{
  "success": true,
  "data": {
    "classRevenueVnd": "number",
    "bookingRevenueVnd": "number",
    "totalRevenueVnd": "number",
    "buckets": [
      {
        "periodLabel": "string",
        "classRevenueVnd": "number",
        "bookingRevenueVnd": "number",
        "totalRevenueVnd": "number"
      }
    ]
  }
}
```

### Frontend Notes

- Used for the revenue chart at the top of the coach financial dashboard.
- `buckets` are monthly (Jan, Feb, ...), quarterly (Q1, Q2, ...), or yearly depending on `period`.
- Render a stacked bar chart: class revenue vs booking revenue per bucket.
- `periodLabel` format examples: `"2026-01"`, `"2026-Q1"`, `"2026"`.
- All amounts are in VND — format with locale string (vi-VN) and suffix "₫".
- Period switcher (Month / Quarter / Year) updates chart without page reload.

---

## GET /api/coach/revenue/classes

Per-class settled revenue.

### Auth

- **Bearer Token** (Coach role required)

### Query Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |
| from | string (ISO 8601) | No | Start date filter |
| to | string (ISO 8601) | No | End date filter |

### Response

```json
{
  "success": true,
  "data": [
    {
      "classId": "uuid",
      "className": "string",
      "totalSessions": "number",
      "settledSessions": "number",
      "enrolledLearners": "number",
      "revenueVnd": "number",
      "settledAt": "string (ISO 8601) | null"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

### Frontend Notes

- Table view with columns: Class Name, Sessions (settled/total), Learners, Revenue, Settled Date.
- Sortable by revenue (descending by default on the backend).
- Click a row to navigate to the class detail page showing breakdown per session.
- Date range picker filters by settlement date.

---

## GET /api/coach/revenue/bookings

Per-booking settled revenue.

### Auth

- **Bearer Token** (Coach role required)

### Query Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |
| from | string (ISO 8601) | No | Start date filter |
| to | string (ISO 8601) | No | End date filter |

### Response

```json
{
  "success": true,
  "data": [
    {
      "bookingId": "uuid",
      "learner": {
        "userId": "uuid",
        "name": "string",
        "avatar": "string | null"
      },
      "scheduledAt": "string (ISO 8601)",
      "durationMinutes": "number",
      "revenueVnd": "number",
      "settledAt": "string (ISO 8601) | null"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 30,
    "totalPages": 2
  }
}
```

### Frontend Notes

- Table view with columns: Learner, Date & Time, Duration, Revenue, Settled Date.
- `learner` info includes avatar — render a thumbnail + name.
- Click learner name to navigate to their learner profile page.
- Date range picker filters by settlement date.
- Combine classes + bookings data to show a unified revenue report if needed.
