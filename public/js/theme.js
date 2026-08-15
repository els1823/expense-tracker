(function () {
  const toggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Load saved theme
  const saved = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', saved);
  updateButton(saved);

  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateButton(next);
    });
  }

  function updateButton(theme) {
    if (!toggle) return;
    toggle.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  }
})();

// User menu dropdown
(function () {
  const btn = document.getElementById('userMenuBtn');
  const dropdown = document.getElementById('userDropdown');

  if (btn && dropdown) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });
  }
})();