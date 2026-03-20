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
      
      <div class="coin-group" id="group-coin-${h}">
        <div class="coin" id="coin-${h}-0" onclick="toggleCoin(${h},0,this)" title="Click để lật xu"></div>
        <div class="coin" id="coin-${h}-1" onclick="toggleCoin(${h},1,this)" title="Click để lật xu"></div>
        <div class="coin" id="coin-${h}-2" onclick="toggleCoin(${h},2,this)" title="Click để lật xu"></div>
      </div>

      <div class="direct-group" id="group-direct-${h}" style="display:none; flex:1; align-items:center; gap:1.2rem;">
         <label style="cursor:pointer; display:flex; align-items:center; gap:0.3rem">
            <input type="radio" name="am_duong_${h}" id="rad-am-${h}" value="am" checked onchange="updateDirect(${h})"> Âm
         </label>
         <label style="cursor:pointer; display:flex; align-items:center; gap:0.3rem">
            <input type="radio" name="am_duong_${h}" id="rad-duong-${h}" value="duong" onchange="updateDirect(${h})"> Dương
         </label>
         <label style="cursor:pointer; display:flex; align-items:center; gap:0.3rem; margin-left:auto; color:var(--text); font-weight:700">
            <input type="checkbox" id="chk-dong-${h}" checked onchange="updateDirect(${h})"> Động
         </label>
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

function renderHaoSymbol(score) {
  if (score === 7) return '<span style="color:var(--gold)">━━━━━</span>';
  if (score === 8) return '<span style="color:var(--text-3)">━━ ━━</span>';
  if (score === 9) return '<span style="color:var(--gold)">━━━━━</span>';
  if (score === 6) return '<span style="color:var(--text-3)">━━ ━━</span>';
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
    if (hao.laTuanKhong && !hao.laAmDong) classes.push('row-tuan-khong'); // Đã Ám Động (Xung Không thành Thực) thì không highlight TK
    if (hao.laNhapMo) classes.push('row-nhap-mo');
    if (i === 3) classes.push('noi-ngoai-border');
    row.className = classes.join(' ');
    row.dataset.haoIdx = i;

    const theUng = isThe ? 'Thế' : (isUng ? 'Ứng' : '');
    const theUngHtml = theUng ? `<span class="badge ${isThe ? 'bdg-the' : 'bdg-ung'}">${theUng}</span> ` : '';
    
    // Phục thần HTML (nay tích hợp vào Quẻ Chủ)
    const phucThanHtml = hao.phucThan ? `<div style="margin-top:6px; font-size:0.95rem; padding:4px; border:1px dashed var(--gold); border-radius:4px; background:var(--phuc-bg)">
      <span style="color:var(--gold); font-size:0.85rem">Phục Thần</span><br>
      <span class="${getLucThanClass(hao.phucThan.lucThan)}" style="font-weight:bold">${hao.phucThan.lucThan}</span><br>
      <span style="color:var(--text-2)">${hao.phucThan.diaChi} ${hao.phucThan.hanh}</span>
    </div>` : '';

    const isGK = hao.laTuanKhong && !hao.laAmDong && hao.nhanXetVS && hao.nhanXetVS.some(x=>x.includes("Giả Không")); 
    const tkBadge = (hao.laTuanKhong && !hao.laAmDong) ? (isGK ? ' <span class="badge bdg-tk-g">TKg</span>' : ' <span class="badge bdg-tk">TK</span>') : "";
    const isVM = hao.laNhapMo && hao.nhanXetVS && hao.nhanXetVS.some(x=>x.includes("Vượng Mộ")); 
    const moBadge = hao.laNhapMo ? (isVM ? ' <span class="badge bdg-mo-v">Mv</span>' : ' <span class="badge bdg-mo">Mộ</span>') : "";
    const nmBadge = hao.laNguyetMo ? ' <span class="badge bdg-nm" title="Nguyệt Mộ — chỉ mô tả trạng thái">NM</span>' : "";
    const qcBadge = hao.laQuanChan ? ' <span class="badge bdg-qc" title="Hóa Quẩn Chân — ứng kỳ trễ">QC</span>' : "";
    const amBadge = hao.laAmDong ? ' <span class="badge bdg-am">ÁĐ</span>' : "";
    const phaBadge = hao.laNhatPha ? ' <span class="badge bdg-pha">Phá</span>' : "";
    const tienBadge = hao.laTienThan ? ' <span class="badge bdg-tien">Tiến</span>' : ""; 
    const thoaiBadge = hao.laThoaiThan ? ' <span class="badge bdg-thoai">Thoái</span>' : ""; 

    const banQuaiHtml = `<div class="${getLucThanClass(hao.lucThan)}" style="font-weight:700;font-size:0.85rem;margin-bottom:2px">${hao.lucThan}</div><div style="font-size:0.8rem">${hao.diaChi} <span style="color:var(--text-3)">${hao.hanh}</span>${tkBadge}${moBadge}${nmBadge}${amBadge}${phaBadge}${qcBadge}</div><div class="hao-symbol" style="margin-top:3px">${renderHaoSymbol(state.haoScores[i])}</div>${phucThanHtml}`;

    let bienQuaiHtml = '<div style="color:var(--text-3);font-size:0.85rem">—</div>';
    if (hao.laDong) {
       bienQuaiHtml = `<div class="${getLucThanClass(hao.bienLucThan)}" style="font-weight:700;font-size:0.85rem;margin-bottom:2px">${hao.bienLucThan}</div><div style="font-size:0.8rem;color:var(--text-2)">${hao.bienDC} ${hao.bienHanh}${tienBadge}${thoaiBadge}</div><div class="hao-symbol" style="margin-top:3px">${renderHaoSymbol(hao.bienScore)}</div>`;
    }

    const vsDetailHtml = hao.vuongSuy.nhanXet.length > 0 ? `<ul style="list-style:none;padding:0;margin-top:3px;text-align:left">${hao.vuongSuy.nhanXet.map(x=>`<li style="font-size:0.75rem;color:var(--text-3);padding:1px 0">• ${x}</li>`).join('')}</ul>` : '';
    const vsHtml = `<span class="vuong-suy ${hao.vuongSuy.cssClass}">${hao.vuongSuy.mucDo} <span style="opacity:0.6">(${hao.vuongSuy.diem}đ)</span></span>${vsDetailHtml}`;

    // Cột Động (X)
    let dongCellHtml = '';
    if (hao.laDong) {
      dongCellHtml = '<span style="font-size:1.3rem;font-weight:900;color:var(--gold)">✕</span>';
    } else if (hao.laAmDong) {
      dongCellHtml = '<span style="font-size:0.85rem;font-weight:700;color:var(--purple)">ÁĐ</span>';
    }

    row.innerHTML = `<td style="font-weight:700;color:var(--text-3);font-size:0.85rem">H${hao.viTri} ${theUngHtml}</td><td style="font-size:0.8rem;color:var(--text-3)">${hao.lucThanTen}</td><td>${banQuaiHtml}</td><td style="text-align:center">${dongCellHtml}</td><td style="vertical-align:top;text-align:left;padding:0.3rem 0.6rem">${vsHtml}</td><td>${bienQuaiHtml}</td>`;
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
    sep.style.cssText = 'width:100%;font-size:0.7rem;color:var(--text-3);margin:0.3rem 0;text-align:center;';
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
  el.innerHTML = [...haoVaiTro].reverse().filter(h => h.vaiTro).map(h => {
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
  const allDong = [...state.hao6].reverse().filter(h => h.laDong || h.laAmDong);
  if (allDong.length === 0) { el.innerHTML = '<p style="color:var(--text-3,#475569);font-size:0.85rem">Không có hào động</p>'; return; }
  el.innerHTML = allDong.map(h => {
    const hd = h.bienDC ? kiemTraHoiDau(h.diaChi, h.bienDC) : null;
    const label = h.laAmDong ? '<span class="badge bdg-am">Ám Động</span>' : '<span style="color:var(--gold);font-size:0.62rem;font-weight:700">● Động</span>';
    const tiPhu = h.laTienThan ? ' <span style="color:var(--green)">→ Tiến Thần</span>' : h.laThoaiThan ? ' <span style="color:var(--red)">→ Thoái Thần</span>' : '';
    const hdLabel = hd ? `<span style="color:${hd.loai.includes('sinh') ? 'var(--green)' : 'var(--red)'};font-size:0.65rem"> [${hd.loai}]</span>` : '';
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
  
  // === DỤNG THẦN ÁM ĐỘNG ===
  if (dt.laAmDong) {
    chiTiet.push(`✨ DT Ám Động — Nhật xung hào vượng (+1.5)`);
  }

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

  state.finalScore = score;
  state.finalCatHung = catHung;

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
    if (NGU_HANH_SINH[phiHanh] === phucHanh) tuongTac = '<span style="color:var(--green)">Phi Sinh Phục ✓ (Phục có lực)</span>';
    else if (NGU_HANH_KHAC[phiHanh] === phucHanh) tuongTac = '<span style="color:var(--red)">Phi Khắc Phục ✗ (Phục bị giam)</span>';
    else if (NGU_HANH_SINH[phucHanh] === phiHanh) tuongTac = '<span style="color:var(--orange)">Phục Tiết Phi</span>';
    else tuongTac = '<span style="color:var(--text-3)">Bình thường</span>';
    return `<div style="border:1px solid var(--border-2);border-radius:5px;padding:0.4rem;margin-bottom:0.3rem;background:var(--surface-2)">
      <div style="font-size:0.7rem;color:var(--text-3)">Vị trí H${h.viTri}</div>
      <div style="font-size:0.72rem">Phi: <span class="${getLucThanClass(h.lucThan)}">${h.lucThan}</span> (${h.diaChi} ${h.hanh}) | Phục: <span class="${getLucThanClass(phuc.lucThan)}">${phuc.lucThan}</span> (${phuc.diaChi} ${phuc.hanh})</div>
      <div style="font-size:0.67rem;margin-top:0.15rem">${tuongTac}</div>
    </div>`;
  }).join('');
}

function renderLucThanPanel() {
  const el = document.getElementById('luc-than-analysis');
  if (!el) return;
  const lucThanMap = {
    'Tử Tôn': {color:'var(--green)', y:'Con cái, sức khỏe, khắc Quỷ'},
    'Thê Tài': {color:'var(--gold)', y:'Tài lộc, vợ (nam hỏi), khắc Phụ'},
    'Quan Quỷ': {color:'var(--rose)', y:'Quan chức, bệnh tật (nữ: chồng)'},
    'Phụ Mẫu': {color:'var(--cyan)', y:'Cha mẹ, văn thư, khắc Tử'},
    'Huynh Đệ': {color:'var(--purple)', y:'Anh em, cạnh tranh tài lộc'}
  };
  const grouped = {};
  state.hao6.forEach(h => { if (!grouped[h.lucThan]) grouped[h.lucThan] = []; grouped[h.lucThan].push(h); });
  el.innerHTML = Object.entries(lucThanMap).map(([lt, info]) => {
    const haos = grouped[lt] || [];
    const haosStr = haos.length ? haos.map(h => `H${h.viTri}(${h.diaChi})`).join(', ') : '<span style="color:var(--text-3)">Phục Tàng</span>';
    return `<div style="border-bottom:1px solid var(--border-1);padding:0.2rem 0"><span style="color:${info.color};font-weight:700;font-size:0.72rem">${lt}</span> <span style="color:var(--text-2);font-size:0.66rem">${haosStr}</span><div style="font-size:0.6rem;color:var(--text-3)">${info.y}</div></div>`;
  }).join('');
}

function renderThoiDiem(list) {
  const makeTdHtml = (items, color) =>
    items.map(td =>
      `<div class="thoi-diem-item" style="border-left:3px solid ${color}">
        <div class="td-ly">📍 ${td.ly_do}</div>
        <div class="td-val">⏰ ${td.thoi_diem}</div>
        <div class="td-note">💡 ${td.ghi_chu}</div>
      </div>`).join('');

  const lxmItems   = list.filter(td => td.source === 'LXM' || !td.source);
  const daHacItems = list.filter(td => td.source === 'DaHac');

  const lxmEl   = document.getElementById('thoi-diem-lxm');
  const daHacEl = document.getElementById('thoi-diem-dahac');
  const daHacCol = daHacEl ? daHacEl.closest('div[id="thoi-diem-dahac"]')?.parentElement : null;

  if (lxmEl) lxmEl.innerHTML = makeTdHtml(lxmItems, '#38bdf8');

  // Ẩn cột TH2 nếu không có ứng kỳ Dã Hạc nào
  if (daHacEl) {
    const wrapper = daHacEl.parentElement;
    if (daHacItems.length === 0) {
      wrapper.style.display = 'none';
    } else {
      wrapper.style.display = '';
      daHacEl.innerHTML = makeTdHtml(daHacItems, '#d4a843');
    }
  }
}

function highlightBangQue(haoVaiTro) {
  // Đã bỏ highlight background row theo yêu cầu để tránh nhòe / khó đọc.
}

// === BƯỚC 8: LƯU & IN ===
function renderThuTuong(dt, haoVaiTro, vs) {
  const el = document.getElementById('thu-tuong-result');
  if (!el) return;
  const doan = sinhLuanNghia(dt, haoVaiTro, vs);
  el.innerHTML = doan.map(d => {
    // Bold **text**
    const formatted = d.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--heading-color)">$1</strong>');
    return `<div class="thu-tuong-line">${formatted}</div>`;
  }).join('');
}

