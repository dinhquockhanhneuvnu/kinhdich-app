# Báo Cáo Phân Tích Hệ Thống Màu Sắc & Độ Tương Phản (Bảng Quẻ)

Bản báo cáo này tổng hợp các lỗi về hiển thị màu sắc đã phát hiện trong quá trình phát triển và các giải pháp kỹ thuật đã áp dụng để tối ưu hóa trải nghiệm người đọc trên cả hai chế độ **Dark Mode** và **Light Mode**.

## 1. Tổng Quan Cấu Trúc Màu Sắc

Ứng dụng hiện sử dụng hệ thống **CSS Variables** để quản lý màu sắc tập trung. Điều này giúp đảm bảo tính nhất quán và dễ dàng bảo trì.

- **Dark Mode (Mặc định):** Sử dụng các tông màu Neon/Aurora trên nền tối (`#0d1017`).
- **Light Mode:** Sử dụng các tông màu Pastel/Vivid trên nền sáng (`#faf9f6`).

## 2. Phân Tích Các Lỗi Độ Tương Phản Đã Khắc Phục

Dưới đây là danh sách các lỗi nghiêm trọng về màu sắc ảnh hưởng đến khả năng đọc của người dùng:

### A. Lỗi Hardcoded Color (Màu đóng cứng)
- **Vấn đề:** Nhiều đoạn mã trong `js/render.js` và `index.html` sử dụng mã màu Hex cố định (như `#ffffff`, `#888888`).
- **Hệ quả:** Khi chuyển sang Light Mode, chữ trắng (`#fff`) biến mất trên nền trắng, hoặc chữ xám (`#888`) bị mờ cực kỳ khó đọc.
- **Giải pháp:** Đã thay thế toàn bộ bằng các biến ngữ nghĩa:
  - `var(--text)`: Cho văn bản chính (Đen ở Sáng, Trắng ở Tối).
  - `var(--text-2)`: Cho văn bản phụ.
  - `var(--heading-color)`: Cho tiêu đề và các phần quan trọng.

### B. Lỗi Layer Màu Nền (Background Row)
- **Vấn đề:** Các hàng Hào (Dụng Thần, Nguyên Thần, Kỵ Thần) trước đây được đổ một lớp màu nền (`background`) tương đối đậm.
- **Hệ quả:** Màu nền này "nuốt" mất màu chữ của Lục Thần và các chỉ số Vượng Suy, tạo ra cảm giác rối mắt và nhòe chữ.
- **Giải pháp:** 
  - Đã loại bỏ hoàn toàn màu nền của các hàng này theo yêu cầu.
  - Thay vào đó, sử dụng **Badge** màu (thẻ màu) cho từng vai trò và **Border** (đường viền) để phân tách, giúp bảng quẻ sạch sẽ và sắc nét hơn.

### C. Lỗi Hiển Thị Hào Tuần Không (TK) & Nhật Phá
- **Vấn đề:** Hào bị Tuần Không thường được giảm độ mờ (`opacity`). Ở Light Mode, độ mờ quá thấp khiến Hào 1 (Sơ) gần như không thể đọc được.
- **Giải pháp:** Điều chỉnh `opacity: 0.7` cho Light Mode thay vì thấp hơn, đảm bảo vẫn thể hiện được trạng thái "Không" nhưng vẫn đủ độ tương phản để đọc.

### D. Lỗi Căn Chỉnh Trên Đồng Xu
- **Vấn đề:** Ký tự "S/N" (Sấp/Ngửa) nằm đè lên hoa văn của đồng xu, gây nhiễu thị giác và khó nhận diện.
- **Giải pháp:** Đẩy ký tự xuống phía dưới đáy đồng xu, tách biệt khỏi vùng ảnh minh họa và thêm `text-shadow` (ở Dark) hoặc màu đậm (ở Light) để tách khối.

## 3. Chi Tiết Màu Sắc Các Thành Phần Hào

| Thành phần | Biến CSS / Màu sắc | Ghi chú |
|:---|:---|:---|
| **Vạch Hào Dương** | `var(--gold)` | Màu vàng kim, nổi bật trên cả 2 nền. |
| **Vạch Hào Âm** | `var(--text-3)` | Màu xám xanh/xám đậm, tạo sự phân biệt rõ với hào Dương. |
| **Lục Thần (Tên)** | Hệ thống `.lt-*` | Đã tăng độ bão hòa màu ở Light Mode để không bị nhạt. |
| **Dấu X (Động)** | `var(--gold)` | Font-weight: 900, cực kỳ đậm nét. |
| **Thế / Ứng** | `.bdg-the / .bdg-ung` | Sử dụng Purple (Thế) và Cyan (Ứng) để định vị nhanh. |

## 4. Khuyến Nghị Duy Trì
Khi thực hiện nâng cấp các tính năng mới liên quan đến giao diện, tuyệt đối tuân thủ:
1. **Không dùng mã màu Hex trực tiếp** trong Javascript. Luôn gọi `var(--ten-bien)`.
2. **Kiểm tra tỷ lệ tương phản (Contrast Ratio):** Luôn đảm bảo văn bản nhỏ có tỷ lệ ít nhất 4.5:1 so với nền (sử dụng công cụ kiểm tra của Chrome DevTools).
3. **Thử nghiệm trên cả 2 Mode:** Mọi thay đổi về màu sắc cần được kiểm chứng trên cả giao diện Sáng và Tối trước khi Commit.

---
*Báo cáo được lập bởi KhanhDev AI Assistant.*
