(() => {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  const burger = header.querySelector('.burger');
  const drawer = document.getElementById('mobile-menu');
  const closeBtn = drawer?.querySelector('.mnav__close');
  const backdrop = drawer?.querySelector('.mnav__backdrop');
  const focusableSelector = 'a, button, input, [tabindex]:not([tabindex="-1"])';
  let trapHandler = null;

  const dropdownItems = Array.from(header.querySelectorAll('.nav__item--has-sub'));
  const langButton = header.querySelector('.lang');
  const langDropdown = header.querySelector('.lang-dropdown');

  let ticking = false;
  const updateHeader = () => {
    const y = window.scrollY || 0;
    header.classList.toggle('is-scrolled', y > 40);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
  updateHeader();

  const closeAllDropdowns = (except) => {
    dropdownItems.forEach((item) => {
      if (item === except) return;
      item.dataset.open = 'false';
      item.querySelector('.nav__toggle')?.setAttribute('aria-expanded', 'false');
    });
  };

  dropdownItems.forEach((item) => {
    const toggle = item.querySelector('.nav__toggle');
    const menu = item.querySelector('.nav-sub');
    if (!toggle || !menu) return;
    const links = Array.from(menu.querySelectorAll('.nav-sub__link'));

    const openDropdown = () => {
      closeAllDropdowns(item);
      item.dataset.open = 'true';
      toggle.setAttribute('aria-expanded', 'true');
      if (links.length) {
        requestAnimationFrame(() => links[0].focus());
      }
    };

    const closeDropdown = () => {
      item.dataset.open = 'false';
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (item.dataset.open === 'true') {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeDropdown();
        toggle.focus();
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (item.dataset.open !== 'true') {
          openDropdown();
        } else if (links.length) {
          links[0].focus();
        }
      }
    });

    menu.addEventListener('keydown', (event) => {
      const index = links.indexOf(document.activeElement);

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const next = (index + 1) % links.length;
        links[next]?.focus();
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prev = index <= 0 ? links.length - 1 : index - 1;
        links[prev]?.focus();
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeDropdown();
        toggle.focus();
        return;
      }

      if (event.key === 'Tab') {
        closeDropdown();
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav__item--has-sub')) {
      closeAllDropdowns();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const openItem = dropdownItems.find((item) => item.dataset.open === 'true');
      if (openItem) {
        closeAllDropdowns();
        openItem.querySelector('.nav__toggle')?.focus();
      }
    }
  });

  const setLangDropdown = (open) => {
    if (!langButton || !langDropdown) return;
    langButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    langDropdown.classList.toggle('open', open);
  };

  if (langButton && langDropdown) {
    langButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = langButton.getAttribute('aria-expanded') === 'true';
      setLangDropdown(!isOpen);
    });

    document.addEventListener('click', (event) => {
      if (!langButton.contains(event.target) && !langDropdown.contains(event.target)) {
        setLangDropdown(false);
      }
    });

    langDropdown.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setLangDropdown(false);
        langButton.focus();
      }
    });
  }

  const focusFirstInDrawer = () => {
    if (!drawer) return;
    const focusables = Array.from(drawer.querySelectorAll(focusableSelector));
    (focusables[0] || closeBtn || burger)?.focus();
  };

  const openDrawer = () => {
    if (!drawer || !burger || !drawer.hidden) return;
    drawer.hidden = false;
    document.documentElement.classList.add('nav-open');
    burger.setAttribute('aria-expanded', 'true');
    focusFirstInDrawer();

    trapHandler = (event) => {
      if (event.key !== 'Tab') return;
      const focusables = Array.from(drawer.querySelectorAll(focusableSelector));
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    };

    drawer.addEventListener('keydown', trapHandler);
  };

  const closeDrawer = () => {
    if (!drawer || !burger || drawer.hidden) return;
    drawer.hidden = true;
    document.documentElement.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');

    if (trapHandler) {
      drawer.removeEventListener('keydown', trapHandler);
      trapHandler = null;
    }

    burger.focus();
  };

  const toggleDrawer = () => {
    if (!drawer || !burger) return;
    if (drawer.hidden) {
      openDrawer();
    } else {
      closeDrawer();
    }
  };

  burger?.addEventListener('click', (event) => {
    event.preventDefault();
    toggleDrawer();
  });

  closeBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    closeDrawer();
  });

  backdrop?.addEventListener('click', closeDrawer);

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDrawer();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1180) {
      closeDrawer();
    }
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (link && drawer && !drawer.hidden && drawer.contains(link)) {
      closeDrawer();
    }
  });

  drawer?.querySelectorAll('.mnav__group').forEach((group) => {
    const summary = group.querySelector('summary');
    const links = Array.from(group.querySelectorAll('.mnav__sublink'));

    summary?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        group.open = !group.open;
        if (group.open && links.length) {
          requestAnimationFrame(() => links[0].focus());
        }
      }
    });
  });

  const mobileLangOptions = drawer ? Array.from(drawer.querySelectorAll('.mnav__lang-option')) : [];
  mobileLangOptions.forEach((option) => {
    option.addEventListener('click', () => {
      mobileLangOptions.forEach((opt) => opt.classList.toggle('active', opt === option));
      closeDrawer();
    });
  });

  const spyLinks = Array.from(document.querySelectorAll('a[data-spy]'));
  const spyMap = new Map();

  spyLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || !href.includes('#')) return;
    const id = href.replace(/^.*#/, '');
    const target = document.getElementById(id);
    if (target) {
      spyMap.set(target, link);
    }
  });

  if (spyMap.size > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = spyMap.get(entry.target);
        if (!link) return;

        if (entry.isIntersecting) {
          document.querySelectorAll('.nav__link.is-active').forEach((node) => node.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, {
      rootMargin: '-40% 0px -55% 0px',
      threshold: 0.01,
    });

    spyMap.forEach((_, section) => observer.observe(section));
  }

  const init = () => {
    closeAllDropdowns();
    if (drawer) {
      drawer.hidden = true;
      document.documentElement.classList.remove('nav-open');
    }
    burger?.setAttribute('aria-expanded', 'false');
    if (langButton && langDropdown) {
      setLangDropdown(false);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
