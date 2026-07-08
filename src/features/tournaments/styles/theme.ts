/**
 * TOURNAMENT_THEME
 * Standardized Tailwind CSS class names used across the Tournaments feature.
 * Exported to be reused by other features (e.g. Groups, Matches, Profile) to maintain visual consistency.
 */
export const TOURNAMENT_THEME = {
  // Brand Color Palette (Emerald Theme)
  colors: {
    primary: "emerald-600",
    primaryHover: "emerald-700",
    primaryLight: "emerald-50",
    primaryBorder: "emerald-100",
    textPrimary: "emerald-700",
    textHover: "emerald-800",
  },

  // Layout Styles
  layout: {
    headerWrapper:
      "flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center",
    title:
      "flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900",
    subtitle: "text-sm text-gray-500",
    container: "flex flex-col gap-6 p-6",
    grid: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
  },

  // Component Tabs
  tabs: {
    container:
      "flex items-center gap-2 self-start rounded-lg bg-gray-100 p-1 md:self-auto",
    active:
      "bg-white text-emerald-700 shadow-sm px-4 py-2 text-sm font-medium transition-all",
    inactive:
      "text-gray-600 hover:text-emerald-600 px-4 py-2 text-sm font-medium transition-all",
  },

  // Card Styles
  card: {
    base: "overflow-hidden border border-emerald-100 bg-white shadow-sm transition-all hover:shadow-md rounded-xl",
    content: "p-6",
    header:
      "flex flex-row items-center justify-between border-b border-gray-100 bg-gray-50/50 py-4 px-6",
    title: "text-lg font-bold text-gray-900 flex items-center gap-2",
    description: "text-xs text-gray-500 mt-1",
    // Stat Cards
    statWrapper: "grid grid-cols-1 gap-4 sm:grid-cols-3",
    statIconContainer: {
      emerald:
        "flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600",
      sky: "flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600",
      amber:
        "flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600",
    },
  },

  // Table Styles
  table: {
    wrapper:
      "overflow-x-auto border border-gray-150 rounded-xl bg-white shadow-sm",
    base: "w-full border-collapse text-left text-sm text-gray-600",
    thead:
      "bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-100",
    th: "px-6 py-3",
    tr: "hover:bg-gray-50/50 transition-colors border-b border-gray-150 last:border-0",
    td: "whitespace-nowrap px-6 py-4",
    tdBold: "whitespace-nowrap px-6 py-4 font-medium text-gray-900",
  },

  // Badge Styles
  badge: {
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1.5 w-fit",
    pending:
      "border-amber-200 bg-amber-50 text-amber-700 font-semibold flex items-center gap-1.5 w-fit",
    danger:
      "border-red-200 bg-red-50 text-red-700 font-semibold flex items-center gap-1.5 w-fit",
    info: "border-sky-200 bg-sky-50 text-sky-700 font-semibold flex items-center gap-1.5 w-fit",
    muted:
      "border-gray-200 bg-gray-50 text-gray-500 font-semibold flex items-center gap-1.5 w-fit",
  },

  // Button Styles
  button: {
    primary: "bg-emerald-600 font-semibold text-white hover:bg-emerald-700",
    outline:
      "bg-white border-emerald-250 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",
    dangerGhost:
      "h-8 px-2 text-red-600 hover:bg-red-50/50 hover:text-red-700 rounded-md transition-colors",
  },

  // Form Controls
  form: {
    label: "text-sm font-semibold text-gray-700",
    input:
      "flex-1 bg-white text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500",
  },
} as const
