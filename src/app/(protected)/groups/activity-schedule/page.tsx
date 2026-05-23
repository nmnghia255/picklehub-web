import { redirect } from "next/navigation"

export default function GroupActivityScheduleRoute() {
  // Enforce workflow: require entering a specific group to view its schedule.
  // Redirect generic schedule route back to groups list.
  redirect("/groups")
}
