# BÁO CÁO PHÂN TÍCH VÀ SO SÁNH (skill-kinhdich.md và skill-lapque.md)

Sau khi đối chiếu kỹ lý thuyết chuẩn xác trong `skill-kinhdich.md` với cách mà hệ thống được thiết kế và code trong file `skill-lapque.md`, tôi phát hiện ra **5 LỖI GÂY TÍNH TOÁN SAI LỆCH HOÀN TOÀN** trong `skill-lapque.md` khiến cho app lập quẻ hiện tại không thể luận giải chính xác. 

Xin báo cáo chi tiết các lỗi này để bạn nắm rõ tình hình:

## LỖI 1: Sai bét Bảng ánh xạ Quái (Mã nhị phân QUAI_MAP)
*Hậu quả: App sẽ nạp sai toàn bộ quẻ khi gieo xu.*
Trong phần `4.3 Bảng Nhị Phân → Tên Quái`, quy ước đang là từ dưới lên (Hào 1 -> Hào 3). Nhưng file lại bị ngược hoàn toàn giữa các Quái có tính đối xứng:
- Đang ghi: `'011': 'Đoài'` và `'110': 'Tốn'`. **X** Thật ra: `011` (âm - dương - dương) là **Tốn** (Gió), còn `110` (dương - dương - âm) mới là **Đoài** (Đầm).
- Đang ghi: `'001': 'Chấn'` và `'100': 'Cấn'`. **X** Thật ra: `001` (âm - âm - dương) là **Cấn** (Núi), còn `100` (dương - âm - âm) là **Chấn** (Sấm).

## LỖI 2: Sai quy tắc Nạp Giáp Địa Chi cho 64 Quẻ !!! (Cực kỳ nghiêm trọng)
*Hậu quả: Tính sai Lục Thân, Nguyên / Kỵ thần của hàng loạt quẻ, luận quẻ bị sai bản chất.*
File áp dụng sai quy luật Âm thoái / Dương tiến của bài ca Nạp Giáp, rất nhiều quẻ bị sai địa chi các hào. Một vài ví dụ tiêu biểu bị sai trong danh sách `QUE_64`:
- **Khảm Vi Thủy:** Đang chạy là `['Tý','Thân','Ngọ','Thìn','Dần','Tý']` -> Bị nạp ngược. Khảm phải là Dương tiến bắt đầu từ Dần: **`['Dần','Thìn','Ngọ','Thân','Tuất','Tý']`**
- **Cấn Vi Sơn:** Đang là `['Thìn','Dần','Tý','Tuất','Thân','Ngọ']` -> Sai hoàn toàn. Phải tiến lên: **`['Thìn','Ngọ','Thân','Tuất','Tý','Dần']`**
- **Tốn Vi Phong:** Đang là `['Sửu','Mão','Tị','Hợi','Dậu','Mùi']` -> Tốn phải đi lùi (Sửu -> Hợi -> Dậu): **`['Sửu','Hợi','Dậu','Mùi','Tị','Mão']`**
- **Phong Địa Quan:** Ghép sai cơ bản (Ghi là `['Mão','Tị','Mùi',...]`). Nội Khôn ngoại Tốn phải là **`['Mùi','Tị','Mão','Mùi','Tị','Mão']`**

## LỖI 3: Mất điêm Đồng Hành (Tỷ hòa) trong thuật toán Vượng Suy
*Hậu quả: Hào vốn cực vượng bị mất trắng điểm, đánh giá sai sức mạnh gốc rễ.*
Trong hàm `phanTichVuongSuy()` (Mục VII):
- Lập trình viên thiết lập Nguyệt Kiến / Nhật Thần lâm Địa Chi (trùng chi) được `+3 điểm`. Sinh được `+2`, Khắc bị `-2`.
- Nhưng CÓ thiếu sót nhánh **(Tỷ Hòa / Đồng hành)**. Nếu Tháng 4 (Thìn hành Thổ), gặp Hào Sửu (hành Thổ), theo cẩm nang thì Hào này được Đồng hành (Vượng `+1 điểm`). Nhưng vì code không có lệnh IF nào xử lý ngũ hành bù trừ này, hàm của Hào đó sẽ lọt hố và lấy mặc định **`0 điểm`**.

## LỖI 4: Sai luật Âm Dương - Thổ Nhập Mộ
*Hậu quả: App sẽ đánh giá cảnh báo Nhập Mộ sai chỗ cho hào Thổ.*
- Ở Mục `3.6 Nhập Mộ`, code để `Thổ: Tuất`.
- Nhưng ở ngay mục dưới `3.7 Thập Nhị Trạng Thái`, Thổ lại duyệt đến `Thìn` là Mộ. Sự **mâu thuẫn** nội tại này phá hỏng code.
- Theo quy định chuẩn hệ của `skill-kinhdich.md`: Thủy và Thổ đồng cục. Cả hai cùng nhập mộ tại **Thìn**. Không phải Tuất.

## LỖI 5: Không phân biệt Ám Động và Nhật Phá
*Hậu quả: Điểm tính lực vượng suy của Nhật Thần bị sai.*
Trong hàm chấm điểm: `if (LUC_XUNG[nhatThan] === diaChi) diem -= 1;`.
Điều này đi ngược với kiến thức 4.1 của `skill-kinhdich.md`:
Nếu hào đang có nội lực (vượng) bị Nhật Xung thì biến thành **Ám động** (tượng đương sức mạnh của 1 hào phát động, tức là phải `Cộng thêm điểm`). Chỉ khi hào đang không có lực bị xung mới là **Nhật phá** (mới trừ điểm suy tàn). Áp đặt cứng ngắc `-1` cho mọi trường hợp bị Nhật xung là giết chết "Linh hồn" của quẻ.

---
**TÓM LẠI:** 
File `skill-kinhdich.md` phản ánh một luồng lý thuyết rất chuẩn xác từ giáo trình Lục Hào gốc. Mọi sai phạm đều nằm ở bộ dữ liệu "Hardcode" (Map, Dictionary) mảng Lập Quẻ của `skill-lapque.md`. 
Tôi sẽ chờ lệnh để tạo kịch bản code lại `app.js` và `data.js` sửa tận rễ 5 lỗi trí mạng này.
