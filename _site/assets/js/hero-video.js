/**
 * Hero Video Management
 * Handles video loading, performance optimization, and fallback
 */

class HeroVideoManager {
  constructor() {
    this.video = document.querySelector('.hero-video');
    this.fallbackImage = document.querySelector('.hero-fallback-image');
    this.overlay = document.querySelector('.hero-overlay');
    this.isVideoLoaded = false;
    this.isVideoPlaying = false;
    
    this.init();
  }
  
  init() {
    if (!this.video) return;
    
    this.setupVideoEvents();
    this.optimizeVideoLoading();
    this.handleReducedMotion();
  }
  
  setupVideoEvents() {
    // Video loaded successfully
    this.video.addEventListener('loadeddata', () => {
      this.isVideoLoaded = true;
      this.video.style.opacity = '0.4';
      console.log('Hero video loaded successfully');
    });
    
    // Video started playing
    this.video.addEventListener('playing', () => {
      this.isVideoPlaying = true;
      this.hideFallback();
    });
    
    // Video failed to load
    this.video.addEventListener('error', () => {
      console.warn('Hero video failed to load, showing fallback');
      this.showFallback();
    });
    
    // Video can't play (e.g., autoplay blocked)
    this.video.addEventListener('canplay', () => {
      this.video.play().catch(error => {
        console.warn('Video autoplay blocked:', error);
        this.showFallback();
      });
    });
    
    // Handle visibility change (pause when tab is hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseVideo();
      } else {
        this.resumeVideo();
      }
    });
  }
  
  optimizeVideoLoading() {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.showFallback();
      return;
    }
    
    // Check connection speed
    if (navigator.connection) {
      const connection = navigator.connection;
      const isSlowConnection = connection.effectiveType === 'slow-2g' || 
                              connection.effectiveType === '2g' ||
                              connection.saveData;
      
      if (isSlowConnection) {
        console.log('Slow connection detected, using fallback image');
        this.showFallback();
        return;
      }
    }
    
    // Check if device is mobile and battery is low
    if (this.isMobileDevice() && navigator.getBattery) {
      navigator.getBattery().then(battery => {
        if (battery.level < 0.2) {
          console.log('Low battery detected, using fallback image');
          this.showFallback();
        }
      });
    }
  }
  
  handleReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e) => {
      if (e.matches) {
        this.showFallback();
      } else {
        this.resumeVideo();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    handleChange(mediaQuery);
  }
  
  showFallback() {
    if (this.fallbackImage) {
      this.fallbackImage.style.display = 'block';
    }
    if (this.video) {
      this.video.style.display = 'none';
    }
  }
  
  hideFallback() {
    if (this.fallbackImage) {
      this.fallbackImage.style.display = 'none';
    }
  }
  
  pauseVideo() {
    if (this.video && this.isVideoPlaying) {
      this.video.pause();
    }
  }
  
  resumeVideo() {
    if (this.video && this.isVideoLoaded && !this.isVideoPlaying) {
      this.video.play().catch(error => {
        console.warn('Could not resume video:', error);
      });
    }
  }
  
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  // Public method to manually switch to fallback
  switchToFallback() {
    this.showFallback();
  }
  
  // Public method to manually switch to video
  switchToVideo() {
    if (this.video && this.isVideoLoaded) {
      this.video.style.display = 'block';
      this.hideFallback();
      this.video.play().catch(error => {
        console.warn('Could not play video:', error);
      });
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new HeroVideoManager();
});

// Export for potential external use
window.HeroVideoManager = HeroVideoManager;
