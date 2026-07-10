"use client"

import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import enCommon from "./locales/en/common.json"
import enProfile from "./locales/en/profile.json"
import enScore from "./locales/en/score.json"
import enSocials from "./locales/en/socials"
import enSportCenter from "./locales/en/sport-center.json"
import enSportCenterManagement from "./locales/en/sport-center-management.json"
import enSubscriptions from "./locales/en/subscriptions.json"
import enTournament from "./locales/en/tournament"
import viCommon from "./locales/vi/common.json"
import viProfile from "./locales/vi/profile.json"
import viScore from "./locales/vi/score.json"
import viSocials from "./locales/vi/socials"
import viSportCenter from "./locales/vi/sport-center.json"
import viSportCenterManagement from "./locales/vi/sport-center-management.json"
import viSubscriptions from "./locales/vi/subscriptions.json"
import viTournament from "./locales/vi/tournament"
import { defaultLanguage } from "./settings"

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      socials: enSocials,
      profile: enProfile,
      "sport-center": enSportCenter,
      "sport-center-management": enSportCenterManagement,
      subscriptions: enSubscriptions,
      tournament: enTournament,
      score: enScore,
    },
    vi: {
      common: viCommon,
      socials: viSocials,
      profile: viProfile,
      "sport-center": viSportCenter,
      "sport-center-management": viSportCenterManagement,
      subscriptions: viSubscriptions,
      tournament: viTournament,
      score: viScore,
    },
  },

  lng: defaultLanguage,
  fallbackLng: "en",

  ns: [
    "common",
    "socials",
    "profile",
    "sport-center",
    "sport-center-management",
    "subscriptions",
    "tournament",
    "score",
  ],
  defaultNS: "socials",

  interpolation: {
    escapeValue: false,
  },
})

export default i18n
