function getScoreInfo(total) {
  switch (total) {
    case 6:
      return { symbol: "━━ ━━ ✕", label: "Âm động", color: "var(--red)" };
    case 7:
      return { symbol: "━━━━━", label: "Dương tĩnh", color: "var(--gold)" };
    case 8:
      return { symbol: "━━ ━━", label: "Âm tĩnh", color: "var(--text-3)" };
    case 9:
      return { symbol: "━━━━━ ○", label: "Dương động", color: "var(--red)" };
    default:
      return { symbol: "—", label: "", color: "var(--text-2)" };
  }
}

// === BƯỚC 1: THỜI GIAN ===
function scoreToYinYang(score) {
  return score === 7 || score === 9 ? 1 : 0; // 1=dương, 0=âm
}
function isDong(score) {
  return score === 6 || score === 9;
}

function xacDinhQuai(s1, s2, s3) {
  const key = "" + scoreToYinYang(s1) + scoreToYinYang(s2) + scoreToYinYang(s3);
  return QUAI_MAP[key];
}

function timQue(noi, ngoai) {
  return QUE_64.find((q) => q.noi_quat === noi && q.ngoai_quat === ngoai);
}

function anQue() {
  if (!state.canNgay || !state.chiNgay || !state.chiThang) {
    showToast("Vui lòng nhập thông tin thời gian (Bước 1) trước!", "warning");
    return;
  }
  // 1. Xác định quái
  const noi = xacDinhQuai(
    state.haoScores[0],
    state.haoScores[1],
    state.haoScores[2],
  );
  const ngoai = xacDinhQuai(
    state.haoScores[3],
    state.haoScores[4],
    state.haoScores[5],
  );
  state.banQue = timQue(noi, ngoai);
  if (!state.banQue) {
    showToast("Không tìm thấy quẻ! Vui lòng kiểm tra lại.", "error");
    return;
  }
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
    // Dã Hạc: chỉ Nhật Mộ (và Động Mộ/Hóa Mộ) mới là Nhập Mộ thật ảnh hưởng cát hung
    // Nguyệt Mộ chỉ dùng để mô tả trạng thái, không dùng đoán cát hung
    const nhapMo = state.chiNgay === moAddr; // Nhật Mộ
    const nguyetMo = !nhapMo && state.chiThang === moAddr; // Nguyệt Mộ (chỉ mô tả)
    let bienDC = null,
      bienHanh = null,
      bienLucThan = null,
      bienScore = null;
    if (state.haoDong.includes(i) && state.chiQue) {
      bienDC = state.chiQue.dia_chi[i];
      bienHanh = DC_HANH[bienDC];
      bienLucThan = tinhLucThan(state.cungHanh, bienDC);
      bienScore = state.haoScores[i] === 6 ? 7 : 8;
    }
    return {
      viTri: i + 1,
      diaChi: dc,
      hanh: haoHanh,
      lucThan,
      lucThanTen: lucThanArr[i],
      laTuanKhong: state.tuanKhong.includes(dc),
      laNhapMo: nhapMo,
      laNguyetMo: nguyetMo, // Dã Hạc: Nguyệt Mộ chỉ mô tả trạng thái
      laDong: state.haoDong.includes(i),
      bienDC,
      bienHanh,
      bienLucThan,
      bienScore,
      vuongSuy: null, // Sẽ được tính lại trong Sweep 2-pass
      laTienThan: false,
      laThoaiThan: false,
      laQuanChan: false, // Hóa Quẩn Chân (Dã Hạc)
    };
  });

  // 6. Tìm Phục Thần (nếu thiếu Lục Thân)
  const lucThanCoMat = state.hao6.map((h) => h.lucThan);
  const tatCaLucThan = ["Thê Tài", "Quan Quỷ", "Tử Tôn", "Phụ Mẫu", "Huynh Đệ"];
  const lucThanThieu = tatCaLucThan.filter((lt) => !lucThanCoMat.includes(lt));

  if (lucThanThieu.length > 0) {
    const batThuanQuai = timQue(state.banQue.cung, state.banQue.cung);
    lucThanThieu.forEach((ltThieu) => {
      const lineIdx = batThuanQuai.dia_chi.findIndex(
        (dcBT) => tinhLucThan(state.cungHanh, dcBT) === ltThieu,
      );
      if (lineIdx >= 0) {
        const dcPhuc = batThuanQuai.dia_chi[lineIdx];
        state.hao6[lineIdx].phucThan = {
          lucThan: ltThieu,
          diaChi: dcPhuc,
          hanh: DC_HANH[dcPhuc],
        };
      }
    });
  }

  // 7. Phân Tích Vượng Suy (2-Pass Sweep)
  // PASS 1: Base Strength (Nhật / Nguyệt)
  state.hao6.forEach((hao) => {
    hao.diemVS = 0;
    hao.nhanXetVS = [];
    hao.laAmDong = false;
    hao.laNhatPha = false;
    const hh = hao.hanh;
    const nk = state.chiThang;
    const nh = DC_HANH[nk];
    const nt = state.chiNgay;
    const nth = DC_HANH[nt];

    // NGUYỆT KIẾN
    if (nk === hao.diaChi) {
      hao.diemVS += 4;
      hao.nhanXetVS.push("Nguyệt Kiến (Cực vượng)");
    } else if (LUC_XUNG[nk] === hao.diaChi) {
      hao.diemVS -= 5;
      hao.nhanXetVS.push("Nguyệt Phá (Xung vỡ)");
    } else if (LUC_HOP[nk] === hao.diaChi) {
      if (NGU_HANH_KHAC[nh] === hh) {
        hao.diemVS -= 3;
        hao.nhanXetVS.push("Nguyệt Khắc (Trong hợp có khắc)");
      } else {
        hao.diemVS += 1;
        hao.nhanXetVS.push("Nguyệt Hợp");
      }
    } else if (NGU_HANH_SINH[nh] === hh) {
      hao.diemVS += 1;
      hao.nhanXetVS.push("Nguyệt Sinh");
    } else if (nh === hh) {
      hao.diemVS += 3;
      hao.nhanXetVS.push("Nguyệt Vượng (Tỷ hòa)");
    } else if (NGU_HANH_KHAC[nh] === hh) {
      hao.diemVS -= 4;
      hao.nhanXetVS.push("Nguyệt Khắc");
    }

    // NHẬT THẦN
    if (nt === hao.diaChi) {
      hao.diemVS += 4;
      hao.nhanXetVS.push("Nhật Thần (Cực vượng)");
    } else if (LUC_XUNG[nt] === hao.diaChi) {
      if (hao.laTuanKhong && !hao.laDong) {
        // Dã Hạc: "Xung Không thành Thực" — hào Tuần Không bị Nhật xung → Ám Động đặc biệt
        hao.diemVS += 1;
        hao.nhanXetVS.push("Ám Động (Xung Không thành Thực)");
        hao.laAmDong = true;
      } else if (hao.diemVS >= 1 && !hao.laDong) {
        hao.diemVS += 1;
        hao.nhanXetVS.push("Ám Động (Nhật Xung Hào Vượng)");
        hao.laAmDong = true;
      } else {
        hao.diemVS -= 2;
        hao.nhanXetVS.push("Nhật Phá (Nhật Xung Hào Suy)");
        hao.laNhatPha = true;
      }
    } else if (LUC_HOP[nt] === hao.diaChi) {
      if (NGU_HANH_KHAC[nth] === hh) {
        hao.diemVS -= 2;
        hao.nhanXetVS.push("Nhật Khắc (Trong hợp có khắc)");
      } else {
        hao.diemVS += 1;
        hao.nhanXetVS.push("Nhật Hợp");
      }
    } else if (NGU_HANH_SINH[nth] === hh) {
      hao.diemVS += 2;
      hao.nhanXetVS.push("Nhật Sinh");
    } else if (nth === hh) {
      hao.diemVS += 3;
      hao.nhanXetVS.push("Nhật Vượng (Tỷ hòa)");
    } else if (NGU_HANH_KHAC[nth] === hh) {
      hao.diemVS -= 3;
      hao.nhanXetVS.push("Nhật Khắc");
    }

    // HÀO ĐỘNG (Thêm +1.5 lực nền vì mang năng lượng chủ động)
    if (hao.laDong) {
      hao.diemVS += 1.5;
      hao.nhanXetVS.push("Hào Động (+1.5 lực nền)");
    }

    // Xử lý TUẦN KHÔNG & NHẬP MỘ sau khi có điểm nền
    if (hao.laTuanKhong && !hao.laAmDong) {
      // Nếu đã thành Ám Động (Xung Không thành Thực) thì không xét Tuần Không nữa
      if (hao.diemVS < 1) {
        hao.diemVS -= 2;
        hao.nhanXetVS.push("Tuần Không (Chân Không - Vô lực)");
      } else {
        hao.nhanXetVS.push("Tuần Không (Giả Không - Chờ ứng kỳ)");
      }
    }
    if (hao.laNhapMo) {
      // Dã Hạc: Nhật Mộ mới là Nhập Mộ thật (ảnh hưởng cát hung)
      if (hao.diemVS < 1) {
        hao.diemVS -= 2;
        hao.nhanXetVS.push("Nhập Mộ (Suy Mộ - Bế tắc)");
      } else {
        hao.nhanXetVS.push("Nhập Mộ (Vượng Mộ - Kho tàng)");
      }
    }
    if (hao.laNguyetMo) {
      // Dã Hạc: Nguyệt Mộ chỉ mô tả trạng thái, KHÔNG ảnh hưởng cát hung
      hao.nhanXetVS.push("Nguyệt Mộ (Mô tả: trạng thái trì trệ, mơ hồ)");
    }
  });

  // PASS 1.5: Hóa Hồi Đầu & Tiến/Thoái/Ngâm - Hào biến tác động lại chính nó
  state.hao6.forEach((hao) => {
    if (hao.laDong && hao.bienDC) {
      if (hao.diaChi === hao.bienDC) {
        hao.diemVS -= 1;
        hao.nhanXetVS.push("Hóa Phục Ngâm (-1 lực)");
      } else if (TIEN_THAN[hao.diaChi] === hao.bienDC) {
        hao.diemVS += 1;
        hao.nhanXetVS.push("Hóa Tiến Thần (+2 lực)");
        hao.laTienThan = true;
      } else if (THOAI_THAN[hao.diaChi] === hao.bienDC) {
        hao.diemVS -= 1;
        hao.nhanXetVS.push("Hóa Thoái Thần (-2 lực, vô hiệu)");
        hao.laThoaiThan = true;
      } else {
        const bienHanh = DC_HANH[hao.bienDC];
        // Dã Hạc: Hóa Quẩn Chân = hào động hóa ra hào có Lục Hợp với chính nó
        // Không ảnh hưởng mạnh đến cát hung (Giả Quẩn Chân phổ biến)
        // nhưng ứng kỳ bị trễ — cần chờ ngày Xung khai Quẩn Chân
        if (LUC_HOP[hao.bienDC] === hao.diaChi) {
          hao.laQuanChan = true;
          hao.nhanXetVS.push(
            `Hóa Quẩn Chân (${hao.diaChi}↔${hao.bienDC} Lục Hợp — ứng kỳ trễ)`,
          );
          // Không cộng điểm vì Quẩn Chân làm trói buộc chứ không giúp ích
        } else if (NGU_HANH_SINH[bienHanh] === hao.hanh) {
          hao.diemVS += 1;
          hao.nhanXetVS.push(`Hóa Hồi Đầu Sinh (${hao.bienDC} sinh)`);
        } else if (NGU_HANH_KHAC[bienHanh] === hao.hanh) {
          hao.diemVS -= 1;
          hao.nhanXetVS.push(`Hóa Hồi Đầu Khắc (${hao.bienDC} khắc)`);
        } else if (LUC_XUNG[hao.bienDC] === hao.diaChi) {
          hao.diemVS -= 1;
          hao.nhanXetVS.push("Hóa Quái Lục Xung (Phản Ngâm)");
        } else if (LUC_HOP[hao.bienDC] === hao.diaChi) {
          hao.diemVS += 1;
          hao.nhanXetVS.push("Hóa Quái Lục Hợp");
        }
      }
    }
  });

  // PASS 2: Tương tác chéo
  const dongVaAmDong = state.hao6.filter((h) => h.laDong || h.laAmDong);
  dongVaAmDong.forEach((d) => {
    // Vô hiệu hóa tác dụng sinh/khắc của hào nếu thoái thần hoặc suy chân không/suy mộ
    if (d.laThoaiThan) return;
    if (d.laTuanKhong && d.diemVS < 1) return;
    if (d.laNhapMo && d.diemVS < 1) return;

    state.hao6.forEach((hao) => {
      if (hao.viTri === d.viTri) return; // Bỏ qua tự thân
      const tStr = d.laAmDong ? "Ám Động" : "Động";
      const vTru = d.laAmDong ? 1.0 : 1.5;

      if (NGU_HANH_SINH[d.hanh] === hao.hanh) {
        hao.diemVS += vTru;
        hao.nhanXetVS.push(`Nhờ Hào ${d.viTri} (${tStr}) sinh`);
        d.diemVS -= d.laAmDong ? 0.5 : 1;
        d.nhanXetVS.push(`Tiết khí (Vì sinh hào ${hao.viTri})`);
      } else if (NGU_HANH_KHAC[d.hanh] === hao.hanh) {
        hao.diemVS -= vTru;
        hao.nhanXetVS.push(`Bị Hào ${d.viTri} (${tStr}) khắc`);
      } else if (LUC_XUNG[d.diaChi] === hao.diaChi) {
        hao.diemVS -= vTru;
        hao.nhanXetVS.push(`Bị Hào ${d.viTri} (${tStr}) xung`);
      } else if (LUC_HOP[d.diaChi] === hao.diaChi) {
        hao.diemVS += Math.max(vTru - 0.5, 0.5);
        hao.nhanXetVS.push(`Được Hào ${d.viTri} (${tStr}) hợp`);
      }
    });
  });

  // Gán vuongSuy sau khi xong PASS 2
  state.hao6.forEach((hao) => {
    hao.vuongSuy = getMucDoVuongSuy(hao.diemVS, hao.nhanXetVS);
  });

  renderBangQue();
  document.getElementById("step-3").style.display = "block";
  document.getElementById("step-4").style.display = "block";
  document.getElementById("step-prompt").style.display = "block";
  const placeholder = document.getElementById("center-placeholder");
  if (placeholder) placeholder.style.display = "none";
  renderDungThanButtons();
}

function tinhLucThan(cungHanh, diaChi) {
  const haoHanh = DC_HANH[diaChi];
  if (haoHanh === cungHanh) return "Huynh Đệ";
  if (NGU_HANH_SINH[cungHanh] === haoHanh) return "Tử Tôn";
  if (NGU_HANH_KHAC[cungHanh] === haoHanh) return "Thê Tài";
  if (NGU_HANH_KHAC[haoHanh] === cungHanh) return "Quan Quỷ";
  if (NGU_HANH_SINH[haoHanh] === cungHanh) return "Phụ Mẫu";
  return "—";
}

function tinhLucThanArr(canNgay) {
  const startIdx = LUC_THAN_START[canNgay] || 0;
  return Array.from(
    { length: 6 },
    (_, i) => LUC_THAN_ORDER[(startIdx + i) % 6],
  );
}

function getMucDoVuongSuy(diem, nhanXet) {
  let mucDo, cssClass;
  if (diem >= 5) {
    mucDo = "Cực vượng";
    cssClass = "vs-cuc-vuong";
  } else if (diem >= 3) {
    mucDo = "Vượng";
    cssClass = "vs-vuong";
  } else if (diem >= 1) {
    mucDo = "Bình hòa";
    cssClass = "vs-binh-hoa";
  } else if (diem > -2) {
    mucDo = "Hơi suy";
    cssClass = "vs-hoi-suy";
  } else if (diem >= -3) {
    mucDo = "Suy";
    cssClass = "vs-suy";
  } else {
    mucDo = "Cực suy";
    cssClass = "vs-cuc-suy";
  }

  return { diem, mucDo, cssClass, nhanXet };
}

function nguocSinh(hanh) {
  // Hành nào sinh ra hanh?
  for (const [k, v] of Object.entries(NGU_HANH_SINH)) {
    if (v === hanh) return k;
  }
  return null;
}

function phanLoaiThan(dungThanHanh, haoHanh) {
  if (NGU_HANH_SINH[haoHanh] === dungThanHanh) return "Nguyên Thần";
  if (NGU_HANH_KHAC[haoHanh] === dungThanHanh) return "Kỵ Thần";
  if (NGU_HANH_SINH[dungThanHanh] === haoHanh) return "Tiết Thần";
  const nguyenHanh = nguocSinh(dungThanHanh);
  if (nguyenHanh && NGU_HANH_KHAC[haoHanh] === nguyenHanh) return "Cừu Thần";
  return null;
}

function kiemTraHoiDau(diaChi, bienDC) {
  if (!bienDC) return null;
  const gocHanh = DC_HANH[diaChi];
  const bienHanh = DC_HANH[bienDC];
  if (NGU_HANH_SINH[bienHanh] === gocHanh)
    return { loai: "Hồi đầu sinh", yNghia: "Tốt — lực gốc tăng" };
  if (NGU_HANH_KHAC[bienHanh] === gocHanh)
    return { loai: "Hồi đầu khắc", yNghia: "Xấu — tự hủy hoại" };
  return null;
}

// === HELPERS: Đánh giá trạng thái hào (Hữu dụng / Vô lực) ===
function isHuuTu(hao) {
  // Hào hưu tù = KHÔNG được Nguyệt Kiến/Nhật Thần sinh/vượng/tỷ hòa
  const tags = hao.nhanXetVS || [];
  return !tags.some(
    (t) =>
      t.includes("Nguyệt Kiến") ||
      t.includes("Nguyệt Vượng") ||
      t.includes("Nguyệt Sinh") ||
      t.includes("Nguyệt Hợp") ||
      t.includes("Nhật Kiến") ||
      t.includes("Nhật Vượng") ||
      t.includes("Nhật Sinh") ||
      t.includes("Nhật Hợp"),
  );
}

// === HELPERS: Chuyển đổi Chi sang tiếng Việt cho lunar-js ===
const VIET_ZHI_MAP = {
  子: "Tý",
  丑: "Sửu",
  寅: "Dần",
  卯: "Mão",
  辰: "Thìn",
  巳: "Tị",
  午: "Ngọ",
  未: "Mùi",
  申: "Thân",
  酉: "Dậu",
  戌: "Tuất",
  亥: "Hợi",
};

/**
 * Tìm các ngày cụ thể (Dương lịch) theo Chi kể từ ngày gieo quẻ
 */
function getNextDatesByChi(targetChi, count = 2) {
  const startSolarStr = document.getElementById("duong-lich").value;
  if (!startSolarStr || !targetChi) return [];

  const results = [];
  try {
    const [y, m, d] = startSolarStr.split("-").map(Number);
    let current = Solar.fromYmd(y, m, d); // Bắt đầu từ ngày gieo

    let limit = 365; // Tìm trong vòng 1 năm
    while (results.length < count && limit > 0) {
      const lunar = current.getLunar();
      const currentZhi = VIET_ZHI_MAP[lunar.getDayZhi()] || lunar.getDayZhi();

      if (currentZhi === targetChi) {
        results.push({
          solar: `${current.getDay()}/${current.getMonth()}`,
          full: current.toYmd(),
        });
      }
      current = current.next(1);
      limit--;
    }
  } catch (e) {
    console.error("Lỗi getNextDatesByChi:", e);
  }
  return results;
}

function formatWithDates(chiName, count = 2) {
  const dates = getNextDatesByChi(chiName, count);
  if (dates.length === 0) return chiName;
  return `${chiName} (ngày ${dates.map((d) => d.solar).join(", ")})`;
}

function danhGiaTrangThai(hao) {
  const huuTu = isHuuTu(hao);
  const tags = hao.nhanXetVS || [];
  // 7 điều kiện vô lực (theo giáo trình Lưu Xương Minh)
  const voLuc =
    huuTu &&
    ((!hao.laDong && !hao.laAmDong) || // Hưu tù + an tĩnh
      hao.laThoaiThan || // Hưu tù + hóa thoái
      (hao.laTuanKhong && hao.diemVS < 1) || // Hưu tù + Chân Không
      (hao.laNhapMo && hao.diemVS < 1) || // Hưu tù + Suy Mộ
      tags.some(
        (t) =>
          t.includes("Hồi Đầu Khắc") ||
          t.includes("Phản Ngâm") ||
          t.includes("Nguyệt Phá"),
      )); // Hưu tù + bị hóa khắc/phá

  // Dã Hạc: Cảnh báo Quẻ Tâm Tính — khi Quan Quỷ trì Thế (hào 5 hoặc hào Thế)
  // Quẻ có thể phản ánh nội tâm lo lắng của người hỏi, không phải thực tế khách quan
  const canhBaoTamTinh =
    (hao.viTri === 5 || hao.vitriThe) && hao.lucThan === "Quan Quỷ";

  return {
    huuTu,
    voLuc,
    huuDung: !voLuc && (hao.laDong || hao.laAmDong),
    canhBaoTamTinh,
    giaiThich: voLuc
      ? "Vô lực — hưu tù + bị chế ngự"
      : huuTu
        ? "Hưu tù — chưa bị chế ngự hoàn toàn"
        : "Vượng tướng — có lực",
  };
}

function duDoanThoiDiem(dt, nguyetKien, nhatThan, tuanKhong, haoVaiTro) {
  const goiY = [];
  const dungThanDC = dt.diaChi;
  const haoHanh = DC_HANH[dungThanDC];
  const dtVS = dt.vuongSuy || { diem: 0 };
  const isDong = dt.laDong || dt.laAmDong;

  // RULE PRIORITY: 1. Không -> 2. Mộ -> 3. Hợp -> 4. Phá -> 5. Phục -> 6. Quẩn Chân -> 7. Động/Tĩnh

  // 1. TUẦN KHÔNG (Hào vắng mặt)
  if (tuanKhong.includes(dungThanDC)) {
    if (dtVS.diem < -3) {
      const item = {
        ly_do: "🕳️ Chân Không (Vô khí)",
        thoi_diem: "Không có ứng kỳ",
        ghi_chu: "DT quá yếu lại gặp Không ➔ vĩnh viễn không thực hiện được.",
      };
      goiY.push({ ...item, source: "LXM" });
      goiY.push({ ...item, source: "DaHac" });
      return goiY;
    }
    const xuatKhong = formatWithDates(dungThanDC);
    const xungKhong = formatWithDates(LUC_XUNG[dungThanDC]);

    goiY.push({
      ly_do: "🕳️ Tuần Không",
      thoi_diem: `Xuất Không: ${xuatKhong} | Xung Không: ${xungKhong}`,
      ghi_chu: "DT vắng mặt tạm thời — sự việc ứng sau khi thoát Không",
      source: "LXM",
    });
    goiY.push({
      ly_do: "🕳️ Tuần Không (Dã Hạc)",
      thoi_diem: `Ngày ${xuatKhong} (Xuất Không) hoặc ${xungKhong} (Xung Không)`,
      ghi_chu: "Dã Hạc: 'Vận dụng tại Xuất Không, ứng nghiệm tại Xung Không'",
      source: "DaHac",
    });
  }

  // 2. NHẬP MỘ (Hào bị nhốt)
  const moAddr = NHAP_MO[haoHanh];
  if (
    nhatThan === moAddr ||
    nguyetKien === moAddr ||
    (dt.bienDC && dt.bienDC === moAddr)
  ) {
    const xungMo = formatWithDates(LUC_XUNG[moAddr]);
    const item = {
      ly_do: "🔒 Nhập Mộ",
      thoi_diem: `Xung Mộ: ngày ${xungMo}`,
      ghi_chu: "DT bị giam trong Mộ — phải chờ xung khai mộ khố",
    };
    goiY.push({ ...item, source: "LXM" });
    goiY.push({ ...item, source: "DaHac" });
  }

  // 3. HỢP BÁN (Hào bị trói)
  const hopVoiNhat = LUC_HOP[nhatThan] === dungThanDC;
  const hopVoiNguyet = LUC_HOP[nguyetKien] === dungThanDC;
  if (hopVoiNhat || hopVoiNguyet) {
    const tac = hopVoiNhat ? nhatThan : nguyetKien;
    const nguon = hopVoiNhat ? "Nhật Thần" : "Nguyệt Kiến";
    const xungHop = formatWithDates(LUC_XUNG[tac]);
    const xungHao = formatWithDates(LUC_XUNG[dungThanDC]);

    const item = {
      ly_do: `🤝 Hợp Bán (${nguon})`,
      thoi_diem: `Xung khai: ngày ${xungHop} hoặc ${xungHao}`,
      ghi_chu:
        "DT bị trói buộc — cần xung phá hợp thần hoặc xung trực tiếp vào hào",
    };
    goiY.push({ ...item, source: "LXM" });
    goiY.push({ ...item, source: "DaHac" });
  }

  // 4. NGUYỆT PHÁ (Bị tháng xung vỡ)
  if (LUC_XUNG[nguyetKien] === dungThanDC) {
    if (dtVS.diem < -3) {
      const item = {
        ly_do: "💥 Chân Phá (Vô khí)",
        thoi_diem: "Không có ứng kỳ",
        ghi_chu: "DT quá yếu lại bị Nguyệt Phá ➔ việc đổ vỡ hoàn toàn.",
      };
      goiY.push({ ...item, source: "LXM" });
      goiY.push({ ...item, source: "DaHac" });
      return goiY;
    }
    const lamTri = formatWithDates(dungThanDC);
    const hopPha = formatWithDates(LUC_HOP[dungThanDC]);
    const item = {
      ly_do: "💥 Nguyệt Phá",
      thoi_diem: `Lâm trị: ngày ${lamTri} | Hợp phá: ngày ${hopPha}`,
      ghi_chu: "Chờ ngày trùng hào (thực phá) hoặc ngày hợp (bù đắp) để ứng",
    };
    goiY.push({ ...item, source: "LXM" });
    goiY.push({ ...item, source: "DaHac" });
  }

  // 5. PHỤC TÀNG (Hào ẩn giấu)
  const isPhuc = state.dungThanHao === "phuc";
  if (
    isPhuc ||
    (haoVaiTro &&
      state.hao6.some((h) => h.phucThan && h.phucThan.lucThan === dt.lucThan))
  ) {
    let phiDC = "";
    if (isPhuc) phiDC = state.dungThanPhucData.phiHao.diaChi;
    else {
      const hPhuc = state.hao6.find(
        (h) => h.phucThan && h.phucThan.lucThan === dt.lucThan,
      );
      if (hPhuc) phiDC = hPhuc.diaChi;
    }
    const xungPhi = formatWithDates(LUC_XUNG[phiDC]);
    const lamPhuc = formatWithDates(dungThanDC);
    const item = {
      ly_do: "👻 Phục Tàng",
      thoi_diem: `Xung Phi: ngày ${xungPhi} | Lâm Phục: ngày ${lamPhuc}`,
      ghi_chu: "Chờ xung phi lộ phục hoặc ngày Lâm Phục (trùng hào phục)",
    };
    goiY.push({ ...item, source: "LXM" });
    goiY.push({ ...item, source: "DaHac" });
  }

  // 6a. HÓA QUẨN CHÂN (Chỉ Dã Hạc nhấn mạnh)
  if (dt.laQuanChan && dt.bienDC) {
    const xungQC = formatWithDates(LUC_XUNG[dt.bienDC]);
    goiY.push({
      ly_do: "🔗 Hóa Quẩn Chân (DT)",
      thoi_diem: `Xung khai: ngày ${xungQC}`,
      ghi_chu: "Dã Hạc: Ứng kỳ trễ, phải chờ xung khai hào biến mới đắc dụng",
      source: "DaHac",
    });
  }

  // 6b. NGUYÊN THẦN hóa Quẩn Chân
  if (haoVaiTro) {
    const ntQuanChan = haoVaiTro.filter(
      (h) => h.vaiTro === "Nguyên Thần" && h.laQuanChan && h.bienDC,
    );
    ntQuanChan.forEach((nt) => {
      const xungQC = formatWithDates(LUC_XUNG[nt.bienDC]);
      goiY.push({
        ly_do: `🔗 NT H${nt.viTri} Hóa Quẩn Chân`,
        thoi_diem: `Xung khai: ngày ${xungQC}`,
        ghi_chu: "Dã Hạc: NT bị trói, DT phải chờ NT được giải phóng mới ứng",
        source: "DaHac",
      });
    });
  }

  // 7. ĐỘNG / TĨNH (Trạng thái vận động)
  const coreLXM = goiY.filter((g) => g.source === "LXM").length;
  const coreDaHac = goiY.filter((g) => g.source === "DaHac").length;

  if (coreLXM === 0 || coreDaHac === 0) {
    const lamTri = formatWithDates(dungThanDC);
    const lucHop = formatWithDates(LUC_HOP[dungThanDC]);
    const lucXung = formatWithDates(LUC_XUNG[dungThanDC]);

    if (isDong) {
      if (coreLXM === 0) {
        goiY.push({
          ly_do: "🔄 Hào Động (Vượng)",
          thoi_diem: `Hợp trị: ngày ${lucHop} | Lâm trị: ngày ${lamTri}`,
          ghi_chu: "Động ứng vào ngày Hợp (kết thúc) hoặc ngày Lâm trị",
          source: "LXM",
        });
      }
      if (coreDaHac === 0) {
        goiY.push({
          ly_do: "🔄 Hào Động (Dã Hạc)",
          thoi_diem: `Ngày ${lamTri} hoặc ngày ${lucHop}`,
          ghi_chu:
            "Dã Hạc: 'Động nhi phùng trị phùng hợp' — Chờ ngày Lâm trị hoặc Hợp",
          source: "DaHac",
        });

        // Đặc biệt: Tiến Thần Nhập Mộ
        if (dt.laTienThan && dt.bienDC) {
          const bHanh = DC_HANH[dt.bienDC];
          const bMo = NHAP_MO[bHanh];
          if (bMo) {
            goiY.push({
              ly_do: "📈 Tiến Thần Nhập Mộ",
              thoi_diem: `Ngày ${formatWithDates(bMo)}`,
              ghi_chu: "Dã Hạc: DT hóa Tiến nhưng bị thu vào Mộ, ứng kỳ tại đó",
              source: "DaHac",
            });
          }
        }
      }
    } else {
      if (coreLXM === 0) {
        goiY.push({
          ly_do: "📌 Hào Tĩnh (Vượng)",
          thoi_diem: `Xung khởi: ngày ${lucXung} | Lâm trị: ngày ${lamTri}`,
          ghi_chu: "Tĩnh ứng vào ngày Xung (kích hoạt) hoặc ngày Lâm trị",
          source: "LXM",
        });
      }
      if (coreDaHac === 0) {
        goiY.push({
          ly_do: "📌 Hào Tĩnh (Dã Hạc)",
          thoi_diem: `Ngày ${lucXung} (Xung khởi)`,
          ghi_chu:
            "Dã Hạc: 'Tĩnh nhi phùng xung' — Tĩnh thì phải xung mới động",
          source: "DaHac",
        });
      }
    }
  }

  // Fallback: Suy nhược
  if (dtVS.diem < 1 && goiY.length < 2) {
    const hanhSinh = nguocSinh(haoHanh);
    const item = {
      ly_do: "📉 DT Suy nhược",
      thoi_diem: `Sinh vượng: ngày hành ${hanhSinh || "?"} | Lâm trị: ngày ${formatWithDates(dungThanDC)}`,
      ghi_chu: "DT yếu — cần gặp ngày sinh vượng để có lực ứng nghiệm",
    };
    goiY.push({ ...item, source: "LXM" });
    goiY.push({ ...item, source: "DaHac" });
  }

  return goiY;
}
