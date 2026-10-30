(function () {
  'use strict';

  // ---- Footer year ----
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // ---- Mobile nav ----
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.getElementById('nav-links');
  var header = document.querySelector('.site-header');

  function setNavOpen(open) {
    if (!toggle || !header) {
      return;
    }
    toggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('nav-open', open);
  }

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      setNavOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        setNavOpen(false);
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNavOpen(false);
        toggle.focus();
      }
    });
  }

  // ---- Header shadow on scroll ----
  function onScroll() {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
