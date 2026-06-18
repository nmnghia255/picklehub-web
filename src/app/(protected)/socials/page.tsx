import { SocialService } from "@/features/socials/api/social-service"
import SocialListing from "@/features/socials/components/social-listing"
import type {
  ListSocial,
  ListSocialRequest,
} from "@/features/socials/types/social"

export default async function Page(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const params: ListSocialRequest = {}

  if (searchParams) {
    if (searchParams.sortBy)
      params.sortBy = searchParams.sortBy as ListSocialRequest["sortBy"]
    if (searchParams.order)
      params.order = searchParams.order as ListSocialRequest["order"]
    if (searchParams.page)
      params.page = parseInt(searchParams.page as string, 10)
    if (searchParams.limit)
      params.limit = parseInt(searchParams.limit as string, 10)
    if (searchParams.search) params.search = searchParams.search as string
    if (searchParams.startFrom)
      params.startFrom = searchParams.startFrom as string
    if (searchParams.startTo) params.startTo = searchParams.startTo as string
    if (searchParams.upcoming === "true") params.upcoming = true
    if (searchParams.hasAvailableSlots === "true")
      params.hasAvailableSlots = true
    if (searchParams.minimumLevel)
      params.minimumLevel = parseInt(searchParams.minimumLevel as string, 10)
    if (searchParams.maximumLevel)
      params.maximumLevel = parseInt(searchParams.maximumLevel as string, 10)
    if (searchParams.format)
      params.format = searchParams.format as ListSocialRequest["format"]
    if (searchParams.genderPolicy)
      params.genderPolicy =
        searchParams.genderPolicy as ListSocialRequest["genderPolicy"]
    if (searchParams.ageGroup)
      params.ageGroup = searchParams.ageGroup as ListSocialRequest["ageGroup"]
    if (searchParams.joinedOnly === "true") params.joinedOnly = true
  }

  params.page = params.page || 1
  params.limit = params.limit || 10

  let socials = [] as ListSocial[]
  let pagination = {
    page: params.page,
    limit: params.limit,
    total: 0,
    totalPages: 1,
  }

  try {
    const result = await SocialService.discover(params)
    socials = result.data
    pagination = result.meta
  } catch (error) {
    console.error("Error fetching socials:", error)
  }

  return (
    <div>
      <SocialListing initialSocials={socials} pagination={pagination} />
    </div>
  )
}
