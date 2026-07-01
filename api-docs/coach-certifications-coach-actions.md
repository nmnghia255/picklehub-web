# Coach Certifications — Coach Actions

## 1. Add a Certification to My Profile

- **API Name:** Add Coach Certification
- **Endpoint:** `POST /api/coach/certifications`
- **Purpose:** Adds a coaching certification to the authenticated coach's profile. Begins with `verificationStatus` set to `PENDING`.
- **User Role / Permission:** Coach only
- **Authentication:** Bearer Token

### Request Body — `CreateCertificationDto`

| Field                | Type   | Required | Description                              |
| -------------------- | ------ | -------- | ---------------------------------------- |
| `name`               | string | Yes      | Name of the certification                |
| `issuingOrganization`| string | No       | Organization that issued the certificate |
| `issuedAt`           | string | No       | Issue date (format: `YYYY-MM-DD`)        |
| `expiresAt`          | string | No       | Expiry date (format: `YYYY-MM-DD`); omit if no expiry |
| `documentUrl`        | string | No       | URL to the certification document image  |

### Request Example

```json
{
  "name": "Certified Strength and Conditioning Specialist",
  "issuingOrganization": "NSCA",
  "issuedAt": "2024-06-15",
  "expiresAt": "2027-06-15",
  "documentUrl": "https://media.example.com/certs/cscs-cert.pdf"
}
```

### Response — `201 Created`

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "coachProfileId": "3fa85f64-5717-4562-b3fc-2c963f66afa1",
  "name": "Certified Strength and Conditioning Specialist",
  "issuingOrganization": "NSCA",
  "issuedAt": "2024-06-15",
  "expiresAt": "2027-06-15",
  "documentUrl": "https://media.example.com/certs/cscs-cert.pdf",
  "verificationStatus": "PENDING",
  "reviewedByUserId": null,
  "reviewNote": null,
  "createdAt": "2026-07-02T10:30:00.000Z",
  "updatedAt": "2026-07-02T10:30:00.000Z"
}
```

### Response Fields

| Field                | Type    | Description                                      |
| -------------------- | ------- | ------------------------------------------------ |
| `id`                 | UUID    | Unique identifier of the certification           |
| `coachProfileId`     | UUID    | Identifier of the owning coach profile           |
| `name`               | string  | Name of the certification                        |
| `issuingOrganization`| string  | Issuing organization                             |
| `issuedAt`           | string  | Issue date                                       |
| `expiresAt`          | string  | Expiry date or `null` if non-expiring            |
| `documentUrl`        | string  | Document URL or `null`                           |
| `verificationStatus` | string  | Always `"PENDING"` on creation                   |
| `reviewedByUserId`   | UUID    | Admin who reviewed (`null` until reviewed)        |
| `reviewNote`         | string  | Review note (`null` until reviewed)               |
| `createdAt`          | string  | Timestamp of creation                            |
| `updatedAt`          | string  | Timestamp of last update                         |

### Error Responses

| Status | Description                            |
| ------ | -------------------------------------- |
| 401    | Unauthorized — missing or invalid token |
| 404    | Coach profile not found                |

### Frontend Notes

- Present a form with a file upload field. Upload the file to the **media-service** first, then pass the resulting URL as `documentUrl`.
- After successful submission, show a **pending badge** (e.g. yellow clock icon) next to the certification on the profile.

---

## 2. List My Certifications

- **API Name:** List Coach Certifications
- **Endpoint:** `GET /api/coach/certifications`
- **Purpose:** Returns all certifications (PENDING, VERIFIED, REJECTED) belonging to the authenticated coach.
- **User Role / Permission:** Coach only
- **Authentication:** Bearer Token
- **Query Parameters:** None

### Response — `200 OK`

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "coachProfileId": "3fa85f64-5717-4562-b3fc-2c963f66afa1",
    "name": "Certified Strength and Conditioning Specialist",
    "issuingOrganization": "NSCA",
    "issuedAt": "2024-06-15",
    "expiresAt": "2027-06-15",
    "documentUrl": "https://media.example.com/certs/cscs-cert.pdf",
    "verificationStatus": "VERIFIED",
    "reviewedByUserId": "3fa85f64-5717-4562-b3fc-2c963f66afa0",
    "reviewNote": "Document verified successfully.",
    "createdAt": "2026-07-02T10:30:00.000Z",
    "updatedAt": "2026-07-02T11:00:00.000Z"
  },
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
    "coachProfileId": "3fa85f64-5717-4562-b3fc-2c963f66afa1",
    "name": "Precision Nutrition Level 1",
    "issuingOrganization": "Precision Nutrition",
    "issuedAt": "2025-01-10",
    "expiresAt": null,
    "documentUrl": null,
    "verificationStatus": "PENDING",
    "reviewedByUserId": null,
    "reviewNote": null,
    "createdAt": "2026-07-02T12:00:00.000Z",
    "updatedAt": "2026-07-02T12:00:00.000Z"
  }
]
```

### Response Fields

Same full certification object as in **POST** response — an **array** of certifications.

### Error Responses

| Status | Description                            |
| ------ | -------------------------------------- |
| 401    | Unauthorized — missing or invalid token |
| 404    | Coach profile not found                |

### Frontend Notes

- Display certifications in profile settings with **status badges**:
  - `VERIFIED` → green check
  - `PENDING` → yellow clock
  - `REJECTED` → red X

---

## 3. Remove a Certification

- **API Name:** Delete Coach Certification
- **Endpoint:** `DELETE /api/coach/certifications/{certId}`
- **Purpose:** Removes one of the authenticated coach's certifications.
- **User Role / Permission:** Coach only (must own the certification)
- **Authentication:** Bearer Token

### Path Parameters

| Parameter | Type | Required | Description                   |
| --------- | ---- | -------- | ----------------------------- |
| `certId`  | UUID | Yes      | UUID of the certification to delete |

### Response — `200 OK`

```json
{
  "message": "Certification removed successfully."
}
```

### Error Responses

| Status | Description                                      |
| ------ | ------------------------------------------------ |
| 401    | Unauthorized — missing or invalid token           |
| 403    | Forbidden — certification does not belong to the coach |
| 404    | Certification not found                          |

### Frontend Notes

- Place a **delete button** (trash icon) on each certification card or row.
- Show a **confirmation dialog** before executing the delete to prevent accidental removals.
