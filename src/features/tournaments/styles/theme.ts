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
      "flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100",
    subtitle: "text-sm text-gray-500 dark:text-gray-400",
    container: "flex flex-col gap-6 p-6",
    grid: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
  },

  // Component Tabs
  tabs: {
    container:
      "flex items-center gap-2 self-start rounded-lg bg-gray-100 dark:bg-gray-800 p-1 md:self-auto",
    active:
      "bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 shadow-sm px-4 py-2 text-sm font-medium transition-all",
    inactive:
      "text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 px-4 py-2 text-sm font-medium transition-all",
  },

  // Card Styles
  card: {
    base: "overflow-hidden border border-emerald-100 dark:border-emerald-950/60 bg-white dark:bg-card shadow-sm transition-all hover:shadow-md rounded-xl",
    content: "p-6",
    header:
      "flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 py-4 px-6",
    title:
      "text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2",
    description: "text-xs text-gray-500 dark:text-gray-400 mt-1",
    // Stat Cards
    statWrapper: "grid grid-cols-1 gap-4 sm:grid-cols-3",
    statIconContainer: {
      emerald:
        "flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
      sky: "flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400",
      amber:
        "flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
    },
  },

  // Table Styles
  table: {
    wrapper:
      "overflow-x-auto border border-gray-150 dark:border-gray-800 rounded-xl bg-white dark:bg-card shadow-sm",
    base: "w-full border-collapse text-left text-sm text-gray-600 dark:text-gray-300",
    thead:
      "bg-gray-50 dark:bg-gray-900/60 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800",
    th: "px-6 py-3",
    tr: "hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-150 dark:border-gray-800 last:border-0",
    td: "whitespace-nowrap px-6 py-4",
    tdBold:
      "whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-gray-100",
  },

  // Badge Styles
  badge: {
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold flex items-center gap-1.5 w-fit",
    pending:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold flex items-center gap-1.5 w-fit",
    danger:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300 font-semibold flex items-center gap-1.5 w-fit",
    info: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300 font-semibold flex items-center gap-1.5 w-fit",
    muted:
      "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 font-semibold flex items-center gap-1.5 w-fit",
  },

  // Button Styles
  button: {
    primary:
      "bg-emerald-600 font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500",
    outline:
      "bg-white dark:bg-card border-emerald-250 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-800 dark:hover:text-emerald-300",
    dangerGhost:
      "h-8 px-2 text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-300 rounded-md transition-colors",
  },

  // Form Controls
  form: {
    label: "text-sm font-semibold text-gray-700 dark:text-gray-300",
    input:
      "flex-1 bg-white dark:bg-card text-sm border-gray-200 dark:border-gray-800 focus:border-emerald-500 focus:ring-emerald-500",
  },
} as const
