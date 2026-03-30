import { PAGE_WIDTHS } from "@/config/site"

type Variant = "default" | "wide"

interface PageContainerProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

export function PageContainer({
  children,
  variant = "default",
  className,
}: PageContainerProps) {
  const getClasses = () => {
    const base =
      variant === "default"
        ? `${PAGE_WIDTHS.CONTAINER} ${PAGE_WIDTHS.DEFAULT}`
        : `${PAGE_WIDTHS.CONTAINER_WIDE} ${PAGE_WIDTHS.WIDE}`

    const padding = PAGE_WIDTHS.PADDING

    return `${base} ${padding} ${className || ""}`.trim()
  }

  return <div className={getClasses()}>{children}</div>
}
