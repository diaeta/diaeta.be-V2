(() => {
  const header = document.querySelector('[data-header]');
  const burger = document.querySelector('.burger');
  const drawer = document.getElementById('mobile-menu');
  const closeBtn = drawer?.querySelector('.mnav__close');
  const backdrop = drawer?.querySelector('.mnav__backdrop');
  const focusables = 'a, button, input, [tabindex]:not([tabindex="-1"])';
  let lastScroll = 0;
  let trapHandler = null;

  // 1) Sticky shrink with performance optimization
  let ticking = false;
  function updateHeader() {
    const y = window.scrollY || 0;
    header.classList.toggle('is-scrolled', y > 40);
    lastScroll = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  // 2) Enhanced desktop dropdown with better keyboard navigation
  const ddItems = document.querySelectorAll('.nav__item--has-sub');
  
  ddItems.forEach(ddItem => {
    const ddToggle = ddItem.querySelector('.nav__toggle');
    const ddMenu = ddItem.querySelector('.nav-sub');
    
    if (!ddToggle || !ddMenu) return;
    const ddLinks = ddMenu.querySelectorAll('.nav-sub__link');
    
    function setDD(state) {
      ddItem.dataset.open = state ? 'true' : 'false';
      ddToggle.setAttribute('aria-expanded', state);
      
      if (state) {
        // Focus first link when opening
        setTimeout(() => ddLinks[0]?.focus(), 0);
      }
    }

    // Click to toggle
    ddToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setDD(ddItem.dataset.open !== 'true');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!ddItem.contains(e.target)) {
        setDD(false);
      }
    });

    // Enhanced keyboard navigation
    ddToggle.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'Enter':
        case ' ':
          e.preventDefault();
          setDD(true);
          break;
        case 'Escape':
          setDD(false);
          break;
      }
    });

    // Arrow key navigation within dropdown
    ddMenu.addEventListener('keydown', (e) => {
      const currentIndex = Array.from(ddLinks).indexOf(document.activeElement);
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % ddLinks.length;
          ddLinks[nextIndex]?.focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = currentIndex <= 0 ? ddLinks.length - 1 : currentIndex - 1;
          ddLinks[prevIndex]?.focus();
          break;
        case 'Escape':
          setDD(false);
          ddToggle.focus();
          break;
        case 'Tab':
          // Allow natural tab flow, but close dropdown
          setDD(false);
          break;
      }
    });
  });

  // 2.5) Language dropdown functionality
  const langButton = document.querySelector('.lang');
  const langDropdown = document.querySelector('.lang-dropdown');
  const langCurrent = document.querySelector('.lang-current');
  
  if (langButton && langDropdown) {
    function toggleLangDropdown() {
      const isOpen = langButton.getAttribute('aria-expanded') === 'true';
      langButton.setAttribute('aria-expanded', !isOpen);
      langDropdown.classList.toggle('open', !isOpen);
    }

    function closeLangDropdown() {
      langButton.setAttribute('aria-expanded', 'false');
      langDropdown.classList.remove('open');
    }

    // Toggle dropdown on button click
    langButton.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLangDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!langButton.contains(e.target) && !langDropdown.contains(e.target)) {
        closeLangDropdown();
      }
    });

    // Handle language option clicks
    const langOptions = langDropdown.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all options
        langOptions.forEach(opt => opt.classList.remove('active'));
        
        // Add active class to clicked option
        option.classList.add('active');
        
        // Update current language display
        const langCode = option.dataset.lang.toUpperCase();
        langCurrent.textContent = langCode;
        
        // Close dropdown
        closeLangDropdown();
        
        // Here you would typically redirect to the appropriate language version
        // For now, we'll just update the display
        console.log(`Language switched to: ${option.textContent} (${langCode})`);
        
        // Uncomment the line below to actually redirect:
        // window.location.href = option.href;
      });
    });

    // Keyboard navigation for language dropdown
    langButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleLangDropdown();
      } else if (e.key === 'Escape') {
        closeLangDropdown();
      }
    });

    // Arrow key navigation within dropdown
    langDropdown.addEventListener('keydown', (e) => {
      const options = Array.from(langOptions);
      const currentIndex = options.indexOf(document.activeElement);
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % options.length;
          options[nextIndex]?.focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
          options[prevIndex]?.focus();
          break;
        case 'Escape':
          closeLangDropdown();
          langButton.focus();
          break;
      }
    });
  }

  // 3) Enhanced mobile drawer with improved focus management
  function openDrawer() {
    drawer.hidden = false;
    document.documentElement.classList.add('nav-open');
    burger.setAttribute('aria-expanded', 'true');
    
    // Focus first focusable element
    const focusEls = drawer.querySelectorAll(focusables);
    focusEls[0]?.focus();

    // Enhanced focus trap
    trapHandler = (e) => {
      if (e.key !== 'Tab') return;
      
      const focusEls = drawer.querySelectorAll(focusables);
      if (!focusEls.length) return;
      
      const first = focusEls[0];
      const last = focusEls[focusEls.length - 1];
      
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    };
    
    drawer.addEventListener('keydown', trapHandler);
    drawer.dataset.trap = '1';
  }

  function closeDrawer() {
    drawer.hidden = true;
    document.documentElement.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
    
    // Remove focus trap
    if (trapHandler) {
      drawer.removeEventListener('keydown', trapHandler);
      trapHandler = null;
    }
    
    // Return focus to burger button
    burger.focus();
  }

  // Event listeners for mobile drawer
  burger?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  // Global escape key handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) {
      closeDrawer();
    }
  });

  // 4) Enhanced active section spy with better performance
  const spyLinks = document.querySelectorAll('a[data-spy]');
  const idFromHref = (a) => a.getAttribute('href')?.replace(/^.*#/, '');
  const map = new Map();
  
  spyLinks.forEach(a => {
    const id = idFromHref(a);
    const el = id ? document.getElementById(id) : null;
    if (el) map.set(el, a);
  });

  if (map.size > 0) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const link = map.get(entry.target);
        if (!link) return;
        
        if (entry.isIntersecting) {
          // Remove active class from all spy links
          document.querySelectorAll('.nav__link.is-active').forEach(n => 
            n.classList.remove('is-active')
          );
          // Add active class to current link
          link.classList.add('is-active');
        }
      });
    }, { 
      rootMargin: '-40% 0px -55% 0px', 
      threshold: 0.01 
    });
    
    map.forEach((_, el) => obs.observe(el));
  }

  // 5) Handle mobile menu accordion (details/summary)
  const mobileGroups = drawer?.querySelectorAll('.mnav__group');
  mobileGroups?.forEach(group => {
    const summary = group.querySelector('summary');
    const links = group.querySelectorAll('.mnav__sublink');

    // Ensure proper keyboard navigation for accordion
    summary?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        group.open = !group.open;

        // Focus first sublink when opening
        if (group.open && links.length > 0) {
          setTimeout(() => links[0]?.focus(), 0);
        }
      }
    });
  });

  // 5.5) Handle mobile language selector
  const mobileLangOptions = drawer?.querySelectorAll('.mnav__lang-option');
  mobileLangOptions?.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all mobile language options
      mobileLangOptions.forEach(opt => opt.classList.remove('active'));
      
      // Add active class to clicked option
      option.classList.add('active');
      
      // Update desktop language display if it exists
      if (langCurrent) {
        const langCode = option.dataset.lang.toUpperCase();
        langCurrent.textContent = langCode;
      }
      
      // Close mobile menu
      closeDrawer();
      
      // Here you would typically redirect to the appropriate language version
      console.log(`Mobile language switched to: ${option.textContent}`);
      
      // Uncomment the line below to actually redirect:
      // window.location.href = option.href;
    });
  });

  // 6) Handle window resize - close mobile menu on desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && !drawer.hidden) {
      closeDrawer();
    }
  });

  // 7) Handle page navigation - close mobile menu
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (link && !drawer.hidden) {
      // Close drawer when navigating to a new page
      closeDrawer();
    }
  });

  // 8) Initialize - ensure proper initial state
  function init() {
    // Close any open dropdowns
    ddItems.forEach(ddItem => {
      const ddToggle = ddItem.querySelector('.nav__toggle');
      const ddMenu = ddItem.querySelector('.nav-sub');
      if (ddToggle && ddMenu) {
        ddItem.dataset.open = 'false';
        ddToggle.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Ensure mobile menu is closed
    if (drawer) {
      drawer.hidden = true;
      document.documentElement.classList.remove('nav-open');
    }
    
    // Set initial burger state
    if (burger) {
      burger.setAttribute('aria-expanded', 'false');
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
