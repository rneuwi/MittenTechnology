(function () {
  'use strict';

  var config = window.MITTEN_CONFIG || {};
  var MIN_FILL_MS = 3000;
  var pageLoadedAt = Date.now();

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

  // ---- Contact form ----
  var form = document.getElementById('contact-form');
  if (!form) {
    return;
  }
  var statusEl = form.querySelector('.form-status');
  var submitBtn = form.querySelector('button[type="submit"]');
  var captchaEl = document.getElementById('captcha');
  var captchaWidgetId = null;
  var captchaRequested = false;

  function isPlaceholder(value) {
    return !value || /^__.+__$/.test(value);
  }

  var emailConfigured = !isPlaceholder(config.emailjsPublicKey) &&
    !isPlaceholder(config.emailjsServiceId) &&
    !isPlaceholder(config.emailjsTemplateId);
  var captchaConfigured = !isPlaceholder(config.recaptchaSiteKey);
  var contactEmail = config.contactEmail || 'hello@mittentechnologyllc.com';

  function setStatus(message, type) {
    if (!statusEl) {
      return;
    }
    statusEl.textContent = message;
    statusEl.className = 'form-status' + (type ? ' is-' + type : '');
  }

  function showMailtoFallback(reason) {
    setStatus('', '');
    var msg = document.createElement('span');
    msg.textContent = reason + ' Please email us at ';
    var link = document.createElement('a');
    link.href = 'mailto:' + contactEmail;
    link.textContent = contactEmail;
    statusEl.appendChild(msg);
    statusEl.appendChild(link);
    statusEl.appendChild(document.createTextNode('.'));
    statusEl.className = 'form-status is-error';
  }

  if (!emailConfigured || !captchaConfigured) {
    console.warn('ContactForm@init: contact form not configured, using mailto fallback', {
      emailConfigured: emailConfigured,
      captchaConfigured: captchaConfigured
    });
    submitBtn.disabled = true;
    if (captchaEl) {
      captchaEl.hidden = true;
    }
    showMailtoFallback('Our contact form is being set up.');
    return;
  }

  if (window.emailjs && typeof window.emailjs.init === 'function') {
    window.emailjs.init({ publicKey: config.emailjsPublicKey });
  } else {
    console.error('ContactForm@init: EmailJS SDK failed to load', {
      src: 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4.4.1/dist/email.min.js'
    });
  }

  // reCAPTCHA (and the cookies Google sets with it) only loads once someone starts using the form.
  window.mittenRecaptchaReady = function () {
    try {
      captchaWidgetId = window.grecaptcha.render(captchaEl, {
        sitekey: config.recaptchaSiteKey,
        theme: 'dark'
      });
    } catch (err) {
      console.error('ContactForm@recaptchaReady: render failed', {
        message: err && err.message,
        stack: err && err.stack,
        siteKeySet: !!config.recaptchaSiteKey
      });
    }
  };

  function loadRecaptcha() {
    if (captchaRequested) {
      return;
    }
    captchaRequested = true;
    var script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=mittenRecaptchaReady&render=explicit';
    script.async = true;
    script.defer = true;
    script.onerror = function () {
      console.error('ContactForm@loadRecaptcha: reCAPTCHA script failed to load', { src: script.src });
      showMailtoFallback('Sorry, the form is unavailable right now.');
    };
    document.head.appendChild(script);
  }
  form.addEventListener('focusin', loadRecaptcha);

  function setFieldError(input, hasError) {
    var errorEl = document.getElementById(input.id + '-error');
    input.setAttribute('aria-invalid', String(hasError));
    input.closest('.field').classList.toggle('has-error', hasError);
    if (errorEl) {
      errorEl.hidden = !hasError;
    }
  }

  function validate() {
    var firstInvalid = null;
    form.querySelectorAll('[required]').forEach(function (input) {
      var ok = input.checkValidity() && input.value.trim() !== '';
      setFieldError(input, !ok);
      if (!ok && !firstInvalid) {
        firstInvalid = input;
      }
    });
    if (firstInvalid) {
      firstInvalid.focus();
    }
    return !firstInvalid;
  }

  form.addEventListener('input', function (e) {
    var input = e.target;
    if (input.getAttribute('aria-invalid') === 'true' && input.checkValidity() && input.value.trim() !== '') {
      setFieldError(input, false);
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var fields = {
      name: form.from_name.value.trim(),
      email: form.reply_to.value.trim()
    };

    if (form.website.value) {
      console.warn('ContactForm@submit: honeypot tripped, submission dropped', {
        honeypotLength: form.website.value.length,
        fields: fields
      });
      // Pretend success so bots don't learn anything.
      form.reset();
      setStatus('Thanks! Your message is on its way.', 'success');
      return;
    }

    var elapsed = Date.now() - pageLoadedAt;
    if (elapsed < MIN_FILL_MS) {
      console.warn('ContactForm@submit: submitted too quickly, likely automated', {
        elapsedMs: elapsed,
        fields: fields
      });
      setStatus('Please take a moment to review your message, then try again.', 'error');
      return;
    }

    if (!validate()) {
      setStatus('Some fields need attention. Please check the messages above.', 'error');
      return;
    }

    var captchaResponse = '';
    if (window.grecaptcha && captchaWidgetId !== null) {
      captchaResponse = window.grecaptcha.getResponse(captchaWidgetId);
    }
    if (!captchaResponse) {
      setStatus('Please complete the "I\'m not a robot" check above the Send button.', 'error');
      return;
    }

    if (!window.emailjs || typeof window.emailjs.sendForm !== 'function') {
      console.error('ContactForm@submit: EmailJS SDK unavailable at submit time', { fields: fields });
      showMailtoFallback('Sorry, the form is unavailable right now.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    setStatus('Sending your message...', '');

    // sendForm picks up the g-recaptcha-response field reCAPTCHA adds to the form;
    // EmailJS verifies it server-side when reCAPTCHA is enabled on the template.
    window.emailjs.sendForm(config.emailjsServiceId, config.emailjsTemplateId, form)
      .then(function () {
        form.reset();
        setStatus('Thanks! Your message is on its way. We\'ll be in touch within one business day.', 'success');
      })
      .catch(function (err) {
        console.error('ContactForm@submit: EmailJS send failed', {
          status: err && err.status,
          text: err && (err.text || err.message),
          serviceId: config.emailjsServiceId,
          templateId: config.emailjsTemplateId,
          fields: fields
        });
        showMailtoFallback('Sorry, something went wrong sending your message.');
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
        if (window.grecaptcha && captchaWidgetId !== null) {
          window.grecaptcha.reset(captchaWidgetId);
        }
      });
  });
})();
