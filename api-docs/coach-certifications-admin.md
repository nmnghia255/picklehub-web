# Coach Certifications — Admin

## 1. List All Certifications (with Filters)

- **API Name:** Admin List Certifications
- **Endpoint:** `GET /api/admin/coaches/certifications`
- **Purpose:** Returns a paginated list of all coach certifications, optionally filtered by status, coach, etc.
- **User Role / Permission:** Admin only
- **Authentication:** Bearer Token (ADMIN role required)

### Query Parameters

| Parameter          | Type   | Required | Description                                             |
| ------------------ | ------ | -------- | ------------------------------------------------------- |
| `verificationStatus` | string | No       | Filter by status: `UNVERIFIED`, `PENDING`, `VERIFIED`    |
| `coachProfileId`   | UUID   | No       | Filter by a specific coach profile                       |
| `page`             | number | No       | Page number (default: 1)                                |
| `limit`            | number | No       | Items per page (default: 20)                            |

### Request Example

```
GET /api/admin/coaches/certifications?verificationStatus=PENDING&page=1&limit=10
```

### Response — `200 OK`

```json
{
  "data": [
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
      "updatedAt": "2026-07-02T10:30:00.000Z",
      "coachProfile": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa1",
        "displayName": "Jane Doe",
        "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa0"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Response Fields

| Field                | Type    | Description                                      |
| -------------------- | ------- | ------------------------------------------------ |
| `data`               | array   | Array of certification objects (see below)        |
| `meta`               | object  | Pagination metadata                               |

#### Certification Object (within `data`)

| Field                | Type    | Description                                      |
| -------------------- | ------- | ------------------------------------------------ |
| `id`                 | UUID    | Unique identifier of the certification           |
| `coachProfileId`     | UUID    | Identifier of the owning coach profile           |
| `name`               | string  | Name of the certification                        |
| `issuingOrganization`| string  | Issuing organization                             |
| `issuedAt`           | string  | Issue date                                       |
| `expiresAt`          | string  | Expiry date or `null`                            |
| `documentUrl`        | string  | Document URL or `null`                           |
| `verificationStatus` | string  | Current verification status                      |
| `reviewedByUserId`   | UUID    | Admin who reviewed or `null`                     |
| `reviewNote`         | string  | Review note or `null`                            |
| `createdAt`          | string  | Timestamp of creation                            |
| `updatedAt`          | string  | Timestamp of last update                         |
| `coachProfile`       | object  | Brief coach profile info                         |

#### coachProfile Object

| Field         | Type   | Description                           |
| ------------- | ------ | ------------------------------------- |
| `id`          | UUID   | Coach profile ID                      |
| `displayName` | string | Coach display name                    |
| `userId`      | UUID   | Linked user account ID                |

### Error Responses

| Status | Description                                      |
| ------ | ------------------------------------------------ |
| 401    | Unauthorized — missing or invalid token           |
| 403    | Forbidden — user does not have ADMIN role         |

### Frontend Notes

- Build an admin dashboard table with sortable columns and filter controls for `verificationStatus`.
- Show the coach's `displayName` in the table for easy identification.

---

## 2. List All Pending Certifications

- **API Name:** Admin List Pending Certifications
- **Endpoint:** `GET /api/admin/coaches/certifications/pending`
- **Purpose:** Convenience endpoint returning all certifications pending review.
- **User Role / Permission:** Admin only
- **Authentication:** Bearer Token (ADMIN role required)
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
    "verificationStatus": "PENDING",
    "reviewedByUserId": null,
    "reviewNote": null,
    "createdAt": "2026-07-02T10:30:00.000Z",
    "updatedAt": "2026-07-02T10:30:00.000Z",
    "coachProfile": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa1",
      "displayName": "Jane Doe",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa0"
    }
  }
]
```

### Response Fields

Same certification object structure as the list endpoint (including `coachProfile`), returned as a **plain array** (no pagination wrapper).

### Error Responses

| Status | Description                                      |
| ------ | ------------------------------------------------ |
| 401    | Unauthorized — missing or invalid token           |
| 403    | Forbidden — user does not have ADMIN role         |

### Frontend Notes

- This endpoint provides a quick-access queue for admins to review certifications.
- Present items in a **review queue** sorted by `createdAt` (oldest-first recommended).

---

## 3. Approve or Reject a Certification

- **API Name:** Admin Review Certification
- **Endpoint:** `PATCH /api/admin/coaches/certifications/{certId}/review`
- **Purpose:** Approves (`VERIFIED`) or rejects (`REJECTED`) a certification and optionally adds a review note.
- **User Role / Permission:** Admin only
- **Authentication:** Bearer Token (ADMIN role required)

### Path Parameters

| Parameter | Type | Required | Description                         |
| --------- | ---- | -------- | ----------------------------------- |
| `certId`  | UUID | Yes      | UUID of the certification to review |

### Request Body — `ReviewCertificationDto`

| Field               | Type   | Required | Description                              |
| ------------------- | ------ | -------- | ---------------------------------------- |
| `verificationStatus`| string | Yes      | Must be `"VERIFIED"` or `"REJECTED"`     |
| `reviewNote`        | string | No       | Optional note explaining the decision    |

### Request Example

```json
{
  "verificationStatus": "VERIFIED",
  "reviewNote": "Document matches the certification database."
}
```

### Response — `200 OK`

```json
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
  "reviewNote": "Document matches the certification database.",
  "createdAt": "2026-07-02T10:30:00.000Z",
  "updatedAt": "2026-07-02T11:00:00.000Z"
}
```

### Response Fields

Full certification object with the updated `verificationStatus` and `reviewedByUserId` populated.

### Error Responses

| Status | Description                                      |
| ------ | ------------------------------------------------ |
| 401    | Unauthorized — missing or invalid token           |
| 403    | Forbidden — user does not have ADMIN role         |
| 404    | Certification not found                          |

### Frontend Notes

- Provide **Approve** and **Reject** buttons on each pending certification card.
- Optionally show a text area for the `reviewNote` before submitting.
- After review, refresh the pending queue or move the item to a "Reviewed" section.
