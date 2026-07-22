type QueryParams = Record<string, string | number | boolean | null | undefined>

export const groupQueryKeys = {
  all: ["groups"] as const,
  lists: () => [...groupQueryKeys.all, "list"] as const,
  detail: (groupId: string) =>
    [...groupQueryKeys.all, "detail", groupId] as const,
  members: (groupId: string) =>
    [...groupQueryKeys.detail(groupId), "members"] as const,
  invitations: (groupId: string) =>
    [...groupQueryKeys.detail(groupId), "invitations"] as const,
  courtBookings: (groupId: string, params?: QueryParams) =>
    [...groupQueryKeys.detail(groupId), "courtBookings", params] as const,
}
