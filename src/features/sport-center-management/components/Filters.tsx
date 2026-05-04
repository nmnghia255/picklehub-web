import { Calendar, Filter } from "lucide-react"

interface FiltersProps {
  date: string
  setDate: (d: string) => void
  courtFilter: string
  setCourtFilter: (c: string) => void
}

export function Filters({
  date,
  setDate,
  courtFilter,
  setCourtFilter,
}: FiltersProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-white p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-input-background rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <select
            value={courtFilter}
            onChange={(e) => setCourtFilter(e.target.value)}
            className="bg-input-background rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Tất cả sân</option>
            <option value="Sân 1">Sân 1</option>
            <option value="Sân 2">Sân 2</option>
            <option value="Sân 3">Sân 3</option>
            <option value="Sân 4">Sân 4</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm border-2 border-emerald-300 bg-linear-to-br from-emerald-50 to-teal-50"></div>
            <span className="text-muted-foreground">Đã đặt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm border-2 border-amber-300 bg-linear-to-br from-amber-50 to-yellow-50"></div>
            <span className="text-muted-foreground">Chờ xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm border-2 border-dashed border-gray-200 bg-white"></div>
            <span className="text-muted-foreground">Còn trống</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm border-2 border-red-300 bg-linear-to-br from-red-50 to-rose-50"></div>
            <span className="text-muted-foreground">Đã hủy</span>
          </div>
        </div>
      </div>
    </div>
  )
}
