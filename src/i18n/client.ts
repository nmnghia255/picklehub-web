"use client"

import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import enCommon from "./locales/en/common.json"
import enGroups from "./locales/en/group/groups.json"
import enProfile from "./locales/en/profile.json"
import enScore from "./locales/en/score.json"
import enSocials from "./locales/en/socials"
import enSportCenter from "./locales/en/sport-center.json"
import enSportCenterManagement from "./locales/en/sport-center-management.json"
import enSubscriptions from "./locales/en/subscriptions.json"
import enTournament from "./locales/en/tournament"
import viCommon from "./locales/vi/common.json"
import viGroups from "./locales/vi/group/groups.json"
import viProfile from "./locales/vi/profile.json"
import viScore from "./locales/vi/score.json"
import viSocials from "./locales/vi/socials"
import viSportCenter from "./locales/vi/sport-center.json"
import viSportCenterManagement from "./locales/vi/sport-center-management.json"
import viSubscriptions from "./locales/vi/subscriptions.json"
import viTournament from "./locales/vi/tournament"
import { defaultLanguage } from "./settings"

i18n.use(initReactI18next).init({
  // @ts-expect-error: initImmediate is not recognized by i18n type definitions
  initImmediate: false,
  resources: {
    en: {
      common: {
        ...enCommon,
        saving: enCommon.landing.saving,
        coach: enCommon.landing.coach,
        learner: enCommon.landing.learner,
        friends: enCommon.landing.friends,
        equipment: enCommon.landing.equipment,
        auth: enCommon.landing.auth,
        invitation: enCommon.landing.invitation,
        breadcrumb: enCommon.landing.breadcrumb,
        carousel: enCommon.landing.carousel,
        spinner: enCommon.landing.spinner,
        settingsPage: enCommon.landing.settingsPage,
      },
      groups: enGroups,
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
      groups: viGroups,
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
    "groups",
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
