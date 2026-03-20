function renderHaoInputs() {
  const container = document.getElementById('hao-inputs');
  let html = '';
  for (let h = 6; h >= 1; h--) {
    const label = h === 6 ? 'THƯỢNG' : h === 5 ? 'NGŨ' : h === 4 ? 'TỨ' : h === 3 ? 'TAM' : h === 2 ? 'NHỊ' : 'SƠ';
    const total = 6; // Mặc định 3 sấp = 6
    state.haoScores[h - 1] = total;
    const info = getScoreInfo(total);

    html += `<div class="hao-row selected" id="hao-row-${h}">
      <label>Hào ${h}<small>(${label})</small></label>
      
      <!-- Phương pháp Gieo Xu (Coins) -->
      <div class="coin-group" id="group-coin-${h}">
        <div class="coin" id="coin-${h}-0" onclick="toggleCoin(${h},0,this)" title="Click để lật xu"></div>
        <div class="coin" id="coin-${h}-1" onclick="toggleCoin(${h},1,this)" title="Click để lật xu"></div>
        <div class="coin" id="coin-${h}-2" onclick="toggleCoin(${h},2,this)" title="Click để lật xu"></div>
      </div>

      <!-- Phương pháp Nhập Trực Tiếp (Direct) -->
      <div class="direct-input-group" id="group-direct-${h}" style="display:none;">
        <div class="custom-radio-group">
          <label class="custom-radio">
            <input type="radio" name="am_duong_${h}" id="rad-am-${h}" value="am" checked onchange="updateDirect(${h})">
            <span class="radio-dot"></span> Âm
          </label>
          <label class="custom-radio">
            <input type="radio" name="am_duong_${h}" id="rad-duong-${h}" value="duong" onchange="updateDirect(${h})">
            <span class="radio-dot"></span> Dương
          </label>
        </div>

        <div class="custom-checkbox-group">
          <label class="custom-checkbox">
            <input type="checkbox" id="chk-dong-${h}" checked onchange="updateDirect(${h})">
            <span class="checkbox-box"></span> Động
          </label>
        </div>

        <div class="direct-preview">
          <div class="direct-preview-symbol" id="preview-symbol-${h}">${renderHaoSymbol(total)}</div>
          <div class="direct-preview-label" id="preview-label-${h}">${info.label}</div>
        </div>
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
  const btnAnQue = document.getElementById('btn-anque');
  if (btnAnQue) btnAnQue.disabled = false;
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
  const banQueName = document.getElementById('ban-que-name');
  if (banQueName) banQueName.textContent = state.banQue.ten;
  
  const chiQueName = document.getElementById('chi-que-name');
  if (chiQueName) chiQueName.textContent = state.chiQue ? state.chiQue.ten : '(không biến)';
  
  const cungQue = document.getElementById('cung-que');
  if (cungQue) cungQue.textContent = state.banQue.cung;
  
  const hanhCung = document.getElementById('hanh-cung');
  if (hanhCung) hanhCung.textContent = state.cungHanh;

  const tbody = document.getElementById('tbody-que');
  if (!tbody) return;
  tbody.innerHTML = '';
  for (let i = 5; i >= 0; i--) {
    const hào = state.hao6[i];
    const isThe = hào.viTri === state.banQue.the_hao;
    const isUng = hào.viTri === state.banQue.ung_hao;
    const row = document.createElement('tr');
    const classes = [];
    if (isThe) classes.push('row-the');
    if (isUng) classes.push('row-ung');
    if (hào.laDong) classes.push('row-dong');
    if (hào.laTuanKhong && !hào.laAmDong) classes.push('row-tuan-khong');
    if (hào.laNhapMo) classes.push('row-nhap-mo');
    if (i === 3) classes.push('noi-ngoai-border');
    row.className = classes.join(' ');
    row.dataset.haoIdx = i;

    const theUng = isThe ? 'Thế' : (isUng ? 'Ứng' : '');
    const theUngHtml = theUng ? `<span class="badge ${isThe ? 'bdg-the' : 'bdg-ung'}">${theUng}</span> ` : '';
    
    const phucThanHtml = hào.phucThan ? `<div style="margin-top:6px; font-size:0.95rem; padding:4px; border:1px dashed var(--gold); border-radius:4px; background:var(--phuc-bg)">
      <span style="color:var(--gold); font-size:0.85rem">Phục Thần</span><br>
      <span class="${getLucThanClass(hào.phucThan.lucThan)}" style="font-weight:bold">${hào.phucThan.lucThan}</span><br>
      <span style="color:var(--text-2)">${hào.phucThan.diaChi} ${hào.phucThan.hanh}</span>
    </div>` : '';

    const isGK = hào.laTuanKhong && !hào.laAmDong && hào.nhanXetVS && hào.nhanXetVS.some(x=>x.includes("Giả Không")); 
    const tkBadge = (hào.laTuanKhong && !hào.laAmDong) ? (isGK ? ' <span class="badge bdg-tk-g">TKg</span>' : ' <span class="badge bdg-tk">TK</span>') : "";
    const isVM = hào.laNhapMo && hào.nhanXetVS && hào.nhanXetVS.some(x=>x.includes("Vượng Mộ")); 
    const moBadge = hào.laNhapMo ? (isVM ? ' <span class="badge bdg-mo-v">Mv</span>' : ' <span class="badge bdg-mo">Mộ</span>') : "";
    const nmBadge = hào.laNguyetMo ? ' <span class="badge bdg-nm" title="Nguyệt Mộ">NM</span>' : "";
    const qcBadge = hào.laQuanChan ? ' <span class="badge bdg-qc" title="Hóa Quẩn Chân">QC</span>' : "";
    const amBadge = hào.laAmDong ? ' <span class="badge bdg-am">ÁĐ</span>' : "";
    const phaBadge = hào.laNhatPha ? ' <span class="badge bdg-pha">Phá</span>' : "";
    const tienBadge = hào.laTienThan ? ' <span class="badge bdg-tien">Tiến</span>' : ""; 
    const thoaiBadge = hào.laThoaiThan ? ' <span class="badge bdg-thoai">Thoái</span>' : ""; 

    const banQuaiHtml = `<div class="${getLucThanClass(hào.lucThan)}" style="font-weight:700;font-size:0.85rem;margin-bottom:2px">${hào.lucThan}</div><div style="font-size:0.8rem">${hào.diaChi} <span style="color:var(--text-3)">${hào.hanh}</span>${tkBadge}${moBadge}${nmBadge}${amBadge}${phaBadge}${qcBadge}</div><div class="hao-symbol" style="margin-top:3px">${renderHaoSymbol(state.haoScores[i])}</div>${phucThanHtml}`;

    let bienQuaiHtml = '<div style="color:var(--text-3);font-size:0.85rem">—</div>';
    if (hào.laDong) {
       bienQuaiHtml = `<div class="${getLucThanClass(hào.bienLucThan)}" style="font-weight:700;font-size:0.85rem;margin-bottom:2px">${hào.bienLucThan}</div><div style="font-size:0.8rem;color:var(--text-2)">${hào.bienDC} ${hào.bienHanh}${tienBadge}${thoaiBadge}</div><div class="hao-symbol" style="margin-top:3px">${renderHaoSymbol(hào.bienScore)}</div>`;
    }

    const vsDetailHtml = hào.vuongSuy.nhanXet.length > 0 ? `<ul style="list-style:none;padding:0;margin-top:3px;text-align:left">${hào.vuongSuy.nhanXet.map(x=>`<li style="font-size:0.75rem;color:var(--text-3);padding:1px 0">• ${x}</li>`).join('')}</ul>` : '';
    const vsHtml = `<span class="vuong-suy ${hào.vuongSuy.cssClass}">${hào.vuongSuy.mucDo} <span style="color:var(--text-3); font-size:0.75rem">(${hào.vuongSuy.diem}đ)</span></span>${vsDetailHtml}`;

    let dongCellHtml = '';
    if (hào.laDong) {
      dongCellHtml = '<span style="font-size:1.3rem;font-weight:900;color:var(--gold)">✕</span>';
    } else if (hào.laAmDong) {
      dongCellHtml = '<span style="font-size:0.85rem;font-weight:700;color:var(--purple)">ÁĐ</span>';
    }

    row.innerHTML = `<td style="font-weight:700;color:var(--text-3);font-size:0.85rem">H${hào.viTri} ${theUngHtml}</td><td style="font-size:0.8rem;color:var(--text-3)">${hào.lucThanTen}</td><td>${banQuaiHtml}</td><td style="text-align:center">${dongCellHtml}</td><td style="vertical-align:top;text-align:left;padding:0.3rem 0.6rem">${vsHtml}</td><td>${bienQuaiHtml}</td>`;
    row.style.cursor = 'pointer';
    row.onclick = () => chonDungThan(i);
    tbody.appendChild(row);
  }
  
  // Hiển thị tượng quẻ mini ở cột trái
  renderMiniQue();
}

function renderMiniQue() {
  const container = document.getElementById('mini-que-container');
  if (!container) return;
  container.style.display = 'flex';

  const banSymbol = document.getElementById('mini-ban-symbol');
  const banName = document.getElementById('mini-ban-name');
  const banInfo = document.getElementById('mini-ban-info');
  const chiSymbol = document.getElementById('mini-chi-symbol');
  const chiName = document.getElementById('mini-chi-name');
  const chiInfo = document.getElementById('mini-chi-info');
  const arrow = document.querySelector('.mini-que-arrow');

  // Quẻ Chủ
  if (banSymbol) {
    banSymbol.innerHTML = state.hao6.map((h, i) => {
      const score = state.haoScores[i];
      let banScore = score;
      if (score === 9) banScore = 7;
      if (score === 6) banScore = 8;
      
      const isThe = h.viTri === state.banQue.the_hao;
      const isUng = h.viTri === state.banQue.ung_hao;
      const indicator = isThe ? '<span class="mini-tu-indicator mini-tu-the">T</span>' : (isUng ? '<span class="mini-tu-indicator mini-tu-ung">U</span>' : '');
      
      return `<div class="mini-hao-wrapper"><div class="mini-hao">${renderHaoSymbol(banScore)}</div>${indicator}</div>`;
    }).reverse().join('');
  }
  if (banName) banName.textContent = state.banQue.ten;
  if (banInfo) banInfo.textContent = `Cung ${state.banQue.cung} (${state.cungHanh})`;

  // Quẻ Biến
  if (state.chiQue) {
    if (chiSymbol) {
      chiSymbol.innerHTML = state.hao6.map((h, i) => {
        const score = h.laDong ? h.bienScore : state.haoScores[i];
        let finalScore = score;
        if (score === 9) finalScore = 7;
        if (score === 6) finalScore = 8;
        return `<div class="mini-hao-wrapper"><div class="mini-hao">${renderHaoSymbol(finalScore)}</div></div>`;
      }).reverse().join('');
    }
    if (chiName) chiName.textContent = state.chiQue.ten;
    if (chiInfo) chiInfo.textContent = `Cung ${state.chiQue.cung}`;
    if (arrow) arrow.style.display = 'block';
    if (chiSymbol && chiSymbol.parentElement) chiSymbol.parentElement.style.display = 'flex';
  } else {
    if (chiSymbol) chiSymbol.innerHTML = '';
    if (chiName) chiName.textContent = '';
    if (chiInfo) chiInfo.textContent = '';
    if (arrow) arrow.style.display = 'none';
    if (chiSymbol && chiSymbol.parentElement) chiSymbol.parentElement.style.display = 'none';
  }
}

function renderDungThanButtons() {
  const container = document.getElementById('chon-dung-than-buttons');
  if (!container) return;
  container.innerHTML = '';
  state.hao6.forEach((hao, i) => {
    const btn = document.createElement('button');
    btn.className = 'chon-dt-btn';
    btn.textContent = `Hào ${hao.viTri}: ${hao.lucThan} (${hao.diaChi})`;
    btn.onclick = () => chonDungThan(i);
    container.appendChild(btn);
  });
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
      btn.textContent = `👻 H${h.viTri}: ${h.phucThan.lucThan} (${h.phucThan.diaChi}) [Phục]`;
      btn.onclick = () => chonPhucThanDT(h);
      container.appendChild(btn);
    });
  }
}

function renderVuongSuy(vs) {
  const bar = document.getElementById('vuong-suy-bar-fill');
  if (!bar) return;
  const score = vs.diem;
  bar.style.width = `${Math.min(100, Math.max(0, ((score + 6) / 12) * 100))}%`;
  bar.style.background = `var(--${vs.cssClass})`;
  const textEl = document.getElementById('vuong-suy-text');
  if (textEl) {
    textEl.innerHTML = `<span class="vuong-suy ${vs.cssClass}">${vs.mucDo}</span> <span style="color:var(--text-3);font-size:0.78rem">(điểm: ${score})</span>`;
  }
  const detailEl = document.getElementById('vuong-suy-detail');
  if (detailEl) {
    detailEl.innerHTML = (vs.nhanXet || []).map(n => `<li>• ${n}</li>`).join('');
  }
}

function renderNKCThan(haoVaiTro) {
  const el = document.getElementById('nkc-than-list');
  if (!el) return;
  el.innerHTML = [...haoVaiTro].reverse().filter(h => h.vaiTro).map(h => {
    const clsMap = {'Dụng Thần':'nkc-dung','Nguyên Thần':'nkc-nguyen','Kỵ Thần':'nkc-ky','Cừu Thần':'nkc-cuu','Tiết Thần':'nkc-tiet'};
    const cls = clsMap[h.vaiTro] || 'nkc-cuu';
    let ttBadge = '';
    if (h.vaiTro !== 'Dụng Thần') {
      const tt = danhGiaTrangThai(h);
      if (tt.voLoc) ttBadge = ' <span class="badge-voluc">Vô lực</span>';
      else if (tt.huuDung) ttBadge = ' <span class="badge-huudung">Hữu dụng</span>';
      else if (!tt.huuTu) ttBadge = ' <span class="badge-huudung">Vượng</span>';
    }
    return `<div class="nkc-item"><span class="nkc-label ${cls}">${h.vaiTro}</span> H${h.viTri}: <span class="${getLucThanClass(h.lucThan)}">${h.lucThan}</span> (${h.diaChi} ${h.hanh}) — <span class="vuong-suy ${h.vuongSuy.cssClass}">${h.vuongSuy.mucDo}</span>${ttBadge}</div>`;
  }).join('');
}

function renderDongHao() {
  const el = document.getElementById('dong-hao-analysis');
  if (!el) return;
  // Fallback to state.hao6 if state.result.bangQue is not yet populated
  const source = (state.result && state.result.bangQue) ? state.result.bangQue : state.hao6;
  const allDong = source.filter(r => r.laDong || r.laAmDong || r.isDong).reverse();
  if (allDong.length === 0) { el.innerHTML = '<p style="color:var(--text-3);font-size:0.85rem">Không có hào động</p>'; return; }
  el.innerHTML = allDong.map(h => {
    const hd = h.bienDC ? kiemTraHoiDau(h.diaChi, h.bienDC) : null;
    const label = h.laAmDong ? '<span class="badge bdg-am">Ám Động</span>' : '<span style="color:var(--gold);font-size:0.75rem;font-weight:700">● Động</span>';
    const tiPhu = h.laTienThan ? ' <span style="color:var(--green)">→ Tiến Thần</span>' : h.laThoaiThan ? ' <span style="color:var(--red)">→ Thoái Thần</span>' : '';
    const hdLabel = hd ? `<span style="color:${hd.loai.includes('sinh') ? 'var(--green)' : 'var(--red)'};font-size:0.75rem"> [${hd.loai}]</span>` : '';
    return `<div class="dong-item"><span class="d-head">H${h.viTri}</span> ${label} ${h.diaChi}→${h.bienDC||'?'}${tiPhu}${hdLabel}</div>`;
  }).join('');
}

function renderCanhBao(list) {
  const el = document.getElementById('canh-bao-list');
  if (!el) return;
  el.innerHTML = list.map(cb =>
    `<div class="canh-bao-item ${cb.level}"><span>${cb.icon}</span><span>${cb.text}</span></div>`
  ).join('') || '<p style="color:var(--text-3);font-size:0.85rem">Không có cảnh báo đặc biệt ✓</p>';
}

function renderCatHung(dt, haoVaiTro, vs) {
  const el = document.getElementById('cat-hung-result');
  if (!el) return;

  const isPhuTang = !state.hao6.some(h => h.lucThan === dt.lucThan);
  let score = vs.diem; 
  const chiTiet = [];
  
  if (dt.laAmDong) chiTiet.push(`✨ DT Ám Động — Nhật xung hào vượng (+1.5)`);

  const nguyenThans = haoVaiTro.filter(h => h.vaiTro === 'Nguyên Thần');
  const kyThans = haoVaiTro.filter(h => h.vaiTro === 'Kỵ Thần');
  const cuuThans = haoVaiTro.filter(h => h.vaiTro === 'Cừu Thần');
  const tietThans = haoVaiTro.filter(h => h.vaiTro === 'Tiết Thần');
  const ntHuuDung = nguyenThans.filter(nt => danhGiaTrangThai(nt).huuDung);

  nguyenThans.forEach(nt => {
    const tt = danhGiaTrangThai(nt);
    const dtDangDong = dt.laDong || dt.laAmDong;
    if (tt.huuDung && dtDangDong && LUC_HOP[nt.diaChi] === dt.diaChi) {
      chiTiet.push(`🔗 NT H${nt.viTri}: Tham Hợp Quên Sinh — ${nt.diaChi} hợp ${dt.diaChi}, cả 2 cùng động → NT quên sinh DT`);
    } else if (tt.voLoc) chiTiet.push(`🔇 NT H${nt.viTri} (${nt.diaChi}): Vô lực → không sinh được DT`);
    else if (tt.huuDung) {
      const bonus = nt.diemVS >= 3 ? 2.0 : 1.5;
      score += bonus;
      chiTiet.push(`💪 NT H${nt.viTri} (${nt.diaChi}): Vượng động → sinh DT (+${bonus})`);
    } else if (!tt.huuTu && !nt.laDong) {
      score += 0.5;
      chiTiet.push(`🤝 NT H${nt.viTri} (${nt.diaChi}): Vượng tĩnh → sinh nhẹ (+0.5)`);
    }
  });

  kyThans.forEach(ky => {
    const tt = danhGiaTrangThai(ky);
    if ((ky.laDong || ky.laAmDong) && ntHuuDung.length > 0) chiTiet.push(`🔄 KT H${ky.viTri} (${ky.diaChi}): Tham Sinh Quên Khắc — KT + NT cùng động → KT bỏ khắc DT, chuyển sinh NT`);
    else if (tt.voLoc) { score += 0.5; chiTiet.push(`✅ KT H${ky.viTri} (${ky.diaChi}): Vô lực → không hại được DT (+0.5)`); }
    else if (tt.huuDung) {
      const penalty = ky.diemVS >= 3 ? -2.5 : -1.5;
      score += penalty;
      chiTiet.push(`⚡ KT H${ky.viTri} (${ky.diaChi}): Vượng động → khắc DT (${penalty})`);
    }
  });

  cuuThans.forEach(cuu => {
    const tt = danhGiaTrangThai(cuu);
    if (tt.huuDung) {
      const ntCoLuc = nguyenThans.some(nt => !danhGiaTrangThai(nt).voLuc);
      if (ntCoLuc) { score -= 1.5; chiTiet.push(`💀 CT H${cuu.viTri} (${cuu.diaChi}): Động → khắc NT + sinh KT (-1.5)`); }
    }
  });

  tietThans.forEach(tiet => {
    const tt = danhGiaTrangThai(tiet);
    if (tt.huuDung && tiet.diemVS >= 2) {
      const drain = tiet.diemVS >= 4 ? -2.0 : -1.0;
      score += drain;
      chiTiet.push(`🩸 TiT H${tiet.viTri} (${tiet.diaChi}): Vì Sinh mà Thiệt — Tiết Thần vượng động rút khí DT (${drain})`);
    }
  });

  let catHung, detail;
  if (isPhuTang) { catHung = '⚠️ Phục Tàng'; detail = 'Dụng Thần bị ẩn'; }
  else if (score >= 4) { catHung = '✅ Đại Cát'; detail = 'Dụng Thần vượng mạnh'; }
  else if (score >= 2) { catHung = '🟢 Cát'; detail = 'Dụng Thần khá mạnh'; }
  else if (score >= 0) { catHung = '🟡 Bình'; detail = 'Lực lượng cân bằng'; }
  else if (score >= -2) { catHung = '🟠 Tiểu Hung'; detail = 'Dụng Thần suy nhược'; }
  else { catHung = '🔴 Đại Hung'; detail = 'Dụng Thần cực suy'; }

  state.finalScore = score;
  state.finalCatHung = catHung;
  const chiTietHtml = chiTiet.length > 0 ? `<ul class="cat-hung-chitiet">${chiTiet.map(c => `<li>• ${c}</li>`).join('')}</ul>` : '';
  const cls = score >= 0.5 ? 'dai-cat' : score > 0 ? 'cat' : score === 0 ? 'binh-hoa' : score > -0.5 ? 'hung' : 'dai-hung';
  el.innerHTML = `<div class="cat-hung-result ${cls}">
    <div class="cat-label">${catHung}</div>
    <div class="cat-note">${detail}</div>
    <div style="font-size:0.75rem;color:var(--text-3);margin-top:0.3rem">Điểm tổng hợp: ${score.toFixed(1)}</div>
    ${chiTietHtml}
  </div>`;
}

function renderPhiPhuc() {
  const el = document.getElementById('phi-phuc-analysis');
  if (!el) return;
  const phucThans = state.hao6.filter(h => h.phucThan).reverse();
  if (phucThans.length === 0) {
    el.innerHTML = '<p style="color:var(--text-3);font-size:0.85rem">Không có Phục Thần ✓</p>'; return;
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
      <div style="font-size:0.75rem;color:var(--text-3)">Vị trí H${h.viTri}</div>
      <div style="font-size:0.8rem">Phi: <span class="${getLucThanClass(h.lucThan)}">${h.lucThan}</span> (${h.diaChi} ${h.hanh}) | Phục: <span class="${getLucThanClass(phuc.lucThan)}">${phuc.lucThan}</span> (${phuc.diaChi} ${phuc.hanh})</div>
      <div style="font-size:0.75rem;margin-top:0.15rem">${tuongTac}</div>
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
    return `<div style="border-bottom:1px solid var(--border-1);padding:0.2rem 0"><span style="color:${info.color};font-weight:700;font-size:0.75rem">${lt}</span> <span style="color:var(--text-2);font-size:0.72rem">${haosStr}</span><div style="font-size:0.72rem;color:var(--text-3)">${info.y}</div></div>`;
  }).join('');
}

function renderThoiDiem(list) {
  const makeTdHtml = (items, color) => 
    items.length > 0 ? items.map(td =>
      `<div class="thoi-diem-item" style="border-left:3px solid ${color}">
        <div class="td-ly">📍 ${td.ly_do}</div>
        <div class="td-val">⏰ ${td.thoi_diem}</div>
        <div class="td-note">💡 ${td.ghi_chu}</div>
      </div>`).join('') : '<p style="color:var(--text-3);font-size:0.75rem;padding:0.5rem">Không có gợi ý cụ thể</p>';

  const lxmItems = list.filter(td => td.source === 'LXM' || !td.source);
  const daHacItems = list.filter(td => td.source === 'DaHac');

  const lxmEl = document.getElementById('thoi-diem-lxm');
  const daHacEl = document.getElementById('thoi-diem-dahac');
  const th1Container = document.getElementById('th1-container');
  const th2Container = document.getElementById('th2-container');
  const th1Label = document.getElementById('th1-label');
  const th2Label = document.getElementById('th2-label');

  if (lxmEl) lxmEl.innerHTML = makeTdHtml(lxmItems, 'var(--cyan)');
  if (daHacEl) daHacEl.innerHTML = makeTdHtml(daHacItems, 'var(--gold)');

  // Logic hiển thị tiêu đề TH1/TH2
  const showBoth = lxmItems.length > 0 && daHacItems.length > 0;
  if (th1Container && th1Label) {
    th1Container.style.display = lxmItems.length > 0 ? '' : 'none';
    th1Label.textContent = showBoth ? 'TH1: Lưu Xương Minh' : 'Lưu Xương Minh';
  }
  if (th2Container && th2Label) {
    th2Container.style.display = daHacItems.length > 0 ? '' : 'none';
    th2Label.textContent = showBoth ? 'TH2: Dã Hạc' : 'Dã Hạc';
  }
}

function highlightBangQue(haoVaiTro) {
  // Đã bỏ highlight background row theo yêu cầu để tránh nhòe / khó đọc.
}

function renderThuTuong(dt, haoVaiTro, vs) {
  const el = document.getElementById('thu-tuong-result');
  if (!el) return;
  const doan = sinhLuanNghia(dt, haoVaiTro, vs);
  el.innerHTML = doan.map(d => {
    const formatted = d.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--heading-color)">$1</strong>');
    return `<div class="thu-tuong-line">${formatted}</div>`;
  }).join('');
}
