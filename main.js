/* =========================================
   Common Functions
   ========================================= */

async function loadPartial(elementId, file) {
  const container = document.getElementById(elementId);
  if (!container) return null;
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(response.statusText);
    container.innerHTML = await response.text();
    return container;
  } catch (err) {
    console.error(`Failed to load ${file}:`, err);
    return null;
  }
}

function initMenu(headerEl) {
  if (!headerEl) return;
  const menuToggle = headerEl.querySelector('.menu-toggle');
  const navLinks = headerEl.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    const newMenuToggle = menuToggle.cloneNode(true);
    menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);

    newMenuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }
}

function highlightActivePage() {
  const headerEl = document.getElementById('site-header');
  if (!headerEl) return;
  const navLinks = headerEl.querySelectorAll('.nav-links a');

  let currentPath = window.location.pathname.split('/').pop();
  if (!currentPath || currentPath === '') currentPath = 'index.html';

  navLinks.forEach((link) => {
    const targetPage = link.dataset.page || link.getAttribute('href');
    const isActive =
      targetPage === currentPath ||
      (currentPath === 'index.html' && (targetPage === './' || targetPage === '/'));

    if (isActive) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Also highlight bottom nav items
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
  bottomNavItems.forEach((item) => {
    const targetPage = item.dataset.page || item.getAttribute('href');
    const isActive =
      targetPage === currentPath ||
      (currentPath === 'index.html' && (targetPage === './' || targetPage === '/'));

    if (isActive) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function updateYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* =========================================
   Scroll-based Header Hide/Show (Mobile)
   ========================================= */
function initScrollHeader() {
  const header = document.querySelector('header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    // Only apply on mobile
    if (window.innerWidth > 768) {
      header.style.transform = '';
      return;
    }

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down - hide header
      header.style.transform = 'translateY(-100%)';
    } else {
      // Scrolling up - show header
      header.style.transform = 'translateY(0)';
    }

    lastScrollY = currentScrollY;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });

  // Add transition for smooth animation
  header.style.transition = 'transform 0.3s ease';
}

/* =========================================
   Scroll Animation (Intersection Observer)
   ========================================= */
function initScrollReveal() {
  const targets = document.querySelectorAll('section, h1, h2, p, .card, .btn-row, .flow-step, .faq-item, .contact-form, .contact-info, .text-content');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  targets.forEach((target) => {
    target.classList.add('reveal');

    const parent = target.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(c => c.classList.contains('reveal'));
      const siblingIndex = siblings.indexOf(target);
      if (siblingIndex > 0) {
        target.style.transitionDelay = `${siblingIndex * 0.1}s`;
      }
    }

    observer.observe(target);
  });
}

/* =========================================
   Interactive Spotlight
   ========================================= */
function initSpotlight() {
  const cards = document.querySelectorAll('.card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* =========================================
   Luxury Initial Loader
   ========================================= */
function initLoader() {
  const loader = document.createElement('div');
  loader.classList.add('site-loader');
  loader.innerHTML = '<div class="loader-content">Tone8Music</div>';
  document.body.appendChild(loader);

  window.addEventListener('load', () => {
    // Wait for the focus animation briefly before fading out
    setTimeout(() => {
      loader.classList.add('loaded');
      // Remove after transition completes
      setTimeout(() => {
        loader.remove();
      }, 600);
    }, 500);
  });

  // Fallback for slow connections
  setTimeout(() => {
    if (!loader.classList.contains('loaded')) {
      loader.classList.add('loaded');
      setTimeout(() => loader.remove(), 1200);
    }
  }, 4000);
}

/* =========================================
   Ambient Particles
   ========================================= */
function initParticles() {
  const particleCount = 30;
  const body = document.body;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    const size = Math.random() * 3 + 1;
    const left = Math.random() * 100;
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * -30;
    const opacity = Math.random() * 0.5 + 0.4; // High opacity
    const drift = (Math.random() - 0.5) * 200;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}vw`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.setProperty('--particle-opacity', opacity);
    particle.style.setProperty('--particle-drift', `${drift}px`);

    body.appendChild(particle);
  }
}

/* =========================================
   SPA Router & Page Transitions
   ========================================= */

// Function to unregister all service workers (Fixes remnants from other projects)
function unregisterServiceWorkers() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
        console.log('[SW] Unregistered old service worker:', registration);
      }
    });
  }
}

async function loadPage(url, push = true) {
  try {
    // Ensure URL has .html for static compatibility unless it's the root
    let fetchUrl = url;
    let displayUrl = url;

    if (url === '/' || url === '') {
      fetchUrl = 'index.html';
      displayUrl = 'index.html'; // Keep extension for reload safety
    } else if (!url.endsWith('.html')) {
      fetchUrl = url.split('?')[0].split('#')[0] + '.html';
      displayUrl = fetchUrl;
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      // If .html fetch fails, try exact URL
      const secondaryResponse = await fetch(url);
      if (!secondaryResponse.ok) throw new Error(`Failed to load ${url}`);
      return;
    }
    const htmlText = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const newMain = doc.querySelector('main');
    if (!newMain) {
      window.location.href = url;
      return;
    }
    const newMainContent = newMain.innerHTML;
    const newTitle = doc.title;

    const currentMain = document.querySelector('main');
    currentMain.classList.add('page-transition-exit');
    currentMain.classList.add('page-transition-exit-active');

    await new Promise(resolve => setTimeout(resolve, 400));

    currentMain.innerHTML = newMainContent;
    document.title = newTitle;

    if (push) {
      history.pushState(null, newTitle, displayUrl);
    }

    window.scrollTo(0, 0);

    currentMain.classList.remove('page-transition-exit', 'page-transition-exit-active');
    currentMain.classList.add('page-transition-enter');

    void currentMain.offsetWidth;

    currentMain.classList.add('page-transition-enter-active');

    highlightActivePage();
    initScrollReveal();
    initSpotlight();

    if (window.i18n) {
      window.i18n.updateContent();
    }

    setTimeout(() => {
      currentMain.classList.remove('page-transition-enter', 'page-transition-enter-active');
    }, 400);

  } catch (err) {
    console.error('SPA Navigation Error:', err);
    if (push) window.location.href = url;
  }
}

function initRouter() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    let href = link.getAttribute('href');

    if (!href ||
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('#') ||
      href.startsWith('mailto:')) {
      return;
    }

    e.preventDefault();
    loadPage(href);
  });

  window.addEventListener('popstate', () => {
    loadPage(window.location.pathname, false);
  });
}

/* =========================================
   Initialization
   ========================================= */

document.addEventListener('DOMContentLoaded', async () => {
  unregisterServiceWorkers();

  const [headerEl, footerEl] = await Promise.all([
    loadPartial('site-header', 'partials/header.html'),
    loadPartial('site-footer', 'partials/footer.html'),
  ]);

  initMenu(headerEl);
  highlightActivePage();
  updateYear();
  initLoader();
  initScrollReveal();
  initSpotlight();
  initParticles();
  initScrollHeader();

  // Initialize i18n
  if (window.i18n) {
    window.i18n.init();
  }

  initRouter();
});
