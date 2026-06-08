import { notFound } from "next/navigation"

import { SocialService } from "@/features/socials/api/social-service"
import { SocialForm } from "@/features/socials/components/social-form"

export default async function EditSocialPage(props: {
  params: Promise<{ socialId: string }>
}) {
  const params = await props.params
  const socialId = params.socialId

  let social
  try {
    social = await SocialService.getSocial(socialId)

    if (!social) {
      notFound()
    }
  } catch (error) {
    console.error("Error fetching social detail:", error)
    notFound()
  }

  return <SocialForm initialData={social} socialId={socialId} />
}
