document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.js-menu-toggle');
  const mobileNavOverlay = document.querySelector('.js-mobile-nav-overlay');
  const mnav = document.querySelector('.js-mnav');
  const mnavClose = document.querySelector('.js-mnav-close');
  const mnavToggleButtons = document.querySelectorAll('.js-mnav-toggle');
  const firstFocusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const closeBtn = document.querySelector('.js-mobile-close');
  let lastScrollY = 0;
  let restoreFocusEl = null;

  const setOpen = (open) => {
    const overlay = mnav || mobileNavOverlay;
    if (!overlay) return;
    if (open) {
      // lock scroll
      lastScrollY = window.scrollY || document.documentElement.scrollTop;
      document.documentElement.style.scrollBehavior = 'auto';
      document.documentElement.classList.add('menu-open');
      document.body.classList.add('menu-open');
      document.body.classList.add('no-scroll');
      document.body.style.position = 'fixed';
      document.body.style.top = `-${lastScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      // Move focus to top of list for consistency after page scroll
      const firstLink = overlay.querySelector('.mnav__list a, .mnav__list button, .mobile-nav-list a, .mobile-nav-list button');
      if (firstLink) firstLink.focus({ preventScroll: true });
      // compute footer height for body padding
      document.documentElement.style.setProperty('--mobile-footer-height', getFooterHeight() + 'px');
      restoreFocusEl = document.activeElement;
      trapFocus();
      overlay.classList.add('is-open');
      overlay.removeAttribute('inert');
      overlay.setAttribute('aria-hidden', 'false');
    } else {
      // unlock scroll
      document.documentElement.classList.remove('menu-open');
      document.body.classList.remove('menu-open');
      document.body.classList.remove('no-scroll');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, lastScrollY);
      releaseFocus();
      if (restoreFocusEl && typeof restoreFocusEl.focus === 'function') {
        restoreFocusEl.focus();
      }
      document.documentElement.style.scrollBehavior = '';
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('inert', '');
    }
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', String(open));
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars', !open);
        icon.classList.toggle('fa-xmark', open);
      }
    }
  };

  if (menuToggle && (mnav || mobileNavOverlay)) {
    menuToggle.addEventListener('click', () => {
      const ov = mnav || mobileNavOverlay;
      const currentlyOpen = ov ? ov.classList.contains('is-open') : false;
      setOpen(!currentlyOpen);
    });
  }

  if (mnavClose) mnavClose.addEventListener('click', () => setOpen(false));
  if (closeBtn) closeBtn.addEventListener('click', () => setOpen(false));

  // Global ESC key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = mnav || mobileNavOverlay;
      if (overlay && overlay.classList.contains('is-open')) {
        setOpen(false);
      }
    }
  });

  // Close when tapping outside sheet body
  const attachOutsideClick = (root, sheetSelector) => {
    if (!root) return;
    root.addEventListener('click', (e) => {
      const sheet = e.target.closest(sheetSelector);
      const close = e.target.closest('.js-mnav-close, .js-mobile-close');
      if (close) { setOpen(false); return; }
      if (!sheet) setOpen(false);
    });
  };
  attachOutsideClick(mnav, '.mnav__panel');
  attachOutsideClick(mobileNavOverlay, '.mobile-sheet');

  // --- Mobile Submenu Toggles ---
  if (mnavToggleButtons && mnavToggleButtons.length) {
    mnavToggleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const group = e.currentTarget.closest('.js-mnav-group');
        const open = group.classList.toggle('is-open');
        e.currentTarget.setAttribute('aria-expanded', String(open));
        const chev = e.currentTarget.querySelector('.mnav__chev');
        if (chev) chev.style.transform = open ? 'rotate(180deg)' : '';
        // close other groups
        document.querySelectorAll('.js-mnav-group').forEach(g => {
          if (g !== group) {
            g.classList.remove('is-open');
            const t = g.querySelector('.js-mnav-toggle');
            if (t) t.setAttribute('aria-expanded', 'false');
            const c2 = g.querySelector('.mnav__chev');
            if (c2) c2.style.transform = '';
          }
        });
      });
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

  // Enhanced Focus trap & ESC for both menu systems
  function trapFocus() {
    const overlay = mnav || mobileNavOverlay;
    if (!overlay) return;
    
    const focusables = overlay.querySelectorAll(firstFocusableSelector);
    if (!focusables.length) return;
    
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    
    // Move focus to the first focusable item inside menu
    first.focus();
    
    function onKeydown(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key === 'Tab') {
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    
    overlay.addEventListener('keydown', onKeydown);
    overlay._trapHandler = onKeydown;
    
    // Ensure ARIA attributes are properly set
    overlay.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('role', 'dialog');
  }

  function releaseFocus() {
    const overlay = mnav || mobileNavOverlay;
    if (!overlay || !overlay._trapHandler) return;
    overlay.removeEventListener('keydown', overlay._trapHandler);
    delete overlay._trapHandler;
  }

  // Enhanced viewport height management for both menu systems
  const updatePanelHeight = () => {
    let height = window.innerHeight;
    if (window.visualViewport && typeof window.visualViewport.height === 'number') {
      height = Math.round(window.visualViewport.height);
    }
    
    // Set CSS custom property for dynamic viewport height
    document.documentElement.style.setProperty('--vvh', height + 'px');
    
    // Update both menu systems with proper height constraints
    const sheet = document.querySelector('.mobile-sheet');
    if (sheet) {
      sheet.style.maxHeight = height + 'px';
      sheet.style.height = height + 'px';
    }
    
    const mnavPanel = document.querySelector('.mnav__panel');
    if (mnavPanel) {
      mnavPanel.style.maxHeight = height + 'px';
      mnavPanel.style.height = height + 'px';
    }
    
    document.documentElement.style.setProperty('--mobile-footer-height', getFooterHeight() + 'px');
  };
  
  // Initialize viewport height management
  updatePanelHeight();
  window.addEventListener('resize', updatePanelHeight, { passive: true });
  window.addEventListener('orientationchange', updatePanelHeight, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updatePanelHeight, { passive: true });
    window.visualViewport.addEventListener('scroll', updatePanelHeight, { passive: true });
  }

  function getFooterHeight() {
    const footer = document.querySelector('.mobile-nav-actions');
    if (!footer) return 140;
    const rect = footer.getBoundingClientRect();
    return Math.round(rect.height);
  }

  // Auto-highlight submenu/open based on current path
  try {
    const path = location.pathname || '';
    const serviceMatch = ['weight-loss','irritable-bowel-syndrome-fodmap','diabetes-management','hypertension-cholesterol','nutrigenetic-tests'].some(p => path.includes(p));
    const aboutMatch = ['diaeta-method','our-expertise'].some(p => path.includes(p));
    if (serviceMatch) {
      const grp = document.querySelectorAll('.js-mnav-group')[1];
      const tog = grp && grp.querySelector('.js-mnav-toggle');
      if (grp && tog) { grp.classList.add('is-open'); tog.setAttribute('aria-expanded','true'); const chev=tog.querySelector('.mnav__chev'); if (chev) chev.style.transform='rotate(180deg)'; }
    } else if (aboutMatch) {
      const grp = document.querySelectorAll('.js-mnav-group')[0];
      const tog = grp && grp.querySelector('.js-mnav-toggle');
      if (grp && tog) { grp.classList.add('is-open'); tog.setAttribute('aria-expanded','true'); const chev=tog.querySelector('.mnav__chev'); if (chev) chev.style.transform='rotate(180deg)'; }
    }
  } catch {}

  // --- Responsive Search Bar Management ---
  const searchBar = document.querySelector('.site-search');
  const menuToggleBtn = document.querySelector('.menu-toggle');
  
  function toggleSearchBar() {
    if (!searchBar || !menuToggleBtn) return;
    
    const viewportWidth = window.innerWidth;
    const shouldHideSearch = viewportWidth <= 600;
    
    if (shouldHideSearch) {
      searchBar.style.display = 'none';
      searchBar.style.visibility = 'hidden';
      searchBar.style.opacity = '0';
      searchBar.style.width = '0';
      searchBar.style.height = '0';
      searchBar.style.minWidth = '0';
      searchBar.style.maxWidth = '0';
      searchBar.style.padding = '0';
      searchBar.style.margin = '0';
      searchBar.style.overflow = 'hidden';
    } else {
      searchBar.style.display = '';
      searchBar.style.visibility = '';
      searchBar.style.opacity = '';
      searchBar.style.width = '';
      searchBar.style.height = '';
      searchBar.style.minWidth = '';
      searchBar.style.maxWidth = '';
      searchBar.style.padding = '';
      searchBar.style.margin = '';
      searchBar.style.overflow = '';
    }
  }
  
  // Initial check
  toggleSearchBar();
  
  // Listen for resize events
  window.addEventListener('resize', toggleSearchBar, { passive: true });
  window.addEventListener('orientationchange', toggleSearchBar, { passive: true });
});

