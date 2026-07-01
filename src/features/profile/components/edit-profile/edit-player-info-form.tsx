"use client"

import { Camera } from "lucide-react"
import { useRouter } from "next/navigation"
import { startTransition, useActionState, useEffect, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { updateProfileDetailsAction } from "@/features/profile/actions"
import { useProfileEditStore } from "@/features/profile/store/profile-edit-store"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

type EditPlayerInfoValues = {
  name?: string | null
  avatarUrl?: string | null
  bio?: string | null
  gender?: "MALE" | "FEMALE" | "OTHER" | null
  selfRating?: number | null
  preferredHand?: "RIGHT" | "LEFT" | "AMBIDEXTROUS" | null
}

const SELF_RATING_OPTIONS = [
  "2.0",
  "2.25",
  "2.5",
  "2.75",
  "3.0",
  "3.25",
  "3.5",
  "3.75",
  "4.0",
  "4.25",
  "4.5",
  "4.75",
  "5.0+",
] as const

function getInitialSelfRatingValue(value?: number | null): string {
  if (typeof value !== "number") {
    return ""
  }

  // Legacy values may be stored as 1..13 indexes.
  if (
    Number.isInteger(value) &&
    value >= 1 &&
    value <= SELF_RATING_OPTIONS.length
  ) {
    return SELF_RATING_OPTIONS[value - 1]
  }

  if (value >= 5) {
    return "5.0+"
  }

  const directMatch = SELF_RATING_OPTIONS.find(
    (option) => option === value.toString()
  )
  if (directMatch) {
    return directMatch
  }

  const rounded = value.toFixed(2).replace(/\.00$/, ".0").replace(/0$/, "")
  const roundedMatch = SELF_RATING_OPTIONS.find((option) => option === rounded)
  return roundedMatch ?? ""
}

function getTranslatedMessage(
  msg: string | undefined,
  t: (key: string) => string
): string {
  if (!msg) return ""
  if (msg.includes("nhập tên hiển thị")) {
    return t("edit.nameRequiredError")
  }
  if (msg.includes("cập nhật avatar bằng avatarUrl")) {
    return t("edit.avatarFileError")
  }
  if (msg.includes("thành công")) {
    return t("edit.updateSuccess")
  }
  if (msg.includes("Không thể cập nhật") || msg.includes("thử lại")) {
    return t("edit.updateError")
  }
  if (msg.includes("lỗi xảy ra")) {
    return t("edit.genericError")
  }
  return msg
}

export function EditPlayerInfoForm({
  initialValues,
}: {
  initialValues?: EditPlayerInfoValues
}) {
  const { t } = useProfileTranslation()
  const router = useRouter()
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [avatarMethod, setAvatarMethod] = useState<"file" | "url">("file")
  const setUser = useProfileEditStore((state) => state.setUser)

  const displayName = initialValues?.name?.trim() || t("unnamedPlayer")
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  const [state, formAction, isPending] = useActionState(
    updateProfileDetailsAction,
    {}
  )

  const initialSelfRatingValue = getInitialSelfRatingValue(
    initialValues?.selfRating
  )
  const [selfRatingValue, setSelfRatingValue] = useState(initialSelfRatingValue)

  useEffect(() => {
    if (state.success && state.user) {
      setUser(state.user)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelfRatingValue(getInitialSelfRatingValue(state.user.selfRating))
      router.refresh()
    }
  }, [setUser, state.success, state.user, router])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelfRatingValue(initialSelfRatingValue)
  }, [initialSelfRatingValue])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        startTransition(() => formAction(formData))
      }}
      className="space-y-4"
    >
      <FieldGroup>
        <div
          className="cursor-pointer rounded-xl border bg-muted/20 p-4 transition-colors hover:bg-muted/35"
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
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage
                src={initialValues?.avatarUrl || undefined}
                alt={displayName}
              />
              <AvatarFallback>{initials || "U"}</AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <p className="text-sm font-medium">{t("edit.avatar.current")}</p>
              <p className="text-sm text-muted-foreground">
                {t("edit.avatar.clickToChange")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("edit.avatar.method", {
                  method:
                    avatarMethod === "file"
                      ? t("edit.avatar.file")
                      : t("edit.avatar.url"),
                })}
              </p>
            </div>
          </div>
        </div>

        <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{t("edit.avatar.dialogTitle")}</DialogTitle>
              <DialogDescription>
                {t("edit.avatar.dialogDesc")}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-2 md:grid-cols-2">
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
                  <Input
                    id="avatarFile"
                    name="avatarFile"
                    type="file"
                    accept="image/*"
                  />
                </Field>
              ) : (
                <Field>
                  <FieldLabel htmlFor="avatarUrl">Avatar URL</FieldLabel>
                  <Input
                    id="avatarUrl"
                    name="avatarUrl"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    defaultValue={initialValues?.avatarUrl ?? ""}
                  />
                </Field>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("edit.avatar.done")}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="name">{t("edit.displayName")}</FieldLabel>
            <Input
              id="name"
              name="name"
              placeholder={t("edit.displayNamePlaceholder")}
              defaultValue={initialValues?.name ?? ""}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="bio">{t("about")}</FieldLabel>
          <Textarea
            id="bio"
            name="bio"
            placeholder={t("edit.bioPlaceholder")}
            defaultValue={initialValues?.bio ?? ""}
            rows={4}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="gender">{t("gender")}</FieldLabel>
            <NativeSelect
              id="gender"
              name="gender"
              defaultValue={initialValues?.gender ?? ""}
            >
              <NativeSelectOption value="">
                {t("edit.selectGender")}
              </NativeSelectOption>
              <NativeSelectOption value="MALE">
                {t("genderMale")}
              </NativeSelectOption>
              <NativeSelectOption value="FEMALE">
                {t("genderFemale")}
              </NativeSelectOption>
              <NativeSelectOption value="OTHER">
                {t("genderOther")}
              </NativeSelectOption>
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="selfRating">{t("selfRating")}</FieldLabel>
            <NativeSelect
              id="selfRating"
              name="selfRating"
              value={selfRatingValue}
              onChange={(event) => setSelfRatingValue(event.target.value)}
            >
              <NativeSelectOption value="">
                {t("edit.selectLevel")}
              </NativeSelectOption>
              {SELF_RATING_OPTIONS.map((option) => (
                <NativeSelectOption key={option} value={option}>
                  {option}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="preferredHand">
              {t("preferredHand")}
            </FieldLabel>
            <NativeSelect
              id="preferredHand"
              name="preferredHand"
              defaultValue={initialValues?.preferredHand ?? ""}
            >
              <NativeSelectOption value="">
                {t("edit.selectHand")}
              </NativeSelectOption>
              <NativeSelectOption value="RIGHT">
                {t("handRight")}
              </NativeSelectOption>
              <NativeSelectOption value="LEFT">
                {t("handLeft")}
              </NativeSelectOption>
              <NativeSelectOption value="AMBIDEXTROUS">
                {t("handAmbidextrous")}
              </NativeSelectOption>
            </NativeSelect>
          </Field>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          <Camera className="mt-0.5 size-4 shrink-0" />
          <p>{t("edit.savingHint")}</p>
        </div>

        {state.error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">
              {getTranslatedMessage(state.error, t)}
            </p>
          </div>
        )}

        {state.success && state.message && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3">
            <p className="text-sm text-green-700">
              {getTranslatedMessage(state.message, t)}
            </p>
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? t("edit.saving") : t("edit.saveBtn")}
        </Button>
      </FieldGroup>
    </form>
  )
}
