export interface AuditLog {
  id: number
  action: string
  oldValue: Record<string, unknown> | null
  newValue: Record<string, unknown> | null
  createdAt: string
  tournamentId: number | null
}
