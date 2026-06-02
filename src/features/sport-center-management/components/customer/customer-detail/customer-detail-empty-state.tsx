"use client"

export function CustomerDetailEmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-background/60 p-3 text-base text-muted-foreground">
      {text}
    </div>
  )
}

export default CustomerDetailEmptyState
