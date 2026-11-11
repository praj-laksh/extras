/* =========================================================
   EDIT THESE SETTINGS
   Leave a value as '' to keep that button or section hidden.
   ========================================================= */
const SITE = {
  email: 'lakshprajwal@gmail.com',
  projects: {
    factor: {
      code: '',     // link to the factor research code, e.g. 'https://github.com/praj-laksh/multi-factor-research'
      results: ''   // e.g. 'Out-of-sample Sharpe ratio of 1.1 and 9% annualised return, 2015–2024.'
    },
    market: {
      code: '',     // link to the stock analysis code
      results: ''   // a sentence or two on what you found
    }
  }
};

(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svgNS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}) => {
    const n = document.createElementNS(svgNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };

  /* ---------- project links and results from settings ---------- */
  Object.entries(SITE.projects).forEach(([key, info]) => {
    if (info.code) document.querySelectorAll(`[data-project-link="${key}"]`).forEach(a => { a.href = info.code; a.hidden = false; });
    if (info.results) {
      const box = document.querySelector(`[data-results="${key}"]`);
      if (box) { box.querySelector('p').textContent = info.results; box.hidden = false; }
    }
  });

  /* ---------- mobile menu (original) ---------- */
  const menu = document.getElementById('menuToggle');
  const links = document.getElementById('navLinks');
  if (menu && links) {
    menu.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      menu.textContent = open ? '×' : '☰';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.textContent = '☰';
    }));
  }

  /* ---------- dark / light theme ---------- */
  const toggle = document.getElementById('themeToggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const syncTheme = () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    if (toggle) toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    if (metaTheme) metaTheme.setAttribute('content', dark ? '#0e181d' : '#f7f8f7');
  };
  syncTheme();
  if (toggle) toggle.addEventListener('click', () => {
    const dark = root.getAttribute('data-theme') !== 'dark';
    if (dark) root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
    toggle.classList.remove('spin'); void toggle.offsetWidth; toggle.classList.add('spin');
    syncTheme();
  });

  /* ---------- scroll progress bar + back-to-top button ---------- */
  const bar = document.getElementById('scrollBar');
  const toTop = document.getElementById('toTop');
  let ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (bar) bar.style.transform = `scaleX(${p})`;
    if (toTop) toTop.classList.toggle('show', window.scrollY > 300);
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- highlight current section in nav ---------- */
  const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const byId = new Map(navAnchors.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        navAnchors.forEach(a => a.classList.remove('is-active'));
        const a = byId.get(e.target.id);
        if (a) a.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- count numbers up from 0 ---------- */
  const counters = [...document.querySelectorAll('[data-count]')];
  const fmt = (n, v) => {
    const d = Number(n.dataset.decimals || 0);
    n.textContent = (n.dataset.prefix || '') + v.toFixed(d) + (n.dataset.suffix || '');
  };
  const runCount = n => {
    if (n.dataset.done) return;
    n.dataset.done = '1';
    const target = Number(n.dataset.count), dur = 1700, start = performance.now();
    const step = now => {
      const t = Math.min(1, (now - start) / dur);
      fmt(n, target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step); else fmt(n, target);
    };
    requestAnimationFrame(step);
  };
  if (!reduceMotion && 'IntersectionObserver' in window) {
    counters.forEach(n => fmt(n, 0));
    const co = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); }
    }), { threshold: .6 });
    counters.forEach(n => co.observe(n));
  }

  /* ---------- candlestick chart in the About banner (illustrative) ---------- */
  const mc = document.getElementById('missionCandles');
  const series = (() => {
    let seed = 20261111;
    const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
    const gauss = () => Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());
    const out = []; let price = 100;
    for (let i = 0; i < 120; i++) {
      const open = price, close = open * (1 + 0.004 + 0.02 * gauss());
      out.push({ open, close, high: Math.max(open, close) * (1 + Math.abs(gauss()) * .008), low: Math.min(open, close) * (1 - Math.abs(gauss()) * .008) });
      price = close;
    }
    return out;
  })();
  let lastW = 0;
  const drawCandles = () => {
    if (!mc) return;
    const W = mc.clientWidth, H = mc.clientHeight;
    if (!W || !H || W === lastW) return;
    lastW = W;
    mc.textContent = '';
    mc.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const stepX = W < 500 ? 10 : 14, n = Math.min(series.length, Math.floor(W / stepX));
    const data = series.slice(series.length - n);
    const hi = Math.max(...data.map(d => d.high)), lo = Math.min(...data.map(d => d.low));
    const y = v => H - 6 - ((v - lo) / (hi - lo)) * (H - 12);
    const bw = Math.max(3, stepX * .55);
    data.forEach((d, i) => {
      const x = i * stepX + stepX / 2;
      const g = el('g', { class: 'candle ' + (d.close >= d.open ? 'up' : 'down'), style: `--i:${i}` });
      g.appendChild(el('line', { class: 'wick', x1: x, x2: x, y1: y(d.high), y2: y(d.low) }));
      const top = y(Math.max(d.open, d.close)), bot = y(Math.min(d.open, d.close));
      g.appendChild(el('rect', { x: x - bw / 2, y: top, width: bw, height: Math.max(1.5, bot - top), rx: 1 }));
      mc.appendChild(g);
    });
    let path = '';
    data.forEach((d, i) => {
      if (i < 7) return;
      const avg = data.slice(i - 7, i + 1).reduce((s, c) => s + c.close, 0) / 8;
      path += (path ? 'L' : 'M') + (i * stepX + stepX / 2).toFixed(1) + ' ' + y(avg).toFixed(1);
    });
    mc.appendChild(el('path', { class: 'ma', d: path, pathLength: 1 }));
  };
  drawCandles();
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(drawCandles, 150); });

  /* ---------- reveal on scroll (original + more elements, staggered) ---------- */
  document.querySelectorAll('.mission,.section-head,.recognition-heading,.awards>div,.credential-list>div,.credentials>div:first-child,.lab-visual,.lab-panel,.contact-grid>div,.contact-form,.hero-left,.hero-right').forEach(n => n.classList.add('reveal'));
  const groups = ['.service-grid', '.education-grid', '.awards', '.credential-list', '.lab-grid', '.contact-grid', '.hero'];
  groups.forEach(sel => document.querySelectorAll(sel).forEach(g => {
    [...g.children].forEach((c, i) => { c.style.transitionDelay = (i * 0.09) + 's'; });
  }));
  const items = document.querySelectorAll('.service-card,.job,.project-feature,.project-secondary,.education-card,.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
          // clear stagger delay afterwards so hover effects stay snappy
          setTimeout(() => { entry.target.style.transitionDelay = ''; }, 1500);
        }
      });
    }, { threshold: .12 });
    items.forEach(item => observer.observe(item));
  } else items.forEach(item => item.classList.add('in-view'));

  /* ---------- 3D tilt on project visuals ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('mouseenter', () => card.classList.add('tilting'));
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        setTimeout(() => card.classList.remove('tilting'), 150);
      });
    });
  }

  /* ---------- portfolio optimizer ---------- */
  const frontier = document.getElementById('frontier');
  if (frontier) {
    const assets = [
      { name: 'Equities', mu: .08, sd: .16, color: '#2a9eaa' },
      { name: 'Bonds', mu: .035, sd: .06, color: '#b5a9ff' },
      { name: 'Commodities', mu: .05, sd: .18, color: '#e8b07a' }
    ];
    const corr = [[1, .1, .3], [.1, 1, 0], [.3, 0, 1]], rf = .02;
    const cov = corr.map((r, i) => r.map((c, j) => c * assets[i].sd * assets[j].sd));
    const stats = w => {
      let mu = 0, v = 0;
      for (let i = 0; i < 3; i++) { mu += w[i] * assets[i].mu; for (let j = 0; j < 3; j++) v += w[i] * w[j] * cov[i][j]; }
      return { w, mu, v, sd: Math.sqrt(v) };
    };
    const grid = s => { const p = []; for (let i = 0; i <= s; i++) for (let j = 0; j <= s - i; j++) p.push(stats([i / s, j / s, (s - i - j) / s])); return p; };
    const fine = grid(200), cloud = grid(36);
    const sorted = [...fine].sort((a, b) => a.sd - b.sd), eff = [];
    let best = -Infinity;
    sorted.forEach(p => { if (p.mu > best + 1e-7) { eff.push(p); best = p.mu; } });
    const tan = fine.reduce((a, b) => ((b.mu - rf) / b.sd > (a.mu - rf) / a.sd ? b : a));
    const S = (tan.mu - rf) / tan.sd;

    const W = 640, H = 400, m = { l: 56, r: 22, t: 16, b: 50 }, X1 = .2, Y0 = .02, Y1 = .09;
    const sx = v => m.l + (v / X1) * (W - m.l - m.r);
    const sy = v => H - m.b - ((v - Y0) / (Y1 - Y0)) * (H - m.t - m.b);
    for (let v = 0; v <= .2001; v += .05) {
      frontier.appendChild(el('line', { class: 'gridline', x1: sx(v), x2: sx(v), y1: m.t, y2: H - m.b }));
      const t = el('text', { class: 'tick', x: sx(v), y: H - m.b + 20, 'text-anchor': 'middle' }); t.textContent = Math.round(v * 100) + '%'; frontier.appendChild(t);
    }
    for (let v = .02; v <= .0901; v += .01) {
      frontier.appendChild(el('line', { class: 'gridline', x1: m.l, x2: W - m.r, y1: sy(v), y2: sy(v) }));
      const t = el('text', { class: 'tick', x: m.l - 10, y: sy(v) + 4, 'text-anchor': 'end' }); t.textContent = Math.round(v * 100) + '%'; frontier.appendChild(t);
    }
    const xt = el('text', { class: 'axis-title', x: (m.l + W - m.r) / 2, y: H - 8, 'text-anchor': 'middle' }); xt.textContent = 'VOLATILITY (RISK)';
    const yc = (m.t + H - m.b) / 2;
    const yt = el('text', { class: 'axis-title', x: 14, y: yc, 'text-anchor': 'middle', transform: `rotate(-90 14 ${yc})` }); yt.textContent = 'EXPECTED RETURN';
    frontier.append(xt, yt);
    const gc = el('g');
    cloud.forEach(p => gc.appendChild(el('circle', { class: 'cloud', cx: sx(p.sd).toFixed(1), cy: sy(p.mu).toFixed(1), r: 2.2 })));
    frontier.appendChild(gc);
    const xEnd = Math.min(X1, (Y1 - rf) / S);
    frontier.appendChild(el('line', { class: 'cml', x1: sx(0), y1: sy(rf), x2: sx(xEnd), y2: sy(rf + S * xEnd) }));
    frontier.appendChild(el('path', { class: 'frontier-line', pathLength: 1, d: eff.map((p, i) => (i ? 'L' : 'M') + sx(p.sd).toFixed(1) + ' ' + sy(p.mu).toFixed(1)).join('') }));
    const offs = [[-10, -10, 'end'], [10, 16, 'start'], [-10, 18, 'end']];
    assets.forEach((a, i) => {
      frontier.appendChild(el('circle', { class: 'asset-dot', cx: sx(a.sd), cy: sy(a.mu), r: 3.5 }));
      const l = el('text', { class: 'asset-label', x: sx(a.sd) + offs[i][0], y: sy(a.mu) + offs[i][1], 'text-anchor': offs[i][2] }); l.textContent = a.name; frontier.appendChild(l);
    });
    const tx = sx(tan.sd), ty = sy(tan.mu), d = 7;
    frontier.appendChild(el('path', { class: 'sharpe', d: `M${tx} ${ty - d}L${tx + d} ${ty}L${tx} ${ty + d}L${tx - d} ${ty}Z` }));
    const pr = el('circle', { class: 'pick-ring', r: 13 }), pk = el('circle', { class: 'pick', r: 7 });
    frontier.append(pr, pk);

    const slider = document.getElementById('riskSlider');
    const bar2 = document.getElementById('allocBar'), list = document.getElementById('allocList');
    bar2.innerHTML = assets.map(a => `<span style="background:${a.color}"></span>`).join('');
    list.innerHTML = assets.map(a => `<li><i style="background:${a.color}"></i><span>${a.name}</span><b>0%</b></li>`).join('');
    const segs = bar2.querySelectorAll('span'), pcts = list.querySelectorAll('b');
    const pct = v => (v * 100).toFixed(1) + '%';
    const update = () => {
      const s = Number(slider.value) / 100;
      const lambda = Math.exp(Math.log(40) + (Math.log(1.2) - Math.log(40)) * s);
      let bp = fine[0], bu = -Infinity;
      for (const p of fine) { const u = p.mu - .5 * lambda * p.v; if (u > bu) { bu = u; bp = p; } }
      ['cx', 'cy'].forEach((k, i) => { const v = i ? sy(bp.mu) : sx(bp.sd); pk.setAttribute(k, v); pr.setAttribute(k, v); });
      document.getElementById('statRet').textContent = pct(bp.mu);
      document.getElementById('statVol').textContent = pct(bp.sd);
      document.getElementById('statSharpe').textContent = ((bp.mu - rf) / bp.sd).toFixed(2);
      bp.w.forEach((w, i) => { segs[i].style.width = w * 100 + '%'; pcts[i].textContent = Math.round(w * 100) + '%'; });
      slider.setAttribute('aria-valuetext', assets.map((a, i) => `${a.name} ${Math.round(bp.w[i] * 100)}%`).join(', ') + `. Expected return ${pct(bp.mu)}, volatility ${pct(bp.sd)}.`);
    };
    slider.addEventListener('input', update);
    update();
  }

  /* ---------- project detail windows ---------- */
  document.querySelectorAll('[data-open]').forEach(btn => {
    const dlg = document.getElementById(btn.dataset.open);
    if (dlg && typeof dlg.showModal === 'function') btn.addEventListener('click', () => dlg.showModal());
  });
  document.querySelectorAll('dialog.dlg').forEach(dlg => {
    dlg.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dlg.close()));
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  });

  /* ---------- footer year (original) ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- contact form (original, new email) ---------- */
  const form = document.getElementById('contactForm');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nReply email: ${email}`);
    const note = document.getElementById('formNote');
    if (note) note.textContent = 'Your email application should open with the message prepared. Please review and send it there.';
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
  });
})();
