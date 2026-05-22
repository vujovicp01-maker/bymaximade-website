/* ===========================================================
   bymaximade — site interactions
   - Nav scroll state
   - Mobile menu toggle
   - Reveal-on-scroll
   - Contact form → mailto: bymaximade@gmail.com
   =========================================================== */

(function () {
  'use strict';

  // ----- Nav scroll state -----
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 24) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Mobile menu -----
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('hidden') === false;
    menuToggle.classList.toggle('is-open', isOpen);
  });

  // Close mobile menu when an anchor link is clicked
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuToggle.classList.remove('is-open');
    });
  });

  // ----- Reveal-on-scroll -----
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ----- Contact form → mailto -----
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const projectType = (data.get('project-type') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();

    if (!name || !email || !projectType || !message) {
      showStatus('Please fill in all fields.', false);
      return;
    }

    const subject = `New project inquiry — ${name}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Project type: ${projectType}`,
      '',
      'Brief:',
      message,
      '',
      '— Sent from bymaximade.com',
    ].join('\n');

    const mailto =
      'mailto:bymaximade@gmail.com' +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    window.location.href = mailto;

    showStatus('Opening your email client…', true);
  });

  function showStatus(text, ok) {
    status.textContent = text;
    status.classList.remove('hidden');
    status.classList.toggle('text-ink-500', ok);
    status.classList.toggle('text-white', !ok);
  }
})();
