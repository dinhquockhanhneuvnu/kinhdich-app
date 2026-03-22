# Bảng Quy Tắc Tính Lực (Vượng Suy) Trong Lục Hào

Tài liệu này mô tả chi tiết thuật toán tính toán trạng thái Vượng/Suy (Tính lực) của một hào trong dự án Lục Hào, được trích xuất trực tiếp từ mã nguồn `logic.js` (Phân tích 2-Pass Sweep). 

Hệ thống đánh giá sức mạnh của hào bằng điểm số (`diemVS`). Mức điểm càng cao, hào càng vượng và ngược lại.

---

## 1. Mức Độ Vượng Suy
Sau khi tổng hợp toàn bộ các tác động, điểm số `diemVS` sẽ được quy đổi ra thang đo trạng thái hiển thị trên giao diện:

| Điểm số (`diemVS`) | Mức Độ | CSS Class | Nhận Xét |
| :--- | :--- | :--- | :--- |
| **≥ 5** | Cực vượng | `vs-cuc-vuong` | Hào có sức mạnh tối đa |
| **≥ 3** | Vượng | `vs-vuong` | Hào rất mạnh, dư sức sinh khắc hào khác |
| **≥ 1** | Bình hòa | `vs-binh-hoa` | Trạng thái cân bằng, có lực |
| **> -2** | Hơi suy | `vs-hoi-suy` | Hào yếu, khó làm việc |
| **≥ -3** | Suy | `vs-suy` | Hào mất lực |
| **< -3** | Cực suy | `vs-cuc-suy` | Hào hoàn toàn vô lực |

---

## 2. Quy Tắc Cộng Trừ Điểm Cơ Bản (Pass 1)

Điểm khởi điểm của mỗi hào là `0`. Hào sẽ chịu ảnh hưởng của **Nguyệt Kiến (Tháng)** và **Nhật Thần (Ngày)**.

### A. Tác động của Nguyệt Kiến (Tháng)
| Trường Hợp | Nội Dung | Điểm | Ghi Chú |
| :--- | :--- | :--- | :--- |
| **Trùng Chi** | Tháng và Hào có Địa Chi giống hệt nhau | **+4** | Nguyệt Kiến (Cực vượng) |
| **Nguyệt Phá** | Tháng và Hào Lục Xung nhau | **-2** | Tương xung đổ vỡ |
| **Hợp có khắc** | Lục Hợp nhưng Ngũ hành Tháng khắc Hào | **-2** | Nguyệt Khắc (Trong hợp có khắc) |
| **Lục Hợp** | Lục Hợp và không bị khắc | **+2** | Nguyệt Hợp |
| **Nguyệt Sinh** | Ngũ hành Tháng sinh Ngũ hành Hào | **+2** | Được tháng sinh trợ |
| **Tỷ Hòa** | Cùng Ngũ hành (nhưng khác Địa chi) | **+3** | Nguyệt Vượng |
| **Nguyệt Khắc** | Ngũ hành Tháng khắc Ngũ hành Hào | **-2** | Bị tháng khắc chế |

### B. Tác động của Nhật Thần (Ngày)
| Trường Hợp | Nội Dung | Điểm | Ghi Chú |
| :--- | :--- | :--- | :--- |
| **Trùng Chi** | Ngày và Hào có Địa Chi giống hệt | **+4** | Nhật Thần (Cực vượng) |
| **Ám Động 1** | Hào Tuần Không (an tĩnh) + Bị Ngày Xung | **+1** | Xung Không thành Thực |
| **Ám Động 2** | Hào đang vượng (`diemVS >= 1`, tĩnh) + Ngày Xung | **+1** | Nhật xung hào vượng thành Ám Động |
| **Nhật Phá** | Các trường hợp Ngày Xung còn lại (hào tĩnh suy `diemVS < 1` + hào động bất kỳ) | **-2** | Nhật xung hào suy/động thành Nhật Phá |
| **Hợp có khắc** | Lục Hợp nhưng Ngũ hành Ngày khắc Hào | **-2** | Nhật Khắc (Trong hợp có khắc) |
| **Lục Hợp** | Lục Hợp và không bị khắc | **+2** | Nhật Hợp |
| **Nhật Sinh** | Ngày sinh cho Hào | **+2** | Được ngày sinh trợ |
| **Tỷ Hòa** | Cùng Ngũ hành | **+3** | Nhật Vượng (Tỷ hòa) |
| **Nhật Khắc** | Ngày khắc Hào | **-2** | Bị ngày hạn chế |

---

## 3. Các Trạng Thái Đặc Biệt (Tuần Không & Nhập Mộ)

Được xét **sau khi** đã tính điểm từ Tháng và Ngày:
*   **Tuần Không**:
    *   Nếu đang vô lực (`diemVS < 1`): **-2đ** (Chân Không - Vĩnh viễn vô lực).
    *   Nếu có lực (`diemVS ≥ 1`): Không bị trừ điểm (Giả Không - Chờ xuất không ứng nghiệm).
*   **Nhập Mộ (Nhật Mộ)**: 
    *   Chỉ tính Mộ do **Nhật Thần** gây ra làm hạn chế cát hung.
    *   Nếu đang vô lực (`diemVS < 1`): **-2đ** (Suy Mộ - Bế tắc).
    *   Nếu có lực (`diemVS ≥ 1`): Không bị trừ điểm (Vượng Mộ - Đóng kho chờ mở).
*   **Nguyệt Mộ**: Chỉ dùng để diễn tả chi tiết trạng thái (trì trệ, mơ hồ), **không** cộng/trừ lực lượng theo Dã Hạc.

---

## 4. Biến Hóa Nội Tại của Hào Động (Pass 1.5)

Hào Động tự hóa ra Hào Biến, Hào Biến sẽ tác động ngược lại Hào gốc:

| Trường Hợp Hóa | Điểm | Ghi Chú |
| :--- | :--- | :--- |
| **Hóa Tiến Thần** | **+1** | Cùng hành tiến lên (VD: Dần hóa Mão) |
| **Hóa Thoái Thần** | **-1** | Cùng hành thụt lùi (VD: Mão hóa Dần), vô hiệu lực |
| **Hóa Phục Ngâm** | **-1** | Hóa thành chính địa chi cũ (chùng chình) |
| **Hồi Đầu Sinh** | **+1** | Ngũ hành Hào Biến sinh Hào gốc |
| **Hồi Đầu Khắc** | **-1** | Ngũ hành Hào Biến khắc Hào gốc |
| **Quái Phản Ngâm** | **-1** | Hóa ra Hào biến có sự Lục Xung với Hào gốc |
| **Hóa Quái Lục Hợp** | **+1** | Hóa ra Hào biến có sự Lục Hợp với Hào gốc (Hóa Quái Hợp) |
| **Hóa Quẩn Chân** | **0** | Động hóa ra Lục Hợp với chính nó (VD: Tý hóa Sửu), ứng kỳ bị trễ |

---

# Bảng Quy Tắc Tính Lực (Vượng Suy) & Luận Cát Hung Trong Lục Hào

Tài liệu này mô tả chi tiết hệ thống đo lường trạng thái Vượng/Suy và đánh giá Cát Hung của dự án Lục Hào. Dựa theo sự đối chiếu nghiêm ngặt với các cổ thư **Lưu Xương Minh** và **Tăng San Bốc Dịch**, hệ thống của chúng tôi được phân tách thành **2 Giai đoạn (2 Phases)** độc lập. Sự phân tách này giúp loại trừ hoàn toàn hiện tượng "Cộng Dồn Kép" (Double-Counting) đồng thời tôn trọng đúng triết lý: *Tứ Thời Vượng Suy là lực tự thân tĩnh tại, Sinh Khắc Động Năng là sức bật giải quyết sự vụ.*

---

## GIAI ĐOẠN 1: LỰC LƯỢNG TỰ THÂN (BASE STRENGTH - DIEM_VS)

Tính toán năng lượng cốt lõi của một hào (`diemVS`) ngay sau khi vừa lập quẻ. Tuyệt đối **không** dùng cơ chế hào này sinh hào kia để làm thay đổi điểm của nhau ở giai đoạn này. Sức mạnh của một hào chỉ được quyết định bởi Nhất Nguyệt và trạng thái nội tại.

### 1. Thang Đo Trạng Thái Hiển Thị (DiemVS)
| Điểm số (`diemVS`) | Mức Độ | CSS Class | Nhận Xét |
| :--- | :--- | :--- | :--- |
| **≥ 5** | Cực vượng | `vs-cuc-vuong` | Hào có sức mạnh tối đa |
| **≥ 3** | Vượng | `vs-vuong` | Hào rất mạnh, dư sức sinh khắc hào khác |
| **≥ 1** | Bình hòa | `vs-binh-hoa` | Trạng thái cân bằng, có lực |
| **> -2** | Hơi suy | `vs-hoi-suy` | Hào yếu, khó làm việc |
| **≥ -3** | Suy | `vs-suy` | Hào mất lực |
| **< -3** | Cực suy | `vs-cuc-suy` | Hào hoàn toàn vô lực |

### 2. Sức Mạnh Khởi Thủy (Tác động Nhật Nguyệt)
Điểm khởi điểm của mỗi hào là `0`. Hào sẽ cộng trừ điểm do tương tác Ngũ Hành, Hình Xung Khắc Hại với **Nguyệt Kiến (Tháng)** và **Nhật Thần (Ngày)**.
* **Tương Đồng/Tỷ Hòa**: +3 Nhờ Nguyệt, +3 Nhờ Nhật.
* **Tương Sinh**: +2 điểm (Được Nguyệt/Nhật sinh trút sức mạnh).
* **Trùng Chi (Nguyệt Kiến/Nhật Thần)**: +4 điểm (Quyền lực đương thủ).
* **Tương Khắc/Lục Xung**: -2 điểm (Nhật Phá, Nguyệt Phá, hay Trong Hợp Có Khắc).
* **Lục Hợp Tồn Sinh**: +2 điểm.

### 3. Năng Lượng Động Thái
Hào Tĩnh là vật vô tri, Hào Động là mầm mống gốc rễ của sự việc. Bản thân một hào mang tính "Động" hay "Ám Động" lập tức nội tại của nó sẽ được buff thêm năng lượng từ vũ trụ:
*   Trạng thái **Động thái tự nhiên**: `+1.5` điểm.
*   Trạng thái **Ám Động (Nhật Xung Hào Vượng)**: `+1.0` điểm.

### 4. Các Trạng Thái Hạn Chế Phụ Trợ (Chân Không & Tù Mộ)
*   **Tuần Không**:
    *   Nếu đang vô lực (`diemVS < 1`): **-2đ** (Chân Không - Vĩnh viễn vô lực).
    *   Nếu có lực (`diemVS ≥ 1`): Không bị trừ điểm (Giả Không - Chờ xuất Không ứng nghiệm).
*   **Nhật Mộ**: Chỉ tính Mộ do Nhật gây ra. Đang vô lực mà gặp Mộ lĩnh **-2đ** (Suy Mộ bế tắc), có lực gặp mộ thì chỉ khóa lại (Vượng Mộ - Chờ xung).

### 5. Sự Biến Hóa Nội Tại của Hào Động (Lực Hồi Đầu)
Hào Động tự hóa ra Hào Biến, Hào Biến trực tiếp bồi đắp hoặc tàn phá Hào gốc:
* Hóa Tiến Thần (Tiến một bậc cùng hành): `+1`
* Hồi Đầu Sinh (Biến quay về sinh gốc): `+1`
* Hồi Đầu Khắc (Biến quay rành chém gốc): `-1`
* Hóa Thoái Thần / Quái Phản Ngâm / Phục Ngâm: `-1`

---

## GIAI ĐOẠN 2: TƯƠNG TÁC ĐỘNG NĂNG & QUYẾT TRẠN CÁT HUNG
Khác với Giai đoạn 1 là đo lường sức lực cá nhân, **Giai đoạn 2** chỉ kích hoạt khi Người bói **vạch ra Dụng Thần**. Lúc này, các tác nhân khác xung quanh sẽ biến thành (Nguyên / Kỵ / Cừu / Tiết) và đem cái khối Lực Nội Tại ở Giai đoạn 1 làm gốc để tạo Động Năng nã vào Dụng Thần định đoạt sự việc. 

### 1. Thuật Toán Trọng Số Động Năng Chuyển Hóa
Vứt bỏ cơ chế bù trừ hằng số lỗi thời (`+1.5` hay `-1.5` cào bằng mọi Hào vượng suy). Hệ thống đưa vào tỷ lệ Động Năng khoa học hơn — **Hào càng mạnh, đòn đánh/chi viện tung ra càng ác liệt**:
*   **Trọng số k (Dành cho Sinh / Khắc / Cừu)** = **1/3 (~33%)**. Nguyên Thần hoặc Kỵ Thần sẽ trích xuất 1/3 điểm sinh mạng cá nhân nó đem làm sóng xung kích ụp vào Dụng Thần. (VD: Kỵ thần cực vượng `6.0` điểm sẽ giáng một đòn trị giá `-2.0`, trong khi Kỵ Thần lờ mờ `2.0` điểm chỉ đánh xước da Dụng thần mức `-0.66`).
*   **Trọng số t (Dành cho Tiết khí)** = **1/6 (~16.6%)**. Sự bòn rút sức mạnh từ từ của Tiết Thần nhẹ nhàng và âm ỉ hơn so với Đao Khắc dứt khoát của Kỵ Thần.

### 2. Các Quy Luật Vận Hành Trong Combat Cát/Hung
1.  **Chặn đứng Vô Lực**: Bất kì hào Kỵ/Nguyên nào rơi vào vòng Vô Lực (Tuyệt, hưu tù, chân Không) thì sát thương = `0`. Ngôn ngữ giang hồ: Bất lực.
2.  **Hào Tĩnh Phụng Hiến**: Sách của Lưu Xương Minh nhắc đến Hào Tĩnh Vượng vẫn có khả năng sinh/khắc. Nếu Hào Tĩnh đáp ứng độ Vượng (`diemVS >= 1`) thì vẫn phát lực được, nhưng công lực xuất ra **chia đôi** so với Hào Động `Lực tác động = (diemVS * k) / 2`.
3.  **Thay Đổi Ý Định**: Bắt bắt các phản ứng hóa hợp Lục Hào:
    *   *Tham Hợp Quên Sinh / Quên Khắc*: Nếu Động Nguyên Thần có sự Lục hợp với Dụng Thần đang động, nó mải ôm Dụng Thần mà quên bơm máu.
    *   *Tham Sinh Quên Khắc*: Nếu cả "Kỵ + Nguyên + Dụng" cùng vượng động, Kỵ vứt đao chuyển sang sinh hào cho Nguyên Thần, cấu trúc lại mạng lưới (chỉ được kích hoạt nếu có Nguyên Thần đứng trên sân).
4.  **Kiếp Nạn "Khắc Tiết Giao Gia"**: Xuất hiện Kỵ Thần đâm, Tiết Thần đằng lưng hút máu. Dụng Thần chịu cảnh tiến thoái lưỡng nan lĩnh thêm Penalty `-1.0đ`.
5.  **Cừu Thần Ngáng Đường**: Cừu thần không tương tác với Dụng Thần, nhưng sẽ vác cái trọng số Động năng $1/3$ đi quấy rối: Vừa cắt lực truyền của Nguyên Thần, vừa bơm cường khí cho Kỵ Thần. Dụng thần gián tiếp bị ăn đòn mỏi mệt.

### 3. Điểm Quy Chiếu Cát Hung Tối Chung
Đem Điểm Gốc Dụng Thần cộng dồn/giảm đi trong toàn bộ khói lửa trận mạc ở trên. Số điểm cuối cùng định hình Kết Quả dự báo cốt lõi:
*   `Điểm ≥ 2.0`: **Cát / Đại Cát** - Vạn sự hanh thông, vững như thái sơn.
*   `0.5 ≤ Điểm < 2.0`: **Mưu Sự Bình (Hơi tốt)** - Gặp thuận lợi, có cơ may thành sự.
*   `-0.5 < Điểm < 0.5`: **Bình Hòa** - Cân sức, cù cưa, chưa phân định thắng bại.
*   `-2.0 < Điểm ≤ -0.5`: **Tiểu Hung** - Dụng thần hao mòn, sự việc trục trặc.
*   `Điểm ≤ -2.0`: **Đại Hung** - Hưu tù, việc bất thành, họa vô đơn chí.
