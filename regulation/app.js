/* app.js: Hmm Ventures interactions */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================
     SCROLL REVEAL (Intersection Observer)
     ============================================ */
  function initScrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (reducedMotion) {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -20px 0px'
    });

    // Group reveals by parent for stagger
    var groups = new Map();
    reveals.forEach(function (el) {
      var parent = el.parentElement;
      if (!groups.has(parent)) {
        groups.set(parent, []);
      }
      groups.get(parent).push(el);
    });

    groups.forEach(function (children) {
      children.forEach(function (el, i) {
        if (i > 0 && children.length > 1) {
          el.style.transitionDelay = (i * 60) + 'ms';
        }
        observer.observe(el);
      });
    });
  }

  /* ============================================
     STRIKETHROUGH PROGRESSIVE DELAYS
     ============================================ */
  function initStrikethroughDelays() {
    if (reducedMotion) return;

    var strikes = document.querySelectorAll('.moat-item--strike');
    strikes.forEach(function (item, i) {
      item.style.setProperty('--strike-delay', (i * 200) + 'ms');
      // Override the animation-delay on the ::after pseudo-element via a CSS variable
      var span = item.querySelector('span');
      if (span) {
        span.style.setProperty('--strike-delay', (300 + i * 200) + 'ms');
      }
    });
  }

  /* ============================================
     NAV SCROLL STATE
     ============================================ */
  function initNav() {
    var nav = document.getElementById('site-nav');
    if (!nav) return;

    var scrollThreshold = 100;
    var ticking = false;

    function updateNav() {
      if (window.scrollY > scrollThreshold) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateNav);
        ticking = true;
      }
    }, { passive: true });

    updateNav();

    // Smooth scroll for nav links
    var links = nav.querySelectorAll('.nav-link, .nav-logo');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          var target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  /* ============================================
     HERO PARALLAX-LITE (fade tagline on scroll)
     ============================================ */
  function initHeroParallax() {
    if (reducedMotion) return;

    var tagline = document.getElementById('hero-tagline');
    if (!tagline) return;

    var ticking = false;

    function updateHeroOpacity() {
      var scrollY = window.scrollY;
      var viewportH = window.innerHeight;
      // Fade tagline from full opacity to 0 over 60% of viewport
      var progress = Math.min(scrollY / (viewportH * 0.6), 1);
      tagline.style.opacity = String(1 - progress);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateHeroOpacity);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ============================================
     SECTION HEADING OPACITY MODULATION
     ============================================ */
  function initHeadingParallax() {
    if (reducedMotion) return;

    var headings = document.querySelectorAll('.section-heading');
    if (!headings.length) return;

    var headingObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // Modulate opacity based on intersection ratio
        if (entry.isIntersecting) {
          var ratio = entry.intersectionRatio;
          // Only modulate when partially visible (not fully in view)
          entry.target.style.opacity = String(Math.max(0.3, ratio));
        }
      });
    }, {
      threshold: buildThresholdList(20)
    });

    headings.forEach(function (h) {
      headingObserver.observe(h);
    });
  }

  function buildThresholdList(numSteps) {
    var thresholds = [];
    for (var i = 0; i <= numSteps; i++) {
      thresholds.push(i / numSteps);
    }
    return thresholds;
  }

  /* ============================================
     ANIMATED NUMBER COUNTERS (golden easing)
     ============================================ */
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    if (reducedMotion) return;

    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  // Golden easing approximation: cubic-bezier(0.16, 1, 0.3, 1)
  function goldenEase(t) {
    // Attempt at matching the golden curve feel
    // fast start, gentle settle
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var duration = 800;
    var start = performance.now();

    function update(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = goldenEase(progress);
      var current = eased * target;

      if (decimals > 0) {
        el.textContent = prefix + current.toFixed(decimals) + suffix;
      } else {
        el.textContent = prefix + Math.round(current) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    el.textContent = prefix + '0' + suffix;
    requestAnimationFrame(update);
  }

  /* ============================================
     ACCORDION (Counter-Arguments)
     ============================================ */
  function initAccordion() {
    var items = document.querySelectorAll('.accordion-item');
    items.forEach(function (item) {
      var trigger = item.querySelector('.accordion-trigger');
      var body = item.querySelector('.accordion-body');
      if (!trigger || !body) return;

      trigger.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        // Close all others
        items.forEach(function (other) {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            var otherTrigger = other.querySelector('.accordion-trigger');
            var otherBody = other.querySelector('.accordion-body');
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
            if (otherBody) otherBody.style.maxHeight = '0';
          }
        });

        if (isOpen) {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
          body.style.maxHeight = '0';
        } else {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });

      // Keyboard support
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }
      });
    });
  }

  /* ============================================
     LOGO DOT ANIMATION
     ============================================ */
  function initLogoDotAnimation() {
    var heroImg = document.querySelector('.hero-logo-img');
    if (!heroImg) return;

    if (reducedMotion) return;

    fetch('./assets/hmm_logo_cream.svg')
      .then(function (r) { return r.text(); })
      .then(function (svgText) {
        var container = document.querySelector('.hero-logo');
        if (!container) return;

        var parser = new DOMParser();
        var svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        var svg = svgDoc.querySelector('svg');
        if (!svg) return;

        svg.style.width = 'clamp(200px, 40vw, 380px)';
        svg.style.height = 'auto';
        svg.setAttribute('class', 'hero-logo-svg');
        svg.setAttribute('aria-label', 'Hmm Ventures');
        svg.setAttribute('role', 'img');

        var paths = svg.querySelectorAll('path');
        var allPaths = Array.from(paths);

        allPaths.forEach(function (p, i) {
          if (i >= 3) {
            p.style.opacity = '0';
            p.style.transition = 'opacity 400ms ease-out';
          }
        });

        heroImg.style.display = 'none';
        container.insertBefore(svg, heroImg);

        svg.style.opacity = '0';
        requestAnimationFrame(function () {
          svg.style.transition = 'opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)';
          svg.style.opacity = '1';
        });

        var dotDelay = [800, 1200, 1600];
        allPaths.forEach(function (p, i) {
          if (i >= 3) {
            setTimeout(function () {
              p.style.opacity = '1';
            }, dotDelay[i - 3]);
          }
        });
      })
      .catch(function () {
        heroImg.style.opacity = '1';
      });
  }

  /* ============================================
     HASH NAVIGATION: Reveal visible content immediately
     ============================================ */
  function handleHashReveal() {
    if (window.location.hash) {
      setTimeout(function () {
        var reveals = document.querySelectorAll('.reveal:not(.is-visible)');
        reveals.forEach(function (el) {
          var rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.style.transitionDelay = '0ms';
            el.classList.add('is-visible');
          }
        });
      }, 100);
    }
  }

  /* ============================================
     LP INTEREST FORM SUBMISSION
     ============================================ */
  function initLPForm() {
    var form = document.getElementById('lp-form');
    if (!form) return;

    var btn = document.getElementById('lp-submit');
    var feedback = document.getElementById('lp-feedback');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = document.getElementById('lp-email').value.trim();
      var name = document.getElementById('lp-name').value.trim();
      var org = document.getElementById('lp-org').value.trim();
      var message = document.getElementById('lp-message').value.trim();

      if (!email) {
        showFeedback('Please enter your email address.', 'error');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Submitting...';
      feedback.textContent = '';
      feedback.className = 'lp-feedback';

      // Netlify Forms: the form is registered from the static HTML at deploy
      // time, and an AJAX submission posts the same fields, URL-encoded, to the
      // page path. The honeypot field travels with the rest.
      var fields = new URLSearchParams(new FormData(form));
      fields.set('form-name', 'lp-interest');

      fetch(form.getAttribute('action') || '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fields.toString()
      })
      .then(function (res) {
        if (res.ok) {
          showFeedback('Thank you. We will be in touch.', 'success');
          form.reset();
        } else {
          showFeedback('Something went wrong. Please try again.', 'error');
        }
      })
      .catch(function () {
        showFeedback('Network error. Please email wt@hmm.ventures directly.', 'error');
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = 'Submit interest';
      });
    });

    function showFeedback(msg, type) {
      feedback.textContent = msg;
      feedback.className = 'lp-feedback lp-feedback--' + type;
    }
  }

  /* ============================================
     MOBILE HAMBURGER MENU
     ============================================ */
  function initHamburger() {
    var btn = document.getElementById('nav-hamburger');
    var links = document.getElementById('nav-links');
    if (!btn || !links) return;

    btn.addEventListener('click', function () {
      var isOpen = links.classList.contains('is-open');
      links.classList.toggle('is-open');
      btn.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close on nav link click
    links.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('is-open');
        btn.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!btn.contains(e.target) && !links.contains(e.target)) {
        links.classList.remove('is-open');
        btn.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ============================================
     INIT
     ============================================ */
  function init() {
    initScrollReveal();
    initStrikethroughDelays();
    initNav();
    initHamburger();
    initHeroParallax();
    initHeadingParallax();
    initCounters();
    initAccordion();
    initLogoDotAnimation();
    initLPForm();
    handleHashReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
