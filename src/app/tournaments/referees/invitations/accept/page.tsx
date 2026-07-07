import { AcceptRefereeInvitationClient } from "@/app/invitation/referee/accept/accept-referee-invitation-client"

export default async function AcceptRefereeInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return <AcceptRefereeInvitationClient token={token} />
}
