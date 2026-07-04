import { Suspense } from "react"

import PickleballTracker from "./PickleballTracker"

export default function SocialPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-500">
          Đang tải bảng ghi điểm...
        </div>
      }
    >
      <PickleballTracker />
    </Suspense>
  )
}
