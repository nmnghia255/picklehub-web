import type {
  AgeGroup,
  GenderPolicy,
  SocialFormat,
  SocialStatus,
} from "./social"

export type FilterOption<T> = {
  value: T
  label: string
}

type TranslationFn = (key: string) => string

export function getStatusOptions(
  t: TranslationFn
): FilterOption<SocialStatus | null>[] {
  return [
    { value: null, label: t("filters.notYet") },
    { value: "PUBLISHED", label: t("labels.published") },
    { value: "COMPLETED", label: t("labels.completed") },
    { value: "CANCELED", label: t("labels.cancelled") },
  ]
}

export function getGenderPolicyOptions(
  t: TranslationFn
): FilterOption<GenderPolicy | null>[] {
  return [
    { value: null, label: t("filters.notYet") },
    { value: "MIXED_ONLY", label: t("labels.mixed") },
    { value: "MALE_ONLY", label: t("labels.menOnly") },
    { value: "FEMALE_ONLY", label: t("labels.womenOnly") },
  ]
}

export function getAgeGroupOptions(
  t: TranslationFn
): FilterOption<AgeGroup | null>[] {
  return [
    { value: null, label: t("filters.notYet") },
    { value: "JUNIOR", label: t("labels.junior") },
    { value: "ADULT", label: t("labels.adult") },
    { value: "SENIOR", label: t("labels.senior") },
  ]
}

export function getFormatOptions(
  t: TranslationFn
): FilterOption<SocialFormat | null>[] {
  return [
    { value: null, label: t("filters.notYet") },
    { value: "SOCIAL", label: t("labels.social") },
    { value: "SINGLES", label: t("labels.tournament") },
  ]
}
