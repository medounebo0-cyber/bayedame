/* ============================================
   PORTFOLIO — INTERACTIONS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- HERO REVEAL ---------- */
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));

  /* ---------- TIMECODE VIEWFINDER (compteur 24 fps qui défile) ---------- */
  const tcEl = document.querySelector('[data-tc]');
  if (tcEl) {
    let f = 0;
    const pad = n => String(n).padStart(2, '0');
    setInterval(() => {
      f++;
      const fps = f % 24;
      const s   = Math.floor(f / 24) % 60;
      const m   = Math.floor(f / 1440) % 60;
      const h   = Math.floor(f / 86400);
      tcEl.textContent = `TC ${pad(h)}:${pad(m)}:${pad(s)}:${pad(fps)}`;
    }, 1000 / 24);
  }

  /* ---------- MARQUEE SPEED-UP AU SCROLL ---------- */
  // Le bandeau défilant s'accélère quand l'utilisateur scrolle rapidement
  let lastScrollY = window.scrollY;
  let lastScrollTime = performance.now();
  let marqueeSpeed = 30;
  let resetTimer;

  window.addEventListener('scroll', () => {
    const now = performance.now();
    const dt = now - lastScrollTime;
    const dy = Math.abs(window.scrollY - lastScrollY);
    const velocity = dy / Math.max(dt, 1); // px/ms

    // Plus on scrolle vite, plus le marquee accélère (jusqu'à 4x)
    const targetSpeed = Math.max(7, 30 - velocity * 8);
    marqueeSpeed = marqueeSpeed * 0.7 + targetSpeed * 0.3;
    document.documentElement.style.setProperty('--marquee-speed', `${marqueeSpeed.toFixed(1)}s`);

    lastScrollY = window.scrollY;
    lastScrollTime = now;

    // Retour à la vitesse normale après 400ms d'inactivité
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      document.documentElement.style.setProperty('--marquee-speed', '30s');
      marqueeSpeed = 30;
    }, 400);
  }, { passive: true });

  /* ---------- SPLIT TEXT EN MOTS ---------- */
  // Wrappe chaque mot d'un élément [data-split] dans un span avec délai stagger
  function splitWords(el) {
    let i = 0;
    function process(node) {
      if (node.nodeType === 3) {
        const words = node.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        words.forEach(w => {
          if (/^\s+$/.test(w)) {
            frag.appendChild(document.createTextNode(w));
          } else if (w.length) {
            const wrap = document.createElement('span');
            wrap.className = 'word';
            wrap.style.setProperty('--i', i++);
            const inner = document.createElement('span');
            inner.textContent = w;
            wrap.appendChild(inner);
            frag.appendChild(wrap);
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && !node.classList.contains('word')) {
        Array.from(node.childNodes).forEach(process);
      }
    }
    Array.from(el.childNodes).forEach(process);
  }
  document.querySelectorAll('[data-split]').forEach(splitWords);

  /* ---------- CURSEUR CUSTOM ---------- */
  const cursor = document.querySelector('[data-cursor]');
  const cursorDot = document.querySelector('[data-cursor-dot]');

  if (cursor && cursorDot && window.matchMedia('(pointer: fine)').matches) {
    // Réticule d'autofocus : 4 équerres + étiquette
    cursor.innerHTML =
      '<i class="cursor__c cursor__c--tl"></i>' +
      '<i class="cursor__c cursor__c--tr"></i>' +
      '<i class="cursor__c cursor__c--bl"></i>' +
      '<i class="cursor__c cursor__c--br"></i>' +
      '<span class="cursor__tag">AF</span>';

    let mouseX = 0, mouseY = 0;
    let curX = 0, curY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    function animateCursor() {
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;
      cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // hover states
    document.querySelectorAll('[data-cursor-hover], a, button, input, select, textarea').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
    document.querySelectorAll('[data-cursor-play]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-play'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-play'));
    });
  }

  /* ---------- FX CINÉMA (desktop + animations autorisées) ---------- */
  const FX_OK = window.matchMedia('(pointer: fine)').matches
             && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (FX_OK) {
    document.documentElement.classList.add('fx');

    /* a) Parallaxe souris sur le hero (le viseur et le texte bougent à des profondeurs différentes) */
    const heroEl = document.querySelector('.hero');
    const vfEl = document.querySelector('.vf');
    const heroContentEl = document.querySelector('.hero__content');
    if (heroEl && (vfEl || heroContentEl)) {
      let px = 0, py = 0, tx = 0, ty = 0;
      heroEl.addEventListener('mousemove', (e) => {
        const r = heroEl.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 → 0.5
        ty = (e.clientY - r.top) / r.height - 0.5;
      }, { passive: true });
      heroEl.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
      (function heroParallax() {
        px += (tx - px) * 0.06;
        py += (ty - py) * 0.06;
        if (vfEl) vfEl.style.transform = `translate(${px * 20}px, ${py * 20}px)`;
        if (heroContentEl) heroContentEl.style.transform = `translate(${px * -12}px, ${py * -9}px)`;
        requestAnimationFrame(heroParallax);
      })();
    }

    /* b) Cartes 3D + reflet lumineux qui suit le curseur */
    document.querySelectorAll('.work__item, .photo__item').forEach(card => {
      const sheen = document.createElement('span');
      sheen.className = 'fx-sheen';
      card.appendChild(sheen);

      let raf = null, trx = 0, try_ = 0, crx = 0, cry = 0;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const fx = (e.clientX - r.left) / r.width;   // 0 → 1
        const fy = (e.clientY - r.top) / r.height;
        try_ = (fx - 0.5) * 9;    // rotateY
        trx = (0.5 - fy) * 9;     // rotateX
        sheen.style.setProperty('--mx', (fx * 100) + '%');
        sheen.style.setProperty('--my', (fy * 100) + '%');
        if (!raf) raf = requestAnimationFrame(tick);
      }, { passive: true });

      function tick() {
        crx += (trx - crx) * 0.2;
        cry += (try_ - cry) * 0.2;
        card.style.transform =
          `perspective(1100px) rotateX(${crx.toFixed(2)}deg) rotateY(${cry.toFixed(2)}deg) translateY(-6px)`;
        if (Math.abs(trx - crx) > 0.05 || Math.abs(try_ - cry) > 0.05) {
          raf = requestAnimationFrame(tick);
        } else { raf = null; }
      }
      card.addEventListener('mouseleave', () => {
        trx = 0; try_ = 0;
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        card.style.transform = '';   // la transition CSS ramène la carte en douceur
      });
    });

    /* c) Boutons magnétiques (CTA principaux attirés par le curseur) */
    document.querySelectorAll('.btn--primary').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const mx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        const my = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        btn.style.transform = `translate(${(mx * 6).toFixed(1)}px, ${(my * 5).toFixed(1)}px)`;
      }, { passive: true });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- HUD SCROLL : barre pellicule (haut) + timecode (bas) ---------- */
  (function () {
    const scrub = document.createElement('div');
    scrub.className = 'scrub';
    scrub.innerHTML = '<div class="scrub__bar"></div>';
    document.body.appendChild(scrub);

    let hudTc = null;
    if (FX_OK) {
      const hud = document.createElement('div');
      hud.className = 'hud-scroll';
      hud.innerHTML =
        '<span class="hud-scroll__dot"></span><span>REC</span>' +
        '<span class="hud-scroll__sep">·</span><span class="hud-scroll__tc">00:00</span>';
      document.body.appendChild(hud);
      hudTc = hud.querySelector('.hud-scroll__tc');
    }

    const pad = n => String(n).padStart(2, '0');
    let ticking = false;
    function update() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(h.scrollTop / max, 1) : 0;
      h.style.setProperty('--scroll', (p * 100).toFixed(2) + '%');
      if (hudTc) {
        const t = Math.round(p * 180); // faux timecode sur ~3 min
        hudTc.textContent = pad(Math.floor(t / 60)) + ':' + pad(t % 60);
      }
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  })();

  /* ---------- DÉCODAGE TEXTE (labels HUD s'assemblent caractère par caractère) ---------- */
  if (FX_OK) {
    const GLYPHS = '█▓▒░<>/\\=*+:.#0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    function decode(el) {
      const original = el.dataset.text || el.textContent;
      el.dataset.text = original;
      const chars = original.split('');
      const total = 16;
      let frame = 0;
      el.classList.add('is-decoding');
      const id = setInterval(() => {
        frame++;
        const revealed = Math.floor((frame / total) * chars.length);
        el.textContent = chars.map((c, i) => {
          if (c === ' ') return ' ';
          if (i < revealed) return c;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }).join('');
        if (frame >= total) {
          clearInterval(id);
          el.textContent = original;
          el.classList.remove('is-decoding');
        }
      }, 30);
    }
    const decodeObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { decode(e.target); decodeObs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.section-head__num, .hero__meta-item, .manifesto__label')
      .forEach(el => decodeObs.observe(el));
  }

  /* ---------- SCROLL REVEAL ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  // Auto-add fade-up to common targets
  document.querySelectorAll(
    '.work__item, .photo__item, .timeline__item, .cv__about, .cv__skills, .cv__clients, .contact__form, .contact__channels, .section-head, .reveal, [data-split]'
  ).forEach(el => {
    const isSplit = el.hasAttribute('data-split');
    const isReveal = el.classList.contains('reveal');
    if (!isReveal && !isSplit) el.classList.add('fade-up');
    io.observe(el);
  });

  // Skill bars
  document.querySelectorAll('.cv__bar').forEach(bar => {
    const barObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          barObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    barObs.observe(bar);
  });

  /* ---------- FILTRES GALERIE PHOTO ---------- */
  const filters = document.querySelector('[data-filters]');
  const galleryItems = document.querySelectorAll('[data-gallery] .photo__item');

  filters?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;

    filters.querySelectorAll('.photo__filter').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    const filter = btn.dataset.filter;
    galleryItems.forEach(item => {
      if (filter === 'all' || item.dataset.cat === filter) {
        item.classList.remove('is-hidden');
      } else {
        item.classList.add('is-hidden');
      }
    });
  });

  /* ---------- FILTRES TRAVAUX VIDÉO ---------- */
  const wFilters = document.querySelector('[data-work-filters]');
  const workItems = document.querySelectorAll('[data-work-grid] .work__item');

  wFilters?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-wfilter]');
    if (!btn) return;

    wFilters.querySelectorAll('.work__filter').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    const filter = btn.dataset.wfilter;
    workItems.forEach(item => {
      if (filter === 'all' || item.dataset.cat === filter) {
        item.classList.remove('is-hidden');
      } else {
        item.classList.add('is-hidden');
      }
    });
  });

  /* ---------- LIGHTBOX PHOTOS ---------- */
  const lightbox = document.querySelector('[data-lightbox]');
  const lbImg = document.querySelector('[data-lightbox-img]');
  const lbCaption = document.querySelector('[data-lightbox-caption]');
  let lbIndex = 0;
  let lbItems = [];

  function openLightbox(idx) {
    lbItems = Array.from(document.querySelectorAll('[data-gallery] .photo__item:not(.is-hidden)'));
    lbIndex = idx;
    showLightbox();
    lightbox.classList.add('is-visible');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function showLightbox() {
    const item = lbItems[lbIndex];
    if (!item) return;
    const src = item.dataset.img;
    const caption = item.querySelector('figcaption')?.textContent || '';
    // If the real image doesn't load, show the placeholder gradient via background fallback
    lbImg.onerror = () => {
      lbImg.style.display = 'none';
      const ph = item.querySelector('.photo__placeholder');
      lbCaption.textContent = caption + ' — (placeholder, ajoutez le fichier ' + src + ')';
    };
    lbImg.onload = () => { lbImg.style.display = 'block'; };
    lbImg.style.display = 'block';
    lbImg.src = src;
    lbImg.alt = caption;
    lbCaption.textContent = caption;
  }
  function closeLightbox() {
    lightbox.classList.remove('is-visible');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-gallery] .photo__item').forEach((item, i) => {
    item.addEventListener('click', () => {
      const visible = Array.from(document.querySelectorAll('[data-gallery] .photo__item:not(.is-hidden)'));
      openLightbox(visible.indexOf(item));
    });
  });
  document.querySelector('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
  document.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => {
    lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length; showLightbox();
  });
  document.querySelector('[data-lightbox-next]')?.addEventListener('click', () => {
    lbIndex = (lbIndex + 1) % lbItems.length; showLightbox();
  });
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('is-visible')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length; showLightbox(); }
    if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbItems.length; showLightbox(); }
  });

  /* ---------- MODAL VIDÉO ---------- */
  const vmodal = document.querySelector('[data-vmodal]');
  const vwrap = document.querySelector('[data-vmodal-wrap]');

  document.querySelectorAll('[data-video]').forEach(item => {
    item.addEventListener('click', () => {
      const url = item.dataset.video;
      vwrap.innerHTML = `<iframe src="${url}?autoplay=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
      vmodal.classList.add('is-visible');
      vmodal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });
  function closeVModal() {
    vmodal.classList.remove('is-visible');
    vmodal.setAttribute('aria-hidden', 'true');
    vwrap.innerHTML = '';
    document.body.style.overflow = '';
  }
  document.querySelector('[data-vmodal-close]')?.addEventListener('click', closeVModal);
  vmodal?.addEventListener('click', (e) => { if (e.target === vmodal) closeVModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && vmodal?.classList.contains('is-visible')) closeVModal();
  });

  /* ---------- SUPABASE — Configuration ---------- */
  const SUPABASE_URL = 'https://bsaswpsgufyamrnrfkvw.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_E-e-dFA7UfXdZgiRL0jr5A_gVtCfjjl';

  /* ---------- STATS ANIMÉES — Compte de 0 à X au scroll ---------- */
  const statElements = document.querySelectorAll('.trust__stat');
  if (statElements.length > 0) {
    const animateCount = (el, target, suffix = '', duration = 1800) => {
      const numEl = el.querySelector('.trust__num');
      if (!numEl) return;
      const start = performance.now();
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.floor(easeOut(progress) * target);
        numEl.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else numEl.textContent = target + suffix;
      };
      requestAnimationFrame(step);
    };

    const statObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !e.target.dataset.animated) {
          e.target.dataset.animated = '1';
          const target = parseInt(e.target.dataset.count) || 0;
          const suffix = e.target.dataset.suffix || '';
          animateCount(e.target, target, suffix);
          statObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });

    statElements.forEach(el => statObs.observe(el));
  }

  /* ---------- TÉMOIGNAGES — chargement public ---------- */
  const testimonialsGrid = document.querySelector('[data-testimonials-grid]');
  const testimonialsSection = document.getElementById('testimonials');

  function starsHtml(rating) {
    let out = '';
    for (let i = 1; i <= 5; i++) {
      out += `<span class="${i<=rating?'':'tcard__stars--off'}">★</span>`;
    }
    return out;
  }

  function escHtml(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  async function loadTestimonials() {
    if (!testimonialsGrid || !testimonialsSection) return;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/testimonials?status=eq.approved&order=display_order.desc,created_at.desc&limit=9`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      );
      if (!res.ok) return;
      const items = await res.json();
      if (!Array.isArray(items) || items.length === 0) return; // garde la section masquée
      testimonialsGrid.innerHTML = items.map(t => `
        <article class="tcard fade-up">
          <div class="tcard__quote-icon">"</div>
          <div class="tcard__stars">${starsHtml(t.rating)}</div>
          <p class="tcard__message">${escHtml(t.message)}</p>
          <div class="tcard__author">
            <span class="tcard__name">${escHtml(t.client_name)}</span>
            ${t.client_role ? `<span class="tcard__role">${escHtml(t.client_role)}</span>` : ''}
            ${t.project_type ? `<span class="tcard__project">${escHtml(t.project_type)}</span>` : ''}
          </div>
        </article>
      `).join('');
      testimonialsSection.removeAttribute('hidden');
      // Re-observe les nouvelles cartes pour l'animation au scroll
      testimonialsGrid.querySelectorAll('.fade-up').forEach(el => io.observe(el));
    } catch (err) {
      // Silencieux : si Supabase est down, on n'affiche juste rien (la section reste masquée)
      console.warn('Témoignages indisponibles', err);
    }
  }
  loadTestimonials();

  /* ---------- TARIFS — Pré-remplir le contact form au clic sur un pack ---------- */
  document.querySelectorAll('.pack__cta').forEach(btn => {
    btn.addEventListener('click', () => {
      const pack = btn.closest('.pack');
      const packName = pack?.dataset.pack || '';
      const projectType = pack?.dataset.type || '';

      // Pré-remplir le type de projet
      const typeSelect = document.getElementById('f-type');
      if (typeSelect && projectType) {
        const match = Array.from(typeSelect.options).find(o =>
          o.value === projectType || o.text === projectType
        );
        if (match) typeSelect.value = match.value;
      }

      // Pré-remplir le message
      const messageField = document.getElementById('f-msg');
      if (messageField && packName) {
        messageField.value = `Bonjour Baye Dame,\n\nJe suis intéressé(e) par le « ${packName} ». Pouvez-vous me faire un devis adapté à mes besoins ?\n\nDétails de mon projet :\n— Date : \n— Lieu : \n— Particularités : \n\nMerci !`;
      }

      // Scroll vers le formulaire de contact
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Focus sur le champ Nom après le scroll
        setTimeout(() => {
          const nameField = document.getElementById('f-name');
          if (nameField) nameField.focus({ preventScroll: true });
        }, 800);
      }
    });
  });

  /* ---------- FORMULAIRE CONTACT (Supabase + Netlify Forms) ---------- */

  const form = document.querySelector('[data-form]');
  const successMsg = document.querySelector('[data-success]');
  const errorMsg = document.querySelector('[data-error]');
  const submitBtn = document.querySelector('[data-submit]');
  const submitLabel = document.querySelector('[data-submit-label]');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    successMsg?.classList.remove('is-visible');
    errorMsg?.classList.remove('is-visible');

    if (submitBtn) submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Envoi…';

    const data = new FormData(form);
    const payload = {
      name: data.get('name'),
      email: data.get('email'),
      phone: (data.get('phone') || '').toString().trim() || null,
      project_type: data.get('type'),
      message: data.get('message'),
    };

    // Envoi en parallèle vers Supabase (CRM admin) ET Netlify Forms (notification email)
    const supabasePromise = fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    const netlifyPromise = fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString()
    });

    try {
      const [supabaseRes, netlifyRes] = await Promise.allSettled([supabasePromise, netlifyPromise]);

      // On considère succès si au moins l'un des deux a fonctionné
      const supabaseOk = supabaseRes.status === 'fulfilled' && supabaseRes.value.ok;
      const netlifyOk = netlifyRes.status === 'fulfilled' && netlifyRes.value.ok;

      if (supabaseOk || netlifyOk) {
        successMsg?.classList.add('is-visible');
        form.reset();
        if (submitLabel) submitLabel.textContent = 'Envoyé ✓';
        setTimeout(() => {
          if (submitLabel) submitLabel.textContent = 'Envoyer';
          if (submitBtn) submitBtn.disabled = false;
        }, 3000);
      } else {
        throw new Error('Both submissions failed');
      }
    } catch (err) {
      errorMsg?.classList.add('is-visible');
      if (submitLabel) submitLabel.textContent = 'Envoyer';
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  /* ---------- BURGER MOBILE (simple smooth-scroll fallback) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});
