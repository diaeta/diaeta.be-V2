/**
 * Testimonials Timelines - Progressive Enhancement
 * Handles filtering functionality with accessibility support
 */

(function() {
  'use strict';

  // Check if we're in a reduced motion environment
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Initialize when DOM is ready
  function init() {
    const section = document.getElementById('testimonials-timelines');
    if (!section) return;

    const filters = section.querySelectorAll('.tt-filter');
    const items = section.querySelectorAll('.tt-item');
    
    if (filters.length === 0 || items.length === 0) return;

    // Create live region for screen reader announcements
    const liveRegion = createLiveRegion();
    section.appendChild(liveRegion);

    // Add event listeners to filters
    filters.forEach(filter => {
      filter.addEventListener('click', handleFilterClick);
      filter.addEventListener('keydown', handleFilterKeydown);
    });

    // Initialize with "All" filter active
    updateFilter('All', items, liveRegion);
  }

  function createLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'visually-hidden';
    liveRegion.textContent = '';
    return liveRegion;
  }

  function handleFilterClick(event) {
    event.preventDefault();
    const filter = event.currentTarget;
    const filterValue = filter.getAttribute('data-filter');
    
    const section = document.getElementById('testimonials-timelines');
    const items = section.querySelectorAll('.tt-item');
    const liveRegion = section.querySelector('[aria-live="polite"]');
    
    updateFilter(filterValue, items, liveRegion);
    updateFilterButtons(filter);
  }

  function handleFilterKeydown(event) {
    // Handle Enter and Space key activation
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleFilterClick(event);
    }
    
    // Handle arrow key navigation between filters
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      navigateFilters(event.currentTarget, event.key === 'ArrowRight' ? 1 : -1);
    }
  }

  function navigateFilters(currentFilter, direction) {
    const section = document.getElementById('testimonials-timelines');
    const filters = Array.from(section.querySelectorAll('.tt-filter'));
    const currentIndex = filters.indexOf(currentFilter);
    const nextIndex = (currentIndex + direction + filters.length) % filters.length;
    
    filters[nextIndex].focus();
  }

  function updateFilter(filterValue, items, liveRegion) {
    let visibleCount = 0;
    let hiddenCount = 0;

    items.forEach(item => {
      const itemProgram = item.getAttribute('data-program');
      const shouldShow = filterValue === 'All' || itemProgram === filterValue;
      
      if (shouldShow) {
        showItem(item);
        visibleCount++;
      } else {
        hideItem(item);
        hiddenCount++;
      }
    });

    // Announce changes to screen readers
    const announcement = filterValue === 'All' 
      ? `Showing all ${visibleCount} testimonials`
      : `Showing ${visibleCount} ${filterValue} testimonials`;
    
    liveRegion.textContent = announcement;
  }

  function showItem(item) {
    item.classList.remove('hidden');
    
    // Add a subtle animation if motion is not reduced
    if (!prefersReducedMotion) {
      item.style.opacity = '0';
      item.style.transform = 'translateY(10px)';
      
      requestAnimationFrame(() => {
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      });
    }
  }

  function hideItem(item) {
    if (!prefersReducedMotion) {
      item.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      item.style.opacity = '0';
      item.style.transform = 'translateY(-5px)';
      
      setTimeout(() => {
        item.classList.add('hidden');
        item.style.transition = '';
        item.style.opacity = '';
        item.style.transform = '';
      }, 200);
    } else {
      item.classList.add('hidden');
    }
  }

  function updateFilterButtons(activeFilter) {
    const section = document.getElementById('testimonials-timelines');
    const filters = section.querySelectorAll('.tt-filter');
    
    filters.forEach(filter => {
      const isActive = filter === activeFilter;
      filter.classList.toggle('is-active', isActive);
      filter.setAttribute('aria-pressed', isActive.toString());
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Handle reduced motion changes
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    // Re-initialize if motion preference changes
    if (e.matches !== prefersReducedMotion) {
      init();
    }
  });

})();
