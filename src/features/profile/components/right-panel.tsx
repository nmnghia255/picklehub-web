export function RightPanel() {
  return (
    <div className="space-y-6">
      {/* Achievements */}
      <div className="rounded-2xl bg-card p-6 text-card-foreground shadow">
        <h3 className="mb-4 font-semibold">Thành tựu & Huy hiệu</h3>
        <ul className="space-y-3">
          <li>Nhà vô địch giải đấu</li>
          <li>Xếp hạng 5 sao</li>
          <li>Người chơi cộng đồng</li>
          <li>Người chơi đều đặn</li>
        </ul>
      </div>

      {/* Body information */}
      <div className="rounded-2xl bg-card p-6 text-card-foreground shadow">
        <h3 className="mb-4 font-semibold">Thông tin thể chất</h3>
        <p className="mb-2">
          <b>Chiều cao:</b> 175 cm
        </p>
        <p className="mb-2">
          <b>Cân nặng:</b> 70 kg
        </p>
      </div>

      {/* Preferences */}
      <div className="rounded-2xl bg-card p-6 text-card-foreground shadow">
        <h3 className="mb-4 font-semibold">Cá nhân hóa</h3>
        <p className="mb-2">
          <b>Trình độ:</b> Người mới
        </p>
        <p className="mb-2">
          <b>Phong cách chơi:</b> Tấn công
        </p>
        <p className="mb-2">
          <b>Thời gian rảnh:</b> Tối thứ Hai - thứ Sáu
        </p>
      </div>
    </div>
  )
}
