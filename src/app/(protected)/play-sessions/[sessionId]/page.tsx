import { redirect } from "next/navigation"

interface PlaySessionDetailPageProps {
  params: Promise<{ sessionId: string }>
}

export default async function PlaySessionDetailPage({
  params,
}: PlaySessionDetailPageProps) {
  const { sessionId } = await params
  redirect(`/play-sessions/${sessionId}/details`)
}
