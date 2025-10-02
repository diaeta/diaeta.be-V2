// =============================================================================
// SCROLL ANIMATIONS - Cutting-edge reveal animations and interactions
// Using Intersection Observer API for performance
// =============================================================================

class ScrollAnimations {
  constructor() {
    this.initObserver();
    this.initParallax();
    this.initCounters();
    this.initProgressBars();
  }

  // Initialize Intersection Observer for reveal animations
  initObserver() {
    const options = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');

          // Trigger counter animations
          if (entry.target.hasAttribute('data-counter')) {
            this.animateCounter(entry.target);
          }
        }
      });
    }, options);

    // Observe all sections and cards
    const elements = document.querySelectorAll(`
      section,
      .c-programs__card,
      .c-approach__feature,
      .c-journey__phase,
      .c-expertise__card,
      .c-testimonials__card,
      .c-philosophy__principle,
      .c-faq__item,
      .c-pricing__card
    `);

    elements.forEach(el => {
      el.classList.add('reveal-on-scroll');
      this.observer.observe(el);
    });
  }

  // Parallax scrolling for hero and decorative elements
  initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    if (parallaxElements.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;

          parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            const yPos = -(scrolled * speed);
            el.style.transform = `translate3d(0, ${yPos}px, 0)`;
          });

          ticking = false;
        });

        ticking = true;
      }
    });
  }

  // Animated number counters
  animateCounter(element) {
    const target = parseInt(element.dataset.counter);
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current).toLocaleString();
      }
    }, 16);
  }

  // Animated progress bars
  initProgressBars() {
    const progressBars = document.querySelectorAll('[data-progress]');

    progressBars.forEach(bar => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = parseFloat(bar.dataset.progress);
            bar.style.setProperty('--progress', `${target}%`);
            observer.unobserve(bar);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(bar);
    });
  }

  // Cleanup
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ScrollAnimations();
  });
} else {
  new ScrollAnimations();
}
