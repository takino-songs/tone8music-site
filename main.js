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
    // Remove old listeners to prevent duplication if re-initialized (though header is static)
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

  // Get current path, handling root as index.html
  let currentPath = window.location.pathname.split('/').pop();
  if (!currentPath || currentPath === '') currentPath = 'index.html';

  navLinks.forEach((link) => {
    const targetPage = link.dataset.page || link.getAttribute('href');
    // Simple matching logic
    const isActive =
      targetPage === currentPath ||
      (currentPath === 'index.html' && (targetPage === './' || targetPage === '/'));

    if (isActive) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
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

    // Simple staggering for siblings
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
   SPA Router & Page Transitions
   ========================================= */

async function loadPage(url, push = true) {
  try {
    // 1. Fetch new content
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.statusText}`);
    const htmlText = await response.text();

    // 2. Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const newMainContent = doc.querySelector('main').innerHTML;
    const newTitle = doc.title;

    // 3. Animation: Exit
    const currentMain = document.querySelector('main');
    currentMain.classList.add('page-transition-exit');
    currentMain.classList.add('page-transition-exit-active');

    // Wait for exit animation
    await new Promise(resolve => setTimeout(resolve, 400));

    // 4. Update Content
    currentMain.innerHTML = newMainContent;
    document.title = newTitle;

    if (push) {
      history.pushState(null, newTitle, url);
    }

    // Scroll to top
    window.scrollTo(0, 0);

    // 5. Animation: Enter
    currentMain.classList.remove('page-transition-exit', 'page-transition-exit-active');
    currentMain.classList.add('page-transition-enter');

    // Force reflow
    void currentMain.offsetWidth;

    currentMain.classList.add('page-transition-enter-active');

    // 6. Re-initialize scripts
    highlightActivePage();
    initScrollReveal();

    // Cleanup enter classes
    setTimeout(() => {
      currentMain.classList.remove('page-transition-enter', 'page-transition-enter-active');
    }, 400);

  } catch (err) {
    console.error('SPA Navigation Error:', err);
    // Fallback to normal navigation if fetch fails
    window.location.href = url;
  }
}

function initRouter() {
  // Intercept clicks on internal links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');

    // Ignore external links, anchors, mailto, etc.
    if (!href ||
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('#') ||
      href.startsWith('mailto:')) {
      return;
    }

    // Check if it's a same-origin link just to be safe (though relative paths are fine)
    // We assume relative paths for internal navigation
    e.preventDefault();
    loadPage(href);
  });

  // Handle Back/Forward buttons
  window.addEventListener('popstate', () => {
    loadPage(window.location.pathname, false);
  });
}

/* =========================================
   Initialization
   ========================================= */

document.addEventListener('DOMContentLoaded', async () => {
  // Initial Load
  const [headerEl, footerEl] = await Promise.all([
    loadPartial('site-header', 'partials/header.html'),
    loadPartial('site-footer', 'partials/footer.html'),
  ]);

  initMenu(headerEl);
  highlightActivePage(); // Pass nothing, let it find header
  updateYear();
  initScrollReveal();

  // Start Router
  initRouter();
});
