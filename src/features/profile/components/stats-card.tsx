export function StatsCard() {
  return (
    <>
      {/* Match Stats */}
      <div className="rounded-2xl bg-card p-6 text-card-foreground shadow">
        <h3 className="mb-4 font-semibold">Thống kê</h3>
        <div className="mb-4 grid grid-cols-4 text-center">
          <div>
            <p className="text-xl font-bold">45</p>
            <p className="text-muted-foreground">Trận đã chơi</p>
          </div>
          <div>
            <p className="text-xl font-bold">31</p>
            <p className="text-muted-foreground">Thắng</p>
          </div>
          <div>
            <p className="text-xl font-bold">14</p>
            <p className="text-muted-foreground">Thua</p>
          </div>
          <div>
            <p className="text-xl font-bold">68%</p>
            <p className="text-muted-foreground">Tỷ lệ thắng</p>
          </div>
        </div>
        <div className="flex justify-between border-t border-border pt-4 text-sm text-muted-foreground">
          <p>
            Chuỗi hiện tại: <b>5 trận</b>
          </p>
          <p>
            Chuỗi thắng dài nhất: <b>12 trận</b>
          </p>
        </div>
      </div>
    </>
  )
}
