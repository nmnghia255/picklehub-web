"use client"

import { useQueryClient } from "@tanstack/react-query"
import { UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { startTransition, useActionState, useEffect, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { updateAvatarAction } from "@/features/profile/actions"
import { useProfileEditStore } from "@/features/profile/store/profile-edit-store"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

function getTranslatedMessage(
  msg: string | undefined,
  t: (key: string) => string
): string {
  if (!msg) return ""
  if (msg.startsWith("edit.")) {
    return t(msg)
  }
  return msg
}

export function EditProfileAccountCard({
  avatarUrl,
  displayName,
  email,
}: {
  avatarUrl?: string | null
  displayName: string
  email: string
}) {
  const { t } = useProfileTranslation()
  const router = useRouter()
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [avatarMethod, setAvatarMethod] = useState<"file" | "url">("file")
  const setUser = useProfileEditStore((state) => state.setUser)

  const [state, formAction, isPending] = useActionState(updateAvatarAction, {})
  const [selectedFileName, setSelectedFileName] = useState("")

  const queryClient = useQueryClient()

  useEffect(() => {
    if (state.success && state.user) {
      setUser(state.user)
      queryClient.invalidateQueries({ queryKey: ["my-profile"] })
      router.refresh()
    }
  }, [setUser, state.success, state.user, router, queryClient])

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-4" />
          {t("edit.account")}
        </CardTitle>
        <CardDescription>{t("edit.accountDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="group relative flex cursor-pointer items-center gap-4 rounded-lg border bg-muted/20 p-4 transition-colors hover:bg-muted/30"
          role="button"
          tabIndex={0}
          onClick={() => setAvatarDialogOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              setAvatarDialogOpen(true)
            }
          }}
        >
          <div className="relative">
            <Avatar className="size-14 transition-opacity group-hover:opacity-85">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback>
                {initials || t("unnamedPlayer").charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>

        <Dialog
          open={avatarDialogOpen}
          onOpenChange={(open) => {
            setAvatarDialogOpen(open)
            if (!open) {
              setSelectedFileName("")
            }
          }}
        >
          <DialogContent className="sm:max-w-xl">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                const formData = new FormData(event.currentTarget)
                startTransition(() => {
                  formAction(formData)
                })
              }}
            >
              <DialogHeader>
                <DialogTitle>{t("edit.avatar.dialogTitle")}</DialogTitle>
                <DialogDescription>
                  {t("edit.avatar.dialogDesc")}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2 grid grid-cols-2 gap-3 py-2">
                <Button
                  type="button"
                  variant={avatarMethod === "file" ? "default" : "outline"}
                  className="h-auto w-full justify-start p-4 text-left"
                  onClick={() => {
                    setAvatarMethod("file")
                  }}
                >
                  <span className="flex w-full flex-col items-start gap-1">
                    <span className="text-sm leading-tight font-medium">
                      {t("edit.avatar.file")}
                    </span>
                    <span className="text-xs leading-snug opacity-80">
                      {t("edit.avatar.fileDesc")}
                    </span>
                  </span>
                </Button>

                <Button
                  type="button"
                  variant={avatarMethod === "url" ? "default" : "outline"}
                  className="h-auto w-full justify-start p-4 text-left"
                  onClick={() => {
                    setAvatarMethod("url")
                  }}
                >
                  <span className="flex w-full flex-col items-start gap-1">
                    <span className="text-sm leading-tight font-medium">
                      {t("edit.avatar.url")}
                    </span>
                    <span className="text-xs leading-snug opacity-80">
                      {t("edit.avatar.urlDesc")}
                    </span>
                  </span>
                </Button>
              </div>

              <div className="py-2">
                {avatarMethod === "file" ? (
                  <Field>
                    <FieldLabel htmlFor="avatarFile">
                      {t("edit.avatar.file")}
                    </FieldLabel>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Button
                        asChild
                        variant="outline"
                        type="button"
                        className="h-9"
                      >
                        <label htmlFor="avatarFile" className="cursor-pointer">
                          {t("edit.avatar.selectFile", {
                            defaultValue: "Chọn tệp",
                          })}
                        </label>
                      </Button>
                      <span className="max-w-[240px] truncate text-sm text-muted-foreground">
                        {selectedFileName ||
                          t("edit.avatar.noFileSelected", {
                            defaultValue: "Chưa chọn tệp",
                          })}
                      </span>
                      <input
                        id="avatarFile"
                        name="avatarFile"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          setSelectedFileName(file ? file.name : "")
                        }}
                      />
                    </div>
                  </Field>
                ) : (
                  <Field>
                    <FieldLabel htmlFor="avatarUrl">
                      {t("edit.avatar.urlLabel")}
                    </FieldLabel>
                    <Input
                      id="avatarUrl"
                      name="avatarUrl"
                      type="url"
                      placeholder={t("edit.avatar.placeholder")}
                      defaultValue={avatarUrl ?? ""}
                    />
                  </Field>
                )}
              </div>

              {state.error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">
                    {getTranslatedMessage(state.error, t)}
                  </p>
                </div>
              )}

              {state.success && state.message && (
                <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3">
                  <p className="text-sm text-green-700">
                    {getTranslatedMessage(state.message, t)}
                  </p>
                </div>
              )}

              <DialogFooter className="mt-4 gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    {t("edit.avatar.done")}
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending ? t("edit.saving") : t("edit.saveBtn")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
