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

  const closeSidebar = () => {
    if (window.innerWidth <= 920) {
      body.classList.remove('sidebar-open');
    } else {
      body.classList.add('sidebar-closed');
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 920) {
      body.classList.toggle('sidebar-open');
    } else {
      body.classList.toggle('sidebar-closed');
    }
  };

  const sidebarBrand = document.querySelector('.sidebar-brand-link');
  if (sidebarBrand) {
    sidebarBrand.addEventListener('click', (e) => {
      e.preventDefault();
      closeSidebar();
    });
  }

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
      body.classList.remove('sidebar-open');
    } else {
      body.classList.remove('sidebar-closed');
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

  // Notifications logic
  const btnNotifications = document.getElementById('btnNotifications');
  const notificationsDropdown = document.getElementById('notificationsDropdown');
  const notificationsList = document.getElementById('notificationsList');

  if (btnNotifications && notificationsDropdown) {
    btnNotifications.addEventListener('click', async (e) => {
      e.stopPropagation();
      const isVisible = notificationsDropdown.style.display === 'block';
      
      if (isVisible) {
        notificationsDropdown.style.display = 'none';
        return;
      }
      
      notificationsDropdown.style.display = 'block';
      notificationsList.innerHTML = '<div class="text-muted-sm" style="padding: 10px; text-align: center;">Memuat...</div>';
      
      try {
        const res = await fetch('/tickets/api/logs');
        if (!res.ok) throw new Error('Gagal fetch');
        const logs = await res.json();
        
        if (logs.length === 0) {
          notificationsList.innerHTML = '<div class="text-muted-sm" style="padding: 10px; text-align: center;">Tidak ada aktivitas terbaru.</div>';
          return;
        }
        
        notificationsList.innerHTML = logs.map(log => {
          const date = new Date(log.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
          const oldStatus = log.old_status ? log.old_status : 'Dibuat';
          return `
            <div style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-size: 0.8rem;">
              <div style="font-weight: 600; color: #1e293b; margin-bottom: 2px;">\${log.ticket_title}</div>
              <div style="color: #64748b;">
                \${log.changed_by_name || 'Sistem'} mengubah status: <br>
                <span style="color: #475569; font-weight: 500;">\${oldStatus}</span> &rarr; <span style="color: #0f172a; font-weight: 600;">\${log.new_status}</span>
              </div>
              <div style="color: #94a3b8; font-size: 0.75rem; margin-top: 4px;">\${date}</div>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error(err);
        notificationsList.innerHTML = '<div class="text-muted-sm" style="padding: 10px; text-align: center; color: #ef4444;">Gagal memuat aktivitas.</div>';
      }
    });

    document.addEventListener('click', (e) => {
      if (!notificationsDropdown.contains(e.target) && !btnNotifications.contains(e.target)) {
        notificationsDropdown.style.display = 'none';
      }
    });
  }
});
