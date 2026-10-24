/* Option A: a mini product window, like the real app. Report bubble flies into a ticket,
   the ticket turns into a pull request, a ladybug carries the fix back to the page button. Simulation only. */
(function () {
  var L = LAB, el = L.el, tm = L.timers(), reduce = L.reduce;
  var T = {
    fab: 'הדגמה חיה: בקשו מהחיפושית לשנות משהו בדף', hint: 'נסו אותי: בקשו שינוי בדף הזה',
    steps: ['דיווח', 'כרטיס', 'תיקון', 'אישור']
  };
  var f = L.fab(T.fab, T.hint), fab = f.fab;
  var win = el('div', 'aw'); win.setAttribute('role', 'dialog'); win.setAttribute('aria-modal', 'false'); win.setAttribute('aria-label', 'LadyBugLoop'); win.hidden = true;
  win.innerHTML = '<div class="aw-bar"><span class="aw-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="disc" aria-hidden="true">' + L.BUG + '</span><span class="aw-ttl">LadyBugLoop</span><span class="aw-tag">הדגמה</span><button type="button" class="aw-x" aria-label="סגירה">&times;</button></div>' +
    '<ol class="aw-prog">' + T.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol><div class="aw-stage" aria-live="polite"></div>';
  document.body.appendChild(win);
  var stage = win.querySelector('.aw-stage'), lis = win.querySelectorAll('.aw-prog li');
  var color = null;

  function setStep(i) { [].forEach.call(lis, function (li, k) { li.className = k < i ? 'done' : k === i ? 'now' : ''; }); }
  function pickBtns() { return [].slice.call(stage.querySelectorAll('.aw-sw button')); }

  function step1() {
    tm.clear(); setStep(0); color = null; L.unpaint();
    stage.innerHTML = '<div class="aw-b"><h4>מה לשנות?</h4>' +
      '<div class="aw-sw">' + L.COLORS.map(function (c, k) { return '<button type="button" aria-pressed="false" data-k="' + k + '"><i style="background:' + c.c + '"></i>' + c.n + '</button>'; }).join('') + '</div>' +
      '<div class="aw-chat"><div class="aw-bub" aria-live="polite"></div><div class="aw-thumb">' + L.shot(null, 'pink') + '</div></div>' +
      '<div class="aw-row"><button type="button" class="btn pri aw-send" disabled>שליחה</button></div></div>';
    var bub = stage.querySelector('.aw-bub'), th = stage.querySelector('.aw-thumb'), send = stage.querySelector('.aw-send');
    pickBtns().forEach(function (b) {
      b.addEventListener('click', function () {
        tm.clear(); th.classList.remove('on'); th.firstChild.classList.remove('on');
        pickBtns().forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        color = L.COLORS[+b.dataset.k]; send.disabled = true; L.ringOn();
        L.type(bub, 'הכפתור בצבע ' + color.n + '.', tm, function () {
          th.classList.add('on'); th.firstChild.classList.add('on'); send.disabled = false; send.focus({ preventScroll: true });
        });
      });
    });
    send.addEventListener('click', function () { if (color) step2(stage.querySelector('.aw-bub')); });
  }

  function step2(bub) {
    tm.clear(); setStep(1);
    var ra = bub.getBoundingClientRect(), text = bub.textContent;
    stage.innerHTML = '<div class="aw-card"><div class="aw-ch"><span class="aw-tt"><span class="k1">כרטיס</span><span class="k2">Pull request</span></span><span class="aw-id">#128</span></div>' +
      L.shot(color.c, 'pink') + '<b class="aw-t">כפתור בצבע ' + color.n + '</b>' +
      '<div class="aw-st"><div class="aw-rows"><i></i><i></i><i></i></div><ul class="aw-chk"><li>קורא</li><li>כותב</li><li>בודק</li></ul></div>' +
      '<span class="aw-merged">מוכן לאישור</span></div>' +
      '<p class="aw-cap"><span class="aw-n">0.0</span> שניות. כרטיס מוכן.</p><div class="aw-row"><button type="button" class="btn neu aw-next">המשך</button></div>';
    var card = stage.querySelector('.aw-card'), n = stage.querySelector('.aw-n');
    stage.querySelector('.aw-next').addEventListener('click', step3);
    function show() {
      card.classList.add('in');
      tm.later(function () { card.querySelector('.ms').classList.add('on'); }, 350);
      if (reduce) { n.textContent = '9.7'; return; }
      var t0 = performance.now();
      (function g(t) { var k = Math.min(1, (t - t0) / 1500); n.textContent = (9.7 * k).toFixed(1); if (k < 1 && stage.contains(n)) requestAnimationFrame(g); })(t0);
      tm.later(step3, 3600);
    }
    card.style.visibility = 'hidden';
    L.fly(ra, card, '<div class="aw-gtxt">' + text + '</div>', 'card-g', function () { card.style.visibility = ''; show(); });
    if (reduce) { card.style.visibility = ''; }
  }

  function step3() {
    tm.clear(); setStep(2);
    var card = stage.querySelector('.aw-card'); if (!card || !card.classList.contains('in')) return;
    card.classList.add('pr');
    stage.querySelector('.aw-cap').innerHTML = '<span class="aw-chip">כמה דקות אחר כך</span><br>בפועל זה לוקח כמה דקות, ואדם בודק.';
    var nx = stage.querySelector('.aw-next'), items = card.querySelectorAll('.aw-chk li');
    var again = nx.cloneNode(true); again.addEventListener('click', step4); nx.replaceWith(again);
    if (reduce) { [].forEach.call(items, function (i) { i.classList.add('ok'); }); card.classList.add('merged'); return; }
    [0, 1, 2].forEach(function (k) { tm.later(function () { items[k].classList.add('ok'); }, 800 * (k + 1)); });
    tm.later(function () { card.classList.add('merged'); }, 3000);
    tm.later(step4, 4400);
  }

  function step4() {
    tm.clear(); setStep(3);
    var card = stage.querySelector('.aw-card'); if (!card) return;
    var r = card.getBoundingClientRect(), t = L.target();
    var from = { left: r.left + r.width / 2 - 22, top: r.top + r.height / 2 - 22, width: 44, height: 44 };
    function land() {
      L.paint(color); L.ringOff(); card.classList.add('gone');
      tm.later(function () {
        stage.innerHTML = '<div class="aw-b aw-b4"><h4>השינוי עלה.</h4><p>מאשרים?</p><div class="aw-row"><button type="button" class="btn pri aw-ok">לאשר</button><button type="button" class="btn neu aw-back">להחזיר</button></div></div>';
        stage.querySelector('.aw-ok').addEventListener('click', finish);
        stage.querySelector('.aw-back').addEventListener('click', step1);
      }, reduce ? 0 : 320);
    }
    if (t) L.fly(from, t, L.BUG, 'disc-g', land); else land();
  }

  function finish() {
    [].forEach.call(lis, function (li) { li.className = 'done'; });
    stage.innerHTML = '<div class="aw-b aw-b4"><h4>המעגל נסגר.</h4><p>השינוי נשאר עד שתרעננו את הדף.</p><div class="aw-row"><a class="btn pri" href="' + L.MAIL + '">קביעת הדגמה קצרה</a><button type="button" class="btn neu aw-c2">סגירה</button></div></div>';
    stage.querySelector('.aw-c2').addEventListener('click', close);
  }

  function open() {
    f.hint.classList.remove('dm-on'); tm.clear(); L.toTarget();
    win.hidden = false; void win.offsetWidth; win.classList.add('open'); fab.setAttribute('aria-expanded', 'true');
    step1();
  }
  function close() {
    tm.clear(); L.ringOff(); win.classList.remove('open'); fab.setAttribute('aria-expanded', 'false');
    tm.later(function () { win.hidden = true; }, reduce ? 0 : 400); fab.focus({ preventScroll: true });
  }
  fab.addEventListener('click', function () { if (win.classList.contains('open')) close(); else open(); });
  win.querySelector('.aw-x').addEventListener('click', close);
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !win.hidden) close(); });
  [].forEach.call(document.querySelectorAll('[data-demo-open]'), function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(); }); });

  /* page motion that is specific to A: the three how-steps slide in from alternating sides */
  [].forEach.call(document.querySelectorAll('.how li'), function (li, i) { li.style.setProperty('--dx', (i % 2 ? '-' : '') + '22px'); });
})();
