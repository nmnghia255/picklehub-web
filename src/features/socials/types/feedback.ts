export interface FeedbackItem {
  id: string
  userId: string
  userName: string | null
  userAvatarUrl: string | null
  comment: string
  ratingVenue: number
  ratingOverall: number
  ratingOrganization: number
  createdAt: string
}

export interface Feedback {
  average: {
    ratingVenue: number | null
    ratingOverall: number | null
    ratingOrganization: number | null
    totalReviews: number
  }
  comments: FeedbackItem[]
}
