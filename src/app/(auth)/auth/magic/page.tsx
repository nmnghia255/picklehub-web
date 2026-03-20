import { MagicLinkVerifyClient } from "./magic-link-verify-client"

export default async function MagicLinkVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ magic?: string }>
}) {
  const { magic } = await searchParams

  return <MagicLinkVerifyClient magic={magic} />
}
