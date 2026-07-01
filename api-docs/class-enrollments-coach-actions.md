# Class Enrollments — Coach Actions

> Tag: `Class Enrollments — Coach Actions` (3 APIs)

---

## 1. GET /api/coach/classes/{classId}/enrollments

**(Coach) View enrollments for a class**

### Description

Returns all enrollments for a given class owned by the authenticated coach.

### Auth

`Bearer Token`

### Path Parameters

| Name    | Type   | Required | Description     |
| ------- | ------ | -------- | --------------- |
| classId | string | Yes      | ID of the class |

### Response — `200 OK`

```json
[
  {
    "id": "string",
    "classId": "string",
    "learnerId": "string",
    "status": "string",
    "paymentStatus": "PENDING_PROOF",
    "amountVnd": 0,
    "paymentProofUrl": "string",
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

### Error Responses

| Status | Description                                    |
| ------ | ---------------------------------------------- |
| 401    | Unauthenticated                                |
| 403    | Forbidden — not the owner of this class        |
| 404    | Class not found                                |

### Frontend Notes

- Render a table or list of learners with their `paymentStatus` badges.
- For each enrollment in `PENDING_REVIEW`, show **"Settle"** and **"Reject"** action buttons.
- Display learner avatar, name, and email from `learnerProfile`.

---

## 2. PATCH /api/coach/classes/{classId}/enrollments/{enrollmentId}/settle

**(Coach) Mark payment as settled**

### Description

Confirms the coach has received the bank transfer. Moves `paymentStatus` from `PENDING_REVIEW` to `SETTLED`.

### Auth

`Bearer Token`

### Path Parameters

| Name         | Type   | Required | Description                  |
| ------------ | ------ | -------- | ---------------------------- |
| classId      | string | Yes      | ID of the class              |
| enrollmentId | string | Yes      | ID of the enrollment         |

### Response — `200 OK`

Returns the updated enrollment object with `paymentStatus: "SETTLED"`.

### Error Responses

| Status | Description                                        |
| ------ | -------------------------------------------------- |
| 400    | Payment is not in `PENDING_REVIEW` status          |
| 401    | Unauthenticated                                    |
| 403    | Forbidden — not the owner of this class            |
| 404    | Class or enrollment not found                      |

### Frontend Notes

- Use a confirmation dialog before calling settle to prevent accidental clicks.
- After a successful settle, update the badge to `SETTLED` and hide the action buttons for that enrollment.

---

## 3. PATCH /api/coach/classes/{classId}/enrollments/{enrollmentId}/reject-payment

**(Coach) Reject a payment proof**

### Description

Rejects the uploaded proof, moving `paymentStatus` from `PENDING_REVIEW` to `REJECTED`. Clears `paymentProofUrl` so the learner must re-upload.

### Auth

`Bearer Token`

### Path Parameters

| Name         | Type   | Required | Description                  |
| ------------ | ------ | -------- | ---------------------------- |
| classId      | string | Yes      | ID of the class              |
| enrollmentId | string | Yes      | ID of the enrollment         |

### Request Body — `RejectPaymentDto`

```json
{
  "reason": "string"
}
```

| Field  | Type   | Required | Description                        |
| ------ | ------ | -------- | ---------------------------------- |
| reason | string | No       | Optional reason for the rejection  |

### Response — `200 OK`

Returns the updated enrollment object with `paymentStatus: "REJECTED"` and `paymentProofUrl: null`.

### Error Responses

| Status | Description                                        |
| ------ | -------------------------------------------------- |
| 400    | Payment is not in `PENDING_REVIEW` status          |
| 401    | Unauthenticated                                    |
| 403    | Forbidden — not the owner of this class            |
| 404    | Class or enrollment not found                      |

### Frontend Notes

- Present a small modal or inline form with the optional reason field before confirming rejection.
- After rejection, update the badge to `REJECTED`; the learner will see the status and be prompted to re-upload a new proof.
