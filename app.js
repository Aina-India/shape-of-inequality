window.onerror = function (m, s, l) { var d = document.getElementById('err'); if (d) { d.style.display = 'block'; d.textContent = 'Script error: ' + m + (l ? (' (line ' + l + ')') : ''); } return false; };

// billionaire-raj · app.js
// All chart data lives in data/data.json — update there, not here.

let D = {}; // global data store, populated after fetch

async function loadData() {
  const res = await fetch('data/data.json');
  D = await res.json();
}

function initDashboard() {
  const COLORS = { '--paper': '#f6f1e7', '--ink': '#1c1a17', '--muted': '#6f675a', '--rule': '#d9d0bf', '--inc': '#5b6b73', '--tax': '#2f6f95', '--evad': '#b3361f', '--you': '#1c1a17', '--it1': '#1f4d68', '--it2': '#3f7fa5', '--it3': '#9cc0d6', '--gst': '#d98a18', '--corp': '#3f8f5b', '--exc': '#7a6f63', '--cus': '#c9a14a', '--svc': '#4a8f8f', '--low': '#3f8f5b', '--mid': '#2f6f95', '--avg': '#7a6f63', '--top': '#d98a18', '--apex': '#b3361f', '--t1': '#7e3f9e' };
  const css = v => COLORS[v] || '#000';
  const tip = document.getElementById('tip');
  function showTip(e, h) { tip.innerHTML = h; tip.style.opacity = 1; mv(e); }
  function mv(e) { tip.style.left = (e.clientX + 14) + 'px'; tip.style.top = (e.clientY - 10) + 'px'; }
  function hide() { tip.style.opacity = 0; }
  window.addEventListener('mousemove', e => { if (tip.style.opacity === '1') mv(e); });
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const txt = (a, s) => Object.assign(mk('text', a), { textContent: s });
  function fmt(v) {
    if (v >= 1e7) return '₹' + (v / 1e7).toFixed(1).replace(/\.?0+$/, '').replace(/\.?0+$/, '') + ' cr';
    if (v >= 1e5) return '₹' + (v / 1e5).toFixed(v % 1e5 ? 1 : 0) + ' L'; if (v >= 1000) return '₹' + (v / 1000).toFixed(0) + 'k'; return '₹' + Math.round(v);
  }
  function polar(cx, cy, r, d) { const a = (d - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
  function donutArc(cx, cy, r1, r2, a0, a1) {
    const [xo0, yo0] = polar(cx, cy, r2, a0), [xo1, yo1] = polar(cx, cy, r2, a1), [xi0, yi0] = polar(cx, cy, r1, a0), [xi1, yi1] = polar(cx, cy, r1, a1), lg = (a1 - a0) > 180 ? 1 : 0;
    return `M${xo0} ${yo0} A${r2} ${r2} 0 ${lg} 1 ${xo1} ${yo1} L${xi1} ${yi1} A${r1} ${r1} 0 ${lg} 0 ${xi0} ${yi0} Z`;
  }

  const T = D.incomeGroups;

  /* ===== K ===== */
  function drawK() {
    const x0 = 1980, x1 = 2025;
    /* ---- income shares ---- */
    (function () {
      const svg = document.getElementById('svgK'); if (!svg) return; svg.innerHTML = '';
      const mm = { t: 22, r: 38, b: 40, l: 52 }, w = 820 - mm.l - mm.r, h = 360 - mm.t - mm.b;
      const X = v => mm.l + (v - x0) / (x1 - x0) * w, Y = v => mm.t + (1 - v / 60) * h;
      for (let v = 0; v <= 60; v += 10) { svg.appendChild(mk('line', { x1: mm.l, y1: Y(v), x2: mm.l + w, y2: Y(v), stroke: css('--rule'), 'stroke-width': 1 })); svg.appendChild(txt({ x: mm.l - 8, y: Y(v) + 4, 'text-anchor': 'end', 'font-family': 'Archivo', 'font-size': 10, fill: css('--muted') }, v + '%')); }
      [1980, 1991, 2000, 2010, 2022].forEach(yr => svg.appendChild(txt({ x: X(yr), y: mm.t + h + 20, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 10, fill: css('--muted') }, yr)));
      svg.appendChild(mk('line', { x1: X(1991), y1: mm.t, x2: X(1991), y2: mm.t + h, stroke: css('--ink'), 'stroke-width': 1.2, 'stroke-dasharray': '5 4', opacity: .5 }));
      svg.appendChild(txt({ x: X(1991) + 6, y: mm.t + 12, 'font-family': 'Archivo', 'font-size': 10, 'font-weight': 600, fill: css('--muted') }, '1991 liberalisation'));
      const { top1: t1, top10: top, bot50: bot } = D.kTab.incomeShares;
      svg.appendChild(mk('path', { d: 'M' + top.map(p => X(p[0]) + ' ' + Y(p[1])).join(' L') + ' L' + bot.slice().reverse().map(p => X(p[0]) + ' ' + Y(p[1])).join(' L') + ' Z', fill: css('--ink'), opacity: .05 }));
      function ln(pts, c, lab, dy) {
        svg.appendChild(mk('path', { d: pts.map((p, i) => (i ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1])).join(' '), fill: 'none', stroke: c, 'stroke-width': 2.8, 'stroke-linejoin': 'round' }));
        pts.forEach(p => { const ci = mk('circle', { cx: X(p[0]), cy: Y(p[1]), r: 4, fill: c, stroke: css('--paper'), 'stroke-width': 1.5 }); ci.addEventListener('mousemove', e => showTip(e, `${p[0]}: ${p[1]}%`)); ci.addEventListener('mouseleave', hide); svg.appendChild(ci); });
        const e = pts[pts.length - 1]; svg.appendChild(txt({ x: X(e[0]) - 2, y: Y(e[1]) + dy, 'text-anchor': 'end', 'font-family': 'Archivo', 'font-size': 11.5, 'font-weight': 600, fill: c }, lab));
      }
      ln(top, css('--gst'), 'Top 10% · 57.7%', -8);
      ln(t1, css('--t1'), 'Top 1% · 22.6%', -8);
      ln(bot, css('--corp'), 'Bottom 50% · 15%', 15);
      svg.appendChild(txt({ x: 15, y: mm.t + h / 2, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 10.5, 'font-weight': 600, fill: css('--ink'), transform: `rotate(-90 15 ${mm.t + h / 2})` }, 'share of national income'));
    })();
    /* ---- wealth shares ---- */
    (function () {
      const svg = document.getElementById('svgKW'); if (!svg) return; svg.innerHTML = '';
      const mm = { t: 22, r: 58, b: 40, l: 52 }, w = 820 - mm.l - mm.r, h = 360 - mm.t - mm.b;
      const X = v => mm.l + (v - x0) / (x1 - x0) * w, Y = v => mm.t + (1 - v / 70) * h;
      for (let v = 0; v <= 70; v += 10) { svg.appendChild(mk('line', { x1: mm.l, y1: Y(v), x2: mm.l + w, y2: Y(v), stroke: css('--rule'), 'stroke-width': 1 })); svg.appendChild(txt({ x: mm.l - 8, y: Y(v) + 4, 'text-anchor': 'end', 'font-family': 'Archivo', 'font-size': 10, fill: css('--muted') }, v + '%')); }
      [1980, 1991, 2000, 2010, 2022].forEach(yr => svg.appendChild(txt({ x: X(yr), y: mm.t + h + 20, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 10, fill: css('--muted') }, yr)));
      svg.appendChild(mk('line', { x1: X(1991), y1: mm.t, x2: X(1991), y2: mm.t + h, stroke: css('--ink'), 'stroke-width': 1.2, 'stroke-dasharray': '5 4', opacity: .5 }));
      svg.appendChild(txt({ x: X(1991) + 6, y: mm.t + 12, 'font-family': 'Archivo', 'font-size': 10, 'font-weight': 600, fill: css('--muted') }, '1991'));
      function ln(pts, c, dy) {
        svg.appendChild(mk('path', { d: pts.map((p, i) => (i ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1])).join(' '), fill: 'none', stroke: c, 'stroke-width': 2.8, 'stroke-linejoin': 'round' }));
        pts.forEach(p => { const ci = mk('circle', { cx: X(p[0]), cy: Y(p[1]), r: 4, fill: c, stroke: css('--paper'), 'stroke-width': 1.5 }); ci.addEventListener('mousemove', e => showTip(e, `${p[0]}: ${p[1]}%`)); ci.addEventListener('mouseleave', hide); svg.appendChild(ci); });
        const e = pts[pts.length - 1]; svg.appendChild(txt({ x: X(e[0]) + 6, y: Y(e[1]) + dy, 'font-family': 'Archivo', 'font-size': 11.5, 'font-weight': 700, fill: c }, e[1] + '%'));
      }
      ln(D.kTab.wealthShares.top10, css('--gst'), 4);
      ln(D.kTab.wealthShares.top1, css('--t1'), 4);
      ln(D.kTab.wealthShares.bot50, css('--corp'), 12);
      svg.appendChild(txt({ x: 15, y: mm.t + h / 2, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 10.5, 'font-weight': 600, fill: css('--ink'), transform: `rotate(-90 15 ${mm.t + h / 2})` }, 'share of national wealth'));
    })();
  }

  /* ===== INCOME (horizontal bars + calculator) ===== */
  let ixLog = false, iyLog = false, iEv = false, userInc = 0;
  function darken(hex, f) { hex = hex.replace('#', ''); const n = parseInt(hex, 16); return `rgb(${Math.round(((n >> 16) & 255) * f)},${Math.round(((n >> 8) & 255) * f)},${Math.round((n & 255) * f)})`; }
  function drawI() {
    const svg = document.getElementById('svgI'); svg.innerHTML = '';
    const mm = { t: 14, r: 150, b: 30, l: 84 }, w = 820 - mm.l - mm.r, h = 360 - mm.t - mm.b, FL = 5e4, MX = 1e8;
    const valX = v => ixLog ? (Math.log10(v) - Math.log10(FL)) / (Math.log10(MX) - Math.log10(FL)) * w : v / MX * w;
    const XLO = Math.log10(75), XHI = Math.log10(0.005);
    const rowY = (t, i) => iyLog ? mm.t + (XLO - Math.log10(t.tp)) / (XLO - XHI) * h : mm.t + i * (h / (T.length - 1));
    const bh = 18;
    // x grid
    if (ixLog) { [1e5, 1e6, 1e7, 1e8].forEach(v => { const x = mm.l + valX(v); svg.appendChild(mk('line', { x1: x, y1: mm.t - 6, x2: x, y2: mm.t + h + 4, stroke: css('--rule'), 'stroke-width': 1 })); svg.appendChild(txt({ x: x, y: mm.t + h + 20, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 10, fill: css('--muted') }, fmt(v))); }); }
    else { [0, 2.5e7, 5e7, 7.5e7, 1e8].forEach(v => { const x = mm.l + valX(v); svg.appendChild(mk('line', { x1: x, y1: mm.t - 6, x2: x, y2: mm.t + h + 4, stroke: css('--rule'), 'stroke-width': 1 })); svg.appendChild(txt({ x: x, y: mm.t + h + 20, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 10, fill: css('--muted') }, v ? fmt(v) : '0')); }); }
    const clsN = document.getElementById('clsNote'); if (clsN) clsN.style.display = (iClass || iGlobalCls) ? 'block' : 'none';
    const clsL = document.getElementById('clsLegend');
    function bandSVG(cl) {
      const bx1 = mm.l + valX(Math.max(cl.lo, FL)), bx2 = mm.l + valX(Math.min(cl.hi, MX)); if (bx2 <= bx1) return;
      svg.appendChild(mk('rect', { x: bx1, y: mm.t, width: bx2 - bx1, height: h, fill: css(cl.c), opacity: .06 }));
      if (bx1 > mm.l) svg.appendChild(mk('line', { x1: bx1, y1: mm.t, x2: bx1, y2: mm.t + h, stroke: css(cl.c), 'stroke-width': 1.5, 'stroke-dasharray': '4 3', opacity: .45 }));
      if (bx2 - bx1 > 160) { svg.appendChild(txt({ x: (bx1 + bx2) / 2, y: mm.t + h - 14, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 10, 'font-weight': 700, fill: css(cl.c) }, cl.label)); }
      else if (bx2 - bx1 > 0) { svg.appendChild(txt({ x: bx1 + 4, y: mm.t + h - 14, 'text-anchor': 'start', 'font-family': 'Archivo', 'font-size': 10, 'font-weight': 700, fill: css(cl.c) }, cl.label)); }
    }
    if (iClass) {
      [{ lo: 5e4, hi: 125000, label: 'Destitute', c: '--evad' },
      { lo: 125000, hi: 500000, label: 'Aspirers', c: '--gst' },
      { lo: 500000, hi: 3000000, label: 'Middle', c: '--corp' },
      { lo: 3000000, hi: 1e8, label: 'Rich', c: '--top' }].forEach(bandSVG);
      if (clsL) {
        clsL.style.display = 'flex'; clsL.innerHTML =
          `<span style="width:100%;font-weight:700;display:block;margin-bottom:3px">India (PRICE/ICE360, household):</span>` +
          [[css('--evad'), 'Destitute', '<$13/day', '<₹1.25L'],
          [css('--gst'), 'Aspirers', '$13–53/day', '₹1.25–5L'],
          [css('--corp'), 'Middle', '$53–316/day', '₹5–30L'],
          [css('--top'), 'Rich', '>$316/day', '>₹30L']].map(([c, n, ppp, rs]) =>
            `<span style="font-weight:700;color:${c}">■ ${n}</span> <span style="font-size:9.5px;color:${css('--muted')}">${ppp} PPP <small>(${rs})</small></span>`).join('&ensp;');
      }
    }
    if (iGlobalCls) {
      [{ lo: 5e4, hi: 95000, label: 'Low', c: '--gst' },
      { lo: 95000, hi: 190000, label: 'Middle', c: '--corp' },
      { lo: 190000, hi: 475000, label: 'Upper-mid', c: '--mid' },
      { lo: 475000, hi: 1e8, label: 'High', c: '--t1' }].forEach(bandSVG);
      if (clsL) {
        clsL.style.display = 'flex'; clsL.innerHTML =
          `<span style="width:100%;font-weight:700;display:block;margin-bottom:3px">Global (Pew, 2011 PPP — frozen thresholds):</span>` +
          [[css('--gst'), 'Low', '<$10/day'],
          [css('--corp'), 'Middle', '$10–20/day'],
          [css('--mid'), 'Upper-mid', '$20–50/day'],
          [css('--t1'), 'High', '>$50/day']].map(([c, n, ppp]) =>
            `<span style="font-weight:700;color:${c}">■ ${n}</span> <span style="font-size:9.5px;color:${css('--muted')}">${ppp} PPP</span>`).join('&ensp;') +
          `<span style="width:100%;font-size:9px;color:${css('--muted')};display:block;margin-top:4px">2022 approx. rupee equivalents: &lt;₹95k &nbsp;·&nbsp; ₹95k–1.9L &nbsp;·&nbsp; ₹1.9–4.75L &nbsp;·&nbsp; &gt;₹4.75L</span>`;
      }
    }
    if (!iClass && !iGlobalCls && clsL) clsL.style.display = 'none';
    // Merge "You" into rows array at correct income-order position → equal spacing for 9 bars
    const rows = [...T]; let youIdx = -1;
    if (userInc > 0) {
      youIdx = rows.findIndex(t => userInc < t.inc); if (youIdx === -1) youIdx = rows.length;
      const utax = computeTax(userInc); let evadR = 0; for (let i = T.length - 1; i >= 0; i--) { if (userInc >= T[i].inc) { evadR = T[i].evad / T[i].inc; break; } }
      const youTp = Math.max(0.005, Math.min(99, 100 - incomeToPerc(Math.min(userInc, MX))));
      rows.splice(youIdx, 0, { n: 'You', tp: youTp, inc: userInc, tax: utax, evad: userInc * evadR, m: userInc / 1e5, twin: htwin(userInc / 1e5), isYou: true });
    }
    // Always linear spacing when You is present (ensures 9th bar sits evenly in income order)
    const rN = rows.length;
    const rY = (t, i) => (userInc > 0 || !iyLog) ? mm.t + i * (h / Math.max(1, rN - 1)) : mm.t + (XLO - Math.log10(t.tp)) / (XLO - XHI) * h;
    rows.forEach((t, i) => {
      const y = rY(t, i), px = valX(Math.min(t.inc, MX));
      const inkC = t.isYou ? css('--you') : css('--ink');
      svg.appendChild(txt({ x: mm.l - 8, y: y + 4, 'text-anchor': 'end', 'font-family': t.isYou ? 'Fraunces' : 'Archivo', 'font-size': t.isYou ? 12 : 11, 'font-weight': 600, fill: inkC }, t.n));
      const bar = mk('rect', { x: mm.l, y: y - bh / 2, width: Math.max(2, px), height: bh, rx: 2, fill: css('--inc'), opacity: .55 });
      bar.addEventListener('mousemove', e => showTip(e, `<b>${t.n}</b><br>income ${fmt(t.inc)}`)); bar.addEventListener('mouseleave', hide); svg.appendChild(bar);
      if (t.tax > 0) { const tr = mk('rect', { x: mm.l, y: y - bh / 2, width: Math.max(1, px * (t.tax / t.inc)), height: bh, rx: 2, fill: css('--tax') }); tr.addEventListener('mousemove', e => showTip(e, `<b>Tax: ${fmt(t.tax)}</b> &nbsp;·&nbsp; ${Math.round(t.tax / t.inc * 100)}% effective rate`)); tr.addEventListener('mouseleave', hide); svg.appendChild(tr); }
      if (iEv && t.evad > 0) { const er = mk('rect', { x: mm.l, y: y - bh / 2, width: Math.max(1, px * (t.evad / t.inc)), height: bh, rx: 2, fill: css('--evad') }); er.addEventListener('mousemove', e => showTip(e, `<b>Evadable: ${fmt(t.evad)}</b> &nbsp;·&nbsp; unreported capital income (Singh 2025)`)); er.addEventListener('mouseleave', hide); svg.appendChild(er); }
      svg.appendChild(txt({ x: mm.l + px + 8, y: y + 4, 'font-family': 'Archivo', 'font-size': 11, 'font-weight': 600, fill: inkC }, `${fmt(t.inc)} · ${t.m >= 1 ? t.m.toLocaleString('en-IN') : t.m}m`));
      svg.appendChild(txt({ x: mm.l + px + 8, y: y + 15, 'font-family': 'Archivo', 'font-size': 9.5, fill: css('--muted') }, t.twin));
    });
    if (userInc > 0) {
      const ux = mm.l + valX(Math.min(userInc, MX));
      svg.appendChild(mk('line', { x1: ux, y1: mm.t - 6, x2: ux, y2: mm.t + h + 4, stroke: css('--you'), 'stroke-width': 1.5, 'stroke-dasharray': '4 3', opacity: .5 }));
      svg.appendChild(txt({ x: ux, y: mm.t - 10, 'text-anchor': 'middle', 'font-family': 'Fraunces', 'font-weight': 700, 'font-size': 11, fill: css('--you') }, '▶ You'));
    }
  }
  function computeTax(y) { if (y <= 1200000) return 0; const s = [...D.taxSlabs, [Infinity, .30]]; let t = 0, p = 0; for (const [c, r] of s) { const a = Math.min(y, c) - p; if (a > 0) t += a * r; p = c; if (y <= c) break; } let su = 0; for (const { above, rate } of D.taxSurcharges) { if (y > above) { su = rate; break; } } return t * (1 + su) * 1.04; }
  function htwin(m) { if (m < .9) return 'a small child'; if (m < 1.3) return 'a yardstick — about the median Indian'; if (m < 1.9) return 'a grown adult'; if (m < 3) return 'a doorframe'; if (m < 7) return 'two storeys'; if (m < 20) return 'a 3–5 storey building'; if (m < 70) return 'a multi-storey tower'; if (m < 250) return 'a skyscraper'; return 'a structure taller than the Burj Khalifa'; }
  function tierTxt(y) { if (y < 71000) return ['below the bottom-50% average', 'below the ₹71k average of the poorest half.']; if (y < 100000) return ['in the bottom ~50%', 'below the ₹1 lakh national median.']; if (y < 160000) return ['just above the median', 'inside the broad middle-40%.']; if (y < 210000) return ['approaching the national average', 'still below average — which itself sits near the 90th percentile.']; if (y < 1300000) return ['roughly the top 10–15%', 'above the average Indian, below the ₹13L top-10% average.']; if (y < 5300000) return ['around the top 1–5%', 'deep in the top decile.']; if (y < 20000000) return ['around the top 1%', 'out-earning ~99% of adults.']; if (y < 1e8) return ['around the top 0.1%', 'among the richest ~900,000 adults.']; return ['top 0.01%+', 'among the ~10,000 highest earners.']; }
  function calc() {
    const inc = document.getElementById('inc'), unit = document.getElementById('unit'), res = document.getElementById('res');
    let raw = parseFloat((inc.value || '').replace(/[, ]/g, '')); if (!raw || raw <= 0) { res.classList.remove('show'); userInc = 0; drawI(); return; }
    const y = raw * parseFloat(unit.value); userInc = y; const mult = y / 1e5, tax = computeTax(y), rate = Math.round(tax / y * 100); const [tier, det] = tierTxt(y);
    const mtxt = mult >= 1 ? mult.toLocaleString('en-IN', { maximumFractionDigits: 1 }) + ' m' : (mult * 100).toFixed(0) + ' cm';
    res.innerHTML = `<div class="big">${mtxt} tall</div><div class="det">That's <b>${mult.toLocaleString('en-IN', { maximumFractionDigits: 1 })}×</b> the median (${fmt(y)}/yr) — about the height of ${htwin(mult)}.<br><br>You sit <b>${tier}</b> — ${det}<br><br>${tax > 0 ? `Estimated income tax (FY25-26 slabs, as salary): <b>${fmt(tax)}</b> (~${rate}% effective).` : `At this income you owe <b>no income tax</b> (rebate covers up to ₹12 lakh).`}</div>`;
    res.classList.add('show'); drawI();
  }

  /* ===== PEN'S PARADE ===== */
  const PA = D.paradeIncome;
  function incomeAt(p) { for (let i = 0; i < PA.length - 1; i++) { if (p <= PA[i + 1][0]) { const [a, b] = PA[i], [c, d] = PA[i + 1], f = (p - a) / (c - a); return Math.exp(Math.log(b) + f * (Math.log(d) - Math.log(b))); } } return PA[PA.length - 1][1]; }
  let paP = 0, paPlaying = false, paStart = 0, paDur = 26000, paRAF = null, paLogH = false, paLogP = false;
  const paPx = inc => inc * (24 / 100000);
  const _logLo = Math.log10(30000), _logHi = Math.log10(200000000);
  function paPxLog(inc) { return Math.max(2, ((Math.log10(Math.max(30000, inc)) - _logLo) / (_logHi - _logLo)) * (372 - 42)); }
  function incomeToPerc(inc) { for (let i = 0; i < PA.length - 1; i++) { const [a, b] = [PA[i][0], PA[i][1]], [c, d] = [PA[i + 1][0], PA[i + 1][1]]; if (inc <= d) { const f = (Math.log(Math.max(inc, b)) - Math.log(b)) / (Math.log(d) - Math.log(b)); return a + Math.max(0, f) * (c - a); } } return 100; }
  function marchPct() { if (!paLogP) return paP; return incomeToPerc(Math.pow(10, _logLo + (paP / 100) * (_logHi - _logLo))); }
  function drawParade() {
    const svg = document.getElementById('svgP'); svg.innerHTML = '';
    const W = 820, ground = 372, cx = 410, bw = 36;
    svg.appendChild(mk('line', { x1: 30, y1: ground, x2: W - 30, y2: ground, stroke: css('--ink'), 'stroke-width': 1.5 }));
    const H = paLogH ? paPxLog : paPx;
    const MARKS = D.paradeMarkers;
    MARKS.forEach(([inc, lab]) => { const y = ground - H(inc); if (y < ground - 2 && y > 8) { svg.appendChild(mk('line', { x1: 30, y1: y, x2: W - 30, y2: y, stroke: css('--rule'), 'stroke-width': 1, 'stroke-dasharray': '3 4' })); svg.appendChild(txt({ x: 38, y: y - 3, 'font-family': 'Archivo', 'font-size': 9.5, fill: css('--muted') }, lab)); } });
    const dp = marchPct(), inc = incomeAt(dp), hpx = H(inc), cap = hpx > ground - 30, drawH = Math.max(2, Math.min(hpx, ground - 30));
    svg.appendChild(mk('rect', { x: cx - bw / 2, y: ground - drawH, width: bw, height: drawH, rx: 5, fill: css('--evad'), opacity: .9 }));
    svg.appendChild(mk('circle', { cx: cx, cy: ground - drawH - 10, r: 9, fill: css('--ink') }));
    if (cap) svg.appendChild(txt({ x: cx, y: 20, 'text-anchor': 'middle', 'font-family': 'Fraunces', 'font-weight': 900, 'font-size': 14, fill: css('--evad') }, '↑ ' + (inc / 1e5).toLocaleString('en-IN', { maximumFractionDigits: 0 }) + ' m tall — off screen'));
    const ht = paLogH ? ('log-h: ' + (paPxLog(inc) / paPxLog(1e5)).toFixed(1) + '× median') : (inc / 1e5).toFixed(inc < 1e6 ? 2 : 0) + ' m';
    svg.appendChild(txt({ x: cx, y: ground + 22, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 12, 'font-weight': 600, fill: css('--ink') }, 'walked ' + dp.toFixed(2) + '% · ' + fmt(inc) + '/yr · ' + ht));
  }
  function paStep(ts) {
    if (!paStart) paStart = ts - (paP / 100) * paDur; const prog = Math.min(1, (ts - paStart) / paDur); paP = prog * 100; document.getElementById('paSlide').value = paP * 10; drawParade();
    if (prog < 1 && paPlaying) paRAF = requestAnimationFrame(paStep); else { paPlaying = false; document.getElementById('paPlay').textContent = '▶ Play'; }
  }
  document.getElementById('paPlay').onclick = function () { if (paPlaying) { paPlaying = false; cancelAnimationFrame(paRAF); this.textContent = '▶ Play'; return; } if (paP >= 100) paP = 0; paPlaying = true; paStart = 0; this.textContent = '⏸ Pause'; paRAF = requestAnimationFrame(paStep); };
  document.getElementById('paReplay').onclick = function () { paPlaying = false; cancelAnimationFrame(paRAF); paP = 0; document.getElementById('paSlide').value = 0; document.getElementById('paPlay').textContent = '▶ Play'; drawParade(); };
  document.getElementById('paHLin').onclick = () => { paLogH = false; flip('paHLin', 'paHLog', true); drawParade(); };
  document.getElementById('paHLog').onclick = () => { paLogH = true; flip('paHLin', 'paHLog', false); drawParade(); };
  document.getElementById('paPLin').onclick = () => { paLogP = false; flip('paPLin', 'paPLog', true); drawParade(); };
  document.getElementById('paPLog').onclick = () => { paLogP = true; flip('paPLin', 'paPLog', false); drawParade(); };
  document.getElementById('paSlide').oninput = function () { paPlaying = false; cancelAnimationFrame(paRAF); document.getElementById('paPlay').textContent = '▶ Play'; paP = this.value / 10; drawParade(); };

  /* ===== SOURCES ===== */
  const SRC = D.taxSources;
  function drawS() {
    const svg = document.getElementById('svgS'); svg.innerHTML = ''; const cx = 200, cy = 200, r1 = 80, r2 = 155; let acc = 0;
    SRC.forEach(s => { const a0 = acc * 3.6, a1 = (acc + s.pct) * 3.6; acc += s.pct; const p = mk('path', { d: donutArc(cx, cy, r1, r2, a0, a1), fill: css(s.c), stroke: css('--paper'), 'stroke-width': 2 }); p.addEventListener('mousemove', e => showTip(e, `<b>${s.g}</b> — ${s.s}<br>${s.pct.toFixed(1)}% of central tax`)); p.addEventListener('mouseleave', hide); svg.appendChild(p); });
    svg.appendChild(txt({ x: cx, y: cy - 4, 'text-anchor': 'middle', 'font-family': 'Fraunces', 'font-weight': 900, 'font-size': 14, fill: css('--ink') }, 'Central'));
    svg.appendChild(txt({ x: cx, y: cy + 13, 'text-anchor': 'middle', 'font-family': 'Fraunces', 'font-weight': 900, 'font-size': 14, fill: css('--ink') }, 'tax ₹'));
    svg.appendChild(txt({ x: cx, y: 16, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 11, 'font-weight': 600, fill: css('--it1') }, '◀ Income tax ~33%'));
    const leg = document.getElementById('legS'); leg.innerHTML = `<span class="grp" style="color:${css('--it1')}">Income tax — 33% (direct)</span>`;
    [['--it1', '> ₹50 L', '25%', 'pays 76% of income tax'], ['--it2', '₹10–50 L', '6%', '18% of it'], ['--it3', '< ₹10 L', '2%', '6% of it']].forEach(r => leg.innerHTML += `<span class="row"><i style="background:${css(r[0])}"></i><span><b>${r[2]}</b> of all tax · ${r[1]} <span class="mut">(${r[3]})</span></span></span>`);
    leg.innerHTML += `<span class="grp">Other sources</span>`;
    [['--gst', 'GST', '27%', 'indirect — all'], ['--corp', 'Corporate tax', '26%', 'companies'], ['--exc', 'Union excise', '8%', 'indirect'], ['--cus', 'Customs', '6%', 'indirect']].forEach(r => leg.innerHTML += `<span class="row"><i style="background:${css(r[0])}"></i><span><b>${r[2]}</b> · ${r[1]} <span class="mut">(${r[3]})</span></span></span>`);
    leg.innerHTML += `<span class="row mut" style="margin-top:6px;font-size:12px">Direct ≈ 59% · Indirect ≈ 41%</span>`;
  }

  /* ===== WHO PAYS ===== */
  const CL = D.taxPayers;
  function mini(svg, cx, cy, k) { const r1 = 58, r2 = 108; let acc = 0; CL.forEach(c => { const v = c[k], a0 = acc * 3.6, a1 = (acc + v) * 3.6; acc += v; const p = mk('path', { d: donutArc(cx, cy, r1, r2, a0, a1), fill: css(c.c), stroke: css('--paper'), 'stroke-width': 2 }); p.addEventListener('mousemove', e => showTip(e, `<b>${c.n}</b><br>${k === 'payers' ? 'of taxpayers' : 'of income tax'}: ${v}%`)); p.addEventListener('mouseleave', hide); svg.appendChild(p); }); }
  function drawW() {
    const svg = document.getElementById('svgW'); svg.innerHTML = ''; mini(svg, 160, 150, 'payers'); mini(svg, 460, 150, 'tax');
    svg.appendChild(txt({ x: 160, y: 296, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 13, 'font-weight': 600, fill: css('--ink') }, 'Share of TAXPAYERS'));
    svg.appendChild(txt({ x: 460, y: 296, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 13, 'font-weight': 600, fill: css('--ink') }, 'Share of INCOME TAX PAID'));
    svg.appendChild(txt({ x: 310, y: 158, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 30, fill: css('--gst') }, '→'));
    let lx = 120; CL.forEach(c => { svg.appendChild(mk('rect', { x: lx, y: 336, width: 15, height: 15, rx: 3, fill: css(c.c) })); svg.appendChild(txt({ x: lx + 21, y: 348, 'font-family': 'Archivo', 'font-size': 12.5, fill: css('--ink') }, c.n)); lx += 150; });
  }

  /* ===== EVOLUTION ===== */
  function drawE() {
    const svg = document.getElementById('svgE'); svg.innerHTML = '';
    const mm = { t: 24, r: 122, b: 48, l: 48 }, w = 820 - mm.l - mm.r, h = 460 - mm.t - mm.b, x0 = 1951, x1 = 2026;
    const X = v => mm.l + (v - x0) / (x1 - x0) * w, Y = v => mm.t + (1 - v / 100) * h;
    for (let v = 0; v <= 100; v += 25) { svg.appendChild(mk('line', { x1: mm.l, y1: Y(v), x2: mm.l + w, y2: Y(v), stroke: css('--rule'), 'stroke-width': 1 })); svg.appendChild(txt({ x: mm.l - 8, y: Y(v) + 4, 'text-anchor': 'end', 'font-family': 'Archivo', 'font-size': 10.5, fill: css('--muted') }, v + '%')); }
    [1951, 1965, 1980, 1991, 2000, 2010, 2017, 2026].forEach(yr => svg.appendChild(txt({ x: X(yr), y: mm.t + h + 22, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 10.5, fill: css('--muted') }, yr)));
    const tm = D.taxMixTab, YR = tm.years;
    const TM = { PIT: tm.pit, Corp: tm.corp, GST: tm.gst, Svc: tm.svc, Exc: tm.exc, Cus: tm.cus };
    const order = [['PIT', '--it1', 'Income tax'], ['Corp', '--corp', 'Corporate'], ['GST', '--gst', 'GST'], ['Svc', '--svc', 'Service tax'], ['Exc', '--exc', 'Union excise'], ['Cus', '--cus', 'Customs']];
    let base = YR.map(() => 0);
    order.forEach(o => {
      const vals = TM[o[0]], top = vals.map((v, i) => base[i] + v);
      let d = ''; for (let i = 0; i < YR.length; i++)d += (i ? 'L' : 'M') + X(YR[i]) + ' ' + Y(top[i]) + ' ';
      for (let i = YR.length - 1; i >= 0; i--)d += 'L' + X(YR[i]) + ' ' + Y(base[i]) + ' '; d += 'Z';
      const pa = mk('path', { d: d, fill: css(o[1]), opacity: .9, stroke: css('--paper'), 'stroke-width': 1 }); svg.appendChild(pa);
      const lt = top[top.length - 1], lb = base[base.length - 1], sz = lt - lb;
      if (sz > 3.5) svg.appendChild(txt({ x: mm.l + w + 6, y: Y((lt + lb) / 2) + 4, 'font-family': 'Archivo', 'font-size': 10.5, 'font-weight': 600, fill: css(o[1]) }, o[2] + ' ' + sz + '%'));
      base = top;
    });
    [[1991, '1991 reforms'], [2017, '2017 GST']].forEach(m => { svg.appendChild(mk('line', { x1: X(m[0]), y1: mm.t, x2: X(m[0]), y2: mm.t + h, stroke: css('--ink'), 'stroke-width': 1.2, 'stroke-dasharray': '4 4', opacity: .5 })); svg.appendChild(txt({ x: X(m[0]) + 4, y: mm.t + 12, 'font-family': 'Archivo', 'font-size': 10, 'font-weight': 600, fill: css('--ink') }, m[1])); });
    svg.appendChild(txt({ x: 16, y: mm.t + h / 2, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 12, 'font-weight': 600, fill: css('--ink'), transform: `rotate(-90 16 ${mm.t + h / 2})` }, '% of central gross tax revenue'));
  }

  /* ===== RAJ ===== */
  function drawR() {
    const svg = document.getElementById('svgR'); if (!svg) return; svg.innerHTML = '';
    const mm = { t: 28, r: 46, b: 48, l: 48 }, w = 820 - mm.l - mm.r, h = 460 - mm.t - mm.b, x0 = 1922, x1 = 2025;
    const X = v => mm.l + (v - x0) / (x1 - x0) * w, Y = v => mm.t + (1 - v / 28) * h;
    for (let v = 0; v <= 25; v += 5) { svg.appendChild(mk('line', { x1: mm.l, y1: Y(v), x2: mm.l + w, y2: Y(v), stroke: css('--rule'), 'stroke-width': 1 })); svg.appendChild(txt({ x: mm.l - 8, y: Y(v) + 4, 'text-anchor': 'end', 'font-family': 'Archivo', 'font-size': 10.5, fill: css('--muted') }, v + '%')); }
    [1922, 1947, 1970, 1991, 2022].forEach(yr => svg.appendChild(txt({ x: X(yr), y: mm.t + h + 22, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 10.5, fill: css('--muted') }, yr)));
    svg.appendChild(mk('rect', { x: X(1922), y: mm.t, width: X(1947) - X(1922), height: h, fill: css('--ink'), opacity: .05 }));
    svg.appendChild(txt({ x: (X(1922) + X(1947)) / 2, y: mm.t + 14, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 10.5, 'font-weight': 600, fill: css('--muted') }, 'British Raj'));
    svg.appendChild(txt({ x: (X(1947) + X(2025)) / 2, y: mm.t + 14, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 10.5, 'font-weight': 600, fill: css('--muted') }, 'Republic of India'));
    svg.appendChild(mk('line', { x1: mm.l, y1: Y(21), x2: mm.l + w, y2: Y(21), stroke: css('--evad'), 'stroke-width': 1.4, 'stroke-dasharray': '6 4', opacity: .85 }));
    svg.appendChild(txt({ x: mm.l + w + 10, y: Y(19.6) - 6, 'text-anchor': 'end', 'font-family': 'Archivo', 'font-size': 10.5, 'font-weight': 600, fill: css('--evad') }, 'colonial peak ~21%'));
    [[1947, 'Independence'], [1991, 'Liberalisation']].forEach(m => { svg.appendChild(mk('line', { x1: X(m[0]), y1: mm.t, x2: X(m[0]), y2: mm.t + h, stroke: css('--ink'), 'stroke-width': 1, 'stroke-dasharray': '3 4', opacity: .4 })); svg.appendChild(txt({ x: X(m[0]) + 4, y: mm.t + h - 8, 'font-family': 'Archivo', 'font-size': 10, 'font-weight': 600, fill: css('--muted') }, m[1])); });
    const xc = X(2005);
    svg.appendChild(txt({ x: xc - 4, y: Y(17.5), 'text-anchor': 'end', 'font-family': 'Archivo', 'font-size': 10, 'font-style': 'italic', fill: css('--ink') }, '~2005: top 1%'));
    svg.appendChild(txt({ x: xc - 4, y: Y(17.5) + 12, 'text-anchor': 'end', 'font-family': 'Archivo', 'font-size': 10, 'font-style': 'italic', fill: css('--ink') }, 'overtakes bottom 50%'));
    // pre-1955 projection (dotted) — no survey data before 1951
    const Bproj = D.rajTab.bot50IncomeProj;
    svg.appendChild(mk('path', { d: Bproj.map((p, i) => (i ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1])).join(' '), fill: 'none', stroke: css('--corp'), 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: .6 }));
    svg.appendChild(txt({ x: (X(1922) + X(1955)) / 2, y: Y(20) + 16, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 9.5, 'font-style': 'italic', fill: css('--corp') }, 'extrapolated — no income surveys'));
    svg.appendChild(txt({ x: (X(1922) + X(1955)) / 2, y: Y(20) + 28, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 9, 'font-style': 'italic', fill: css('--corp') }, 'existed pre-1951; colonial records'))
    svg.appendChild(txt({ x: (X(1922) + X(1955)) / 2, y: Y(20) + 39, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 9, 'font-style': 'italic', fill: css('--corp') }, 'only covered top ~3%'));
    const B = D.rajTab.bot50Income;
    svg.appendChild(mk('path', { d: B.map((p, i) => (i ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1])).join(' '), fill: 'none', stroke: css('--corp'), 'stroke-width': 2.8, 'stroke-linejoin': 'round' }));
    B.forEach(p => { const c = mk('circle', { cx: X(p[0]), cy: Y(p[1]), r: 4.2, fill: css('--corp'), stroke: css('--paper'), 'stroke-width': 1.5 }); c.addEventListener('mousemove', e => showTip(e, 'Bottom 50% ' + p[0] + ': ' + p[1] + '%')); c.addEventListener('mouseleave', hide); svg.appendChild(c); });
    svg.appendChild(txt({ x: X(1982) + 4, y: Y(23.6) - 9, 'font-family': 'Archivo', 'font-size': 10.5, 'font-weight': 600, fill: css('--corp') }, '23.6%'));
    svg.appendChild(txt({ x: X(2022) - 3, y: Y(15) + 16, 'text-anchor': 'end', 'font-family': 'Archivo', 'font-size': 10.5, 'font-weight': 600, fill: css('--corp') }, '15%'));
    const P = D.rajTab.top1Income;
    svg.appendChild(mk('path', { d: P.map((p, i) => (i ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1])).join(' '), fill: 'none', stroke: css('--t1'), 'stroke-width': 3, 'stroke-linejoin': 'round' }));
    P.forEach(p => { const c = mk('circle', { cx: X(p[0]), cy: Y(p[1]), r: 4.6, fill: css('--t1'), stroke: css('--paper'), 'stroke-width': 1.6 }); c.addEventListener('mousemove', e => showTip(e, 'Top 1% ' + p[0] + ': ' + p[1] + '%')); c.addEventListener('mouseleave', hide); svg.appendChild(c); });
    const note = (yr, val, t, dx, dy) => svg.appendChild(txt({ x: X(yr) + dx, y: Y(val) + dy, 'font-family': 'Archivo', 'font-size': 11, 'font-weight': 600, fill: css('--ink') }, t));
    note(1922, 13, '13%', 4, -9); note(1940, 20.7, '~21% peak · 1940', 6, -9); note(1950, 10.3, '10.3% · 1950', -4, 16); note(1982, 6.1, '6.1% low', 4, 16); note(2022, 22.6, '22.6%', -46, -9);
    svg.appendChild(txt({ x: 16, y: mm.t + h / 2, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 12, 'font-weight': 600, fill: css('--ink'), transform: `rotate(-90 16 ${mm.t + h / 2})` }, 'share of national income'));
  }


  /* ===== NEEDLE ===== */
  function drawN() {
    function stk(svgId, YRS, data, yLab, evts = []) {
      const x0 = 1958, x1 = 2025;
      const svg = document.getElementById(svgId); if (!svg) return; svg.innerHTML = '';
      const mm = { t: 36, r: 12, b: 34, l: 44 }, w = 820 - mm.l - mm.r, h = 256 - mm.t - mm.b;
      const X = v => mm.l + (v - x0) / (x1 - x0) * w, Y = v => mm.t + (1 - v / 100) * h;
      [0, 25, 50, 75, 100].forEach(v => { svg.appendChild(mk('line', { x1: mm.l, y1: Y(v), x2: mm.l + w, y2: Y(v), stroke: css('--rule'), 'stroke-width': 1 })); svg.appendChild(txt({ x: mm.l - 6, y: Y(v) + 4, 'text-anchor': 'end', 'font-family': 'Archivo', 'font-size': 9, fill: css('--muted') }, v + '%')); });
      [1960, 1970, 1980, 1991, 2000, 2010, 2022].forEach(yr => svg.appendChild(txt({ x: X(yr), y: mm.t + h + 16, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 10, fill: css('--muted') }, yr)));
      let base = YRS.map(() => 0);
      const bnames = ['Bottom 50%', 'Middle 40%', 'Next 9%', 'Top 1%'], bcols = ['--corp', '--mid', '--gst', '--t1'];
      const dots = [];
      data.forEach((vals, bi) => {
        const top = vals.map((v, i) => base[i] + v);
        let d = ''; for (let i = 0; i < YRS.length; i++)d += (i ? 'L' : 'M') + X(YRS[i]) + ' ' + Y(top[i]) + ' ';
        for (let i = YRS.length - 1; i >= 0; i--)d += 'L' + X(YRS[i]) + ' ' + Y(base[i]) + ' '; d += 'Z';
        svg.appendChild(mk('path', { d, fill: css(bcols[bi]), opacity: .88, stroke: css('--paper'), 'stroke-width': .5 }));
        const lt = top[top.length - 1], lb = base[base.length - 1];
        if (lt - lb > 5) svg.appendChild(txt({ x: X(YRS[YRS.length - 1]) - 8, y: Y((lt + lb) / 2) + 4, 'text-anchor': 'end', 'font-family': 'Archivo', 'font-size': 9.5, 'font-weight': 700, fill: '#fff' }, (lt - lb).toFixed(0) + '%'));
        YRS.forEach((yr, i) => dots.push({ x: X(yr), y: bi < 3 ? Y(top[i]) : Y((top[i] + base[i]) / 2), c: bcols[bi], tip: bnames[bi] + ': ' + vals[i].toFixed(1) + '% in ' + yr }));
        base = top;
      });
      dots.forEach(d => { const c = mk('circle', { cx: d.x, cy: d.y, r: 4.2, fill: css(d.c), stroke: css('--paper'), 'stroke-width': 1.5 }); c.addEventListener('mousemove', e => showTip(e, d.tip)); c.addEventListener('mouseleave', hide); svg.appendChild(c); });
      // 1991 — prominent, drawn on top of areas
      svg.appendChild(mk('line', { x1: X(1991), y1: mm.t, x2: X(1991), y2: mm.t + h, stroke: css('--ink'), 'stroke-width': 1.4, 'stroke-dasharray': '5 3', opacity: .68 }));
      svg.appendChild(txt({ x: X(1991) + 4, y: mm.t - 6, 'font-family': 'Archivo', 'font-size': 9.5, 'font-weight': 700, fill: css('--ink') }, '1991 liberalisation'));
      // other events drawn on top of areas
      evts.forEach((e, i) => {
        const ex = X(e.yr); if (ex < mm.l + 2 || ex > mm.l + w - 2) return;
        svg.appendChild(mk('line', { x1: ex, y1: mm.t, x2: ex, y2: mm.t + h, stroke: css('--ink'), 'stroke-width': 1.2, 'stroke-dasharray': '3 4', opacity: .65 }));
        const ly = mm.t - (i % 2 === 0 ? 6 : 20);
        svg.appendChild(mk('line', { x1: ex, y1: ly + 2, x2: ex + 2, y2: ly + 2, stroke: css('--paper'), 'stroke-width': 3 }));
        svg.appendChild(txt({ x: ex + 3, y: ly, 'font-family': 'Archivo', 'font-size': 9, 'font-weight': 700, fill: css('--ink') }, e.label));
      });
      svg.appendChild(txt({ x: 14, y: mm.t + h / 2, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 10, 'font-weight': 600, fill: css('--ink'), transform: 'rotate(-90 14 ' + (mm.t + h / 2) + ')' }, yLab));
    }
    const EVTS = D.events;
    const si = D.splitTab.incomeByBand, sw = D.splitTab.wealthByBand;
    stk('svgN', si.years,
      [si.bot50, si.mid40, si.next9, si.top1],
      '% national income', EVTS);
    stk('svgNW', sw.years,
      [sw.bot50, sw.mid40, sw.next9, sw.top1],
      '% national wealth', EVTS);
    // Per-capita evolution — income (solid) and wealth (dashed) with zones + flags
    (function () {
      const svg = document.getElementById('svgNPC'); if (!svg) return; svg.innerHTML = '';
      const mm = { t: 30, r: 132, b: 36, l: 54 }, w = 820 - mm.l - mm.r, h = 290 - mm.t - mm.b;
      const X = yr => mm.l + (yr - 1955) / (2027 - 1955) * w;
      const LO = Math.log10(0.07), HI = Math.log10(55), LY = v => mm.t + (HI - Math.log10(Math.max(0.07, v))) / (HI - LO) * h;
      // zones
      const y1 = LY(1), y05 = LY(0.5), ybot = mm.t + h;
      svg.appendChild(mk('rect', { x: mm.l, y: y05, width: w, height: ybot - y05, fill: css('--evad'), opacity: .07 }));
      svg.appendChild(mk('rect', { x: mm.l, y: y1, width: w, height: y05 - y1, fill: css('--top'), opacity: .05 }));
      svg.appendChild(txt({ x: mm.l + 6, y: (y05 + ybot) / 2 + 4, 'font-family': 'Archivo', 'font-size': 8.5, 'font-style': 'italic', 'font-weight': 600, fill: css('--evad') }, '⚠ at-risk'));
      svg.appendChild(txt({ x: mm.l + 6, y: (y1 + y05) / 2 + 4, 'font-family': 'Archivo', 'font-size': 8.5, 'font-style': 'italic', fill: css('--muted') }, 'below mean'));
      // grid + y-labels
      [0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50].forEach(v => {
        const y = LY(v);
        svg.appendChild(mk('line', { x1: mm.l, y1: y, x2: mm.l + w, y2: y, stroke: v === 1 ? css('--ink') : css('--rule'), 'stroke-width': v === 1 ? 1.8 : 1, opacity: v === 1 ? 0.5 : 0.7 }));
        svg.appendChild(txt({ x: mm.l - 5, y: y + 3.5, 'text-anchor': 'end', 'font-family': 'Archivo', 'font-size': 9, fill: css('--muted') }, v + 'x'));
      });
      svg.appendChild(txt({ x: mm.l + w * 0.32, y: LY(1) + 13, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 8.5, 'font-style': 'italic', fill: css('--muted') }, 'national mean'));
      // x-axis
      [1961, 1970, 1980, 1991, 2000, 2010, 2022].forEach(yr => svg.appendChild(txt({ x: X(yr), y: mm.t + h + 16, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 9.5, fill: css('--muted') }, yr)));
      // data
      const pcI = D.splitTab.pcIncome, pcW = D.splitTab.pcWealth;
      const BD = [['top1', '--t1', 'Top 1%'], ['next9', '--gst', 'Next 9%'], ['mid40', '--mid', 'Middle 40%'], ['bot50', '--corp', 'Bottom 50%']];
      const rx = mm.l + w + 8;
      BD.forEach(([k, col, n]) => {
        const ipts = pcI.map(r => ({ yr: r.yr, v: r[k] })), wpts = pcW.map(r => ({ yr: r.yr, v: r[k] }));
        svg.appendChild(mk('path', { d: ipts.map((p, i) => (i ? 'L' : 'M') + X(p.yr) + ' ' + LY(p.v)).join(' '), fill: 'none', stroke: css(col), 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
        svg.appendChild(mk('path', { d: wpts.map((p, i) => (i ? 'L' : 'M') + X(p.yr) + ' ' + LY(p.v)).join(' '), fill: 'none', stroke: css(col), 'stroke-width': 2, 'stroke-dasharray': '7 3', 'stroke-linejoin': 'round', opacity: .85 }));
        ipts.forEach(p => { const ci = mk('circle', { cx: X(p.yr), cy: LY(p.v), r: 4.5, fill: css(col), stroke: css('--paper'), 'stroke-width': 1.5 }); ci.addEventListener('mousemove', e => showTip(e, `${n} income ${p.yr}: ${p.v.toFixed(2)}x mean`)); ci.addEventListener('mouseleave', hide); svg.appendChild(ci); });
        wpts.forEach(p => { const cw = mk('circle', { cx: X(p.yr), cy: LY(p.v), r: 4, fill: css('--paper'), stroke: css(col), 'stroke-width': 2 }); cw.addEventListener('mousemove', e => showTip(e, `${n} wealth ${p.yr}: ${p.v.toFixed(2)}x mean`)); cw.addEventListener('mouseleave', hide); svg.appendChild(cw); });
        // 1982 left label
        svg.appendChild(txt({ x: X(1982) - 10, y: LY(ipts[0].v) + 3.5, 'text-anchor': 'end', 'font-family': 'Archivo', 'font-size': 9, 'font-weight': 700, fill: css(col) }, ipts[0].v.toFixed(2) + 'x'));
      });
      // right-side labels at 2022 (income endpoint)
      svg.appendChild(txt({ x: rx, y: LY(22.6) + 4, 'font-family': 'Archivo', 'font-size': 9.5, 'font-weight': 700, fill: css('--t1') }, 'Top 1%  22.6x'));
      svg.appendChild(txt({ x: rx, y: LY(3.9) + 4, 'font-family': 'Archivo', 'font-size': 9.5, 'font-weight': 600, fill: css('--gst') }, 'Next 9%  3.9x'));
      svg.appendChild(txt({ x: rx, y: LY(0.68) + 4, 'font-family': 'Archivo', 'font-size': 9.5, 'font-weight': 600, fill: css('--mid') }, 'Middle 40%  0.68x'));
      svg.appendChild(txt({ x: rx, y: LY(0.30) + 4, 'font-family': 'Archivo', 'font-size': 9.5, 'font-weight': 600, fill: css('--corp') }, 'Bot. 50%  0.30x'));
      // big callouts on right
      // arrows from callout labels to wealth dots
      const arrowLine = (ax, ay, col) => { const tx = X(2022) + 8; svg.appendChild(mk('line', { x1: rx - 4, y1: ay, x2: tx + 8, y2: ay, stroke: css(col), 'stroke-width': 1 })); svg.appendChild(mk('path', { d: `M${tx + 8} ${ay - 4} L${tx} ${ay} L${tx + 8} ${ay + 4}`, fill: 'none', stroke: css(col), 'stroke-width': 1.2 })); };
      arrowLine(rx, LY(40) + 6, '--t1');
      svg.appendChild(txt({ x: rx, y: LY(40) - 2, 'font-family': 'Fraunces', 'font-weight': 900, 'font-size': 17, fill: css('--t1') }, '40x'));
      svg.appendChild(txt({ x: rx, y: LY(40) + 12, 'font-family': 'Archivo', 'font-size': 8.5, fill: css('--t1') }, 'Top 1% wealth'));
      arrowLine(rx, LY(0.128) + 6, '--evad');
      svg.appendChild(txt({ x: rx, y: LY(0.128) - 2, 'font-family': 'Fraunces', 'font-weight': 900, 'font-size': 14, fill: css('--evad') }, '0.13x'));
      svg.appendChild(txt({ x: rx, y: LY(0.128) + 12, 'font-family': 'Archivo', 'font-size': 8.5, fill: css('--evad') }, 'Bot. 50% wealth'));
      // middle-40% crossover note
      const crossX = X(2005), crossY = LY(1);
      svg.appendChild(mk('line', { x1: crossX, y1: crossY, x2: crossX, y2: crossY - 28, stroke: css('--mid'), 'stroke-width': 1.2, 'stroke-dasharray': '2 3' }));
      svg.appendChild(txt({ x: crossX + 3, y: crossY - 30, 'font-family': 'Archivo', 'font-size': 8.5, 'font-weight': 700, fill: css('--mid') }, 'Mid 40% fell below mean ~2005'));
      svg.appendChild(txt({ x: 14, y: mm.t + h / 2, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-size': 10, 'font-weight': 600, fill: css('--ink'), transform: `rotate(-90 14 ${mm.t + h / 2})` }, 'x national mean'));
    })();
  }

  /* ===== controls + tabs ===== */
  function flip(a, b, v) { document.getElementById(a).classList.toggle('on', v); document.getElementById(b).classList.toggle('on', !v); }
  document.getElementById('ixLin').onclick = () => { ixLog = false; flip('ixLin', 'ixLog', true); drawI(); };
  document.getElementById('ixLog').onclick = () => { ixLog = true; flip('ixLin', 'ixLog', false); drawI(); };
  document.getElementById('iyLin').onclick = () => { iyLog = false; flip('iyLin', 'iyLog', true); drawI(); };
  document.getElementById('iyLog').onclick = () => { iyLog = true; flip('iyLin', 'iyLog', false); drawI(); };
  document.getElementById('ievOff').onclick = () => { iEv = false; flip('ievOff', 'ievOn', true); document.getElementById('ilegEv').style.display = 'none'; drawI(); };
  document.getElementById('ievOn').onclick = () => { iEv = true; flip('ievOff', 'ievOn', false); document.getElementById('ilegEv').style.display = 'inline-flex'; drawI(); };
  let iClass = false, iGlobalCls = false;
  document.getElementById('iclOff').onclick = () => { iClass = false; iGlobalCls = false; document.getElementById('iclOff').classList.add('on'); document.getElementById('iclOn').classList.remove('on'); document.getElementById('iclGlob').classList.remove('on'); drawI(); };
  document.getElementById('iclOn').onclick = () => { iClass = true; iGlobalCls = false; document.getElementById('iclOn').classList.add('on'); document.getElementById('iclOff').classList.remove('on'); document.getElementById('iclGlob').classList.remove('on'); drawI(); };
  document.getElementById('iclGlob').onclick = () => { iClass = false; iGlobalCls = true; document.getElementById('iclGlob').classList.add('on'); document.getElementById('iclOff').classList.remove('on'); document.getElementById('iclOn').classList.remove('on'); drawI(); };
  document.getElementById('inc').addEventListener('input', calc); document.getElementById('unit').addEventListener('change', calc);

  const TB = { K: drawK, N: drawN, I: drawI, P: drawParade, S: drawS, W: drawW, E: drawE, R: drawR };
  function tab(n) {
    Object.keys(TB).forEach(k => { document.getElementById('tab' + k).classList.toggle('on', k === n); document.getElementById('p' + k).classList.toggle('on', k === n); });
    if (n !== 'P') { paPlaying = false; cancelAnimationFrame(paRAF); } TB[n]();
  }
  Object.keys(TB).forEach(k => document.getElementById('tab' + k).onclick = () => tab(k));
  drawK();
}

loadData().then(initDashboard).catch(e => {
  const el = document.getElementById('err');
  if (el) { el.style.display = 'block'; el.textContent = 'Failed to load data.json: ' + e.message; }
  console.error(e);
});
