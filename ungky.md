# Thuật Toán Luận Ứng Kỳ (Lục Hào) - Chuẩn Lưu Xương Minh

Tài liệu này trình bày thuật toán xác định thời điểm ứng nghiệm (Ứng Kỳ) dựa trên các "Bệnh" của Dụng Thần và quy luật vận động của Hào, được trích xuất từ giáo trình của tác giả Lưu Xương Minh.

## 1. Thứ Tự Ưu Tiên (Priority)
Khi một hào có nhiều trạng thái, thuật toán xét theo thứ tự từ nặng đến nhẹ:
1. **Tuần Không** (Phải ra khỏi hang/vắng mặt).
2. **Nhập Mộ** (Phải được mở kho/giải thoát).
3. **Hợp Bán** (Phải được cởi trói).
4. **Nguyệt Phá** (Phải được hàn gắn/điền thực).
5. **Phục Tàng** (Phải được kéo lên/xung phi).
6. **Động/Tĩnh** (Vận động tự thân).

---

## 2. Chi Tiết Các Trường Hợp

### A. Nhóm "Bệnh" Của Quẻ
| Trạng Thái | Điều kiện | Thời điểm ứng (Ứng Kỳ) |
| :--- | :--- | :--- |
| **Tuần Không** | Có khí (Giả Không) | Ngày **Lâm trị** (Điền thực) hoặc ngày **Xung** (Xung Không) |
| | Vô khí (Chân Không) | **Không có ứng kỳ** (Sự việc vĩnh viễn thất bại) |
| **Nhập Mộ** | Bị nhốt vào kho | Ngày **Xung Mộ** (Ví dụ: Nhập Mộ tại Thìn -> Ứng ngày Tuất) |
| **Hợp Bán** | Bị trói chân | Ngày **Xung kẻ trói** (Hợp thần) hoặc **Xung Hào** |
| **Nguyệt Phá** | Có khí | Ngày **Lâm trị** (Địa chi hào) hoặc ngày **Hợp** (Hợp phá) |
| | Vô khí (Chân Phá) | **Không có ứng kỳ** (Đổ vỡ hoàn toàn) |
| **Phục Tàng** | Có khí | Ngày **Xung Phi thần** hoặc ngày **Lâm Phục** |

### B. Nhóm Vận Động Tự Thân (Khi không có "Bệnh")
| Trạng Thái | Nguyên lý | Thời điểm ứng (Ứng Kỳ) |
| :--- | :--- | :--- |
| **Hào Động** | Động thì đợi Hợp | Ngày **Lâm trị** (Địa chi hào) hoặc ngày **Hợp** với hào động |
| **Hào Tĩnh** | Tĩnh thì đợi Xung | Ngày **Lâm trị** (Địa chi hào) hoặc ngày **Xung** vào hào tĩnh |

---

## 3. Lưu Ý Quan Trọng
- **Hợp - Xung:** Là cặp bài trùng. Hào đang bị Hợp thì chờ ngày Xung để hóa giải. Hào đang bị Xung (Phá) thì chờ ngày Hợp để hàn gắn.
- **Vượng - Suy:** Thuật toán luôn ưu tiên xét xem hào đó có "Hữu dụng" hay không. Nếu hào Chân Không hoặc Chân Phá, mọi dự đoán về thời gian đều vô nghĩa vì kết quả cuối cùng là thất bại.

---
*Tài liệu này được đối soát trực tiếp với NotebookLM chứa giáo trình Lục Hào Lưu Xương Minh.*
