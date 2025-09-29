/**
 * Hero Interactive Particle System
 * Mind-blowing particle animation that responds to mouse movement
 * Creates floating health-themed particles that follow the cursor
 */

(() => {
  const hero = document.querySelector('.hero-pro');
  if (!hero) return;

  // Create canvas for particles
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Style the canvas
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1';
  canvas.style.opacity = '0.6';
  
  hero.appendChild(canvas);

  // Particle system configuration
  const config = {
    particleCount: 50,
    connectionDistance: 150,
    mouseInfluence: 100,
    colors: ['#006D77', '#E29578', '#83C5BE', '#FFDDD2'],
    healthIcons: ['💊', '🧬', '❤️', '🫁', '🧠', '⚡']
  };

  let particles = [];
  let mouse = { x: 0, y: 0 };
  let animationId;

  // Resize canvas
  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  // Particle class
  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 1;
      this.vy = (Math.random() - 0.5) * 1;
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.baseX = this.x;
      this.baseY = this.y;
      this.size = Math.random() * 3 + 1;
      this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
      this.alpha = Math.random() * 0.5 + 0.3;
      this.pulse = Math.random() * Math.PI * 2;
      this.isHealthIcon = Math.random() < 0.15; // 15% chance for health icon
      this.healthIcon = config.healthIcons[Math.floor(Math.random() * config.healthIcons.length)];
    }

    update() {
      // Mouse interaction
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < config.mouseInfluence) {
        const force = (config.mouseInfluence - distance) / config.mouseInfluence;
        const angle = Math.atan2(dy, dx);
        this.vx += Math.cos(angle) * force * 0.5;
        this.vy += Math.sin(angle) * force * 0.5;
      }

      // Return to base position
      this.vx += (this.baseX - this.x) * 0.01;
      this.vy += (this.baseY - this.y) * 0.01;

      // Apply velocity with damping
      this.vx *= 0.95;
      this.vy *= 0.95;

      this.x += this.vx;
      this.y += this.vy;

      // Pulsing effect
      this.pulse += 0.02;
      this.currentSize = this.size + Math.sin(this.pulse) * 0.5;

      // Boundary check
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;

      if (this.isHealthIcon) {
        // Draw health icon
        ctx.font = `${this.currentSize * 8}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.healthIcon, this.x, this.y);
      } else {
        // Draw particle
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.currentSize * 2
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  }

  // Initialize particles
  function initParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle());
    }
  }

  // Draw connections between nearby particles
  function drawConnections() {
    ctx.strokeStyle = 'rgba(0, 109, 119, 0.1)';
    ctx.lineWidth = 1;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.connectionDistance) {
          const opacity = (config.connectionDistance - distance) / config.connectionDistance * 0.2;
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    // Draw connections
    drawConnections();

    animationId = requestAnimationFrame(animate);
  }

  // Event listeners
  function handleMouseMove(e) {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }

  function handleResize() {
    resizeCanvas();
    initParticles();
  }

  // Intersection Observer for performance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!animationId) animate();
      } else {
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      }
    });
  });

  // Initialize
  window.addEventListener('resize', handleResize);
  hero.addEventListener('mousemove', handleMouseMove);
  observer.observe(hero);

  resizeCanvas();
  initParticles();
  animate();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (animationId) cancelAnimationFrame(animationId);
    observer.disconnect();
  });

  // Reduce particles on mobile for performance
  if (window.innerWidth < 768) {
    config.particleCount = 25;
    config.connectionDistance = 100;
    initParticles();
  }
})();
