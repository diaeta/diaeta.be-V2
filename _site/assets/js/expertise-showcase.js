/**
 * Expertise Showcase - Interactive Elements
 * Mind-blowing animations and interactions for the expertise section
 */

class ExpertiseShowcase {
  constructor() {
    this.init();
  }

  init() {
    this.setupAnimatedCounters();
    this.setupCardInteractions();
    this.setupTimelineAnimations();
    this.setupParticleSystem();
    this.setupScrollAnimations();
    this.setupHapticFeedback();
    this.setupKeyboardNavigation();
    this.setupIntersectionObserver();
    this.optimizePerformance();
  }

  /**
   * Animated counters for metrics
   */
  setupAnimatedCounters() {
    const counters = document.querySelectorAll('.metric-number[data-count]');
    
    const animateCounter = (counter) => {
      const target = parseInt(counter.dataset.count);
      const duration = 2000; // 2 seconds
      const start = performance.now();
      
      const updateCounter = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(target * easeOutQuart);
        
        counter.textContent = current;
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };
      
      requestAnimationFrame(updateCounter);
    };

    // Intersection Observer for counter animation
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  }

  /**
   * Interactive card hover effects
   */
  setupCardInteractions() {
    const cards = document.querySelectorAll('.expertise-card');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        this.animateCardHover(card, true);
      });
      
      card.addEventListener('mouseleave', () => {
        this.animateCardHover(card, false);
      });
      
      // Add click interaction for mobile
      card.addEventListener('click', () => {
        this.handleCardClick(card);
      });
    });
  }

  animateCardHover(card, isHovering) {
    const icon = card.querySelector('.card-icon');
    const glow = card.querySelector('.card-glow');
    const backdrop = card.querySelector('.card-backdrop');
    
    if (isHovering) {
      // Animate icon rotation
      if (icon) {
        icon.style.transform = 'rotate(5deg) scale(1.05)';
        icon.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      }
      
      // Animate glow effect
      if (glow) {
        glow.style.opacity = '0.3';
        glow.style.transform = 'scale(1.02)';
      }
      
      // Animate backdrop
      if (backdrop) {
        backdrop.style.opacity = '1';
      }
      
      // Add subtle shake to metrics
      const metrics = card.querySelectorAll('.metric');
      metrics.forEach((metric, index) => {
        setTimeout(() => {
          metric.style.transform = 'translateY(-2px)';
          metric.style.transition = 'transform 0.2s ease';
        }, index * 50);
      });
    } else {
      // Reset animations
      if (icon) {
        icon.style.transform = 'rotate(0deg) scale(1)';
      }
      
      if (glow) {
        glow.style.opacity = '0';
        glow.style.transform = 'scale(1)';
      }
      
      if (backdrop) {
        backdrop.style.opacity = '0';
      }
      
      const metrics = card.querySelectorAll('.metric');
      metrics.forEach(metric => {
        metric.style.transform = 'translateY(0)';
      });
    }
  }

  handleCardClick(card) {
    // Add click animation
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
      card.style.transform = '';
    }, 150);
    
    // Trigger CTA button if present
    const ctaButton = card.querySelector('.card-cta a');
    if (ctaButton && window.innerWidth <= 768) {
      // On mobile, simulate button click after a short delay
      setTimeout(() => {
        ctaButton.click();
      }, 200);
    }
  }

  /**
   * Timeline animations
   */
  setupTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateTimelineItem(entry.target);
          timelineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    timelineItems.forEach(item => {
      timelineObserver.observe(item);
    });
  }

  animateTimelineItem(item) {
    const marker = item.querySelector('.timeline-marker');
    const content = item.querySelector('.timeline-content');
    
    // Animate marker
    if (marker) {
      marker.style.transform = 'scale(1.2)';
      marker.style.transition = 'transform 0.3s ease';
      
      setTimeout(() => {
        marker.style.transform = 'scale(1)';
      }, 300);
    }
    
    // Animate content
    if (content) {
      content.style.transform = 'translateX(0)';
      content.style.opacity = '1';
      content.style.transition = 'all 0.5s ease';
    }
  }

  /**
   * Enhanced particle system
   */
  setupParticleSystem() {
    const particleContainer = document.querySelector('.expertise-particles');
    if (!particleContainer) return;
    
    // Create additional particles on scroll
    let particleCount = 0;
    const maxParticles = 15;
    
    const createParticle = () => {
      if (particleCount >= maxParticles) return;
      
      const particle = document.createElement('span');
      particle.className = 'particle particle--dynamic';
      
      // Random positioning
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
      
      particleContainer.appendChild(particle);
      particleCount++;
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
          particleCount--;
        }
      }, 20000);
    };
    
    // Create particles on scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (Math.random() > 0.7) {
          createParticle();
        }
      }, 100);
    });
  }

  /**
   * Scroll-based animations
   */
  setupScrollAnimations() {
    const expertiseSection = document.querySelector('.expertise-section');
    if (!expertiseSection) return;
    
    let ticking = false;
    
    const updateScrollEffects = () => {
      const rect = expertiseSection.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible) {
        const scrollProgress = Math.max(0, Math.min(1, 
          (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
        ));
        
        // Animate orbs based on scroll
        const orbs = document.querySelectorAll('.expertise-orb');
        orbs.forEach((orb, index) => {
          const speed = 0.5 + (index * 0.2);
          const offset = scrollProgress * speed * 50;
          orb.style.transform = `translate(${offset}px, ${offset * 0.5}px)`;
        });
        
        // Animate grid
        const grid = document.querySelector('.expertise-grid');
        if (grid) {
          grid.style.transform = `translate(${scrollProgress * 100}px, ${scrollProgress * 50}px)`;
        }
      }
      
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', requestTick, { passive: true });
  }

  /**
   * Parallax effect for background elements
   */
  setupParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.expertise-orb, .expertise-grid');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      
      parallaxElements.forEach((element, index) => {
        const speed = 0.3 + (index * 0.1);
        element.style.transform = `translateY(${rate * speed}px)`;
      });
    }, { passive: true });
  }

  /**
   * Performance optimization
   */
  optimizePerformance() {
    // Reduce animations on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }
    
    // Respect reduced motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const animatedElements = document.querySelectorAll('[class*="animate"], [class*="pulse"], [class*="float"]');
      animatedElements.forEach(el => {
        el.style.animation = 'none';
        el.style.transition = 'none';
      });
    }
  }

  /**
   * Add subtle haptic feedback for mobile devices
   */
  setupHapticFeedback() {
    if ('vibrate' in navigator) {
      const cards = document.querySelectorAll('.expertise-card');
      cards.forEach(card => {
        card.addEventListener('touchstart', () => {
          navigator.vibrate(10); // Very subtle vibration
        });
      });
    }
  }

  /**
   * Add keyboard navigation support
   */
  setupKeyboardNavigation() {
    const cards = document.querySelectorAll('.expertise-card');
    
    cards.forEach((card, index) => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleCardClick(card);
        }
        
        // Arrow key navigation
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const nextCard = cards[index + 1] || cards[0];
          nextCard.focus();
        }
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prevCard = cards[index - 1] || cards[cards.length - 1];
          prevCard.focus();
        }
      });
    });
  }

  /**
   * Add intersection observer for performance
   */
  setupIntersectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-viewport');
        } else {
          entry.target.classList.remove('in-viewport');
        }
      });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.expertise-card, .timeline-item, .expertise-orb');
    animatedElements.forEach(el => observer.observe(el));
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ExpertiseShowcase();
});

// Re-initialize on page navigation (for SPAs)
document.addEventListener('page:load', () => {
  new ExpertiseShowcase();
});

// Export for potential external use
window.ExpertiseShowcase = ExpertiseShowcase;
