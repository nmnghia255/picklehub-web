import { getFriendViewData } from "./_data"
import FriendClient from "./FriendClient"

export const dynamic = "force-dynamic"

export default async function FriendPage() {
  const data = await getFriendViewData()

  const usersByTab = {
    find: data.find,
    sent: data.sent,
    received: data.received,
    friends: data.friends,
  }

  // Render client component with initial server-fetched data
  // Client will preserve the original UI/interaction behavior.

  return <FriendClient initialUsersByTab={usersByTab} />
}
