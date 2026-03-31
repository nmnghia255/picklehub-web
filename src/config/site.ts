export const SITE_INFO = {
  name: "PickleHub",
  url: process.env.APP_URL!,
  ogImage: "",
  description: "PickleHub for Web",
  keywords: ["picklehub", "pickleball"],
}

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
}

// Page width configuration - unified across the application
export const PAGE_WIDTHS = {
  // Standard width for most protected pages (default)
  DEFAULT: "max-w-5xl",
  // Wider width for complex layouts (booking, detailed views)
  WIDE: "max-w-7xl",
  // Narrow width for forms and auth pages
  NARROW: "max-w-md",
  // Standard padding
  PADDING: "p-6",
  // Responsive padding
  PADDING_RESPONSIVE: "px-4 py-8 sm:px-6 lg:px-8",
  // Container wrapper classes for protected pages
  CONTAINER: "container mx-auto",
  // Container wrapper classes for wider layouts
  CONTAINER_WIDE: "mx-auto w-full",
}
