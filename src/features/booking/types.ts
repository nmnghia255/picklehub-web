export type SelectedCourts = Record<number, Set<string>>

export type ExtrasState = Record<string, boolean>

export type AddOn = {
  key: string
  label: string
  price: number
}
