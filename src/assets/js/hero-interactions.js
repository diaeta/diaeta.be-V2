// =============================================================================
// HERO INTERACTIONS - Advanced hero section interactivity
// Mouse tracking, program switcher, smooth transitions
// =============================================================================

class HeroInteractions {
  constructor() {
    this.hero = document.querySelector('[data-hero]');
    if (!this.hero) return;

    this.programButtons = document.querySelectorAll('[data-program]');
    this.programDetails = document.querySelectorAll('[data-program-detail]');
    this.currentProgram = 0;

    this.initProgramSwitcher();
    this.initMouseTracking();
    this.initAutoRotate();
  }

  // Program tab switching with smooth transitions
  initProgramSwitcher() {
    this.programButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        this.switchProgram(index);
      });
    });

    // Keyboard navigation
    this.programButtons.forEach((btn, index) => {
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && index > 0) {
          this.switchProgram(index - 1);
          this.programButtons[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < this.programButtons.length - 1) {
          this.switchProgram(index + 1);
          this.programButtons[index + 1].focus();
        }
      });
    });
  }

  switchProgram(index) {
    // Update buttons
    this.programButtons.forEach((btn, i) => {
      btn.classList.toggle('is-active', i === index);
      btn.setAttribute('aria-selected', i === index);
    });

    // Update details with fade transition
    this.programDetails.forEach((detail, i) => {
      if (i === index) {
        detail.style.display = 'block';
        // Trigger reflow
        detail.offsetHeight;
        detail.style.opacity = '1';
        detail.style.transform = 'translateY(0)';
      } else {
        detail.style.opacity = '0';
        detail.style.transform = 'translateY(10px)';
        setTimeout(() => {
          detail.style.display = 'none';
        }, 300);
      }
    });

    this.currentProgram = index;
    this.resetAutoRotate();
  }

  // Subtle mouse tracking for depth effect
  initMouseTracking() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const floatingCards = this.hero.querySelectorAll('.c-hero__badge, .c-hero__stat');

    this.hero.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = this.hero.getBoundingClientRect();

      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;

      floatingCards.forEach((card, index) => {
        const depth = (index + 1) * 10;
        const moveX = x * depth;
        const moveY = y * depth;

        card.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    });

    this.hero.addEventListener('mouseleave', () => {
      floatingCards.forEach(card => {
        card.style.transform = 'translate(0, 0)';
      });
    });
  }

  // Auto-rotate programs every 5 seconds
  initAutoRotate() {
    this.rotateInterval = setInterval(() => {
      const nextIndex = (this.currentProgram + 1) % this.programButtons.length;
      this.switchProgram(nextIndex);
    }, 5000);
  }

  resetAutoRotate() {
    clearInterval(this.rotateInterval);
    this.initAutoRotate();
  }

  destroy() {
    clearInterval(this.rotateInterval);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new HeroInteractions();
  });
} else {
  new HeroInteractions();
}
