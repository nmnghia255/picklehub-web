"use client"

import { useParams } from "next/navigation"

import { CreatePlaySessionForm } from "@/features/socials/components/play-session/create-play-session-form"

export default function CreatePlaySessionPage() {
  const params = useParams()
  const socialId = params.socialId as string

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center">
        <CreatePlaySessionForm socialId={socialId} />
      </div>
    </div>
  )
}
