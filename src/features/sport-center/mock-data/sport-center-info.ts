import type { SportCenterInfo } from "../types"

export const sportCenterInfo: SportCenterInfo = {
  introduction:
    "Pickle Dome Sukhumvit là một địa điểm chơi pickleball hiện đại được thiết kế dành cho cả người chơi nghiệp dư và các nhóm thi đấu chuyên nghiệp. Địa điểm này cung cấp các sân trong nhà với hệ thống chiếu sáng tiêu chuẩn thi đấu, khu vực ghế ngồi thư giãn và bãi đậu xe thuận tiện.",
  services: [
    { label: "6h-12h", price: "80.000 VND" },
    { label: "12h-18h", price: "120.000 VND" },
    { label: "18h-20h", price: "140.000 VND" },
    { label: "20h-22h", price: "100.000 VND" },
  ],
  images: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80",
  ],
  policies: [
    "Vui lòng đến sớm ít nhất 10 phút trước thời gian đặt sân.",
    "Hủy đặt miễn phí lên đến 4 giờ trước thời gian bắt đầu.",
    "Giày không để lại dấu vết là bắt buộc trên tất cả các sân trong nhà.",
    "Thực phẩm và đồ uống chỉ được phép trong khu vực phòng lounge.",
  ],
  feedback: [
    {
      name: "Mia Tran",
      rating: 5,
      comment:
        "Sân chơi rất sạch sẽ và chỗ đậu xe dễ dàng. Nhân viên thân thiện và giúp chúng tôi chuẩn bị nhanh chóng..",
    },
    {
      name: "Jason Park",
      rating: 4,
      comment:
        "Hệ thống chiếu sáng ban đêm rất tốt. Tôi rất muốn có thêm tủ đựng đồ gần sân số 3.",
    },
  ],
}
