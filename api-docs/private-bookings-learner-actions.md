# Private Bookings — Learner Actions

---

## POST /api/coaches/{coachId}/bookings — Request a 1-on-1 Private Session

**Purpose:** Creates a booking in `PENDING_CONFIRMATION` status. The price is auto-calculated as:

```
round((durationMinutes / 60) × hourlyRateVnd / 1000) × 1000
```

**Auth:** Bearer Token (Learner)

### Path Parameters

| Name      | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| coachId   | string | ✅       | ID of the target coach |

### Request Body — `CreatePrivateBookingDto`

| Field           | Type   | Required | Description                    |
|-----------------|--------|----------|--------------------------------|
| sessionAt       | string | ✅       | ISO 8601 UTC datetime          |
| durationMinutes | number | ✅       | Session length in minutes      |
| learnerNote     | string | ❌       | Optional note from the learner |

### Response — 201 Created

```json
{
  "id": "string",
  "coachProfileId": "string",
  "learnerId": "string",
  "sessionAt": "2026-07-02T10:00:00Z",
  "durationMinutes": 60,
  "priceVnd": 500000,
  "status": "PENDING_CONFIRMATION",
  "paymentStatus": null,
  "learnerProfile": { ... },
  "coachProfile": { ... }
}
```

### Error Responses

| Status | Description                                  |
|--------|----------------------------------------------|
| 400    | Coach has no hourly rate set                 |
| 404    | Coach not found or not ACTIVE                |

### Frontend Notes

- **When to call:** On the coach detail/profile page, after the learner selects a date/time and duration, then clicks "Request Booking".
- **State management:** Store the returned booking object (including `id`) in local state or a bookings store. Set `isSubmitting = true` during the request to disable the submit button.
- **Loading:** Show a full-page or modal spinner while the request is in flight.
- **Error handling:** If 400 is returned, display "This coach has not set an hourly rate yet." If 404, show "Coach not available."
- **Validation:** Ensure `sessionAt` is a future datetime and `durationMinutes` is a positive integer (e.g., min 30, max 480). Disable the button until valid.
- **Post-success:** Navigate the learner to the "My Bookings" list so they can see the pending request.

---

## GET /api/learner/bookings — List My Booking Requests

**Purpose:** Returns a paginated list of the authenticated learner's bookings, including coach profile and bank info.

**Auth:** Bearer Token (Learner)

### Query Parameters

| Name   | Type   | Required | Description                                                   |
|--------|--------|----------|---------------------------------------------------------------|
| status | string | ❌       | Filter: `PENDING_CONFIRMATION`, `CONFIRMED`, `COMPLETED`, `REJECTED`, `CANCELLED` |
| from   | string | ❌       | ISO 8601 start date filter                                    |
| to     | string | ❌       | ISO 8601 end date filter                                      |
| page   | number | ❌       | Page number (default: 1)                                      |
| limit  | number | ❌       | Items per page (default: 10)                                  |

### Response — 200 OK

```json
{
  "data": [
    {
      "id": "string",
      "coachProfileId": "string",
      "learnerId": "string",
      "sessionAt": "2026-07-02T10:00:00Z",
      "durationMinutes": 60,
      "priceVnd": 500000,
      "status": "PENDING_CONFIRMATION",
      "paymentStatus": null,
      "paymentProofUrl": null,
      "coachProfile": {
        "id": "string",
        "fullName": "string",
        "avatarUrl": "string",
        "hourlyRateVnd": 500000,
        "bio": "string",
        "bankInfo": {
          "bankName": "string",
          "accountNumber": "string",
          "accountHolder": "string"
        }
      },
      "learnerNote": "string",
      "coachNote": "string",
      "cancelReason": "string",
      "createdAt": "2026-07-01T12:00:00Z",
      "updatedAt": "2026-07-01T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3
  }
}
```

### Frontend Notes

- **When to call:** On the "My Bookings" page mount, and whenever the learner switches a status filter tab or paginates.
- **State management:** Keep `bookings[]`, `currentPage`, `totalPages`, and `activeStatusFilter` in a Zustand store or React context so the list survives navigation.
- **Loading:** Show a skeleton list (e.g., 5 placeholder rows) while fetching.
- **Empty state:** If `data` is empty, display an illustration and "No bookings yet. Find a coach to get started!" with a CTA button linking to the coach search page.
- **Refetch triggers:** Re-fetch after a successful booking creation, payment proof upload, or cancellation so the list is always fresh.
- **Pagination:** Render a pagination component at the bottom; update `page` query param on click.

---

## PATCH /api/learner/bookings/{bookingId}/payment-proof — Upload Payment Proof

**Purpose:** Uploads a payment proof URL for a booking. Moves `paymentStatus` from `null` → `PENDING_REVIEW`. Only allowed when `status === "CONFIRMED"`.

**Auth:** Bearer Token (Learner)

### Path Parameters

| Name      | Type   | Required | Description                     |
|-----------|--------|----------|---------------------------------|
| bookingId | string | ✅       | ID of the confirmed booking      |

### Request Body — `UploadBookingProofDto`

| Field           | Type   | Required | Description                      |
|-----------------|--------|----------|----------------------------------|
| paymentProofUrl | string | ✅       | URL of the uploaded proof image   |

### Response — 200 OK

```json
{
  "id": "string",
  "paymentProofUrl": "https://cdn.example.com/proofs/abc.jpg",
  "paymentStatus": "PENDING_REVIEW",
  "status": "CONFIRMED",
  "updatedAt": "2026-07-02T11:00:00Z"
}
```

### Error Responses

| Status | Description                                    |
|--------|------------------------------------------------|
| 400    | Booking is not in CONFIRMED status             |
| 404    | Booking not found or not owned by this learner |

### Frontend Notes

- **When to call:** On the booking detail page, after the learner has transferred money and uploaded a screenshot. A file upload component should trigger a CDN upload first (e.g., Cloudinary/S3), then this endpoint is called with the returned URL.
- **State management:** Track `paymentProofUrl` and `paymentStatus` locally. After success, optimistically set `paymentStatus = "PENDING_REVIEW"`.
- **Loading:** Show an upload progress bar (file upload → CDN) then a button spinner for the API call. Disable the upload button while in flight to prevent double-submit.
- **Validation:** Accept only image files (jpeg, png, webp) under 5 MB. Reject on the frontend before uploading to CDN.
- **Post-success:** Show a success toast "Payment proof submitted. Awaiting coach confirmation." and update the UI to reflect `PENDING_REVIEW` state (e.g., a yellow badge).
- **Edge case:** If the booking status is not `CONFIRMED`, show an inline error explaining that payment proof can only be uploaded after the coach confirms the booking.

---

## DELETE /api/learner/bookings/{bookingId} — Cancel My Booking Request

**Purpose:** Cancels a booking request. Only allowed when `status` is `PENDING_CONFIRMATION` or `CONFIRMED` (but NOT when `paymentStatus === "SETTLED"`).

**Auth:** Bearer Token (Learner)

### Path Parameters

| Name      | Type   | Required | Description                |
|-----------|--------|----------|----------------------------|
| bookingId | string | ✅       | ID of the booking to cancel |

### Response — 200 OK

```json
{
  "id": "string",
  "status": "CANCELLED",
  "cancelReason": null,
  "updatedAt": "2026-07-02T11:30:00Z"
}
```

### Error Responses

| Status | Description                                                  |
|--------|--------------------------------------------------------------|
| 400    | Booking cannot be cancelled (e.g., already completed, payment settled) |
| 404    | Booking not found or not owned by this learner               |

### Frontend Notes

- **When to call:** From the booking detail page or booking list via a "Cancel" button/icon. Always present a confirmation dialog before executing.
- **State management:** After successful cancellation, optimistically remove or update the booking in local state to `CANCELLED`. This avoids a full refetch for instant feedback.
- **Loading:** Show a spinner on the "Cancel" button during the request. Keep the dialog open until the response comes back.
- **Confirmation dialog:** Title — "Cancel Booking?"; Body — "Are you sure you want to cancel this booking? This action cannot be undone."; Buttons — "Keep Booking" (secondary) / "Yes, Cancel" (danger, primary).
- **Error handling:** If the backend returns 400 with a message about payment being settled, show an inline alert: "This booking cannot be cancelled because the payment has already been settled. Please contact support."
- **Post-success:** Show a success toast "Booking cancelled." and update the status badge to `CANCELLED` (grey). Remove interactive buttons (payment proof upload, etc.).
