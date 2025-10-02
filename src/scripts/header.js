/**
 * Header Navigation JavaScript
 * Implements all interactive behaviors for the header design system
 * 
 * Features:
 * - Dropdown navigation with keyboard support
 * - Search expand/collapse functionality
 * - Mobile drawer with backdrop
 * - Scroll-based header state changes
 * - Language selector
 * - Accessibility compliance (WCAG 2.2 AA)
 * - Theme switching (Glass/Solid)
 */

const DESKTOP_BREAKPOINT = 1180;

class HeaderNavigation {
  constructor() {
    this.header = document.querySelector('.site-header');
    this.burger = document.querySelector('.burger');
    this.mobileMenu = document.querySelector('.mnav');
    this.searchButton = document.querySelector('.search__button');
    this.searchInput = document.querySelector('.search__input');
    this.langButton = document.querySelector('.lang__button');
    this.langDropdown = document.querySelector('.lang-dropdown');
    this.navToggles = document.querySelectorAll('.nav__toggle');
    this.navDropdowns = document.querySelectorAll('.nav-sub');
    this.mobileMenuGroups = document.querySelectorAll('.mnav__group');
    
    this.isScrolled = false;
    this.isSearchOpen = false;
    this.isMobileMenuOpen = false;
    this.activeDropdown = null;
    this.activeToggle = null;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupScrollDetection();
    this.setupKeyboardNavigation();
    this.setupAccessibility();
    this.initializeTheme();
    this.initializeResponsiveState();
  }
  
  // =============================================================================
  // EVENT LISTENERS
  // =============================================================================
  
  setupEventListeners() {
    // Mobile menu toggle
    if (this.burger) {
      this.burger.addEventListener('click', () => this.toggleMobileMenu());
    }
    
    // Mobile menu close
    const closeButton = document.querySelector('.mnav__close');
    const backdrop = document.querySelector('.mnav__backdrop');
    
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeMobileMenu());
    }
    
    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeMobileMenu());
    }
    
    // Search functionality
    if (this.searchButton && this.searchInput) {
      this.searchButton.addEventListener('click', () => this.toggleSearch());
      this.searchInput.addEventListener('blur', (e) => this.handleSearchBlur(e));
      this.searchInput.addEventListener('keydown', (e) => this.handleSearchKeydown(e));
    }
    
    // Language selector
    if (this.langButton && this.langDropdown) {
      this.langButton.addEventListener('click', (e) => this.toggleLanguageDropdown(e));
    }
    
    // Navigation dropdowns
    this.navToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => this.handleNavToggle(e));
      toggle.addEventListener('keydown', (e) => this.handleNavKeydown(e));
      
      // Add hover functionality for desktop
      const navItem = toggle.closest('.nav__item');
      if (navItem) {
        navItem.addEventListener('mouseenter', (e) => this.handleNavHover(e));
      }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => this.handleOutsideClick(e));
    
    // Mobile menu accordion (only one open at a time)
    this.mobileMenuGroups.forEach(group => {
      group.addEventListener('toggle', (e) => this.handleMobileMenuToggle(e));
    });
    
    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }
  
  // =============================================================================
  // SCROLL DETECTION
  // =============================================================================
  
  setupScrollDetection() {
    let ticking = false;
    
    const updateScrollState = () => {
      const scrollY = window.scrollY;
      const shouldBeScrolled = scrollY > 0;
      
      if (shouldBeScrolled !== this.isScrolled) {
        this.isScrolled = shouldBeScrolled;
        this.updateHeaderState();
      }
      
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', requestTick, { passive: true });
  }
  
  updateHeaderState() {
    if (this.isScrolled) {
      this.header.classList.add('is-scrolled');
    } else {
      this.header.classList.remove('is-scrolled');
    }
  }
  
  // =============================================================================
  // MOBILE MENU
  // =============================================================================
  
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    if (this.isMobileMenuOpen) {
      this.openMobileMenu();
    } else {
      this.closeMobileMenu();
    }
  }
  
  openMobileMenu() {
    this.mobileMenu.classList.add('is-open');
    this.burger.classList.add('is-active');
    this.burger.setAttribute('aria-expanded', 'true');
    this.mobileMenu.setAttribute('aria-hidden', 'false');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus first focusable element
    const firstFocusable = this.mobileMenu.querySelector('a, button, input');
    if (firstFocusable) {
      firstFocusable.focus();
    }
    
    // Announce to screen readers
    this.announceToScreenReader('Mobile menu opened');
  }
  
  closeMobileMenu() {
    this.mobileMenu.classList.remove('is-open');
    this.burger.classList.remove('is-active');
    this.burger.setAttribute('aria-expanded', 'false');
    this.mobileMenu.setAttribute('aria-hidden', 'true');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to burger button
    this.burger.focus();
    
    // Announce to screen readers
    this.announceToScreenReader('Mobile menu closed');
  }
  
  handleMobileMenuToggle(e) {
    const currentGroup = e.target;
    
    // If this group is being opened, close all other groups
    if (currentGroup.open) {
      this.mobileMenuGroups.forEach(group => {
        if (group !== currentGroup && group.open) {
          group.open = false;
        }
      });
    }
  }
  
  // =============================================================================
  // SEARCH FUNCTIONALITY
  // =============================================================================
  
  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    
    if (this.isSearchOpen) {
      this.openSearch();
    } else {
      this.closeSearch();
    }
  }
  
  openSearch() {
    this.searchInput.classList.add('is-expanded');
    this.searchButton.setAttribute('aria-expanded', 'true');
    
    // Focus the input
    setTimeout(() => {
      this.searchInput.focus();
    }, 200);
    
    this.announceToScreenReader('Search expanded');
  }
  
  closeSearch() {
    this.searchInput.classList.remove('is-expanded');
    this.searchButton.setAttribute('aria-expanded', 'false');
    this.searchInput.value = '';
    
    this.announceToScreenReader('Search collapsed');
  }
  
  handleSearchBlur(e) {
    // Close search if clicking outside
    if (!this.searchButton.contains(e.relatedTarget) && 
        !this.searchInput.contains(e.relatedTarget)) {
      this.closeSearch();
    }
  }
  
  handleSearchKeydown(e) {
    if (e.key === 'Escape') {
      this.closeSearch();
      this.searchButton.focus();
    }
  }
  
  // =============================================================================
  // LANGUAGE SELECTOR
  // =============================================================================
  
  toggleLanguageDropdown(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!this.langDropdown) {
      return;
    }

    const wasOpen = this.langDropdown.classList.contains('is-open');

    this.closeAllDropdowns();

    if (!wasOpen) {
      this.openLanguageDropdown();
    }
  }

  openLanguageDropdown() {
    if (!this.langDropdown) {
      return;
    }

    this.langDropdown.classList.add('is-open');

    if (this.langButton) {
      this.langButton.setAttribute('aria-expanded', 'true');
    }

    const firstOption = this.langDropdown.querySelector('.lang-option');
    if (firstOption) {
      firstOption.focus();
    }
  }

  closeLanguageDropdown() {
    if (!this.langDropdown) {
      return;
    }

    this.langDropdown.classList.remove('is-open');

    if (this.langButton) {
      this.langButton.setAttribute('aria-expanded', 'false');
    }
  }

  // =============================================================================
  // NAVIGATION DROPDOWNS
  // =============================================================================
  
  handleNavToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    const toggle = e.currentTarget;
    const dropdownId = toggle.getAttribute('aria-controls');
    const dropdown = document.getElementById(dropdownId);
    
    if (!dropdown) return;
    
    const wasOpen = dropdown.classList.contains('is-open');
    
    // Close all other dropdowns
    this.closeAllDropdowns();
    
    if (!wasOpen) {
      this.openDropdown(toggle, dropdown);
    }
  }
  
  handleNavHover(e) {
    // Only handle hover on desktop
    if (!this.isDesktopViewport()) return;
    
    const navItem = e.currentTarget;
    const toggle = navItem.querySelector('.nav__toggle');
    const dropdownId = toggle?.getAttribute('aria-controls');
    const dropdown = dropdownId ? document.getElementById(dropdownId) : null;
    
    if (!dropdown) return;
    
    // If any dropdown is already open, switch to this one
    // (unless it's already the active one)
    if (this.activeDropdown && this.activeDropdown !== dropdown) {
      this.closeAllDropdowns();
      this.openDropdown(toggle, dropdown);
    }
  }
  
  openDropdown(toggle, dropdown) {
    dropdown.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    this.activeDropdown = dropdown;
    this.activeToggle = toggle;
    
    // Focus first menu item
    const firstItem = dropdown.querySelector('[role="menuitem"]');
    if (firstItem) {
      firstItem.focus();
    }
  }
  
  closeAllDropdowns() {
    this.navDropdowns.forEach(dropdown => {
      dropdown.classList.remove('is-open');
    });
    
    this.navToggles.forEach(toggle => {
      toggle.setAttribute('aria-expanded', 'false');
    });

    this.closeLanguageDropdown();

    this.activeDropdown = null;
    this.activeToggle = null;
  }
  
  // =============================================================================
  // KEYBOARD NAVIGATION
  // =============================================================================
  
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Close dropdowns on Escape
      if (e.key === 'Escape') {
        this.closeAllDropdowns();
        this.closeSearch();
        this.closeMobileMenu();
      }
      
      // Handle dropdown navigation
      if (this.activeDropdown) {
        this.handleDropdownNavigation(e);
      }
    });
  }
  
  handleDropdownNavigation(e) {
    const items = Array.from(this.activeDropdown.querySelectorAll('[role="menuitem"]'));
    const currentIndex = items.indexOf(document.activeElement);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex].focus();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        items[prevIndex].focus();
        break;
        
      case 'Home':
        e.preventDefault();
        items[0].focus();
        break;
        
      case 'End':
        e.preventDefault();
        items[items.length - 1].focus();
        break;
    }
  }
  
  handleNavKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.handleNavToggle(e);
    }
  }
  
  // =============================================================================
  // ACCESSIBILITY
  // =============================================================================
  
  setupAccessibility() {
    // Ensure proper ARIA attributes
    this.ensureAriaAttributes();
    
    // Setup focus management
    this.setupFocusManagement();
  }
  
  ensureAriaAttributes() {
    // Mobile menu
    if (this.mobileMenu) {
      this.mobileMenu.setAttribute('aria-hidden', 'true');
    }
    
    // Search
    if (this.searchButton) {
      this.searchButton.setAttribute('aria-expanded', 'false');
      this.searchButton.setAttribute('aria-controls', 'search-input');
    }
    
    if (this.searchInput) {
      this.searchInput.id = 'search-input';
      this.searchInput.setAttribute('aria-label', 'Search');
    }
    
    // Language selector
    if (this.langButton) {
      this.langButton.setAttribute('aria-expanded', 'false');
    }
    
    // Navigation dropdowns
    this.navToggles.forEach(toggle => {
      toggle.setAttribute('aria-expanded', 'false');
    });
  }
  
  setupFocusManagement() {
    // Trap focus in mobile menu when open
    if (this.mobileMenu) {
      this.mobileMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && this.isMobileMenuOpen) {
          this.trapFocusInMobileMenu(e);
        }
      });
    }
  }
  
  trapFocusInMobileMenu(e) {
    const focusableElements = this.mobileMenu.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
  
  announceToScreenReader(message) {
    // Create or update live region for screen reader announcements
    let liveRegion = document.getElementById('sr-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'sr-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = message;
  }
  
  // =============================================================================
  // RESPONSIVE STATE MANAGEMENT
  // =============================================================================
  
  initializeResponsiveState() {
    const isDesktop = this.isDesktopViewport();
    this.updateBurgerInteractivity(isDesktop);

    if (isDesktop && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  updateBurgerInteractivity(isDesktop) {
    if (!this.burger) {
      return;
    }

    this.burger.style.pointerEvents = isDesktop ? 'none' : 'auto';
    this.burger.setAttribute('aria-hidden', isDesktop ? 'true' : 'false');
  }

  isDesktopViewport() {
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  }

  // =============================================================================
  // THEME MANAGEMENT
  // =============================================================================
  
  initializeTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('diaeta-header-theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Default to solid theme
      this.setTheme('solid');
    }
  }
  
  setTheme(theme) {
    if (theme === 'glass' || theme === 'solid') {
      this.header.className = this.header.className.replace(/theme-\w+/, '');
      this.header.classList.add(`theme-${theme}`);
      localStorage.setItem('diaeta-header-theme', theme);
    }
  }
  
  // =============================================================================
  // UTILITY METHODS
  // =============================================================================
  
  handleOutsideClick(e) {
    const clickedToggle = Array.from(this.navToggles).some(toggle => toggle.contains(e.target));
    const clickedLangButton = this.langButton && this.langButton.contains(e.target);
    const clickedLangMenu = this.langDropdown && this.langDropdown.contains(e.target);

    if (this.activeDropdown &&
        !this.activeDropdown.contains(e.target) &&
        !clickedToggle) {
      this.closeAllDropdowns();
    }

    if (this.langDropdown &&
        this.langDropdown.classList.contains('is-open') &&
        !clickedLangButton &&
        !clickedLangMenu) {
      this.closeLanguageDropdown();
    }

    if (this.isMobileMenuOpen &&
        this.mobileMenu &&
        !this.mobileMenu.contains(e.target) &&
        this.burger &&
        !this.burger.contains(e.target)) {
      this.closeMobileMenu();
    }
  }
  
  handleResize() {
    const isDesktop = this.isDesktopViewport();

    // Close mobile menu on desktop resize and sync burger state
    if (isDesktop && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }

    this.updateBurgerInteractivity(isDesktop);

    // Close search when shifting into mobile layout
    if (!isDesktop && this.isSearchOpen) {
      this.closeSearch();
    }
  }
  
  // =============================================================================
  // PUBLIC API
  // =============================================================================
  
  // Method to programmatically change theme
  switchTheme(theme) {
    this.setTheme(theme);
  }
  
  // Method to get current theme
  getCurrentTheme() {
    return this.header.classList.contains('theme-glass') ? 'glass' : 'solid';
  }
  
  // Method to check if mobile menu is open
  isMobileMenuOpen() {
    return this.isMobileMenuOpen;
  }
  
  // Method to check if search is open
  isSearchOpen() {
    return this.isSearchOpen;
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.headerNavigation = new HeaderNavigation();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeaderNavigation;
}
