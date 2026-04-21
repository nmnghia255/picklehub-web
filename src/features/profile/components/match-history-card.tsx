import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function MatchHistory() {
  return (
    <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow">
      <h3 className="mb-4 font-semibold">Trận đấu gần đây</h3>
      <Table className="text-left">
        <TableHeader>
          <TableRow className="text-sm text-muted-foreground hover:bg-transparent">
            <TableHead>Ngày</TableHead>
            <TableHead>Đối thủ</TableHead>
            <TableHead>Kết quả</TableHead>
            <TableHead>Điểm</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Mar 15</TableCell>
            <TableCell>Jane Doe</TableCell>
            <TableCell>
              <span className="rounded bg-green-500 px-2 py-1 text-white">
                Thắng
              </span>
            </TableCell>
            <TableCell>11-7, 11-9</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Mar 12</TableCell>
            <TableCell>Mike Johnson</TableCell>
            <TableCell>
              <span className="rounded bg-gray-400 px-2 py-1 text-white">
                Thua
              </span>
            </TableCell>
            <TableCell>9-11, 8-11</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Mar 10</TableCell>
            <TableCell>Sarah Williams</TableCell>
            <TableCell>
              <span className="rounded bg-green-500 px-2 py-1 text-white">
                Thắng
              </span>
            </TableCell>
            <TableCell>11-5, 11-3</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Mar 8</TableCell>
            <TableCell>Tom Brown</TableCell>
            <TableCell>
              <span className="rounded bg-green-500 px-2 py-1 text-white">
                Thắng
              </span>
            </TableCell>
            <TableCell>11-9, 11-6</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
