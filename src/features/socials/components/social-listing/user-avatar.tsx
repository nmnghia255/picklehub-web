import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UserAvatar({
  name,
  avatar,
}: {
  name: string
  avatar?: string | null
}) {
  return (
    <Avatar>
      <AvatarImage src={avatar ?? undefined} alt={name} />
      <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
    </Avatar>
  )
}
