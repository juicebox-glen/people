/* ============================================================
   PEOPLE — Site Scripts (consolidated)
   Page transition · Slide overlays · Mobile menu · Wordmark morph
   Contact scroll · Vimeo hero · Matter.js · Case study interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ================================================================
     PAGE TRANSITION — Lottie intro sequence
     ================================================================ */
  const PT_INTRO_HIDE_MS = 4000;
  const PT_LOTTIE_SRC = new URL('documents/page-transition-lottie.json', window.location.href).href;

  const overlay = document.querySelector('.page-transition');
  const skipIntro = document.documentElement.classList.contains('pt-intro-skip');

  if (overlay) {
    const content = overlay.querySelector('.page-transition__content');
    const glass = overlay.querySelector('.page-transition__glass');
    const lottieEl = overlay.querySelector('.page-transition__lottie');
    let ptLottieAnim = null;

    function getLottie() { return window.lottie || window.bodymovin; }

    function tryPlayTransitionLottie() {
      if (!ptLottieAnim || !overlay.classList.contains('is-intro')) return;
      ptLottieAnim.stop();
      ptLottieAnim.play();
    }

    function initTransitionLottie() {
      const L = getLottie();
      if (!lottieEl || !L || ptLottieAnim) return;
      const embedded = window.__PAGE_TRANSITION_LOTTIE__;
      const opts = { container: lottieEl, renderer: 'svg', loop: true, autoplay: false };
      if (embedded) opts.animationData = embedded;
      else opts.path = PT_LOTTIE_SRC;
      ptLottieAnim = L.loadAnimation(opts);
      ptLottieAnim.addEventListener('data_failed', () => {
        console.warn('Page transition Lottie failed to load.');
      });
    }

    function resetTransitionLayers() {
      if (content) { content.style.animation = 'none'; content.style.transform = ''; content.style.willChange = ''; }
      if (glass) { glass.style.animation = 'none'; glass.style.transform = ''; glass.style.willChange = ''; }
      if (lottieEl) { lottieEl.style.animation = 'none'; lottieEl.style.opacity = ''; }
      void overlay.offsetWidth;
    }

    initTransitionLottie();

    if (skipIntro) {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    } else {
      let introStarted = false;
      function hideIntroOverlay() {
        overlay.classList.remove('is-intro');
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
        if (ptLottieAnim) ptLottieAnim.pause();
        resetTransitionLayers();
      }
      function runIntroSequence() {
        if (introStarted) return;
        introStarted = true;
        requestAnimationFrame(() => {
          overlay.classList.add('is-intro');
          tryPlayTransitionLottie();
          setTimeout(hideIntroOverlay, PT_INTRO_HIDE_MS);
        });
      }

      const introKickTimer = setTimeout(() => {
        if (!introStarted) runIntroSequence();
      }, 4000);

      if (ptLottieAnim) {
        const kickIntro = () => { clearTimeout(introKickTimer); runIntroSequence(); };
        ptLottieAnim.addEventListener('DOMLoaded', kickIntro, { once: true });
        ptLottieAnim.addEventListener('data_ready', kickIntro, { once: true });
        setTimeout(() => {
          if (!introStarted && ptLottieAnim && ptLottieAnim.totalFrames > 0) kickIntro();
        }, 0);
      } else {
        clearTimeout(introKickTimer);
        runIntroSequence();
      }

      document.body.classList.add('no-scroll');
      setTimeout(() => {
        const menuOpen = document.querySelector('.mobile-menu')?.classList.contains('is-open');
        if (!menuOpen) document.body.classList.remove('no-scroll');
      }, PT_INTRO_HIDE_MS);

      setTimeout(() => {
        window.addEventListener('resize', () => {
          setTimeout(() => { overlay.style.display = 'none'; }, 50);
        });
      }, PT_INTRO_HIDE_MS);
    }

    window.addEventListener('pageshow', (e) => {
      if (e.persisted) window.location.reload();
    });
  }


  /* ================================================================
     SLIDE OVERLAYS — Journal, Studio, Case Study panels
     ================================================================ */
  initSlideOverlays();


  /* ================================================================
     MOBILE MENU
     ================================================================ */
  const menuBtn = document.querySelector('.nav__hamburger');
  const menu = document.querySelector('.mobile-menu');
  const closeBtn = menu?.querySelector('.mobile-menu__close');

  function setMenuOpen(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('no-scroll', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => setMenuOpen(!menu.classList.contains('is-open')));
    if (closeBtn) closeBtn.addEventListener('click', () => setMenuOpen(false));
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenuOpen(false);
    });
    // Close menu when tapping Contact (scrolls to footer)
    menu.querySelectorAll('a[href="#contact"]').forEach((a) => {
      a.addEventListener('click', () => setMenuOpen(false));
    });
    // Close menu when tapping Projects (scrolls to section)
    menu.querySelectorAll('a[href="#projects"]').forEach((a) => {
      a.addEventListener('click', () => setMenuOpen(false));
    });
    // Mobile menu → overlay triggers
    menu.querySelectorAll('[data-mobile-slide]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setMenuOpen(false);
        const name = btn.getAttribute('data-mobile-slide');
        // Small delay so menu close animation starts first
        setTimeout(() => {
          const target = name === 'journal'
            ? document.getElementById('journal-overlay')
            : name === 'studio'
              ? document.getElementById('studio-overlay')
              : null;
          if (target && !target.classList.contains('is-open')) {
            openSlideOverlay(target);
          }
        }, 150);
      });
    });
  }


  /* ================================================================
     CONTACT — scroll to bottom of page (full footer reveal)
     ================================================================ */
  function getMaxScrollY() {
    const el = document.documentElement;
    const body = document.body;
    const h = Math.max(el.scrollHeight, body ? body.scrollHeight : 0, el.offsetHeight, body ? body.offsetHeight : 0);
    return Math.max(0, h - window.innerHeight);
  }
  function scrollToFooterContact() {
    window.scrollTo({ top: getMaxScrollY(), behavior: 'smooth' });
    if (location.hash !== '#contact') history.replaceState(null, '', '#contact');
  }
  document.querySelectorAll('a[href="#contact"]').forEach((a) => {
    a.addEventListener('click', (e) => { e.preventDefault(); scrollToFooterContact(); });
  });
  if (location.hash === '#contact') {
    requestAnimationFrame(() => { requestAnimationFrame(() => scrollToFooterContact()); });
  }


  /* ================================================================
     VIMEO HERO — poster masks iframe grey; remove when video paints
     ================================================================ */
  const heroWrap = document.querySelector('.hero__video-wrap');
  if (heroWrap && window.Vimeo) {
    const iframe = heroWrap.querySelector('iframe');
    if (iframe) {
      const player = new Vimeo.Player(iframe);
      let posterRemoved = false;
      function removePoster() {
        if (posterRemoved) return;
        posterRemoved = true;
        heroWrap.classList.add('is-video-ready');
      }
      player.ready().then(() => player.play()).catch(() => {});
      player.on('playing', removePoster);
      player.on('timeupdate', function onTime(data) {
        if (data && data.seconds > 0.12) { removePoster(); player.off('timeupdate', onTime); }
      });
    }
  }


  /* ================================================================
     MORPHING WORDMARK (hero → nav)
     ================================================================ */
  initWordmarkMorph();


  /* ================================================================
     MATTER.JS PHYSICS LETTERS
     ================================================================ */
  initPhysicsLetters();


  /* ================================================================
     CASE STUDY INTERACTIONS
     ================================================================ */
  initCaseStudyImageHotspots();
  initCaseStudyParallaxPlan();
});


/* ============================================================
   SLIDE OVERLAY SYSTEM
   ============================================================ */
let _slideLastOpener = null;

function openSlideOverlay(target) {
  if (!target) return;
  // Close any other open overlay first
  document.querySelectorAll('.skeleton-slide-overlay.is-open').forEach((el) => {
    if (el !== target) {
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
    }
  });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.classList.add('is-open');
      target.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      target.querySelector('.skeleton-slide-overlay__close')?.focus({ preventScroll: true });
    });
  });
}

function closeSlideOverlay(overlay) {
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  // Reset all triggers
  document.querySelectorAll('[data-skeleton-slide]').forEach((t) => t.setAttribute('aria-expanded', 'false'));
  if (_slideLastOpener) {
    _slideLastOpener.focus({ preventScroll: true });
    _slideLastOpener = null;
  }
}

function initSlideOverlays() {
  const journal = document.getElementById('journal-overlay');
  const studio = document.getElementById('studio-overlay');
  const caseStudy = document.getElementById('case-study-overlay');
  const panels = [journal, studio, caseStudy].filter(Boolean);
  const triggers = document.querySelectorAll('[data-skeleton-slide]');
  const caseStudyTriggers = document.querySelectorAll('[data-skeleton-case-study]');

  if (!panels.length) return;

  // Nav + footer triggers for Journal / Studio
  triggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.getAttribute('data-skeleton-slide');
      if (!name) return;
      const panel = name === 'journal' ? journal : name === 'studio' ? studio : null;
      if (!panel) return;

      if (panel.classList.contains('is-open')) {
        closeSlideOverlay(panel);
        btn.setAttribute('aria-expanded', 'false');
        return;
      }
      _slideLastOpener = btn;
      openSlideOverlay(panel);
      triggers.forEach((t) => {
        t.setAttribute('aria-expanded', t.getAttribute('data-skeleton-slide') === name ? 'true' : 'false');
      });
    });
  });

  // Case study card triggers
  caseStudyTriggers.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (caseStudy?.classList.contains('is-open')) {
        closeSlideOverlay(caseStudy);
        return;
      }
      _slideLastOpener = link;
      openSlideOverlay(caseStudy);
    });
  });

  // Close buttons
  panels.forEach((p) => {
    p.querySelector('.skeleton-slide-overlay__close')?.addEventListener('click', () => closeSlideOverlay(p));
  });

  // "← All projects" link in case study
  caseStudy?.querySelector('.case-study__back a')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeSlideOverlay(caseStudy);
    const projects = document.getElementById('projects');
    if (projects) {
      projects.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (location.hash !== '#projects') history.replaceState(null, '', '#projects');
    }
  });

  // Escape key closes active overlay
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = panels.find((p) => p.classList.contains('is-open'));
    if (!open) return;
    e.preventDefault();
    closeSlideOverlay(open);
  });
}


/* ============================================================
   MORPHING WORDMARK
   ============================================================ */
function getPageGutterPx() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;width:var(--page-gutter);height:0;';
  document.documentElement.appendChild(probe);
  const px = probe.offsetWidth;
  document.documentElement.removeChild(probe);
  return px > 0 ? px : 16;
}

function getPageBgRgb() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--page-bg-rgb').trim();
  const parts = raw.split(',').map((s) => parseInt(s.trim(), 10));
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) return parts;
  return [255, 246, 238];
}

function initWordmarkMorph() {
  const morph = document.getElementById('wordmarkMorph');
  const hero = document.getElementById('hero');
  const nav = document.getElementById('nav');
  const navLogo = nav?.querySelector('.nav__logo');
  if (!morph || !hero || !nav || !navLogo) return;

  const ASPECT = 356 / 1701;
  function lerp(a, b, t) { return a + (b - a) * t; }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    morph.classList.add('wordmark-morph--settled');
    morph.style.opacity = '0';
    navLogo.classList.add('nav__logo--settled');
    return;
  }

  let startLeft, startTop, startW, endLeft, endTop, endW, scrollRange = 1;

  function computeAnchors() {
    const g = getPageGutterPx();
    const hr = hero.getBoundingClientRect();
    startW = Math.max(1, window.innerWidth - 2 * g);
    const startH = startW * ASPECT;
    startLeft = g;
    const heroBottomDoc = hr.bottom + window.scrollY;
    startTop = heroBottomDoc - startH - g;
    endW = Math.max(navLogo.offsetWidth, 1);
    const endH = endW * ASPECT;
    endLeft = (window.innerWidth - endW) / 2;
    endTop = (nav.offsetHeight - endH) / 2;
    scrollRange = Math.max(1, hero.offsetHeight);
  }

  function update() {
    const t = Math.max(0, Math.min(1, window.scrollY / scrollRange));
    const settled = t >= 1;
    const left = lerp(startLeft, endLeft, t);
    const top = lerp(startTop, endTop, t);
    const width = lerp(startW, endW, t);
    const scale = width / startW;
    const [r0, g0, b0] = getPageBgRgb();
    const r = Math.round(lerp(r0, 0, t));
    const g = Math.round(lerp(g0, 0, t));
    const b = Math.round(lerp(b0, 0, t));

    /* translate3d + scale avoids layout thrash from left/top/width on every scroll frame. */
    morph.style.width = `${startW}px`;
    morph.style.transform = `translate3d(${left}px, ${top}px, 0) scale(${scale})`;
    morph.style.color = `rgb(${r},${g},${b})`;
    morph.classList.toggle('wordmark-morph--settled', settled);
    navLogo.classList.toggle('nav__logo--settled', settled);
  }

  computeAnchors();
  update();
  requestAnimationFrame(() => { computeAnchors(); update(); });

  const desktopMq = window.matchMedia('(min-width: 1024px)');

  function disableMorph() {
    morph.style.display = 'none';
    morph.classList.add('wordmark-morph--settled');
    navLogo.classList.add('nav__logo--settled');
  }

  function enableMorph() {
    morph.style.display = '';
    morph.classList.remove('wordmark-morph--settled');
    navLogo.classList.remove('nav__logo--settled');
    computeAnchors();
    update();
  }

  if (!desktopMq.matches) {
    disableMorph();
  }

  desktopMq.addEventListener('change', (e) => {
    if (e.matches) enableMorph();
    else disableMorph();
  });

  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { computeAnchors(); update(); });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      computeAnchors();
      update();
    });
  }
}


/* ============================================================
   MATTER.JS PHYSICS LETTERS
   ============================================================ */
function initPhysicsLetters() {
  const container = document.getElementById('physics-letters');
  if (!container) return;
  const canvas = container.querySelector('canvas');
  if (!canvas) return;

  const imgUrls = {
    p: container.dataset.imgP || null,
    e: container.dataset.imgE || null,
    o: container.dataset.imgO || null,
    l: container.dataset.imgL || null,
  };

  let physicsStarted = false;

  function loadMatterAndRun() {
    if (physicsStarted) return;
    physicsStarted = true;
    detachFooterRevealListeners();
    if (typeof Matter === 'undefined') {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
      s.onload = () => runPhysics();
      document.head.appendChild(s);
    } else {
      runPhysics();
    }
  }

  function footerRevealTarget() {
    return document.querySelector('.footer-reveal-sentinel') || document.querySelector('.main-content .section-spacer');
  }
  const FOOTER_REVEAL_LEAD_PX = 800;

  function isMainContentScrolledPast() {
    const el = footerRevealTarget();
    if (!el) return false;
    return el.getBoundingClientRect().bottom <= FOOTER_REVEAL_LEAD_PX;
  }

  let footerRevealScheduled = false;
  function tryFooterReveal() {
    if (physicsStarted) return;
    if (isMainContentScrolledPast()) loadMatterAndRun();
  }
  function onScrollOrViewport() {
    if (physicsStarted || footerRevealScheduled) return;
    footerRevealScheduled = true;
    requestAnimationFrame(() => { footerRevealScheduled = false; tryFooterReveal(); });
  }

  const passiveScroll = { passive: true };
  function detachFooterRevealListeners() {
    window.removeEventListener('scroll', onScrollOrViewport, passiveScroll);
    window.removeEventListener('resize', onScrollOrViewport);
  }
  window.addEventListener('scroll', onScrollOrViewport, passiveScroll);
  window.addEventListener('resize', onScrollOrViewport);
  requestAnimationFrame(() => { requestAnimationFrame(tryFooterReveal); });

  function runPhysics() {
    const { Engine, Render, Runner, Bodies, Body, World, Query, Constraint, Events } = Matter;
    const DPR = window.devicePixelRatio || 1;

    function readCanvasSize() {
      const r = canvas.getBoundingClientRect();
      return { w: Math.max(0, Math.round(r.width)), h: Math.max(0, Math.round(r.height)) };
    }

    let W, H;
    const s0 = readCanvasSize();
    W = s0.w; H = s0.h;

    if (W < 10 || H < 10) {
      runPhysics._retries = (runPhysics._retries || 0) + 1;
      if (runPhysics._retries < 50) setTimeout(runPhysics, 150);
      return;
    }
    runPhysics._retries = 0;

    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';

    const engine = Engine.create({ gravity: { y: 1.2 } });
    const world = engine.world;
    const render = Render.create({
      canvas, engine,
      options: { width: W, height: H, background: 'transparent', wireframes: false, pixelRatio: DPR }
    });

    Events.on(render, 'beforeRender', () => {
      render.context.clearRect(0, 0, render.canvas.width, render.canvas.height);
    });

    Render.run(render);
    Runner.run(Runner.create(), engine);

    const WORD = ['p','e','o','p','l','e'];
    const NAT = { p:[267,355], e:[230,355], o:[358,367], l:[222,355] };
    const BASE = { p:[75,100], e:[65,100], o:[98,100], l:[63,100] };

    function imgToDataUrl(img) {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        return c.toDataURL('image/png');
      } catch { return null; }
    }
    function makePlaceholder(w, h) {
      const c = document.createElement('canvas');
      c.width = Math.max(1, w); c.height = Math.max(1, h);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#2e2e2b';
      ctx.fillRect(0, 0, c.width, c.height);
      return c.toDataURL();
    }

    const letterBodies = [];
    const BASE_GAP = 10;
    const BASE_TOTAL = WORD.reduce((s, k) => s + BASE[k][0], 0) + BASE_GAP * (WORD.length - 1);
    const wordmarkWidth = window.innerWidth - 2 * getPageGutterPx();
    const SCALE = wordmarkWidth / BASE_TOTAL;
    const GAP = BASE_GAP * SCALE;

    function createBody(x, y, cfg, angle) {
      return Bodies.rectangle(x, y, cfg.w, cfg.h, {
        angle, restitution: 0.38, friction: 0.65, frictionAir: 0.008, density: 0.03,
        render: { sprite: { texture: cfg.texture, xScale: cfg.xScale, yScale: cfg.yScale } }
      });
    }

    const keys = ['p','e','o','l'];
    Promise.all(keys.map(k => new Promise(resolve => {
      const url = imgUrls[k];
      if (!url) return resolve({ k, texture: makePlaceholder(NAT[k][0], NAT[k][1]), natW: NAT[k][0], natH: NAT[k][1] });
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve({ k, texture: imgToDataUrl(img) || makePlaceholder(NAT[k][0], NAT[k][1]), natW: NAT[k][0], natH: NAT[k][1] });
      img.onerror = () => resolve({ k, texture: makePlaceholder(NAT[k][0], NAT[k][1]), natW: NAT[k][0], natH: NAT[k][1] });
      img.src = url;
    }))).then(loaded => {
      const texMap = {};
      loaded.forEach(({ k, texture, natW, natH }) => { texMap[k] = { texture, natW, natH }; });
      const CFG = {};
      keys.forEach(k => {
        const { texture, natW, natH } = texMap[k];
        const w = BASE[k][0] * SCALE, h = BASE[k][1] * SCALE;
        CFG[k] = { texture, w, h, xScale: w / natW, yScale: h / natH };
      });

      const totalW = WORD.reduce((s, k, i) => s + CFG[k].w + (i < WORD.length - 1 ? GAP : 0), 0);
      const startX = (W - totalW) / 2;
      const startY = -CFG['p'].h * 1.5;

      const letters = [];
      let cx = startX;
      WORD.forEach(k => {
        const c = CFG[k];
        letters.push({ x: cx + c.w / 2, config: c });
        cx += c.w + GAP;
      });

      const order = letters.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }

      order.forEach((idx, seq) => {
        setTimeout(() => {
          const { x, config } = letters[idx];
          const body = createBody(x, startY, config, (Math.random() - 0.5) * 0.15);
          World.add(world, body);
          letterBodies[idx] = body;
        }, seq * 120);
      });
    });

    const wo = { isStatic: true, restitution: 0.35, friction: 0.5, render: { fillStyle: 'transparent', strokeStyle: 'transparent', lineWidth: 0 } };
    function buildWalls() {
      return [
        Bodies.rectangle(W / 2, H + 10, W * 2, 20, wo),
        Bodies.rectangle(-10, H / 2, 20, H * 3, wo),
        Bodies.rectangle(W + 10, H / 2, 20, H * 3, wo),
      ];
    }
    let walls = buildWalls();
    World.add(world, walls);

    function letterHalfHeight(body) { return (body.bounds.max.y - body.bounds.min.y) / 2; }
    function clampLetterY(body, y) {
      const half = letterHalfHeight(body);
      const lo = half, hi = H - half;
      return lo >= hi ? H / 2 : Math.max(lo, Math.min(hi, y));
    }

    let dragConstraint = null;
    Events.on(engine, 'afterUpdate', () => {
      const dragged = dragConstraint && dragConstraint.bodyB;
      letterBodies.forEach(body => {
        if (!body || body === dragged) return;
        const half = letterHalfHeight(body);
        let y = body.position.y, vy = body.velocity.y;
        if (y > H - half) { y = H - half; vy *= 0.35; }
        else if (y < half && vy <= 0) { y = half; vy *= -0.35; }
        if (y !== body.position.y) {
          Body.setPosition(body, { x: body.position.x, y });
          Body.setVelocity(body, { x: body.velocity.x * 0.98, y: vy });
        }
      });
    });

    function pt(cx, cy) {
      const r = canvas.getBoundingClientRect();
      return { x: (cx - r.left) * (W / r.width), y: (cy - r.top) * (H / r.height) };
    }
    function startDrag(cx, cy) {
      const p = pt(cx, cy);
      const hit = Query.point(letterBodies.filter(Boolean), p);
      if (!hit.length) return;
      dragConstraint = Constraint.create({
        pointA: p, bodyB: hit[0],
        pointB: { x: p.x - hit[0].position.x, y: p.y - hit[0].position.y },
        stiffness: 0.5, damping: 0, render: { visible: false }
      });
      World.add(world, dragConstraint);
    }
    function moveDrag(cx, cy) {
      if (!dragConstraint) return;
      const p = pt(cx, cy);
      dragConstraint.pointA = { x: p.x, y: clampLetterY(dragConstraint.bodyB, p.y) };
    }
    function endDrag() {
      if (dragConstraint) { World.remove(world, dragConstraint); dragConstraint = null; }
    }

    container.addEventListener('mousedown', e => { e.preventDefault(); startDrag(e.clientX, e.clientY); });
    window.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', endDrag);
    container.addEventListener('touchstart', e => { e.preventDefault(); startDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    window.addEventListener('touchmove', e => { if (e.touches.length) moveDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    window.addEventListener('touchend', endDrag);

    function applyCanvasDimensions() {
      const s = readCanvasSize();
      if (s.w < 10 || s.h < 10) return;
      W = s.w; H = s.h;
      canvas.width = W * DPR; canvas.height = H * DPR;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      render.options.width = W; render.options.height = H;
      render.canvas.width = W * DPR; render.canvas.height = H * DPR;
      if (render.bounds) { render.bounds.max.x = W; render.bounds.max.y = H; }
      walls.forEach(b => World.remove(world, b));
      walls = buildWalls();
      World.add(world, walls);
    }

    window.addEventListener('resize', () => requestAnimationFrame(applyCanvasDimensions));
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(() => requestAnimationFrame(applyCanvasDimensions)).observe(container);
    }
  }
}


/* ============================================================
   CASE STUDY — hotspot interactions
   ============================================================ */
function initCaseStudyImageHotspots() {
  const hotspots = document.querySelectorAll('.case-study__img-hotspot');
  if (!hotspots.length) return;

  hotspots.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasActive = btn.classList.contains('is-active');
      hotspots.forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-expanded', 'false'); });
      if (!wasActive) { btn.classList.add('is-active'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  document.addEventListener('click', () => {
    hotspots.forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-expanded', 'false'); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    hotspots.forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-expanded', 'false'); });
  });
}


/* ============================================================
   CASE STUDY — parallax floor plan floats
   ============================================================ */
function initCaseStudyParallaxPlan() {
  const root = document.querySelector('[data-parallax-plan]');
  if (!root) return;
  const floats = root.querySelectorAll('[data-parallax-speed]');
  if (!floats.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  function update() {
    ticking = false;
    const rect = root.getBoundingClientRect();
    const vh = window.innerHeight;
    const offset = (rect.top + rect.height / 2) - (vh / 2);
    floats.forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-parallax-speed') || '0.15');
      const y = Number.isFinite(speed) ? offset * speed : 0;
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    });
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}
