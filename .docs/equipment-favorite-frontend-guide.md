# Frontend Integration Guide: Tính năng Vật dụng yêu thích (Equipment Favorites)

Tài liệu này cung cấp hướng dẫn chi tiết dành cho các lập trình viên Frontend (Web/Mobile) để tích hợp các API của tính năng **Vật dụng yêu thích** một cách mượt mà và tối ưu hóa trải nghiệm người dùng (UX).

---

## 🔒 1. Truyền Authorization Header

Tất cả các API yêu cầu xác thực JWT. Frontend bắt buộc phải đính kèm Header dưới định dạng chuẩn **Bearer Token**.

### Cách thực hiện (Ví dụ dùng Axios Interceptor trong React/React Native)

```typescript
import axios from "axios"

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
})

// Tự động đính kèm Token vào mọi request
api.interceptors.request.use(
  async (config) => {
    const token = await localStorage.getItem("accessToken") // hoặc SecureStore/AsyncStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
```

---

## ⏳ 2. Quản lý trạng thái Loading (Loading States)

Để tránh hiện tượng giật lag giao diện (Layout Shift) và ngăn chặn người dùng bấm liên tục gửi trùng request (Double Submit), Frontend cần cài đặt Loading States cho từng tình huống:

### A. Trạng thái tải danh sách gợi ý (Get List)

Khi người dùng mở form "Thêm vật dụng mới", API `GET /equipment-favorites` được gọi để lấy danh sách gợi ý.

- **UI/UX Recommended:**
  - Sử dụng **Skeleton Loader** cho dropdown menu hoặc danh sách thay vì che toàn bộ màn hình bằng một Spinner lớn.
  - Disable nút chọn hoặc ô nhập cho tới khi dữ liệu load xong để tránh chọn giá trị không khả dụng.

### B. Trạng thái cập nhật & bật/tắt yêu thích (Toggle / Update)

Khi người dùng bấm vào biểu tượng Ngôi sao (Favorite) hoặc nhấn nút "Lưu thay đổi":

- **UI/UX Recommended:**
  - Disable nút tương ứng ngay lập tức để chặn người dùng click liên tiếp.
  - Hiển thị một **Micro-spinner** ngay bên trong nút bấm hoặc làm mờ nhẹ phần tử (Opacity 0.6).

### C. Kỹ thuật cập nhật nhanh (Optimistic UI Updates)

Đối với hành động **Toggle Favorite** (`PATCH .../favorite`), thời gian phản hồi của mạng có thể gây ra độ trễ làm người dùng cảm thấy ứng dụng phản hồi chậm. Nên áp dụng Optimistic Update:

1. Khi người dùng click chọn/bỏ chọn ngôi sao → Thay đổi màu sắc ngôi sao ngay lập tức trên UI (Local State).
2. Gọi API ngầm.
3. Nếu API thành công → Giữ nguyên.
4. Nếu API thất bại (ví dụ: mất mạng, lỗi 403) → Đảo ngược trạng thái ngôi sao về ban đầu và thông báo lỗi.

_Ví dụ React (Optimistic Update):_

```typescript
const handleToggleFavorite = async (
  equipmentId: string,
  currentStatus: boolean
) => {
  const newStatus = !currentStatus

  // 1. Cập nhật UI ngay lập tức
  setEquipmentList((prev) =>
    prev.map((item) =>
      item.id === equipmentId ? { ...item, isFavorite: newStatus } : item
    )
  )

  try {
    // 2. Gọi API ngầm
    await api.patch(
      `/api/groups/${groupId}/equipment/${equipmentId}/favorite`,
      {
        isFavorite: newStatus,
      }
    )
  } catch (error) {
    // 3. Rollback nếu lỗi
    setEquipmentList((prev) =>
      prev.map((item) =>
        item.id === equipmentId ? { ...item, isFavorite: currentStatus } : item
      )
    )
    showToast("Lỗi: Không thể cập nhật trạng thái yêu thích.")
  }
}
```

---

## 🚨 3. Xử lý mã lỗi (Error Codes) phổ biến

Hệ thống trả về các Http Status Code chuẩn kết hợp với mã lỗi cụ thể ở JSON Response body. Dưới đây là cách Frontend nên xử lý đối với từng mã lỗi:

### ⚠️ 401 Unauthorized (Lỗi Xác thực)

- **Nguyên nhân:** Token JWT đã hết hạn hoặc không hợp lệ.
- **Cách xử lý:**
  - Chặn tất cả các thao tác tiếp theo.
  - Thực hiện cơ chế refresh token tự động (nếu có cấu hình).
  - Nếu refresh thất bại, xóa sạch session ở Storage (`localStorage.removeItem('accessToken')`), đưa người dùng về trang **Đăng nhập (Login)** kèm thông báo `"Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."`.

### 🛡️ 403 Forbidden (Lỗi Phân quyền)

- **Nguyên nhân:** Thành viên thường (`MEMBER`) cố gắng thực hiện quyền của chủ nhóm (`OWNER`) như cập nhật/xóa bản mẫu hoặc bật/tắt yêu thích.
- **Mã lỗi backend cụ thể:** `GROUP_NOT_OWNER`
- **Cách xử lý:**
  - **Chủ động chặn ở UI (Best Practice):** Frontend nên đọc thông tin vai trò của user (trong payload JWT hoặc thông qua API thông tin thành viên nhóm). Nếu không phải là `OWNER` của nhóm đó, hãy ẩn hoàn toàn hoặc chuyển sang trạng thái disabled (mờ đi) đối với nút Toggle Favorite, nút Sửa/Xóa.
  - **Xử lý khi có lỗi API:** Hiển thị một Toast cảnh báo dạng Pop-up: `"Bạn không có quyền thực hiện hành động này. Chỉ có Chủ nhóm mới có quyền quản lý vật dụng yêu thích."`

### 🔍 404 Not Found (Không tìm thấy tài nguyên)

- **Nguyên nhân:** Nhóm (`GROUP_NOT_FOUND`) hoặc vật dụng/bản mẫu yêu thích (`EQUIPMENT_NOT_FOUND` hoặc `"Favorite equipment template not found."`) đã bị xóa hoặc không tồn tại.
- **Cách xử lý:**
  - Hiển thị thông báo Toast cảnh báo: `"Vật dụng hoặc Nhóm này không tồn tại hoặc đã bị xóa."`
  - Chuyển hướng người dùng quay lại danh sách vật dụng chính hoặc reload lại danh sách để đồng bộ trạng thái mới nhất.

### ⚡ 409 Conflict (Trùng lặp tên vật dụng)

- **Nguyên nhân:** Khi Owner cập nhật tên một bản mẫu (`PUT .../equipment-favorites/:id`) trùng với tên một bản mẫu khác đã có trong nhóm.
- **Thông báo lỗi backend cụ thể:** `"A favorite equipment item with this name already exists."`
- **Cách xử lý:**
  - Hiển thị thông báo lỗi **Inline** (ngay dưới ô nhập tên vật dụng): `"Tên vật dụng yêu thích này đã tồn tại trong nhóm. Vui lòng chọn tên khác."`
  - Chuyển trạng thái ô nhập sang viền đỏ (Error state) và focus vào ô đó để người dùng sửa đổi tiện lợi. Không nên hiển thị dạng Toast chung chung vì người dùng khó định vị được lỗi nằm ở trường dữ liệu nào.

---

## 🗺️ 4. Bản đồ tính năng hiển thị theo Vai trò (UI Role Matrix)

Để đảm bảo hiệu năng và giảm tải cho backend, hãy thiết lập hiển thị giao diện theo phân quyền vai trò như sau:

| Component / Giao diện                  | MEMBER  |  OWNER  | Ghi chú tích hợp                               |
| :------------------------------------- | :-----: | :-----: | :--------------------------------------------- |
| **Dropdown chọn từ Mẫu yêu thích**     | ✅ Hiện | ✅ Hiện | Gọi `GET .../equipment-favorites` để lấy data. |
| **Nút sửa thông tin mẫu (Edit)**       |  ❌ Ẩn  | ✅ Hiện | Gọi `PUT .../equipment-favorites/:id`          |
| **Nút xóa mẫu khỏi danh mục (Delete)** |  ❌ Ẩn  | ✅ Hiện | Gọi `DELETE .../equipment-favorites/:id`       |
| **Icon Ngôi sao yêu thích tại vật lý** |  ❌ Ẩn  | ✅ Hiện | Gọi `PATCH .../equipment/:id/favorite`         |
