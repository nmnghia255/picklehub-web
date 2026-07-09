import { Suspense } from "react"

import i18n from "@/i18n/client"

import PickleballTracker from "./PickleballTracker"

export default function SocialPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-500">
          {i18n.t("referee.tracker.loading")}
        </div>
      }
    >
      <PickleballTracker />
    </Suspense>
  )
}
