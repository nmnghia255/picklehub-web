Bạn là một Senior Frontend Developer chuyên về i18next, React, TypeScript và xử lý lỗi encoding. Dựa trên kết quả audit i18n hiện tại, hãy tiến hành sửa lỗi theo từng vòng ưu tiên bên dưới.

## Nguyên tắc chung

* Chỉ sửa các vấn đề i18n, encoding và translation được mô tả trong prompt này.
* Không thay đổi logic nghiệp vụ.
* Không thay đổi API.
* Không refactor các component không liên quan.
* Không tự động format toàn bộ codebase.
* Không xóa translation key chỉ vì chưa tìm thấy nơi sử dụng.
* Không thay đổi text đang đúng nếu không có lý do rõ ràng.
* Không sửa hàng loạt `common.json` chỉ dựa trên số liệu diff chưa được xác minh.
* Sau mỗi vòng phải chạy kiểm tra và báo cáo riêng.
* Nếu một vòng chưa hoàn tất hoặc phát sinh lỗi, phải sửa ổn định trước khi chuyển sang vòng tiếp theo.

Thứ tự bắt buộc:

```text
Vòng 1: Sửa encoding và mojibake
Vòng 2: Sửa key thiếu, namespace và pluralization
Vòng 3: Đồng bộ locale và rà soát hard-coded text
```

## Vòng 1 — Sửa encoding và mojibake

### Mục tiêu

Sửa toàn bộ text tiếng Việt bị lỗi ký tự, ưu tiên file:

```text
src/i18n/locales/vi/sport-center-management.json
```

Hiện đang có các chuỗi lỗi như:

```text
Trá»£ lÃ½
Táº¡o
trung tÃ¢m
KhÃ´ng
Ä‘
Æ°
á»‹
```

Đây là lỗi mojibake do UTF-8 bị decode hoặc ghi sai.

### Yêu cầu thực hiện

1. Đọc toàn bộ file `vi/sport-center-management.json`.
2. Tìm tất cả chuỗi có dấu hiệu mojibake, không chỉ object `createCenter`.
3. Khôi phục lại nội dung tiếng Việt đúng dựa trên:

   * file tiếng Anh tương ứng;
   * ngữ cảnh UI;
   * tên key;
   * các bản dịch tiếng Việt đã có ở namespace khác;
   * text gần giống đang dùng trong codebase.
4. Không dịch lại toàn bộ file nếu chỉ một phần bị lỗi.
5. Không thay đổi key hoặc cấu trúc JSON.
6. Không thêm hoặc xóa key trong vòng này.
7. Không sửa file tiếng Anh trong vòng này.
8. Lưu file bằng UTF-8 chuẩn.
9. Kiểm tra BOM:

   * ưu tiên giữ cùng convention với các locale file khác;
   * không tự thêm BOM nếu dự án không dùng.
10. Quét lại toàn bộ codebase để bảo đảm không còn các pattern mojibake phổ biến:

```text
Ã
Â
Ä
Æ
áº
á»
â€
â€™
â€œ
â€
ï¿½
�
```

Chỉ sửa các file chắc chắn bị lỗi encoding. Không được thay các ký tự hợp lệ chỉ vì chúng trùng một phần pattern.

### Kiểm tra sau vòng 1

Phải xác nhận:

* JSON parse thành công.
* File được đọc đúng bằng UTF-8.
* Không còn mojibake trong `vi/sport-center-management.json`.
* Giao diện create Sport Center không còn text lỗi.
* Không có key nào bị mất.
* Không thay đổi cấu trúc object.
* Không phát sinh thay đổi ngoài locale bị lỗi.

Báo cáo:

```text
Files fixed:
Mojibake strings fixed:
Encoding before:
Encoding after:
JSON parse:
Keys added:
Keys removed:
Unrelated files changed:
```

Chỉ khi vòng 1 ổn định mới tiếp tục vòng 2.

## Vòng 2 — Sửa key thiếu, namespace và pluralization

### Mục tiêu

Sửa các translation key đang được gọi trong code nhưng không tồn tại, gọi sai namespace hoặc gọi sai cơ chế pluralization. Ưu tiên namespace:

```text
sport-center-management
```

### Các key đã được audit phát hiện

Kiểm tra và sửa chính xác các trường hợp sau:

```text
createCenter.stepLabel
createCenter.errorTitle
bookingList.detail.cancellationReason
servicesProducts.page.activeCount
revenue.permissionDenied
```

Không được mặc định audit trước đó đúng hoàn toàn. Phải đọc trực tiếp code và locale để xác minh từng key.

### Kiểm tra namespace thực tế

Với mỗi nơi gọi `t(...)`, xác định:

* `useTranslation()` đang dùng namespace nào;
* component có truyền namespace rõ ràng không;
* key có thuộc namespace khác không;
* namespace đó có được load trong i18n config không;
* key thiếu thật hay chỉ gọi sai path.

Ví dụ cần phân biệt:

```ts
const { t } = useTranslation("sport-center-management");
t("revenue.permissionDenied");
```

với:

```ts
const { t } = useTranslation("common");
t("revenue.permissionDenied");
```

Nếu key đã tồn tại ở namespace đúng nhưng component gọi sai namespace, hãy sửa code gọi translation thay vì tạo key trùng ở namespace khác. Không tạo duplicate translation chỉ để che lỗi namespace.

### Sửa key thiếu thực sự

Nếu key được dùng đúng namespace nhưng chưa tồn tại:

* Thêm key cho cả `en` và `vi`.
* Giữ cấu trúc namespace hiện tại.
* Dịch tự nhiên, đúng ngữ cảnh.
* Không dùng text máy móc hoặc dịch từng chữ.
* Bảo đảm không xuất hiện raw key trên UI.
* Không chỉ dựa vào `defaultValue`.

Các key có `defaultValue` vẫn phải được thêm vào locale nếu đó là text production.

### Sửa pluralization `activeCount`

Kiểm tra code đang sử dụng:

```text
servicesProducts.page.activeCount
```

và locale có các key:

```text
activeCount_one
activeCount_other
```

Sửa theo đúng convention của phiên bản i18next hiện tại.

Ưu tiên cách gọi:

```ts
t("servicesProducts.page.activeCount", { count })
```

hoặc key tương đối tương ứng với namespace hiện tại.

Không gọi trực tiếp:

```ts
t("servicesProducts.page.activeCount_one")
t("servicesProducts.page.activeCount_other")
```

trừ khi codebase hiện tại có convention khác rõ ràng.

Kiểm tra:

* `count` được truyền dưới dạng number.
* `count = 0`.
* `count = 1`.
* `count > 1`.
* Cả tiếng Anh và tiếng Việt.
* i18next version đang dùng suffix `_one`, `_other` hay convention cũ.

Không thay đổi pluralization nếu chưa xác nhận version và config.

### Kiểm tra dynamic key trong module management

Quét các dạng:

```ts
t(`status.${status}`)
t(`court.type.${type}`)
t(`product.type.${type}`)
t(`service.type.${type}`)
t(`booking.status.${status}`)
```

Đối chiếu với enum thực tế.

Phải kiểm tra đủ tất cả giá trị enum có thể xuất hiện, đặc biệt:

* Sport Center status.
* Court type.
* Court status.
* Product type.
* Service type.
* Booking status.
* Payment status.
* Wizard step status.

Nếu thiếu translation:

* bổ sung cho cả EN và VI;
* không dùng raw enum làm label mặc định nếu enum hiển thị trực tiếp cho người dùng.

Không sửa các enum backend hoặc giá trị request.

### Hạn chế dùng defaultValue để che key thiếu

Không cần xóa toàn bộ `defaultValue` trong codebase. Chỉ với các key đang sửa trong vòng này:

* bảo đảm locale có key thật;
* giữ hoặc bỏ `defaultValue` tùy convention hiện có;
* không để UI phụ thuộc hoàn toàn vào fallback text.

Không thực hiện refactor diện rộng.

### Kiểm tra sau vòng 2

Phải xác nhận:

* Các key trên tồn tại ở đúng namespace.
* Không còn raw key tương ứng.
* Không tạo key trùng sai namespace.
* `activeCount` hoạt động đúng với count.
* Dynamic enum mapping đầy đủ trong module management.
* EN và VI đều có bản dịch.
* TypeScript pass.
* Build pass.
* Không thay đổi logic tính năng.

Báo cáo:

```text
Missing keys fixed:
Wrong namespaces fixed:
Pluralization fixes:
Dynamic enum keys added:
Fallback-only keys converted:
Raw key risk remaining:
```

Chỉ khi vòng 2 ổn định mới tiếp tục vòng 3.

## Vòng 3 — Đồng bộ locale và rà soát hard-coded text

### Mục tiêu

Rà soát phần locale còn lệch giữa EN và VI, nhưng không sửa mù theo số liệu diff lớn.

Đặc biệt, audit trước đó báo:

```text
common.json:
vi thiếu 1484 key so với en
en thiếu 1393 key so với vi
```

Không được lập tức thêm hàng nghìn key. Trước tiên phải xác minh lại kết quả.

### Kiểm tra lại structural diff bằng flattened keys

Đọc toàn bộ locale files và flatten key theo dạng:

```text
actions.save
actions.cancel
booking.status.pending
```

So sánh theo từng namespace và từng cặp file tương ứng.

Phải phân biệt:

* Key thực sự thiếu.
* Object khác cấu trúc.
* Một bên là string, một bên là object.
* File khác mục đích nhưng cùng tên.
* Key legacy.
* Key được load từ file khác.
* Key được merge từ nhiều JSON.
* Key dynamic không thể xác định bằng scan đơn giản.

Đặc biệt với `common.json`, báo cáo trước:

```text
Số key leaf của EN:
Số key leaf của VI:
Số key thực sự chỉ có ở EN:
Số key thực sự chỉ có ở VI:
Số mismatch kiểu dữ liệu:
```

Nếu kết quả vẫn lệch rất lớn, chỉ sửa các key:

* đang được sử dụng trong code production;
* có nguy cơ hiện raw key;
* hoặc gây sai ngôn ngữ rõ ràng.

Không cố đồng bộ toàn bộ `common.json` trong một lần.

### Ưu tiên namespace có mismatch nhỏ và chắc chắn

Kiểm tra các key đã audit:

```text
groups.json:
dashboard.tabArchived

tournament/general.json
tournament/group-stage.json
tournament/live-control.json
tournament/registrations.json
```

Với mỗi key thiếu:

1. Xác nhận key có được dùng trong code không.
2. Xác nhận namespace đúng.
3. Nếu đang dùng trong UI production:

   * thêm bản dịch còn thiếu.
4. Nếu không dùng hoặc chỉ là legacy:

   * không xóa;
   * ghi vào báo cáo.
5. Không sửa toàn bộ tournament nếu ngoài phạm vi cần thiết.

### Rà hard-coded text

Quét UI production để tìm text hiển thị trực tiếp, ưu tiên:

* `sport-center-management`;
* các component common mới được dùng bởi Wizard;
* sidebar;
* toast;
* dialog;
* validation;
* empty state;
* error state;
* accessibility label.

Các file đã được audit nhắc đến:

```text
src/components/common/back-button.tsx
src/components/calendar-navigation.tsx
src/app/referees/invitations/accept/accept-referee-invitation-client.tsx
```

Không mặc định mọi literal string đều phải đưa vào i18n.

Chỉ sửa text:

* thực sự hiển thị cho người dùng;
* thay đổi theo locale;
* không phải tên thương hiệu;
* không phải endpoint;
* không phải developer log;
* không phải test fixture.

Ưu tiên tái sử dụng key hiện có.

Nếu cần thêm key:

* thêm cả EN và VI;
* đặt ở namespace hợp lý;
* không dồn mọi thứ vào `common` nếu chỉ dùng ở một feature.

### Không xử lý unused key trong vòng này

Không xóa unused key.

Static scan có thể sai vì:

* dynamic key;
* server mapping;
* config mapping;
* lazy-loaded namespace.

Chỉ lập danh sách nghi ngờ trong báo cáo, không sửa.

### Kiểm tra placeholder/interpolation

So sánh placeholder giữa EN và VI:

```text
{{name}}
{{count}}
{{date}}
{{price}}
```

Kiểm tra:

* Thiếu placeholder ở một locale.
* Khác tên biến.
* Rich text tag không đồng nhất.
* Component truyền biến nhưng translation không sử dụng.
* Translation yêu cầu biến nhưng component không truyền.

Chỉ sửa các mismatch chắc chắn.

## Kiểm tra runtime sau cả 3 vòng

Chạy các kiểm tra phù hợp với codebase:

```text
lint không dùng --fix
TypeScript check
build
```

Sau đó chạy ứng dụng và kiểm tra các màn hình chính:

```text
sport-center-management/create
sport-center-management/[centerId]
Court management
Products & Services management
Revenue report
Booking detail cancellation section
Sidebar
```

Kiểm tra:

* Không còn mojibake.
* Không còn raw translation key đã biết.
* Chuyển EN/VI hoạt động.
* Plural count đúng.
* Enum label đúng.
* Không có console warning i18next mới.
* Không có hydration error.
* Không có text fallback sai ngôn ngữ.
* Không có JSON parse error.

## Giới hạn thay đổi

* Không sửa backend.
* Không sửa API Docs.
* Không đổi business logic.
* Không đổi route.
* Không refactor toàn bộ hệ thống i18n.
* Không xóa hàng loạt key.
* Không tự đồng bộ hàng nghìn key chỉ dựa vào script diff.
* Không dùng công cụ auto-translate hàng loạt.
* Không chạy format toàn repo.
* Không chạy `--fix` hoặc `--write`.
* Không sửa text không liên quan.
* Không thay đổi enum backend.
* Không thay đổi fallback language hoặc default namespace nếu chưa có bug cụ thể yêu cầu.

## Báo cáo cuối cùng

Trả về báo cáo theo cấu trúc:

### A. Vòng 1 — Encoding

```text
Files changed:
Mojibake fixed:
Encoding normalized:
Remaining suspicious strings:
```

### B. Vòng 2 — Missing keys và pluralization

```text
Keys added:
Namespaces corrected:
Plural keys corrected:
Dynamic enum mappings completed:
Raw-key risks fixed:
```

### C. Vòng 3 — Locale consistency

```text
Flattened diff result:
Confirmed missing keys fixed:
Hard-coded texts moved to i18n:
Placeholder mismatches fixed:
Items intentionally not changed:
```

### D. Các file đã thay đổi

Với từng file:

```text
Path:
Change:
Reason:
```

### E. Các mục chưa sửa

Ghi rõ:

* key nghi unused;
* mismatch chưa đủ dữ liệu;
* dynamic key chưa thể xác minh;
* common locale drift còn lại;
* vấn đề ngoài phạm vi.

### F. Kết quả kiểm tra

```text
JSON parse:
Mojibake scan:
Missing key scan:
Pluralization:
TypeScript:
Lint:
Build:
Runtime EN:
Runtime VI:
Raw key:
Hydration:
```

### G. Xác nhận phạm vi

```text
Business logic changed: No
API changed: No
Routes changed: No
Unused keys deleted: No
Mass translation executed: No
```

Hãy trực tiếp sửa code theo đúng thứ tự 3 vòng trên, không chỉ đưa ra hướng dẫn. Khi gặp dữ liệu chưa chắc chắn, ưu tiên ghi nhận trong báo cáo thay vì tự suy đoán hoặc dịch hàng loạt.
