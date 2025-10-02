/**
 * Warm Clinical Header Navigation
 * Handles dropdown menus, mobile sheet, search overlay, and accessibility
 */

(function () {
  'use strict';

  // ==========================================================================
  // CONSTANTS & STATE
  // ==========================================================================

  const SELECTORS = {
    header: '[data-header]',

    // Dropdowns
    dropdownTrigger: '[data-dropdown-trigger]',
    dropdown: '[data-dropdown]',

    // Language
    langTrigger: '[data-lang-trigger]',
    langTriggerMobile: '[data-lang-trigger-mobile]',
    langDropdown: '[data-lang-dropdown]',

    // Mobile Sheet
    menuToggle: '[data-menu-toggle]',
    mobileSheet: '[data-mobile-sheet]',
    sheetClose: '[data-sheet-close]',

    // Search
    searchOpen: '[data-search-open]',
    searchOverlay: '[data-search-overlay]',
    searchClose: '[data-search-close]',
  };

  const CLASSES = {
    open: 'is-open',
    mobileSheetOpen: 'has-mobile-sheet-open',
    searchOpen: 'has-search-open',
  };

  const KEYS = {
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_DOWN: 'ArrowDown',
    ARROW_UP: 'ArrowUp',
  };

  let activeDropdown = null;
  let focusTrapElements = [];

  // ==========================================================================
  // DROPDOWN MENUS (DESKTOP)
  // ==========================================================================

  function initDropdowns() {
    const triggers = document.querySelectorAll(SELECTORS.dropdownTrigger);

    triggers.forEach(trigger => {
      const dropdownId = trigger.getAttribute('data-dropdown-trigger');
      const dropdown = document.querySelector(`[data-dropdown="${dropdownId}"]`);

      if (!dropdown) return;

      // Click/tap to toggle
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(trigger, dropdown);
      });

      // Keyboard support
      trigger.addEventListener('keydown', (e) => {
        if (e.key === KEYS.ARROW_DOWN) {
          e.preventDefault();
          openDropdown(trigger, dropdown);
          const firstItem = dropdown.querySelector('a');
          if (firstItem) firstItem.focus();
        }
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
          closeDropdown(trigger, dropdown);
        }
      });

      // Escape key closes
      dropdown.addEventListener('keydown', (e) => {
        if (e.key === KEYS.ESCAPE) {
          e.preventDefault();
          closeDropdown(trigger, dropdown);
          trigger.focus();
        }
      });

      // Arrow navigation within dropdown
      setupDropdownNavigation(dropdown);
    });
  }

  function toggleDropdown(trigger, dropdown) {
    const isOpen = dropdown.classList.contains(CLASSES.open);

    // Close any other open dropdown
    if (activeDropdown && activeDropdown !== dropdown) {
      closeDropdown(
        document.querySelector(`[data-dropdown-trigger="${activeDropdown.getAttribute('data-dropdown')}"]`),
        activeDropdown
      );
    }

    if (isOpen) {
      closeDropdown(trigger, dropdown);
    } else {
      openDropdown(trigger, dropdown);
    }
  }

  function openDropdown(trigger, dropdown) {
    dropdown.classList.add(CLASSES.open);
    trigger.setAttribute('aria-expanded', 'true');
    activeDropdown = dropdown;

    // Add subtle haptic feedback (vibration on mobile devices)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Add sound feedback (optional - can be disabled)
    playInteractionSound('open');

    // Analytics hook
    trackEvent('nav_dropdown_open', { dropdown: trigger.textContent.trim() });
  }

  function closeDropdown(trigger, dropdown) {
    dropdown.classList.remove(CLASSES.open);
    trigger.setAttribute('aria-expanded', 'false');
    if (activeDropdown === dropdown) {
      activeDropdown = null;
    }
  }

  function setupDropdownNavigation(dropdown) {
    const items = Array.from(dropdown.querySelectorAll('a'));

    items.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        if (e.key === KEYS.ARROW_DOWN) {
          e.preventDefault();
          const next = items[index + 1] || items[0];
          next.focus();
        }
        if (e.key === KEYS.ARROW_UP) {
          e.preventDefault();
          const prev = items[index - 1] || items[items.length - 1];
          prev.focus();
        }
      });
    });
  }

  // ==========================================================================
  // LANGUAGE SELECTOR
  // ==========================================================================

  function initLanguageSelector() {
    const trigger = document.querySelector(SELECTORS.langTrigger);
    const triggerMobile = document.querySelector(SELECTORS.langTriggerMobile);
    const dropdown = document.querySelector(SELECTORS.langDropdown);

    if (!trigger || !dropdown) return;

    // Desktop trigger
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains(CLASSES.open);

      if (isOpen) {
        closeLanguageDropdown(trigger, dropdown);
      } else {
        openLanguageDropdown(trigger, dropdown);
      }
    });

    // Mobile trigger (opens same dropdown)
    if (triggerMobile) {
      triggerMobile.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains(CLASSES.open);

        if (isOpen) {
          closeLanguageDropdown(trigger, dropdown);
        } else {
          openLanguageDropdown(trigger, dropdown);
        }
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
        closeLanguageDropdown(trigger, dropdown);
      }
    });

    // Escape key closes
    dropdown.addEventListener('keydown', (e) => {
      if (e.key === KEYS.ESCAPE) {
        e.preventDefault();
        closeLanguageDropdown(trigger, dropdown);
        trigger.focus();
      }
    });

    // Track language change
    dropdown.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        trackEvent('language_change', { language: link.getAttribute('lang') });
      });
    });
  }

  function openLanguageDropdown(trigger, dropdown) {
    dropdown.classList.add(CLASSES.open);
    trigger.setAttribute('aria-expanded', 'true');
  }

  function closeLanguageDropdown(trigger, dropdown) {
    dropdown.classList.remove(CLASSES.open);
    trigger.setAttribute('aria-expanded', 'false');
  }

  // ==========================================================================
  // MOBILE NAVIGATION SHEET
  // ==========================================================================

  function initMobileSheet() {
    const menuToggle = document.querySelector(SELECTORS.menuToggle);
    const sheet = document.querySelector(SELECTORS.mobileSheet);
    const closeButtons = document.querySelectorAll(SELECTORS.sheetClose);

    if (!menuToggle || !sheet) return;

    // Open sheet
    menuToggle.addEventListener('click', () => {
      openMobileSheet(menuToggle, sheet);
    });

    // Close sheet
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        closeMobileSheet(menuToggle, sheet);
      });
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === KEYS.ESCAPE && sheet.classList.contains(CLASSES.open)) {
        closeMobileSheet(menuToggle, sheet);
      }
    });

    // Close when clicking a nav link
    sheet.querySelectorAll('a:not([data-lang-trigger-mobile])').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileSheet(menuToggle, sheet);
      });
    });

    // Focus trap
    setupFocusTrap(sheet);
  }

  function openMobileSheet(toggle, sheet) {
    sheet.classList.add(CLASSES.open);
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add(CLASSES.mobileSheetOpen);

    // Set focus to first focusable element
    const firstFocusable = sheet.querySelector('button, a');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
    }

    // Analytics hook
    trackEvent('nav_open', { type: 'mobile_sheet' });
  }

  function closeMobileSheet(toggle, sheet) {
    sheet.classList.remove(CLASSES.open);
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove(CLASSES.mobileSheetOpen);

    // Return focus to toggle button
    toggle.focus();
  }

  // ==========================================================================
  // SEARCH OVERLAY
  // ==========================================================================

  function initSearchOverlay() {
    const openButtons = document.querySelectorAll(SELECTORS.searchOpen);
    const overlay = document.querySelector(SELECTORS.searchOverlay);

    if (!overlay) return;

    const closeButtons = overlay.querySelectorAll(SELECTORS.searchClose);

    // Open search
    openButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        openSearchOverlay(overlay);
      });
    });

    // Close search - handle all close buttons (X button and backdrop)
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        closeSearchOverlay(overlay);
      });
    });

    // Escape key closes
    document.addEventListener('keydown', (e) => {
      if (e.key === KEYS.ESCAPE && overlay.classList.contains(CLASSES.open)) {
        closeSearchOverlay(overlay);
      }
    });

    // Focus trap
    setupFocusTrap(overlay);
  }

  function openSearchOverlay(overlay) {
    overlay.classList.add(CLASSES.open);
    document.body.classList.add(CLASSES.searchOpen);

    // Focus search input
    const input = overlay.querySelector('input[type="search"]');
    if (input) {
      setTimeout(() => input.focus(), 100);
    }

    // Analytics hook
    trackEvent('search_open');
  }

  function closeSearchOverlay(overlay) {
    overlay.classList.remove(CLASSES.open);
    document.body.classList.remove(CLASSES.searchOpen);
  }

  // ==========================================================================
  // FOCUS TRAP
  // ==========================================================================

  function setupFocusTrap(container) {
    container.addEventListener('keydown', (e) => {
      if (e.key !== KEYS.TAB) return;

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    });
  }

  // ==========================================================================
  // ANALYTICS HELPER
  // ==========================================================================

  function trackEvent(eventName, data = {}) {
    // Hook for analytics implementation
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...data
      });
    }

    // Also dispatch custom event for other listeners
    window.dispatchEvent(new CustomEvent('header:' + eventName, { detail: data }));
  }

  // ==========================================================================
  // MICRO-INTERACTIONS & AUDIO FEEDBACK
  // ==========================================================================

  // Audio context for subtle UI sounds (optional, can be disabled)
  let audioContext = null;
  let soundEnabled = false; // Disabled by default to respect user preferences

  function initAudioContext() {
    if (!soundEnabled || !('AudioContext' in window || 'webkitAudioContext' in window)) {
      return;
    }

    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Audio feedback not available');
    }
  }

  function playInteractionSound(type) {
    if (!soundEnabled || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different interactions
    const frequencies = {
      open: 800,
      close: 600,
      click: 1000,
      hover: 400
    };

    oscillator.frequency.value = frequencies[type] || 600;
    oscillator.type = 'sine';

    // Very subtle volume
    gainNode.gain.setValueAtTime(0.01, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  }

  // Ripple effect on click
  function addRippleEffect(element, event) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  function initMicroInteractions() {
    // Add ripple effects to clickable elements
    const clickables = document.querySelectorAll('.c-nav__link, .c-cta-pill, .c-icon-btn');

    clickables.forEach(element => {
      element.addEventListener('click', (e) => {
        addRippleEffect(element, e);

        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(5);
        }
      });
    });

    // Subtle hover sound (if enabled)
    if (soundEnabled) {
      const hoverElements = document.querySelectorAll('.c-nav__link');
      hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
          playInteractionSound('hover');
        });
      });
    }
  }

  // ==========================================================================
  // FOCUS TRACKING & VISUAL HIGHLIGHT
  // ==========================================================================

  function initFocusTracking() {
    const focusableElements = document.querySelectorAll('.c-nav__link, .c-dropdown__item, .c-cta-pill, .c-icon-btn, .c-lang-chip');

    focusableElements.forEach(element => {
      element.addEventListener('focus', () => {
        // Haptic feedback on focus
        if ('vibrate' in navigator) {
          navigator.vibrate(8);
        }

        // Add focus class to parent for additional styling
        element.classList.add('has-focus');

        // Scroll into view if needed (for keyboard navigation)
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      });

      element.addEventListener('blur', () => {
        element.classList.remove('has-focus');
      });

      // Enhanced keyboard navigation feedback
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          // Visual feedback for keyboard activation
          element.style.transform = 'scale(0.95)';
          setTimeout(() => {
            element.style.transform = '';
          }, 100);

          // Haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(15);
          }
        }
      });
    });
  }

  // ==========================================================================
  // STICKY HEADER SCROLL BEHAVIOR
  // ==========================================================================

  function initStickyHeader() {
    const header = document.querySelector(SELECTORS.header);
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      // Add shadow when scrolled
      if (currentScroll > 10) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }

      lastScroll = currentScroll;
    }, { passive: true });
  }

  // ==========================================================================
  // VIEWPORT-AWARE DROPDOWN POSITIONING
  // ==========================================================================

  function initViewportAwareDropdowns() {
    const dropdowns = document.querySelectorAll(SELECTORS.dropdown);

    dropdowns.forEach(dropdown => {
      const observer = new MutationObserver(() => {
        if (dropdown.classList.contains(CLASSES.open)) {
          adjustDropdownPosition(dropdown);
        }
      });

      observer.observe(dropdown, { attributes: true, attributeFilter: ['class'] });
    });
  }

  function adjustDropdownPosition(dropdown) {
    const rect = dropdown.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // If dropdown overflows right edge
    if (rect.right > viewportWidth) {
      dropdown.style.left = 'auto';
      dropdown.style.right = '0';
    } else {
      dropdown.style.left = '0';
      dropdown.style.right = 'auto';
    }
  }

  // ==========================================================================
  // MAGNETIC HOVER EFFECT
  // ==========================================================================

  function initMagneticEffect() {
    const navItems = document.querySelectorAll('.c-nav__item');

    navItems.forEach(item => {
      item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        item.style.setProperty('--mouse-x', `${x}%`);
        item.style.setProperty('--mouse-y', `${y}%`);
      });

      item.addEventListener('mouseleave', () => {
        item.style.setProperty('--mouse-x', '50%');
        item.style.setProperty('--mouse-y', '50%');
      });
    });
  }

  // ==========================================================================
  // DROPDOWN STAGGER ANIMATION
  // ==========================================================================

  function initDropdownStagger() {
    const dropdowns = document.querySelectorAll(SELECTORS.dropdown);

    dropdowns.forEach(dropdown => {
      const observer = new MutationObserver(() => {
        if (dropdown.classList.contains(CLASSES.open)) {
          const items = dropdown.querySelectorAll('.c-dropdown__item');
          items.forEach((item, index) => {
            item.style.animationDelay = `${index * 50}ms`;
          });
        }
      });

      observer.observe(dropdown, { attributes: true, attributeFilter: ['class'] });
    });
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    initDropdowns();
    initLanguageSelector();
    initMobileSheet();
    initSearchOverlay();
    initStickyHeader();
    initViewportAwareDropdowns();
    initMagneticEffect();
    initDropdownStagger();
    initAudioContext();
    initMicroInteractions();
    initFocusTracking();

    // Announce ready state
    window.dispatchEvent(new CustomEvent('header:ready'));
  }

  // Start initialization
  init();

})();
