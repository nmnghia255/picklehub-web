import { SocialService } from "@/features/socials/api/social-service"
import SocialListing from "@/features/socials/components/social-listing"
import type { ListSocial } from "@/features/socials/types/social"

export default async function Page(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams

  const page = searchParams?.page
    ? parseInt(searchParams.page as string, 10)
    : 1
  const limit = searchParams?.limit
    ? parseInt(searchParams.limit as string, 10)
    : 9
  const tab = searchParams?.tab ? (searchParams.tab as string) : null
  const role = searchParams?.role ? (searchParams.role as string) : null
  const status = searchParams?.status ? (searchParams.status as string) : null
  const search = searchParams?.search ? (searchParams.search as string) : null

  let socials = [] as ListSocial[]
  let pagination = {
    page: page,
    limit: limit,
    total: 0,
    totalPages: 1,
  }

  try {
    const result = await SocialService.listMySocials(
      tab,
      role,
      page,
      limit,
      status,
      search
    )
    socials = result.data
    pagination = result.meta
  } catch (error) {
    console.error("Error fetching my socials:", error)
  }

  return (
    <div>
      <SocialListing
        initialSocials={socials}
        pagination={pagination}
        isMySocials
      />
    </div>
  )
}
