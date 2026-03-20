function sinhLuanNghia(dt, haoVaiTro, vs) {
  const doan = [];
  const dtHanh = DC_HANH[dt.diaChi];
  const lucThanTen = dt.lucThanTen; // Lục Thần trên hào DT
  const lucThanInfo = LUC_THAN_Y_TUONG[lucThanTen];
  const loaiViec = document.getElementById('loai-viec')?.value || '';

  // Helper: Lấy thông tin Hào vị + Ngũ hành
  const getCanhTuong = (viTri, hanh) => {
    if (viTri === 'phuc') return ''; // Phục thần không có hào vị
    const hv = HAO_VI_Y_TUONG[viTri];
    const nh = NGU_HANH_Y_TUONG[hanh];
    if (!hv || !nh) return '';
    return `*(Tại H${viTri}: ${hv.khongGian}/${hv.coThe} — mang hành ${hanh}: ${nh})*`;
  };

  // === 1. MỞ ĐẦU: Dụng Thần & Lục Thần ===
  const dtLucThan = dt.lucThan; // Lục Thân
  const dtCanhTuong = getCanhTuong(dt.viTri, dtHanh);
  let moDau = `Dụng Thần là **${dtLucThan}** (${dt.diaChi} ${dtHanh}), hào ${dt.viTri} ${dtCanhTuong}`;
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
    const ntHanh = DC_HANH[nt.diaChi];
    const canhTuong = getCanhTuong(nt.viTri, ntHanh);

    if (tt.huuDung) {
      const hdCheck = nt.bienDC ? kiemTraHoiDau(nt.diaChi, nt.bienDC) : null;
      let text = `💚 Nguyên Thần ${nt.lucThan} H${nt.viTri}${ltHint} vượng động ${canhTuong} → ${TUONG_SINH_Y_TUONG.haoDong}`;
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
    const kyHanh = DC_HANH[ky.diaChi];
    const canhTuong = getCanhTuong(ky.viTri, kyHanh);

    // Tham Sinh Quên Khắc
    const ntHuuDung = nguyenThans.filter(n => danhGiaTrangThai(n).huuDung);
    if ((ky.laDong || ky.laAmDong) && ntHuuDung.length > 0) {
      doan.push(`🔄 Kỵ Thần ${ky.lucThan} H${ky.viTri}${ltHint} ${canhTuong} — Tham Sinh Quên Khắc: ban đầu bị cản trở nhưng có người hòa giải, cuối cùng thành.`);
    } else if (tt.huuDung) {
      let hungText = TUONG_KHAC_Y_TUONG.kyKhacDT;
      if (ltInfo && ltInfo.hung) hungText += `. ${ltInfo.icon} ${ky.lucThanTen}: ${ltInfo.hung}`;
      doan.push(`⚡ Kỵ Thần ${ky.lucThan} H${ky.viTri}${ltHint} vượng động ${canhTuong} khắc DT — ${hungText}.`);
    } else if (tt.voLuc) {
      doan.push(`✅ Kỵ Thần ${ky.lucThan} H${ky.viTri}${ltHint} vô lực — kẻ cản trở suy yếu, không gây hại.`);
    }
  });

  cuuThans.forEach(cuu => {
    const tt = danhGiaTrangThai(cuu);
    const canhTuong = getCanhTuong(cuu.viTri, DC_HANH[cuu.diaChi]);
    if (tt.huuDung) {
      doan.push(`💀 Cừu Thần ${cuu.lucThan} H${cuu.viTri} động ${canhTuong} — khắc Nguyên Thần (cắt nguồn trợ) đồng thời sinh Kỵ Thần (bơm sức cho kẻ thù). Tình huống nguy hiểm gấp bội.`);
    }
  });

  tietThans.forEach(tiet => {
    const tt = danhGiaTrangThai(tiet);
    const canhTuong = getCanhTuong(tiet.viTri, DC_HANH[tiet.diaChi]);
    if (tt.huuDung && tiet.diemVS >= 2) {
      doan.push(`🩸 Tiết Thần ${tiet.lucThan} H${tiet.viTri} vượng động ${canhTuong} — Vì Sinh mà Thiệt: dù DT có lực nhưng bị tiết khí nghiêm trọng, kiếm được bao nhiêu hao bấy nhiêu.`);
    }
  });

  // === 6. KẾT LUẬN ===
  const catHung = state.finalCatHung || (vs.diem >= 2 ? 'Cát' : vs.diem >= 0 ? 'Bình' : 'Hung');
  const finalScore = state.finalScore !== undefined ? state.finalScore : vs.diem;

  if (catHung.includes('Cát')) {
    doan.push(`🏁 **Kết luận: ${catHung}** — Tổng lực lượng (bao gồm tương tác sinh khắc trong quẻ) đạt ${finalScore.toFixed(1)} điểm. Mưu sự thuận lợi, sự việc có khả năng thành công.`);
  } else if (catHung.includes('Bình') || catHung.includes('Phục Tàng')) {
    doan.push(`🏁 **Kết luận: ${catHung}** — Tổng lực lượng đạt ${finalScore.toFixed(1)} điểm. Dụng thần ở thế giằng co hoặc tiềm ẩn, kết quả còn chờ thời cơ, cần xem ứng kỳ.`);
  } else {
    doan.push(`🏁 **Kết luận: ${catHung}** — Tổng lực lượng bị đè nén/xung phá còn ${finalScore.toFixed(1)} điểm. Mưu sự khó thành, nhiều cản trở, cần hết sức thận trọng.`);
  }

  return doan;
}
