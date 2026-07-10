import { Suspense } from "react"

import PickleballTracker, { ScoreboardFallback } from "./PickleballTracker"

export default function SocialPage() {
  return (
    <Suspense fallback={<ScoreboardFallback />}>
      <PickleballTracker />
    </Suspense>
  )
}
