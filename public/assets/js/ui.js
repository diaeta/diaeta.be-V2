// Small unobtrusive UI enhancements
(function () {
  try {
    // Animate-on-scroll elements
    var els = document.querySelectorAll('.animate-on-scroll');
    if ('IntersectionObserver' in window && els.length) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            obs.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
      els.forEach(function (el) { obs.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add('in-view'); });
    }

    // Smooth scroll for .scroll-to links
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest('a.scroll-to');
      if (!a) return;
      var href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        var tgt = document.querySelector(href);
        if (tgt) {
          ev.preventDefault();
          tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  } catch (e) { /* no-op */ }
})();

document.addEventListener('DOMContentLoaded', () => {
  // Language switcher toggle
  const langSelector = document.querySelector('.lang-selector');
  if (langSelector) {
    const langToggle = langSelector.querySelector('.lang-toggle');
    const langDropdown = langSelector.querySelector('.lang-dropdown');

    langToggle.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent click from bubbling up to document
      const isExpanded = langToggle.getAttribute('aria-expanded') === 'true';
      langToggle.setAttribute('aria-expanded', !isExpanded);
      langDropdown.classList.toggle('open');
    });

    // Close dropdown if clicking outside
    document.addEventListener('click', (event) => {
      if (!langSelector.contains(event.target)) {
        langToggle.setAttribute('aria-expanded', 'false');
        langDropdown.classList.remove('open');
      }
    });
  }
});

