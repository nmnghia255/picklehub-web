import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SessionTabKey = "details" | "participants" | "matches"

interface PlaySessionRouteTabsProps {
  sessionId: string
  activeTab: SessionTabKey
}

const TAB_ITEMS: Array<{ key: SessionTabKey; label: string }> = [
  { key: "details", label: "Details" },
  { key: "participants", label: "Participants" },
  { key: "matches", label: "Matches" },
]

export function PlaySessionRouteTabs({
  sessionId,
  activeTab,
}: PlaySessionRouteTabsProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 border-b pb-3">
      {TAB_ITEMS.map((tab) => {
        const isActive = tab.key === activeTab
        return (
          <Button
            key={tab.key}
            asChild
            size="sm"
            variant={isActive ? "default" : "outline"}
            className={cn(!isActive && "hover:bg-muted")}
          >
            <Link href={`/play-sessions/${sessionId}/${tab.key}`}>
              {tab.label}
            </Link>
          </Button>
        )
      })}
    </div>
  )
}
