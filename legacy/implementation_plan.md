# Kế hoạch Sửa lỗi Tái cấu trúc (Refactoring) Lục Hào Engine

Dựa trên phân tích từ [sosanh.md](file:///Users/dinhquockhanh/Desktop/kinhdich-app/sosanh.md), dưới đây là kế hoạch chi tiết để đập bỏ 5 lỗi sinh trình quẻ đang tồn tại trong [data.js](file:///Users/dinhquockhanh/Desktop/kinhdich-app/data.js) và thuật toán chấm điểm [app.js](file:///Users/dinhquockhanh/Desktop/kinhdich-app/app.js).

## Proposed Changes

### Thay đổi File [data.js](file:///Users/dinhquockhanh/Desktop/kinhdich-app/data.js) (Core Data)

Khu vực này giải quyết 3 lỗi sai hardcode nghiêm trọng nhất:

#### [MODIFY] [data.js](file:///Users/dinhquockhanh/Desktop/kinhdich-app/data.js)
1. **Sửa `QUAI_MAP` (Map nhị phân Đơn Quái):** 
   - Đổi mã nhị phân của Đoài (`011` → `110`) và Tốn (`110` → `011`). 
   - Đổi mã nhị phân của Chấn (`001` → `100`) và Cấn (`100` → `001`).
   - Đảm bảo logic đọc từ dưới lên hợp lệ với hào 1, hào 2, hào 3 của mỗi quái.

2. **Sửa `NHAP_MO` (Thổ nhập Mộ):**
   - Đổi `'Thổ': 'Tuất'` thành `'Thổ': 'Thìn'`, đồng nhất quy tắc Thủy Thổ đồng cục với Thập nhị trường sinh.

3. **Sửa CẤU TRÚC 64 QUẺ `QUE_64` (Đồ sộ nhất):**
   - Áp dụng lại bài ca Nạp Giáp chuẩn xác để gán mảng `dia_chi` cho từng quẻ (đặc biệt tất cả các quẻ có dính Khảm, Cấn, Tốn, Phong, Trạch). 
   - Thay vì hardcode dễ nhầm lẫn, tôi sẽ giữ cấu trúc `dia_chi` mảng 6 phần tử nhưng tự động viết một script Python sinh ra mảng chính xác 100% từ `najia` (thư viện chuẩn) và dán đè thay thế mảng `QUE_64` cũ. 
   - *Lý do:* Viết tay lại 64 mảng này bằng tay rất dễ có rủi ro typo con người. Cấu trúc `id, ten, cung...` sẽ được giữ nguyên, chỉ thay đổi value của `dia_chi`.

---

### Thay đổi File [app.js](file:///Users/dinhquockhanh/Desktop/kinhdich-app/app.js) (Core Logic)

Khu vực này giải quyết 2 luồng thuật toán bị thiếu sót về Vượng Suy:

#### [MODIFY] [app.js](file:///Users/dinhquockhanh/Desktop/kinhdich-app/app.js)
1. **Bổ sung logic "Đồng Hành (Tỷ Hòa)" trong [phanTichVuongSuy()](file:///Users/dinhquockhanh/Desktop/kinhdich-app/app.js#256-284):**
   - Trong nhánh kiểm tra Nguyệt Kiến: Thêm khối lệnh `else if (nguyetHanh === haoHanh) { diem += 1; nhanXet.push('Nguyệt đồng hành (tỷ hòa)'); }` trước các lệnh xét sinh/khắc.
   - Trong nhánh kiểm tra Nhật Thần: Thêm `else if (nhatHanh === haoHanh) { diem += 1; nhanXet.push('Nhật đồng hành (tỷ hòa)'); }`.

2. **Cập nhật logic Ám Động và Nhật Phá:**
   - Khi Nhật Xung (`LUC_XUNG[nhatThan] === diaChi`):
     - Nếu `diem >= 1` (Hào đang có nền tảng từ Tháng), hào biến thành **Ám động** → `diem += 1.5; nhanXet.push('Bị Nhật xung thành Ám Đông (Cát/Lực mạnh)');`.
     - Nếu `diem < 1` (Hào đang yếu xìu), hào biến thành **Nhật Phá** → `diem -= 2; nhanXet.push('Nhật phá (Tan vỡ)');`.
   - Bỏ việc auto trừ `-1` điểm vô lý khi bị Nhật xung cũ.

## Verification Plan

### Automated Tests
1. **Tạo Unit Test (Test ngẫu nhiên):** Sử dụng chung tệp script [test_app.js](file:///Users/dinhquockhanh/Desktop/kinhdich-app/test_app.js) (gọi JS) và [test_najia.py](file:///Users/dinhquockhanh/Desktop/kinhdich-app/test_najia.py) (với 20 cases 6 hào ngẫu nhiên) ở folder rễ. 
2. Hàm báo cáo [compare_results.py](file:///Users/dinhquockhanh/Desktop/kinhdich-app/compare_results.py) sẽ tự động xác minh từng Mãng quái và chuỗi Địa Chi. Khi tôi cập nhật xong, chạy lệnh `python3 compare_results.py`, kết quả kỳ vọng là `Khớp` 20/20 quẻ (100% accuracy).

### Manual Verification
- Người dùng mở web browser test chức năng lập ngày, gieo quẻ trên giao diện UI để xem kết quả Lục thân, Địa chi (đã bắt đúng chưa với một quẻ tình huống cụ thể: Vd Khảm Vi Thủy hiện đúng [Dần Thìn Ngọ Thân Tuất Tý]).
- Check output đánh giá Vượng Suy khi giao diện in kết quả có chữ "Ám Động" thay vì "Nhật Xung".
