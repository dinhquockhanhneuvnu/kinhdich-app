/**
 * UI & Theme Management - Lục Hào App
 * Quản lý chuyển Tab và Dark/Light Mode
 */

function switchTab(tab) {
  const isLuan = tab === "luan-que";
  const pageLuan = document.getElementById("page-luan-que");
  const pageTacGia = document.getElementById("page-tac-gia");
  
  if (pageLuan) pageLuan.style.display = isLuan ? "" : "none";
  if (pageTacGia) pageTacGia.style.display = isLuan ? "none" : "";

  const btnLuan = document.getElementById("tab-luan-que");
  const btnTac = document.getElementById("tab-tac-gia");

  if (isLuan) {
    if (btnLuan) btnLuan.classList.add("active-luan");
    if (btnTac) btnTac.classList.remove("active-tacgia");
  } else {
    if (btnLuan) btnLuan.classList.remove("active-luan");
    if (btnTac) btnTac.classList.add("active-tacgia");
  }
}

// === THEME TOGGLE ===
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('kinhdich-theme', next);
  
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.textContent = next === 'light' ? '☀️' : '🌙';
  }
}

// Restore saved theme on load
(function() {
  const saved = localStorage.getItem('kinhdich-theme');
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    // Cần đợi DOM load để cập nhật icon nếu script chạy sớm
    window.addEventListener('DOMContentLoaded', () => {
      const icon = document.getElementById('theme-icon');
      if (icon) icon.textContent = '☀️';
    });
  }
})();

/**
 * Cuộn trang thông minh đến phần phân tích chi tiết
 */
function scrollToAnalysis() {
  const stepThuTuong = document.getElementById('step-thu-tuong');
  const step3 = document.getElementById('step-3');
  const step2 = document.getElementById('step-2');

  // 1. Ưu tiên nhất: Hào Thủ Tượng (Nếu đã chọn Dụng Thần)
  if (stepThuTuong && stepThuTuong.style.display !== 'none') {
    stepThuTuong.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  // 2. Ưu tiên 2: Bảng Quẻ / Chọn Dụng Thần (Nếu đã Lên Quẻ)
  if (step3 && step3.style.display !== 'none') {
    const step4 = document.getElementById('step-4');
    const target = step4 || step3;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  // 3. Fallback: Cuộn đến phần Lập Quẻ
  if (step2) {
    step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
