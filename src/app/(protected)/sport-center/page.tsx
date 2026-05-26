import { PageContainer } from "@/components/page-container"
import {
  listSportCenters,
  type ListSportCentersResult,
} from "@/features/sport-center/api/sport-center-user-service"
import { SportCenterBrowser } from "@/features/sport-center/components/sport-center-listing"

const PAGE_SIZE = 20

type PageProps = {
  searchParams?: Promise<{ page?: string }>
}

export default async function SportCenterPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const rawPage = Number.parseInt(resolvedSearchParams?.page ?? "1", 10)
  const currentPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage
  const offset = (currentPage - 1) * PAGE_SIZE

  let sportCentersResult: ListSportCentersResult = {
    data: [],
    pagination: undefined,
  }

  try {
    sportCentersResult = await listSportCenters(PAGE_SIZE, offset)
  } catch (error) {
    console.error("Failed to fetch sport centers:", error)
    return (
      <PageContainer variant="wide">
        <div className="p-4">
          <p className="text-red-500">
            Không thể tải danh sách trung tâm thể thao. Vui lòng thử lại sau.
          </p>
        </div>
      </PageContainer>
    )
  }

  const sportCenters = sportCentersResult.data
  const pagination = sportCentersResult.pagination ?? {
    total: sportCenters.length,
    offset,
    limit: PAGE_SIZE,
  }
  const hasNextPage = pagination.offset + pagination.limit < pagination.total

  return (
    <PageContainer
      variant="wide"
      className="flex min-h-[calc(100vh-3.5rem)] flex-col"
    >
      <SportCenterBrowser
        sportCenters={sportCenters}
        pagination={{
          currentPage,
          pageSize: pagination.limit,
          total: pagination.total,
          offset: pagination.offset,
          hasNextPage,
        }}
      />
    </PageContainer>
  )
}
