/* Option C: cinematic. A full-screen dark scene, one huge word per beat, a ticket wiping in,
   then the scene shrinks to a strip so the page change is seen live. Simulation only. */
(function () {
  var L = LAB, el = L.el, tm = L.timers(), reduce = L.reduce;
  var f = L.fab('הדגמה חיה: בקשו מהחיפושית לשנות משהו בדף', 'נסו אותי: בקשו שינוי בדף הזה'), fab = f.fab;
  var cn = el('div', 'cn'); cn.setAttribute('role', 'dialog'); cn.setAttribute('aria-modal', 'false'); cn.setAttribute('aria-label', 'LadyBugLoop'); cn.hidden = true;
  cn.innerHTML = '<div class="cn-top"><ol class="cn-seg"><li></li><li></li><li></li><li></li></ol><button type="button" class="cn-x" aria-label="סגירה">&times;</button></div>' +
    '<div class="cn-no" aria-hidden="true">01</div><div class="cn-bug" aria-hidden="true">' + L.BUG + '</div>' +
    '<div class="cn-main" aria-live="polite"><h3 class="cn-big"></h3><p class="cn-sub"></p></div>' +
    '<div class="cn-prop"></div><div class="cn-ctl"></div>';
  document.body.appendChild(cn);
  var segs = cn.querySelectorAll('.cn-seg li'), no = cn.querySelector('.cn-no'), big = cn.querySelector('.cn-big'), sub = cn.querySelector('.cn-sub'), prop = cn.querySelector('.cn-prop'), ctl = cn.querySelector('.cn-ctl');
  var color = null;

  function seg(i) { [].forEach.call(segs, function (s, k) { s.className = k < i ? 'done' : k === i ? 'now' : ''; }); no.textContent = '0' + (i + 1); }
  /* a beat: big word wipes in with clip-path, sub line fades up */
  function scene(i, word, line) {
    seg(i); cn.classList.remove('low', 'work');
    big.textContent = word; sub.innerHTML = line || '&nbsp;';
    cn.classList.remove('beat'); void cn.offsetWidth; cn.classList.add('beat');
  }
  function sw() { return '<div class="cn-sw">' + L.COLORS.map(function (c, k) { return '<button type="button" aria-pressed="false" aria-label="' + c.n + '" data-k="' + k + '"><i style="background:' + c.c + '"></i></button>'; }).join('') + '</div>'; }

  function step1() {
    tm.clear(); color = null; L.unpaint(); L.ringOff();
    scene(0, 'ביקשתם.', 'באיזה צבע הכפתור?');
    prop.innerHTML = sw();
    ctl.innerHTML = '<button type="button" class="btn pri cn-send" disabled>שליחה</button>';
    var send = ctl.querySelector('.cn-send');
    [].forEach.call(prop.querySelectorAll('.cn-sw button'), function (b) {
      b.addEventListener('click', function () {
        tm.clear();
        [].forEach.call(prop.querySelectorAll('.cn-sw button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        color = L.COLORS[+b.dataset.k]; send.disabled = true;
        L.type(sub, 'הכפתור בצבע ' + color.n + '.', tm, function () { send.disabled = false; send.focus({ preventScroll: true }); });
      });
    });
    send.addEventListener('click', function () { if (color) step2(); });
  }
  function step2() {
    tm.clear();
    scene(1, 'כרטיס.', '<span class="cn-n">0.0</span> שניות. מוכן.');
    prop.innerHTML = '<div class="cn-tk"><div class="cn-tkh"><b>#128</b><span>כפתור בצבע ' + color.n + '</span></div>' + L.shot(color.c, 'pink') + '<div class="cn-rows"><i></i><i></i><i></i></div></div>';
    var tk = prop.querySelector('.cn-tk'); tk.classList.add('in');
    tm.later(function () { tk.querySelector('.ms').classList.add('on'); }, reduce ? 0 : 700);
    var n = sub.querySelector('.cn-n'), t0 = performance.now();
    if (reduce) n.textContent = '9.7'; else (function g(t) { var k = Math.min(1, (t - t0) / 1500); n.textContent = (9.7 * k).toFixed(1); if (k < 1 && cn.contains(n)) requestAnimationFrame(g); })(t0);
    ctl.innerHTML = '<button type="button" class="btn pri cn-next">המשך</button>'; ctl.firstChild.addEventListener('click', step3);
    if (!reduce) tm.later(step3, 3800);
  }
  function step3() {
    if (!prop.querySelector('.cn-tk')) return;
    tm.clear();
    scene(2, 'תיקון.', '<span class="cn-chip">כמה דקות אחר כך</span> ואדם בודק.');
    cn.classList.add('work'); var tk = prop.querySelector('.cn-tk'); tk.classList.add('pr'); tk.querySelector('.cn-tkh b').textContent = 'PR #128';
    var rows = tk.querySelectorAll('.cn-rows i');
    ctl.innerHTML = '<button type="button" class="btn pri cn-next">המשך</button>'; ctl.firstChild.addEventListener('click', step4);
    if (reduce) { [].forEach.call(rows, function (r) { r.classList.add('ok'); }); return; }
    [0, 1, 2].forEach(function (k) { tm.later(function () { rows[k].classList.add('ok'); }, 700 * (k + 1)); });
    tm.later(step4, 3500);
  }
  function step4() {
    if (!prop.querySelector('.cn-tk.pr')) return;
    tm.clear(); ctl.innerHTML = '';
    var tk = prop.querySelector('.cn-tk'), r = tk.getBoundingClientRect(), t = L.target();
    var from = { left: r.left + r.width / 2 - 22, top: r.top + r.height / 2 - 22, width: 44, height: 44 };
    cn.classList.remove('work'); cn.classList.add('low'); seg(3);
    tm.later(function () {
      function landed() {
        L.paint(color);
        big.textContent = 'עלה לדף.'; sub.innerHTML = 'מאשרים?'; cn.classList.remove('beat'); void cn.offsetWidth; cn.classList.add('beat');
        prop.innerHTML = '';
        ctl.innerHTML = '<button type="button" class="btn pri cn-ok">לאשר</button><button type="button" class="btn neu cn-back">להחזיר</button>';
        ctl.querySelector('.cn-ok').addEventListener('click', finish);
        ctl.querySelector('.cn-back').addEventListener('click', step1);
      }
      if (t && !reduce) { prop.innerHTML = ''; L.fly(from, t, L.BUG, 'disc-g', landed); } else landed();
    }, reduce ? 0 : 650);
  }
  function finish() {
    cn.classList.remove('low');
    [].forEach.call(segs, function (s) { s.className = 'done'; }); no.textContent = '04';
    big.textContent = 'נסגר.'; sub.textContent = 'השינוי נשאר עד שתרעננו את הדף.';
    cn.classList.remove('beat'); void cn.offsetWidth; cn.classList.add('beat');
    ctl.innerHTML = '<a class="btn pri" href="' + L.MAIL + '">קביעת הדגמה קצרה</a><button type="button" class="btn neu cn-c2">סגירה</button>';
    ctl.querySelector('.cn-c2').addEventListener('click', close);
  }

  function open() {
    f.hint.classList.remove('dm-on'); tm.clear(); L.toTarget();
    cn.hidden = false; cn.classList.remove('low'); void cn.offsetWidth; cn.classList.add('open'); fab.setAttribute('aria-expanded', 'true');
    step1();
  }
  function close() {
    tm.clear(); L.ringOff(); cn.classList.remove('open'); fab.setAttribute('aria-expanded', 'false');
    tm.later(function () { cn.hidden = true; cn.classList.remove('low'); }, reduce ? 0 : 650); fab.focus({ preventScroll: true });
  }
  fab.addEventListener('click', function () { if (cn.classList.contains('open')) close(); else open(); });
  cn.querySelector('.cn-x').addEventListener('click', close);
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !cn.hidden) close(); });
  [].forEach.call(document.querySelectorAll('[data-demo-open]'), function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(); }); });

  /* page motion specific to C: the two big marketing lines wipe in line by line (clip-path) */
  var big1 = document.querySelector('.lines .big');
  if (big1) { big1.classList.add('wipe'); big1.innerHTML = big1.innerHTML.split('<br>').map(function (s) { return '<span class="wl"><span>' + s + '</span></span>'; }).join(''); }
})();
