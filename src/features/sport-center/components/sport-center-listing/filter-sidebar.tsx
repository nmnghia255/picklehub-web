"use client"

import { Filter } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { useSportCenterStore } from "@/features/sport-center/stores/sport-center-store"

export function FilterSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const favoriteFilter = useSportCenterStore((state) => state.favoriteFilter)
  const setFavoriteFilter = useSportCenterStore(
    (state) => state.setFavoriteFilter
  )
  const [open, setOpen] = useState(false)
  const [pendingFavoriteOnly, setPendingFavoriteOnly] = useState(
    favoriteFilter === "favorite"
  )

  useEffect(() => {
    if (!open) return

    // Defer setting state to avoid synchronous setState inside effect
    const id = setTimeout(() => {
      setPendingFavoriteOnly(favoriteFilter === "favorite")
    }, 0)

    return () => clearTimeout(id)
  }, [favoriteFilter, open])

  const handleConfirmFilter = () => {
    const nextFavoriteFilter = pendingFavoriteOnly ? "favorite" : "all"

    setFavoriteFilter(nextFavoriteFilter)

    const params = new URLSearchParams(searchParams.toString())
    params.set("page", "1")

    if (nextFavoriteFilter === "favorite") {
      params.set("favorite", "favorite")
    } else {
      params.delete("favorite")
    }

    router.replace(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="shrink-0 gap-2">
          <Filter className="size-4" />
          <span className="hidden sm:inline">Bộ lọc</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle>Bộ lọc</SheetTitle>
          <SheetDescription>
            Chọn tiêu chí lọc để tìm sân phù hợp nhanh hơn.
          </SheetDescription>
        </SheetHeader>

        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Yêu thích</p>
              <Switch
                checked={pendingFavoriteOnly}
                onCheckedChange={setPendingFavoriteOnly}
                aria-label="Chỉ hiển thị sân yêu thích"
              />
            </div>

            <div className="pt-2">
              <Button
                type="button"
                className="w-full"
                onClick={handleConfirmFilter}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
