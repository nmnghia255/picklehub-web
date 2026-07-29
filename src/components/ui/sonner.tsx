"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-600" />,
        info: <InfoIcon className="size-4 text-blue-600" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-600" />,
        error: <OctagonXIcon className="size-4 text-red-600" />,
        loading: (
          <Loader2Icon className="size-4 animate-spin text-emerald-600" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:p-4 font-sans",
          title:
            "group-[.toast]:font-semibold group-[.toast]:text-sm group-[.toast]:text-gray-900",
          description:
            "group-[.toast]:text-gray-600 group-[.toast]:text-xs group-[.toast]:leading-relaxed mt-1",
          actionButton:
            "group-[.toast]:bg-emerald-600 group-[.toast]:text-white group-[.toast]:hover:bg-emerald-700 group-[.toast]:font-semibold group-[.toast]:rounded-lg group-[.toast]:px-3.5 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:shadow-xs transition-colors shrink-0",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:hover:bg-gray-200 group-[.toast]:font-medium group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs shrink-0",
          success:
            "group-[.toaster]:bg-emerald-50/90 group-[.toaster]:text-emerald-950 group-[.toaster]:border-emerald-200",
          error:
            "group-[.toaster]:bg-red-50/90 group-[.toaster]:text-red-950 group-[.toaster]:border-red-200",
          warning:
            "group-[.toaster]:bg-amber-50/90 group-[.toaster]:text-amber-950 group-[.toaster]:border-amber-200",
          info: "group-[.toaster]:bg-blue-50/90 group-[.toaster]:text-blue-950 group-[.toaster]:border-blue-200",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
