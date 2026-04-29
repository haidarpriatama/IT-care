document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const flashes = document.querySelectorAll('.flash-message');
  const sidebar = document.querySelector('.app-sidebar, .sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  const dismissFlash = (flash) => {
    flash.style.opacity = '0';
    flash.style.transform = 'translateY(-8px)';
    flash.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    window.setTimeout(() => flash.remove(), 200);
  };

  flashes.forEach((flash) => {
    window.setTimeout(() => dismissFlash(flash), 4500);

    const closeButton = flash.querySelector('.flash-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => dismissFlash(flash));
    }
  });

  const closeSidebar = () => body.classList.remove('sidebar-open');
  const toggleSidebar = () => body.classList.toggle('sidebar-open');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  document.addEventListener('click', (event) => {
    if (!body.classList.contains('sidebar-open') || !sidebar || !sidebarToggle) {
      return;
    }

    if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
      closeSidebar();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 920) {
      closeSidebar();
    }
  });

  const currentPath = window.location.pathname;
  const sidebarLinks = document.querySelectorAll('.sidebar-item');

  const isActiveLink = (link) => {
    const href = link.getAttribute('href');
    const match = link.dataset.match || href;
    const mode = link.dataset.matchMode || 'exact';
    const excludes = (link.dataset.exclude || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (excludes.some((value) => currentPath === value || currentPath.startsWith(`${value}/`))) {
      return false;
    }

    if (mode === 'prefix') {
      return currentPath === match || currentPath.startsWith(`${match}/`);
    }

    return currentPath === match;
  };

  sidebarLinks.forEach((link) => {
    if (isActiveLink(link)) {
      link.classList.add('active');
    }
  });

  const autoSubmitFields = document.querySelectorAll('[data-auto-submit]');
  autoSubmitFields.forEach((field) => {
    field.addEventListener('change', () => {
      const form = field.closest('form');
      if (form) {
        form.submit();
      }
    });
  });

  const passwordToggles = document.querySelectorAll('[data-password-toggle]');
  passwordToggles.forEach((button) => {
    const selector = button.dataset.passwordToggle;
    const input = document.querySelector(selector);
    const icon = button.querySelector('i');

    if (!input) {
      return;
    }

    button.addEventListener('click', () => {
      const nextType = input.type === 'password' ? 'text' : 'password';
      input.type = nextType;

      if (icon) {
        icon.className = nextType === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
      }

      button.setAttribute(
        'aria-label',
        nextType === 'password' ? 'Tampilkan password' : 'Sembunyikan password'
      );
    });
  });

  const confirmElements = document.querySelectorAll('[data-confirm]');
  confirmElements.forEach((element) => {
    element.addEventListener('submit', (event) => {
      const message = element.dataset.confirm;
      if (message && !window.confirm(message)) {
        event.preventDefault();
      }
    });
  });

  if (typeof bootstrap !== 'undefined') {
    const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipElements.forEach((element) => new bootstrap.Tooltip(element));
  }
});
