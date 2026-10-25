// click-through for PR #5 (bugloop#1394). Usage: node scripts/click-through-1394.mjs
// env: PW (path to playwright-core, default /tmp/pw/node_modules/playwright-core), BASE (default http://localhost:8765)
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || '/tmp/pw/node_modules/playwright-core');
const BASE = process.env.BASE || 'http://localhost:8765';
const PAGES = { home: '/index.html', landing_he: '/landing/', landing_en: '/landing/en/', me: '/me/' };
const VPS = [[360, 660], [390, 844], [320, 568]];
const OUT = 'docs/screenshots/1394';
const browser = await chromium.launch({ executablePath: '/root/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome' });
const ext = new Map(); // one request per unique URL
const results = { table: {}, controls: [], broken: [] };

async function checkUrl(u) {
  if (ext.has(u)) return ext.get(u);
  let r;
  try {
    let res = await fetch(u, { method: 'HEAD', redirect: 'follow' });
    if (res.status >= 400) res = await fetch(u, { method: 'GET', redirect: 'follow' });
    r = res.status;
  } catch (e) { r = 'ERR ' + e.message; }
  ext.set(u, r);
  return r;
}
const okStatus = (s) => typeof s === 'number' && s < 400;

const state = () => ({
  u: location.href,
  h: document.body.innerHTML.length,
  c: document.documentElement.className + document.body.className,
  a: document.querySelectorAll('[aria-expanded="true"],.open,.active,[open]').length,
});

async function clickAll(page, name, path) {
  const sel = 'a[href], button, [role=button], summary, [onclick]';
  const n = await page.locator(sel).count();
  for (let i = 0; i < n; i++) {
    const loc = page.locator(sel).nth(i);
    const info = await loc.evaluate((e) => ({ tag: e.tagName, href: e.getAttribute('href'), text: (e.innerText || e.getAttribute('aria-label') || e.title || '').trim().slice(0, 40), target: e.getAttribute('target') }));
    const c = { page: name, idx: i, ...info, status: '', ok: true };
    try {
      if (info.tag === 'A' && info.href != null) {
        const h = info.href;
        if (h.startsWith('#')) {
          const id = h.slice(1);
          c.status = h === '#' ? 'top' : (await page.locator(`[id="${id}"], a[name="${id}"]`).count()) ? 'anchor exists' : 'ANCHOR MISSING';
          c.ok = c.status !== 'ANCHOR MISSING';
        } else if (/^(mailto|tel|sms):/.test(h)) {
          c.status = 'scheme ok'; c.ok = h.length > 8;
        } else {
          const abs = new URL(h, BASE + path).href;
          const isLocal = abs.startsWith(BASE);
          const s = await checkUrl(abs.split('#')[0]);
          c.status = (isLocal ? 'local ' : 'ext ') + s; c.ok = okStatus(s);
        }
        // the link must at least be clickable (trial = no navigation)
        await loc.click({ timeout: 3000, trial: true }).catch((e) => { c.ok = false; c.status += ' NOT CLICKABLE ' + e.message.split('\n')[0]; });
      } else {
        const before = await page.evaluate(state);
        await loc.click({ timeout: 3000 });
        await page.waitForTimeout(500);
        const after = await page.evaluate(state);
        const changed = JSON.stringify(before) !== JSON.stringify(after);
        c.status = changed ? 'click changed state' : 'click: no observable change'; c.ok = changed;
        if (after.u !== before.u) await page.goto(BASE + path, { waitUntil: 'networkidle' });
      }
    } catch (e) { c.ok = false; c.status = 'ERR ' + e.message.split('\n')[0]; }
    results.controls.push(c);
    if (!c.ok) results.broken.push(c);
  }
}

for (const [name, path] of Object.entries(PAGES)) {
  results.table[name] = {};
  for (const [w, h] of VPS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/ct-${name}-${w}x${h}.png`, fullPage: true });
    const o = await page.evaluate(() => {
      const iw = innerWidth, bad = [];
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length) continue;
        if (el.closest('svg') || el.children.length || !el.textContent.trim()) continue;
        const r = el.getBoundingClientRect();
        const clipped = el.scrollWidth > el.clientWidth + 1 && !['visible', 'auto', 'scroll'].includes(cs.overflowX) && el.clientWidth > 0;
        const outside = (r.right > iw + 1 || r.left < -1) && r.width > 0 && cs.position !== 'fixed' && !el.closest('[aria-hidden="true"]');
        if (clipped || outside) bad.push((el.tagName + '.' + el.className).slice(0, 60) + ' "' + el.textContent.trim().slice(0, 30) + '"');
      }
      return { sw: document.documentElement.scrollWidth, iw, bad: bad.slice(0, 8) };
    });
    results.table[name][w] = { hscroll: o.sw > o.iw, sw: o.sw, iw: o.iw, textOverflow: o.bad };
    if (w === 390) await clickAll(page, name, path);
    await ctx.close();
  }
}
await browser.close();
const dest = (process.env.LANE_OUT || '/tmp') + '/click-through-1394.json';
fs.writeFileSync(dest, JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
console.log(`controls=${results.controls.length} broken=${results.broken.length}`);
