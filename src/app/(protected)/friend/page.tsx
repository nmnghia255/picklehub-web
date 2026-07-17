import { getFriendViewData } from "./_data"
import FriendClient from "./FriendClient"

export const dynamic = "force-dynamic"

type FriendPageSearchParams = {
  tab?: string | string[]
}

function getInitialFriendTab(searchParams?: FriendPageSearchParams) {
  const tab = Array.isArray(searchParams?.tab)
    ? searchParams?.tab[0]
    : searchParams?.tab

  if (tab === "sent" || tab === "received" || tab === "friends") {
    return tab
  }

  return "find"
}

export default async function FriendPage({
  searchParams,
}: {
  searchParams?: Promise<FriendPageSearchParams>
}) {
  const resolvedSearchParams = await searchParams
  const data = await getFriendViewData()

  const usersByTab = {
    find: data.find,
    sent: data.sent,
    received: data.received,
    friends: data.friends,
  }

  // Render client component with initial server-fetched data
  // Client will preserve the original UI/interaction behavior.

  return (
    <FriendClient
      initialUsersByTab={usersByTab}
      initialActiveTab={getInitialFriendTab(resolvedSearchParams)}
    />
  )
}
