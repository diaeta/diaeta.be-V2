document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.js-menu-toggle');
  const mobileNavOverlay = document.querySelector('.js-mobile-nav-overlay');

  const setOpen = (open) => {
    if (!mobileNavOverlay) return;
    mobileNavOverlay.classList.toggle('is-open', open);
    mobileNavOverlay.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('no-scroll', open);
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', String(open));
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars', !open);
        icon.classList.toggle('fa-xmark', open);
      }
    }
  };

  if (menuToggle && mobileNavOverlay) {
    menuToggle.addEventListener('click', () => setOpen(!mobileNavOverlay.classList.contains('is-open')));
  }

  // Close when tapping outside sheet body
  if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', (e) => {
      const sheetBody = e.target.closest('.mobile-sheet-body');
      const sheetFooter = e.target.closest('.mobile-sheet-footer');
      if (!sheetBody && !sheetFooter) setOpen(false);
    });
  }

  // --- Mobile Submenu Toggles ---
  if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', (e) => {
      const dropdownToggle = e.target.closest('.js-mobile-dropdown-toggle');
      if (!dropdownToggle) {
        return;
      }
      e.preventDefault();
      const parentDropdown = dropdownToggle.closest('.js-mobile-dropdown');
      const isExpanded = parentDropdown.classList.contains('is-open');
      mobileNavOverlay.querySelectorAll('.js-mobile-dropdown.is-open').forEach(openDropdown => {
        if (openDropdown !== parentDropdown) {
          openDropdown.classList.remove('is-open');
          const t = openDropdown.querySelector('.js-mobile-dropdown-toggle');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
      parentDropdown.classList.toggle('is-open');
      dropdownToggle.setAttribute('aria-expanded', String(!isExpanded));
    });
  }

  // --- Mobile Language Switcher ---
  const mobileLangToggle = document.querySelector('.js-mobile-lang-toggle');
  const mobileLangDropdown = document.querySelector('.js-mobile-lang-dropdown');
  if (mobileLangToggle && mobileLangDropdown) {
    mobileLangToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = mobileLangToggle.getAttribute('aria-expanded') === 'true';
      mobileLangToggle.setAttribute('aria-expanded', String(!isExpanded));
      mobileLangDropdown.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!mobileLangToggle.contains(e.target) && !mobileLangDropdown.contains(e.target)) {
        mobileLangToggle.setAttribute('aria-expanded', 'false');
        mobileLangDropdown.classList.remove('open');
      }
    });
  }
});

