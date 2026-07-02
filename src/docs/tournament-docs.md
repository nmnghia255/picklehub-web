# Dịch vụ Giải đấu PickleHub: Tài liệu Đặc tả Hệ thống Toàn diện

Tài liệu này cung cấp mô tả chi tiết, toàn diện về luồng hoạt động từ đầu đến cuối (end-to-end) của Dịch vụ Giải đấu (Tournament Service) trong hệ thống PickleHub. Tài liệu bao gồm kiến trúc hệ thống, các trạng thái giải đấu, luồng công việc, thuật toán toán học, giao thức WebSocket và danh sách các API REST.

---

## 1. Kiến trúc Hệ thống & Các Thực thể Cốt lõi

Dịch vụ Giải đấu (`tournament-service`) hoạt động và phối hợp nhịp nhàng với hai dịch vụ khác là `match-service` (quản lý trận đấu và Live Score) và `sport-center-service` (quản lý đặt sân bóng).

Dịch vụ Giải đấu gửi thông tin đồng bộ trận đấu và nhận phản hồi kết quả từ Dịch vụ Trận đấu bằng REST API. Đồng thời, đồng bộ thông tin đặt sân thực tế từ Dịch vụ Sân bóng bằng REST API đặt sân Mirror. Dịch vụ Trận đấu giao tiếp với các Trọng tài và thiết bị khách hàng qua kết nối WebSocket thời gian thực.

### Các Thực thể Cốt lõi & Mô hình Dữ liệu
* **Tournament (Giải đấu)**: Thực thể cha lớn nhất (ví dụ: PickleHub Master Cup 2026). Trạng thái giải đấu gồm `draft`, `published`, `open_registration`, `closed_registration`, `in_progress`, `completed`.
* **TournamentEvent (Nội dung thi đấu)**: Các nội dung trong một giải đấu (ví dụ: Đơn nam 4.0, Đôi nam nữ). Theo dõi số lượng bảng (`numGroups`), số đội đi tiếp (`advancePerGroup`), và trạng thái nhánh đấu `bracketStatus` (`unlocked`/`locked`).
* **Seed (Hạt giống)**: Danh sách các VĐV/đội đã đăng ký tham gia, được sắp xếp theo trình độ hoặc điểm DUPR. Có thể sinh tự động, điều chỉnh thủ công và khóa lại.
* **GroupStageGroup (Bảng đấu)**: Các bảng được tạo ra trong quá trình chia bảng vòng bảng (ví dụ: Bảng A, Bảng B).
* **Match (Trận đấu/Lịch đấu)**: Các trận đấu cụ thể. Lưu thông tin bối cảnh giải đấu, trạng thái cục bộ (`pending`, `scheduled`, `live`, `completed`, `walkover`) và liên kết đến UUID trận đấu tương ứng ở `match-service`.
* **TournamentBooking (Thông tin Đặt sân)**: Bảng dữ liệu đồng bộ (mirror) thông tin đặt sân thực tế từ `sport-center-service`. Lưu thông tin về các slot sân và khung giờ trống để xếp lịch.
* **TournamentReferee (Trọng tài giải đấu)**: Danh sách các trọng tài đã đăng ký tham gia vận hành giải đấu, được cấp quyền ghi điểm cho các trận đấu.
* **Sponsor (Nhà tài trợ)**: Thông tin các nhà tài trợ cho giải đấu (tên, logo, website, số tiền tài trợ).
* **Prize (Giải thưởng)**: Cơ cấu giải thưởng cho nội dung thi đấu hoặc toàn giải (tên giải, loại phần thưởng là tiền mặt/cúp/huy chương/quà, giá trị giải thưởng, và đội thắng cuộc được nhận giải).
* **FinancialTransaction (Giao dịch tài chính)**: Nhật ký ghi nhận các khoản thu, chi và hoàn tiền của giải đấu để tính toán lợi nhuận và đồng bộ trạng thái thanh toán của người tham gia.

---

## 2. Luồng Hoạt động Toàn diện của Giải đấu

Vòng đời của một nội dung thi đấu trong giải đấu trải qua 6 giai đoạn chính: Đăng ký VĐV $\rightarrow$ Phân hạt giống $\rightarrow$ Chia bảng & Đấu vòng bảng $\rightarrow$ Tiến cấp hạt giống $\rightarrow$ Sinh nhánh loại trực tiếp (Knockout) $\rightarrow$ Đấu vòng loại trực tiếp và Chung kết $\rightarrow$ Hoàn tất nội dung.

---

### Giai đoạn 1: Khởi tạo & Đăng ký
1. **Khởi tạo**: Ban tổ chức (BTC) tạo giải đấu và thiết lập một hoặc nhiều **Nội dung thi đấu** (Event Categories).
2. **Quy trình Trạng thái Giải đấu**:
   * `draft`: Giải đấu đang thiết lập ban đầu.
   * `published`: Giải đấu được công khai trên hệ thống.
   * `open_registration`: Mở cổng đăng ký cho các VĐV tham gia.
   * `closed_registration`: Đóng cổng đăng ký, khóa danh sách VĐV tham gia.
3. **Đăng ký danh sách Trọng tài**: Song song với quá trình đăng ký của VĐV, BTC thực hiện ghi danh (enroll) danh sách các trọng tài sẽ điều hành giải đấu (`POST /referees`). Việc này giúp chuẩn bị sẵn sàng danh sách nhân sự để phân bổ cho các trận đấu sau khi xếp lịch.

---

### Giai đoạn 2: Phân hạt giống & Khóa hạt giống
1. **Sinh hạt giống**: Sau khi đóng đăng ký, hệ thống lấy danh sách đội tham gia và tự động sắp xếp theo điểm trình độ trung bình của VĐV để tạo ra **Danh sách Hạt giống** (Seed List).
2. **Xem và Điều chỉnh**: BTC có quyền tráo đổi vị trí hạt giống hoặc thay đổi thông tin thủ công.
3. **Khóa hạt giống**: Gọi API khóa hạt giống (`POST /events/:eventId/seeds/lock`). Việc này là bắt buộc để có thể bắt đầu chia bảng đấu vòng bảng hoặc sinh nhánh đấu.

---

### Giai đoạn 3: Giai đoạn Vòng bảng (Bắt buộc)
Vòng bảng là giai đoạn bắt buộc đối với tất cả các nội dung thi đấu trong hệ thống.

#### 1. Cấu hình Vòng bảng
BTC cấu hình các thông số vòng bảng và quy định rõ số lượng đội tiến cấp ngay từ khâu này bao gồm:
* `numGroups`: Số lượng bảng đấu muốn chia.
* `advancePerGroup`: Số lượng đội đứng đầu mỗi bảng được đi tiếp vào vòng Knockout.
* **Quy định số lượng đội đi tiếp**: Tổng số lượng đội tiến cấp vào vòng loại trực tiếp được xác định rõ là $\text{numGroups} \times \text{advancePerGroup}$. Con số này được dùng để tính toán kích thước nhánh đấu loại trực tiếp (`bracketSize`) và dự đoán tổng số trận đấu (`totalMatches`) của sự kiện ngay từ lúc này.
* `advanceMethod`: Phương thức tính chỉ số phụ để xếp hạng bảng đấu (mặc định là `'standard'`).
* **Ràng buộc thay đổi**: **Không cho phép cấu hình lại** (chỉnh sửa thông số bảng đấu) sau khi đã thực hiện bốc thăm chia bảng.

#### 2. Thuật toán chia bảng đấu (World Cup ELO-based Potting)
Nhằm đảm bảo tính công bằng và cân bằng giữa các bảng đấu:
1. **Chia nhóm hạt giống (Pots)**: VĐV được chia vào các nhóm "Pots" dựa trên thứ hạng hạt giống (Ví dụ: nếu chia 4 bảng, Nhóm 1 có hạt giống 1-4, Nhóm 2 có hạt giống 5-8, v.v.).
2. **Bốc thăm**: Rút ngẫu nhiên một đội từ mỗi Pot vào mỗi bảng đấu.
3. **Giới hạn số lần bốc thăm**: BTC chỉ được bốc thăm chia bảng **1 lần duy nhất**. Sau khi sơ đồ bảng đấu được thiết lập trong hệ thống, chức năng bốc thăm sẽ bị khóa để đảm bảo tính minh bạch, khách quan của giải đấu.

#### 3. Sinh trận đấu vòng bảng (Thi đấu vòng tròn)
Trong mỗi bảng đấu, các đội sẽ thi đấu vòng tròn một lượt với nhau.
* **Công thức tính số trận đấu**:
  Với bảng đấu có $N$ đội, số trận thi đấu vòng tròn là $\frac{N \times (N-1)}{2}$.
  Nếu tổng số đội không chia đều cho số bảng, các đội thừa sẽ được phân bổ đều vào các bảng lớn hơn.
  * *Ví dụ*: 10 đội chia vào 3 bảng sẽ có 1 bảng 4 đội (6 trận) và 2 bảng 3 đội (3 trận/bảng), tổng cộng có $6 + 3 + 3 = 12$ trận đấu vòng bảng.

#### 4. Tự động xếp lịch (Auto-Scheduling vòng bảng)
Hệ thống tự động phân bổ trận đấu vào các slot sân đấu đã được xác nhận thanh toán:
1. **Đồng bộ đặt sân**: Gọi kiểm tra trạng thái từ `sport-center-service`. Chỉ sử dụng các slot sân có trạng thái `statusMirror === 'CONFIRMED'`.
2. **Lọc slot khả dụng**: Kiểm tra từng slot sân so với:
   * **Khung giờ thiết lập**: Giờ bắt đầu và kết thúc đặt sân phải nằm gọn trong giờ cấu hình giải đấu (`startTime` và `endTime`).
   * **Thời lượng trận đấu**: Slot đặt sân phải dài hơn hoặc bằng thời lượng một trận đấu dự kiến (`matchDurationMinutes`).
3. **Kiểm tra xung đột**: Đảm bảo không có VĐV nào bị xếp 2 trận đấu cùng giờ và có đủ thời gian nghỉ ngơi tối thiểu giữa các trận (`minBreakBetweenMatchesMinutes`).
4. **Phân bổ**: Phân bổ trận đấu vào các sân theo chiến lược `balanced` (chia đều sân) hoặc `sequential` (xếp tuần tự).

#### 5. Phân bổ trọng tài Vòng bảng
Sau khi lịch đấu vòng bảng đã được sắp xếp lên sân, BTC tiến hành gán trọng tài phụ trách điều hành cho từng trận đấu (sử dụng API gán đơn lẻ `POST /matches/:matchId/assign` hoặc API gán hàng loạt `POST /referees/bulk-assign`). Bước này phải hoàn thành trước khi phát trận đấu (Dispatch) sang `match-service`.

---

### Giai đoạn 4: Thi đấu, Live Score & Giải phóng Sân

#### 1. Phát trận đấu (Dispatch)
BTC tiến hành "phát" (dispatch) các trận đấu đã xếp lịch sang `match-service`. Quá trình này sẽ sinh ra mã UUID trận đấu thực tế và gán **trọng tài phụ trách** (`refereeId`) cho trận đấu đó.

#### 2. Ghi điểm trực tuyến (Live Score qua WebSockets)
Ghi điểm thời gian thực được thực hiện bởi trọng tài qua cổng Websocket:
1. **Kết nối**: Trọng tài kết nối đến địa chỉ Websocket Gateway `ws://match-service/matches` bằng JWT token.
2. **Vào phòng trận đấu**: Gửi sự kiện `join-match` kèm `{ matchId: string }`.
3. **Cộng điểm**: Trọng tài gửi sự kiện `score-point` kèm `{ matchId, setId, scoringTeam: 'TEAM_A' | 'TEAM_B' }`.
   * *Luật Best-of-3*: Một set đấu thắng khi đạt 11 điểm (và cách biệt tối thiểu 2 điểm). Trận đấu kết thúc khi một đội thắng trước 2 set.
4. **Phát trực tiếp**: Mỗi điểm số ghi được sẽ được broadcast cho tất cả mọi người trong phòng qua sự kiện `match-event` để xem trực tiếp điểm số cập nhật.
5. **Đồng bộ tự động**: Khi có đội thắng set thứ 2, trận đấu đổi trạng thái thành `CONFIRMED` ở `match-service`, đồng thời tự động gọi HTTP Callback về `tournament-service` để cập nhật tỷ số chung cuộc và đổi trạng thái trận đấu thành `completed`. Người bắt đầu (trọng tài) gửi điểm qua WebSocket, khi trận đấu hoàn tất, match-service cập nhật trạng thái lên database và gọi API callback đồng bộ sang tournament-service đổi trạng thái thành completed.

#### 3. Giải phóng Sân đấu (Unlink Booking)
Do tài nguyên sân đấu có giới hạn, khi các trận đấu vòng bảng đã thi đấu xong, hệ thống cho phép **Hủy liên kết sân** (`DELETE /fixtures/:fixtureId/booking`). Việc này giải phóng các slot đặt sân trong cơ sở dữ liệu, cho phép tái sử dụng các slot sân này để xếp lịch cho vòng loại trực tiếp (Knockout).

---

### Giai đoạn 5: Vòng loại trực tiếp (Knockout Stage)

#### 1. Tiến cấp (`advance` API)
* **Quy định rõ từ đầu**: Số đội đi tiếp từ mỗi bảng (`advancePerGroup`) và tổng số đội tiến cấp đã được BTC cấu hình và chốt rõ ràng ngay từ **Giai đoạn 3 (Cấu hình Vòng bảng)**.
* **Thời điểm gọi API**: Khi tất cả các trận đấu vòng bảng đã kết thúc, BTC gọi API `advance` (`POST /events/:eventId/group-stage/advance`) để đóng vòng bảng và kích hoạt quá trình tiến cấp. Đây là một bước chốt chặn (gate-keeping) bắt buộc để hệ thống xác thực tính hoàn tất của các trận đấu trước khi cho phép sinh nhánh Knockout.
* **Cơ chế hoạt động**:
  * **Xếp hạng bảng đấu**: Hệ thống tự động tính điểm và phân hạng các đội trong mỗi bảng đấu dựa trên: (1) Tỷ lệ thắng trận, (2) Kết quả đối đầu trực tiếp, (3) Hiệu số điểm thắng/thua.
  * **Tiến cấp tự động**: Hệ thống tự động chọn ra số lượng đội đứng đầu mỗi bảng tương ứng với `advancePerGroup` để đưa vào vòng Knockout. Tổng số đội tiến cấp mặc định tuân thủ chính xác công thức $\text{numGroups} \times \text{advancePerGroup}$ đã quy định từ khâu cấu hình.
  * **Hỗ trợ tráo đổi/điều chỉnh (Tùy chọn)**: Trong một số trường hợp đặc biệt (ví dụ: chẵn nhánh đấu loại trực tiếp tránh lượt miễn đấu BYEs), BTC có thể sử dụng tham số `totalAdvance` để bù đắp thêm các đội hạng 3 có thành tích tốt nhất toàn giải ("lucky losers"), tuy nhiên khuyến khích nên đồng bộ cấu hình này từ trước để đảm bảo tính nhất quán của số trận dự kiến.

#### 2. Sơ đồ nhánh đấu Knockout & Lượt Miễn đấu (BYEs)
Hệ thống đọc danh sách hạt giống đã tiến cấp để sinh ra cây sơ đồ thi đấu loại trực tiếp:
1. **Làm tròn nhánh đấu**: Tự động làm tròn số lượng đội lên lũy thừa của 2 gần nhất (ví dụ: 6 đội sẽ được xếp vào nhánh đấu 8 - vòng Tứ kết).
2. **Miễn đấu (BYEs)**: Khi số đội tiến cấp không là lũy thừa của 2 (ví dụ: 6 đội trên nhánh 8), phần dư sẽ là các lượt miễn đấu. Các lượt BYE này **luôn được phân bổ cho các đội có thành tích tốt nhất** (các hạt giống hàng đầu: Seed 1, Seed 2, ...) theo thứ tự ưu tiên xếp hạng:
   - **Điểm số tích lũy vòng bảng** (Points) — Giảm dần
   - **Hiệu số game/set** (GameDiff) — Giảm dần
   - **Thứ hạng hạt giống gốc** (Original Seed) — Tăng dần (hạt giống nhỏ hơn = tốt hơn)

   Trận miễn đấu được tự động tính là **Thắng cuộc trực tiếp (`walkover`)**, đưa thẳng các đội này vào vòng tiếp theo mà không cần thi đấu. Quy tắc này đảm bảo tính công bằng: đội xuất sắc nhất vòng bảng được thưởng đặc cách vào sâu hơn trong nhánh đấu.
3. **Ràng buộc tránh tái đấu (Rematch avoidance)**: Tránh các đội cùng bảng vòng bảng gặp nhau ngay từ vòng loại trực tiếp đầu tiên.

#### 3. Xếp lịch & Tự động Tiến trình Knockout
BTC chạy Auto-Schedule lần 2 để xếp sân và giờ thi đấu cho toàn bộ các trận Knockout (bao gồm cả các trận chờ kết quả như Tứ kết, Bán kết, Chung kết). Khi các trận đấu vòng trước kết thúc, tên người thắng sẽ được tự động đẩy vào các trận đấu vòng sau đã được xếp giờ/sân sẵn.

#### 4. Phân bổ trọng tài Vòng Knockout
Sau khi lịch thi đấu và sân đấu cho các trận Knockout (kể cả các trận chưa rõ đối thủ) đã được xác lập, BTC thực hiện gán trọng tài cho các trận đấu này. Trọng tài đã phân bổ sẽ nhận quyền điều hành phòng đấu WebSocket ngay khi đối thủ của trận đấu được xác định từ kết quả của các vòng trước đó.

---

### Giai đoạn 6: Hoàn tất Giải đấu
Khi trận Chung kết kết thúc và có kết quả cuối cùng, BTC gọi API cập nhật trạng thái giải đấu `PATCH /status` with `status: 'completed'` để chính thức đóng giải đấu.

---

## 3. Danh sách các API REST Cốt lõi

### Chuẩn phân trang (Pagination Schema)

Tất cả các API trả về danh sách đều sử dụng **Offset-based Pagination** (phân trang truyền thống theo số trang). Query parameters và response format thống nhất như sau:

**Query parameters:**
- `page` (số nguyên, mặc định `1`): Số trang hiện tại.
- `limit` (số nguyên, mặc định `10`): Số bản ghi tối đa trên mỗi trang.

**Response format:**
```json
{
  "data": [ /* mảng dữ liệu */ ],
  "meta": {
    "total": 42,
    "page": 2,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Hướng dẫn Frontend:**
- Dùng `meta.totalPages` và `meta.page` để dựng UI phân trang kiểu **nút số trang** (ví dụ: 1 2 3 … 5).
- Để triển khai **Infinite Scroll**, lấy thêm dữ liệu khi người dùng cuộn xuống cuối bằng cách tăng `page` lên 1 và nối thêm vào danh sách hiện tại; dừng khi `page >= meta.totalPages`.
- Gợi ý giá trị `limit` thường dùng: `10` (bảng), `20` (danh sách thẻ), `50` (dropdown chọn nhanh).

---

### Danh sách API

| Phân hệ / Module | Phương thức | Đường dẫn API | Mô tả tính năng |
| :--- | :--- | :--- | :--- |
| **Giải đấu** | `POST` | `/api/tournaments` | Tạo giải đấu mới (mặc định trạng thái `draft`) |
| **Giải đấu** | `GET` | `/api/tournaments` | Lấy danh sách giải đấu (hỗ trợ phân trang, lọc theo trạng thái/tìm kiếm) |
| **Giải đấu** | `GET` | `/api/tournaments/my-tournaments` | Lấy danh sách giải đấu của người dùng hiện tại (với tư cách BTC hoặc VĐV) |
| **Giải đấu** | `GET` | `/api/tournaments/discover` | Gợi ý giải đấu cá nhân hóa (độ tương thích DUPR, cự ly gần, câu lạc bộ yêu thích) |
| **Giải đấu** | `GET` | `/api/tournaments/:id` | Lấy thông tin chi tiết của giải đấu kèm các nội dung thi đấu |
| **Giải đấu** | `PUT` | `/api/tournaments/:id` | Cập nhật thông tin cơ bản giải đấu |
| **Giải đấu** | `PATCH` | `/api/tournaments/:id/status` | Cập nhật trạng thái vòng đời giải đấu (`published`, `in_progress`, v.v.) |
| **Giải đấu** | `DELETE` | `/api/tournaments/:id` | Xóa giải đấu (chỉ áp dụng khi ở trạng thái nháp/công bố) |
| **Giải đấu** | `GET` | `/api/tournaments/:id/audit-logs` | Xem nhật ký hoạt động thay đổi cấu hình giải đấu |
| **Giải đấu** | `GET` | `/api/tournaments/:id/share-link` | Lấy link chia sẻ giới thiệu giải đấu kèm mã UTM theo dõi |
| **Giải đấu** | `GET` | `/api/tournaments/:id/poster` | Sinh dynamic poster quảng bá giải đấu (trả về ảnh PNG hoặc Cloudinary redirect) |
| **Nội dung** | `POST` | `/api/:tournamentId/events` | Tạo mới nội dung thi đấu (ví dụ: Đôi nam nữ 4.0) |
| **Nội dung** | `GET` | `/api/:tournamentId/events` | Danh sách các nội dung thi đấu thuộc giải đấu |
| **Nội dung** | `GET` | `/api/:tournamentId/events/:eventId` | Chi tiết nội dung thi đấu |
| **Nội dung** | `PUT` | `/api/:tournamentId/events/:eventId` | Cập nhật cấu hình nội dung (giới hạn sức chứa, lệ phí...) |
| **Nội dung** | `DELETE` | `/api/:tournamentId/events/:eventId` | Xóa nội dung thi đấu (chỉ khi chưa có ai đăng ký) |
| **Đăng ký** | `POST` | `/api/:tournamentId/events/:eventId/registrations` | Đăng ký tham gia nội dung (kiểm tra luật giới tính, sức chứa giới tính Mixed) |
| **Đăng ký** | `GET` | `/api/:tournamentId/registrations` | Xem danh sách đăng ký giải đấu (lọc theo nội dung, trạng thái phê duyệt) |
| **Đăng ký** | `GET` | `/api/:tournamentId/registrations/:id` | Chi tiết một bản ghi đăng ký |
| **Đăng ký** | `PATCH` | `/api/:tournamentId/registrations/:id/status` | Duyệt/từ chối đăng ký (Duyệt thành công tự tạo đội `Team`) |
| **Đăng ký** | `POST` | `/api/:tournamentId/registrations/:id/pay` | VĐV thông báo đã chuyển khoản lệ phí và tải ảnh minh chứng |
| **Đăng ký** | `PATCH` | `/api/:tournamentId/registrations/:id/payment` | BTC xác nhận trạng thái thanh toán thủ công |
| **Đăng ký** | `DELETE` | `/api/:tournamentId/registrations/:id` | Hủy/xóa bản đăng ký |
| **Điểm danh** | `POST` | `/api/:tournamentId/registrations/:registrationId/check-in` | Điểm danh VĐV có mặt trực tiếp tại sân đấu |
| **Điểm danh** | `GET` | `/api/:tournamentId/check-ins` | Xem danh sách VĐV đã điểm danh thành công |
| **Đội tuyển** | `GET` | `/api/:tournamentId/events/:eventId/teams` | Xem danh sách các đội thi đấu đã được duyệt và lập đội thành công |
| **Địa điểm** | `GET` | `/api/:tournamentId/centers` | Xem danh sách các cụm sân bóng được chọn tổ chức giải đấu |
| **Địa điểm** | `POST` | `/api/:tournamentId/centers` | Liên kết cụm sân bóng (Sport Center) mới vào giải đấu |
| **Địa điểm** | `DELETE` | `/api/:tournamentId/centers/:centerId` | Gỡ liên kết cụm sân bóng (chỉ khi không có lịch đặt/trận đấu nào dùng cụm sân này) |
| **Sân bãi** | `GET` | `/api/:tournamentId/courts/availability` | Truy vấn kiểm tra lịch trống và giá của các sân bóng thuộc cụm sân |
| **Đặt sân** | `POST` | `/api/:tournamentId/bookings` | Tiến hành đặt sân hàng loạt hoặc đơn lẻ trên cụm sân đối tác |
| **Đặt sân** | `GET` | `/api/:tournamentId/bookings` | Danh sách lịch đặt sân kèm trạng thái và thông tin chi tiết từng slot |
| **Đặt sân** | `GET` | `/api/:tournamentId/bookings/items` | Danh sách các slot sân đã đặt thành công kèm thông tin gán trận đấu |
| **Đặt sân** | `POST` | `/api/:tournamentId/bookings/sync` | Đồng bộ trạng thái đặt sân thực tế từ `sport-center-service` |
| **Đặt sân** | `DELETE` | `/api/:tournamentId/bookings/:bookingId` | Hủy lịch đặt sân và gỡ liên kết tự động khỏi các trận đấu |
| **Hạt giống** | `POST` | `/api/:tournamentId/events/:eventId/seeds/generate` | Tự động sinh danh sách hạt giống dựa theo điểm DUPR/Rating |
| **Hạt giống** | `POST` | `/api/:tournamentId/events/:eventId/seeds/lock` | Khóa danh sách hạt giống để chuẩn bị bốc thăm chia bảng |
| **Vòng bảng** | `POST` | `/api/:tournamentId/events/:eventId/group-stage/configure` | Thiết lập thông số vòng bảng (số bảng, số đội đi tiếp, luật chỉ số phụ) |
| **Vòng bảng** | `POST` | `/api/:tournamentId/events/:eventId/group-stage/draw` | Bốc thăm chia nhóm hạt giống (Pots) vào bảng đấu |
| **Vòng bảng** | `POST` | `/api/:tournamentId/events/:eventId/group-stage/generate-matches` | Tự động sinh các trận đấu vòng tròn một lượt cho các bảng |
| **Xếp lịch** | `POST` | `/api/:tournamentId/events/:eventId/auto-schedule/preview` | Chạy thử thuật toán xếp lịch để ước tính thời gian kết thúc giải đấu |
| **Xếp lịch** | `POST` | `/api/:tournamentId/events/:eventId/auto-schedule` | Khởi chạy xếp lịch thi đấu tự động (sân bãi, khung giờ, nghỉ giữa các trận) |
| **Xếp lịch** | `GET` | `/api/:tournamentId/schedule` | Lấy danh sách lịch thi đấu (hỗ trợ lọc theo sân, ngày, nội dung) |
| **Xếp lịch** | `PATCH` | `/api/:tournamentId/fixtures/:fixtureId/schedule` | Gán thủ công một trận đấu vào slot sân đã đặt |
| **Xếp lịch** | `DELETE` | `/api/:tournamentId/fixtures/:fixtureId/booking` | Gỡ liên kết sân đấu của trận đấu để thu hồi slot sân trống |
| **Thi đấu** | `POST` | `/api/:tournamentId/fixtures/dispatch` | Phát hành các trận đấu sang `match-service` để bắt đầu mở WebSocket thi đấu |
| **Thi đấu** | `POST` | `/api/:tournamentId/fixtures/:fixtureId/result` | Nhập kết quả trận đấu thủ công (ghi đè Live Score nếu cần) |
| **Tiến cấp** | `POST` | `/api/:tournamentId/events/:eventId/group-stage/advance` | Tính kết quả bảng đấu và tiến cấp các đội đứng đầu vào Knockout |
| **Nhánh đấu** | `POST` | `/api/:tournamentId/events/:eventId/bracket/generate` | Sinh cây sơ đồ thi đấu Knockout (hỗ trợ tự động chia lượt BYE) |
| **Nhánh đấu** | `POST` | `/api/:tournamentId/events/:eventId/bracket/lock` | Khóa nhánh đấu Knockout để bắt đầu thi đấu vòng loại |
| **Nhánh đấu** | `GET` | `/api/:tournamentId/events/:eventId/matches` | Xem danh sách trận đấu sơ đồ cây |
| **Bảng xếp hạng**| `GET` | `/api/:tournamentId/events/:eventId/standings` | Xem bảng xếp hạng chung cuộc nội dung (Vô địch, Á quan, số trận thắng/thua...) |
| **Tài trợ** | `POST` | `/api/:tournamentId/sponsors` | Thêm nhà tài trợ mới và tự động ghi nhận doanh thu |
| **Tài trợ** | `GET` | `/api/:tournamentId/sponsors` | Lấy danh sách tất cả nhà tài trợ của giải đấu |
| **Tài trợ** | `PUT` | `/api/:tournamentId/sponsors/:id` | Cập nhật thông tin nhà tài trợ và cập nhật giao dịch doanh thu |
| **Tài trợ** | `DELETE` | `/api/:tournamentId/sponsors/:id` | Xóa nhà tài trợ và hủy giao dịch doanh thu tương ứng |
| **Tài chính** | `POST` | `/api/:tournamentId/transactions` | Ghi nhận giao dịch tài chính thủ công (thu, chi, hoàn tiền) |
| **Tài chính** | `GET` | `/api/:tournamentId/transactions` | Lấy danh sách tất cả giao dịch tài chính |
| **Tài chính** | `PATCH` | `/api/:tournamentId/transactions/:id/status` | Xác nhận giao dịch và tự động đồng bộ trạng thái đăng ký của VĐV |
| **Tài chính** | `GET` | `/api/:tournamentId/finance/report` | Lấy báo cáo doanh thu, chi phí, hoàn tiền và lợi nhuận ròng |
| **Tài chính** | `GET` | `/api/:tournamentId/finance/report/export` | Xuất file báo cáo tài chính trực quan ra định dạng Excel hoặc PDF |
| **Giải thưởng** | `POST` | `/api/:tournamentId/prizes` | Tạo cơ cấu giải thưởng mới cho giải đấu/nội dung |
| **Giải thưởng** | `GET` | `/api/:tournamentId/prizes` | Lấy danh sách giải thưởng của giải đấu (có thể lọc theo Event) |
| **Giải thưởng** | `POST` | `/api/:tournamentId/prizes/:id/award` | Trao giải cho đội thắng cuộc và ghi nhận chi phí nếu là tiền mặt |
| **Giải thưởng** | `DELETE` | `/api/:tournamentId/prizes/:id` | Xóa giải thưởng và tự động xóa giao dịch chi phí liên quan |
| **Trọng tài** | `POST` | `/api/:tournamentId/referees` | Đăng ký tài khoản trọng tài vào danh sách giải đấu |
| **Trọng tài** | `DELETE` | `/api/:tournamentId/referees/:refereeId` | Hủy đăng ký trọng tài khỏi giải đấu |
| **Trọng tài** | `GET` | `/api/:tournamentId/referees` | Danh sách trọng tài giải đấu kèm số lượng trận được gán |
| **Trọng tài** | `POST` | `/api/:tournamentId/matches/:matchId/assign` | Gán trọng tài điều hành và cấp quyền ghi điểm qua WebSocket |
| **Trọng tài** | `POST` | `/api/:tournamentId/referees/bulk-assign` | Phân bổ hàng loạt trọng tài cho nhiều trận đấu cùng lúc |
| **Trọng tài** | `DELETE` | `/api/:tournamentId/matches/:matchId/unassign` | Hủy gán trọng tài và thu hồi quyền ghi điểm |
| **Trọng tài** | `GET` | `/api/:tournamentId/referees/assignments` | Danh sách lịch phân bổ trọng tài cho các trận đấu |
| **Trọng tài** | `GET` | `/api/:tournamentId/referees/my-assignments` | Lấy danh sách trận đấu được gán của trọng tài đang đăng nhập |
| **Giao tiếp nội bộ**| `POST` | `/api/internal/query-by-player` | [Nội bộ] Truy vấn các giải đấu và trận đấu của một VĐV theo mốc ngày |
| **Giao tiếp nội bộ**| `POST` | `/api/internal/fixtures/sync-by-uuid` | [Nội bộ] Trigger đồng bộ kết quả từ Match Service và tự động tiến cấp |

---

## 4. Giao thức WebSocket Live Score

Thiết bị trọng tài thực hiện kết nối với namespace `/matches` tại cổng chạy `match-service`.

### 1. Vào phòng trận đấu (`join-match`)
Được gửi từ client trọng tài hoặc client người xem để đăng ký nhận thông tin điểm số trận đấu theo thời gian thực.
```json
// Sự kiện: 'join-match'
{
  "matchId": "uuid-tran-dau-o-day"
}
```

### 2. Trọng tài cộng điểm (`score-point`)
Được gửi từ thiết bị trọng tài để ghi nhận điểm số. Yêu cầu xác thực qua WebSocket Auth Guard.
```json
// Sự kiện: 'score-point'
{
  "matchId": "uuid-tran-dau-o-day",
  "setId": 1,
  "scoringTeam": "TEAM_A" // Nhận giá trị 'TEAM_A' hoặc 'TEAM_B'
}
```

### 3. Trọng tài hoàn tác điểm (`undo-point`) ✅ Đã triển khai
Khi trọng tài bấm nhầm điểm, gửi sự kiện `undo-point` để **xóa điểm cuối cùng đã ghi**. Yêu cầu xác thực qua WebSocket Auth Guard (chỉ trọng tài được gán cho trận mới có quyền).
```json
// Sự kiện gửi lên từ trọng tài: 'undo-point'
{
  "matchId": "uuid-tran-dau-o-day"
}
```
Server phản hồi bằng cách broadcast `match-event` với `event: "point-undone"` tới toàn bộ phòng:
```json
// Sự kiện server broadcast: 'match-event'
{
  "event": "point-undone",
  "matchId": "uuid-tran-dau-o-day",
  "score": {
    "scoreA": 0,
    "scoreB": 0,
    "sets": [[0, 0]],
    "currentSetId": 1,
    "server": null
  },
  "lastAction": {
    "type": "undo",
    "timestamp": "2026-07-01T04:30:00.000Z"
  },
  "status": "LIVE"
}
```
**Giới hạn hoàn tác**: Chỉ hoàn tác được **1 điểm gần nhất** (không hỗ trợ undo nhiều lần liên tiếp). Frontend nên vô hiệu hóa nút Undo nếu không còn điểm nào để hoàn tác (điểm = 0 ở cả hai đội trong set hiện tại).

### 4. Server phát điểm trực tiếp (`match-event`)
Được phát đi từ server cho tất cả các thiết bị kết nối vào phòng trận đấu để cập nhật điểm lên giao diện người xem.
```json
// Sự kiện: 'match-event'
{
  "event": "point-scored", // Hoặc "match-completed" khi kết thúc trận
  "matchId": "uuid-tran-dau-o-day",
  "score": {
    "scoreA": 1,
    "scoreB": 0,
    "sets": [[1, 0]],
    "currentSetId": 1,
    "server": "TEAM_A"
  },
  "status": "LIVE" // Hoặc "CONFIRMED" khi kết thúc trận
}
```

**Tổng hợp các giá trị `event` trong `match-event`:**

| Giá trị `event` | Khi nào xảy ra | Frontend nên làm gì |
|---|---|---|
| `point-scored` | Sau mỗi lần cộng điểm thành công | Cập nhật bảng điểm |
| `point-undone` | Sau khi hoàn tác điểm thành công | Cập nhật lại bảng điểm |
| `match-completed` | Khi trận đấu kết thúc | Hiển thị kết quả cuối, khóa màn hình điểm |
| `state-sync` | Ngay sau khi kết nối lại (`join-match`) | Phục hồi toàn bộ trạng thái điểm lên UI |

---

## 5. Logic Dự toán Tổng số trận đấu (totalMatches)

API thông tin sự kiện cung cấp thuộc tính `totalMatches` để dự toán số lượng trận đấu của toàn bộ sự kiện. Do Vòng bảng là bắt buộc, số trận này được tính toán động dựa trên lượng VĐV đăng ký thực tế và thiết lập bảng đấu như sau:

$$\text{groupMatches} = \sum_{g=1}^{\text{numGroups}} \frac{S_g \times (S_g - 1)}{2}$$
$$\text{bracketSize} = \text{nextPow2}(\text{numGroups} \times \text{advancePerGroup})$$
$$\text{knockoutMatches} = \text{bracketSize} - 1$$
$$\text{totalMatches} = \text{groupMatches} + \text{knockoutMatches}$$
*(Trong đó $S_g$ là số lượng đội thi đấu nằm trong bảng đấu thứ $g$).*

Nếu ban tổ chức chưa thực hiện cấu hình các tham số bảng đấu (ví dụ: `numGroups` hoặc `advancePerGroup` chưa được thiết lập), trường `totalMatches` sẽ trả về **`null`** để tránh hiển thị thông tin chưa đầy đủ.

---

## 6. Các Tính năng Mở rộng Hỗ trợ Giải đấu

### 1. Quản lý Tài trợ (Sponsors)
* **Quy trình hoạt động**: BTC có thể quản lý các nhà tài trợ cho giải đấu. Khi thêm nhà tài trợ mới hoặc cập nhật số tiền tài trợ (`amount`), hệ thống sẽ chạy một giao dịch database tự động để tạo/cập nhật một bản ghi giao dịch tài chính tương ứng dạng **Thu nhập (`income`)** ở trạng thái **Hoàn thành (`completed`)** trong bảng `FinancialTransaction`.
* **Ràng buộc an toàn**: Khi xóa một nhà tài trợ khỏi giải đấu, hệ thống tự động xóa tất cả các giao dịch doanh thu tài trợ liên quan để đảm bảo tính toàn vẹn dữ liệu tài chính.

### 2. Quản lý Thu Chi & Xuất báo cáo tài chính (Finance & Export)
* **Theo dõi dòng tiền**: Hệ thống cho phép ghi nhận các khoản thu (`income`), chi phí (`expense`) và hoàn tiền (`refund`).
* **Đồng bộ hóa tự động**: Khi BTC thay đổi trạng thái của giao dịch tài chính liên quan đến đăng ký của VĐV (định dạng phần mô tả chứa `"Reg ID: [id]"`), hệ thống tự động cập nhật trạng thái thanh toán (`paymentStatus`) của bản ghi đăng ký (`Registration`) tương ứng sang trạng thái của giao dịch đó (Ví dụ: ghi nhận đóng lệ phí hoàn tất $\rightarrow$ VĐV tự động được chuyển sang trạng thái đã thanh toán).
* **Báo cáo P&L (Doanh thu & Chi phí)**: Hệ thống tổng hợp trực tiếp lợi nhuận ròng dựa trên công thức:
  $$\text{Lợi nhuận ròng (Net Profit)} = \text{Tổng thu (Income)} - \text{Tổng chi (Expense)} - \text{Tổng hoàn tiền (Refund)}$$
* **Xuất báo cáo tài chính**: BTC có thể xuất file báo cáo tài chính chi tiết ra định dạng **Excel (.xlsx)** hoặc **PDF (.pdf)**. Các file xuất ra được định dạng trực quan, tô màu dòng tiêu đề, định dạng cột tiền tệ và kẻ bảng chuyên nghiệp.

### 3. Cơ cấu & Trao Giải thưởng (Prizes)
* **Thiết lập giải thưởng**: BTC thiết lập cơ cấu giải thưởng cho toàn giải hoặc từng nội dung (Event), phân chia theo loại phần thưởng (`cash` - tiền mặt, `trophy` - cúp, `medal` - huy chương, `gift` - quà tặng).
* **Trao giải và liên kết tài chính**: Khi giải đấu kết thúc, BTC tiến hành trao giải cho đội thắng cuộc (`winnerTeamId`). Nếu phần thưởng thuộc loại tiền mặt (`cash`), hệ thống tự động sinh một giao dịch giao dịch tài chính dạng **Chi phí (`expense`)** với số tiền tương ứng để ghi nhận vào dòng tiền chi của giải đấu. Nếu hủy trao giải, giao dịch chi này tự động bị thu hồi.

### 4. Phân bổ Trọng tài & Bảo mật Ghi điểm (Referee Allocation & Security)
* **Danh sách trọng tài**: BTC đăng ký tài khoản người dùng làm trọng tài giải đấu (`TournamentReferee`), theo dõi số lượng trận đấu được phân bổ cho từng trọng tài để chia đều khối lượng công việc.
* **Gán trận đấu**: BTC gán trọng tài điều khiển các trận đấu cụ thể (đơn lẻ hoặc gán hàng loạt). 
* **Bảo mật ghi điểm (WsAuthGuard)**: Khi trận đấu được phát hành, chỉ có tài khoản của trọng tài được gán cho trận đấu đó mới có quyền kết nối WebSocket và gửi tín hiệu ghi điểm (`score-point`) để cập nhật điểm số Live Score thời gian thực.

---

## 7. Đặc tả Giao diện Frontend (Frontend Integration Contract)

Phần này làm rõ các quy ước kỹ thuật giữa Backend và Frontend để đảm bảo tích hợp chính xác, tránh sai lệch logic giữa hai phía.

---

### 7.1 Cấu trúc dữ liệu Sơ đồ Nhánh đấu (Bracket Structure)

**API**: `GET /api/:tournamentId/events/:eventId/matches`

Backend trả về **Mảng phẳng (Flat Array)** các trận đấu, **không phải cây lồng nhau (Nested Tree)**. Mỗi trận đấu chứa thuộc tính `nextMatchId` để Frontend tự dựng cây kết nối.

```json
{
  "meta": { "total": 7 },
  "data": [
    {
      "matchId": 101,
      "round": "Quarterfinal",
      "bracketPosition": 0,
      "status": "walkover",
      "nextMatchId": 105,
      "team1": { "teamId": 1, "name": "Nguyen / Tran", "seed": 1, "rating": 4.8 },
      "team2": null,
      "winner": 1,
      "score": null
    },
    {
      "matchId": 102,
      "round": "Quarterfinal",
      "bracketPosition": 1,
      "status": "scheduled",
      "nextMatchId": 105,
      "team1": { "teamId": 3, "name": "Le / Pham", "seed": 3, "rating": 4.5 },
      "team2": { "teamId": 6, "name": "Hoang / Dao", "seed": 6, "rating": 4.2 },
      "winner": null,
      "score": null
    },
    {
      "matchId": 105,
      "round": "Semifinal",
      "bracketPosition": 0,
      "status": "pending",
      "nextMatchId": 107,
      "team1": { "teamId": 1, "name": "Nguyen / Tran", "seed": 1, "rating": 4.8 },
      "team2": null,
      "winner": null,
      "score": null
    }
  ]
}
```

**Quy ước liên kết:**
- `nextMatchId: null` → trận đấu Chung kết (trận cuối cùng, không có trận tiếp theo).
- `team2: null` → ô chờ (chưa có đối thủ xác định, hoặc đây là trận walkover BYE).
- Frontend dùng `nextMatchId` để nhóm các trận theo cặp và dựng cây nhánh đấu (phù hợp với thư viện như `react-tournament-bracket`, `brackets-viewer`, v.v.).
- `bracketPosition` là số thứ tự trận trong vòng đó (0-indexed), dùng để sắp xếp trận trên/dưới.

---

### 7.2 Phục hồi trạng thái WebSocket (State Recovery sau mất kết nối)

**Tình huống**: Thiết bị trọng tài mất mạng giữa trận và kết nối lại.

**Cơ chế hoạt động:**

Khi trọng tài gửi lại sự kiện `join-match` sau khi kết nối lại, server **ngay lập tức phát lại** `match-event` chứa toàn bộ trạng thái điểm số hiện tại (snapshot) về thiết bị đó:

```json
// Server phát ngay khi nhận join-match (snapshot phục hồi)
// Sự kiện: 'match-event'
{
  "event": "state-sync",
  "matchId": "uuid-tran-dau-o-day",
  "score": {
    "scoreA": 8,
    "scoreB": 6,
    "sets": [[11, 7], [8, 6]],
    "currentSetId": 2,
    "server": "TEAM_B"
  },
  "status": "LIVE"
}
```

**Frontend KHÔNG cần gọi thêm REST API riêng để đồng bộ điểm** sau khi kết nối lại — toàn bộ trạng thái được trả về qua `match-event` với `event: "state-sync"` ngay trong bước `join-match`.

> **Lưu ý triển khai**: Nếu trận đấu đã kết thúc (`status: "CONFIRMED"`) khi trọng tài kết nối lại, server sẽ phát `match-event` với `event: "match-completed"` để Frontend chuyển màn hình ra ngoài phòng đấu.

---

### 7.3 Định dạng Thời gian & Múi giờ (Timezone Contract)

**Chuẩn dữ liệu thời gian**: Tất cả thời gian trong hệ thống được lưu trữ và truyền tải theo **UTC ISO 8601**.

| Trường | Định dạng gửi lên (Request) | Định dạng nhận về (Response) |
|---|---|---|
| `startTime` (cấu hình giải đấu) | `"2026-07-01T01:00:00.000Z"` (UTC) | `"2026-07-01T01:00:00.000Z"` (UTC) |
| `endTime` (cấu hình giải đấu) | `"2026-07-01T15:00:00.000Z"` (UTC) | `"2026-07-01T15:00:00.000Z"` (UTC) |
| Giờ trận đấu (`scheduledTime`) | N/A (do Auto-Schedule tính) | `"2026-07-01T03:30:00.000Z"` (UTC) |

**Múi giờ địa phương (Timezone Display):**
- Thông tin múi giờ (`timezone`) của cụm sân (`Sport Center`) được lưu trong `sport-center-service` (ví dụ: `"Asia/Ho_Chi_Minh"`).
- API `GET /api/:tournamentId/centers` trả về `timezone` của từng cụm sân.
- **Frontend có trách nhiệm** chuyển đổi thời gian UTC sang giờ địa phương khi hiển thị lịch thi đấu cho VĐV (khuyến nghị dùng thư viện `date-fns-tz` hoặc `dayjs` với plugin `timezone`).
- **Ví dụ**: `"2026-07-01T01:00:00.000Z"` hiển thị thành `"08:00 ICT"` tại Việt Nam (`Asia/Ho_Chi_Minh`, UTC+7).

> **Lưu ý**: Frontend KHÔNG nên gửi chuỗi giờ thuần túy như `"08:00"` mà phải gửi UTC ISO 8601 đầy đủ để tránh sai lệch múi giờ giữa các máy chủ.

---

### 7.4 Cờ Trạng thái Hành động (Action Capability Flags)

API `GET /api/:tournamentId/events/:eventId` trả về trường `capabilities` là một object chứa các **cờ boolean** phản ánh hành động nào BTC được phép thực hiện tại thời điểm hiện tại. Frontend dùng các cờ này trực tiếp để bật/tắt các nút bấm (button) mà **không cần tự tính toán lại logic**.

```json
{
  "id": 10,
  "name": "Đôi nam nữ 4.0",
  "status": "in_progress",
  "bracketStatus": "unlocked",
  "seedsLocked": true,
  "groupStageDrawn": true,
  "totalAdvance": 8,
  "capabilities": {
    "canLockSeeds": false,
    "canConfigureGroupStage": false,
    "canDrawGroups": false,
    "canGenerateGroupMatches": true,
    "canAutoSchedule": true,
    "canDispatchMatches": true,
    "canAdvanceToKnockout": false,
    "canGenerateBracket": false,
    "canLockBracket": false
  }
}
```

**Bảng điều kiện các cờ:**

| Cờ | Điều kiện = `true` |
|---|---|
| `canLockSeeds` | Seeds tồn tại, chưa khóa, giải đấu `closed_registration` trở lên |
| `canConfigureGroupStage` | Seeds đã khóa, chưa bốc thăm (`groupStageDrawn = false`) |
| `canDrawGroups` | Đã cấu hình vòng bảng, seeds đã khóa, chưa bốc thăm |
| `canGenerateGroupMatches` | Đã bốc thăm, chưa có trận đấu vòng bảng nào |
| `canAutoSchedule` | Có trận đấu `pending`, có slot sân `CONFIRMED` |
| `canDispatchMatches` | Có trận đã gán sân + trọng tài, chưa phát |
| `canAdvanceToKnockout` | Tất cả trận vòng bảng đã `completed`/`walkover` |
| `canGenerateBracket` | Đã tiến cấp (`advance` đã chạy), bracket chưa tồn tại |
| `canLockBracket` | Bracket đã sinh và `bracketStatus = 'unlocked'` |

> **Nguyên tắc**: Backend là nguồn sự thật duy nhất (single source of truth) cho logic điều kiện. Frontend không tự tính lại điều kiện mà chỉ đọc `capabilities`.

---

### 7.5 Chuẩn Mã lỗi API (Error Code Schema)

Khi backend từ chối một hành động vi phạm ràng buộc nghiệp vụ, API trả về HTTP `400 Bad Request` với body JSON theo chuẩn sau:

```json
{
  "statusCode": 400,
  "errorCode": "DRAW_ALREADY_DONE",
  "message": "Group stage has already been drawn and cannot be redrawn.",
  "timestamp": "2026-07-01T11:30:00.000Z",
  "path": "/api/1/events/10/group-stage/draw"
}
```

**Danh sách mã lỗi nghiệp vụ (`errorCode`) và mô tả:**

| `errorCode` | HTTP | Ngữ cảnh xảy ra | Gợi ý hiển thị (i18n key) |
|---|---|---|---|
| `DRAW_ALREADY_DONE` | 400 | Bốc thăm lần 2 | `error.draw_already_done` |
| `CONFIG_LOCKED_AFTER_DRAW` | 400 | Cấu hình vòng bảng sau bốc thăm | `error.config_locked` |
| `SEEDS_NOT_LOCKED` | 400 | Bốc thăm khi seeds chưa khóa | `error.seeds_not_locked` |
| `BRACKET_ALREADY_LOCKED` | 400 | Sinh lại bracket đã khóa | `error.bracket_locked` |
| `MATCHES_INCOMPLETE` | 400 | Tiến cấp khi còn trận chưa xong | `error.matches_incomplete` |
| `BRACKET_STARTED` | 400 | Xóa/sửa bracket đã có trận đang chạy | `error.bracket_started` |
| `TOURNAMENT_STATUS_INVALID` | 400 | Thao tác không hợp lệ ở trạng thái giải đấu hiện tại | `error.invalid_status` |
| `INSUFFICIENT_CAPACITY` | 400 | Số đội vượt quá sức chứa nội dung | `error.capacity_exceeded` |
| `REFEREE_ALREADY_ASSIGNED` | 400 | Gán trọng tài đã được gán cho trận | `error.referee_assigned` |
| `EVENT_NOT_FOUND` | 404 | ID nội dung thi đấu không tồn tại | `error.event_not_found` |
| `UNAUTHORIZED_REFEREE` | 403 | Trọng tài không có quyền ghi điểm trận này | `error.unauthorized_referee` |

**Hướng dẫn i18n cho Frontend:**
- Sử dụng `errorCode` làm key tra cứu chuỗi thông báo đa ngôn ngữ (không dùng `message` vì đây là chuỗi tiếng Anh phục vụ debug).
- Nếu `errorCode` không có trong từ điển i18n, dùng chuỗi fallback chung: `"Đã xảy ra lỗi. Vui lòng thử lại."`.
- Hiển thị lỗi nghiệp vụ dưới dạng **Toast/Snackbar** (không dùng alert native của trình duyệt).

---

### 7.6 Trải nghiệm Mất kết nối (Offline UX & Connection State)

**Yêu cầu**: Khi thiết bị trọng tài mất kết nối WebSocket, Frontend **bắt buộc phải vô hiệu hóa (freeze) toàn bộ màn hình ghi điểm** ngay lập tức. Đây là yêu cầu bắt buộc nhằm ngăn tình huống trọng tài tiếp tục bấm điểm trong trạng thái offline (dữ liệu sẽ bị mất vì server không nhận được).

**Máy trạng thái kết nối (Connection State Machine):**

```
[CONNECTED] ──mất mạng──▶ [DISCONNECTED / FROZEN]
                                    │
                              Socket.IO tự kết nối lại
                                    │
                          ──join-match──▶ [SYNCING]
                                    │
                          ──state-sync received──▶ [CONNECTED]
```

**Hành vi Frontend theo từng trạng thái:**

| Trạng thái | Hiển thị UI | Nút ghi điểm | Nút Undo |
|---|---|---|---|
| `CONNECTED` | Bình thường | ✅ Bật | ✅ Bật (nếu có điểm) |
| `DISCONNECTED` | Banner "⚠️ Mất kết nối..." | ❌ Disabled | ❌ Disabled |
| `SYNCING` | Banner "🔄 Đang đồng bộ..." | ❌ Disabled | ❌ Disabled |
| `CONNECTED` (sau sync) | Banner biến mất, điểm số cập nhật | ✅ Bật | ✅ Bật |

**Hướng dẫn triển khai:**
- Lắng nghe sự kiện `disconnect` của Socket.IO để chuyển sang trạng thái `DISCONNECTED` ngay lập tức.
- Socket.IO sẽ tự động thử kết nối lại (`reconnect`). Khi sự kiện `connect` kích hoạt lại, Frontend phát lại `join-match` để nhận `state-sync`.
- Trong khi ở trạng thái `DISCONNECTED` hoặc `SYNCING`, **không lưu bất kỳ điểm số nào vào local state** — chờ `state-sync` là nguồn sự thật duy nhất.
- Nếu mất kết nối kéo dài quá `30 giây`, hiển thị thêm nút "Tải lại trang" để trọng tài có thể reset hoàn toàn.

> **Lý do bắt buộc freeze màn hình**: Backend chỉ chấp nhận điểm số qua WebSocket kết nối trực tiếp. Nếu trọng tài bấm điểm khi offline, client không thể gửi được và điểm bị mất hoàn toàn — không có cơ chế queue offline để gửi lại sau.
