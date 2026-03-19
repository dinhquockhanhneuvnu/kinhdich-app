// ==========================================
// LOGIC CHÍNH - LỤC HÀO KINH DỊCH
// ==========================================

let state = {
  canNgay: null, chiNgay: null, canThang: null, chiThang: null,
  tuanKhong: [], haoScores: [null,null,null,null,null,null],
  haoDong: [], banQue: null, chiQue: null, cungHanh: null,
  hao6: [], dungThanHao: null, dungThanLucThan: null, phanTich: null
};

// === INIT ===
function init() {
  const selects = ['thang-can','ngay-can'];
  selects.forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = '<option value="">—</option>' + CAN_LIST.map(c => `<option value="${c}">${c}</option>`).join('');
  });
  ['thang-chi','ngay-chi'].forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = '<option value="">—</option>' + DC_LIST.map(c => `<option value="${c}">${c}</option>`).join('');
  });
  // Default date = today
  const today = new Date();
  document.getElementById('duong-lich').value = today.toISOString().split('T')[0];
  renderHaoInputs();
  // Auto-update on select change
  ['thang-can','thang-chi','ngay-can','ngay-chi'].forEach(id => {
    document.getElementById(id).addEventListener('change', updateStep1);
  });
}

// Trạng thái 3 xu cho mỗi hào (2=sấp, 3=ngửa)
let coinStates = {};
for (let h = 1; h <= 6; h++) coinStates[h] = [2, 2, 2];

function renderHaoInputs() {
  const container = document.getElementById('hao-inputs');
  let html = '';
  for (let h = 6; h >= 1; h--) {
    const label = h === 6 ? 'Thượng' : h === 5 ? 'Ngũ' : h === 4 ? 'Tứ' : h === 3 ? 'Tam' : h === 2 ? 'Nhị' : 'Sơ';
    const total = 6; // Mặc định 3 sấp = 6
    state.haoScores[h - 1] = total;
    const info = getScoreInfo(total);

    html += `<div class="hao-row selected" id="hao-row-${h}">
      <label>Hào ${h}<br><small>(${label})</small></label>
      <div class="coin-group">
        <div class="coin" id="coin-${h}-0" onclick="toggleCoin(${h},0,this)" title="Click để lật xu"></div>
        <div class="coin" id="coin-${h}-1" onclick="toggleCoin(${h},1,this)" title="Click để lật xu"></div>
        <div class="coin" id="coin-${h}-2" onclick="toggleCoin(${h},2,this)" title="Click để lật xu"></div>
      </div>
      <div class="hao-result" id="result-${h}">
        <span class="result-score">${total}</span>
        <span class="result-symbol">${info.symbol}</span>
        <span class="result-label">${info.label}</span>
      </div>
    </div>`;
  }
  container.innerHTML = html;
  
  // Bật nút An Quẻ luôn vì hào đã full (có kết quả sấp hết 6 hào = Thuần Khôn)
  document.getElementById('btn-anque').disabled = false;
}

function toggleCoin(hao, idx, el) {
  // Toggle: 2 (sấp) <-> 3 (ngửa)
  const current = coinStates[hao][idx];
  const next = current === 2 ? 3 : 2;
  coinStates[hao][idx] = next;

  // Flip animation
  el.classList.add('flipping');
  setTimeout(() => el.classList.remove('flipping'), 300);

  // Update visual
  if (next === 3) {
    el.classList.add('ngua');
  } else {
    el.classList.remove('ngua');
  }

  // Calculate new score
  const coins = coinStates[hao];
  const total = coins[0] + coins[1] + coins[2]; 
  state.haoScores[hao - 1] = total;
  
  const info = getScoreInfo(total);
  const resultEl = document.getElementById(`result-${hao}`);
  resultEl.innerHTML = `
    <span class="result-score">${total}</span>
    <span class="result-symbol">${info.symbol}</span>
    <span class="result-label">${info.label}</span>
  `;

  // Highlight row if dong
  const row = document.getElementById(`hao-row-${hao}`);
  if (total === 6 || total === 9) {
    row.classList.add('selected');
  } else {
    row.classList.remove('selected');
  }
}

function getScoreInfo(total) {
  switch(total) {
    case 6: return { symbol: '━━ ━━ ✕', label: 'Âm động', color: '#ff6b6b' };
    case 7: return { symbol: '━━━━━', label: 'Dương tĩnh', color: '#ffd700' };
    case 8: return { symbol: '━━ ━━', label: 'Âm tĩnh', color: '#aaa' };
    case 9: return { symbol: '━━━━━ ○', label: 'Dương động', color: '#ff6b6b' };
    default: return { symbol: '—', label: '', color: '#555' };
  }
}

// === BƯỚC 1: THỜI GIAN ===
function convertToAmLich() {
  const dateStr = document.getElementById('duong-lich').value;
  if (!dateStr) return;
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const solar = Solar.fromYmd(y, m, d);
    const lunar = solar.getLunar();
    const canNgay = lunar.getDayGan();
    const chiNgay = lunar.getDayZhi();
    const canThang = lunar.getMonthGan();
    const chiThang = lunar.getMonthZhi();
    // Map Chinese to Vietnamese
    const ganMap = {'甲':'Giáp','乙':'Ất','丙':'Bính','丁':'Đinh','戊':'Mậu','己':'Kỷ','庚':'Canh','辛':'Tân','壬':'Nhâm','癸':'Quý'};
    const zhiMap = {'子':'Tý','丑':'Sửu','寅':'Dần','卯':'Mão','辰':'Thìn','巳':'Tị','午':'Ngọ','未':'Mùi','申':'Thân','酉':'Dậu','戌':'Tuất','亥':'Hợi'};
    const cn = ganMap[canNgay] || canNgay;
    const chn = zhiMap[chiNgay] || chiNgay;
    const ct = ganMap[canThang] || canThang;
    const cht = zhiMap[chiThang] || chiThang;
    document.getElementById('ngay-can').value = cn;
    document.getElementById('ngay-chi').value = chn;
    document.getElementById('thang-can').value = ct;
    document.getElementById('thang-chi').value = cht;
    updateStep1();
  } catch (e) {
    console.error('Lỗi chuyển đổi âm lịch:', e);
    alert('Không thể chuyển đổi. Vui lòng nhập Can Chi thủ công.');
  }
}

function updateStep1() {
  const canThang = document.getElementById('thang-can').value;
  const chiThang = document.getElementById('thang-chi').value;
  const canNgay = document.getElementById('ngay-can').value;
  const chiNgay = document.getElementById('ngay-chi').value;
  if (canThang && chiThang) {
    state.canThang = canThang; state.chiThang = chiThang;
    document.getElementById('nguyet-kien').textContent = canThang + ' ' + chiThang;
  }
  if (canNgay && chiNgay) {
    state.canNgay = canNgay; state.chiNgay = chiNgay;
    document.getElementById('nhat-than').textContent = canNgay + ' ' + chiNgay;
    state.tuanKhong = getTuanKhongFromCanChi(canNgay, chiNgay);
    document.getElementById('tuan-khong').textContent = state.tuanKhong.length ? state.tuanKhong.join(', ') : '—';
    const ltStart = LUC_THAN_START[canNgay];
    if (ltStart !== undefined) {
      document.getElementById('luc-than-start').textContent = LUC_THAN_ORDER[ltStart];
    }
  }
}

// === BƯỚC 2-3: AN QUẺ ===
function scoreToYinYang(score) {
  return (score === 7 || score === 9) ? 1 : 0; // 1=dương, 0=âm
}
function isDong(score) { return score === 6 || score === 9; }

function xacDinhQuai(s1, s2, s3) {
  const key = '' + scoreToYinYang(s1) + scoreToYinYang(s2) + scoreToYinYang(s3);
  return QUAI_MAP[key];
}

function timQue(noi, ngoai) {
  return QUE_64.find(q => q.noi_quat === noi && q.ngoai_quat === ngoai);
}

function anQue() {
  if (!state.canNgay || !state.chiNgay || !state.chiThang) {
    alert('Vui lòng nhập thông tin thời gian (Bước 1) trước!');
    return;
  }
  // 1. Xác định quái
  const noi = xacDinhQuai(state.haoScores[0], state.haoScores[1], state.haoScores[2]);
  const ngoai = xacDinhQuai(state.haoScores[3], state.haoScores[4], state.haoScores[5]);
  state.banQue = timQue(noi, ngoai);
  if (!state.banQue) { alert('Không tìm thấy quẻ! Vui lòng kiểm tra lại.'); return; }
  state.cungHanh = CUNG_HANH[state.banQue.cung];

  // 2. Hào động & biến hào
  state.haoDong = [];
  const bienScores = state.haoScores.map((s, i) => {
    if (isDong(s)) {
      state.haoDong.push(i);
      return s === 6 ? 7 : 8; // âm động→dương, dương động→âm
    }
    return s;
  });

  // 3. Chi quái
  const bienNoi = xacDinhQuai(bienScores[0], bienScores[1], bienScores[2]);
  const bienNgoai = xacDinhQuai(bienScores[3], bienScores[4], bienScores[5]);
  state.chiQue = timQue(bienNoi, bienNgoai);

  // 4. Lục Thần
  const lucThanArr = tinhLucThanArr(state.canNgay);

  // 5. An 6 hào
  state.hao6 = state.banQue.dia_chi.map((dc, i) => {
    const lucThan = tinhLucThan(state.cungHanh, dc);
    const haoHanh = DC_HANH[dc];
    const moAddr = NHAP_MO[haoHanh];
    const nhapMo = (state.chiNgay === moAddr) || (state.chiThang === moAddr);
    let bienDC = null, bienHanh = null, bienLucThan = null, bienScore = null;
    if (state.haoDong.includes(i) && state.chiQue) {
      bienDC = state.chiQue.dia_chi[i];
      bienHanh = DC_HANH[bienDC];
      bienLucThan = tinhLucThan(state.cungHanh, bienDC);
      bienScore = state.haoScores[i] === 6 ? 7 : 8;
    }
    return {
      viTri: i + 1, diaChi: dc, hanh: haoHanh,
      lucThan, lucThanTen: lucThanArr[i],
      laTuanKhong: state.tuanKhong.includes(dc),
      laNhapMo: nhapMo,
      laDong: state.haoDong.includes(i),
      bienDC, bienHanh, bienLucThan, bienScore,
      vuongSuy: null, // Sẽ được tính lại trong Sweep 2-pass
      laTienThan: false,
      laThoaiThan: false,
    };
  });

  // 6. Tìm Phục Thần (nếu thiếu Lục Thân)
  const lucThanCoMat = state.hao6.map(h => h.lucThan);
  const tatCaLucThan = ['Thê Tài', 'Quan Quỷ', 'Tử Tôn', 'Phụ Mẫu', 'Huynh Đệ'];
  const lucThanThieu = tatCaLucThan.filter(lt => !lucThanCoMat.includes(lt));

  if (lucThanThieu.length > 0) {
    const batThuanQuai = timQue(state.banQue.cung, state.banQue.cung);
    lucThanThieu.forEach(ltThieu => {
      const lineIdx = batThuanQuai.dia_chi.findIndex(dcBT => tinhLucThan(state.cungHanh, dcBT) === ltThieu);
      if (lineIdx >= 0) {
        const dcPhuc = batThuanQuai.dia_chi[lineIdx];
        state.hao6[lineIdx].phucThan = {
          lucThan: ltThieu,
          diaChi: dcPhuc,
          hanh: DC_HANH[dcPhuc]
        };
      }
    });
  }

  // 7. Phân Tích Vượng Suy (2-Pass Sweep)
  // PASS 1: Base Strength (Nhật / Nguyệt)
  state.hao6.forEach(hao => {
    hao.diemVS = 0;
    hao.nhanXetVS = [];
    hao.laAmDong = false;
    const hh = hao.hanh;
    const nk = state.chiThang; const nh = DC_HANH[nk];
    const nt = state.chiNgay;  const nth = DC_HANH[nt];

    // NGUYỆT KIẾN
    if (nk === hao.diaChi) { hao.diemVS += 3; hao.nhanXetVS.push('Nguyệt Kiến (Cực vượng)'); }
    else if (LUC_XUNG[nk] === hao.diaChi) { hao.diemVS -= 2; hao.nhanXetVS.push('Nguyệt Phá (Xung vỡ)'); }
    else if (LUC_HOP[nk] === hao.diaChi) { hao.diemVS += 2; hao.nhanXetVS.push('Nguyệt Hợp'); }
    else if (NGU_HANH_SINH[nh] === hh) { hao.diemVS += 2; hao.nhanXetVS.push('Nguyệt Sinh'); }
    else if (nh === hh) { hao.diemVS += 3; hao.nhanXetVS.push('Nguyệt Vượng (Tỷ hòa)'); }
    else if (NGU_HANH_KHAC[nh] === hh) { hao.diemVS -= 2; hao.nhanXetVS.push('Nguyệt Khắc'); }

    // NHẬT THẦN
    if (nt === hao.diaChi) { hao.diemVS += 3; hao.nhanXetVS.push('Nhật Kiến (Cực vượng)'); }
    else if (LUC_XUNG[nt] === hao.diaChi) {
      if (hao.diemVS >= 1 && !hao.laDong) {
        hao.diemVS += 1.5; hao.nhanXetVS.push('Ám Động (Nhật Xung Hào Vượng)');
        hao.laAmDong = true;
      } else {
        hao.diemVS -= 2; hao.nhanXetVS.push('Nhật Phá (Nhật Xung Hào Suy)');
      }
    }
    else if (LUC_HOP[nt] === hao.diaChi) { hao.diemVS += 2; hao.nhanXetVS.push('Nhật Hợp'); }
    else if (NGU_HANH_SINH[nth] === hh) { hao.diemVS += 2; hao.nhanXetVS.push('Nhật Sinh'); }
    else if (nth === hh) { hao.diemVS += 3; hao.nhanXetVS.push('Nhật Vượng (Tỷ hòa)'); }
    else if (NGU_HANH_KHAC[nth] === hh) { hao.diemVS -= 2; hao.nhanXetVS.push('Nhật Khắc'); }

    // Xử lý TUẦN KHÔNG & NHẬP MỘ sau khi có điểm nền
    if (hao.laTuanKhong) {
      if (hao.diemVS < 1) { hao.diemVS -= 2; hao.nhanXetVS.push('Tuần Không (Chân Không - Vô lực)'); }
      else { hao.nhanXetVS.push('Tuần Không (Giả Không - Chờ ứng kỳ)'); }
    }
    if (hao.laNhapMo) {
      if (hao.diemVS < 1) { hao.diemVS -= 2; hao.nhanXetVS.push('Nhập Mộ (Suy Mộ - Bế tắc)'); }
      else { hao.nhanXetVS.push('Nhập Mộ (Vượng Mộ - Kho tàng)'); }
    }
  });

  // PASS 1.5: Hóa Hồi Đầu & Tiến/Thoái/Ngâm - Hào biến tác động lại chính nó
  state.hao6.forEach(hao => {
    if (hao.laDong && hao.bienDC) {
      if (hao.diaChi === hao.bienDC) {
        hao.diemVS -= 1; hao.nhanXetVS.push('Hóa Phục Ngâm (-1 lực)');
      } else if (TIEN_THAN[hao.diaChi] === hao.bienDC) {
        hao.diemVS += 2; hao.nhanXetVS.push('Hóa Tiến Thần (+2 lực)');
        hao.laTienThan = true;
      } else if (THOAI_THAN[hao.diaChi] === hao.bienDC) {
        hao.diemVS -= 2; hao.nhanXetVS.push('Hóa Thoái Thần (-2 lực, vô hiệu)');
        hao.laThoaiThan = true;
      } else {
        const bienHanh = DC_HANH[hao.bienDC];
        if (NGU_HANH_SINH[bienHanh] === hao.hanh) {
          hao.diemVS += 2; hao.nhanXetVS.push(`Hóa Hồi Đầu Sinh (${hao.bienDC} sinh)`);
        } else if (NGU_HANH_KHAC[bienHanh] === hao.hanh) {
          hao.diemVS -= 2; hao.nhanXetVS.push(`Hóa Hồi Đầu Khắc (${hao.bienDC} khắc)`);
        } else if (LUC_XUNG[hao.bienDC] === hao.diaChi) {
          hao.diemVS -= 2; hao.nhanXetVS.push('Hóa Quái Lục Xung (Phản Ngâm)');
        } else if (LUC_HOP[hao.bienDC] === hao.diaChi) {
          hao.diemVS += 1.5; hao.nhanXetVS.push('Hóa Quái Lục Hợp');
        }
      }
    }
  });

  // PASS 2: Tương tác chéo
  const dongVaAmDong = state.hao6.filter(h => h.laDong || h.laAmDong);
  dongVaAmDong.forEach(d => {
    // Vô hiệu hóa tác dụng sinh/khắc của hào nếu thoái thần hoặc suy chân không/suy mộ
    if (d.laThoaiThan) return;
    if (d.laTuanKhong && d.diemVS < 1) return;
    if (d.laNhapMo && d.diemVS < 1) return;

    state.hao6.forEach(hao => {
      if (hao.viTri === d.viTri) return; // Bỏ qua tự thân
      const tStr = d.laAmDong ? 'Ám Động' : 'Động';
      const vTru = d.laAmDong ? 1.0 : 1.5;

      if (NGU_HANH_SINH[d.hanh] === hao.hanh) {
         hao.diemVS += vTru; hao.nhanXetVS.push(`Nhờ Hào ${d.viTri} (${tStr}) sinh`);
         d.diemVS -= (d.laAmDong ? 0.5 : 1); d.nhanXetVS.push(`Tiết khí (Vì sinh hào ${hao.viTri})`);
      } else if (NGU_HANH_KHAC[d.hanh] === hao.hanh) {
         hao.diemVS -= vTru; hao.nhanXetVS.push(`Bị Hào ${d.viTri} (${tStr}) khắc`);
      } else if (LUC_XUNG[d.diaChi] === hao.diaChi) {
         hao.diemVS -= vTru; hao.nhanXetVS.push(`Bị Hào ${d.viTri} (${tStr}) xung`);
      } else if (LUC_HOP[d.diaChi] === hao.diaChi) {
         hao.diemVS += Math.max(vTru - 0.5, 0.5); hao.nhanXetVS.push(`Được Hào ${d.viTri} (${tStr}) hợp`);
      }
    });
  });

  // Gán vuongSuy sau khi xong PASS 2
  state.hao6.forEach(hao => {
    hao.vuongSuy = getMucDoVuongSuy(hao.diemVS, hao.nhanXetVS);
  });

  renderBangQue();
  document.getElementById('step-3').style.display = 'block';
  document.getElementById('step-4').style.display = 'block';
  document.getElementById('step-8').style.display = 'block';
  const placeholder = document.getElementById('center-placeholder');
  if (placeholder) placeholder.style.display = 'none';
  renderDungThanButtons();
}

function tinhLucThan(cungHanh, diaChi) {
  const haoHanh = DC_HANH[diaChi];
  if (haoHanh === cungHanh) return 'Huynh Đệ';
  if (NGU_HANH_SINH[cungHanh] === haoHanh) return 'Tử Tôn';
  if (NGU_HANH_KHAC[cungHanh] === haoHanh) return 'Thê Tài';
  if (NGU_HANH_KHAC[haoHanh] === cungHanh) return 'Quan Quỷ';
  if (NGU_HANH_SINH[haoHanh] === cungHanh) return 'Phụ Mẫu';
  return '—';
}

function tinhLucThanArr(canNgay) {
  const startIdx = LUC_THAN_START[canNgay] || 0;
  return Array.from({length: 6}, (_, i) => LUC_THAN_ORDER[(startIdx + i) % 6]);
}

function getMucDoVuongSuy(diem, nhanXet) {
  let mucDo, cssClass;
  if (diem >= 5) { mucDo = 'Cực vượng'; cssClass = 'vs-cuc-vuong'; }
  else if (diem >= 3) { mucDo = 'Vượng'; cssClass = 'vs-vuong'; }
  else if (diem >= 1) { mucDo = 'Bình hòa'; cssClass = 'vs-binh-hoa'; }
  else if (diem > -2) { mucDo = 'Hơi suy'; cssClass = 'vs-hoi-suy'; }
  else if (diem >= -3) { mucDo = 'Suy'; cssClass = 'vs-suy'; }
  else { mucDo = 'Cực suy'; cssClass = 'vs-cuc-suy'; }

  return { diem, mucDo, cssClass, nhanXet };
}

function renderHaoSymbol(score) {
  if (score === 7) return '<span style="color:#ffd700">━━━━━</span>';
  if (score === 8) return '<span style="color:#aaa">━━ ━━</span>';
  if (score === 9) return '<span style="color:#ffd700">━━━━━</span> <span style="color:#ff6b6b">○</span>';
  if (score === 6) return '<span style="color:#aaa">━━ ━━</span> <span style="color:#ff6b6b">✕</span>';
  return '—';
}

function getLucThanClass(lt) {
  const map = {'Tử Tôn':'lt-tu-ton','Thê Tài':'lt-the-tai','Quan Quỷ':'lt-quan-quy','Phụ Mẫu':'lt-phu-mau','Huynh Đệ':'lt-huynh-de'};
  return map[lt] || '';
}

function renderBangQue() {
  document.getElementById('ban-que-name').textContent = state.banQue.ten;
  document.getElementById('chi-que-name').textContent = state.chiQue ? state.chiQue.ten : '(không biến)';
  document.getElementById('cung-que').textContent = state.banQue.cung;
  document.getElementById('hanh-cung').textContent = state.cungHanh;

  const tbody = document.getElementById('tbody-que');
  tbody.innerHTML = '';
  for (let i = 5; i >= 0; i--) {
    const hao = state.hao6[i];
    const isThe = hao.viTri === state.banQue.the_hao;
    const isUng = hao.viTri === state.banQue.ung_hao;
    const row = document.createElement('tr');
    const classes = [];
    if (isThe) classes.push('row-the');
    if (isUng) classes.push('row-ung');
    if (hao.laDong) classes.push('row-dong');
    if (hao.laTuanKhong) classes.push('row-tuan-khong');
    if (hao.laNhapMo) classes.push('row-nhap-mo');
    if (i === 3) classes.push('noi-ngoai-border');
    row.className = classes.join(' ');
    row.dataset.haoIdx = i;

    const theUng = isThe ? 'Thế' : (isUng ? 'Ứng' : '');
    const theUngHtml = theUng ? `<span class="badge ${isThe ? 'bdg-the' : 'bdg-ung'}">${theUng}</span> ` : '';
    
    // Phục thần HTML
    const phucThanHtml = hao.phucThan ? `<div style="margin-top:6px; font-size:0.85rem; padding:4px; border:1px dashed #c9a84c; border-radius:4px; background:#111">
      <span style="color:#c9a84c; font-size:0.75rem">Phục Thần</span><br>
      <span class="${getLucThanClass(hao.phucThan.lucThan)}" style="font-weight:bold">${hao.phucThan.lucThan}</span><br>
      <span style="color:#aaa">${hao.phucThan.diaChi} ${hao.phucThan.hanh}</span>
    </div>` : '';

    const isGK = hao.laTuanKhong && hao.nhanXetVS && hao.nhanXetVS.some(x=>x.includes("Giả Không")); const tkBadge = hao.laTuanKhong ? (isGK ? ' <span class="badge bdg-tk-g">TKg</span>' : ' <span class="badge bdg-tk">TK</span>') : "";
    const isVM = hao.laNhapMo && hao.nhanXetVS && hao.nhanXetVS.some(x=>x.includes("Vượng Mộ")); const moBadge = hao.laNhapMo ? (isVM ? ' <span class="badge bdg-mo-v">Mv</span>' : ' <span class="badge bdg-mo">Mộ</span>') : "";
    const amBadge = hao.laAmDong ? ' <span class="badge bdg-am">ÁĐ</span>' : ""; const tienBadge = hao.laTienThan ? ' <span class="badge" style="background:#0a1e0a;color:#57c255;border:1px solid #399837">Tiến</span>' : ""; const thoaiBadge = hao.laThoaiThan ? ' <span class="badge" style="background:#1e0808;color:#cc4444;border:1px solid #882222">Thoái</span>' : ""; const banQuaiHtml = `<div class="${getLucThanClass(hao.lucThan)}" style="font-weight:700;font-size:0.78rem;margin-bottom:2px">${hao.lucThan}</div><div style="font-size:0.73rem">${hao.diaChi} <span style="color:#6b7a94">${hao.hanh}</span>${tkBadge}${moBadge}${amBadge}</div><div class="hao-symbol" style="margin-top:3px">${renderHaoSymbol(state.haoScores[i])}</div>`;

    let bienQuaiHtml = '<div style="color:#2a3a55;font-size:0.78rem">—</div>';
    if (hao.laDong) {
       bienQuaiHtml = `<div class="${getLucThanClass(hao.bienLucThan)}" style="font-weight:700;font-size:0.78rem;margin-bottom:2px">${hao.bienLucThan}</div><div style="font-size:0.73rem;color:#8090a8">${hao.bienDC} ${hao.bienHanh}${tienBadge}${thoaiBadge}</div><div class="hao-symbol" style="margin-top:3px">${renderHaoSymbol(hao.bienScore)}</div>`;
    }

    const vsDetailHtml = hao.vuongSuy.nhanXet.length > 0 ? `<ul style="list-style:none;padding:0;margin-top:3px;text-align:left">${hao.vuongSuy.nhanXet.map(x=>`<li style="font-size:0.62rem;color:#6b7a94;padding:1px 0">• ${x}</li>`).join('')}</ul>` : '';
    const vsHtml = `<span class="vuong-suy ${hao.vuongSuy.cssClass}">${hao.vuongSuy.mucDo} <span style="opacity:0.6">(${hao.vuongSuy.diem}đ)</span></span>${vsDetailHtml}`;

    row.innerHTML = `<td style="font-weight:700;color:#4a5a70;font-size:0.75rem">H${hao.viTri}</td><td style="font-size:0.7rem;color:#6b7a94">${hao.lucThanTen}</td><td>${banQuaiHtml}</td><td>${bienQuaiHtml}</td><td style="text-align:center">${theUngHtml}${phucThanHtml}</td><td style="vertical-align:top;text-align:left;padding:0.3rem">${vsHtml}</td>`;
    row.style.cursor = 'pointer';
    row.onclick = () => chonDungThan(i);
    tbody.appendChild(row);
  }
}

// === BƯỚC 4: DỤNG THẦN ===
function renderDungThanButtons() {
  const container = document.getElementById('chon-dung-than-buttons');
  container.innerHTML = '';
  state.hao6.forEach((hao, i) => {
    const btn = document.createElement('button');
    btn.className = 'chon-dt-btn';
    btn.textContent = `Hào ${hao.viTri}: ${hao.lucThan} (${hao.diaChi})`;
    btn.onclick = () => chonDungThan(i);
    container.appendChild(btn);
  });
  // Thêm nút chọn Phục Thần làm DT (nếu có Phục Tàng)
  const phucHaos = state.hao6.filter(h => h.phucThan);
  if (phucHaos.length > 0) {
    const sep = document.createElement('div');
    sep.style.cssText = 'width:100%;font-size:0.7rem;color:#6b7a94;margin:0.3rem 0;text-align:center;';
    sep.textContent = '— Phục Thần (ẩn dưới Phi Thần) —';
    container.appendChild(sep);
    phucHaos.forEach(h => {
      const btn = document.createElement('button');
      btn.className = 'chon-dt-btn';
      btn.style.borderStyle = 'dashed';
      btn.style.opacity = '0.8';
      btn.textContent = `👻 H${h.viTri}: ${h.phucThan.lucThan} (${h.phucThan.diaChi}) [Phục]`;
      btn.onclick = () => chonPhucThanDT(h);
      container.appendChild(btn);
    });
  }
}

function goiYDungThan() {
  const loai = document.getElementById('loai-viec').value;
  const box = document.getElementById('goi-y-dung-than');
  if (!loai) { box.style.display = 'none'; return; }
  const lucThan = GOI_Y_DUNG_THAN[loai];
  if (!lucThan) { box.style.display = 'none'; return; }
  const matches = state.hao6.filter(h => h.lucThan === lucThan);
  box.style.display = 'block';
  box.innerHTML = `<p>Gợi ý Dụng Thần: <span class="luc-than-name">${lucThan}</span></p>
    <p style="font-size:0.82rem;color:#888;margin-top:0.25rem">Các hào ${lucThan}: ${matches.map(h => 'Hào ' + h.viTri + ' (' + h.diaChi + ')').join(', ') || 'Không có (Phục Tàng)'}</p>`;
}

function chonDungThan(haoIndex) {
  state.dungThanHao = haoIndex;
  const dt = state.hao6[haoIndex];
  state.dungThanLucThan = dt.lucThan;
  const dtHanh = DC_HANH[dt.diaChi];

  document.getElementById('dung-than-selected').style.display = 'block';
  document.getElementById('dt-name').textContent = dt.lucThan + ' — Hào ' + dt.viTri;
  document.getElementById('dt-dia-chi').textContent = dt.diaChi;
  document.getElementById('dt-hanh').textContent = dtHanh;

  // Highlight active button
  document.querySelectorAll('.chon-dt-btn').forEach((b, i) => {
    b.classList.toggle('active', i === haoIndex);
  });

  // Phân tích
  runPhanTich(haoIndex);
}

function resetDungThan() {
  state.dungThanHao = null;
  document.getElementById('dung-than-selected').style.display = 'none';
  document.querySelectorAll('.chon-dt-btn').forEach(b => b.classList.remove('active'));
  ['step-5','step-6','step-7','step-cat-hung','step-phi-phuc','step-luc-than','step-thu-tuong'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  // Reset row highlights
  document.querySelectorAll('.bang-que tbody tr').forEach(tr => {
    tr.classList.remove('row-dung-than','row-nguyen-than','row-ky-than','row-cuu-than');
  });
}

// === CHỌN PHỤC THẦN LÀM DỤNG THẦN ===
function chonPhucThanDT(phiHao) {
  const phuc = phiHao.phucThan;
  state.dungThanHao = 'phuc'; // Đánh dấu là Phục Thần
  state.dungThanLucThan = phuc.lucThan;
  state.dungThanPhucData = { phiHao, phuc };

  document.getElementById('dung-than-selected').style.display = 'block';
  document.getElementById('dt-name').textContent = phuc.lucThan + ' — Phục Thần (dưới H' + phiHao.viTri + ')';
  document.getElementById('dt-dia-chi').textContent = phuc.diaChi;
  document.getElementById('dt-hanh').textContent = phuc.hanh;

  // Highlight
  document.querySelectorAll('.chon-dt-btn').forEach(b => b.classList.remove('active'));

  // Phân tích
  runPhanTichPhuc(phiHao, phuc);
}

function runPhanTichPhuc(phiHao, phuc) {
  const phucHanh = phuc.hanh;
  const phiHanh = phiHao.hanh;
  const nk = state.chiThang;
  const nt = state.chiNgay;
  const nh = DC_HANH[nk];
  const nth = DC_HANH[nt];

  // Tính lực Phục Thần (giản lược — không có trong quẻ nên chỉ dựa Nhật/Nguyệt)
  let diemPhuc = 0;
  const nhanXetPhuc = [];

  // Nguyệt Kiến
  if (nk === phuc.diaChi) { diemPhuc += 3; nhanXetPhuc.push('Nguyệt Kiến (Cực vượng)'); }
  else if (NGU_HANH_SINH[nh] === phucHanh) { diemPhuc += 2; nhanXetPhuc.push('Nguyệt Sinh'); }
  else if (nh === phucHanh) { diemPhuc += 3; nhanXetPhuc.push('Nguyệt Vượng (Tỷ hòa)'); }
  else if (NGU_HANH_KHAC[nh] === phucHanh) { diemPhuc -= 2; nhanXetPhuc.push('Nguyệt Khắc'); }

  // Nhật Thần
  if (nt === phuc.diaChi) { diemPhuc += 3; nhanXetPhuc.push('Nhật Kiến (Cực vượng)'); }
  else if (NGU_HANH_SINH[nth] === phucHanh) { diemPhuc += 2; nhanXetPhuc.push('Nhật Sinh'); }
  else if (nth === phucHanh) { diemPhuc += 3; nhanXetPhuc.push('Nhật Vượng (Tỷ hòa)'); }
  else if (NGU_HANH_KHAC[nth] === phucHanh) { diemPhuc -= 2; nhanXetPhuc.push('Nhật Khắc'); }

  // Tuần Không for Phục Thần
  const phucTuanKhong = state.tuanKhong.includes(phuc.diaChi);
  if (phucTuanKhong) { diemPhuc -= 2; nhanXetPhuc.push('Tuần Không (Vô lực)'); }

  // Phi-Phục tương tác
  let phiPhucRelation = '';
  if (NGU_HANH_SINH[phiHanh] === phucHanh) {
    diemPhuc += 2;
    phiPhucRelation = 'Phi sinh Phục — được nuôi dưỡng, có trường sinh';
    nhanXetPhuc.push('Phi Sinh Phục (+2 lực)');
  } else if (NGU_HANH_KHAC[phiHanh] === phucHanh) {
    diemPhuc -= 3;
    phiPhucRelation = 'Phi khắc Phục — bị giam cầm, khó xuất';
    nhanXetPhuc.push('Phi Khắc Phục (-3 lực — bị đè)');
  } else if (NGU_HANH_SINH[phucHanh] === phiHanh) {
    diemPhuc -= 1;
    phiPhucRelation = 'Phục tiết khí cho Phi — bị rút lực';
    nhanXetPhuc.push('Phục Tiết Phi (-1)');
  } else {
    phiPhucRelation = 'Phi-Phục bình thường';
  }

  // 6 điều kiện hữu dụng
  const dieuKien = [];
  if (nhanXetPhuc.some(n => n.includes('Nguyệt Sinh') || n.includes('Nguyệt Kiến') || n.includes('Nguyệt Vượng')))
    dieuKien.push('✅ Được Nguyệt Kiến sinh/vượng');
  if (nhanXetPhuc.some(n => n.includes('Nhật Sinh') || n.includes('Nhật Kiến') || n.includes('Nhật Vượng')))
    dieuKien.push('✅ Được Nhật Thần sinh/vượng');
  if (phiPhucRelation.includes('sinh'))
    dieuKien.push('✅ Phi sinh Phục — đắc trường sinh');
  const haoDongSinh = state.hao6.some(h => (h.laDong || h.laAmDong) && NGU_HANH_SINH[DC_HANH[h.diaChi]] === phucHanh);
  if (haoDongSinh) dieuKien.push('✅ Có hào động trong quẻ tương sinh');
  const phiSuy = isHuuTu(phiHao) || phiHao.laTuanKhong || phiHao.laNhapMo;
  if (phiSuy) dieuKien.push('✅ Phi Thần hưu tù/Không/Mộ — Phục tự đắc dụng');

  const phucHuuDung = dieuKien.length > 0 && diemPhuc > -2;
  const phucVoDung = phiPhucRelation.includes('giam') && diemPhuc < 0;

  // Penalty cho DT là Phục
  diemPhuc -= 2; // base penalty "dù vượng cũng chỉ bình bình"
  nhanXetPhuc.push('DT Phục Tàng (-2 cơ bản)');

  const vs = getMucDoVuongSuy(diemPhuc, nhanXetPhuc);

  // Ứng kỳ
  const goiY = [];
  goiY.push({
    ly_do: '👻 Phục Tàng (DT ẩn)',
    thoi_diem: `Xung Phi: ngày/tháng ${LUC_XUNG[phiHao.diaChi]} (xung bay Phi Thần ${phiHao.diaChi})`,
    ghi_chu: `DT ẩn dưới ${phiHao.lucThan} (${phiHao.diaChi}) — chờ xung phi lộ phục`
  });
  if (diemPhuc < 1) {
    const hanhSinh = nguocSinh(phucHanh);
    goiY.push({
      ly_do: '📉 Phục Thần suy',
      thoi_diem: `Sinh vượng: ngày/tháng hành ${hanhSinh || '?'} | Lâm xuất: ngày/tháng ${phuc.diaChi}`,
      ghi_chu: 'Phục Thần cần vượng khí mới xuất hiện được'
    });
  }

  // Cát Hung
  let catHung, detail, cls;
  if (phucVoDung) {
    catHung = '🔴 Đại Hung'; detail = 'DT Phục Tàng bị Phi khắc, vĩnh viễn không xuất — mưu sự không thành'; cls = 'hung';
  } else if (!phucHuuDung) {
    catHung = '🟠 Tiểu Hung'; detail = 'DT Phục Tàng không đủ điều kiện xuất — rất khó thành'; cls = 'hung';
  } else if (diemPhuc >= 2) {
    catHung = '🟡 Bình (Trước khó sau dễ)'; detail = 'DT Phục Tàng nhưng có lực + đủ điều kiện xuất — trước khó sau dễ'; cls = '';
  } else {
    catHung = '🟠 Tiểu Hung'; detail = 'DT Phục Tàng, bình bình không lâu dài'; cls = 'hung';
  }

  const catHungEl = document.getElementById('cat-hung-result');
  const chiTiet = [];
  chiTiet.push(`👻 DT là Phục Thần — không có mặt, ẩn phục phía sau, chưa xuất đầu lộ diện`);
  chiTiet.push(`🏭 Phi Thần: ${phiHao.lucThan} (${phiHao.diaChi} ${phiHanh}) — ${phiPhucRelation}`);
  dieuKien.forEach(dk => chiTiet.push(dk));
  if (phucVoDung) chiTiet.push('❌ Phục Thần vô dụng: hưu tù + bị Phi khắc — vĩnh viễn không xuất');

  const chiTietHtml = `<ul class="cat-hung-chitiet">${chiTiet.map(c => `<li>${c}</li>`).join('')}</ul>`;
  if (catHungEl) catHungEl.innerHTML = `<div class="cat-hung-result ${cls}"><div class="cat-label">${catHung}</div><div class="cat-note">${detail}</div><div style="font-size:0.63rem;color:#4a5a70;margin-top:0.2rem">Điểm Phục Thần: ${diemPhuc.toFixed(1)}</div>${chiTietHtml}</div>`;

  // Render vượng suy
  renderVuongSuy(vs);

  // NKC: không có hào hiện nên render Phi-Phục info
  const nkcEl = document.getElementById('nkc-than-list');
  if (nkcEl) nkcEl.innerHTML = `<div class="nkc-item"><span class="nkc-label nkc-dung">Dụng Thần</span> 👻 Phục: ${phuc.lucThan} (${phuc.diaChi} ${phuc.hanh}) — <span class="vuong-suy ${vs.cssClass}">${vs.mucDo}</span></div>
    <div class="nkc-item"><span class="nkc-label" style="background:rgba(100,100,100,0.2);color:#aaa;border:1px solid #555">Phi Thần</span> ${phiHao.lucThan} H${phiHao.viTri} (${phiHao.diaChi} ${phiHanh}) — <span class="vuong-suy ${phiHao.vuongSuy.cssClass}">${phiHao.vuongSuy.mucDo}</span></div>`;

  // Động hào
  renderDongHao();

  // Cảnh báo
  const canhBao = [{ icon: '👻', level: 'warning', text: `Dụng Thần là Phục Thần ${phuc.lucThan} (${phuc.diaChi}) — ẩn dưới Phi Thần ${phiHao.lucThan} (${phiHao.diaChi}). Sự việc chưa xuất đầu lộ diện.` }];
  if (phiPhucRelation.includes('giam')) canhBao.push({ icon: '❌', level: 'danger', text: `Phi khắc Phục — DT bị giam cầm, không thể xuất` });
  if (phucTuanKhong) canhBao.push({ icon: '⚠️', level: 'warning', text: `Phục Thần Tuần Không — càng vô lực` });
  renderCanhBao(canhBao);

  // Ứng kỳ
  renderThoiDiem(goiY);

  // Phi Phục
  renderPhiPhuc();
  renderLucThanPanel();

  // Thủ Tượng cho Phục Thần
  const thuTuongEl = document.getElementById('thu-tuong-result');
  if (thuTuongEl) {
    const doan = [];
    doan.push(`Dụng Thần là **${phuc.lucThan}** (${phuc.diaChi} ${phuc.hanh}), **Phục Tàng** dưới Phi Thần ${phiHao.lucThan} (${phiHao.diaChi}).`);
    doan.push(`👻 **Thủ Tượng Phục Thần**: Nhân vật hoặc sự vật không có mặt, không tham dự, ẩn phục ở phía sau, không xuất đầu lộ diện.`);
    if (phiPhucRelation.includes('sinh')) {
      doan.push(`💪 Phi sinh Phục đắc trường sinh — tuy ẩn giấu nhưng được hào đè trên nuôi dưỡng, dễ xuất hiện đem điều tốt.`);
    } else if (phiPhucRelation.includes('giam')) {
      doan.push(`⛔ Phi khắc Phục phản thương thân — bị chính hào đè phía trên tước đoạt sinh khí, chèn ép và áp bức. Rất khó xuất.`);
    }
    if (phucHuuDung && !phucVoDung) {
      doan.push(`🟡 **Trước khó sau dễ** — Phục Thần có khí, đủ điều kiện xuất. Ban đầu trắc trở nhưng về sau có thể thành công.`);
    } else if (phucVoDung) {
      doan.push(`🔴 **Thất bại hoàn toàn** — Phục Thần hưu tù bị khắc, không thể kéo lên xuất hiện. Mưu cầu không đạt.`);
    }
    doan.push(`⏳ **Ứng kỳ**: Chờ ngày/tháng ${LUC_XUNG[phiHao.diaChi]} xung bay Phi Thần ${phiHao.diaChi} — Phục Thần xuất lộ.`);

    thuTuongEl.innerHTML = doan.map(d => {
      const formatted = d.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff">$1</strong>');
      return `<div class="thu-tuong-line">${formatted}</div>`;
    }).join('');
  }

  // Highlight bảng quẻ
  document.querySelectorAll('.bang-que tbody tr').forEach(tr => {
    tr.classList.remove('row-dung-than','row-nguyen-than','row-ky-than','row-cuu-than');
  });

  ['step-5','step-6','step-7','step-cat-hung','step-phi-phuc','step-luc-than','step-thu-tuong'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
  });
}

// === BƯỚC 5-7: PHÂN TÍCH ===
function nguocSinh(hanh) {
  // Hành nào sinh ra hanh?
  for (const [k, v] of Object.entries(NGU_HANH_SINH)) { if (v === hanh) return k; }
  return null;
}

function phanLoaiThan(dungThanHanh, haoHanh) {
  if (NGU_HANH_SINH[haoHanh] === dungThanHanh) return 'Nguyên Thần';
  if (NGU_HANH_KHAC[haoHanh] === dungThanHanh) return 'Kỵ Thần';
  if (NGU_HANH_SINH[dungThanHanh] === haoHanh) return 'Tiết Thần';
  const nguyenHanh = nguocSinh(dungThanHanh);
  if (nguyenHanh && NGU_HANH_KHAC[haoHanh] === nguyenHanh) return 'Cừu Thần';
  return null;
}

function kiemTraHoiDau(diaChi, bienDC) {
  if (!bienDC) return null;
  const gocHanh = DC_HANH[diaChi];
  const bienHanh = DC_HANH[bienDC];
  if (NGU_HANH_SINH[bienHanh] === gocHanh) return { loai: 'Hồi đầu sinh', yNghia: 'Tốt — lực gốc tăng' };
  if (NGU_HANH_KHAC[bienHanh] === gocHanh) return { loai: 'Hồi đầu khắc', yNghia: 'Xấu — tự hủy hoại' };
  return null;
}

// === HELPERS: Đánh giá trạng thái hào (Hữu dụng / Vô lực) ===
function isHuuTu(hao) {
  // Hào hưu tù = KHÔNG được Nguyệt Kiến/Nhật Thần sinh/vượng/tỷ hòa
  const tags = hao.nhanXetVS || [];
  return !tags.some(t =>
    t.includes('Nguyệt Kiến') || t.includes('Nguyệt Vượng') || t.includes('Nguyệt Sinh') ||
    t.includes('Nguyệt Hợp') ||
    t.includes('Nhật Kiến') || t.includes('Nhật Vượng') || t.includes('Nhật Sinh') ||
    t.includes('Nhật Hợp')
  );
}

function danhGiaTrangThai(hao) {
  const huuTu = isHuuTu(hao);
  const tags = hao.nhanXetVS || [];
  // 7 điều kiện vô lực (theo giáo trình Lưu Xương Minh)
  const voLuc = huuTu && (
    (!hao.laDong && !hao.laAmDong) ||                          // Hưu tù + an tĩnh
    hao.laThoaiThan ||                                         // Hưu tù + hóa thoái
    (hao.laTuanKhong && hao.diemVS < 1) ||                     // Hưu tù + Chân Không
    (hao.laNhapMo && hao.diemVS < 1) ||                        // Hưu tù + Suy Mộ
    tags.some(t =>
      t.includes('Hồi Đầu Khắc') || t.includes('Phản Ngâm') || t.includes('Nguyệt Phá')
    )                                                          // Hưu tù + bị hóa khắc/phá
  );
  return {
    huuTu,
    voLuc,
    huuDung: !voLuc && (hao.laDong || hao.laAmDong),
    giaiThich: voLuc
      ? 'Vô lực — hưu tù + bị chế ngự'
      : huuTu
        ? 'Hưu tù — chưa bị chế ngự hoàn toàn'
        : 'Vượng tướng — có lực'
  };
}

function runPhanTich(haoIndex) {
  const dt = state.hao6[haoIndex];
  const dtHanh = DC_HANH[dt.diaChi];
  const vs = dt.vuongSuy; // Đã tính sẵn trong Pass 2 của anQue

  const haoVaiTro = state.hao6.map((hao, i) => {
    if (i === haoIndex) return { ...hao, vaiTro: 'Dụng Thần' };
    const vt = phanLoaiThan(dtHanh, DC_HANH[hao.diaChi]);
    return { ...hao, vaiTro: vt };
  });

  const canhBao = [];
  // DT Tuần Không
  if (dt.laTuanKhong) canhBao.push({ icon: '⚠️', level: 'warning', text: 'Dụng Thần trong Tuần Không — Sự việc chưa có thực chất, chờ xuất Tuần Không' });
  // DT Nhập Mộ
  if (dt.laNhapMo) canhBao.push({ icon: '🔒', level: 'danger', text: `Dụng Thần Nhập Mộ (${NHAP_MO[dtHanh]}) — Cần ngày ${LUC_XUNG[NHAP_MO[dtHanh]]} xung khai mộ` });

  haoVaiTro.forEach(h => {
    if (h.vaiTro === 'Kỵ Thần') {
      if (h.laTuanKhong) canhBao.push({ icon: '✅', level: 'success', text: `Kỵ Thần (${h.diaChi}) Tuần Không — Vô lực` });
      else if (h.laDong && h.vuongSuy.mucDo.includes('ượng')) canhBao.push({ icon: '⚡', level: 'danger', text: `Kỵ Thần (${h.diaChi}) vượng và đang động — Nguy hiểm!` });
    }
    if (h.laDong && h.bienDC) {
      const hd = kiemTraHoiDau(h.diaChi, h.bienDC);
      if (hd && hd.loai === 'Hồi đầu khắc') canhBao.push({ icon: '❌', level: 'danger', text: `Hào ${h.viTri} Hồi Đầu Khắc — ${hd.yNghia}` });
      if (hd && hd.loai === 'Hồi đầu sinh') canhBao.push({ icon: '💪', level: 'success', text: `Hào ${h.viTri} Hồi Đầu Sinh — ${hd.yNghia}` });
    }
  });

  // Phục tàng check
  const lucThanList = state.hao6.map(h => h.lucThan);
  ['Phụ Mẫu','Quan Quỷ','Thê Tài','Tử Tôn','Huynh Đệ'].forEach(lt => {
    if (!lucThanList.includes(lt)) canhBao.push({ icon: '📵', level: 'warning', text: `${lt} Phục Tàng — Không xuất hiện trong quẻ` });
  });

  // Thời điểm (truyền thêm haoVaiTro để xem Phục Tàng)
  const thoiDiem = duDoanThoiDiem(dt, state.chiThang, state.chiNgay, state.tuanKhong, haoVaiTro);

  // Render
  renderVuongSuy(vs);
  renderNKCThan(haoVaiTro);
  renderDongHao();
  renderCanhBao(canhBao);
  renderThoiDiem(thoiDiem);
  renderCatHung(dt, haoVaiTro, vs);
  renderPhiPhuc();
  renderLucThanPanel();
  renderThuTuong(dt, haoVaiTro, vs);
  highlightBangQue(haoVaiTro);
  ['step-5','step-6','step-7','step-cat-hung','step-phi-phuc','step-luc-than','step-thu-tuong'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
  });
}

function renderVuongSuy(vs) {
  const pct = Math.min(100, Math.max(5, ((vs.diem + 6) / 12) * 100));
  const bar = document.getElementById('vuong-suy-bar');
  const colors = { 'vs-cuc-vuong': '#ff6b00', 'vs-vuong': '#4caf50', 'vs-binh-hoa': '#808080', 'vs-hoi-suy': '#ff9966', 'vs-suy': '#ff4444', 'vs-cuc-suy': '#880000' };
  bar.style.width = pct + '%';
  bar.style.background = `linear-gradient(90deg, ${colors[vs.cssClass] || '#888'}, ${colors[vs.cssClass] || '#888'}88)`;
  document.getElementById('vuong-suy-text').innerHTML = `<span class="vuong-suy ${vs.cssClass}">${vs.mucDo}</span> <span style="color:var(--text-2,#94A3B8);font-size:0.78rem">(điểm: ${vs.diem})</span>`;
  document.getElementById('vuong-suy-detail').innerHTML = vs.nhanXet.map(n => `<li>• ${n}</li>`).join('');
}

function renderNKCThan(haoVaiTro) {
  const el = document.getElementById('nkc-than-list');
  el.innerHTML = haoVaiTro.filter(h => h.vaiTro).map(h => {
    const clsMap = {'Dụng Thần':'nkc-dung','Nguyên Thần':'nkc-nguyen','Kỵ Thần':'nkc-ky','Cừu Thần':'nkc-cuu','Tiết Thần':'nkc-tiet'};
    const cls = clsMap[h.vaiTro] || 'nkc-cuu';
    // Badge trạng thái cho Nguyên/Kỵ/Cừu/Tiết
    let ttBadge = '';
    if (h.vaiTro !== 'Dụng Thần') {
      const tt = danhGiaTrangThai(h);
      if (tt.voLuc) ttBadge = ' <span class="badge-voluc">Vô lực</span>';
      else if (tt.huuDung) ttBadge = ' <span class="badge-huudung">Hữu dụng</span>';
      else if (!tt.huuTu) ttBadge = ' <span class="badge-huudung">Vượng</span>';
    }
    return `<div class="nkc-item"><span class="nkc-label ${cls}">${h.vaiTro}</span> H${h.viTri}: <span class="${getLucThanClass(h.lucThan)}">${h.lucThan}</span> (${h.diaChi} ${h.hanh}) — <span class="vuong-suy ${h.vuongSuy.cssClass}">${h.vuongSuy.mucDo}</span>${ttBadge}</div>`;
  }).join('');
}

function renderDongHao() {
  const el = document.getElementById('dong-hao-analysis');
  const allDong = state.hao6.filter(h => h.laDong || h.laAmDong);
  if (allDong.length === 0) { el.innerHTML = '<p style="color:var(--text-3,#475569);font-size:0.85rem">Không có hào động</p>'; return; }
  el.innerHTML = allDong.map(h => {
    const hd = h.bienDC ? kiemTraHoiDau(h.diaChi, h.bienDC) : null;
    const label = h.laAmDong ? '<span class="badge bdg-am">Ám Động</span>' : '<span style="color:#ffcc00;font-size:0.62rem;font-weight:700">● Động</span>';
    const tiPhu = h.laTienThan ? ' <span style="color:#57c255">→ Tiến Thần</span>' : h.laThoaiThan ? ' <span style="color:#cc4444">→ Thoái Thần</span>' : '';
    const hdLabel = hd ? `<span style="color:${hd.loai.includes('sinh') ? '#57c255' : '#cc4444'};font-size:0.65rem"> [${hd.loai}]</span>` : '';
    return `<div class="dong-item"><span class="d-head">H${h.viTri}</span> ${label} ${h.diaChi}→${h.bienDC||'?'}${tiPhu}${hdLabel}</div>`;
  }).join('');
}

function renderCanhBao(list) {
  document.getElementById('canh-bao-list').innerHTML = list.map(cb =>
    `<div class="canh-bao-item ${cb.level}"><span>${cb.icon}</span><span>${cb.text}</span></div>`
  ).join('') || '<p style="color:var(--text-3,#475569);font-size:0.85rem">Không có cảnh báo đặc biệt ✓</p>';
}

function renderCatHung(dt, haoVaiTro, vs) {
  const el = document.getElementById('cat-hung-result');
  if (!el) return;

  const dtHanh = DC_HANH[dt.diaChi];
  const isPhuTang = !state.hao6.some(h => h.lucThan === dt.lucThan);
  let score = vs.diem; // Base score từ vượng suy cá nhân
  const chiTiet = [];

  // Phân nhóm các Thần
  const nguyenThans = haoVaiTro.filter(h => h.vaiTro === 'Nguyên Thần');
  const kyThans = haoVaiTro.filter(h => h.vaiTro === 'Kỵ Thần');
  const cuuThans = haoVaiTro.filter(h => h.vaiTro === 'Cừu Thần');
  const tietThans = haoVaiTro.filter(h => h.vaiTro === 'Tiết Thần');

  // Kiểm tra Nguyên Thần nào hữu dụng (cho rule Tham Sinh Quên Khắc)
  const ntHuuDung = nguyenThans.filter(nt => danhGiaTrangThai(nt).huuDung);

  // === NGUYÊN THẦN ===
  nguyenThans.forEach(nt => {
    const tt = danhGiaTrangThai(nt);
    // Rule: Tham Hợp Quên Sinh — NT và DT có Lục Hợp + cả 2 cùng động
    const dtDangDong = dt.laDong || dt.laAmDong;
    if (tt.huuDung && dtDangDong && LUC_HOP[nt.diaChi] === dt.diaChi) {
      chiTiet.push(`🔗 NT H${nt.viTri}: Tham Hợp Quên Sinh — ${nt.diaChi} hợp ${dt.diaChi}, cả 2 cùng động → NT quên sinh DT`);
    } else if (tt.voLuc) {
      chiTiet.push(`🔇 NT H${nt.viTri} (${nt.diaChi}): Vô lực → không sinh được DT`);
    } else if (tt.huuDung) {
      const bonus = nt.diemVS >= 3 ? 2.0 : 1.5;
      score += bonus;
      chiTiet.push(`💪 NT H${nt.viTri} (${nt.diaChi}): Vượng động → sinh DT (+${bonus})`);
    } else if (!tt.huuTu && !nt.laDong) {
      score += 0.5;
      chiTiet.push(`🤝 NT H${nt.viTri} (${nt.diaChi}): Vượng tĩnh → sinh nhẹ (+0.5)`);
    } else {
      chiTiet.push(`⏸️ NT H${nt.viTri} (${nt.diaChi}): Hưu tù tĩnh → chưa sinh được`);
    }
  });

  // === KỴ THẦN ===
  kyThans.forEach(ky => {
    const tt = danhGiaTrangThai(ky);
    // Rule: Tham Sinh Quên Khắc — Kỵ + Nguyên cùng động → Kỵ bỏ khắc DT
    if ((ky.laDong || ky.laAmDong) && ntHuuDung.length > 0) {
      chiTiet.push(`🔄 KT H${ky.viTri} (${ky.diaChi}): Tham Sinh Quên Khắc — KT + NT cùng động → KT bỏ khắc DT, chuyển sinh NT`);
    } else if (tt.voLuc) {
      score += 0.5;
      chiTiet.push(`✅ KT H${ky.viTri} (${ky.diaChi}): Vô lực → không hại được DT (+0.5)`);
    } else if (tt.huuDung) {
      const penalty = ky.diemVS >= 3 ? -2.5 : -1.5;
      score += penalty;
      chiTiet.push(`⚡ KT H${ky.viTri} (${ky.diaChi}): Vượng động → khắc DT (${penalty})`);
    } else if (!tt.huuTu && ky.laTuanKhong) {
      chiTiet.push(`⏳ KT H${ky.viTri} (${ky.diaChi}): Giả Không — nguy hiểm sẽ đến sau khi xuất Không`);
    } else {
      chiTiet.push(`⏸️ KT H${ky.viTri} (${ky.diaChi}): Hưu tù/tĩnh → tạm chưa hại`);
    }
  });

  // === CỪU THẦN ===
  cuuThans.forEach(cuu => {
    const tt = danhGiaTrangThai(cuu);
    if (tt.huuDung) {
      const ntCoLuc = nguyenThans.some(nt => !danhGiaTrangThai(nt).voLuc);
      if (ntCoLuc) {
        score -= 1.5;
        chiTiet.push(`💀 CT H${cuu.viTri} (${cuu.diaChi}): Động → khắc NT + sinh KT (-1.5)`);
      } else {
        chiTiet.push(`💀 CT H${cuu.viTri} (${cuu.diaChi}): Động nhưng NT đã vô lực → không gây thêm hại`);
      }
    } else if (tt.voLuc) {
      chiTiet.push(`✅ CT H${cuu.viTri} (${cuu.diaChi}): Vô lực → không đe dọa NT`);
    }
  });

  // === TIẾT THẦN (Vì Sinh mà Thiệt) ===
  tietThans.forEach(tiet => {
    const tt = danhGiaTrangThai(tiet);
    if (tt.huuDung && tiet.diemVS >= 2) {
      const drain = tiet.diemVS >= 4 ? -2.0 : -1.0;
      score += drain;
      chiTiet.push(`🩸 TiT H${tiet.viTri} (${tiet.diaChi}): Vì Sinh mà Thiệt — Tiết Thần vượng động rút khí DT (${drain})`);
    } else if (tt.huuDung) {
      score -= 0.5;
      chiTiet.push(`🩸 TiT H${tiet.viTri} (${tiet.diaChi}): Tiết khí nhẹ (-0.5)`);
    }
  });

  // Kết luận Cát/Hung
  let catHung, detail, cls;
  if (isPhuTang) { catHung = '⚠️ Phục Tàng — Khó luận'; detail = 'Dụng Thần bị ẩn, việc khó thành'; cls = ''; }
  else if (score >= 4) { catHung = '✅ Đại Cát'; detail = 'Dụng Thần vượng mạnh, việc thuận lợi'; cls = ''; }
  else if (score >= 2) { catHung = '🟢 Cát'; detail = 'Dụng Thần khá mạnh, hướng tốt'; cls = ''; }
  else if (score >= 0) { catHung = '🟡 Bình'; detail = 'Lực lượng cân bằng, kết quả chưa rõ'; cls = 'hung'; }
  else if (score >= -2) { catHung = '🟠 Tiểu Hung'; detail = 'Dụng Thần suy nhược, cần cẩn thận'; cls = 'hung'; }
  else { catHung = '🔴 Đại Hung'; detail = 'Dụng Thần cực suy, việc khó thành'; cls = 'hung'; }

  const chiTietHtml = chiTiet.length > 0
    ? `<ul class="cat-hung-chitiet">${chiTiet.map(c => `<li>${c}</li>`).join('')}</ul>`
    : '';
  el.innerHTML = `<div class="cat-hung-result ${cls}"><div class="cat-label">${catHung}</div><div class="cat-note">${detail}</div><div style="font-size:0.63rem;color:#4a5a70;margin-top:0.2rem">Điểm tổng hợp: ${score.toFixed(1)}</div>${chiTietHtml}</div>`;
}

function renderPhiPhuc() {
  const el = document.getElementById('phi-phuc-analysis');
  if (!el) return;
  const phucThans = state.hao6.filter(h => h.phucThan);
  if (phucThans.length === 0) {
    el.innerHTML = '<p style="color:var(--text-3,#475569);font-size:0.85rem">Không có Phục Thần ✓</p>'; return;
  }
  el.innerHTML = phucThans.map(h => {
    const phuc = h.phucThan;
    const phiHanh = h.hanh, phucHanh = phuc.hanh;
    let tuongTac = '';
    if (NGU_HANH_SINH[phiHanh] === phucHanh) tuongTac = '<span style="color:#57c255">Phi Sinh Phục ✓ (Phục có lực)</span>';
    else if (NGU_HANH_KHAC[phiHanh] === phucHanh) tuongTac = '<span style="color:#cc4444">Phi Khắc Phục ✗ (Phục bị giam)</span>';
    else if (NGU_HANH_SINH[phucHanh] === phiHanh) tuongTac = '<span style="color:#ee9966">Phục Tiết Phi</span>';
    else tuongTac = '<span style="color:#6b7a94">Bình thường</span>';
    return `<div style="border:1px solid #c9a84c22;border-radius:5px;padding:0.4rem;margin-bottom:0.3rem;background:#0c1020">
      <div style="font-size:0.7rem;color:#6b7a94">Vị trí H${h.viTri}</div>
      <div style="font-size:0.72rem">Phi: <span class="${getLucThanClass(h.lucThan)}">${h.lucThan}</span> (${h.diaChi} ${h.hanh}) | Phục: <span class="${getLucThanClass(phuc.lucThan)}">${phuc.lucThan}</span> (${phuc.diaChi} ${phuc.hanh})</div>
      <div style="font-size:0.67rem;margin-top:0.15rem">${tuongTac}</div>
    </div>`;
  }).join('');
}

function renderLucThanPanel() {
  const el = document.getElementById('luc-than-analysis');
  if (!el) return;
  const lucThanMap = {
    'Tử Tôn': {color:'#4caf50', y:'Con cái, sức khỏe, khắc Quỷ'},
    'Thê Tài': {color:'#ffd700', y:'Tài lộc, vợ (nam hỏi), khắc Phụ'},
    'Quan Quỷ': {color:'#ff6b6b', y:'Quan chức, bệnh tật (nữ: chồng)'},
    'Phụ Mẫu': {color:'#87ceeb', y:'Cha mẹ, văn thư, khắc Tử'},
    'Huynh Đệ': {color:'#dda0dd', y:'Anh em, cạnh tranh tài lộc'}
  };
  const grouped = {};
  state.hao6.forEach(h => { if (!grouped[h.lucThan]) grouped[h.lucThan] = []; grouped[h.lucThan].push(h); });
  el.innerHTML = Object.entries(lucThanMap).map(([lt, info]) => {
    const haos = grouped[lt] || [];
    const haosStr = haos.length ? haos.map(h => `H${h.viTri}(${h.diaChi})`).join(', ') : '<span style="color:#3a4a60">Phục Tàng</span>';
    return `<div style="border-bottom:1px solid #1e2a40;padding:0.2rem 0"><span style="color:${info.color};font-weight:700;font-size:0.72rem">${lt}</span> <span style="color:#4a5a70;font-size:0.66rem">${haosStr}</span><div style="font-size:0.6rem;color:#3a4a60">${info.y}</div></div>`;
  }).join('');
}

function duDoanThoiDiem(dt, nguyetKien, nhatThan, tuanKhong, haoVaiTro) {
  const goiY = [];
  const dungThanDC = dt.diaChi;
  const haoHanh = DC_HANH[dungThanDC];
  const dtVS = dt.vuongSuy || { diem: 0 };

  // 1. TUẦN KHÔNG → Xuất Không / Xung Không
  if (tuanKhong.includes(dungThanDC)) {
    goiY.push({
      ly_do: '🕳️ Tuần Không',
      thoi_diem: `Xuất Không: ngày/tháng ${dungThanDC} | Xung Không: ngày/tháng ${LUC_XUNG[dungThanDC]}`,
      ghi_chu: 'DT vắng mặt tạm thời — sự việc ứng sau khi thoát Không'
    });
  }

  // 2. NHẬP MỘ → Xung phá Mộ khố
  const moAddr = NHAP_MO[haoHanh];
  if (nhatThan === moAddr || nguyetKien === moAddr) {
    goiY.push({
      ly_do: '🔒 Nhập Mộ',
      thoi_diem: `Xung Mộ: ngày/tháng ${LUC_XUNG[moAddr]} (phá ${moAddr})`,
      ghi_chu: 'DT bị giam trong Mộ — phải chờ xung khai'
    });
  }

  // 3. HỢP BÁN → Xung khai Hợp thần
  const hopVoiNhat = LUC_HOP[nhatThan] === dungThanDC;
  const hopVoiNguyet = LUC_HOP[nguyetKien] === dungThanDC;
  if (hopVoiNhat || hopVoiNguyet) {
    const tac = hopVoiNhat ? nhatThan : nguyetKien;
    const nguon = hopVoiNhat ? 'Nhật Thần' : 'Nguyệt Kiến';
    goiY.push({
      ly_do: `🤝 Hợp Bán (${nguon})`,
      thoi_diem: `Xung khai: ngày/tháng ${LUC_XUNG[tac]} (xung ${tac})`,
      ghi_chu: 'DT bị trói buộc — cần xung phá hợp thần'
    });
  }

  // 4. NGUYỆT PHÁ → Xuất Phá / Hợp Phá
  if (LUC_XUNG[nguyetKien] === dungThanDC) {
    goiY.push({
      ly_do: '💥 Nguyệt Phá',
      thoi_diem: `Xuất phá: ngày/tháng ${dungThanDC} (lâm trị) | Hợp phá: ngày/tháng ${LUC_HOP[dungThanDC]}`,
      ghi_chu: 'DT bị tháng xung vỡ — chờ xuất phá hoặc hợp phá'
    });
  }

  // 5. PHỤC TÀNG → Xung Phi lộ Phục
  if (haoVaiTro) {
    const phucThans = state.hao6.filter(h => h.phucThan && h.phucThan.lucThan === dt.lucThan);
    phucThans.forEach(pt => {
      goiY.push({
        ly_do: '👻 Phục Tàng',
        thoi_diem: `Xung Phi: ngày/tháng ${LUC_XUNG[pt.diaChi]} (xung bay Phi Thần ${pt.diaChi})`,
        ghi_chu: `DT ẩn dưới Phi Thần ${pt.lucThan} (${pt.diaChi}) — chờ xung phi lộ phục`
      });
    });
  }

  // 6. HƯU TÙ / SUY NHƯỢC → Sinh Vượng / Lâm Trị
  if (dtVS.diem < 1 && goiY.length === 0) {
    const hanhSinh = nguocSinh(haoHanh);
    goiY.push({
      ly_do: '📉 DT Suy nhược',
      thoi_diem: `Sinh vượng: ngày/tháng hành ${hanhSinh || '?'} | Lâm trị: ngày/tháng ${dungThanDC}`,
      ghi_chu: 'DT yếu — cần gặp ngày sinh vượng hoặc lâm trị'
    });
  }

  // Fallback: DT bình thường
  if (goiY.length === 0) {
    goiY.push({
      ly_do: '📌 DT bình thường',
      thoi_diem: `Lâm trị: ngày/tháng ${dungThanDC} | Sinh vượng: ngày/tháng hành ${nguocSinh(haoHanh) || haoHanh}`,
      ghi_chu: 'Ứng vào ngày/tháng trùng hoặc sinh DT'
    });
  }

  return goiY;
}

function renderThoiDiem(list) {
  document.getElementById('thoi-diem-ung').innerHTML = list.map(td =>
    `<div class="thoi-diem-item"><div class="td-ly">📍 ${td.ly_do}</div><div class="td-val">⏰ ${td.thoi_diem}</div><div class="td-note">💡 ${td.ghi_chu}</div></div>`
  ).join('');
}

function highlightBangQue(haoVaiTro) {
  document.querySelectorAll('.bang-que tbody tr').forEach(tr => {
    tr.classList.remove('row-dung-than','row-nguyen-than','row-ky-than','row-cuu-than');
    const idx = parseInt(tr.dataset.haoIdx);
    const h = haoVaiTro[idx];
    if (h && h.vaiTro === 'Dụng Thần') tr.classList.add('row-dung-than');
    else if (h && h.vaiTro === 'Nguyên Thần') tr.classList.add('row-nguyen-than');
    else if (h && h.vaiTro === 'Kỵ Thần') tr.classList.add('row-ky-than');
    else if (h && h.vaiTro === 'Cừu Thần') tr.classList.add('row-cuu-than');
  });
}

// === BƯỚC 8: LƯU & IN ===
function luuQue() {
  const history = JSON.parse(localStorage.getItem('lucHaoHistory') || '[]');
  history.unshift({ id: Date.now(), timestamp: new Date().toISOString(), banQue: state.banQue?.ten, chiQue: state.chiQue?.ten, ghiChu: document.getElementById('ghi-chu').value });
  localStorage.setItem('lucHaoHistory', JSON.stringify(history.slice(0, 50)));
  alert('✅ Đã lưu quẻ thành công!');
}
function inQue() { window.print(); }

// === BƯỚC THỦ TƯỢNG: Tự động luận nghĩa quẻ ===
function sinhLuanNghia(dt, haoVaiTro, vs) {
  const doan = [];
  const dtHanh = DC_HANH[dt.diaChi];
  const lucThanTen = dt.lucThanTen; // Lục Thần trên hào DT
  const lucThanInfo = LUC_THAN_Y_TUONG[lucThanTen];
  const loaiViec = document.getElementById('loai-viec')?.value || '';

  // === 1. MỞ ĐẦU: Dụng Thần & Lục Thần ===
  const dtLucThan = dt.lucThan; // Lục Thân
  let moDau = `Dụng Thần là **${dtLucThan}** (${dt.diaChi} ${dtHanh}), hào ${dt.viTri}`;
  if (lucThanInfo) {
    moDau += `, lâm **${lucThanTen}** ${lucThanInfo.icon}`;
  }
  moDau += `. Lực lượng: **${vs.mucDo}** (${vs.diem} điểm).`;
  doan.push(moDau);

  // === 2. LỤC THẦN trên Dụng Thần ===
  if (lucThanInfo) {
    const isCat = vs.diem >= 1;
    const yTuong = isCat ? lucThanInfo.cat : lucThanInfo.hung;
    if (yTuong) {
      doan.push(`${lucThanInfo.icon} ${lucThanTen} lâm DT — ${isCat ? 'ý tượng Cát' : 'ý tượng Hung'}: ${yTuong}.`);
    }
  }

  // === 3. VƯỢNG SUY: Nhật Nguyệt tác động ===
  const nhanXet = vs.nhanXet || [];
  nhanXet.forEach(nx => {
    if (nx.includes('Nguyệt Sinh') || nx.includes('Nhật Sinh')) {
      doan.push(`📈 DT ${nx} — ${TUONG_SINH_Y_TUONG.nhatNguyet}.`);
    } else if (nx.includes('Nguyệt Khắc') || nx.includes('Nhật Khắc')) {
      doan.push(`📉 DT ${nx} — ${TUONG_KHAC_Y_TUONG.nhatKhacDT}.`);
    } else if (nx.includes('Nguyệt Phá')) {
      doan.push(`💥 DT bị Nguyệt Phá — bị hoàn cảnh đánh vỡ, sức ép lớn.`);
    } else if (nx.includes('Ám Động')) {
      doan.push(`👁️ DT Ám Động — ${TUONG_XUNG_Y_TUONG.amDong}.`);
    } else if (nx.includes('Nhật Hợp') || nx.includes('Nguyệt Hợp')) {
      const isDong = dt.laDong || dt.laAmDong;
      const hopLoai = isDong ? LUC_HOP_Y_TUONG.hopBan : LUC_HOP_Y_TUONG.hopKhoi;
      doan.push(`🤝 DT ${nx} — ${hopLoai}.`);
    }
  });

  // === 4. TUẦN KHÔNG / NHẬP MỘ ===
  if (dt.laTuanKhong) {
    const tkLT = TUAN_KHONG_LUC_THAN[dtLucThan];
    let tkText = 'DT Tuần Không — sự việc chưa có thực chất, trong lòng bất an.';
    if (tkLT) tkText += ` Cụ thể (${dtLucThan} Không): ${tkLT}.`;
    doan.push(`🕳️ ${tkText}`);
  }
  if (dt.laNhapMo) {
    let moText = 'DT Nhập Mộ — sự việc bị cất giữ, đóng kín, mất tự do.';
    if (loaiViec) {
      const moMap = {'tai-loc':'taiVan','benh-tat':'benhTat','hon-nhan-nam':'honNhan','hon-nhan-nu':'honNhan','kien-tung':'kienTung'};
      const moKey = moMap[loaiViec];
      if (moKey && MO_KHO_Y_TUONG[moKey]) moText += ` ${MO_KHO_Y_TUONG[moKey]}.`;
    }
    doan.push(`🔒 ${moText}`);
  }

  // === 5. NGUYÊN / KỴ / CỪU / TIẾT THẦN ===
  const nguyenThans = haoVaiTro.filter(h => h.vaiTro === 'Nguyên Thần');
  const kyThans = haoVaiTro.filter(h => h.vaiTro === 'Kỵ Thần');
  const cuuThans = haoVaiTro.filter(h => h.vaiTro === 'Cừu Thần');
  const tietThans = haoVaiTro.filter(h => h.vaiTro === 'Tiết Thần');

  nguyenThans.forEach(nt => {
    const tt = danhGiaTrangThai(nt);
    const ltInfo = LUC_THAN_Y_TUONG[nt.lucThanTen];
    const ltHint = ltInfo ? ` (${ltInfo.icon} ${nt.lucThanTen})` : '';
    if (tt.huuDung) {
      const hdCheck = nt.bienDC ? kiemTraHoiDau(nt.diaChi, nt.bienDC) : null;
      let text = `💚 Nguyên Thần ${nt.lucThan} H${nt.viTri}${ltHint} vượng động → ${TUONG_SINH_Y_TUONG.haoDong}`;
      if (hdCheck && hdCheck.loai.includes('sinh')) text += `. Lại ${TUONG_SINH_Y_TUONG.hoiDau}`;
      doan.push(text + '.');
    } else if (tt.voLuc) {
      doan.push(`🔇 Nguyên Thần ${nt.lucThan} H${nt.viTri}${ltHint} vô lực — nguồn trợ giúp bị cắt đứt.`);
    }
  });

  kyThans.forEach(ky => {
    const tt = danhGiaTrangThai(ky);
    const ltInfo = LUC_THAN_Y_TUONG[ky.lucThanTen];
    const ltHint = ltInfo ? ` (${ltInfo.icon} ${ky.lucThanTen})` : '';
    // Tham Sinh Quên Khắc
    const ntHuuDung = nguyenThans.filter(n => danhGiaTrangThai(n).huuDung);
    if ((ky.laDong || ky.laAmDong) && ntHuuDung.length > 0) {
      doan.push(`🔄 Kỵ Thần ${ky.lucThan} H${ky.viTri}${ltHint} — Tham Sinh Quên Khắc: ban đầu bị cản trở nhưng có người hòa giải, cuối cùng thành.`);
    } else if (tt.huuDung) {
      let hungText = TUONG_KHAC_Y_TUONG.kyKhacDT;
      if (ltInfo && ltInfo.hung) hungText += `. ${ltInfo.icon} ${ky.lucThanTen}: ${ltInfo.hung}`;
      doan.push(`⚡ Kỵ Thần ${ky.lucThan} H${ky.viTri}${ltHint} vượng động khắc DT — ${hungText}.`);
    } else if (tt.voLuc) {
      doan.push(`✅ Kỵ Thần ${ky.lucThan} H${ky.viTri}${ltHint} vô lực — kẻ cản trở suy yếu, không gây hại.`);
    }
  });

  cuuThans.forEach(cuu => {
    const tt = danhGiaTrangThai(cuu);
    if (tt.huuDung) {
      doan.push(`💀 Cừu Thần ${cuu.lucThan} H${cuu.viTri} động — khắc Nguyên Thần (cắt nguồn trợ) đồng thời sinh Kỵ Thần (bơm sức cho kẻ thù). Tình huống nguy hiểm gấp bội.`);
    }
  });

  tietThans.forEach(tiet => {
    const tt = danhGiaTrangThai(tiet);
    if (tt.huuDung && tiet.diemVS >= 2) {
      doan.push(`🩸 Tiết Thần ${tiet.lucThan} H${tiet.viTri} vượng động — Vì Sinh mà Thiệt: dù DT có lực nhưng bị tiết khí nghiêm trọng, kiếm được bao nhiêu hao bấy nhiêu.`);
    }
  });

  // === 6. KẾT LUẬN ===
  const catHung = vs.diem >= 2 ? 'Cát' : vs.diem >= 0 ? 'Bình' : 'Hung';
  if (catHung === 'Cát') {
    doan.push(`🏁 **Kết luận: CÁT** — Dụng Thần vượng tướng, mưu sự thuận lợi, sự việc có khả năng thành công.`);
  } else if (catHung === 'Bình') {
    doan.push(`🏁 **Kết luận: BÌNH** — Lực lượng cân bằng, kết quả còn chờ thời cơ, cần xem ứng kỳ.`);
  } else {
    doan.push(`🏁 **Kết luận: HUNG** — Dụng Thần suy nhược, bị khắc chế mạnh. Mưu sự khó thành, cần cẩn trọng.`);
  }

  return doan;
}

function renderThuTuong(dt, haoVaiTro, vs) {
  const el = document.getElementById('thu-tuong-result');
  if (!el) return;
  const doan = sinhLuanNghia(dt, haoVaiTro, vs);
  el.innerHTML = doan.map(d => {
    // Bold **text**
    const formatted = d.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff">$1</strong>');
    return `<div class="thu-tuong-line">${formatted}</div>`;
  }).join('');
}

// === KHỞI ĐỘNG ===
document.addEventListener('DOMContentLoaded', init);
