"use client"

import {
  BoxIcon,
  CheckCircle2Icon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { acceptRefereeInvitationAction } from "@/features/tournaments/actions/referee-actions"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

type State = "loading" | "success" | "error"

export function AcceptRefereeInvitationClient({ token }: { token?: string }) {
  const { t } = useTournamentTranslation()
  const router = useRouter()
  const [state, setState] = useState<State>(() =>
    !token ? "error" : "loading"
  )
  const [errorMessage, setErrorMessage] = useState(() =>
    !token
      ? t(
          "personnel.accept.invalidToken",
          "Link mời không hợp lệ. Vui lòng kiểm tra lại email."
        )
      : ""
  )

  useEffect(() => {
    if (!token) return

    acceptRefereeInvitationAction(token).then((result) => {
      if (result.error) {
        setErrorMessage(result.error)
        setState("error")
        return
      }

      setState("success")
      setTimeout(() => {
        if (result.tournamentId) {
          router.push(`/tournaments/${result.tournamentId}`)
        } else {
          router.push("/")
        }
      }, 2000)
    })
  }, [token, router])

  return (
    <Layout>
      {state === "loading" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2Icon className="size-8 animate-spin text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {t(
                "personnel.accept.loadingTitle",
                "Đang xử lý lời mời làm trọng tài..."
              )}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t(
                "personnel.accept.loadingDesc",
                "Vui lòng chờ trong giây lát."
              )}
            </p>
          </div>
        </div>
      )}

      {state === "success" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2Icon className="size-8 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {t(
                "personnel.accept.successTitle",
                "Chấp nhận lời mời thành công!"
              )}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t(
                "personnel.accept.successDesc",
                "Bạn đã tham gia giải đấu với vai trò Trọng tài. Đang chuyển hướng đến trang giải đấu..."
              )}
            </p>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-500/10">
            <XCircleIcon className="size-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {t("personnel.accept.errorTitle", "Chấp nhận lời mời thất bại")}
            </h1>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          <div className="mt-4 flex w-full flex-col gap-2">
            {errorMessage.toLowerCase().includes("mismatch") ||
            errorMessage.toLowerCase().includes("không khớp") ||
            errorMessage.toLowerCase().includes("jwt") ||
            errorMessage.toLowerCase().includes("access") ? (
              <Link href="/login" className="w-full">
                <Button className="w-full">
                  {t("personnel.accept.loginOther", "Đăng nhập tài khoản khác")}
                </Button>
              </Link>
            ) : (
              <Link href="/" className="w-full">
                <Button className="w-full" variant="outline">
                  {t("personnel.accept.backHome", "Về trang chủ")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="grid min-h-svh lg:grid-cols-2">
    <div className="flex flex-col gap-4 p-6 md:p-10">
      <div className="flex justify-center gap-2 md:justify-start">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BoxIcon className="size-4" />
          </div>
          PickleHub
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <FieldGroup>{children}</FieldGroup>
          </div>
        </div>
      </div>
    </div>
    <div className="relative hidden bg-muted lg:block">
      <img
        src="/images/auth-bg.webp"
        alt="auth-bg"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  </div>
)
