type CoachPageHeaderProps = {
  title: string
  description: string
}

export function CoachPageHeader({ title, description }: CoachPageHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
