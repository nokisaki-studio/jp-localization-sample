(() => {
  'use strict';

  // Notes are matched to elements by data-pin. Numbers follow page order.
  const NOTES = {
    literal: [
      { pin: 'lit-headline', title: 'Correct translation, wrong effect',
        body: '「本気で淹れよう。」 is an accurate translation of “Brew like you mean it.”, but in Japanese it reads as a blunt order rather than a confident slogan. The Latin display font has no Japanese glyphs either, so the headline falls back to a system font.' },
      { pin: 'lit-price', title: 'Dollars, without tax',
        body: 'A USD price signals import hassle and unknown fees. Japan also requires consumer prices to be shown tax-inclusive (総額表示). Translation can’t choose a yen price point.' },
      { pin: 'lit-fahrenheit', title: 'Fahrenheit',
        body: 'Japan uses Celsius. 「140°F〜212°F」 means nothing to Japanese buyers, and “1度単位” now refers to Fahrenheit degrees.' },
      { pin: 'lit-detail', title: 'Too little information',
        body: '“Boils in about 4 minutes” — for how much water? Minimal copy works in the US; translated as-is, it reads as “information missing” to many Japanese shoppers.' },
      { pin: 'lit-review', title: 'Social proof that doesn’t land',
        body: 'One quote from a stranger in Portland, set in italics. Japanese typefaces have no true italics, so the browser slants them artificially. Japanese shoppers look for many reviews from people like them.' },
      { pin: 'lit-120v', title: 'Wrong voltage: a product problem',
        body: 'Japan’s grid is 100 V. Copy can’t fix this: the product needs a 100 V model with a PSE mark before it can be sold in Japan.' },
      { pin: 'lit-story', title: 'A story written for someone else',
        body: 'The garage-startup story sells to Americans. Japanese buyers want to know why this brand understands their coffee culture, and who supports the product in Japan.' },
      { pin: 'lit-pay', title: 'No payment or delivery details',
        body: 'Nothing says the buyer can pay at a convenience store, with PayPay or later, or when the kettle will arrive. Many Japanese shoppers check this before they click.' },
      { pin: 'lit-footer', title: 'Missing legal disclosure',
        body: 'Japanese online stores must publish seller details and return terms (特定商取引法に基づく表記). A translation never adds what the original didn’t have.' },
    ],
    localized: [
      { pin: 'ja-ship', title: 'Delivery in Japanese terms',
        from: 'Free shipping on orders over $50', to: '5,500円以上で送料無料｜最短翌日お届け',
        body: 'A yen threshold, the earliest delivery date and time-slot selection: the things Japanese buyers compare between shops.' },
      { pin: 'ja-headline', title: 'Promise a result, not an attitude',
        from: 'Brew like you mean it.', to: 'その一杯を、1℃で仕上げる。',
        body: 'Japanese product headlines tend to lead with a concrete benefit and a number. The attitude moves into the brand story.' },
      { pin: 'ja-type', title: 'Typography built for Japanese',
        body: 'Japanese typefaces, line height around 1.8, no italics or all-caps, and phrase-aware line breaks (word-break: auto-phrase) so lines don’t split mid-word. A narrow, mobile-first column with a sticky buy bar.' },
      { pin: 'ja-pse', title: 'Localization found a product requirement',
        from: '120 V', to: 'AC100V・PSE適合',
        body: 'Electric kettles sold in Japan need a 100 V design and the PSE mark (Electrical Appliance and Material Safety Act). Catching this early saves a failed launch.' },
      { pin: 'ja-price', title: 'A yen price point, tax included',
        from: '$129', to: '19,800円（税込）',
        body: 'Set as a Japanese price point rather than an exchange-rate conversion, and shown tax-inclusive as Japan’s total-price display rule requires.' },
      { pin: 'ja-pay', title: 'Payment options before the click',
        body: 'Cards alone aren’t enough. Convenience-store payment, PayPay, Amazon Pay and pay-later sit right under the price, where Japanese shoppers look for them.' },
      { pin: 'ja-problem', title: 'Problem first, then product',
        body: 'Japanese landing pages commonly open with the reader’s frustrations (お悩み) and only then introduce the solution.' },
      { pin: 'ja-detail', title: 'More detail, not less',
        from: 'Boils in about 4 minutes.', to: '800mlが約4分で沸騰',
        body: 'Exact ranges in Celsius, nozzle width, boil time for a stated volume, safety features. Copy that feels clean in English can read as “information missing” in Japan.' },
      { pin: 'ja-try', title: 'Let buyers try the main feature',
        from: 'Dial it in', to: '豆に合わせて、温度を選ぶ',
        body: 'The 1℃ control is the reason to buy, so readers can drag a temperature slider and see which beans or teas each setting suits. The color switch and the cart buttons answer with spring motion too. It all works with a keyboard and calms down for visitors who ask for reduced motion.' },
      { pin: 'ja-compare', title: 'Comparison table',
        body: 'A side-by-side table against ordinary kettles is a staple of Japanese product pages.' },
      { pin: 'ja-reviews', title: 'Reviews in the local format',
        from: '— Sarah K., Portland, OR', to: '30代・女性・東京都',
        body: 'Age range, gender and prefecture instead of a first name and city, plus an average with a review count. A 4-star review with a small complaint adds credibility.' },
      { pin: 'ja-gift', title: 'Gift wrapping and noshi',
        body: 'Kettles are popular gifts for housewarmings, weddings and return gifts. Free wrapping and noshi paper are options buyers look for.' },
      { pin: 'ja-story', title: 'Story re-angled for Japan',
        from: 'Born in Portland. Built for the obsessed.', to: '日本の喫茶文化に学んだケトル',
        body: 'The garage-startup story matters less here than the brand’s respect for Japan’s own hand-drip coffee culture.' },
      { pin: 'ja-support', title: 'Local support and invoices',
        body: 'Support hours in Japan, a warranty handled in Japan, and receipts that meet the qualified invoice system (適格請求書, in force since October 2023), so business buyers can claim tax credits.' },
      { pin: 'ja-faq', title: 'An FAQ for imported products',
        body: 'Answers the questions Japanese buyers ask about overseas brands: voltage, warranty, receipts, delivery time and returns.' },
      { pin: 'ja-line', title: 'LINE instead of an email list',
        body: 'LINE is Japan’s main messaging app. Brands use LINE official accounts for coupons and customer questions.' },
      { pin: 'ja-tokusho', title: 'Legally required seller disclosure',
        body: 'Online stores in Japan must publish seller details, prices, fees, delivery timing and return terms (特定商取引法に基づく表記). Without a stated return policy, mail-order buyers get a statutory 8-day return right.' },
    ],
  };

  const VIEWS = ['original', 'literal', 'localized'];
  const body = document.body;
  const bar = document.querySelector('.demo-bar');
  const pageEn = document.getElementById('page-en');
  const pageJa = document.getElementById('page-ja');
  const notesEl = document.getElementById('notes');
  const notesHead = notesEl.querySelector('.notes__head');
  const listEl = notesEl.querySelector('.notes__list');
  const titleEl = notesEl.querySelector('.notes__title');
  const toggleBtn = document.querySelector('.notes-toggle');
  const countEl = document.querySelector('.notes-count');
  const backdrop = document.querySelector('.sheet-backdrop');
  const toastEl = document.querySelector('.toast');
  const desktop = window.matchMedia('(min-width: 1100px)');
  const pinOf = new Map();
  let currentView = null;

  // Keep the English text so the page can switch back from the translation.
  pageEn.querySelectorAll('[data-lit]').forEach((el) => { el.dataset.en = el.innerHTML; });

  // Create the numbered pins.
  for (const view of ['literal', 'localized']) {
    const root = view === 'literal' ? pageEn : pageJa;
    const byPin = new Map(NOTES[view].map((n) => [n.pin, n]));
    const els = [...root.querySelectorAll('[data-pin]')].filter((el) => byPin.has(el.dataset.pin));
    els.forEach((el, i) => {
      const note = byPin.get(el.dataset.pin);
      note.n = i + 1;
      note.el = el;
      el.classList.add('has-pin');
      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = `pin pin--${view === 'literal' ? 'lit' : 'ja'}`;
      pin.textContent = String(i + 1);
      pin.setAttribute('aria-label', `Note ${i + 1}: ${note.title}`);
      pin.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        activate(note, false);
      });
      // A closed <details> hides everything except its <summary>.
      (el.tagName === 'DETAILS' ? el.querySelector('summary') : el).appendChild(pin);
      pinOf.set(el, pin);
    });
    NOTES[view] = NOTES[view].filter((n) => n.el).sort((a, b) => a.n - b.n);
  }

  function renderNotes(view) {
    const notes = NOTES[view] || [];
    listEl.innerHTML = '';
    countEl.textContent = notes.length ? `(${notes.length})` : '';
    titleEl.textContent = view === 'literal' ? 'Why the translation underperforms'
      : view === 'localized' ? 'What changed, and why' : 'Notes';
    const kind = view === 'literal' ? 'lit' : 'ja';
    for (const note of notes) {
      const li = document.createElement('li');
      li.className = `note note--${kind}`;
      li.tabIndex = 0;
      const diff = note.from
        ? `<p class="note__diff"><span class="from">${note.from}</span><span class="to" lang="ja">${note.to}</span></p>`
        : '';
      li.innerHTML = `<span class="note__num">${note.n}</span><div><h3>${note.title}</h3>${diff}<p>${note.body}</p></div>`;
      li.addEventListener('click', () => activate(note, true));
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(note, true); }
      });
      note.li = li;
      listEl.appendChild(li);
    }
  }

  function activate(note, fromList) {
    document.querySelectorAll('.pin.is-active, .note.is-active').forEach((x) => x.classList.remove('is-active'));
    note.li.classList.add('is-active');
    pinOf.get(note.el).classList.add('is-active');
    if (fromList) {
      if (!desktop.matches) closeSheet();
      note.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      note.el.classList.remove('flash');
      void note.el.offsetWidth; // restart the animation
      note.el.classList.add('flash');
    } else {
      if (desktop.matches) {
        body.classList.remove('notes-off');
        syncToggle();
      } else {
        openSheet();
      }
      requestAnimationFrame(() => {
        notesEl.scrollTo({ top: note.li.offsetTop - notesHead.offsetHeight - 8, behavior: 'smooth' });
      });
    }
  }

  function openSheet() {
    notesEl.classList.add('open');
    backdrop.hidden = false;
    syncToggle();
  }
  function closeSheet() {
    notesEl.classList.remove('open');
    backdrop.hidden = true;
    syncToggle();
  }
  function syncToggle() {
    const open = desktop.matches ? !body.classList.contains('notes-off') : notesEl.classList.contains('open');
    toggleBtn.setAttribute('aria-expanded', String(open));
  }

  function setView(view) {
    if (!VIEWS.includes(view)) view = 'original';
    if (view === currentView) return;
    currentView = view;
    body.dataset.view = view;
    const literal = view === 'literal';
    pageEn.hidden = view === 'localized';
    pageJa.hidden = view !== 'localized';
    pageEn.lang = literal ? 'ja' : 'en';
    pageEn.querySelectorAll('[data-lit]').forEach((el) => {
      el.innerHTML = literal ? el.dataset.lit : el.dataset.en;
      const pin = pinOf.get(el);
      if (pin) el.appendChild(pin);
    });
    document.querySelectorAll('.view-switch button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.view === view));
    });
    document.querySelectorAll('[data-caption]').forEach((p) => { p.hidden = p.dataset.caption !== view; });
    renderNotes(view);
    closeSheet();
    syncBarHeight();
    if (location.hash.slice(1) !== view) history.replaceState(null, '', `#${view}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function toast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { toastEl.hidden = true; }, 2600);
  }

  function syncBarHeight() {
    document.documentElement.style.setProperty('--bar-h', `${bar.offsetHeight}px`);
  }

  // Events
  document.querySelectorAll('.view-switch button, [data-go]').forEach((b) => {
    b.addEventListener('click', () => setView(b.dataset.view || b.dataset.go));
  });
  toggleBtn.addEventListener('click', () => {
    if (desktop.matches) {
      body.classList.toggle('notes-off');
      syncToggle();
    } else if (notesEl.classList.contains('open')) {
      closeSheet();
    } else {
      openSheet();
    }
  });
  notesEl.querySelector('.notes__close').addEventListener('click', closeSheet);
  backdrop.addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
  document.addEventListener('click', (e) => {
    const demo = e.target.closest('[data-demo]');
    if (!demo) return;
    e.preventDefault();
    toast('Demo only: Tidewell is a fictional brand.');
  });
  window.addEventListener('hashchange', () => setView(location.hash.slice(1)));
  window.addEventListener('resize', syncBarHeight);
  desktop.addEventListener('change', () => { closeSheet(); syncToggle(); });

  syncBarHeight();
  setView(location.hash.slice(1));
})();
