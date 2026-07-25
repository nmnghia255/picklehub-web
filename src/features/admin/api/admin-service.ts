"use server"

import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  AdminUser,
  AiLogItem,
  AiLogsPaginatedResponse,
  AiModelPricing,
  AiMonitoringOverview,
  CoachCertification,
  CoachCertificationsPaginatedResponse,
  CoachCertListParams,
  IngestKnowledgePayload,
  KnowledgeDocument,
  KnowledgePaginatedResponse,
  ReviewCoachCertPayload,
  TestSearchPayload,
  TestSearchResult,
  UpdateUserPayload,
  UserListParams,
} from "../types"

interface ApiResponseWrapper<T> {
  success?: boolean
  message?: string
  data?: T
}

async function getAdminAxios() {
  const axiosInstance = await getAuthenticatedAxios()
  axiosInstance.defaults.headers.common["x-user-role"] = "ADMIN"
  return axiosInstance
}

function unwrap<T>(payload: ApiResponseWrapper<T> | T): T {
  let current: unknown = payload
  while (
    current &&
    typeof current === "object" &&
    !Array.isArray(current) &&
    "data" in current &&
    current.data !== undefined
  ) {
    current = current.data
  }
  return current as T
}

// --- 1. AI Monitoring ---

export async function getAiMonitoringOverview(): Promise<AiMonitoringOverview> {
  const axios = await getAdminAxios()
  const response = await axios.get<
    ApiResponseWrapper<AiMonitoringOverview> | AiMonitoringOverview
  >("/api/ai/admin/monitoring/overview")
  return unwrap(response.data)
}

interface MetaInfo {
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

export async function getAiMonitoringLogs(
  page = 1,
  limit = 20
): Promise<AiLogsPaginatedResponse> {
  const axios = await getAdminAxios()
  const response = await axios.get<unknown>(
    `/api/ai/admin/monitoring/logs?page=${page}&limit=${limit}`
  )

  let items: AiLogItem[] = []
  let metaObj: MetaInfo | null = null

  let curr: unknown = response.data
  for (let i = 0; i < 3; i++) {
    if (Array.isArray(curr)) {
      items = curr as AiLogItem[]
      break
    }
    if (curr && typeof curr === "object") {
      const dict = curr as Record<string, unknown>
      if (dict.meta && typeof dict.meta === "object") {
        metaObj = dict.meta as MetaInfo
      } else if (dict.pagination && typeof dict.pagination === "object") {
        metaObj = dict.pagination as MetaInfo
      }

      if (Array.isArray(dict.data)) {
        items = dict.data as AiLogItem[]
        break
      }
      if (Array.isArray(dict.items)) {
        items = dict.items as AiLogItem[]
        break
      }
      if (Array.isArray(dict.logs)) {
        items = dict.logs as AiLogItem[]
        break
      }

      if (dict.data !== undefined) {
        curr = dict.data
        continue
      }
    }
    break
  }

  const total = metaObj?.total ?? items.length
  const totalPages =
    metaObj?.totalPages ?? Math.max(1, Math.ceil(total / limit))

  return {
    data: items,
    meta: {
      total,
      page: metaObj?.page ?? page,
      limit: metaObj?.limit ?? limit,
      totalPages,
    },
  }
}

export async function getAiMonitoringLogDetail(id: string): Promise<AiLogItem> {
  const axios = await getAdminAxios()
  const response = await axios.get<ApiResponseWrapper<AiLogItem> | AiLogItem>(
    `/api/ai/admin/monitoring/logs/${id}`
  )
  return unwrap(response.data)
}

export async function getAiModelPricings(): Promise<AiModelPricing[]> {
  const axios = await getAdminAxios()
  const response = await axios.get<unknown>("/api/ai/admin/monitoring/pricings")
  const unwrapped = unwrap(response.data)
  if (Array.isArray(unwrapped)) {
    return unwrapped as AiModelPricing[]
  }
  if (unwrapped && typeof unwrapped === "object") {
    const dict = unwrapped as Record<string, unknown>
    if (Array.isArray(dict.data)) {
      return dict.data as AiModelPricing[]
    }
  }
  return []
}

// --- 2. AI Knowledge Base ---

export async function getKnowledgeDocuments(
  page = 1,
  limit = 20,
  category?: string
): Promise<KnowledgePaginatedResponse> {
  const axios = await getAdminAxios()
  const query = new URLSearchParams()
  query.append("page", page.toString())
  query.append("limit", limit.toString())
  if (category) query.append("category", category)

  const response = await axios.get<unknown>(
    `/api/ai/admin/knowledge/documents?${query.toString()}`
  )

  let items: KnowledgeDocument[] = []
  let metaObj: MetaInfo | null = null

  let curr: unknown = response.data
  for (let i = 0; i < 3; i++) {
    if (Array.isArray(curr)) {
      items = curr as KnowledgeDocument[]
      break
    }
    if (curr && typeof curr === "object") {
      const dict = curr as Record<string, unknown>
      if (dict.meta && typeof dict.meta === "object") {
        metaObj = dict.meta as MetaInfo
      } else if (dict.pagination && typeof dict.pagination === "object") {
        metaObj = dict.pagination as MetaInfo
      }

      if (Array.isArray(dict.data)) {
        items = dict.data as KnowledgeDocument[]
        break
      }
      if (Array.isArray(dict.items)) {
        items = dict.items as KnowledgeDocument[]
        break
      }
      if (Array.isArray(dict.documents)) {
        items = dict.documents as KnowledgeDocument[]
        break
      }

      if (dict.data !== undefined) {
        curr = dict.data
        continue
      }
    }
    break
  }

  const total = metaObj?.total ?? items.length
  const totalPages =
    metaObj?.totalPages ?? Math.max(1, Math.ceil(total / limit))

  return {
    data: items,
    meta: {
      total,
      page: metaObj?.page ?? page,
      limit: metaObj?.limit ?? limit,
      totalPages,
    },
  }
}

export async function getKnowledgeDocument(
  id: string
): Promise<KnowledgeDocument> {
  const axios = await getAdminAxios()
  const response = await axios.get<
    ApiResponseWrapper<KnowledgeDocument> | KnowledgeDocument
  >(`/api/ai/admin/knowledge/documents/${id}`)
  return unwrap(response.data)
}

export async function ingestKnowledgeDocument(
  payload: IngestKnowledgePayload
): Promise<{
  success?: boolean
  message?: string
  documentId?: string
  chunksCreated?: number
}> {
  const axios = await getAdminAxios()
  const response = await axios.post<unknown>(
    "/api/ai/admin/knowledge/ingest",
    payload
  )
  return unwrap(response.data) as {
    success?: boolean
    message?: string
    documentId?: string
    chunksCreated?: number
  }
}

export async function deleteKnowledgeDocument(
  id: string
): Promise<{ success: boolean }> {
  const axios = await getAdminAxios()
  const response = await axios.delete<
    ApiResponseWrapper<{ success: boolean }> | { success: boolean }
  >(`/api/ai/admin/knowledge/documents/${id}`)
  return unwrap(response.data)
}

export async function testKnowledgeSearch(
  payload: TestSearchPayload
): Promise<TestSearchResult[]> {
  const axios = await getAdminAxios()
  const response = await axios.post<unknown>(
    "/api/ai/admin/knowledge/search",
    payload
  )

  const unwrapped = unwrap(response.data) as
    | TestSearchResult[]
    | { results?: TestSearchResult[] }
  if (Array.isArray(unwrapped)) {
    return unwrapped
  }
  if (
    unwrapped &&
    typeof unwrapped === "object" &&
    Array.isArray((unwrapped as { results?: TestSearchResult[] }).results)
  ) {
    return (unwrapped as { results: TestSearchResult[] }).results
  }
  return []
}

// --- 3. User & Role Management ---

export async function getUsersList(
  params: UserListParams = {}
): Promise<{
  data: AdminUser[]
  meta?: { total: number; page: number; limit: number; totalPages: number }
}> {
  const axios = await getAdminAxios()
  const query = new URLSearchParams()
  if (params.page) query.append("page", params.page.toString())
  if (params.limit) query.append("limit", params.limit.toString())
  if (params.search) query.append("search", params.search)
  if (params.role && params.role !== "ALL") query.append("role", params.role)
  if (params.status && params.status !== "ALL")
    query.append("status", params.status)

  const response = await axios.get<
    ApiResponseWrapper<AdminUser[]> & {
      meta?: { total: number; page: number; limit: number; totalPages: number }
    }
  >(`/api/users/admin/list?${query.toString()}`)

  const resData = response.data as unknown as Record<string, unknown>
  if (Array.isArray(resData.data)) {
    return {
      data: resData.data as AdminUser[],
      meta: resData.meta as
        | { total: number; page: number; limit: number; totalPages: number }
        | undefined,
    }
  }
  if (Array.isArray(response.data)) {
    return {
      data: response.data as unknown as AdminUser[],
    }
  }
  return { data: [] }
}

export async function getUserDetails(id: string): Promise<AdminUser> {
  const axios = await getAdminAxios()
  const response = await axios.get<ApiResponseWrapper<AdminUser> | AdminUser>(
    `/api/users/admin/list/${id}`
  )
  return unwrap(response.data)
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<AdminUser> {
  const axios = await getAdminAxios()
  const response = await axios.patch<ApiResponseWrapper<AdminUser> | AdminUser>(
    `/api/users/admin/update/${id}`,
    payload
  )
  return unwrap(response.data)
}

export async function deleteUser(id: string): Promise<{ success: boolean }> {
  const axios = await getAdminAxios()
  const response = await axios.delete<
    ApiResponseWrapper<{ success: boolean }> | { success: boolean }
  >(`/api/users/admin/delete/${id}`)
  return unwrap(response.data)
}

// --- 4. Coach Certification Verification ---

export async function getCoachCertifications(
  params: CoachCertListParams = {}
): Promise<CoachCertificationsPaginatedResponse> {
  const axios = await getAdminAxios()
  const query = new URLSearchParams()
  if (params.page) query.append("page", params.page.toString())
  if (params.limit) query.append("limit", params.limit.toString())
  if (params.verificationStatus && params.verificationStatus !== "ALL") {
    query.append("verificationStatus", params.verificationStatus)
  }
  if (params.coachProfileId)
    query.append("coachProfileId", params.coachProfileId)

  const response = await axios.get<
    | ApiResponseWrapper<CoachCertificationsPaginatedResponse>
    | CoachCertificationsPaginatedResponse
    | CoachCertification[]
  >(`/api/admin/coaches/certifications?${query.toString()}`)

  const resData = response.data as unknown as Record<string, unknown>
  if (resData && Array.isArray(resData.data)) {
    return {
      data: resData.data as CoachCertification[],
      pagination:
        (resData.pagination as CoachCertificationsPaginatedResponse["pagination"]) || {
          page: params.page || 1,
          limit: params.limit || 10,
          total: (resData.data as CoachCertification[]).length,
          totalPages: 1,
        },
    }
  }
  if (Array.isArray(response.data)) {
    return {
      data: response.data as CoachCertification[],
      pagination: {
        page: params.page || 1,
        limit: params.limit || 10,
        total: (response.data as CoachCertification[]).length,
        totalPages: 1,
      },
    }
  }
  return {
    data: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  }
}

export async function getPendingCoachCertifications(): Promise<
  CoachCertification[]
> {
  const axios = await getAdminAxios()
  const response = await axios.get<
    ApiResponseWrapper<CoachCertification[]> | CoachCertification[]
  >("/api/admin/coaches/certifications/pending")
  const result = unwrap(response.data)
  return Array.isArray(result) ? result : []
}

export async function reviewCoachCertification(
  certId: string,
  payload: ReviewCoachCertPayload
): Promise<CoachCertification> {
  const axios = await getAdminAxios()
  const response = await axios.patch<
    ApiResponseWrapper<CoachCertification> | CoachCertification
  >(`/api/admin/coaches/certifications/${certId}/review`, payload)
  return unwrap(response.data)
}
