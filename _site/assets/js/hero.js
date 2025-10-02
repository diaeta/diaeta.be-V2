/**
 * Hero Section - Interactive Professional Dietitian Hero
 * Handles program switching, animations, scroll interactions, and device motion
 */

(function () {
  'use strict';

  // ==========================================================================
  // CONSTANTS
  // ==========================================================================

  const SELECTORS = {
    hero: '[data-hero]',
    programBtn: '[data-program]',
    programDetail: '[data-program-detail]',
    detailsContainer: '#hero-details',
    floatCard: '[data-float]',
    scrollBtn: '[data-scroll-to]',
    imageWrapper: '.c-hero__image-wrapper',
    stats: '[data-count]',
  };

  let currentProgram = 'ibs';
  let currentLang = 'en';

  // ==========================================================================
  // PROGRAM SWITCHING
  // ==========================================================================

  function initProgramSwitcher() {
    const hero = document.querySelector(SELECTORS.hero);
    const buttons = document.querySelectorAll(SELECTORS.programBtn);
    const detailCards = document.querySelectorAll('[data-program-detail]');

    if (!hero || !buttons.length || !detailCards.length) return;

    // Get current language from hero data attribute
    currentLang = hero.getAttribute('data-lang') || 'en';

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const program = button.getAttribute('data-program');
        if (program === currentProgram) return;

        switchProgram(program, buttons, detailCards);
      });
    });
  }

  function switchProgram(program, buttons, detailCards) {
    // Update active state
    buttons.forEach((btn) => {
      const isActive = btn.getAttribute('data-program') === program;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });

    // Switch visible detail card with fade animation
    detailCards.forEach((card) => {
      const cardProgram = card.getAttribute('data-program-detail');

      if (cardProgram === program) {
        card.style.display = 'block';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 10);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 200);
      }
    });

    currentProgram = program;

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Analytics
    trackEvent('hero_program_switch', { program, lang: currentLang });
  }

  // ==========================================================================
  // 3D TILT EFFECT (DESKTOP)
  // ==========================================================================

  function init3DTilt() {
    const imageWrapper = document.querySelector(SELECTORS.imageWrapper);
    if (!imageWrapper || window.innerWidth < 1024) return;

    imageWrapper.addEventListener('mousemove', (e) => {
      const rect = imageWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg
      const rotateY = ((x - centerX) / centerX) * 5; // Max 5deg

      imageWrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    imageWrapper.addEventListener('mouseleave', () => {
      imageWrapper.style.transform = 'perspective(1000px) rotateY(-2deg)';
    });
  }

  // ==========================================================================
  // DEVICE MOTION PARALLAX (MOBILE)
  // ==========================================================================

  function initDeviceMotion() {
    if (window.innerWidth >= 1024) return;

    const floatingCards = document.querySelectorAll(SELECTORS.floatCard);
    if (!floatingCards.length) return;

    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', (e) => {
        const gamma = e.gamma; // Left to right tilt (-90 to 90)
        const beta = e.beta; // Front to back tilt (-180 to 180)

        floatingCards.forEach((card, index) => {
          const factor = (index + 1) * 0.5;
          const x = (gamma / 90) * 10 * factor;
          const y = (beta / 180) * 10 * factor;

          card.style.transform = `translate(${x}px, ${y}px)`;
        });
      });
    }
  }

  // ==========================================================================
  // SCROLL ANIMATIONS
  // ==========================================================================

  function initScrollAnimations() {
    const scrollBtn = document.querySelector(SELECTORS.scrollBtn);
    if (!scrollBtn) return;

    scrollBtn.addEventListener('click', () => {
      const target = scrollBtn.getAttribute('data-scroll-to');
      const targetElement = document.querySelector(target);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(15);
        }
      }
    });

    // Hide scroll button when scrolled down
    window.addEventListener(
      'scroll',
      () => {
        if (window.scrollY > 200) {
          scrollBtn.style.opacity = '0';
          scrollBtn.style.pointerEvents = 'none';
        } else {
          scrollBtn.style.opacity = '1';
          scrollBtn.style.pointerEvents = 'auto';
        }
      },
      { passive: true }
    );
  }

  // ==========================================================================
  // ANIMATED NUMBER COUNTERS
  // ==========================================================================

  function initStatCounters() {
    const stats = document.querySelectorAll(SELECTORS.stats);
    if (!stats.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    stats.forEach((stat) => observer.observe(stat));
  }

  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = formatNumber(target);
        clearInterval(timer);
      } else {
        element.textContent = formatNumber(Math.floor(current));
      }
    }, duration / steps);
  }

  function formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  }

  // ==========================================================================
  // FLOATING CARDS INTERACTION
  // ==========================================================================

  function initFloatingCards() {
    const cards = document.querySelectorAll(SELECTORS.floatCard);
    if (!cards.length) return;

    cards.forEach((card, index) => {
      // Cycle visibility
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 1000 + index * 300);

      // Add hover effect
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.05)';
        card.style.zIndex = '10';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1)';
        card.style.zIndex = '1';
      });
    });
  }

  // ==========================================================================
  // GRADIENT MESH MOUSE FOLLOW
  // ==========================================================================

  function initGradientMesh() {
    const blobs = document.querySelectorAll('.c-hero__gradient-blob');
    if (!blobs.length) return;

    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;

      blobs.forEach((blob, index) => {
        const speed = (index + 1) * 0.05;
        const offsetX = (x - 50) * speed;
        const offsetY = (y - 50) * speed;

        blob.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });
    });
  }

  // ==========================================================================
  // ANALYTICS
  // ==========================================================================

  function trackEvent(eventName, data = {}) {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...data,
      });
    }

    window.dispatchEvent(new CustomEvent('hero:' + eventName, { detail: data }));
  }

  // ==========================================================================
  // KEYBOARD ACCESSIBILITY
  // ==========================================================================

  function initKeyboardNav() {
    const programBtns = document.querySelectorAll(SELECTORS.programBtn);
    if (!programBtns.length) return;

    programBtns.forEach((btn, index) => {
      btn.addEventListener('keydown', (e) => {
        let targetIndex = index;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          targetIndex = (index + 1) % programBtns.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          targetIndex = (index - 1 + programBtns.length) % programBtns.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          targetIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          targetIndex = programBtns.length - 1;
        } else {
          return;
        }

        programBtns[targetIndex].focus();
        programBtns[targetIndex].click();
      });
    });
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    const hero = document.querySelector(SELECTORS.hero);
    if (!hero) return;

    initProgramSwitcher();
    init3DTilt();
    initDeviceMotion();
    initScrollAnimations();
    initStatCounters();
    initFloatingCards();
    initGradientMesh();
    initKeyboardNav();

    // Announce ready
    window.dispatchEvent(new CustomEvent('hero:ready'));
  }

  // Start
  init();
})();
