/* ===================================== */
/*           UI INTERACTONS              */
/* ===================================== */

function switchTab(tab) {
  const isLuan = tab === "luan-que";
  document.getElementById("page-luan-que").style.display = isLuan ? "" : "none";
  document.getElementById("page-tac-gia").style.display = isLuan ? "none" : "";

  const btnLuan = document.getElementById("tab-luan-que");
  const btnTac = document.getElementById("tab-tac-gia");

  if (isLuan) {
    btnLuan.classList.add("active-luan");
    btnTac.classList.remove("active-tacgia");
  } else {
    btnLuan.classList.remove("active-luan");
    btnTac.classList.add("active-tacgia");
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
  if (icon) icon.textContent = next === 'light' ? '☀️' : '🌙';
}

// Restore saved theme on load
(function() {
  const saved = localStorage.getItem('kinhdich-theme');
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    // Note: Icon will be handled by DOMContentLoaded or similar if needed before rendering
  }
})();

// Ensure icon is correct after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('kinhdich-theme');
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.textContent = saved === 'light' ? '☀️' : '🌙';
  }
});
