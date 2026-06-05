import { SocialService } from "@/features/socials/api/social-service"
import SocialListing from "@/features/socials/components/social-listing"
import type { ListSocialResponse } from "@/features/socials/types/social"

export default async function Page(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const page = searchParams?.page
    ? parseInt(searchParams.page as string, 10)
    : 1

  let socials = [] as ListSocialResponse[]
  let pagination = { page: 1, limit: 10, total: 0, totalPages: 1 }

  try {
    const result = await SocialService.listMySocials(null, null, page, 10)
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
