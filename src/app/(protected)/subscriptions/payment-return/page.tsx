export const dynamic = "force-dynamic"

import { revalidatePath } from "next/cache"

import { PageContainer } from "@/components/page-container"

import { PaymentReturnContent } from "./payment-return-content"

interface PaymentReturnPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PaymentReturnPage({
  searchParams,
}: PaymentReturnPageProps) {
  const params = await searchParams
  const vnp_ResponseCode = params["vnp_ResponseCode"] as string | undefined
  const vnp_TransactionStatus = params["vnp_TransactionStatus"] as
    | string
    | undefined

  // Revalidate subscription data so it shows updated status
  revalidatePath("/subscriptions")
  revalidatePath("/profile")

  const isSuccess = vnp_ResponseCode === "00" && vnp_TransactionStatus === "00"

  return (
    <div className="min-h-screen bg-background py-6 text-foreground">
      <PageContainer>
        <PaymentReturnContent
          isSuccess={isSuccess}
          responseCode={vnp_ResponseCode}
        />
      </PageContainer>
    </div>
  )
}
