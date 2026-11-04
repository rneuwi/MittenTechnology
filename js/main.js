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

  // ---- Copy email fallback (for visitors with no mail app set up) ----
  var copyBtn = document.querySelector('[data-copy-email]');
  var copyStatus = document.querySelector('.copy-status');

  function setCopyStatus(message) {
    if (copyStatus) {
      copyStatus.textContent = message;
    }
  }

  function copyWithSelection(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (err) {
      console.error('main.js@copyWithSelection: execCommand copy failed', { message: err && err.message, text: text });
    }
    document.body.removeChild(field);
    return ok;
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-copy-email');
      if (!email) {
        console.warn('main.js@copyEmail: copy button has no data-copy-email value', { button: copyBtn });
        return;
      }
      var copied = 'Copied! Paste it into your email app.';
      var failed = 'Copy failed. Please write to ' + email + '.';

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(function () {
          setCopyStatus(copied);
        }).catch(function (err) {
          console.error('main.js@copyEmail: clipboard.writeText failed', { message: err && err.message, email: email });
          setCopyStatus(copyWithSelection(email) ? copied : failed);
        });
        return;
      }
      setCopyStatus(copyWithSelection(email) ? copied : failed);
    });
  }

  // ---- In-page links: scroll without putting #name in the URL ----
  // The hrefs stay as #name so links still work if this script fails to load.
  function clearHash() {
    if (window.location.hash && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  function focusTarget(target) {
    if (!target.hasAttribute('tabindex') && !target.matches('a[href], button, input, select, textarea')) {
      target.setAttribute('tabindex', '-1');
    }
    target.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    var link = e.target.closest('a[href^="#"]');
    if (!link) {
      return;
    }
    var id = link.getAttribute('href').slice(1);

    if (id === '' || id === 'top') {
      e.preventDefault();
      window.scrollTo({ top: 0 });
      clearHash();
      return;
    }

    var target = document.getElementById(id);
    if (!target) {
      console.warn('main.js@inPageLink: link points to a missing element', { href: link.getAttribute('href') });
      return;
    }
    e.preventDefault();
    target.scrollIntoView();
    focusTarget(target);
    clearHash();
  });

  // Arriving from another page (e.g. index.html#contact): the browser has
  // scrolled to the section by the time the page loads, so just tidy the URL.
  window.addEventListener('load', clearHash);

  // ---- Header shadow on scroll ----
  function onScroll() {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
