/* ==========================================================================
   MediConsult — script.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------------
     Loading screen
  --------------------------------------------------------------------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader && loader.classList.add('is-hidden'), 300);
  });
  // Fallback in case 'load' already fired
  if (document.readyState === 'complete') {
    setTimeout(() => loader && loader.classList.add('is-hidden'), 300);
  }

  /* ---------------------------------------------------------------------
     Footer year
  --------------------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Sticky navbar + scroll progress + back-to-top (single scroll listener)
  --------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');

  function onScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    navbar.classList.toggle('is-scrolled', scrollY > 20);
    if (scrollProgress) scrollProgress.style.width = progress + '%';
    if (backToTop) backToTop.classList.toggle('is-visible', scrollY > 500);

    // Active nav link highlighting
    let currentId = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 130;
      if (scrollY >= top) currentId = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle('active-link', link.getAttribute('href') === '#' + currentId);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop && backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------------------------------------------------------------------
     Mobile hamburger menu
  --------------------------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const primaryNav = document.getElementById('primaryNav');

  function closeMenu() {
    hamburger.classList.remove('is-active');
    primaryNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
  }

  hamburger && hamburger.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('is-open');
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  /* ---------------------------------------------------------------------
     Dark mode toggle
  --------------------------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

  themeToggle && themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    themeToggle.setAttribute('aria-pressed', String(isDark));
    if (themeIcon) {
      themeIcon.classList.toggle('fa-moon', !isDark);
      themeIcon.classList.toggle('fa-sun', isDark);
    }
  });

  /* ---------------------------------------------------------------------
     Intersection Observer: scroll-reveal animations
  --------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------------------------------------------------------------------
     Animated counters (stats in hero)
  --------------------------------------------------------------------- */
  const counters = document.querySelectorAll('.stat__number');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.floor(eased * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString() + suffix;
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((counter) => counterObserver.observe(counter));

  /* ---------------------------------------------------------------------
     FAQ accordion
  --------------------------------------------------------------------- */
  const accordionItems = document.querySelectorAll('.accordion__item');

  accordionItems.forEach((item) => {
    const trigger = item.querySelector('.accordion__trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      accordionItems.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.accordion__trigger').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------------------------------------------------------------------
     Testimonial slider (auto + manual)
  --------------------------------------------------------------------- */
  const track = document.getElementById('testimonialTrack');
  if (track) {
    const slides = Array.from(track.querySelectorAll('.testimonial-slide'));
    const dotsWrap = document.getElementById('testimonialDots');
    const prevBtn = document.getElementById('testimonialPrev');
    const nextBtn = document.getElementById('testimonialNext');
    let current = 0;
    let autoTimer;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function render() {
      slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      render();
      resetAuto();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(next, 6000);
    }

    nextBtn && nextBtn.addEventListener('click', next);
    prevBtn && prevBtn.addEventListener('click', prev);

    render();
    resetAuto();
  }

  /* ---------------------------------------------------------------------
     Contact form (front-end only demo submission)
  --------------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  contactForm && contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!contactForm.checkValidity()) {
      formStatus.textContent = 'Please fill in all required fields.';
      formStatus.style.color = '#DC2626';
      return;
    }
    formStatus.style.color = '';
    formStatus.textContent = 'Thanks — your message has been sent. We\'ll get back to you shortly.';
    contactForm.reset();
  });

  /* ---------------------------------------------------------------------
     Newsletter form (front-end only demo submission)
  --------------------------------------------------------------------- */
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm && newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('newsletterEmail');
    const btn = newsletterForm.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = 'Subscribed!';
    input.value = '';
    setTimeout(() => { btn.textContent = originalText; }, 2500);
  });

  /* ---------------------------------------------------------------------
     Lazy loading fallback for browsers without native support
  --------------------------------------------------------------------- */
  if (!('loading' in HTMLImageElement.prototype)) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imgObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.src; // trigger load
          obs.unobserve(img);
        }
      });
    });
    lazyImages.forEach((img) => imgObserver.observe(img));
  }

});