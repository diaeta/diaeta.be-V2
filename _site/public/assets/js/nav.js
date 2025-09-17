document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // Language dropdown toggles
  document.querySelectorAll('.lang-toggle').forEach((btn) => {
    const controls = btn.getAttribute('aria-controls');
    const dropdown = controls ? document.getElementById(controls) : btn.closest('.lang-selector')?.querySelector('.lang-dropdown');
    if (!dropdown) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      dropdown.classList.toggle('open', !expanded);
    });
    document.addEventListener('click', (evt) => {
      if (!dropdown.contains(evt.target) && !btn.contains(evt.target)) {
        btn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('open');
      }
    });
  });
});

