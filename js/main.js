/* ============================================
   SURGEON TEMPLATE V2 — MAIN JAVASCRIPT
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
  initStickyHeader();
  initScrollAnimations();
  initCounters();
  initTestimonialCarousel();
  initBeforeAfterSliders();
  initQuizModal();
  initGalleryFilter();
  initLightbox();
  initFaqAccordion();
  initBackToTop();
  initSmoothScroll();
  initCurrentYear();
  initFormValidation();
  initParallaxScroll();
  initStaggeredChildren();
  initImageReveal();
  initVideoLoop();
});

/* Video Loop — JS-based to prevent Safari scroll-to-top on native loop */
function initVideoLoop() {
  document.querySelectorAll('#hero-video, .js-loop-video').forEach(function(v) {
    v.removeAttribute('loop');
    v.addEventListener('ended', function() {
      v.currentTime = 0;
      v.play();
    });
  });
}

/* Mobile Menu */
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const menu = document.querySelector('.nav-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('active');
    btn.classList.toggle('active');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('active');
      btn.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  menu.querySelectorAll('.has-dropdown > a').forEach(a => {
    a.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        a.parentElement.classList.toggle('active');
      }
    });
  });
}

/* Sticky Header */
function initStickyHeader() {
  const header = document.querySelector('.header');
  const topBar = document.querySelector('.top-bar');
  if (!header) return;
  const onScroll = () => {
    const scrolled = window.scrollY > 100;
    header.classList.toggle('scrolled', scrolled);
    if (topBar) topBar.classList.toggle('hidden', scrolled);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* Scroll Animations */
function initScrollAnimations() {
  const els = document.querySelectorAll('[data-animate]');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('animated', 'animate-' + (entry.target.dataset.animate || 'fade-in-up'));
        }, delay * 100);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

/* Animated Counters */
function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;
  const ease = t => 1 - Math.pow(1 - t, 4); // easeOutQuart
  const animate = (el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = target % 1 !== 0 ? 1 : 0;
    const duration = 2000;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const value = ease(progress) * target;
      el.textContent = prefix + value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-target]').forEach(animate);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  const bar = document.querySelector('.stats-bar');
  if (bar) obs.observe(bar);
}

/* Testimonial Carousel */
function initTestimonialCarousel() {
  const track = document.querySelector('.testimonials-track');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const progressBar = document.querySelector('.testimonial-progress-bar');
  if (!track) return;
  const cards = track.querySelectorAll('.testimonial-card');
  let current = 0, total = cards.length, autoplay, paused = false;
  const getVisible = () => window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  const updateProgress = () => {
    if (!progressBar) return;
    const max = Math.max(1, total - getVisible());
    const pct = ((current + 1) / (max + 1)) * 100;
    progressBar.style.width = pct + '%';
  };
  const goTo = (i) => {
    const max = Math.max(0, total - getVisible());
    current = Math.max(0, Math.min(i, max));
    const card = cards[0];
    if (!card) return;
    const gap = parseInt(getComputedStyle(track).gap) || 24;
    const w = card.offsetWidth + gap;
    track.style.transform = `translateX(-${current * w}px)`;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    updateProgress();
  };
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
  const startAuto = () => { autoplay = setInterval(() => { goTo(current >= Math.max(0, total - getVisible()) ? 0 : current + 1); }, 5000); };
  const stopAuto = () => clearInterval(autoplay);
  track.closest('.testimonials')?.addEventListener('mouseenter', stopAuto);
  track.closest('.testimonials')?.addEventListener('mouseleave', () => { if (!paused) startAuto(); });
  startAuto();
  updateProgress();
  // Touch support
  let startX = 0, diff = 0;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stopAuto(); }, { passive: true });
  track.addEventListener('touchmove', (e) => { diff = startX - e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', () => { if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1); diff = 0; startAuto(); });
  window.addEventListener('resize', () => goTo(current));
}

/* Before/After Sliders */
function initBeforeAfterSliders() {
  document.querySelectorAll('.ba-slider').forEach(slider => {
    const afterWrap = slider.querySelector('.ba-after');
    const handle = slider.querySelector('.ba-handle');
    if (!afterWrap || !handle) return;
    let dragging = false;
    const setPos = (x) => {
      const rect = slider.getBoundingClientRect();
      let pct = ((x - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      afterWrap.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = pct + '%';
    };
    setPos(slider.getBoundingClientRect().left + slider.getBoundingClientRect().width / 2);
    slider.addEventListener('mousedown', (e) => { dragging = true; setPos(e.clientX); e.preventDefault(); });
    window.addEventListener('mousemove', (e) => { if (dragging) setPos(e.clientX); });
    window.addEventListener('mouseup', () => { dragging = false; });
    slider.addEventListener('touchstart', (e) => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchmove', (e) => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchend', () => { dragging = false; });
  });
}

/* Procedure Quiz */
function initQuizModal() {
  const modal = document.querySelector('.quiz-modal');
  const openBtns = document.querySelectorAll('[data-open-quiz]');
  const closeBtn = modal?.querySelector('.quiz-close');
  const overlay = modal?.querySelector('.quiz-modal-overlay');
  if (!modal) return;
  const questions = [
    { q: "What area would you most like to improve?", opts: [
      { text: "Breasts", icon: "fa-heart", tags: ["breast"] },
      { text: "Stomach & Body", icon: "fa-spa", tags: ["body"] },
      { text: "Face & Neck", icon: "fa-user", tags: ["face"] },
      { text: "Multiple Areas", icon: "fa-star", tags: ["combo"] }
    ]},
    { q: "What's your primary concern?", opts: [
      { text: "Size or volume", tags: ["augmentation"] },
      { text: "Sagging or drooping", tags: ["lift"] },
      { text: "Excess skin or fat", tags: ["contouring"] },
      { text: "Signs of aging", tags: ["rejuvenation"] },
      { text: "Post-pregnancy changes", tags: ["mommy"] }
    ]},
    { q: "Have you had children?", opts: [
      { text: "Yes, and I'm done having kids", tags: ["mommy-candidate"] },
      { text: "Yes, but may have more", tags: ["wait"] },
      { text: "No", tags: ["no-children"] }
    ]}
  ];
  let step = 0, answers = [];
  const progBar = modal.querySelector('.quiz-progress-bar');
  const qText = modal.querySelector('.quiz-question-text');
  const optsDiv = modal.querySelector('.quiz-options');
  const resultDiv = modal.querySelector('.quiz-result');
  const open = () => { modal.classList.add('active'); document.body.style.overflow = 'hidden'; step = 0; answers = []; showStep(); };
  const close = () => { modal.classList.remove('active'); document.body.style.overflow = ''; };
  openBtns.forEach(b => b.addEventListener('click', open));
  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  const showStep = () => {
    if (step >= questions.length) return showResult();
    if (resultDiv) resultDiv.style.display = 'none';
    if (optsDiv) optsDiv.style.display = 'flex';
    if (qText) qText.style.display = 'block';
    if (progBar) progBar.style.width = ((step + 1) / questions.length * 100) + '%';
    const q = questions[step];
    if (qText) qText.textContent = q.q;
    if (optsDiv) optsDiv.innerHTML = q.opts.map((o, i) =>
      `<button class="quiz-option" data-idx="${i}">${o.icon ? `<i class="fas ${o.icon}"></i>` : ''} ${o.text}</button>`
    ).join('');
    optsDiv?.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        answers.push(...q.opts[idx].tags);
        step++;
        showStep();
      });
    });
  };
  const showResult = () => {
    if (qText) qText.style.display = 'none';
    if (optsDiv) optsDiv.style.display = 'none';
    if (progBar) progBar.style.width = '100%';
    if (!resultDiv) return;
    resultDiv.style.display = 'block';
    const recs = [];
    if (answers.includes('mommy') || answers.includes('mommy-candidate') || answers.includes('combo'))
      recs.push({ name: 'Mommy Makeover', link: 'services/mommy-makeover.html' });
    if (answers.includes('breast') || answers.includes('augmentation'))
      recs.push({ name: 'Breast Augmentation', link: 'services/breast-augmentation.html' });
    if (answers.includes('breast') && answers.includes('lift'))
      recs.push({ name: 'Breast Lift', link: 'services/breast-lift.html' });
    if (answers.includes('body') || answers.includes('contouring'))
      recs.push({ name: 'Tummy Tuck', link: 'services/tummy-tuck.html' });
    if (answers.includes('face') || answers.includes('rejuvenation'))
      recs.push({ name: 'Facelift', link: 'services/facelift.html' });
    if (!recs.length) recs.push({ name: 'Schedule a Consultation', link: 'contact.html' });
    resultDiv.innerHTML = `<h3>We Recommend</h3><div class="quiz-result-procedures">${recs.map(r =>
      `<a href="${r.link}" class="quiz-result-item"><i class="fas fa-check-circle"></i> <span>${r.name}</span></a>`
    ).join('')}</div><a href="contact.html" class="btn btn-primary">Book Your Consultation</a>`;
  };
}

/* Gallery Filter */
function initGalleryFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item[data-category]');
  if (!btns.length) return;
  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    items.forEach(item => {
      const match = cat === 'all' || item.dataset.category === cat;
      item.style.display = match ? '' : 'none';
    });
  }));
}

/* Lightbox */
function initLightbox() {
  const lb = document.querySelector('.lightbox');
  if (!lb) return;
  const img = lb.querySelector('img');
  const closeBtn = lb.querySelector('.lightbox-close');
  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', () => {
      if (img) img.src = el.dataset.lightbox || el.src;
      lb.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
  const closeLb = () => { lb.classList.remove('active'); document.body.style.overflow = ''; };
  closeBtn?.addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });
}

/* FAQ Accordion */
function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      item.closest('.faq-accordion')?.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        const a = i.querySelector('.faq-answer');
        if (a) a.style.maxHeight = '0';
      });
      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* Back to Top */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* Smooth Scroll */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = document.querySelector('.header')?.offsetHeight || 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });
}

/* Current Year */
function initCurrentYear() {
  const el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* Form Validation */
function initFormValidation() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(f => {
      f.classList.remove('error');
      if (!f.value.trim()) { valid = false; f.classList.add('error'); }
      if (f.type === 'email' && f.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) { valid = false; f.classList.add('error'); }
      if (f.type === 'tel' && f.value && f.value.replace(/\D/g,'').length < 10) { valid = false; f.classList.add('error'); }
    });
    if (valid) {
      const btn = form.querySelector('[type="submit"]');
      if (btn) { btn.textContent = 'Message Sent!'; btn.disabled = true; }
    }
  });
}

/* ============================================
   SCROLL-DRIVEN PARALLAX & MOTION EFFECTS
   ============================================ */

/* Parallax on section backgrounds + data-parallax elements */
function initParallaxScroll() {
  // Skip on mobile or reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const parallaxSections = document.querySelectorAll('.section-alt, .section-dark');
  const parallaxElements = document.querySelectorAll('[data-parallax="true"]');

  if (!parallaxSections.length && !parallaxElements.length) return;

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const isMobile = window.innerWidth <= 768;

      if (!isMobile) {
        // Parallax on section backgrounds — shift slower than scroll
        parallaxSections.forEach(section => {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + scrollY;
          const offset = (scrollY - sectionTop) * 0.3;
          // Only apply when section is roughly in view
          if (rect.bottom > -200 && rect.top < window.innerHeight + 200) {
            section.style.backgroundPositionY = offset + 'px';
          }
        });

        // Parallax on individual elements
        parallaxElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.bottom > -100 && rect.top < window.innerHeight + 100) {
            const center = rect.top + rect.height / 2;
            const viewCenter = window.innerHeight / 2;
            const offset = (center - viewCenter) * 0.3;
            el.style.transform = `translateY(${offset}px)`;
          }
        });
      }

      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* Staggered reveal delays for grid children */
function initStaggeredChildren() {
  const containerSelectors = [
    '.services-categories',
    '.procedure-category-cards',
    '.features-grid',
    '.gallery-grid'
  ];

  containerSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(container => {
      const children = container.children;
      for (let i = 0; i < children.length; i++) {
        children[i].style.transitionDelay = (i * 0.1) + 's';
      }
    });
  });
}

/* Smooth image reveal on scroll */
function initImageReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Find all images inside sections (not hero/header)
  const sections = document.querySelectorAll('.section, .section-alt, .section-dark, .testimonials, .quiz-section');
  const images = [];

  sections.forEach(section => {
    section.querySelectorAll('img').forEach(img => {
      // Don't double-process images already inside animated containers
      if (!img.classList.contains('img-reveal')) {
        img.classList.add('img-reveal');
      }
      images.push(img);
    });
  });

  if (!images.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('img-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  images.forEach(img => observer.observe(img));
}

/* ============================================
   SCROLL-DRIVEN DYNAMIC EFFECTS
   ============================================ */

/* Parallax Scroll on Section Backgrounds */
function initParallaxScroll() {
  if (window.innerWidth <= 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  const parallaxSections = document.querySelectorAll('.section-alt, .section-dark');
  const parallaxEls = document.querySelectorAll('[data-parallax="true"]');
  if (!parallaxSections.length && !parallaxEls.length) return;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      parallaxSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;
        const offset = (rect.top - vh / 2) * 0.08;
        section.style.backgroundPositionY = offset + 'px';
      });

      parallaxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2) * 0.15;
        el.style.transform = `translateY(${offset}px)`;
      });

      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* Image Reveal on Scroll */
function initImageReveal() {
  const images = document.querySelectorAll('.section img:not(.logo-img):not([src*="placehold"])');
  if (!images.length) return;

  images.forEach(img => img.classList.add('img-reveal'));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('img-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  images.forEach(img => obs.observe(img));
}

/* Staggered Children Animation */
function initStaggeredChildren() {
  const grids = document.querySelectorAll(
    '.procedure-category-cards, .features-grid, .gallery-grid, .signature-grid'
  );
  if (!grids.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.children;
        Array.from(children).forEach((child, i) => {
          child.style.transitionDelay = (i * 0.12) + 's';
          child.classList.add('animated', 'animate-fade-in-up');
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  grids.forEach(grid => {
    Array.from(grid.children).forEach(child => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(30px)';
    });
    obs.observe(grid);
  });
}

/* Testimonial Progress Bar */
function initTestimonialProgress() {
  const bar = document.querySelector('.testimonial-progress-bar');
  const dots = document.querySelectorAll('.carousel-dot');
  if (!bar || !dots.length) return;
  
  const update = () => {
    const activeIdx = Array.from(dots).findIndex(d => d.classList.contains('active'));
    const pct = ((activeIdx + 1) / dots.length) * 100;
    bar.style.width = pct + '%';
  };
  
  const observer = new MutationObserver(update);
  dots.forEach(dot => observer.observe(dot, { attributes: true, attributeFilter: ['class'] }));
  update();
}

// Init testimonial progress after carousel is ready
setTimeout(initTestimonialProgress, 100);
