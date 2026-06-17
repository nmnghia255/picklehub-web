"use client"

import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import enProfile from "./locales/en/profile.json"
import enSocials from "./locales/en/socials.json"
import enSportCenter from "./locales/en/sport-center.json"
import enSportCenterManagement from "./locales/en/sport-center-management.json"
import enSubscriptions from "./locales/en/subscriptions.json"
import enTournament from "./locales/en/tournament.json"
import viProfile from "./locales/vi/profile.json"
import viSocials from "./locales/vi/socials.json"
import viSportCenter from "./locales/vi/sport-center.json"
import viSportCenterManagement from "./locales/vi/sport-center-management.json"
import viSubscriptions from "./locales/vi/subscriptions.json"
import viTournament from "./locales/vi/tournament.json"
import { defaultLanguage } from "./settings"

i18n.use(initReactI18next).init({
  resources: {
    en: {
      socials: enSocials,
      profile: enProfile,
      "sport-center": enSportCenter,
      "sport-center-management": enSportCenterManagement,
      subscriptions: enSubscriptions,
      tournament: enTournament,
    },
    vi: {
      socials: viSocials,
      profile: viProfile,
      "sport-center": viSportCenter,
      "sport-center-management": viSportCenterManagement,
      subscriptions: viSubscriptions,
      tournament: viTournament,
    },
  },

  lng: defaultLanguage,
  fallbackLng: "en",

  ns: [
    "socials",
    "profile",
    "sport-center",
    "sport-center-management",
    "subscriptions",
    "tournament",
  ],
  defaultNS: "socials",

  interpolation: {
    escapeValue: false,
  },
})

export default i18n
