import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CreateGroupActivityDto,
  GroupActivity,
  ListActivitiesParams,
  PaginatedActivitiesResponse,
  UpdateGroupActivityDto,
} from "../group-activity-schedule.types"

export async function createActivity(
  groupId: string,
  data: CreateGroupActivityDto
): Promise<GroupActivity> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<GroupActivity>(
    `/api/groups/${groupId}/activities`,
    data
  )
  return response.data
}

export async function listActivities(
  groupId: string,
  params: ListActivitiesParams = {}
): Promise<PaginatedActivitiesResponse> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<PaginatedActivitiesResponse>(
    `/api/groups/${groupId}/activities`,
    { params }
  )
  return response.data
}

export async function getActivity(
  groupId: string,
  activityId: string
): Promise<GroupActivity> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<GroupActivity>(
    `/api/groups/${groupId}/activities/${activityId}`
  )
  return response.data
}

export async function updateActivity(
  groupId: string,
  activityId: string,
  data: UpdateGroupActivityDto
): Promise<GroupActivity> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<GroupActivity>(
    `/api/groups/${groupId}/activities/${activityId}`,
    data
  )
  return response.data
}

export async function deleteActivity(
  groupId: string,
  activityId: string
): Promise<void> {
  const axios = await getAuthenticatedAxios()
  await axios.delete(`/api/groups/${groupId}/activities/${activityId}`)
}
