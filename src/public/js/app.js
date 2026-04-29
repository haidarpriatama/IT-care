/**
 * IT Care - app.js
 * Global JS: Flash dismiss, sidebar toggle, active nav state
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Flash Message Auto-dismiss ──────────────────────────────
  const flashes = document.querySelectorAll('.flash-message');
  flashes.forEach(flash => {
    // Auto dismiss after 5s
    setTimeout(() => dismissFlash(flash), 5000);

    // Manual close
    const closeBtn = flash.querySelector('.flash-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => dismissFlash(flash));
    }
  });

  function dismissFlash(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(100%)';
    el.style.transition = 'opacity .3s ease, transform .3s ease';
    setTimeout(() => el.remove(), 300);
  }

  // ── Sidebar Toggle (Mobile) ──────────────────────────────────
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Close sidebar when clicking outside (mobile)
  document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    }
  });

  // ── Active Sidebar Item ──────────────────────────────────────
  const currentPath = window.location.pathname;
  const sidebarLinks = document.querySelectorAll('.sidebar-item');

  sidebarLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Exact match or starts with (for nested routes like /tickets/*)
    if (
      currentPath === href ||
      (href !== '/dashboard' && currentPath.startsWith(href)) ||
      (href === '/tickets' && currentPath.startsWith('/tickets') && !currentPath.startsWith('/tickets/create'))
    ) {
      link.classList.add('active');
    }

    // Special: /tickets/create
    if (href === '/tickets/create' && currentPath === '/tickets/create') {
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });

  // ── Confirm Delete Buttons ───────────────────────────────────
  // Already handled inline via onsubmit= in views, but we can also
  // add a safety net here.

  // ── Auto-submit filter forms on select change ────────────────
  const autoSubmitSelects = document.querySelectorAll('[data-auto-submit]');
  autoSubmitSelects.forEach(sel => {
    sel.addEventListener('change', () => sel.closest('form').submit());
  });

  // ── Tooltip init (Bootstrap) ─────────────────────────────────
  if (typeof bootstrap !== 'undefined') {
    const tooltipEls = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipEls.forEach(el => new bootstrap.Tooltip(el));
  }

});
