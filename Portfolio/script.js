/* ============================================================
   PORTFOLIO — script.js
   Pradyum Meshram | Premium dark portfolio
   ============================================================ */

'use strict';

/* ============================================================
   1. CURSOR GLOW
   ============================================================ */
(function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let mouseX = 0, mouseY = 0;
  let glowX  = 0, glowY  = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    requestAnimationFrame(animateCursor);
  }

  animateCursor();
})();

/* ============================================================
   2. STAR CANVAS (particles & twinkling stars)
   ============================================================ */
(function initStarCanvas() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars, particles;
  const STAR_COUNT      = 160;
  const PARTICLE_COUNT  = 40;

  /** Resize canvas to window */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /** Create star data */
  function createStars() {
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x:       Math.random() * W,
      y:       Math.random() * H,
      r:       Math.random() * 1.2 + 0.2,
      alpha:   Math.random(),
      dAlpha:  (Math.random() * 0.006 + 0.001) * (Math.random() < .5 ? 1 : -1),
    }));
  }

  /** Create floating particle data */
  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r:  Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }));
  }

  function drawStars() {
    stars.forEach((s) => {
      s.alpha += s.dAlpha;
      if (s.alpha >= 1 || s.alpha <= 0) s.dAlpha *= -1;
      s.alpha = Math.max(0, Math.min(1, s.alpha));

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.alpha * 0.7})`;
      ctx.fill();
    });
  }

  function drawParticles() {
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(124,92,255,${p.alpha})`;
      ctx.fill();
    });
  }

  let rafId;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawStars();
    drawParticles();
    rafId = requestAnimationFrame(loop);
  }

  // Init
  resize();
  createStars();
  createParticles();
  loop();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(rafId);
      resize();
      createStars();
      createParticles();
      loop();
    }, 150);
  });
})();

/* ============================================================
   3. NAVBAR — scroll state + active section tracking
   ============================================================ */
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const links   = document.querySelectorAll('.nav-link[data-section]');
  const sections = document.querySelectorAll('section[id]');

  // Scroll class
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Active section via IntersectionObserver
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach((l) => {
            l.classList.toggle('active', l.dataset.section === id);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((s) => obs.observe(s));
})();

/* ============================================================
   4. HAMBURGER MENU
   ============================================================ */
(function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  // Close on link click
  links.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ============================================================
   5. TYPING ANIMATION
   ============================================================ */
(function initTyping() {
  const el = document.getElementById('typingText');
  if (!el) return;

  const phrases = [
    'Software Engineer',
    'Full Stack Developer',
    'MERN Developer',
    'Problem Solver',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let isDeleting = false;
  let timer;

  const SPEED_TYPE   = 80;
  const SPEED_DELETE = 45;
  const PAUSE_END    = 1800;
  const PAUSE_START  = 400;

  function tick() {
    const current = phrases[phraseIdx];

    if (!isDeleting) {
      charIdx++;
      el.textContent = current.slice(0, charIdx);

      if (charIdx === current.length) {
        isDeleting = true;
        timer = setTimeout(tick, PAUSE_END);
        return;
      }
    } else {
      charIdx--;
      el.textContent = current.slice(0, charIdx);

      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        timer = setTimeout(tick, PAUSE_START);
        return;
      }
    }

    timer = setTimeout(tick, isDeleting ? SPEED_DELETE : SPEED_TYPE);
  }

  tick();
})();

/* ============================================================
   6. SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-up');

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Use existing CSS transition-delay if set, otherwise stagger
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  elements.forEach((el) => obs.observe(el));

  // Trigger hero elements immediately
  document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 100 + i * 120);
  });
})();

/* ============================================================
   7. BACK TO TOP
   ============================================================ */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   8. PROGRESS BARS — animate when in view
   ============================================================ */
(function initProgressBars() {
  const bars = document.querySelectorAll('.progress-bar');
  if (!bars.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Re-trigger the CSS animation
          const bar = entry.target;
          bar.style.animation = 'none';
          void bar.offsetWidth; // reflow
          bar.style.animation = '';
          obs.unobserve(bar);
        }
      });
    },
    { threshold: 0.5 }
  );

  bars.forEach((b) => obs.observe(b));
})();

/* ============================================================
   9. PROJECT MODALS
   ============================================================ */

/** Project data store */
const PROJECTS = {
  'college-os': {
    emoji:       '🎓',
    tag:         'Full Stack · Featured Project',
    title:       'College OS',
    desc:        'A comprehensive campus management platform engineered with role-based access for Students, Faculty, and Administrators. Designed to digitize and streamline every touchpoint of the academic lifecycle — from enrollment to results.',
    features: [
      'Multi-role authentication system with secure session handling',
      'Student portal: attendance, results, timetable, fee management',
      'Faculty portal: mark attendance, upload results, manage courses',
      'Admin panel: user management, notices, department controls',
      'Real-time notification and announcement system',
      'Responsive design that works on any device',
    ],
    arch:
      'Frontend  →  Vanilla HTML / CSS / JS\n' +
      'Backend   →  Node.js + Express.js\n' +
      'Database  →  MongoDB (Mongoose ODM)\n' +
      'Auth      →  JWT + bcrypt\n' +
      'Hosting   →  Render / Vercel',
    stack: ['HTML5', 'CSS3', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'JWT'],
    demoUrl: '#',
    githubUrl: '#',
  },
  'leave-mgmt': {
    emoji:       '📅',
    tag:         'Full Stack · HR System',
    title:       'Employee Leave Management',
    desc:        'A full-featured HR system for managing employee leave requests, approvals, rejections, and attendance records. Built for small-to-medium businesses that need a clean, fast internal tool.',
    features: [
      'Employee self-service: apply, track, and cancel leave requests',
      'Manager approval workflow with email notification hooks',
      'Leave balance tracking and history per employee',
      'Admin dashboard with department-level analytics',
      'Holiday calendar integration',
      'Export reports to PDF / CSV',
    ],
    arch:
      'Frontend  →  React (Hooks + Context API)\n' +
      'Backend   →  Node.js + Express.js\n' +
      'Database  →  MySQL (Sequelize ORM)\n' +
      'Auth      →  JWT + Role-based guards\n' +
      'Hosting   →  Railway + Vercel',
    stack: ['React', 'Node.js', 'Express.js', 'MySQL', 'Sequelize', 'JWT'],
    demoUrl: '#',
    githubUrl: '#',
  },
  'portfolio': {
    emoji:       '💼',
    tag:         'Frontend · No Frameworks',
    title:       'Portfolio Website',
    desc:        'This exact site — built entirely with vanilla HTML5, CSS3, and ES6 JavaScript. No frameworks, no build tools, no dependencies. Every animation, modal, canvas effect, and interaction is hand-crafted.',
    features: [
      'Animated star canvas using requestAnimationFrame',
      'Smooth typing animation with configurable phrase list',
      'IntersectionObserver-powered scroll reveal',
      'Cursor glow effect with lerp-smoothed tracking',
      'Fullscreen project modals with spring transitions',
      'Mobile-first responsive layout with hamburger nav',
      'Keyboard navigation and full ARIA accessibility',
    ],
    arch:
      'HTML5     →  Semantic structure + ARIA\n' +
      'CSS3      →  Custom properties, glassmorphism, animations\n' +
      'JS (ES6)  →  Vanilla, modular IIFE functions\n' +
      'No npm    →  Zero dependencies\n' +
      'Hosting   →  GitHub Pages / Netlify',
    stack: ['HTML5', 'CSS3', 'Vanilla JavaScript', 'Google Fonts'],
    demoUrl: '#',
    githubUrl: '#',
  },
  'weather': {
    emoji:       '🌦️',
    tag:         'Frontend · API Integration',
    title:       'Weather Application',
    desc:        'A real-time weather application that fetches live data from the OpenWeatherMap API. Features animated weather states, geolocation support, a 5-day forecast, and a clean, responsive interface.',
    features: [
      'Real-time weather data via OpenWeatherMap API',
      'Geolocation-based automatic weather detection',
      'Animated weather condition icons and backgrounds',
      '5-day hourly forecast with temperature trends',
      'City search with auto-suggest',
      'Wind speed, humidity, UV index, and feels-like data',
    ],
    arch:
      'Frontend  →  HTML5 + CSS3 + JavaScript\n' +
      'API       →  OpenWeatherMap REST API\n' +
      'Location  →  Geolocation Web API\n' +
      'Icons     →  Custom SVG weather icons\n' +
      'Hosting   →  GitHub Pages',
    stack: ['HTML5', 'CSS3', 'JavaScript', 'OpenWeatherMap API', 'Geolocation API'],
    demoUrl: '#',
    githubUrl: '#',
  },
};

/** Open modal */
function openModal(projectKey) {
  const data    = PROJECTS[projectKey];
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  if (!data || !overlay || !content) return;

  // Build modal HTML
  const featuresHTML = data.features
    .map((f) => `<li>${f}</li>`)
    .join('');

  const stackHTML = data.stack
    .map((s) => `<span class="stack-tag">${s}</span>`)
    .join('');

  content.innerHTML = `
    <span class="modal-emoji">${data.emoji}</span>
    <span class="modal-tag">${data.tag}</span>
    <h2>${data.title}</h2>
    <p class="modal-desc">${data.desc}</p>

    <p class="modal-section-title">Key Features</p>
    <ul class="modal-features">${featuresHTML}</ul>

    <p class="modal-section-title">Architecture</p>
    <pre class="modal-arch">${data.arch}</pre>

    <p class="modal-section-title">Tech Stack</p>
    <div class="modal-stack">${stackHTML}</div>

    <div class="modal-actions">
      <a href="${data.demoUrl}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Live Demo
      </a>
      <a href="${data.githubUrl}" class="btn btn-ghost" target="_blank" rel="noopener noreferrer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
        View on GitHub
      </a>
    </div>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  overlay.focus();

  // Trap focus inside modal
  trapFocus(overlay);
}

/** Close modal */
function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

/** Focus trap utility */
function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'a[href], button, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  container.addEventListener('keydown', handler);
  if (first) first.focus();
}

// Wire modal close
(function initModal() {
  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalClose');
  if (!overlay) return;

  closeBtn && closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });
})();

// Expose globally for inline onclick attributes
window.openModal = openModal;
window.closeModal = closeModal;

/* ============================================================
   10. SMOOTH PARALLAX — hero blobs on scroll
   ============================================================ */
(function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const blobPurple = document.querySelector('.blob-purple');
  const blobPink   = document.querySelector('.blob-pink');
  const blobOrange = document.querySelector('.blob-orange');

  let scrollY = 0;
  let ticking = false;

  function updateParallax() {
    if (blobPurple) blobPurple.style.transform = `translate(0, ${scrollY * 0.12}px) scale(1)`;
    if (blobPink)   blobPink.style.transform   = `translate(0, ${scrollY * -0.08}px) scale(1)`;
    if (blobOrange) blobOrange.style.transform  = `translate(0, ${scrollY * 0.06}px) scale(1)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
})();

/* ============================================================
   11. SKILL PILL — cursor-tracked glow on hover
   ============================================================ */
(function initSkillPillGlow() {
  document.querySelectorAll('.skill-pill').forEach((pill) => {
    pill.addEventListener('mousemove', (e) => {
      const rect = pill.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pill.style.setProperty('--mx', x + 'px');
      pill.style.setProperty('--my', y + 'px');
    });
  });
})();

/* ============================================================
   12. PAGE FADE IN on load
   ============================================================ */
(function initPageFade() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .5s ease';
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });
})();