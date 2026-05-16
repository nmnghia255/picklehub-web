import { getFindUsers } from "@/features/friend/api/find-users"
import {
  listFriends,
  listIncomingRequests,
  listOutgoingRequests,
} from "@/features/friend/api/friend-service"
import type { FriendUser } from "@/features/friend/types"

export interface FriendViewData {
  find: FriendUser[]
  sent: FriendUser[]
  received: FriendUser[]
  friends: FriendUser[]
}

export async function getFriendViewData(): Promise<FriendViewData> {
  const [findRes, friendsRes, incomingRes, outgoingRes] =
    await Promise.allSettled([
      getFindUsers({ q: "a", page: 1, limit: 100 }),
      listFriends(),
      listIncomingRequests(),
      listOutgoingRequests(),
    ])

  const find = findRes.status === "fulfilled" ? findRes.value.data : []
  const friends = friendsRes.status === "fulfilled" ? friendsRes.value : []
  const received = incomingRes.status === "fulfilled" ? incomingRes.value : []
  const sent = outgoingRes.status === "fulfilled" ? outgoingRes.value : []

  return {
    find,
    sent,
    received,
    friends,
  }
}
