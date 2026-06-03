import { Card, CardContent } from "@/components/ui/card"

export function CustomerManagementSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border bg-background/90 shadow-sm backdrop-blur">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="h-10 rounded-md bg-muted/70" />
          <div className="h-10 rounded-md bg-muted/70 md:w-32 md:justify-self-end" />
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="space-y-px">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid gap-4 border-b p-4 md:grid-cols-5 md:items-center"
            >
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-muted/70" />
                <div className="h-3 w-56 rounded bg-muted/60" />
                <div className="h-3 w-24 rounded bg-muted/60" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-muted/70" />
                <div className="h-3 w-24 rounded bg-muted/60" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-muted/70" />
                <div className="h-3 w-36 rounded bg-muted/60" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-muted/70" />
                <div className="h-3 w-32 rounded bg-muted/60" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-36 rounded bg-muted/70" />
                <div className="h-3 w-24 rounded bg-muted/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CustomerManagementSkeleton
