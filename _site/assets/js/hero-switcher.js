/**
 * Hero Program Switcher
 * Interactive program selection for the hero section
 */

(() => {
  const root = document.querySelector('.hero-pro');
  const tabs = document.querySelectorAll('.hero-switcher__tab');
  const title = document.getElementById('hero-title');
  const dyn = document.getElementById('hero-dynamic');
  const cta = document.getElementById('hero-cta');

  // Early return if required elements don't exist
  if (!root || !tabs.length || !title || !dyn || !cta) {
    // console.warn('Hero switcher: Required elements not found');
    return;
  }

  const content = {
    ibs: {
      title: 'Dietitian in Brussels for IBS (low-FODMAP), weight & diabetes',
      bullets: [
        '<strong>IBS:</strong> Low-FODMAP mapping to find <em>your</em> tolerances, phased reintroduction, flare control.',
        '<strong>Tools:</strong> Easy swaps + app-based symptom tracking.',
        '<strong>Results:</strong> Less bloating & pain, more food freedom.'
      ],
      cta: 'Start IBS program', 
      tone: 'ibs'
    },
    weight: {
      title: 'Dietitian in Brussels for weight loss, IBS & diabetes',
      bullets: [
        '<strong>Weight:</strong> Calorie-aware, protein-forward meals without hunger.',
        '<strong>Tools:</strong> Bio-impedance tracking, habit levers you can keep.',
        '<strong>Results:</strong> Downward trend you can maintain.'
      ],
      cta: 'Start Weight program', 
      tone: 'weight'
    },
    t2d: {
      title: 'Dietitian in Brussels for type 2 diabetes, weight & cholesterol',
      bullets: [
        '<strong>T2D:</strong> Glycemic control with smart carbs & fibre timing.',
        '<strong>Tools:</strong> CGM-informed tweaks (if available) + realistic meal builds.',
        '<strong>Results:</strong> Better glucose patterns, more energy.'
      ],
      cta: 'Start Diabetes program', 
      tone: 't2d'
    },
    cholesterol: {
      title: 'Dietitian in Brussels for cholesterol, weight & diabetes',
      bullets: [
        '<strong>Cholesterol:</strong> Mediterranean pattern, soluble fibre, sterols.',
        '<strong>Tools:</strong> Simple food swaps + weekly check-ins.',
        '<strong>Results:</strong> Improved lipid profile, enjoyable meals.'
      ],
      cta: 'Start Cholesterol program', 
      tone: 'cholesterol'
    }
  };

  function render(key) {
    const c = content[key];
    if (!c) return;

    title.innerHTML = c.title;
    dyn.innerHTML = '<ul class="hero-dynamic__bullets"><li>' + c.bullets.join('</li><li>') + '</li></ul>';
    cta.textContent = c.cta;
    root.setAttribute('data-tone', c.tone);
    localStorage.setItem('heroProgram', key);
  }

  // Tab interactions
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => { 
        b.classList.remove('is-active'); 
        b.setAttribute('aria-selected', 'false'); 
      });
      btn.classList.add('is-active'); 
      btn.setAttribute('aria-selected', 'true');
      render(btn.dataset.program);
    });
  });

  // Restore last choice; auto-rotate if first visit
  const saved = localStorage.getItem('heroProgram');
  if (saved && content[saved]) {
    const savedTab = document.querySelector(`.hero-switcher__tab[data-program="${saved}"]`);
    if (savedTab) {
      savedTab.click();
    }
  } else {
    // Gentle auto-rotate (every 6s, pause on hover)
    let keys = ['ibs', 'weight', 't2d', 'cholesterol'];
    let i = 0;
    let paused = false;
    let rotateInterval;

    const startRotation = () => {
      if (rotateInterval) clearInterval(rotateInterval);
      rotateInterval = setInterval(() => {
        if (paused) return;
        i = (i + 1) % keys.length;
        const nextTab = document.querySelector(`.hero-switcher__tab[data-program="${keys[i]}"]`);
        if (nextTab) {
          nextTab.click();
        }
      }, 6000);
    };
    
    root.addEventListener('mouseenter', () => paused = true);
    root.addEventListener('mouseleave', () => {
      paused = false;
    });

    // Stop rotation if user manually selects a tab
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        if(rotateInterval) clearInterval(rotateInterval);
      });
    });

    startRotation();
  }
})();
