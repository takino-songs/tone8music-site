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
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }
}

function highlightActivePage(headerEl) {
  if (!headerEl) return;
  const navLinks = headerEl.querySelectorAll('.nav-links a');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach((link) => {
    const targetPage = link.dataset.page || link.getAttribute('href');
    const isActive =
      targetPage === currentPath ||
      (currentPath === 'index.html' && (targetPage === 'index.html' || targetPage === './'));

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

document.addEventListener('DOMContentLoaded', async () => {
  const [headerEl, footerEl] = await Promise.all([
    loadPartial('site-header', 'partials/header.html'),
    loadPartial('site-footer', 'partials/footer.html'),
  ]);

  initMenu(headerEl);
  highlightActivePage(headerEl);
  updateYear(footerEl);
});
