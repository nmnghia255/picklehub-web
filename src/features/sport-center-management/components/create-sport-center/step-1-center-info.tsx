import {
  Building2,
  Clock,
  CreditCard,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react"

import { PaymentSelector } from "@/components/common/payment-selector"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { ImageUploadControl } from "../image-upload-control"
import type { CenterDraft } from "./types"

export function Step1CenterInfo({
  centerDraft,
  setCenterDraft,
  setPaymentQrUploading,
  setCenterImagesUploading,
}: {
  centerDraft: CenterDraft
  setCenterDraft: React.Dispatch<React.SetStateAction<CenterDraft>>
  setPaymentQrUploading: (uploading: boolean) => void
  setCenterImagesUploading: (uploading: boolean) => void
}) {
  const { t } = useSportCenterManagementTranslation()

  return (
    <div className="space-y-8">
      {/* General Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b pb-2.5 text-base font-bold">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-4" />
          </div>
          <span className="text-primary">
            {t("createCenter.sectionTitles.generalInfo", {
              defaultValue: "General Information",
            })}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="center-name">
              {t("createCenter.fields.name", {
                defaultValue: "Center name",
              })}
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="center-name"
              value={centerDraft.name}
              onChange={(e) =>
                setCenterDraft((current) => ({
                  ...current,
                  name: e.target.value,
                }))
              }
              placeholder={t("createCenter.placeholders.name", {
                defaultValue: "PickleHub District 1",
              })}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="center-address">
              {t("createCenter.fields.address", {
                defaultValue: "Address",
              })}
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="center-address"
              value={centerDraft.address}
              onChange={(e) =>
                setCenterDraft((current) => ({
                  ...current,
                  address: e.target.value,
                }))
              }
              placeholder={t("createCenter.placeholders.address", {
                defaultValue: "123 Nguyen Hue, District 1",
              })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="center-phone">
              {t("createCenter.fields.phone", {
                defaultValue: "Phone",
              })}
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="center-phone"
              value={centerDraft.phone}
              onChange={(e) =>
                setCenterDraft((current) => ({
                  ...current,
                  phone: e.target.value,
                }))
              }
              placeholder={t("createCenter.placeholders.phone", {
                defaultValue: "+84901234567",
              })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="center-email">
              {t("createCenter.fields.email", {
                defaultValue: "Email",
              })}
            </Label>
            <Input
              id="center-email"
              type="email"
              value={centerDraft.email}
              onChange={(e) =>
                setCenterDraft((current) => ({
                  ...current,
                  email: e.target.value,
                }))
              }
              placeholder={t("createCenter.placeholders.email", {
                defaultValue: "hello@example.com",
              })}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="center-description">
              {t("createCenter.fields.description", {
                defaultValue: "Description",
              })}
            </Label>
            <Textarea
              id="center-description"
              value={centerDraft.description}
              onChange={(e) =>
                setCenterDraft((current) => ({
                  ...current,
                  description: e.target.value,
                }))
              }
              placeholder={t("createCenter.placeholders.description", {
                defaultValue: "Short center description",
              })}
              className="min-h-20"
            />
          </div>
        </div>
      </div>

      {/* Schedule & Base Pricing */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b pb-2.5 text-base font-bold">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Clock className="size-4" />
          </div>
          <span className="text-primary">
            {t("createCenter.sectionTitles.schedulePrice", {
              defaultValue: "Schedule & Base Pricing",
            })}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="center-open-time">
              {t("createCenter.fields.openTime", {
                defaultValue: "Opening time",
              })}
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="center-open-time"
              type="time"
              value={centerDraft.openTime}
              onChange={(e) =>
                setCenterDraft((current) => ({
                  ...current,
                  openTime: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="center-close-time">
              {t("createCenter.fields.closeTime", {
                defaultValue: "Closing time",
              })}
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="center-close-time"
              type="time"
              value={centerDraft.closeTime}
              onChange={(e) =>
                setCenterDraft((current) => ({
                  ...current,
                  closeTime: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="center-base-price">
              {t("createCenter.fields.basePrice", {
                defaultValue: "Base price per hour",
              })}
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="center-base-price"
                type="text"
                inputMode="numeric"
                value={
                  centerDraft.basePrice
                    ? Number(
                        centerDraft.basePrice.toString().replace(/\D/g, "")
                      ).toLocaleString("vi-VN")
                    : ""
                }
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "")
                  setCenterDraft((current) => ({
                    ...current,
                    basePrice: rawValue,
                  }))
                }}
                placeholder="80.000"
                className="pr-12"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-xs font-semibold text-muted-foreground">
                  VND
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Bank Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b pb-2.5 text-base font-bold">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CreditCard className="size-4" />
          </div>
          <span className="text-primary">
            {t("createCenter.sectionTitles.paymentDetails", {
              defaultValue: "Payment Details",
            })}
          </span>
        </div>
        <PaymentSelector
          onSelectProfile={(selected) => {
            setCenterDraft((current) => ({
              ...current,
              paymentBankName: selected.paymentBankName,
              paymentAccountName:
                selected.paymentAccountName.toLocaleUpperCase(),
              paymentAccountNumber: selected.paymentAccountNumber,
              ...(selected.paymentQrUrl
                ? { paymentQrUrl: selected.paymentQrUrl }
                : {}),
            }))
          }}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="payment-account-name">
              {t("createCenter.fields.paymentAccountName", {
                defaultValue: "Account holder name",
              })}
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="payment-account-name"
              value={centerDraft.paymentAccountName.toLocaleUpperCase()}
              onChange={(e) =>
                setCenterDraft((current) => ({
                  ...current,
                  paymentAccountName: e.target.value.toLocaleUpperCase(),
                }))
              }
              placeholder={t("createCenter.placeholders.paymentAccountName", {
                defaultValue: "NGUYEN VAN AN",
              })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-account-number">
              {t("createCenter.fields.paymentAccountNumber", {
                defaultValue: "Account number",
              })}
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="payment-account-number"
              value={centerDraft.paymentAccountNumber}
              onChange={(e) =>
                setCenterDraft((current) => ({
                  ...current,
                  paymentAccountNumber: e.target.value,
                }))
              }
              placeholder={t("createCenter.placeholders.paymentAccountNumber", {
                defaultValue: "1903012036913",
              })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-bank-name">
              {t("createCenter.fields.paymentBankName", {
                defaultValue: "Bank name",
              })}
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="payment-bank-name"
              value={centerDraft.paymentBankName}
              onChange={(e) =>
                setCenterDraft((current) => ({
                  ...current,
                  paymentBankName: e.target.value,
                }))
              }
              placeholder={t("createCenter.placeholders.paymentBankName", {
                defaultValue: "Vietcombank",
              })}
            />
          </div>
        </div>
      </div>

      {/* Media & QR Uploads side-by-side */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b pb-2.5 text-base font-bold">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ImageIcon className="size-4" />
          </div>
          <span className="text-primary">
            {t("createCenter.sectionTitles.media", {
              defaultValue: "Images & Payment QR Code",
            })}
          </span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>
              {t("createCenter.fields.images", {
                defaultValue: "Center images",
              })}
            </Label>
            <ImageUploadControl
              value={centerDraft.images}
              multiple
              label={t("createCenter.actions.uploadImage", {
                defaultValue: "Upload image",
              })}
              onChange={(value) =>
                setCenterDraft((current) => ({
                  ...current,
                  images: Array.isArray(value) ? value : value ? [value] : [],
                }))
              }
              onUploadingChange={setCenterImagesUploading}
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              {t("createCenter.fields.paymentQrUrl", {
                defaultValue: "Upload image",
              })}
            </Label>
            <ImageUploadControl
              value={centerDraft.paymentQrUrl}
              label={t("createCenter.actions.uploadImage", {
                defaultValue: "Upload image",
              })}
              onChange={(value) =>
                setCenterDraft((current) => ({
                  ...current,
                  paymentQrUrl:
                    typeof value === "string" ? value : (value[0] ?? ""),
                }))
              }
              onUploadingChange={setPaymentQrUploading}
            />
          </div>
        </div>
      </div>

      {/* Amenities & Rules side-by-side */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b pb-2.5 text-base font-bold">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <span className="text-primary">
            {t("createCenter.sectionTitles.amenitiesRules", {
              defaultValue: "Amenities & Rules",
            })}
          </span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="amenities-text">
              {t("createCenter.fields.amenities", {
                defaultValue: "Amenities",
              })}
            </Label>
            <Textarea
              id="amenities-text"
              value={centerDraft.amenitiesText}
              onChange={(e) =>
                setCenterDraft((current) => ({
                  ...current,
                  amenitiesText: e.target.value,
                }))
              }
              placeholder={t("createCenter.placeholders.listHint", {
                defaultValue: "One item per line",
              })}
              className="min-h-24"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rules-text">
              {t("createCenter.fields.rules", {
                defaultValue: "Rules",
              })}
            </Label>
            <Textarea
              id="rules-text"
              value={centerDraft.rulesText}
              onChange={(e) =>
                setCenterDraft((current) => ({
                  ...current,
                  rulesText: e.target.value,
                }))
              }
              placeholder={t("createCenter.placeholders.listHint", {
                defaultValue: "One item per line",
              })}
              className="min-h-24"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
