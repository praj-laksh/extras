/* =========================================================
   EDIT THESE SETTINGS
   Anything left as '' stays hidden on the site, so there are
   never broken links. Paste a full URL to make it appear.
   ========================================================= */
const SITE = {
  linkedin: '',                              // e.g. 'https://www.linkedin.com/in/your-profile/'
  github: 'https://github.com/praj-laksh',   // your GitHub profile

  projects: {
    factor: {
      code: '',      // link to the factor research repository
      results: ''    // e.g. 'Out-of-sample Sharpe ratio of 1.1 and 9% annualised return from 2015 to 2024.'
    },
    market: {
      code: '',      // link to the stock analysis repository
      results: ''    // a sentence or two on what you found
    }
  }
};

(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svgNS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}) => {
    const node = document.createElementNS(svgNS, tag);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  };

  /* ---------- links from settings ---------- */
  ['linkedin', 'github'].forEach(key => {
    const url = SITE[key];
    document.querySelectorAll(`[data-link="${key}"]`).forEach(node => {
      if (!url) return;
      node.hidden = false;
      const a = node.tagName === 'A' ? node : node.querySelector('a');
      if (a) a.href = url;
    });
  });
  Object.entries(SITE.projects).forEach(([key, info]) => {
    if (info.code) {
      document.querySelectorAll(`[data-project-link="${key}"]`).forEach(a => {
        a.href = info.code;
        a.hidden = false;
      });
    }
    if (info.results) {
      const box = document.querySelector(`[data-results="${key}"]`);
      if (box) {
        box.querySelector('p').textContent = info.results;
        box.hidden = false;
      }
    }
  });

  /* ---------- mobile menu ---------- */
  const menu = document.getElementById('menuToggle');
  const links = document.getElementById('navLinks');
  const setMenu = open => {
    links.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  if (menu && links) {
    menu.addEventListener('click', () => setMenu(!links.classList.contains('open')));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && links.classList.contains('open')) { setMenu(false); menu.focus(); }
    });
  }

  /* ---------- light / dark theme ---------- */
  const toggle = document.getElementById('themeToggle');
  const currentTheme = () => root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const labelToggle = () => {
    if (toggle) toggle.setAttribute('aria-label', currentTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  };
  if (toggle) {
    labelToggle();
    toggle.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      labelToggle();
    });
  }

  /* ---------- highlight current section in the nav ---------- */
  const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')].filter(a => !a.classList.contains('nav-cta'));
  if ('IntersectionObserver' in window) {
    const byId = new Map(navAnchors.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(a => a.classList.remove('is-active'));
        const a = byId.get(entry.target.id);
        if (a) a.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- hero candlestick strip (illustrative) ---------- */
  const candles = document.getElementById('candles');
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const series = (() => {
    const rand = mulberry32(20261111);
    const gauss = () => {
      let u = 0, v = 0;
      while (u === 0) u = rand();
      while (v === 0) v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    const out = [];
    let price = 100;
    for (let i = 0; i < 160; i++) {
      const open = price;
      const close = open * (1 + 0.0035 + 0.018 * gauss());
      const high = Math.max(open, close) * (1 + Math.abs(gauss()) * 0.007);
      const low = Math.min(open, close) * (1 - Math.abs(gauss()) * 0.007);
      out.push({ open, close, high, low });
      price = close;
    }
    return out;
  })();
  let lastCandleWidth = 0;
  function drawCandles(animate) {
    if (!candles) return;
    const W = candles.clientWidth, H = candles.clientHeight;
    if (!W || !H || W === lastCandleWidth) return;
    lastCandleWidth = W;
    candles.textContent = '';
    candles.setAttribute('viewBox', `0 0 ${W} ${H}`);
    candles.classList.toggle('static', !animate || reduceMotion);
    const step = W < 600 ? 10 : 14;
    const n = Math.min(series.length, Math.floor(W / step));
    const data = series.slice(series.length - n);
    const hi = Math.max(...data.map(d => d.high)), lo = Math.min(...data.map(d => d.low));
    const y = v => H - 4 - ((v - lo) / (hi - lo)) * (H - 8);
    const bw = Math.max(3, step * 0.55);
    data.forEach((d, i) => {
      const x = i * step + step / 2;
      const g = el('g', { class: 'candle ' + (d.close >= d.open ? 'up' : 'down'), style: `--i:${i}` });
      g.appendChild(el('line', { class: 'wick', x1: x, x2: x, y1: y(d.high), y2: y(d.low) }));
      const top = y(Math.max(d.open, d.close)), bot = y(Math.min(d.open, d.close));
      g.appendChild(el('rect', { class: 'body', x: x - bw / 2, y: top, width: bw, height: Math.max(1.5, bot - top) }));
      candles.appendChild(g);
    });
    const period = 8;
    let path = '';
    data.forEach((d, i) => {
      if (i < period - 1) return;
      const avg = data.slice(i - period + 1, i + 1).reduce((s, c) => s + c.close, 0) / period;
      path += (path ? 'L' : 'M') + (i * step + step / 2).toFixed(1) + ' ' + y(avg).toFixed(1);
    });
    candles.appendChild(el('path', { class: 'ma', d: path, pathLength: 1 }));
  }
  drawCandles(true);
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => drawCandles(false), 150);
  });

  /* ---------- counting figures in the hero ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const formatCount = (node, v) => {
    const dec = Number(node.dataset.decimals || 0);
    node.textContent = (node.dataset.prefix || '') + v.toFixed(dec) + (node.dataset.suffix || '');
  };
  if (!reduceMotion && counters.length) {
    counters.forEach(n => formatCount(n, 0));
    const start = performance.now() + 250, dur = 1400;
    const tick = now => {
      const t = Math.min(1, Math.max(0, (now - start) / dur));
      const e = 1 - Math.pow(1 - t, 3);
      counters.forEach(n => formatCount(n, Number(n.dataset.count) * e));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- illustrative correlation matrix ---------- */
  const corrGrid = document.getElementById('corrGrid');
  if (corrGrid) {
    const M = [
      [1, .62, .48, .35, .22, .41],
      [.62, 1, .55, .30, .18, .37],
      [.48, .55, 1, .44, .27, .52],
      [.35, .30, .44, 1, .60, .33],
      [.22, .18, .27, .60, 1, .25],
      [.41, .37, .52, .33, .25, 1]
    ];
    const lo = [234, 240, 255], hiC = [31, 73, 216];
    M.forEach(row => row.forEach(v => {
      const t = Math.pow(v, 1.2);
      const c = lo.map((a, i) => Math.round(a + (hiC[i] - a) * t));
      const cell = document.createElement('span');
      cell.style.background = `rgb(${c.join(',')})`;
      cell.style.color = t > .5 ? '#FFFFFF' : '#1B2A44';
      cell.textContent = v === 1 ? '1' : v.toFixed(2).replace(/^0/, '');
      corrGrid.appendChild(cell);
    }));
  }

  /* ---------- portfolio optimizer ---------- */
  const frontier = document.getElementById('frontier');
  if (frontier) {
    const assets = [
      { name: 'Equities', mu: 0.08, sd: 0.16, color: '#1F49D8' },
      { name: 'Bonds', mu: 0.035, sd: 0.06, color: '#8FB0FF' },
      { name: 'Commodities', mu: 0.05, sd: 0.18, color: '#0E9F6E' }
    ];
    const corr = [[1, .1, .3], [.1, 1, 0], [.3, 0, 1]];
    const rf = 0.02;
    const cov = corr.map((row, i) => row.map((c, j) => c * assets[i].sd * assets[j].sd));
    const stats = w => {
      let mu = 0, v = 0;
      for (let i = 0; i < 3; i++) {
        mu += w[i] * assets[i].mu;
        for (let j = 0; j < 3; j++) v += w[i] * w[j] * cov[i][j];
      }
      return { w, mu, sd: Math.sqrt(v), v };
    };
    const grid = steps => {
      const pts = [];
      for (let i = 0; i <= steps; i++) for (let j = 0; j <= steps - i; j++) {
        pts.push(stats([i / steps, j / steps, (steps - i - j) / steps]));
      }
      return pts;
    };
    const fine = grid(200);
    const cloud = grid(36);

    // efficient frontier: running maximum of return as volatility rises
    const sorted = [...fine].sort((a, b) => a.sd - b.sd);
    const eff = [];
    let best = -Infinity;
    sorted.forEach(p => { if (p.mu > best + 1e-7) { eff.push(p); best = p.mu; } });

    const tangency = fine.reduce((a, b) => ((b.mu - rf) / b.sd > (a.mu - rf) / a.sd ? b : a));
    const maxSharpe = (tangency.mu - rf) / tangency.sd;

    // chart geometry
    const W = 640, H = 400, m = { l: 56, r: 22, t: 18, b: 50 };
    const X0 = 0, X1 = 0.20, Y0 = 0.02, Y1 = 0.09;
    const sx = v => m.l + ((v - X0) / (X1 - X0)) * (W - m.l - m.r);
    const sy = v => H - m.b - ((v - Y0) / (Y1 - Y0)) * (H - m.t - m.b);

    const gAxis = el('g', { class: 'axis' });
    for (let v = 0; v <= 0.2001; v += 0.05) {
      gAxis.appendChild(el('line', { class: 'gridline', x1: sx(v), x2: sx(v), y1: m.t, y2: H - m.b }));
      const t = el('text', { class: 'tick', x: sx(v), y: H - m.b + 20, 'text-anchor': 'middle' });
      t.textContent = Math.round(v * 100) + '%';
      gAxis.appendChild(t);
    }
    for (let v = 0.02; v <= 0.0901; v += 0.01) {
      gAxis.appendChild(el('line', { class: 'gridline', x1: m.l, x2: W - m.r, y1: sy(v), y2: sy(v) }));
      const t = el('text', { class: 'tick', x: m.l - 10, y: sy(v) + 4, 'text-anchor': 'end' });
      t.textContent = Math.round(v * 100) + '%';
      gAxis.appendChild(t);
    }
    const xt = el('text', { class: 'axis-title', x: (m.l + W - m.r) / 2, y: H - 8, 'text-anchor': 'middle' });
    xt.textContent = 'Volatility (risk)';
    const yt = el('text', { class: 'axis-title', x: 14, y: (m.t + H - m.b) / 2, 'text-anchor': 'middle', transform: `rotate(-90 14 ${(m.t + H - m.b) / 2})` });
    yt.textContent = 'Expected annual return';
    gAxis.append(xt, yt);
    frontier.appendChild(gAxis);

    const gCloud = el('g');
    cloud.forEach(p => gCloud.appendChild(el('circle', { class: 'cloud', cx: sx(p.sd).toFixed(1), cy: sy(p.mu).toFixed(1), r: 2.2 })));
    frontier.appendChild(gCloud);

    // capital market line
    const xEnd = Math.min(X1, (Y1 - rf) / maxSharpe);
    frontier.appendChild(el('line', { class: 'cml', x1: sx(0), y1: sy(rf), x2: sx(xEnd), y2: sy(rf + maxSharpe * xEnd) }));

    frontier.appendChild(el('path', {
      class: 'frontier-line',
      d: eff.map((p, i) => (i ? 'L' : 'M') + sx(p.sd).toFixed(1) + ' ' + sy(p.mu).toFixed(1)).join('')
    }));

    assets.forEach((a, i) => {
      frontier.appendChild(el('circle', { class: 'asset-dot', cx: sx(a.sd), cy: sy(a.mu), r: 3.5 }));
      const offsets = [[-10, -10, 'end'], [10, 16, 'start'], [-10, 18, 'end']];
      const lab = el('text', { class: 'asset-label', x: sx(a.sd) + offsets[i][0], y: sy(a.mu) + offsets[i][1], 'text-anchor': offsets[i][2] });
      lab.textContent = a.name;
      frontier.appendChild(lab);
    });

    const tx = sx(tangency.sd), ty = sy(tangency.mu), s = 7;
    frontier.appendChild(el('path', { class: 'sharpe', d: `M${tx} ${ty - s}L${tx + s} ${ty}L${tx} ${ty + s}L${tx - s} ${ty}Z` }));

    const ring = el('circle', { class: 'pick-ring', r: 13 });
    const pick = el('circle', { class: 'pick', r: 7 });
    frontier.append(ring, pick);

    // panel
    const slider = document.getElementById('riskSlider');
    const out = {
      ret: document.getElementById('statRet'),
      vol: document.getElementById('statVol'),
      sharpe: document.getElementById('statSharpe'),
      bar: document.getElementById('allocBar'),
      list: document.getElementById('allocList')
    };
    out.bar.innerHTML = assets.map(a => `<span style="background:${a.color}"></span>`).join('');
    out.list.innerHTML = assets.map(a => `<li><i style="background:${a.color}"></i><span>${a.name}</span><b>0%</b></li>`).join('');
    const segs = out.bar.querySelectorAll('span');
    const pcts = out.list.querySelectorAll('b');
    const pct = v => (v * 100).toFixed(1) + '%';

    const update = () => {
      const s01 = Number(slider.value) / 100;
      const lambda = Math.exp(Math.log(40) + (Math.log(1.2) - Math.log(40)) * s01);
      let bestP = fine[0], bestU = -Infinity;
      for (const p of fine) {
        const u = p.mu - 0.5 * lambda * p.v;
        if (u > bestU) { bestU = u; bestP = p; }
      }
      const cx = sx(bestP.sd), cy = sy(bestP.mu);
      pick.setAttribute('cx', cx); pick.setAttribute('cy', cy);
      ring.setAttribute('cx', cx); ring.setAttribute('cy', cy);
      out.ret.textContent = pct(bestP.mu);
      out.vol.textContent = pct(bestP.sd);
      out.sharpe.textContent = ((bestP.mu - rf) / bestP.sd).toFixed(2);
      bestP.w.forEach((w, i) => {
        segs[i].style.width = (w * 100) + '%';
        pcts[i].textContent = Math.round(w * 100) + '%';
      });
      slider.setAttribute('aria-valuetext',
        assets.map((a, i) => `${a.name} ${Math.round(bestP.w[i] * 100)}%`).join(', ') +
        `. Expected return ${pct(bestP.mu)}, volatility ${pct(bestP.sd)}.`);
    };
    slider.addEventListener('input', update);
    update();
  }

  /* ---------- project dialogs ---------- */
  document.querySelectorAll('[data-open]').forEach(btn => {
    const dlg = document.getElementById(btn.dataset.open);
    if (!dlg || typeof dlg.showModal !== 'function') return;
    btn.addEventListener('click', () => dlg.showModal());
  });
  document.querySelectorAll('dialog.dlg').forEach(dlg => {
    dlg.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dlg.close()));
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  });

  /* ---------- contact form (opens the visitor's email app) ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    const note = document.getElementById('formNote');
    const defaultNote = note ? note.textContent : '';
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fields = [...form.querySelectorAll('input, textarea')];
      let firstBad = null;
      fields.forEach(f => {
        const bad = !f.checkValidity();
        f.setAttribute('aria-invalid', String(bad));
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) {
        const label = form.querySelector(`label[for="${firstBad.id}"]`);
        const what = label ? label.textContent.toLowerCase() : 'this field';
        note.textContent = firstBad.type === 'email' && firstBad.value
          ? 'Enter an email address like name@example.com.'
          : `Add your ${what} to continue.`;
        note.classList.add('is-error');
        firstBad.focus();
        return;
      }
      const data = new FormData(form);
      const name = String(data.get('name')).trim();
      const email = String(data.get('email')).trim();
      const message = String(data.get('message')).trim();
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nReply to: ${email}`);
      note.classList.remove('is-error');
      note.textContent = 'Your email app should open with the message ready. Check it and press send.';
      window.location.href = `mailto:lakshminath.p@northeastern.edu?subject=${subject}&body=${body}`;
    });
    form.addEventListener('input', e => {
      if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) {
        e.target.setAttribute('aria-invalid', 'false');
        if (!form.querySelector('[aria-invalid="true"]')) { note.textContent = defaultNote; note.classList.remove('is-error'); }
      }
    });
  }

  /* ---------- footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
