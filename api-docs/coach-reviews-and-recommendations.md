# Coach Reviews & Recommendations

> Tags: `Coach Reviews` (4 APIs), `Coach Recommendations` (1 API)

---

## POST /api/coaches/{coachId}/reviews

Create a review for a coach.

### Auth

- **Bearer Token** (Authenticated user)

### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| coachId | uuid | Yes | The coach's profile ID |

### Request Body

```json
{
  "rating": 5,
  "comment": "Great coach! Very patient and knowledgeable."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| rating | integer | **Yes** | Rating from 1 to 5 |
| comment | string | No | Review text |

### Error Responses

| Status | Description |
|---|---|
| 400 | You cannot review yourself / You have already reviewed this coach |
| 401 | Unauthorized |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "reviewId": "uuid",
    "rating": 5,
    "comment": "Great coach! Very patient and knowledgeable.",
    "createdAt": "string (ISO 8601)"
  }
}
```

### Frontend Notes

- Show a 5-star rating input (clickable stars) + optional text area.
- Disable the submit button if rating is not provided.
- On 400 "already reviewed", redirect to the PATCH flow or show an "edit your review" prompt.
- After successful creation, close the modal and refresh the review list.

---

## GET /api/coaches/{coachId}/reviews

Get all public reviews for a coach.

### Auth

- **None** (Public)

### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| coachId | uuid | Yes | The coach's profile ID |

### Response

```json
{
  "success": true,
  "data": {
    "reviewCount": 42,
    "averageRating": 4.7,
    "reviews": [
      {
        "reviewId": "uuid",
        "rating": 5,
        "comment": "string | null",
        "createdAt": "string (ISO 8601)",
        "updatedAt": "string (ISO 8601)",
        "reviewerProfile": {
          "userId": "uuid",
          "name": "string",
          "avatar": "string | null"
        }
      }
    ]
  }
}
```

### Frontend Notes

- `averageRating` drives the coach's star display on profile cards (render as stars + numeric badge).
- `reviewCount` shown as "(42 reviews)" next to the rating.
- Review list sorted by newest first (back-end default).
- Show the reviewer's avatar + name, rating stars, relative time ("2 months ago"), and comment.
- If the current user's review exists in the list, show "Edit" / "Delete" action buttons on their review only.
- Empty state: "No reviews yet. Be the first to review!"

---

## PATCH /api/coaches/{coachId}/reviews/{reviewId}

Update an existing review.

### Auth

- **Bearer Token** (Must be the review author)

### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| coachId | uuid | Yes | The coach's profile ID |
| reviewId | uuid | Yes | The review's ID |

### Request Body

```json
{
  "rating": 4,
  "comment": "Updated comment after the second session."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| rating | integer | No | Rating from 1 to 5 |
| comment | string | No | Review text |

Both fields are optional — send only what you want to update.

### Response

```json
{
  "success": true,
  "data": {
    "reviewId": "uuid",
    "rating": 4,
    "comment": "Updated comment after the second session.",
    "updatedAt": "string (ISO 8601)"
  }
}
```

### Frontend Notes

- Pre-fill the edit form with the existing rating and comment.
- Same star-input UI as the create flow.
- Show a "Cancel" button to discard changes.
- After success, update the review in-place in the list without a full refresh.

---

## DELETE /api/coaches/{coachId}/reviews/{reviewId}

Delete a review.

### Auth

- **Bearer Token** (Must be the review author)

### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| coachId | uuid | Yes | The coach's profile ID |
| reviewId | uuid | Yes | The review's ID |

### Response (200 OK)

```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

### Frontend Notes

- Show a confirmation dialog ("Are you sure you want to delete your review?").
- After successful deletion, remove the review from the list and update the average rating display.
- If the deleted review was the only one, show the empty state.

---

## POST /api/coaches/{coachId}/recommendations

Recommend a coach to a friend.

### Auth

- **Bearer Token** (Authenticated user)

### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| coachId | uuid | Yes | The coach's profile ID |

### Request Body

```json
{
  "recommendedToId": "uuid",
  "message": "You should try sessions with this coach!"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| recommendedToId | uuid | **Yes** | UUID of the target user (friend) |
| message | string | No | Optional personal message |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "recommendationId": "uuid",
    "recommendedToId": "uuid",
    "message": "You should try sessions with this coach!",
    "createdAt": "string (ISO 8601)"
  }
}
```

### Side Effects

- Triggers an **in-app notification** to the target user (`recommendedToId`) informing them of the recommendation.

### Frontend Notes

- Add a "Recommend to a friend" button on the coach profile page (visible only to authenticated users).
- Open a modal with a friend selector (search by name/email) and an optional message field.
- The friend selector should only show users who are not already enrolled with this coach (to avoid redundant recommendations).
- After submission, show a success toast: "Recommendation sent to {friendName}!"
- The in-app notification will appear in the friend's notification bell dropdown.
- Rate-limit: consider preventing spam (e.g., max 5 recommendations per user per day).
