const fs = process.getBuiltinModule("node:fs")
const path = process.getBuiltinModule("node:path")

const root = path.resolve(__dirname, "..")
const localeRoot = path.join(root, "src", "i18n", "locales")
const sourceRoots = [path.join(root, "src", "app"), path.join(root, "src", "components"), path.join(root, "src", "features")]
const namespaces = [
  "common",
  "groups",
  "socials",
  "profile",
  "sport-center",
  "sport-center-management",
  "subscriptions",
  "tournament",
  "score",
]
const mojibake = /(?:Ã.|Â.|ï¿½|�|â‚¬|ðŸ)/

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"))
}

function deepMerge(...values) {
  return values.reduce((result, value) => {
    for (const [key, current] of Object.entries(value || {})) {
      if (current && typeof current === "object" && !Array.isArray(current)) {
        result[key] = deepMerge(result[key], current)
      } else {
        result[key] = current
      }
    }
    return result
  }, {})
}

function filesUnder(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory() ? filesUnder(file) : [file]
  })
}

function getLocale(language, namespace) {
  const directory = path.join(localeRoot, language)
  if (namespace === "common") {
    const common = readJson(path.join(directory, "common.json"))
    if (language === "en") {
      common.saving = common.landing?.saving
      common.coach = common.landing?.coach
      common.learner = common.landing?.learner
      common.friends = common.landing?.friends
      common.equipment = common.landing?.equipment
      common.auth = common.landing?.auth
      common.invitation = common.landing?.invitation
      common.breadcrumb = common.landing?.breadcrumb
      common.carousel = common.landing?.carousel
      common.spinner = common.landing?.spinner
      common.settingsPage = common.landing?.settingsPage
    }
    return common
  }
  const fileMap = {
    groups: ["group/groups.json"],
    profile: ["profile.json"],
    score: ["score.json"],
    "sport-center": ["sport-center.json"],
    "sport-center-management": ["sport-center-management.json"],
    subscriptions: ["subscriptions.json"],
    socials: ["socials/general.json", "socials/listing.json", "socials/detail.json", "socials/forms.json"],
    tournament: [
      "tournament/booking.json", "tournament/brackets.json", "tournament/create.json",
      "tournament/dashboard.json", "tournament/events.json", "tournament/general.json",
      "tournament/group-stage.json", "tournament/live-control.json", "tournament/personnel.json",
      "tournament/registrations.json", "tournament/scheduling.json", "tournament/seeding.json",
      "tournament/team-matching.json",
    ],
  }
  return deepMerge(...fileMap[namespace].map((file) => readJson(path.join(directory, file))))
}

function flatten(value, prefix = "") {
  return Object.entries(value || {}).flatMap(([key, current]) => {
    const full = prefix ? `${prefix}.${key}` : key
    return current && typeof current === "object" && !Array.isArray(current)
      ? flatten(current, full)
      : [[full, current]]
  })
}

function getAt(value, key) {
  return key.split(".").reduce((current, part) => current && current[part], value)
}

function hasPluralPair(value, key) {
  const parent = key.split(".").slice(0, -1).join(".")
  const leaf = key.split(".").at(-1)
  return getAt(value, `${parent}.${leaf}_one`) != null && getAt(value, `${parent}.${leaf}_other`) != null
}

function placeholders(value) {
  return [...String(value).matchAll(/\{\{?\s*([\w.-]+)\s*\}?\}/g)].map((match) => match[1]).sort().join(",")
}

const locales = Object.fromEntries(["en", "vi"].map((language) => [
  language,
  Object.fromEntries(namespaces.map((namespace) => [namespace, getLocale(language, namespace)])),
]))
function findOtherNamespace(key, language, excluded) {
  return namespaces.filter((candidate) => candidate !== excluded && getAt(locales[language][candidate], key) != null)
}
let errors = 0
const warn = (message) => console.log(`WARN ${message}`)
const error = (message) => { console.error(`ERROR ${message}`); errors++ }

for (const namespace of namespaces) {
  const en = Object.fromEntries(flatten(locales.en[namespace]))
  const vi = Object.fromEntries(flatten(locales.vi[namespace]))
  for (const key of new Set([...Object.keys(en), ...Object.keys(vi)])) {
    if (namespace === "common" && key.startsWith("landing.")) continue
    if (!(key in en) || !(key in vi)) warn(`${namespace}.${key} exists in ${key in en ? "EN" : "VI"} only`)
    if (key in en && key in vi) {
      if (typeof en[key] !== typeof vi[key]) error(`${namespace}.${key} has type mismatch`)
      if (en[key] === "" || vi[key] === "") error(`${namespace}.${key} has empty value`)
      if (placeholders(en[key]) !== placeholders(vi[key])) error(`${namespace}.${key} has placeholder mismatch`)
      if (mojibake.test(en[key]) || mojibake.test(vi[key])) error(`${namespace}.${key} has encoding error`)
    }
  }
}

const used = new Map()
for (const sourceRoot of sourceRoots) {
  for (const file of filesUnder(sourceRoot).filter((file) => /\.[jt]sx?$/.test(file))) {
    const source = fs.readFileSync(file, "utf8")
    const hasTranslationHook = /useTranslation\(|use(?:Groups|Socials|RecurringSocials|Profile|Tournament|SportCenterManagement|CourtCredits|SportCenter|Score|Subscription)Translation/.test(source)
    if (!hasTranslationHook) continue
    const namespace = source.includes("useProfileTranslation") && source.includes('useTranslation("common")') ? "common" : source.includes("useGroupsTranslation") ? "groups" : source.includes("useSocialsTranslation") || source.includes("useRecurringSocialsTranslation") ? "socials" : source.includes("useProfileTranslation") ? "profile" : source.includes("useTournamentTranslation") ? "tournament" : source.includes("useSportCenterManagementTranslation") || source.includes("useCourtCreditsTranslation") ? "sport-center-management" : source.includes("useSportCenterTranslation") ? "sport-center" : source.includes("useScoreTranslation") ? "score" : source.includes("useSubscriptionTranslation") ? "subscriptions" : source.match(/useTranslation\(\s*["']([^"']+)["']/)?.[1] || "common"
    const calls = [...source.matchAll(/\bt\(\s*["'`]([^"'`$]+)["'`]/g)]
    for (const call of calls) {
      const key = call[1]
      const callIndex = call.index || 0
      if (key.endsWith(".")) continue
      if (!used.has(namespace)) used.set(namespace, new Map())
      if (!used.get(namespace).has(key)) used.get(namespace).set(key, {
        file,
        hasDefault: source.slice(callIndex, callIndex + 500).includes("defaultValue") ||
          /,\s*["']/.test(source.slice(callIndex, callIndex + 140)),
      })
    }
  }
}
for (const [namespace, keys] of used) {
  for (const [key, usage] of keys) {
    const normalizedKey = key.replace(/^coach\.swingAnalysis\./, "coach.discovery.swingAnalysis.")
    const enValue = getAt(locales.en[namespace], normalizedKey)
    const viValue = getAt(locales.vi[namespace], normalizedKey)
    const isPluralized = hasPluralPair(locales.en[namespace], normalizedKey) && hasPluralPair(locales.vi[namespace], normalizedKey)
    if ((enValue == null || viValue == null || enValue === "" || viValue === "") && !usage.hasDefault && !isPluralized) {
      const alternatives = [...new Set([...findOtherNamespace(normalizedKey, "en", namespace), ...findOtherNamespace(normalizedKey, "vi", namespace)])]
      error(`used key missing or empty: ${namespace}.${key}${alternatives.length ? ` (possible namespace: ${alternatives.join(",")})` : ""} (${path.relative(root, usage.file)})`)
    }
  }
}

console.log(`Checked ${namespaces.length} namespaces and ${[...used.values()].reduce((total, map) => total + map.size, 0)} static translation calls.`)
process.exitCode = errors ? 1 : 0
