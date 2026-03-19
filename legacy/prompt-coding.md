# PROMPT CHI TIẾT CHO AI CODING — WEB APP LỤC HÀO

---

## 🎯 MỤC TIÊU DỰ ÁN

Xây dựng một **ứng dụng web đơn trang (SPA)** hỗ trợ lập quẻ và an quẻ Kinh Dịch Lục Hào.
Ứng dụng tự động tính toán tất cả những gì có thể tính được, để người dùng chỉ cần tập trung vào **phần luận đoán** (phần chỉ con người mới làm được).

---

## 🏗️ YÊU CẦU KIẾN TRÚC

### Stack
- **Một file HTML duy nhất** (HTML + CSS + JavaScript inline)
- Không cần backend, không cần build tool
- Có thể mở trực tiếp trong trình duyệt
- Dùng Google Fonts để tải font chữ đẹp
- Dùng thư viện `lunar-javascript` (CDN) để chuyển đổi Dương/Âm lịch

### Aesthetic
- **Chủ đề**: Cổ điển Đông Phương — nền tối (navy/đen), text vàng gold, accent đỏ son
- **Font**: Google Fonts — Noto Serif SC hoặc Ma Shan Zheng cho tiêu đề + Inter/Nunito cho nội dung
- **Bố cục**: 2 cột (trái: lập quẻ / phải: phân tích)
- **Responsive**: Trên mobile thu thành 1 cột

---

## 📋 CHI TIẾT TỪNG BƯỚC CÀI ĐẶT

---

### PHẦN 1: DỮ LIỆU CỐT LÕI (DATA LAYER)

Khai báo các hằng số JavaScript sau (đặt trong `<script>` tag):

#### 1A. Ngũ Hành

```javascript
const NGU_HANH_SINH = {
  'Kim':'Thủy', 'Thủy':'Mộc', 'Mộc':'Hỏa', 'Hỏa':'Thổ', 'Thổ':'Kim'
};
const NGU_HANH_KHAC = {
  'Kim':'Mộc', 'Mộc':'Thổ', 'Thổ':'Thủy', 'Thủy':'Hỏa', 'Hỏa':'Kim'
};
```

#### 1B. Địa Chi & Thiên Can

```javascript
const DC_HANH = {
  'Tý':'Thủy','Sửu':'Thổ','Dần':'Mộc','Mão':'Mộc',
  'Thìn':'Thổ','Tị':'Hỏa','Ngọ':'Hỏa','Mùi':'Thổ',
  'Thân':'Kim','Dậu':'Kim','Tuất':'Thổ','Hợi':'Thủy'
};
const DC_LIST = ['Tý','Sửu','Dần','Mão','Thìn','Tị','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
const CAN_LIST = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
const CAN_HANH = {
  'Giáp':'Mộc','Ất':'Mộc','Bính':'Hỏa','Đinh':'Hỏa',
  'Mậu':'Thổ','Kỷ':'Thổ','Canh':'Kim','Tân':'Kim','Nhâm':'Thủy','Quý':'Thủy'
};
```

#### 1C. Lục Hợp, Lục Xung

```javascript
const LUC_HOP = {
  'Tý':'Sửu','Sửu':'Tý','Dần':'Hợi','Hợi':'Dần',
  'Mão':'Tuất','Tuất':'Mão','Thìn':'Dậu','Dậu':'Thìn',
  'Tị':'Thân','Thân':'Tị','Ngọ':'Mùi','Mùi':'Ngọ'
};
const LUC_XUNG = {
  'Tý':'Ngọ','Ngọ':'Tý','Sửu':'Mùi','Mùi':'Sửu',
  'Dần':'Thân','Thân':'Dần','Mão':'Dậu','Dậu':'Mão',
  'Thìn':'Tuất','Tuất':'Thìn','Tị':'Hợi','Hợi':'Tị'
};
```

#### 1D. Nhập Mộ

```javascript
const NHAP_MO = {'Kim':'Sửu','Mộc':'Mùi','Thủy':'Thìn','Hỏa':'Tuất','Thổ':'Tuất'};
```

#### 1E. Tuần Không (theo Giáp Tuần)

```javascript
// Mảng 60 Can Chi theo thứ tự vòng tròn
const GIAP_TY_CYCLE = []; // Tạo vòng 60 Can Chi
// Mỗi Giáp Tuần gồm 10 ngày → 2 Địa Chi cuối không dùng = Tuần Không
function getTuanKhong(canIdx, chiIdx) {
  // canIdx: vị trí trong CAN_LIST (0-9)
  // chiIdx: vị trí trong DC_LIST (0-11)
  // Tính số thứ tự trong vòng 60 Can Chi
  const stt60 = findIndexIn60Cycle(canIdx, chiIdx);
  const gapTuan = Math.floor(stt60 / 10) * 10;
  // Giáp tuần bắt đầu tại gapTuan → 2 DC tuần không
  const tuanDC = [DC_LIST[(gapTuan + 10) % 12], DC_LIST[(gapTuan + 11) % 12]];
  return tuanDC;
}
```

#### 1F. Lục Thần

```javascript
const LUC_THAN_ORDER = ['Thanh Long','Chu Tước','Câu Trần','Đằng Xà','Bạch Hổ','Huyền Vũ'];
const LUC_THAN_START = {
  'Giáp':0,'Ất':0,'Bính':1,'Đinh':1,'Mậu':2,'Kỷ':3,'Canh':4,'Tân':4,'Nhâm':5,'Quý':5
};
```

#### 1G. Bảng 64 Quẻ

```javascript
// Xem chi tiết trong file skill-lapque.md mục IV
// Cấu trúc:
const QUE_64 = [
  {
    id: Number,
    ten: String,           // "Lôi Địa Dự"
    noi_quat: String,      // "Khôn"
    ngoai_quat: String,    // "Chấn"
    cung: String,          // "Chấn"
    the_hao: Number,       // 1-6
    ung_hao: Number,       // 1-6
    dia_chi: Array[6]      // [hao1, hao2, hao3, hao4, hao5, hao6]
  },
  // ... 64 quẻ
];

// Hành của cung quái
const CUNG_HANH = {
  'Càn':'Kim','Đoài':'Kim','Ly':'Hỏa','Chấn':'Mộc',
  'Tốn':'Mộc','Khảm':'Thủy','Cấn':'Thổ','Khôn':'Thổ'
};

// Nhị phân → tên quái (đọc từ hào 1 dưới lên)
const QUAI_MAP = {
  '111':'Càn','011':'Đoài','101':'Ly','001':'Chấn',
  '110':'Tốn','010':'Khảm','100':'Cấn','000':'Khôn'
};
```

---

### PHẦN 2: GIAO DIỆN HTML

#### 2A. Header

```html
<header>
  <div class="logo">☯</div>
  <h1>Lục Hào Kinh Dịch</h1>
  <p class="subtitle">Công cụ Lập Quẻ & Phân Tích</p>
</header>
```

#### 2B. Layout 2 Cột

```html
<main class="container">
  <section class="panel-left" id="panel-input">
    <!-- BƯỚC 1: Thời gian -->
    <!-- BƯỚC 2: Gieo xu -->
    <!-- BƯỚC 3: Hiển thị quẻ -->
  </section>

  <section class="panel-right" id="panel-analysis">
    <!-- BƯỚC 4: Chọn Dụng Thần -->
    <!-- BƯỚC 5: Phân tích vượng suy -->
    <!-- BƯỚC 6: Cảnh báo -->
    <!-- BƯỚC 7: Thời điểm ứng -->
    <!-- BƯỚC 8: Ghi chú luận quẻ -->
  </section>
</main>
```

#### 2C. Form Nhập Thời Gian (Bước 1)

```html
<div class="step-card" id="step-1">
  <h3>⏰ Bước 1: Thời gian gieo quẻ</h3>

  <!-- Ngày dương lịch (auto convert) -->
  <div class="input-row">
    <label>Ngày dương lịch:</label>
    <input type="date" id="duong-lich" />
    <button onclick="convertToAmLich()">Chuyển đổi</button>
  </div>

  <!-- Hoặc nhập thẳng Can Chi -->
  <div class="divider">— hoặc nhập thẳng Can Chi —</div>

  <div class="input-row">
    <label>Tháng âm lịch (Nguyệt Kiến):</label>
    <select id="thang-can"><!-- 10 Thiên Can --></select>
    <select id="thang-chi"><!-- 12 Địa Chi --></select>
  </div>

  <div class="input-row">
    <label>Ngày (Nhật Thần):</label>
    <select id="ngay-can"><!-- 10 Thiên Can --></select>
    <select id="ngay-chi"><!-- 12 Địa Chi --></select>
  </div>

  <!-- Hiển thị kết quả tính tự động -->
  <div class="auto-result" id="result-step1">
    <span>Nguyệt Kiến: <strong id="nguyet-kien">—</strong></span>
    <span>Nhật Thần: <strong id="nhat-than">—</strong></span>
    <span>Tuần Không: <strong id="tuan-khong">—</strong></span>
    <span>Lục Thần bắt đầu từ: <strong id="luc-than-start">—</strong></span>
  </div>
</div>
```

#### 2D. Form Gieo Xu (Bước 2)

```html
<div class="step-card" id="step-2">
  <h3>🪙 Bước 2: Kết quả 6 lần gieo xu</h3>
  <p class="hint">3 xu: Ngửa=3, Sấp=2. Tổng: 6=Âm động, 7=Dương tĩnh, 8=Âm tĩnh, 9=Dương động</p>

  <!-- 6 hào nhập từ dưới lên -->
  <div class="hao-inputs">
    <!-- Hào 6 (Thượng) -->
    <div class="hao-row">
      <label>Hào 6 (Thượng):</label>
      <div class="score-buttons">
        <button class="score-btn" data-hao="6" data-val="6">6 ⚋●</button>
        <button class="score-btn" data-hao="6" data-val="7">7 ⚊</button>
        <button class="score-btn" data-hao="6" data-val="8">8 ⚋</button>
        <button class="score-btn" data-hao="6" data-val="9">9 ⚊●</button>
      </div>
      <span class="hao-preview" id="preview-6">—</span>
    </div>
    <!-- Tương tự cho Hào 5, 4, 3, 2, 1 -->
  </div>

  <button class="btn-primary" onclick="anQue()" id="btn-anque" disabled>
    🔮 An Quẻ
  </button>
</div>
```

#### 2E. Bảng Hiển Thị Quẻ (Bước 3)

```html
<div class="step-card" id="step-3" style="display:none">
  <h3>📋 Bước 3: Quẻ đã lập</h3>

  <div class="que-header">
    <div class="que-name">
      <span id="ban-que-name">Bản quái: —</span>
      →
      <span id="chi-que-name">Chi quái: —</span>
    </div>
    <div class="que-info">
      <span>Cung: <strong id="cung-que">—</strong></span>
      <span>Hành cung: <strong id="hanh-cung">—</strong></span>
    </div>
  </div>

  <!-- Bảng 6 hào - render bằng JavaScript -->
  <table class="bang-que" id="bang-que">
    <thead>
      <tr>
        <th>Vị trí</th>
        <th>Lục Thần</th>
        <th>Lục Thân</th>
        <th>Địa Chi</th>
        <th>Bản quẻ</th>
        <th>Chi quẻ</th>
        <th>Ghi chú</th>
      </tr>
    </thead>
    <tbody id="tbody-que">
      <!-- Render 6 hàng từ hào 6 xuống hào 1 -->
    </tbody>
  </table>

  <!-- Legend màu sắc -->
  <div class="legend">
    <span class="leg-the">■ Thế hào</span>
    <span class="leg-ung">■ Ứng hào</span>
    <span class="leg-dong">● Hào động</span>
    <span class="leg-tk">□ Tuần Không</span>
    <span class="leg-mo">⊠ Nhập Mộ</span>
  </div>
</div>
```

#### 2F. Panel Phải — Chọn Dụng Thần

```html
<div class="step-card" id="step-4">
  <h3>🎯 Bước 4: Xác định Dụng Thần</h3>

  <div class="input-row">
    <label>Loại việc hỏi:</label>
    <select id="loai-viec" onchange="goiYDungThan()">
      <option value="">— Chọn loại việc —</option>
      <option value="tai-loc">💰 Tài lộc / Kinh doanh</option>
      <option value="cong-danh-nam">🏆 Công danh / Thi cử (nam)</option>
      <option value="cong-danh-nu">🏆 Công danh / Thi cử (nữ)</option>
      <option value="hon-nhan-nam">❤️ Hôn nhân (nam hỏi)</option>
      <option value="hon-nhan-nu">❤️ Hôn nhân (nữ hỏi)</option>
      <option value="con-cai">👶 Con cái / Thai sản</option>
      <option value="benh-tat">🏥 Bệnh tật / Sức khỏe</option>
      <option value="kien-tung">⚖️ Kiện tụng / Tranh chấp</option>
      <option value="van-thu">📄 Văn thư / Hợp đồng</option>
      <option value="xuat-hanh">✈️ Xuất hành / Đi xa</option>
      <option value="tim-nguoi">🔍 Tìm người thân</option>
      <option value="nha-cua">🏠 Nhà cửa / Bất động sản</option>
    </select>
  </div>

  <div id="goi-y-dung-than" class="goi-y-box">
    <!-- Gợi ý Lục Thân nên chọn làm Dụng Thần -->
  </div>

  <p class="hint-click">👆 Click vào hào trong bảng để chọn làm Dụng Thần</p>
  <p class="hint-click">Hoặc chọn trực tiếp:</p>
  <div id="chon-dung-than-buttons">
    <!-- Render buttons cho từng hào tương ứng Lục Thân được gợi ý -->
  </div>

  <div id="dung-than-selected" class="selected-box" style="display:none">
    Dụng Thần đã chọn: <strong id="dt-name">—</strong>
    (<span id="dt-dia-chi">—</span> <span id="dt-hanh">—</span>)
    <button onclick="resetDungThan()">✕ Bỏ chọn</button>
  </div>
</div>
```

#### 2G. Phân Tích Tự Động

```html
<div class="step-card" id="step-5" style="display:none">
  <h3>📊 Phân Tích Tự Động</h3>

  <!-- Vượng/Suy Dụng Thần -->
  <div class="analysis-section">
    <h4>🌡️ Vượng Suy Dụng Thần</h4>
    <div class="vuong-suy-bar">
      <div class="bar-fill" id="vuong-suy-bar"></div>
    </div>
    <div id="vuong-suy-text"></div>
    <ul id="vuong-suy-detail"></ul>
  </div>

  <!-- Nguyên / Kỵ / Cừu Thần -->
  <div class="analysis-section">
    <h4>⚔️ Nguyên — Kỵ — Cừu Thần</h4>
    <div id="nkc-than-list">
      <!-- Render danh sách từng hào với vai trò -->
    </div>
  </div>

  <!-- Phân tích từng hào động -->
  <div class="analysis-section" id="section-dong-hao">
    <h4>💥 Hào Động</h4>
    <div id="dong-hao-analysis">
      <!-- Render phân tích từng hào động -->
    </div>
  </div>

  <!-- Phục Tàng -->
  <div class="analysis-section" id="section-phuc-tang">
    <h4>🕵️ Phục Tàng</h4>
    <div id="phuc-tang-info"></div>
  </div>
</div>

<!-- Cảnh Báo -->
<div class="step-card" id="step-6" style="display:none">
  <h3>⚠️ Cảnh Báo & Nhận Xét</h3>
  <div id="canh-bao-list"></div>
</div>

<!-- Thời Điểm Ứng -->
<div class="step-card" id="step-7" style="display:none">
  <h3>📅 Gợi Ý Thời Điểm Ứng Nghiệm</h3>
  <div id="thoi-diem-ung"></div>
</div>

<!-- Ghi Chú Luận Quẻ -->
<div class="step-card" id="step-8">
  <h3>✍️ Ghi Chú Luận Quẻ</h3>
  <textarea id="ghi-chu" placeholder="Nhập nhận định và luận đoán của bạn tại đây..."></textarea>
  <div class="action-buttons">
    <button onclick="inQue()">🖨️ In quẻ</button>
    <button onclick="luuQue()">💾 Lưu quẻ</button>
    <button onclick="xuatPDF()">📄 Xuất PDF</button>
  </div>
</div>
```

---

### PHẦN 3: LOGIC JAVASCRIPT CHI TIẾT

#### 3A. State Management

```javascript
// Trạng thái ứng dụng — single source of truth
let state = {
  // Thời gian
  canNgay: null,
  chiNgay: null,
  chiThang: null,
  tuanKhong: [],

  // Kết quả gieo
  haoScores: [null, null, null, null, null, null], // hào 1-6
  haoDong: [],      // mảng index hào động (0-5)
  bienHao: [],      // mảng DC biến hào (null nếu không động)

  // Quẻ đã xác định
  banQue: null,     // object từ QUE_64
  chiQue: null,     // object từ QUE_64
  cungHanh: null,

  // 6 hào chi tiết (sau khi an quẻ)
  hao6: [],         // Array[6] mỗi phần tử: { viTri, diaChi, lucThan, lucThanTen, laTuanKhong, laNhapMo, laDong, bienHao, vuongSuy }

  // Dụng Thần
  dungThanHao: null,   // index 0-5
  dungThanLucThan: null,

  // Kết quả phân tích
  phanTich: null
};
```

#### 3B. Hàm An Quẻ Chính

```javascript
function anQue() {
  // 1. Xác định Bản quái từ 6 hào
  const noi = xacDinhQuai(state.haoScores[0], state.haoScores[1], state.haoScores[2]);
  const ngoai = xacDinhQuai(state.haoScores[3], state.haoScores[4], state.haoScores[5]);

  // 2. Tìm quẻ trong QUE_64
  state.banQue = timQue(noi, ngoai);
  state.cungHanh = CUNG_HANH[state.banQue.cung];

  // 3. Xác định hào động và biến hào
  state.haoDong = [];
  state.bienHao = state.banQue.dia_chi.map((dc, i) => {
    const score = state.haoScores[i];
    if (score === 6 || score === 9) {
      state.haoDong.push(i);
      // Biến hào: âm động → dương (ngược lại), địa chi sẽ thay đổi
      return bienDiaChi(dc, score, state.banQue.cung, i);
    }
    return null;
  });

  // 4. Xác định Chi quái từ biến hào
  const bienNoi = xacDinhBienQuai(state.banQue, state.haoDong, 'noi');
  const bienNgoai = xacDinhBienQuai(state.banQue, state.haoDong, 'ngoai');
  state.chiQue = timQue(bienNoi, bienNgoai);

  // 5. An 6 hào đầy đủ
  state.hao6 = state.banQue.dia_chi.map((dc, i) => {
    const lucThan = tinhLucThan(state.cungHanh, dc);
    const lucThanTen = tinhLucThanTenByIndex(state.canNgay, i);
    return {
      viTri: i + 1,
      diaChi: dc,
      lucThan,
      lucThanTen,
      laTuanKhong: state.tuanKhong.includes(dc),
      laNhapMo: checkNhapMo(dc, state.chiNgay, state.chiThang),
      laDong: state.haoDong.includes(i),
      bienHao: state.bienHao[i],
      vuongSuy: phanTichVuongSuy(dc, state.chiThang, state.chiNgay)
    };
  });

  // 6. Render bảng quẻ
  renderBangQue();
}
```

#### 3C. Hàm Tính Lục Thân

```javascript
function tinhLucThan(cungHanh, diaChi) {
  const haoHanh = DC_HANH[diaChi];
  if (haoHanh === cungHanh) return 'Huynh Đệ';
  if (NGU_HANH_SINH[cungHanh] === haoHanh) return 'Tử Tôn';
  if (NGU_HANH_KHAC[cungHanh] === haoHanh) return 'Thê Tài';
  if (NGU_HANH_KHAC[haoHanh] === cungHanh) return 'Quan Quỷ';
  if (NGU_HANH_SINH[haoHanh] === cungHanh) return 'Phụ Mẫu';
}
```

#### 3D. Hàm Render Bảng Quẻ

```javascript
function renderBangQue() {
  const tbody = document.getElementById('tbody-que');
  tbody.innerHTML = '';

  // Render từ hào 6 xuống hào 1 (hiển thị từ trên xuống)
  for (let i = 5; i >= 0; i--) {
    const hao = state.hao6[i];
    const isThe = (i + 1) === state.banQue.the_hao;
    const isUng = (i + 1) === state.banQue.ung_hao;

    const row = document.createElement('tr');
    row.className = [
      isThe ? 'row-the' : '',
      isUng ? 'row-ung' : '',
      hao.laDong ? 'row-dong' : '',
      hao.laTuanKhong ? 'row-tuan-khong' : '',
      hao.laNhapMo ? 'row-nhap-mo' : ''
    ].join(' ');

    row.innerHTML = `
      <td>
        Hào ${hao.viTri}
        ${isThe ? '<span class="badge-the">Thế</span>' : ''}
        ${isUng ? '<span class="badge-ung">Ứng</span>' : ''}
      </td>
      <td class="luc-than-ten">${hao.lucThanTen}</td>
      <td class="luc-than ${getLucThanClass(hao.lucThan)}">${hao.lucThan}</td>
      <td class="dia-chi">
        ${hao.diaChi} ${DC_HANH[hao.diaChi]}
        ${hao.laTuanKhong ? '<span class="badge-tk">TK</span>' : ''}
        ${hao.laNhapMo ? '<span class="badge-mo">Mộ</span>' : ''}
      </td>
      <td class="hao-symbol">${renderHaoSymbol(state.haoScores[i])}</td>
      <td class="hao-symbol">
        ${hao.bienHao ? hao.bienHao : '—'}
      </td>
      <td class="ghi-chu">
        <span class="vuong-suy ${hao.vuongSuy.mucDo}">${hao.vuongSuy.mucDo}</span>
        ${hao.laDong ? '<span class="dong-badge">●Động</span>' : ''}
        ${hao.bienHao ? renderHoiDau(hao.diaChi, hao.bienHao) : ''}
      </td>
    `;

    // Click để chọn làm Dụng Thần
    row.style.cursor = 'pointer';
    row.onclick = () => chonDungThan(i);

    tbody.appendChild(row);
  }

  // Thêm đường phân cách nội/ngoại quái (giữa hào 3 và 4)
  // (Thực hiện bằng CSS border-top trên row hào 4)

  document.getElementById('step-3').style.display = 'block';
}
```

#### 3E. Hàm Phân Tích Sau Khi Chọn Dụng Thần

```javascript
function chonDungThan(haoIndex) {
  state.dungThanHao = haoIndex;
  const dungThan = state.hao6[haoIndex];
  state.dungThanLucThan = dungThan.lucThan;
  const dungThanHanh = DC_HANH[dungThan.diaChi];

  // Phân loại từng hào thành Nguyên/Kỵ/Cừu Thần
  const nguyenThanHanh = nguocSinhHanh(dungThanHanh); // hành sinh DT
  const phantich = {
    dungThan: dungThan,
    vuongSuy: phanTichVuongSuy(dungThan.diaChi, state.chiThang, state.chiNgay),
    haoVaiTro: state.hao6.map((hao, i) => {
      if (i === haoIndex) return { ...hao, vaiTro: 'Dụng Thần', mau: 'red' };
      const haoHanh = DC_HANH[hao.diaChi];
      if (NGU_HANH_SINH[haoHanh] === dungThanHanh) return { ...hao, vaiTro: 'Nguyên Thần', mau: 'green' };
      if (NGU_HANH_KHAC[haoHanh] === dungThanHanh) return { ...hao, vaiTro: 'Kỵ Thần', mau: 'red' };
      if (NGU_HANH_KHAC[haoHanh] === nguyenThanHanh) return { ...hao, vaiTro: 'Cừu Thần', mau: 'orange' };
      return { ...hao, vaiTro: null, mau: null };
    }),
    canhBao: [],
    thoiDiem: []
  };

  // Kiểm tra cảnh báo
  if (dungThan.laTuanKhong) {
    phantich.canhBao.push({
      icon: '⚠️', level: 'warning',
      text: 'Dụng Thần trong Tuần Không — Sự việc chưa có thực chất, chờ xuất Tuần Không'
    });
  }
  if (dungThan.laNhapMo) {
    phantich.canhBao.push({
      icon: '🔒', level: 'danger',
      text: `Dụng Thần Nhập Mộ (${NHAP_MO[dungThanHanh]}) — Cần ngày ${LUC_XUNG[NHAP_MO[dungThanHanh]]} xung khai mộ`
    });
  }

  // Kiểm tra Kỵ Thần vượng/suy
  phantich.haoVaiTro.forEach(h => {
    if (h.vaiTro === 'Kỵ Thần') {
      if (h.laTuanKhong) {
        phantich.canhBao.push({ icon: '✅', level: 'success', text: `Kỵ Thần (${h.diaChi}) trong Tuần Không — Vô lực, không hại được Dụng Thần` });
      } else if (h.laDong && h.vuongSuy.mucDo.includes('Vượng')) {
        phantich.canhBao.push({ icon: '⚡', level: 'danger', text: `Kỵ Thần (${h.diaChi}) vượng và đang động — Nguy hiểm lớn!` });
      }
    }
    if (h.vaiTro && h.laDong && h.bienHao) {
      const hoiDau = kiemTraHoiDau(h.diaChi, h.bienHao);
      if (hoiDau?.loai === 'Hồi đầu khắc') {
        phantich.canhBao.push({ icon: '❌', level: 'danger', text: `Hào ${h.viTri} Hồi Đầu Khắc — Tự hủy hoại` });
      }
    }
  });

  // Kiểm tra Phụ Mẫu phục tàng
  const phuMauTonTai = state.hao6.some(h => h.lucThan === 'Phụ Mẫu');
  if (!phuMauTonTai) {
    phantich.canhBao.push({
      icon: '📵', level: 'warning',
      text: 'Phụ Mẫu Phục Tàng — Tin tức không thông, liên lạc bị cắt đứt'
    });
  }

  // Gợi ý thời điểm
  phantich.thoiDiem = duDoanThoiDiem(
    dungThan.diaChi, state.chiThang, state.chiNgay, state.tuanKhong
  );

  state.phanTich = phantich;

  // Render kết quả
  renderPhanTich(phantich);

  // Highlight hào trong bảng
  highlightBangQue(phantich.haoVaiTro);
}
```

#### 3F. Hàm Render Phân Tích

```javascript
function renderPhanTich(pt) {
  // Render vượng suy
  renderVuongSuy(pt.vuongSuy);

  // Render Nguyên/Kỵ/Cừu Thần
  renderNKCThan(pt.haoVaiTro);

  // Render cảnh báo
  const canhBaoEl = document.getElementById('canh-bao-list');
  canhBaoEl.innerHTML = pt.canhBao.map(cb => `
    <div class="canh-bao-item ${cb.level}">
      <span class="icon">${cb.icon}</span>
      <span>${cb.text}</span>
    </div>
  `).join('');

  // Render thời điểm
  const thoiDiemEl = document.getElementById('thoi-diem-ung');
  thoiDiemEl.innerHTML = pt.thoiDiem.map(td => `
    <div class="thoi-diem-item">
      <div class="ly-do">📍 ${td.ly_do}</div>
      <div class="thoi-diem"><strong>⏰ ${td.thoi_diem}</strong></div>
      <div class="ghi-chu-td">💡 ${td.ghi_chu}</div>
    </div>
  `).join('');

  // Hiện các panels
  ['step-5','step-6','step-7'].forEach(id => {
    document.getElementById(id).style.display = 'block';
  });
}
```

---

### PHẦN 4: CSS STYLING

```css
/* === RESET & BASE === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Nunito', sans-serif;
  background: #0d1117;
  color: #e6d5b8;
  min-height: 100vh;
}

/* === MÀNG NỀN VŨ TRỤ === */
body::before {
  content: '';
  position: fixed; inset: 0;
  background: radial-gradient(ellipse at top, #1a1f35 0%, #0d1117 70%);
  z-index: -1;
}

/* === HEADER === */
header {
  text-align: center;
  padding: 2rem;
  border-bottom: 1px solid #c9a84c33;
}
header h1 {
  font-family: 'Noto Serif SC', serif;
  font-size: 2.5rem;
  color: #c9a84c;
  text-shadow: 0 0 20px #c9a84c44;
  letter-spacing: 0.1em;
}

/* === LAYOUT === */
.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}
@media (max-width: 900px) {
  .container { grid-template-columns: 1fr; }
}

/* === CARDS === */
.step-card {
  background: #161b2e;
  border: 1px solid #c9a84c44;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: border-color 0.3s;
}
.step-card:hover { border-color: #c9a84c88; }
.step-card h3 {
  color: #c9a84c;
  font-family: 'Noto Serif SC', serif;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  border-bottom: 1px solid #c9a84c33;
  padding-bottom: 0.5rem;
}

/* === BẢNG QUẺ === */
.bang-que {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
.bang-que th {
  background: #1e2a4a;
  color: #c9a84c;
  padding: 0.5rem;
  text-align: center;
  border: 1px solid #c9a84c33;
  font-weight: 600;
}
.bang-que td {
  padding: 0.5rem;
  border: 1px solid #2a3a5a;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s;
}
.bang-que tr:hover td { background: #1e2a4a; }

/* Phân cách nội/ngoại quái */
.bang-que tr.noi-ngoai-border td { border-top: 2px dashed #c9a84c; }

/* Màu hào đặc biệt */
.bang-que tr.row-the td { background: #2a1f00; }
.bang-que tr.row-ung td { background: #00112a; }
.bang-que tr.row-dong td { font-weight: bold; }
.bang-que tr.row-tuan-khong td { opacity: 0.6; }
.bang-que tr.row-nhap-mo td { border-left: 3px solid #8b4513; }

/* Lục Thân màu */
.luc-than.thu-ton { color: #4caf50; }
.luc-than.the-tai { color: #ffd700; }
.luc-than.quan-quy { color: #ff6b6b; }
.luc-than.phu-mau { color: #87ceeb; }
.luc-than.huynh-de { color: #dda0dd; }

/* Hào symbol */
.hao-symbol { font-family: monospace; font-size: 1.1rem; letter-spacing: 2px; }
.hao-duong { color: #ffd700; }
.hao-am { color: #aaaaaa; }
.hao-dong-badge { color: #ff6b6b; font-size: 0.7rem; }

/* === BADGE === */
.badge-the {
  background: #c9a84c; color: #000;
  border-radius: 4px; padding: 1px 5px;
  font-size: 0.65rem; margin-left: 4px;
}
.badge-ung {
  background: #4488cc; color: #fff;
  border-radius: 4px; padding: 1px 5px;
  font-size: 0.65rem; margin-left: 4px;
}
.badge-tk {
  background: #555; color: #ccc;
  border-radius: 4px; padding: 1px 4px;
  font-size: 0.65rem;
}
.badge-mo {
  background: #8b4513; color: #fff;
  border-radius: 4px; padding: 1px 4px;
  font-size: 0.65rem;
}

/* === VƯỢNG SUY === */
.vuong-suy { padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: bold; }
.vuong-suy.Cực\ vượng { background: #ff6b0033; color: #ff9944; border: 1px solid #ff6b00; }
.vuong-suy.Vượng      { background: #4caf5033; color: #4caf50; border: 1px solid #4caf50; }
.vuong-suy.Bình\ hòa  { background: #ffffff11; color: #aaaaaa; border: 1px solid #555; }
.vuong-suy.Suy        { background: #ff000033; color: #ff6666; border: 1px solid #cc0000; }
.vuong-suy.Cực\ suy   { background: #880000; color: #ff9999; border: 1px solid #ff0000; }

/* === CẢNH BÁO === */
.canh-bao-item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.75rem; border-radius: 8px;
  margin-bottom: 0.5rem;
}
.canh-bao-item.danger  { background: #2a0000; border-left: 3px solid #ff4444; }
.canh-bao-item.warning { background: #2a1500; border-left: 3px solid #ff8800; }
.canh-bao-item.success { background: #002a00; border-left: 3px solid #44ff44; }

/* === THỜI ĐIỂM === */
.thoi-diem-item {
  background: #1a1a2e;
  border: 1px solid #4466cc44;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
}
.thoi-diem-item .ly-do { color: #aaaaaa; font-size: 0.85rem; }
.thoi-diem-item .thoi-diem { color: #c9a84c; font-size: 1rem; margin: 0.25rem 0; }
.thoi-diem-item .ghi-chu-td { color: #88aacc; font-size: 0.82rem; }

/* === BUTTONS === */
.btn-primary {
  background: linear-gradient(135deg, #c9a84c, #a07830);
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  transition: all 0.2s;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 15px #c9a84c44; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.score-btn {
  background: #1e2a4a;
  color: #e6d5b8;
  border: 1px solid #c9a84c44;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 0.85rem;
}
.score-btn:hover { background: #2a3a5a; border-color: #c9a84c; }
.score-btn.selected { background: #c9a84c; color: #000; border-color: #c9a84c; }

/* === TEXTAREA GHI CHÚ === */
textarea#ghi-chu {
  width: 100%;
  min-height: 200px;
  background: #0d1117;
  border: 1px solid #c9a84c44;
  border-radius: 8px;
  color: #e6d5b8;
  padding: 1rem;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  line-height: 1.6;
}
textarea#ghi-chu:focus {
  outline: none;
  border-color: #c9a84c;
}

/* === AUTO RESULT === */
.auto-result {
  display: flex; flex-wrap: wrap; gap: 1rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #0d1117;
  border-radius: 8px;
  border: 1px solid #c9a84c22;
}
.auto-result span { color: #aaaaaa; font-size: 0.9rem; }
.auto-result strong { color: #c9a84c; }
```

---

### PHẦN 5: TÍNH NĂNG NÂNG CAO

#### 5A. Chuyển Đổi Dương/Âm Lịch
```javascript
// Dùng thư viện: https://cdn.jsdelivr.net/npm/lunar-javascript/lunar.js
// <script src="https://cdn.jsdelivr.net/npm/lunar-javascript/lunar.js"></script>

function convertToAmLich() {
  const date = document.getElementById('duong-lich').value;
  if (!date) return;
  const [y, m, d] = date.split('-').map(Number);
  const lunar = Lunar.fromDate(new Date(y, m-1, d));
  // Lấy Can Chi ngày, tháng
  const canNgay = lunar.getDayInGanZhi(); // "Đinh Mùi"
  // Set vào các select boxes
}
```

#### 5B. Lưu Lịch Sử Quẻ
```javascript
function luuQue() {
  const history = JSON.parse(localStorage.getItem('lucHaoHistory') || '[]');
  history.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    state: JSON.parse(JSON.stringify(state)),
    ghiChu: document.getElementById('ghi-chu').value
  });
  localStorage.setItem('lucHaoHistory', JSON.stringify(history.slice(0, 50)));
  alert('Đã lưu quẻ!');
}
```

#### 5C. In Quẻ
```javascript
function inQue() {
  window.print();
}
// CSS print media query để format đẹp khi in
```

---

## 🎨 HƯỚNG DẪN THIẾT KẾ VISUAL

### Palette màu
| Vai trò | Màu HEX |
|---------|---------|
| Background chính | #0d1117 |
| Background card | #161b2e |
| Accent vàng gold | #c9a84c |
| Text chính | #e6d5b8 |
| Text phụ | #aaaaaa |
| Thế hào | #c9a84c (vàng) |
| Ứng hào | #4488cc (xanh) |
| Dụng Thần | #ff4444 (đỏ) |
| Nguyên Thần | #44bb44 (xanh lá) |
| Kỵ Thần | #ff6666 (đỏ nhạt) |
| Cừu Thần | #ff8800 (cam) |
| Hào Động | #ffcc00 (vàng sáng) |
| Tuần Không | #555555 (xám) |
| Nhập Mộ | #8b4513 (nâu đỏ) |

### Font
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
```

---

## 📝 CHECKLIST TRIỂN KHAI

### Giai Đoạn 1 — MVP (Ưu tiên cao)
- [ ] Nhập Can Chi ngày/tháng thủ công
- [ ] Nhập 6 kết quả gieo xu
- [ ] Tự động nhận dạng Bản quái + Chi quái
- [ ] An Lục Thân, Lục Thần, Địa Chi
- [ ] Hiển thị Thế/Ứng, Tuần Không, Nhập Mộ, Hào Động
- [ ] Chọn Dụng Thần bằng click
- [ ] Tính vượng suy Dụng Thần
- [ ] Xác định Nguyên/Kỵ/Cừu Thần
- [ ] Hiển thị cảnh báo tự động
- [ ] Gợi ý thời điểm ứng nghiệm
- [ ] Khu vực ghi chú

### Giai Đoạn 2 — Enhancement
- [ ] Chuyển đổi dương/âm lịch tự động
- [ ] Lưu lịch sử quẻ (LocalStorage)
- [ ] Chức năng in/xuất PDF
- [ ] Dark/Light mode toggle
- [ ] Responsive mobile

### Giai Đoạn 3 — Advanced
- [ ] Phân tích Phục Tàng tự động
- [ ] Phát hiện Phản Ngâm/Phục Ngâm
- [ ] Phân tích Tam Hợp cục
- [ ] Lịch tra cứu Can Chi
- [ ] Bộ nhớ cache cho bảng 64 quẻ
