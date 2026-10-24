/* Option B: a loop diagram. One token travels the circle: report -> ticket -> fix -> approve,
   the fix flies back to the page, and on approval the token completes the circle. Simulation only. */
(function () {
  var L = LAB, el = L.el, tm = L.timers(), reduce = L.reduce;
  var f = L.fab('הדגמה חיה: בקשו מהחיפושית לשנות משהו בדף', 'נסו אותי: בקשו שינוי בדף הזה'), fab = f.fab;
  var NAMES = ['דיווח', 'כרטיס', 'תיקון', 'אישור'];
  var ICONS = [
    '<path d="M4 5h16v11H9l-5 4z"/>',
    '<path d="M4 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2h16v-2a2 2 0 0 1 0-4v0a2 2 0 0 0 0-4V6H4z"/>',
    '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 8v8M8 6h4a4 4 0 0 1 4 4v0"/>',
    '<path d="M5 12.5l4.5 4.5L19 7"/>'
  ];
  var pan = el('div', 'bd'); pan.setAttribute('role', 'dialog'); pan.setAttribute('aria-modal', 'false'); pan.setAttribute('aria-label', 'LadyBugLoop'); pan.hidden = true;
  pan.innerHTML = '<div class="bd-bar"><span class="disc" aria-hidden="true">' + L.BUG + '</span><span class="bd-ttl">LadyBugLoop</span><span class="bd-tag">הדגמה</span><button type="button" class="bd-x" aria-label="סגירה">&times;</button></div>' +
    '<div class="bd-ring"><svg class="bd-arcs" aria-hidden="true"></svg>' +
    NAMES.map(function (n, k) { return '<div class="bd-n n' + k + '"><span class="bd-dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[k] + '</svg></span><span class="bd-lb">' + n + '</span></div>'; }).join('') +
    '<div class="bd-c c1 on"><span class="disc" aria-hidden="true">' + L.BUG + '</span></div>' +
    '<div class="bd-c c2"><div class="bd-sh">' + L.shot(null, 'pink') + '</div></div>' +
    '<div class="bd-c c3"><div class="bd-pr"><b>PR #128</b><i></i><i></i><i></i></div></div>' +
    '<div class="bd-tok t-rep" aria-hidden="true"></div></div>' +
    '<div class="bd-cap" aria-live="polite"><h4></h4><p></p></div><div class="bd-ctl"></div>';
  document.body.appendChild(pan);
  var ringBox = pan.querySelector('.bd-ring'), svg = pan.querySelector('.bd-arcs'), tok = pan.querySelector('.bd-tok');
  var nodes = pan.querySelectorAll('.bd-n'), cs = pan.querySelectorAll('.bd-c'), h4 = pan.querySelector('.bd-cap h4'), cp = pan.querySelector('.bd-cap p'), ctl = pan.querySelector('.bd-ctl');
  var color = null, R = 80, arcs = [];

  function ang(k) { return -90 + 90 * k; }
  function pt(a) { var r = a * Math.PI / 180; return [R * Math.cos(r), R * Math.sin(r)]; }
  function tf(a) { var p = pt(a); return 'translate(' + p[0].toFixed(1) + 'px,' + p[1].toFixed(1) + 'px)'; }
  function geo() {
    var s = ringBox.offsetHeight; if (!s) return; R = s / 2 - 19;
    svg.setAttribute('viewBox', '0 0 ' + s + ' ' + s); svg.innerHTML = ''; arcs = [];
    for (var k = 0; k < 4; k++) {
      var a0 = (ang(k) + 17) * Math.PI / 180, a1 = (ang(k + 1) - 17) * Math.PI / 180, c = s / 2;
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', 'M' + (c + R * Math.cos(a0)) + ' ' + (c + R * Math.sin(a0)) + 'A' + R + ' ' + R + ' 0 0 1 ' + (c + R * Math.cos(a1)) + ' ' + (c + R * Math.sin(a1)));
      svg.appendChild(p); arcs.push(p);
    }
  }
  function place(k) { tok.style.transform = tf(ang(k)); }
  function move(k0, k1, cb) {
    if (reduce || !tok.animate) { place(k1); return cb && cb(); }
    var kf = []; for (var i = 0; i <= 9; i++) kf.push({ transform: tf(ang(k0) + (ang(k1) - ang(k0)) * i / 9) });
    var an = tok.animate(kf, { duration: 1000, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
    an.onfinish = function () { place(k1); an.cancel(); if (cb) cb(); };
  }
  function mark(now) {
    [].forEach.call(nodes, function (n, k) { n.className = 'bd-n n' + k + (k < now ? ' done' : k === now ? ' now' : ''); });
    arcs.forEach(function (a, k) { a.setAttribute('class', k < now ? 'lit' : ''); });
  }
  function centre(i) { [].forEach.call(cs, function (c, k) { c.classList.toggle('on', k === i); }); }
  function say(h, p) { h4.textContent = h; cp.innerHTML = p || '&nbsp;'; var c = pan.querySelector('.bd-cap'); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
  function nextBtn(fn) { ctl.innerHTML = '<button type="button" class="btn neu bd-next">המשך</button>'; ctl.firstChild.addEventListener('click', fn); }

  function step1() {
    tm.clear(); color = null; L.unpaint(); L.ringOff(); pan.classList.remove('low');
    tok.className = 'bd-tok t-rep'; place(0); mark(0); centre(0);
    pan.querySelector('.c2 .ms').classList.remove('on');
    say('מה לשנות?', '');
    ctl.innerHTML = '<div class="bd-sw">' + L.COLORS.map(function (c, k) { return '<button type="button" aria-pressed="false" aria-label="' + c.n + '" data-k="' + k + '"><i style="background:' + c.c + '"></i></button>'; }).join('') + '</div><button type="button" class="btn pri bd-send" disabled>שליחה</button>';
    var send = ctl.querySelector('.bd-send');
    [].forEach.call(ctl.querySelectorAll('.bd-sw button'), function (b) {
      b.addEventListener('click', function () {
        tm.clear();
        [].forEach.call(ctl.querySelectorAll('.bd-sw button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        color = L.COLORS[+b.dataset.k]; send.disabled = true; L.ringOn();
        L.type(cp, 'הכפתור בצבע ' + color.n + '.', tm, function () { send.disabled = false; send.focus({ preventScroll: true }); });
      });
    });
    send.addEventListener('click', function () { if (color) step2(); });
  }
  function step2() {
    tm.clear(); ctl.innerHTML = '';
    say('נפתח כרטיס.', '<span class="bd-n9">0.0</span> שניות. כרטיס מוכן.');
    pan.querySelector('.c2 .ms').style.setProperty('--c', color.c);
    move(0, 1, function () {
      mark(1); tok.className = 'bd-tok t-tkt'; centre(1);
      tm.later(function () { pan.querySelector('.c2 .ms').classList.add('on'); }, 250);
      var n = cp.querySelector('.bd-n9'), t0 = performance.now();
      if (reduce) n.textContent = '9.7'; else (function g(t) { var k = Math.min(1, (t - t0) / 1400); n.textContent = (9.7 * k).toFixed(1); if (k < 1 && pan.contains(n)) requestAnimationFrame(g); })(t0);
      nextBtn(step3);
      if (!reduce) tm.later(step3, 3200);
    });
  }
  function step3() {
    if (!pan.querySelector('.bd-next') || !pan.querySelector('.c2.on')) return;
    tm.clear(); ctl.innerHTML = '';
    say('bugloop.studio מתקן.', '<span class="bd-chip">כמה דקות אחר כך</span> ואדם בודק.');
    var rows = pan.querySelectorAll('.bd-pr i'); [].forEach.call(rows, function (r) { r.classList.remove('ok'); });
    move(1, 2, function () {
      mark(2); tok.className = 'bd-tok t-pr'; centre(2);
      if (reduce) { [].forEach.call(rows, function (r) { r.classList.add('ok'); }); nextBtn(step4); return; }
      [0, 1, 2].forEach(function (k) { tm.later(function () { rows[k].classList.add('ok'); }, 700 * (k + 1)); });
      tm.later(step4, 2700);
      nextBtn(step4);
    });
  }
  function step4() {
    tm.clear(); ctl.innerHTML = '';
    move(2, 3, function () {
      mark(3); tok.className = 'bd-tok t-ok'; centre(0);
      var t = L.target();
      function landed() {
        L.paint(color); L.ringOff(); say('השינוי עלה.', 'מאשרים?');
        ctl.innerHTML = '<button type="button" class="btn pri bd-ok">לאשר</button><button type="button" class="btn neu bd-back">להחזיר</button>';
        ctl.querySelector('.bd-ok').addEventListener('click', finish);
        ctl.querySelector('.bd-back').addEventListener('click', step1);
        tm.later(function () { pan.classList.add('low'); }, reduce ? 0 : 500);
      }
      if (t) L.fly(tok, t, L.BUG, 'disc-g', landed); else landed();
    });
  }
  function finish() {
    tm.clear(); pan.classList.remove('low'); ctl.innerHTML = '';
    tm.later(function () {
      move(3, 4, function () {
        mark(4); [].forEach.call(nodes, function (n) { n.classList.add('done'); }); arcs.forEach(function (a) { a.setAttribute('class', 'lit'); });
        tok.className = 'bd-tok t-rep'; say('המעגל נסגר.', 'השינוי נשאר עד שתרעננו את הדף.');
        ctl.innerHTML = '<a class="btn pri" href="' + L.MAIL + '">קביעת הדגמה קצרה</a><button type="button" class="btn neu bd-c2x">סגירה</button>';
        ctl.querySelector('.bd-c2x').addEventListener('click', close);
      });
    }, reduce ? 0 : 400);
  }

  function open() {
    f.hint.classList.remove('dm-on'); tm.clear(); L.toTarget();
    pan.hidden = false; void pan.offsetWidth; geo(); pan.classList.add('open'); fab.setAttribute('aria-expanded', 'true'); step1();
  }
  function close() {
    tm.clear(); L.ringOff(); pan.classList.remove('open'); fab.setAttribute('aria-expanded', 'false');
    tm.later(function () { pan.hidden = true; }, reduce ? 0 : 420); fab.focus({ preventScroll: true });
  }
  addEventListener('resize', function () { if (!pan.hidden) { geo(); } });
  fab.addEventListener('click', function () { if (pan.classList.contains('open')) close(); else open(); });
  pan.querySelector('.bd-x').addEventListener('click', close);
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pan.hidden) close(); });
  [].forEach.call(document.querySelectorAll('[data-demo-open]'), function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(); }); });

  /* page motion specific to B: the numbered how-steps are joined by a line that draws down as you scroll in */
  var how = document.querySelector('.how'); if (how) how.classList.add('linked');
})();
