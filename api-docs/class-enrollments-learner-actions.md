# Class Enrollments — Learner Actions

> Tag: `Class Enrollments — Learner Actions` (4 APIs)

---

## 1. POST /api/classes/{classId}/enroll

**(Learner) Enroll in a class**

### Description

Auto-confirmed enrollment. Spot reserved immediately. Payment deferred.

### Auth

`Bearer Token`

### Path Parameters

| Name    | Type   | Required | Description     |
| ------- | ------ | -------- | --------------- |
| classId | string | Yes      | ID of the class |

### Response — `201 Created`

```json
{
  "id": "string",
  "classId": "string",
  "learnerId": "string",
  "status": "ACTIVE",
  "paymentStatus": "PENDING_PROOF",
  "amountVnd": 0,
  "learnerProfile": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "avatarUrl": "string"
  },
  "coachPaymentInfo": {
    "paymentAccountName": "string",
    "paymentAccountNumber": "string",
    "paymentBankName": "string",
    "paymentQrUrl": "string"
  }
}
```

### Error Responses

| Status | Description                        |
| ------ | ---------------------------------- |
| 400    | Class not OPEN or class is full    |
| 401    | Unauthenticated                    |
| 404    | Class not found                    |
| 409    | Already enrolled in this class     |

### Frontend Notes

- On success, show a success message with the coach's bank account details (`coachPaymentInfo`).
- Guide the learner to transfer the exact `amountVnd` and then upload a payment proof screenshot.
- Persist the returned enrollment `id` for subsequent proof-upload or cancellation calls.

---

## 2. GET /api/learner/class-enrollments

**(Learner) List my class enrollments**

### Description

Returns all enrollments for the authenticated learner.

### Auth

`Bearer Token`

### Response — `200 OK`

```json
[
  {
    "id": "string",
    "classId": "string",
    "learnerId": "string",
    "status": "ACTIVE",
    "paymentStatus": "PENDING_PROOF",
    "amountVnd": 0,
    "classDetail": {},
    "coachPaymentInfo": {
      "paymentAccountName": "string",
      "paymentAccountNumber": "string",
      "paymentBankName": "string",
      "paymentQrUrl": "string"
    },
    "learnerProfile": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "avatarUrl": "string"
    }
  }
]
```

### Payment Status Values

| Value          | Meaning                                              |
| -------------- | ---------------------------------------------------- |
| PENDING_PROOF  | Learner needs to upload a payment proof              |
| PENDING_REVIEW | Proof uploaded, awaiting coach review                |
| SETTLED        | Payment confirmed by coach                           |
| REJECTED       | Proof rejected by coach; learner must re-upload      |

### Frontend Notes

- Display each enrollment with a payment-status badge (color-coded per status above).
- Show a **"Upload Proof"** button when `paymentStatus === "PENDING_PROOF"`.
- Show a **"Re-upload"** button when `paymentStatus === "REJECTED"`.
- Always display the coach bank info (`coachPaymentInfo`) so the learner can reference the correct account.

---

## 3. PATCH /api/learner/class-enrollments/{enrollmentId}/payment-proof

**(Learner) Upload payment proof**

### Description

Records the payment-proof URL and transitions `paymentStatus` to `PENDING_REVIEW`.

### Auth

`Bearer Token`

### Path Parameters

| Name         | Type   | Required | Description          |
| ------------ | ------ | -------- | -------------------- |
| enrollmentId | string | Yes      | ID of the enrollment |

### Request Body — `UploadPaymentProofDto`

```json
{
  "paymentProofUrl": "string"
}
```

| Field            | Type   | Required | Description                             |
| ---------------- | ------ | -------- | --------------------------------------- |
| paymentProofUrl  | string | Yes      | URL of the uploaded bank-transfer image |

### Response — `200 OK`

Returns the updated enrollment object with `paymentStatus: "PENDING_REVIEW"`.

### Error Responses

| Status | Description                                              |
| ------ | -------------------------------------------------------- |
| 400    | Payment already settled, or enrollment is not ACTIVE     |
| 401    | Unauthenticated                                          |
| 403    | Forbidden — not the owner of this enrollment             |
| 404    | Enrollment not found                                     |

### Frontend Notes

- Upload the bank-transfer image to the media-service first, then call this API with the resulting URL.
- Show a spinner / loading indicator during the upload and API call.
- On success, update the UI badge to `PENDING_REVIEW` and disable the upload button.

---

## 4. DELETE /api/learner/class-enrollments/{enrollmentId}

**(Learner) Cancel my enrollment**

### Description

Cancels the enrollment and frees one spot (decrements `enrolledCount` on the class).

### Auth

`Bearer Token`

### Path Parameters

| Name         | Type   | Required | Description          |
| ------------ | ------ | -------- | -------------------- |
| enrollmentId | string | Yes      | ID of the enrollment |

### Response — `200 OK`

```json
{
  "message": "Enrollment cancelled successfully"
}
```

### Error Responses

| Status | Description                                        |
| ------ | -------------------------------------------------- |
| 400    | Enrollment already CANCELLED or COMPLETED          |
| 401    | Unauthenticated                                    |
| 403    | Forbidden — not the owner of this enrollment       |
| 404    | Enrollment not found                               |

### Frontend Notes

- After successful cancellation, remove the enrollment from the list or show a "Cancelled" badge.
- The freed spot is immediately available for other learners to enroll.
