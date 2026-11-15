// Spring motion for the localized page (step 3).
// Three parts, rebuilt from DesignBookmark's Motion studies (https://designbookmark.com/motion):
// "Segmented control" -> color switch, "Jelly slider" -> temperature slider,
// "Loading to success" -> cart buttons. Same stiffness / damping values as the originals,
// with this page's own markup, colors and type. Plain JavaScript, no dependencies.
(() => {
  'use strict';
  const page = document.getElementById('page-ja');
  if (!page) return;

  // ---------- tiny spring engine: one rAF loop that sleeps when everything is at rest ----------
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const springs = new Set();
  const befores = new Set();
  const renders = new Set();
  let raf = 0;
  let last = 0;
  let busy = 0; // parts that need frames even when springs rest (the spinner)

  // reduced motion: every spring becomes critically damped, so nothing overshoots or wobbles
  const tune = (s, k, c) => { s.k = k; s.c0 = c; s.c = reduce.matches ? 2 * Math.sqrt(k) : c; };
  const S = (x, k, c) => { const s = { x, v: 0, t: x }; tune(s, k, c); springs.add(s); return s; };
  const to = (s, t) => { s.t = t; wake(); };
  const snap = (s, x) => { s.x = s.t = x; s.v = 0; };
  reduce.addEventListener('change', () => springs.forEach((s) => tune(s, s.k, s.c0)));

  function wake() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    befores.forEach((f) => f(dt));
    const sub = 4;
    const h = dt / sub;
    let moving = false;
    for (const s of springs) {
      for (let i = 0; i < sub; i++) {
        const a = -s.k * (s.x - s.t) - s.c * s.v;
        s.v += a * h;
        s.x += s.v * h;
      }
      if (Math.abs(s.x - s.t) > 1e-3 || Math.abs(s.v) > 1e-3) moving = true;
      else { s.x = s.t; s.v = 0; }
    }
    renders.forEach((f) => f());
    raf = moving || busy > 0 ? requestAnimationFrame(loop) : 0;
  }
  const paint = () => renders.forEach((f) => f());

  // Text that blurs out, then rises back in with the new words (the caption swap of the segmented control).
  function captionSwap(el) {
    const C = S(1, 300, 26);
    let timer = 0;
    renders.add(() => {
      const c = clamp(C.x, 0, 1);
      el.style.opacity = c.toFixed(3);
      el.style.transform = `translateY(${(C.x < 0 ? -C.x * 10 : (1 - c) * -6).toFixed(2)}px)`;
      el.style.filter = c < 0.999 ? `blur(${((1 - c) * 4).toFixed(2)}px)` : '';
    });
    return (text) => {
      if (el.textContent === text && C.t === 1) return;
      clearTimeout(timer);
      to(C, 0);
      timer = setTimeout(() => { el.textContent = text; C.x = -0.4; to(C, 1); }, 140);
    };
  }

  // ---------- 1. Color switch (Segmented control) ----------
  (() => {
    const seg = page.querySelector('.seg');
    const kettle = page.querySelector('.ja-hero .kettle');
    if (!seg || !kettle) return;
    const hl = seg.querySelector('.seg__hl');
    const btns = [...seg.querySelectorAll('button[data-color]')];
    const setName = captionSwap(page.querySelector('.ja-color__name'));
    const X = S(0, 300, 20); // highlight position
    const P = S(1, 520, 16); // kettle pop (--spring-pop)
    let cur = Math.max(0, btns.findIndex((b) => b.getAttribute('aria-checked') === 'true'));
    let lefts = [];
    let widths = []; // measured on resize only, so frames never read layout

    function pick(i, focus) {
      if (i === cur) return;
      cur = i;
      btns.forEach((b, k) => {
        b.setAttribute('aria-checked', String(k === i));
        b.tabIndex = k === i ? 0 : -1;
      });
      if (focus) btns[i].focus();
      kettle.dataset.color = btns[i].dataset.color;
      setName(btns[i].dataset.name);
      to(X, lefts[i] || 0);
      if (!reduce.matches) { P.x = 0.955; to(P, 1); }
    }
    btns.forEach((b, i) => {
      b.tabIndex = i === cur ? 0 : -1;
      b.addEventListener('click', () => pick(i, false));
      b.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (d === undefined) return;
        e.preventDefault();
        pick((cur + d + btns.length) % btns.length, true);
      });
    });
    // the page starts hidden, so place the highlight once it has a size
    new ResizeObserver(() => {
      lefts = btns.map((b) => b.offsetLeft);
      widths = btns.map((b) => b.offsetWidth);
      snap(X, lefts[cur]);
      paint();
    }).observe(seg);

    renders.add(() => {
      const w = widths[cur] || 0;
      const sp = reduce.matches ? 0 : clamp(Math.abs(X.v) / 1400, 0, 0.22);
      hl.style.width = `${w}px`;
      hl.style.transform = `translateX(${X.x.toFixed(2)}px) scale(${(1 + sp).toFixed(4)},${(1 - sp * 0.5).toFixed(4)})`;
      kettle.style.transform = P.x === 1 ? '' : `scale(${P.x.toFixed(4)})`;
    });
  })();

  // ---------- 2. Temperature slider (Jelly slider) ----------
  (() => {
    const rail = page.querySelector('.jelly__rail');
    if (!rail) return;
    const q = (c) => page.querySelector(c);
    const fill = q('.jelly__fill');
    const thumb = q('.jelly__thumb');
    const drop = q('.jelly__drop');
    const label = q('.jelly__label');
    const hit = q('.jelly__hit');
    const num = q('.temp__num');
    const temps = [...page.querySelectorAll('.kettle__temp')];
    const setHint = captionSwap(q('.temp__hint-in'));
    const MIN = 60;
    const MAX = 100;
    const HINTS = [
      [92, '浅煎りの豆に。香りが華やかに'],
      [87, '中煎りの豆に。バランスよく'],
      [80, '深煎りの豆に。苦みがまろやかに'],
      [70, '煎茶や、紅茶をやさしく'],
      [MIN, '玉露や、ぬるめのお茶に'],
    ];
    const hintFor = (v) => HINTS.find(([from]) => v >= from)[1];

    // scale under the track: a mark every 5, a taller one every 10 with its number
    const marksEl = q('.jelly__marks');
    const marks = [];
    for (let v = MIN; v <= MAX; v += 5) {
      const m = document.createElement('i');
      m.style.setProperty('--p', (v - MIN) / (MAX - MIN));
      m.dataset.v = v;
      if (v % 10 === 0) m.className = 'major';
      marksEl.appendChild(m);
      marks.push(m);
    }
    const nums = [...page.querySelectorAll('.jelly__nums span')];
    nums.forEach((n) => n.style.setProperty('--p', (Number(n.textContent) - MIN) / (MAX - MIN)));

    // springs from tokens.css: --slider-follow, --slider-bubble, --slider-release, --slider-glide
    const FOLLOW = [900, 50];
    const BUBBLE = [420, 22];
    const RELEASE = [300, 14];
    const GLIDE = [420, 34];
    // R thumb radius, TR drawn half size (the goo filter trims ~2px), D drop radius,
    // OX/OY goo layer offset, CY track centre in the rail, RISE how far the drop rises
    const R = 12, TR = 14, D = 18, OX = 40, OY = 80, CY = 16, RISE = -38, REST_DROP = 0.5;
    let W = 0;
    let ratio = (93 - MIN) / (MAX - MIN);
    const span = () => Math.max(W - 2 * R, 1);
    const toX = (v) => R + ((v - MIN) / (MAX - MIN)) * span();
    const toV = (x) => MIN + clamp((x - R) / span(), 0, 1) * (MAX - MIN);

    const X = S(0, ...FOLLOW); // thumb centre
    const DX = S(0, 260, 18); // drop x lags behind, so it leans
    const DY = S(CY, ...BUBBLE); // drop centre y
    const DS = S(REST_DROP, ...BUBBLE); // drop scale
    const PS = S(1, 520, 16); // thumb hover / press scale

    const rubber = (x, min, max, d = 18) =>
      x < min ? min - (1 - 1 / (((min - x) * 0.55) / d + 1)) * d
        : x > max ? max + (1 - 1 / (((x - max) * 0.55) / d + 1)) * d : x;
    const localX = (e) => e.clientX - rail.getBoundingClientRect().left;

    let dragging = false;
    let hover = false;
    let lifted = false;
    function sync() {
      const up = dragging || lifted;
      to(DY, up ? CY + RISE : CY);
      to(DS, up ? 1 : REST_DROP);
      to(PS, dragging ? 1.16 : hover ? 1.08 : 1);
    }

    rail.addEventListener('pointerdown', (e) => {
      if (!W) return;
      dragging = true;
      try { rail.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      tune(X, ...FOLLOW);
      to(X, rubber(localX(e), R, W - R));
      sync();
      hit.focus({ preventScroll: true });
    });
    rail.addEventListener('pointermove', (e) => { if (dragging) to(X, rubber(localX(e), R, W - R)); });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      tune(X, ...RELEASE);
      to(X, toX(Math.round(toV(X.t)))); // land on a whole degree
      sync();
    };
    rail.addEventListener('pointerup', end);
    rail.addEventListener('pointercancel', end);
    rail.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hover = true; sync(); } });
    rail.addEventListener('pointerleave', () => { hover = false; sync(); });

    // keyboard: 1 degree per arrow, 5 per page key; the drop stays up while the thumb has keyboard focus
    hit.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 5, PageDown: -5 }[e.key];
      const abs = { Home: MIN, End: MAX }[e.key];
      if (d === undefined && abs === undefined) return;
      e.preventDefault();
      const next = abs !== undefined ? abs : clamp(Math.round(toV(X.t)) + d, MIN, MAX);
      tune(X, ...GLIDE);
      to(X, toX(next));
      lifted = true;
      sync();
    });
    hit.addEventListener('focus', () => { if (hit.matches(':focus-visible')) { lifted = true; sync(); } });
    hit.addEventListener('blur', () => { lifted = false; sync(); });

    // the page starts hidden (width 0), so keep the value as a ratio and place the thumb once it has a size
    new ResizeObserver(() => {
      const w = rail.clientWidth;
      if (!w || w === W) return;
      W = w;
      const x = toX(MIN + ratio * (MAX - MIN));
      snap(X, x);
      snap(DX, x);
      paint();
    }).observe(rail);

    befores.add(() => { DX.t = X.x; if (W > 2 * R) ratio = (toV(X.t) - MIN) / (MAX - MIN); });

    let shown = -1;
    renders.add(() => {
      if (!W) return;
      const x = X.x;
      const value = Math.round(toV(x));
      const st = reduce.matches ? 1 : 1 + Math.min(Math.abs(X.v) / 2400, 0.4);
      thumb.style.transform = `translate(${x - TR + OX}px,${CY - TR + OY}px) scale(${st * PS.x},${PS.x / st})`;
      const tilt = reduce.matches ? 0 : clamp((DX.x - X.x) * 0.9, -28, 28);
      const dTr = `translate(${DX.x - D}px,${DY.x - D}px) rotate(${tilt}deg) scale(${DS.x})`;
      drop.style.transform = `translate(${OX}px,${OY}px) ${dTr}`;
      label.style.transform = dTr;
      label.style.opacity = clamp((DS.x - 0.7) / 0.25, 0, 1);
      fill.style.width = `${clamp(x, 0, W) * clamp((x - R) / R, 0, 1)}px`;
      hit.style.left = `${x - R}px`;
      if (value === shown) return;
      shown = value;
      label.textContent = value;
      num.textContent = value;
      temps.forEach((t) => { t.textContent = `${value}℃`; });
      const hint = hintFor(value);
      setHint(hint);
      hit.setAttribute('aria-valuenow', value);
      hit.setAttribute('aria-valuetext', `${value}℃、${hint}`);
      marks.forEach((m) => m.classList.toggle('on', Number(m.dataset.v) <= value));
      nums.forEach((n) => n.classList.toggle('on', Number(n.textContent) <= value));
    });
  })();

  // ---------- 3. Cart buttons (Loading to success) ----------
  // Click: the label drops away and the pill closes into a circle with a spinner, then opens
  // into a green pill while the check draws itself. A moment later it returns to the start.
  // Screen readers hear the result through one shared status line.
  const status = document.createElement('p');
  status.className = 'sr';
  status.setAttribute('role', 'status');
  page.appendChild(status);

  page.querySelectorAll('.ja-cta').forEach((btn) => {
    const text = btn.textContent.trim();
    btn.classList.add('cta-motion');
    btn.innerHTML = '<span class="cta__bg" aria-hidden="true"></span>'
      + `<span class="cta__txt">${text}</span>`
      + '<span class="cta__spin" aria-hidden="true"></span>'
      + '<span class="cta__done" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>カートに追加しました</span>';
    const bg = btn.querySelector('.cta__bg');
    const txt = btn.querySelector('.cta__txt');
    const spin = btn.querySelector('.cta__spin');
    const done = btn.querySelector('.cta__done');
    const tick = done.querySelector('path');
    const LEN = 22;
    tick.style.strokeDasharray = LEN;
    // springs from submit.js: width, label, spinner, done label, green, tick
    const Wd = S(0, 300, 22), T = S(1, 400, 30), P = S(0, 300, 28), Dn = S(0, 220, 20), G = S(0, 200, 30), K = S(0, 120, 20);
    let state = 'idle';
    let rot = 0;
    let BW = 0; // button width and height, measured on resize only
    let BH = 0;
    new ResizeObserver(() => {
      BW = btn.clientWidth;
      BH = btn.clientHeight;
      if (state === 'idle') snap(Wd, BW);
      paint();
    }).observe(btn);

    btn.addEventListener('click', () => {
      if (state !== 'idle' || !BW) return;
      state = 'load';
      busy += 1;
      snap(Wd, BW);
      to(T, 0); to(Wd, BH); to(P, 1);
      btn.setAttribute('aria-label', 'カートに追加しています…');
      setTimeout(() => {
        state = 'done';
        busy -= 1;
        to(P, 0); to(Wd, BW); to(G, 1); to(Dn, 1);
        setTimeout(() => to(K, 1), 150);
        btn.setAttribute('aria-label', 'カートに追加しました');
        status.textContent = 'カートに追加しました';
      }, 1600);
      setTimeout(() => {
        to(Dn, 0); to(G, 0); to(K, 0); to(Wd, BW);
        setTimeout(() => { to(T, 1); state = 'idle'; btn.removeAttribute('aria-label'); status.textContent = ''; }, 120);
      }, 3600);
    });
    befores.add((dt) => { if (state === 'load' || P.x > 0.01) rot += dt * 360 * 1.4; });

    renders.add(() => {
      if (!BW) return;
      // scale the full-width pill to width w; a horizontal radius of r / sx keeps the ends round after scaling
      const sx = clamp(Wd.x / BW, 0.02, 1.3);
      const r = BH / 2;
      bg.style.transform = sx === 1 ? '' : `scaleX(${sx.toFixed(4)})`;
      bg.style.borderRadius = sx === 1 ? '' : `${(r / sx).toFixed(2)}px / ${r.toFixed(2)}px`;
      const g = clamp(G.x, 0, 1);
      bg.style.setProperty('--g', `${(g * 100).toFixed(1)}%`);
      txt.style.opacity = clamp(T.x, 0, 1).toFixed(3);
      txt.style.transform = `translateY(${((1 - T.x) * 14).toFixed(2)}px)`;
      spin.style.opacity = clamp(P.x, 0, 1).toFixed(3);
      spin.style.transform = `rotate(${(rot % 360).toFixed(1)}deg) scale(${(0.6 + 0.4 * clamp(P.x, 0, 1.2)).toFixed(3)})`;
      done.style.opacity = clamp(Dn.x, 0, 1).toFixed(3);
      done.style.transform = `translateY(${((1 - Dn.x) * 12).toFixed(2)}px)`;
      tick.style.strokeDashoffset = (LEN * (1 - clamp(K.x, 0, 1))).toFixed(2);
    });
  });

  paint();
})();
