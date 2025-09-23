document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('guided-journeys');
  if (!container) return;

  const journeyData = {
    ibs: {
      icon: '🌬️',
      title: 'IBS Freedom Journey',
      desc: 'Transform from food fear to confident eating. Our Monash-certified Low-FODMAP approach helps you identify triggers and reclaim your digestive peace. No more guessing games—just clear, personalized guidance.',
      link: '/en/irritable-bowel-syndrome-fodmap/',
      linkText: 'Begin Your Freedom'
    },
    weight: {
      icon: '⚖️',
      title: 'Sustainable Weight Mastery',
      desc: 'Break free from diet cycles forever. Build lasting habits that fit your life, not the other way around. No restrictions, just smart choices that work with your lifestyle and preferences.',
      link: '/en/weight-loss/',
      linkText: 'Start Your Transformation'
    },
    diabetes: {
      icon: '🩸',
      title: 'Diabetes Empowerment',
      desc: 'Take control of your blood sugar with confidence. Learn the art of balanced eating that works with your body, not against it. Master your condition with evidence-based strategies.',
      link: '/en/diabetes-management/',
      linkText: 'Master Your Health'
    },
    lipids: {
      icon: '❤️',
      title: 'Heart Protection Protocol',
      desc: 'Shield your cardiovascular health with delicious, heart-smart nutrition. Lower cholesterol naturally while enjoying every meal. Protect your future with every bite.',
      link: '/en/hypertension-cholesterol/',
      linkText: 'Protect Your Future'
    }
  };

  // --- Mobile Carousel Logic ---
  const track = container.querySelector('.journeys-track');
  const cards = Array.from(container.querySelectorAll('.journey-card'));
  const dotsContainer = container.querySelector('.carousel-dots');


  if (track && cards.length > 0 && dotsContainer) {
    // Create dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        // Scroll to the card
        track.scrollTo({
          left: cards[i].offsetLeft - track.offsetLeft,
          behavior: 'smooth'
        });
      });
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.querySelectorAll('.dot'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const index = cards.indexOf(entry.target);
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
          dots[index].classList.add('active');
        } else {
          entry.target.classList.remove('is-active');
          dots[index].classList.remove('active');
        }
      });
    }, {
      root: track,
      threshold: 0.6,
    });

    cards.forEach(card => observer.observe(card));

    function showMobileInfoPanel(journeyId) {
      const data = journeyData[journeyId];
      if (!data) return;

      // Remove any existing modal
      const existingModal = document.querySelector('.mobile-info-panel');
      if (existingModal) {
        existingModal.remove();
      }

      const modal = document.createElement('div');
      modal.classList.add('mobile-info-panel');
      modal.innerHTML = `
        <div class="mobile-info-panel__content">
          <button class="mobile-info-panel__close">&times;</button>
          <div class="panel-icon">${data.icon}</div>
          <h3 class="panel-title">${data.title}</h3>
          <p class="panel-desc">${data.desc}</p>
          <a href="${data.link}" class="panel-link btn btn-primary btn-lg">${data.linkText}</a>
        </div>
      `;
      document.body.appendChild(modal);

      // Close modal when clicking close button
      modal.querySelector('.mobile-info-panel__close').addEventListener('click', () => {
        modal.remove();
      });

      // Close modal when clicking outside
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Restore body scroll when modal is closed
      const restoreScroll = () => {
        document.body.style.overflow = '';
      };
      
      modal.querySelector('.mobile-info-panel__close').addEventListener('click', restoreScroll);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          restoreScroll();
        }
      });
    }

    cards.forEach((card, index) => {
      // Prevent link clicks from interfering
      const cardLink = card.querySelector('.card-link');
      if (cardLink) {
        cardLink.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const journeyId = card.dataset.journeyId;
          if (journeyId) {
            showMobileInfoPanel(journeyId);
          }
        });
      }

      // Add click event to the entire card
      card.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const journeyId = card.dataset.journeyId;
        if (journeyId) {
          showMobileInfoPanel(journeyId);
        }
      });

      // Make sure the card is clickable
      card.style.cursor = 'pointer';
    });
  }


  // --- Desktop Constellation Logic ---
  // Desktop constellation references (use the new field layout if present)
  const field = container.querySelector('.journeys-field') || container.querySelector('.journeys-constellation-container');
  const canvas = field ? field.querySelector('#constellation-canvas') : document.getElementById('constellation-canvas');
  const nodes = field ? Array.from(field.querySelectorAll('.journey-node')) : Array.from(container.querySelectorAll('.journey-node'));
  const infoPanel = document.getElementById('info-panel');

  if (canvas && nodes.length > 0 && infoPanel && field) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Per-program accent colors (hex)
    const programAccent = {
      ibs: '#6fe9d7',
      weight: '#7fbaff',
      diabetes: '#ffc177',
      lipids: '#ff8ab3',
    };

    function hexToRgb(hex) {
      const h = hex.replace('#','');
      const v = h.length === 3 ? h.split('').map(c=>c+c).join('') : h;
      const bigint = parseInt(v, 16);
      return { r: (bigint>>16)&255, g: (bigint>>8)&255, b: bigint&255 };
    }

    function resizeCanvas() {
      // Size canvas to the journeys field so lines align with grid items
      canvas.width = field.offsetWidth;
      canvas.height = field.offsetHeight;
    }

    function updateGridSizing() {
      // Adjust node min size by count/width to keep a balanced density
      const count = nodes.length;
      const w = field.offsetWidth;
      let min = 200;
      if (count >= 10 || w < 900) min = 160;
      if (count >= 12 || w < 760) min = 140;
      field.style.setProperty('--gj-node-min', `${min}px`);
    }

    function assignHeroSpans() {
      // Optional: pick a middle node to span on wide screens for visual rhythm
      nodes.forEach(n => n.classList.remove('node--span-2'));
      if (window.innerWidth < 1280 || nodes.length < 6) return;
      const idx = Math.floor(nodes.length / 2);
      const hero = nodes[idx];
      if (hero) hero.classList.add('node--span-2');
    }

    function createParticles() {
      particles = [];
      let particleCount = window.innerWidth > 1400 ? 200 : 140;
      for (let i = 0; i < particleCount; i++) {
        const isShootingStar = !prefersReduced && Math.random() < 0.04;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: isShootingStar ? (Math.random() - 0.5) * 3.5 : (Math.random() - 0.5) * 0.25,
          vy: isShootingStar ? (Math.random() - 0.5) * 3.5 : (Math.random() - 0.5) * 0.25,
          radius: isShootingStar ? Math.random() * 1.3 + 1 : Math.random() * 2 + 0.8,
          opacity: isShootingStar ? Math.random() * 0.5 + 0.5 : Math.random() * 0.6 + 0.3,
          pulse: Math.random() * Math.PI * 2,
          color: `rgba(${Math.floor(Math.random() * 155) + 100}, ${Math.floor(Math.random() * 155) + 100}, 255, ${Math.random() * 0.5 + 0.5})`,
          twinkle: Math.random() * 0.07 + 0.03,
          size: Math.random() * 0.5 + 0.5,
          isShootingStar,
          trail: []
        });
      }
    }

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    if (!prefersReduced) {
      field.addEventListener('mousemove', (e) => {
        const rect = field.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Parallax effect for particles
      const parallaxX = (mouse.x - canvas.width / 2) / 40;
      const parallaxY = (mouse.y - canvas.height / 2) / 40;

            // Draw particles with enhanced effects
            particles.forEach(p => {
              p.x += p.vx + parallaxX * (p.radius / 2);
              p.y += p.vy + parallaxY * (p.radius / 2);
              p.pulse += p.twinkle;
      
              if (p.isShootingStar) {
                p.trail.push({ x: p.x, y: p.y, opacity: p.opacity });
                if (p.trail.length > 10) {
                  p.trail.shift();
                }
                p.opacity *= 0.96;
                if (p.opacity < 0.1) {
                  p.x = Math.random() * canvas.width;
                  p.y = Math.random() * canvas.height;
                  p.vx = (Math.random() - 0.5) * 4;
                  p.vy = (Math.random() - 0.5) * 4;
                  p.opacity = Math.random() * 0.5 + 0.5;
                  p.trail = [];
                }
              }
      
              // Keep particles within bounds with smooth bouncing
              if (p.x < 0 || p.x > canvas.width) {
                if (!p.isShootingStar) p.vx *= -0.8;
                p.x = Math.max(0, Math.min(canvas.width, p.x));
              }
              if (p.y < 0 || p.y > canvas.height) {
                if (!p.isShootingStar) p.vy *= -0.8;
                p.y = Math.max(0, Math.min(canvas.height, p.y));
              }
      
              const pulseRadius = Math.max(0.8, p.radius + Math.sin(p.pulse) * 0.8);
              const pulseOpacity = Math.max(0.2, Math.min(1, p.opacity + Math.sin(p.pulse * 1.5) * 0.2));
      
              // Create multi-color gradient for particles
              const gradientRadius = Math.max(2, pulseRadius * 2.5);
              const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gradientRadius);
              
              gradient.addColorStop(0, `rgba(124, 58, 237, ${pulseOpacity})`);
              gradient.addColorStop(0.4, `rgba(245, 158, 11, ${pulseOpacity * 0.7})`);
              gradient.addColorStop(0.8, `rgba(102, 126, 234, ${pulseOpacity * 0.3})`);
              gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');
      
              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2);
              ctx.fill();
      
              if (p.isShootingStar) {
                ctx.fillStyle = `rgba(255, 255, 255, ${pulseOpacity * 0.9})`;
                p.trail.forEach((t, i) => {
                  const ratio = i / p.trail.length;
                  ctx.beginPath();
                  ctx.arc(t.x, t.y, pulseRadius * ratio, 0, Math.PI * 2);
                  ctx.globalAlpha = t.opacity * ratio;
                  ctx.fill();
                });
                ctx.globalAlpha = 1;
              }
      
              // Add sparkle effect for some particles
              if (Math.random() < 0.15) {
                ctx.fillStyle = `rgba(255, 255, 255, ${pulseOpacity * 0.9})`;
                ctx.beginPath();
                ctx.arc(p.x + Math.sin(p.pulse) * 3, p.y + Math.cos(p.pulse) * 3, 1.5, 0, Math.PI * 2);
                ctx.fill();
              }
            });
      // KNN-style links with per-program gradients, relative to field
      const fieldRect = field.getBoundingClientRect();
      const centers = nodes.map(n => {
        const r = n.getBoundingClientRect();
        const pid = (n.getAttribute('data-program') || '').trim();
        const { r: rr, g, b } = hexToRgb(programAccent[pid] || '#6fe9d7');
        return {
          x: (r.left - fieldRect.left) + r.width / 2,
          y: (r.top - fieldRect.top) + r.height / 2,
          rgb: { rr, g, b }
        };
      });

      const k = 3;
      const maxDist = Math.min(canvas.width, canvas.height) * 0.35;
      for (let i = 0; i < centers.length; i++) {
        const a = centers[i];
        const dists = centers
          .map((b, j) => ({ j, d: i === j ? Infinity : Math.hypot(a.x - b.x, a.y - b.y) }))
          .sort((m, n) => m.d - n.d)
          .slice(0, k);
        dists.forEach(({ j, d }) => {
          if (d > maxDist) return;
          const b = centers[j];
          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, `rgba(${a.rgb.rr}, ${a.rgb.g}, ${a.rgb.b}, 0.55)`);
          grad.addColorStop(1, `rgba(${b.rgb.rr}, ${b.rgb.g}, ${b.rgb.b}, 0.45)`);
          ctx.strokeStyle = grad;
          const mx = a.x - mouse.x, my = a.y - mouse.y;
          const proximity = prefersReduced ? 0 : Math.max(0, 1 - Math.hypot(mx, my) / (maxDist * 1.2));
          ctx.lineWidth = Math.max(1, 2.2 * (1 - d / maxDist) + 1.2 * proximity);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        });
      }

      requestAnimationFrame(animate);
    }

          function showInfoPanel(journeyId) {
            const data = journeyData[journeyId];
            if (!data) { return; }

        infoPanel.innerHTML = `
          <div class="panel-icon">${data.icon}</div>
          <h3 class="panel-title">${data.title}</h3>
          <p class="panel-desc">${data.desc}</p>
          <a href="${data.link}" class="panel-link btn btn-primary btn-lg">${data.linkText}</a>
        `;
        
        infoPanel.classList.add('visible');
    }

    nodes.forEach(node => {
      node.addEventListener('click', () => {
        const journeyId = node.id.replace('node-', '');
        nodes.forEach(n => n.classList.remove('active'));
        node.classList.add('active');
        showInfoPanel(journeyId);
      });
      // keyboard accessibility
      node.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          node.click();
        }
      });
    });

    // Hide panel when clicking on empty space
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if click is not on a node
      let clickedOnNode = false;
      nodes.forEach(node => {
        const nodeRect = node.getBoundingClientRect();
        const nodeX = nodeRect.left - rect.left;
        const nodeY = nodeRect.top - rect.top;
        const nodeWidth = nodeRect.width;
        const nodeHeight = nodeRect.height;
        
        if (x >= nodeX && x <= nodeX + nodeWidth && y >= nodeY && y <= nodeY + nodeHeight) {
          clickedOnNode = true;
        }
      });
      
      if (!clickedOnNode) {
        infoPanel.classList.remove('visible');
        nodes.forEach(n => n.classList.remove('active'));
      }
    });

          // Initial setup
          if (window.innerWidth >= 1024) {
            resizeCanvas();
            updateGridSizing();
            assignHeroSpans();
            createParticles();
            animate();
            window.addEventListener('resize', () => {
              resizeCanvas();
              updateGridSizing();
              assignHeroSpans();
              createParticles();
            });

            // Default selection
            setTimeout(() => {
              const weightNode = document.getElementById('node-weight');
              if (weightNode) {
                nodes.forEach(n => n.classList.remove('active'));
                weightNode.classList.add('active');
                showInfoPanel('weight');
              }
            }, 600);
          }
  }
});
