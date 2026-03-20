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
  // Default date = today (Local Timezone)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  document.getElementById('duong-lich').value = `${yyyy}-${mm}-${dd}`;
  convertToAmLich(); // Auto-select Can Chi based on today's date
  renderHaoInputs();
  // Auto-update on select change
  ['thang-can','thang-chi','ngay-can','ngay-chi'].forEach(id => {
    document.getElementById(id).addEventListener('change', updateStep1);
  });
}

// Trạng thái 3 xu cho mỗi hào (2=sấp, 3=ngửa)
let coinStates = {};
for (let h = 1; h <= 6; h++) coinStates[h] = [2, 2, 2];

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
  else if (LUC_XUNG[nk] === phuc.diaChi) { diemPhuc -= 2; nhanXetPhuc.push('Nguyệt Phá (Xung vỡ)'); }
  else if (LUC_HOP[nk] === phuc.diaChi) {
    if (NGU_HANH_KHAC[nh] === phucHanh) { diemPhuc -= 2; nhanXetPhuc.push('Nguyệt Khắc (Trong hợp có khắc)'); }
    else { diemPhuc += 2; nhanXetPhuc.push('Nguyệt Hợp'); }
  }
  else if (NGU_HANH_SINH[nh] === phucHanh) { diemPhuc += 2; nhanXetPhuc.push('Nguyệt Sinh'); }
  else if (nh === phucHanh) { diemPhuc += 3; nhanXetPhuc.push('Nguyệt Vượng (Tỷ hòa)'); }
  else if (NGU_HANH_KHAC[nh] === phucHanh) { diemPhuc -= 2; nhanXetPhuc.push('Nguyệt Khắc'); }

  // Nhật Thần
  if (nt === phuc.diaChi) { diemPhuc += 3; nhanXetPhuc.push('Nhật Kiến (Cực vượng)'); }
  else if (LUC_XUNG[nt] === phuc.diaChi) {
    if (diemPhuc >= 1) { // Lộ Phục
      diemPhuc += 1.5; nhanXetPhuc.push('Nhật Xung (Lộ Phục - Điềm lành)');
    } else {
      diemPhuc -= 2; nhanXetPhuc.push('Nhật Phá (Nhật Xung Hào Suy)');
    }
  }
  else if (LUC_HOP[nt] === phuc.diaChi) {
    if (NGU_HANH_KHAC[nth] === phucHanh) { diemPhuc -= 2; nhanXetPhuc.push('Nhật Khắc (Trong hợp có khắc)'); }
    else { diemPhuc += 2; nhanXetPhuc.push('Nhật Hợp'); }
  }
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
  state.vuongSuyDT = vs;
  state.haoVaiTro = []; // Phục thần không xét Nguyên Kỵ Cừu trên mặt quẻ
  state.finalScore = diemPhuc; // Lưu điểm cuối để render Thủ Tượng
  
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
  state.finalCatHung = catHung;

  const catHungEl = document.getElementById('cat-hung-result');
  const chiTiet = [];
  chiTiet.push(`👻 DT là Phục Thần — không có mặt, ẩn phục phía sau, chưa xuất đầu lộ diện`);
  chiTiet.push(`🏭 Phi Thần: ${phiHao.lucThan} (${phiHao.diaChi} ${phiHanh}) — ${phiPhucRelation}`);
  dieuKien.forEach(dk => chiTiet.push(dk));
  if (phucVoDung) chiTiet.push('❌ Phục Thần vô dụng: hưu tù + bị Phi khắc — vĩnh viễn không xuất');

  const chiTietHtml = `<ul class="cat-hung-chitiet">${chiTiet.map(c => `<li>${c}</li>`).join('')}</ul>`;
  if (catHungEl) catHungEl.innerHTML = `<div class="cat-hung-result ${cls}"><div class="cat-label">${catHung}</div><div class="cat-note">${detail}</div><div style="font-size:0.63rem;color:#4a5a70;margin-top:0.2rem">Điểm Phục Thần: ${diemPhuc.toFixed(1)}</div>${chiTietHtml}</div>`;

  // Render vượng suy
  state.vuongSuyDT = vs;
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
function runPhanTich(haoIndex) {
  const dt = state.hao6[haoIndex];
  const dtHanh = DC_HANH[dt.diaChi];
  const vs = dt.vuongSuy; // Đã tính sẵn trong Pass 2 của anQue

  const haoVaiTro = state.hao6.map((hao, i) => {
    if (i === haoIndex) return { ...hao, vaiTro: 'Dụng Thần' };
    const vt = phanLoaiThan(dtHanh, DC_HANH[hao.diaChi]);
    return { ...hao, vaiTro: vt };
  });

  state.vuongSuyDT = vs;
  state.haoVaiTro = haoVaiTro;

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

function luuQue() {
  const history = JSON.parse(localStorage.getItem('lucHaoHistory') || '[]');
  history.unshift({ id: Date.now(), timestamp: new Date().toISOString(), banQue: state.banQue?.ten, chiQue: state.chiQue?.ten, ghiChu: document.getElementById('ghi-chu').value });
  localStorage.setItem('lucHaoHistory', JSON.stringify(history.slice(0, 50)));
  alert('✅ Đã lưu quẻ thành công!');
}
function xuatPrompt() {
  let dt = null;
  if (state.dungThanHao === 'phuc' && state.dungThanPhucData) {
    dt = state.dungThanPhucData.phuc;
    dt.viTri = 'phuc';
  } else if (typeof state.dungThanHao === 'number') {
    dt = state.hao6[state.dungThanHao];
  }

  if (!dt) {
    alert('Vui lòng chọn Dụng Thần trước để app tính toán lực lượng!');
    return;
  }
  const cauHoi = prompt('Bạn đang muốn hỏi cụ thể về vấn đề gì?\\n(Ví dụ: Hỏi về bệnh tật của cha, cầu tài, kiện cáo...)');
  if (!cauHoi) return;
  
  const userNote = document.getElementById('ghi-chu') ? document.getElementById('ghi-chu').value : '';

  const haos = state.hao6.map(h => {
    const dongStr = h.laDong ? ` (Động ➔ Biến thành ${h.bienLucThan} ${h.bienDC} - Hành ${DC_HANH[h.bienDC]})` : (h.laAmDong ? ' (Ám Động)' : '');
    const tkStr = h.laTuanKhong ? ' [Tuần Không]' : '';
    const moStr = h.laNhapMo ? ' [Nhập Mộ]' : '';
    const vaiTro = state.haoVaiTro && state.haoVaiTro[h.viTri] ? state.haoVaiTro[h.viTri].vaiTro : '';
    const vtStr = vaiTro && vaiTro !== 'Bình thường' ? ` - Vai trò: ${vaiTro}` : '';
    
    // Tìm Phục Thần nếu có ẩn dưới hào này
    const phuc = state.phucThan ? state.phucThan.find(p => p.viTri === h.viTri) : null;
    const phucStr = phuc ? `\\n   ↳ [Phục Thần ẩn giấu]: ${phuc.lucThan} ${phuc.diaChi} (Hành ${DC_HANH[phuc.diaChi]})` : '';

    return `Hào ${h.viTri}: ${h.lucThan} ${h.diaChi} (Hành ${DC_HANH[h.diaChi]}) - Lâm ${h.lucThanTen}${dongStr}${tkStr}${moStr}${vtStr}${phucStr}`;
  }).reverse().join('\\n');

  let dtStr = '';
  if (dt.viTri === 'phuc') {
    dtStr = `Dụng Thần (Phục Tàng): ${dt.lucThan} ${dt.diaChi} (Hành ${DC_HANH[dt.diaChi]}). Lực lượng: ${state.vuongSuyDT.diem.toFixed(1)} điểm - Mức độ: ${state.vuongSuyDT.mucDo}\\n[Chi tiết đánh giá]: ${state.vuongSuyDT.nhanXet.join('; ')}`;
  } else {
    dtStr = `Dụng Thần: Hào ${dt.viTri} ${dt.lucThan} ${dt.diaChi} (Hành ${DC_HANH[dt.diaChi]}). Lực lượng: ${state.vuongSuyDT.diem.toFixed(1)} điểm - Mức độ: ${state.vuongSuyDT.mucDo}\\n[Chi tiết đánh giá]: ${state.vuongSuyDT.nhanXet.join('; ')}`;
  }

  const cacThan = (state.haoVaiTro || []).filter(h => h && h.vaiTro !== 'Dụng Thần' && h.vaiTro !== 'Bình thường').map(h => {
    return `${h.vaiTro}: Hào ${h.viTri} ${h.lucThan} ${h.diaChi} - Lực lượng: ${h.diemVS} điểm\\n[Chi tiết đánh giá]: ${h.nhanXetVS.join('; ')}`;
  }).join('\\n\\n');

  const text = `Tôi cần bạn đóng vai một chuyên gia Dịch Lý Lục Hào (theo trường phái Lưu Xương Minh) để luận giải giúp tôi quẻ sau:

1. THÔNG TIN CƠ BẢN:
- Câu hỏi sự việc: ${cauHoi}
- Ghi chú thêm từ người gieo: ${userNote || 'Không có'}
- Thời gian gieo: Ngày ${state.chiNgay} (Hành ${DC_HANH[state.chiNgay]}), Tháng ${state.chiThang} (Hành ${DC_HANH[state.chiThang]})
- Quẻ chính: ${state.banQue.ten} (Cung ${state.banQue.cung}) — [Ngoại quái: ${state.banQue.ngoai_quat} | Nội quái: ${state.banQue.noi_quat}]
- Quẻ biến: ${state.chiQue ? state.chiQue.ten + ' — [Ngoại quái: ' + state.chiQue.ngoai_quat + ' | Nội quái: ' + state.chiQue.noi_quat + ']' : 'Không có (Quẻ tĩnh)'}
- Hào Thể: H${state.banQue.the_hao} | Hào Ứng: H${state.banQue.ung_hao}
- Tuần Không: ${state.tuanKhong.join(', ')}

2. CẤU TRÚC 6 HÀO (Từ Hào 6 trên cùng xuống Hào 1):
${haos}

3. PHÂN TÍCH LỰC LƯỢNG & VAI TRÒ (Đã được phần mềm tính toán sẵn Điểm Vượng Suy):
${dtStr}

BỘ MÁY TÁC ĐỘNG (Nguyên Kỵ Cừu Tiết):
${cacThan ? cacThan : 'Không có Nguyên/Kỵ/Cừu thần phát động (Quẻ tĩnh hoặc không có hào liên quan).'}

4. YÊU CẦU LUẬN GIẢI:
Dựa trên Vượng Suy, sinh khắc của hệ thống Nguyên/Kỵ Thần đã tính ở trên, kết hợp 3 quy luật (Tham sinh quên khắc, Tham hợp quên sinh, Vì sinh mà thiệt) đối với Hào Động, và hệ thống Thủ Tượng (Hào vị, Ngũ hành, Lục thần), bạn hãy:
- "Dựng lại hiện trường" chi tiết sự việc đang diễn ra (ghép tượng hào vị, đồ vật ngũ hành, tính chất lục thần). Phân tích từng hào động ảnh hưởng thế nào đến sự việc.
- Kết luận Cát hay Hung.
- Đưa ra Ứng kỳ (thời điểm cụ thể sẽ xảy ra sự việc hoặc kết quả).`;

  navigator.clipboard.writeText(text).then(() => {
    alert('✅ Đã copy toàn bộ Data Quẻ vào Clipboard!\\n\\nBây giờ bạn có thể Paste (Dán) nội dung vào ChatGPT hoặc Claude để nhờ AI luận giải chi tiết.');
  }).catch(err => {
    console.error('Lỗi copy:', err);
    alert('Lỗi khi copy. Vui lòng cấp quyền Clipboard cho trình duyệt và thử lại!');
  });
}
// === KHỞI ĐỘNG ===
document.addEventListener('DOMContentLoaded', init);