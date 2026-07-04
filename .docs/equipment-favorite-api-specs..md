# API Specification: Tính năng Vật dụng yêu thích (Equipment Favorites)

Tài liệu này mô tả chi tiết các API endpoint, phương thức HTTP, cấu trúc Request/Response và các trường hợp thành công/thất bại của tính năng **Vật dụng yêu thích** thuộc dịch vụ quản lý nhóm (`group-service`).

---

## 📌 Thông tin chung

- **Dịch vụ:** `group-service`
- **Base Path:** `/api/groups/:groupId`
- **Xác thực:** Bearer Token (JWT) được truyền qua header `Authorization`.

---

## 🔑 Các phân quyền (Role required)

| Quyền      | Mô tả                                                                                     |
| :--------- | :---------------------------------------------------------------------------------------- |
| **MEMBER** | Thành viên trong nhóm (bao gồm cả OWNER). Có quyền xem danh sách yêu thích.               |
| **OWNER**  | Chủ sở hữu nhóm. Có toàn quyền quản trị: thêm, sửa, xóa, và bật/tắt trạng thái yêu thích. |

---

## 🌐 Danh sách các API Endpoints

### 1. Lấy danh sách vật dụng yêu thích (Get Favorite Templates)

- **Endpoint:** `GET /api/groups/:groupId/equipment-favorites`
- **Quyền hạn:** `MEMBER` hoặc `OWNER`
- **Mô tả:** Lấy danh sách toàn bộ các bản mẫu vật dụng yêu thích đã được lưu của nhóm, sắp xếp theo số lần sử dụng (`usageCount`) giảm dần. API này hữu ích để hiển thị menu gợi ý (dropdown) khi điền thông tin thêm mới vật dụng.

#### Request

- **Path Parameters:**
  - `groupId` (UUID, Required): Mã định danh của nhóm.
- **Headers:**
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Response (Thành công - 200 OK)

```json
{
  "message": "Get favorite equipment templates successfully",
  "data": [
    {
      "id": "7ca64407-cc74-4b57-a36c-2f96cfb71e1a",
      "groupId": "3d50fb2e-6444-42f2-bd55-520e7d56e7cc",
      "name": "Bóng Dura 40+",
      "defaultQuantity": 12,
      "defaultQuantityType": "NUMBER",
      "defaultCondition": "NEW",
      "defaultCost": 180000,
      "usageCount": 15,
      "isActive": true,
      "createdAt": "2026-07-01T08:30:00.000Z",
      "updatedAt": "2026-07-02T02:15:30.000Z"
    },
    {
      "id": "e44d32f5-bfa3-4df4-8d99-6e3e5ee0d981",
      "groupId": "3d50fb2e-6444-42f2-bd55-520e7d56e7cc",
      "name": "Lưới Pickleball Di Động",
      "defaultQuantity": 1,
      "defaultQuantityType": "NUMBER",
      "defaultCondition": "NEW",
      "defaultCost": 1500000,
      "usageCount": 2,
      "isActive": true,
      "createdAt": "2026-07-01T09:00:00.000Z",
      "updatedAt": "2026-07-01T09:00:00.000Z"
    }
  ]
}
```

#### Response (Thất bại)

- **401 Unauthorized** (Thiếu/sai token):
  ```json
  {
    "statusCode": 401,
    "message": "Missing or invalid Authorization header",
    "error": "Unauthorized"
  }
  ```
- **403 Forbidden** (Không phải thành viên nhóm):
  ```json
  {
    "statusCode": 403,
    "message": {
      "code": "GROUP_NOT_MEMBER",
      "message": "You are not a member of this group."
    },
    "error": "Forbidden"
  }
  ```
- **404 Not Found** (Không tìm thấy nhóm):
  ```json
  {
    "statusCode": 404,
    "message": {
      "code": "GROUP_NOT_FOUND",
      "message": "Group not found."
    },
    "error": "Not Found"
  }
  ```

---

### 2. Cập nhật bản mẫu vật dụng yêu thích (Update Favorite Template)

- **Endpoint:** `PUT /api/groups/:groupId/equipment-favorites/:id`
- **Quyền hạn:** `OWNER`
- **Mô tả:** Cập nhật thông tin mặc định của một bản mẫu vật dụng yêu thích đã lưu (tên, số lượng, loại số lượng, tình trạng hao mòn, chi phí, hoặc trạng thái hoạt động).

#### Request

- **Path Parameters:**
  - `groupId` (UUID, Required): Mã định danh của nhóm.
  - `id` (UUID, Required): Mã định danh của bản mẫu vật dụng yêu thích cần cập nhật.
- **Headers:**
  ```http
  Authorization: Bearer <your_jwt_token>
  Content-Type: application/json
  ```
- **Body Payload (`UpsertFavoriteItemDto`):**
  | Trường | Kiểu dữ liệu | Bắt buộc | Ràng buộc | Ví dụ | Mô tả |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | `name` | String | Có | Tối đa 200 ký tự | `"Bóng Franklin X-40"` | Tên của loại vật dụng. |
  | `defaultQuantity` | Integer | Không | Tối thiểu 1 | `12` | Số lượng mặc định khi tạo mới. |
  | `defaultQuantityType` | Enum | Không | Giá trị: `ALL`, `NUMBER` | `"NUMBER"` | Loại biểu diễn số lượng. |
  | `defaultCondition` | Enum | Không | Giá trị: `NEW`, `GOOD`, `WORN`, `RETIRED` | `"NEW"` | Tình trạng vật dụng mặc định. |
  | `defaultCost` | Integer | Không | Tối thiểu 0 | `210000` | Giá trị chi phí mặc định (VND). |
  | `isActive` | Boolean | Không | - | `true` | Trạng thái hiển thị trong danh mục. |

  _Ví dụ Request Body:_

  ```json
  {
    "name": "Bóng Franklin X-40",
    "defaultQuantity": 12,
    "defaultQuantityType": "NUMBER",
    "defaultCondition": "NEW",
    "defaultCost": 210000,
    "isActive": true
  }
  ```

#### Response (Thành công - 200 OK)

```json
{
  "message": "Favorite equipment template updated successfully",
  "data": {
    "id": "7ca64407-cc74-4b57-a36c-2f96cfb71e1a",
    "groupId": "3d50fb2e-6444-42f2-bd55-520e7d56e7cc",
    "name": "Bóng Franklin X-40",
    "defaultQuantity": 12,
    "defaultQuantityType": "NUMBER",
    "defaultCondition": "NEW",
    "defaultCost": 210000,
    "usageCount": 15,
    "isActive": true,
    "createdAt": "2026-07-01T08:30:00.000Z",
    "updatedAt": "2026-07-02T06:55:00.000Z"
  }
}
```

#### Response (Thất bại)

- **400 Bad Request** (Dữ liệu gửi lên sai định dạng):
  ```json
  {
    "statusCode": 400,
    "message": [
      "defaultQuantity must not be less than 1",
      "defaultCondition must be a valid enum value"
    ],
    "error": "Bad Request"
  }
  ```
- **403 Forbidden** (Thành viên thường không có quyền cập nhật):
  ```json
  {
    "statusCode": 403,
    "message": {
      "code": "GROUP_NOT_OWNER",
      "message": "Only the group owner can perform this action."
    },
    "error": "Forbidden"
  }
  ```
- **404 Not Found** (Không tìm thấy bản mẫu vật dụng hoặc nhóm):
  ```json
  {
    "statusCode": 404,
    "message": "Favorite equipment template not found.",
    "error": "Not Found"
  }
  ```
- **409 Conflict** (Tên vật dụng mới bị trùng lặp với bản mẫu khác của nhóm):
  ```json
  {
    "statusCode": 409,
    "message": "A favorite equipment item with this name already exists.",
    "error": "Conflict"
  }
  ```

---

### 3. Xóa bản mẫu vật dụng yêu thích (Delete Favorite Template)

- **Endpoint:** `DELETE /api/groups/:groupId/equipment-favorites/:id`
- **Quyền hạn:** `OWNER`
- **Mô tả:** Xóa vĩnh viễn bản mẫu vật dụng yêu thích ra khỏi danh sách mẫu của nhóm.
  > [!NOTE]
  > Hành động này **không** làm ảnh hưởng đến các bản ghi vật dụng vật lý (GroupEquipment) đã lưu trong lịch sử mua sắm có cùng tên.

#### Request

- **Path Parameters:**
  - `groupId` (UUID, Required): Mã định danh của nhóm.
  - `id` (UUID, Required): Mã định danh của bản mẫu vật dụng yêu thích cần xóa.
- **Headers:**
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Response (Thành công - 200 OK)

```json
{
  "message": "Favorite equipment template deleted successfully"
}
```

#### Response (Thất bại)

- **403 Forbidden** (Thành viên thường thực hiện xóa):
  ```json
  {
    "statusCode": 403,
    "message": {
      "code": "GROUP_NOT_OWNER",
      "message": "Only the group owner can perform this action."
    },
    "error": "Forbidden"
  }
  ```
- **404 Not Found** (Không tồn tại bản mẫu yêu thích cần xóa):
  ```json
  {
    "statusCode": 404,
    "message": "Favorite equipment template not found.",
    "error": "Not Found"
  }
  ```

---

### 4. Bật/Tắt trạng thái yêu thích của Vật dụng vật lý (Toggle Equipment Favorite Status)

- **Endpoint:** `PATCH /api/groups/:groupId/equipment/:equipmentId/favorite`
- **Quyền hạn:** `OWNER`
- **Mô tả:** Đánh dấu một vật dụng vật lý cụ thể là "yêu thích" hoặc ngược lại.
  - Khi `isFavorite: true`: Đánh dấu vật dụng là yêu thích. Dịch vụ tự động tạo bản mẫu mới trong danh sách mẫu yêu thích (nếu chưa có), hoặc cập nhật đè thông tin cấu hình từ vật dụng này lên bản mẫu cùng tên có sẵn.
  - Khi `isFavorite: false`: Bỏ đánh dấu. Bản ghi mẫu cùng tên sẽ tự động đồng bộ/cập nhật thông tin theo vật dụng được đánh dấu yêu thích gần đây nhất (nếu có), hoặc giữ nguyên bản mẫu chứ không xóa vĩnh viễn.

#### Request

- **Path Parameters:**
  - `groupId` (UUID, Required): Mã định danh của nhóm.
  - `equipmentId` (UUID, Required): Mã định danh của vật dụng vật lý cụ thể cần chuyển đổi.
- **Headers:**
  ```http
  Authorization: Bearer <your_jwt_token>
  Content-Type: application/json
  ```
- **Body Payload (`UpdateFavoriteStatusDto`):**
  | Trường | Kiểu dữ liệu | Bắt buộc | Ví dụ | Mô tả |
  | :--- | :--- | :--- | :--- | :--- |
  | `isFavorite` | Boolean | Có | `true` | Trạng thái yêu thích muốn thiết lập cho vật dụng. |

  _Ví dụ Request Body:_

  ```json
  {
    "isFavorite": true
  }
  ```

#### Response (Thành công - 200 OK)

```json
{
  "message": "Favorite status updated successfully",
  "data": {
    "id": "e3a8f9c1-5b4e-4f3d-8c9a-b2e1d7c3a9f0",
    "groupId": "3d50fb2e-6444-42f2-bd55-520e7d56e7cc",
    "name": "Bóng Dura 40+",
    "description": "Hộp 12 quả tập luyện",
    "quantity": 12,
    "condition": "NEW",
    "purchaseCost": 180000,
    "purchasedAt": "2026-06-20T00:00:00.000Z",
    "expenseId": "c4d0fb2e-3444-42f2-bd55-520e7d56e7aa",
    "createdById": "aaaaaaaa-1111-2222-3333-444444444444",
    "isFavorite": true,
    "deletedAt": null,
    "createdAt": "2026-06-20T10:30:00.000Z",
    "updatedAt": "2026-07-02T06:55:00.000Z"
  }
}
```

#### Response (Thất bại)

- **403 Forbidden** (Người gọi không phải chủ nhóm):
  ```json
  {
    "statusCode": 403,
    "message": {
      "code": "GROUP_NOT_OWNER",
      "message": "Only the group owner can perform this action."
    },
    "error": "Forbidden"
  }
  ```
- **404 Not Found** (Không tìm thấy vật dụng vật lý tương ứng):
  ```json
  {
    "statusCode": 404,
    "message": {
      "code": "EQUIPMENT_NOT_FOUND",
      "message": "Equipment item not found or has been deleted."
    },
    "error": "Not Found"
  }
  ```
