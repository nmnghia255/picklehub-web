# Private Bookings — Coach Actions

---

## GET /api/coach/bookings — List My Incoming Booking Requests

**Purpose:** Returns a paginated list of booking requests directed at the authenticated coach.

**Auth:** Bearer Token (Coach)

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
      "learnerProfile": {
        "id": "string",
        "fullName": "string",
        "avatarUrl": "string",
        "bio": "string"
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

- **When to call:** On the "Coach Dashboard" → "Bookings" tab on page load, and whenever the coach switches a status filter or paginates.
- **State management:** Store `bookings[]`, `currentPage`, `totalPages`, and `activeStatusFilter` in a Zustand store or React context. Keep a `totalPending` counter for a badge on the sidebar navigation.
- **Loading:** Show a skeleton table (rows with shimmer placeholders) while fetching.
- **Empty state:** If no bookings, display "No booking requests yet. Share your profile link to start receiving requests!" with a link to copy the coach profile URL.
- **Polling / Real-time:** Consider polling every 15–30 seconds or using WebSocket to update the pending count badge so the coach sees new requests without manual refresh.
- **Row actions:** Each booking row should have action buttons contextual to its status (Confirm / Reject for pending, Settle Payment for pending review, Complete for confirmed+settled).

---

## PATCH /api/coach/bookings/{bookingId}/confirm — Confirm a Booking Request

**Purpose:** Moves a booking from `PENDING_CONFIRMATION` → `CONFIRMED`. The learner can then upload payment proof.

**Auth:** Bearer Token (Coach)

### Path Parameters

| Name      | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| bookingId | string | ✅       | ID of the booking to confirm |

### Request Body — `ConfirmBookingDto`

| Field     | Type   | Required | Description                |
|-----------|--------|----------|----------------------------|
| coachNote | string | ❌       | Optional note to the learner |

### Response — 200 OK

```json
{
  "id": "string",
  "status": "CONFIRMED",
  "coachNote": "Looking forward to the session!",
  "updatedAt": "2026-07-02T12:00:00Z"
}
```

### Error Responses

| Status | Description                                      |
|--------|--------------------------------------------------|
| 400    | Booking is not in PENDING_CONFIRMATION status    |
| 404    | Booking not found or not owned by this coach     |

### Frontend Notes

- **When to call:** From the booking detail page or inline row action in the bookings list. Show a modal that includes an optional textarea for `coachNote`.
- **State management:** Update the booking's `status` to `CONFIRMED` optimistically in local state. Remove from `PENDING_CONFIRMATION` count.
- **Loading:** Show a spinner on the "Confirm" button inside the modal. Keep the modal open until the response resolves.
- **Modal content:** Title — "Confirm Booking"; Body — "Confirm this session with {learnerName} on {sessionAt} for {durationMinutes} min?" + textarea "Add a note (optional)"; Buttons — "Cancel" (secondary) / "Confirm" (primary).
- **Post-success:** Show a success toast "Booking confirmed! The learner can now upload payment proof." Close the modal. Refresh the booking row to show `CONFIRMED` state.
- **Follow-up:** The coach should see the booking listed under "Confirmed (awaiting payment)" with next steps highlighted.

---

## PATCH /api/coach/bookings/{bookingId}/reject — Reject a Booking Request

**Purpose:** Moves a booking from `PENDING_CONFIRMATION` → `REJECTED`.

**Auth:** Bearer Token (Coach)

### Path Parameters

| Name      | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| bookingId | string | ✅       | ID of the booking to reject |

### Request Body — `RejectBookingDto`

| Field        | Type   | Required | Description                         |
|--------------|--------|----------|-------------------------------------|
| cancelReason | string | ❌       | Reason for rejection (visible to learner) |

### Response — 200 OK

```json
{
  "id": "string",
  "status": "REJECTED",
  "cancelReason": "Coach is unavailable on that date.",
  "updatedAt": "2026-07-02T12:05:00Z"
}
```

### Error Responses

| Status | Description                                      |
|--------|--------------------------------------------------|
| 400    | Booking is not in PENDING_CONFIRMATION status    |
| 404    | Booking not found or not owned by this coach     |

### Frontend Notes

- **When to call:** From the booking detail page or inline row action. Show a confirmation modal with an optional reason textarea.
- **State management:** Update the booking's `status` to `REJECTED` in local state. Decrement the pending count.
- **Loading:** Show a spinner on the "Reject" button. Keep the modal open until resolved.
- **Modal content:** Title — "Reject Booking?"; Body — "This will notify the learner that their request has been declined." + textarea "Reason (optional, visible to learner)"; Buttons — "Keep Booking" (secondary) / "Reject" (danger).
- **Post-success:** Show a success toast "Booking rejected." The learner will see the `cancelReason` on their end. The booking row turns grey with a `REJECTED` badge.
- **UX consideration:** Never allow the coach to reject a booking that has already been confirmed or has payment in progress.

---

## PATCH /api/coach/bookings/{bookingId}/settle-payment — Settle Payment

**Purpose:** Moves `paymentStatus` from `PENDING_REVIEW` → `SETTLED`. Confirms that the coach has received the payment.

**Auth:** Bearer Token (Coach)

### Path Parameters

| Name      | Type   | Required | Description                  |
|-----------|--------|----------|------------------------------|
| bookingId | string | ✅       | ID of the booking to settle   |

### Request Body

None.

### Response — 200 OK

```json
{
  "id": "string",
  "paymentStatus": "SETTLED",
  "status": "CONFIRMED",
  "updatedAt": "2026-07-02T13:00:00Z"
}
```

### Error Responses

| Status | Description                                        |
|--------|----------------------------------------------------|
| 400    | Payment is not in PENDING_REVIEW status            |
| 404    | Booking not found or not owned by this coach       |

### Frontend Notes

- **When to call:** On the booking detail page, after the coach has verified the payment proof image matches the amount and looks legitimate. The coach clicks "Verify & Settle".
- **State management:** Update `paymentStatus` to `SETTLED` optimistically. The booking is now ready to be completed after the session.
- **Loading:** Show a spinner on the "Settle" button. Disable both "Settle" and "Reject Payment" buttons during the request.
- **UX workflow:** The booking detail page should show the payment proof image in a lightbox so the coach can inspect it before settling. Include a thumbnail with a "View Full Image" link.
- **Post-success:** Show a success toast "Payment settled." The booking row now shows a green "SETTLED" badge. The "Complete Session" button becomes enabled (see below).
- **Warning:** Only settle if the coach has actually received the funds in their bank account. The platform does not handle payment escrow.

---

## PATCH /api/coach/bookings/{bookingId}/complete — Mark Session as Completed

**Purpose:** After the session is delivered, moves the booking from `CONFIRMED` → `COMPLETED`. Learner can then leave a review. Requires `paymentStatus === "SETTLED"`.

**Auth:** Bearer Token (Coach)

### Path Parameters

| Name      | Type   | Required | Description                |
|-----------|--------|----------|----------------------------|
| bookingId | string | ✅       | ID of the booking to complete |

### Request Body

None.

### Response — 200 OK

```json
{
  "id": "string",
  "status": "COMPLETED",
  "paymentStatus": "SETTLED",
  "updatedAt": "2026-07-02T14:00:00Z"
}
```

### Error Responses

| Status | Description                                                           |
|--------|-----------------------------------------------------------------------|
| 400    | Booking is not CONFIRMED or payment is not SETTLED                    |
| 404    | Booking not found or not owned by this coach                          |

### Frontend Notes

- **When to call:** After the coaching session has taken place. The coach clicks "Mark as Completed" on the booking detail page.
- **State management:** Update `status` to `COMPLETED` locally. Remove the booking from the active "Confirmed" list; it moves to the "Completed" tab.
- **Loading:** Show a spinner on the "Complete" button. Disable it during the request.
- **Confirmation dialog:** Title — "Complete Session?"; Body — "Have you completed this session with {learnerName}? This will allow the learner to leave a review."; Buttons — "Cancel" / "Yes, Complete".
- **Post-success:** Show a success toast "Session marked as completed! The learner can now leave a review."
- **Review trigger:** After completion, the learner's UI should show a "Leave a Review" button for this booking. The coach cannot re-open the booking once completed.
- **Prerequisite check:** If payment is not yet settled, the "Complete" button should be disabled with a tooltip: "Settle payment before completing the session."

---

## PATCH /api/coach/bookings/{bookingId}/reject-payment — Reject Payment Proof

**Purpose:** Moves `paymentStatus` from `PENDING_REVIEW` → `REJECTED`. Indicates the coach did not receive the correct payment.

**Auth:** Bearer Token (Coach)

### Path Parameters

| Name      | Type   | Required | Description                      |
|-----------|--------|----------|----------------------------------|
| bookingId | string | ✅       | ID of the booking to reject payment for |

### Request Body

None.

### Response — 200 OK

```json
{
  "id": "string",
  "paymentStatus": "REJECTED",
  "status": "CONFIRMED",
  "updatedAt": "2026-07-02T13:30:00Z"
}
```

### Error Responses

| Status | Description                                        |
|--------|----------------------------------------------------|
| 400    | Payment is not in PENDING_REVIEW status            |
| 404    | Booking not found or not owned by this coach       |

### Frontend Notes

- **When to call:** On the booking detail page, when the coach opens the payment proof image and determines it is incorrect (wrong amount, unreadable, fraudulent, etc.). The coach clicks "Reject Proof".
- **State management:** Update `paymentStatus` to `REJECTED` locally. The booking stays at `CONFIRMED`, and the learner can re-upload a new proof.
- **Loading:** Show a spinner on the "Reject Payment" button. Disable both payment action buttons during the request.
- **Confirmation dialog:** Title — "Reject Payment Proof?"; Body — "Are you sure? The learner will be notified and can upload a corrected proof."; Buttons — "Cancel" / "Reject" (danger).
- **Post-success:** Show a success toast "Payment proof rejected. The learner can upload a new one." The UI resets to show the "Pending payment proof" state so the learner can try again.
- **UX flow:** After rejection, the booking should go back to the state where the learner sees the upload button again, with a note that their previous proof was rejected.

---

## DELETE /api/coach/bookings/{bookingId} — Cancel a Confirmed Booking

**Purpose:** Allows the coach to cancel a booking that is in `CONFIRMED` status (before it is completed). Useful if the coach can no longer fulfill the session.

**Auth:** Bearer Token (Coach)

### Path Parameters

| Name      | Type   | Required | Description                |
|-----------|--------|----------|----------------------------|
| bookingId | string | ✅       | ID of the booking to cancel |

### Request Body

| Field        | Type   | Required | Description                         |
|--------------|--------|----------|-------------------------------------|
| cancelReason | string | ❌       | Reason for cancellation (visible to learner) |

### Response — 200 OK

```json
{
  "id": "string",
  "status": "CANCELLED",
  "cancelReason": "Coach has a scheduling conflict.",
  "updatedAt": "2026-07-02T15:00:00Z"
}
```

### Error Responses

| Status | Description                                                  |
|--------|--------------------------------------------------------------|
| 400    | Booking is not in CONFIRMED status (e.g., already completed) |
| 404    | Booking not found or not owned by this coach                 |

### Frontend Notes

- **When to call:** From the booking detail page via a "Cancel Booking" button. Only visible when `status === "CONFIRMED"`. Always show a confirmation modal.
- **State management:** Update `status` to `CANCELLED` locally. If the booking had a pending payment, the learner will need to be notified (handled server-side or via notification).
- **Loading:** Show a spinner on the "Cancel" button inside the modal.
- **Confirmation dialog:** Title — "Cancel Confirmed Booking?"; Body — "This booking has already been confirmed and the learner may have already paid. Are you sure you want to cancel?" + textarea "Reason (visible to learner)"; Buttons — "Keep Booking" (secondary) / "Cancel Booking" (danger, primary).
- **Post-success:** Show a warning toast "Booking cancelled. The learner will be notified." The booking row turns red/grey with a `CANCELLED` badge. All action buttons are removed.
- **Policy note:** This endpoint is for `CONFIRMED` bookings only. For `PENDING_CONFIRMATION` bookings, the coach should use the **Reject** endpoint instead. If payment was already settled and the coach cancels, coordinate with the learner off-platform for a refund.
