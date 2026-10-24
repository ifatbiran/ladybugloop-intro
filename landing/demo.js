/* Live demo on the landing page: the visitor asks the ladybug to change a button colour,
   a ticket opens, bugloop.studio "fixes" it, the page changes, the visitor approves.
   Simulation only, nothing leaves the browser. Same file for the Hebrew and English pages. */
(function () {
  var he = (document.documentElement.lang || 'he').slice(0, 2) === 'he';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COLORS = [
    { he: 'סגול', en: 'Purple', c: '#6b3fd4' },
    { he: 'טורקיז', en: 'Teal', c: '#0f7c80' },
    { he: 'כתום', en: 'Orange', c: '#d9480f' },
    { he: 'ירוק', en: 'Green', c: '#2b8a3e' }
  ];
  var T = he ? {
    fab: 'הדגמה חיה: בקשו מהחיפושית לשנות משהו בדף', hint: 'נסו אותי: בקשו שינוי בדף הזה',
    ttl: 'דיווח חדש', tag: 'הדגמה', close: 'סגירה',
    steps: ['דיווח', 'כרטיס', 'תיקון', 'אישור'],
    s1h: 'מה לשנות?', voice: 'בקול', text: 'בכתב', pick: 'באיזה צבע לצבוע את כפתור ההדגמה?',
    note: function (n) { return 'אני רוצה את כפתור ההדגמה בצבע ' + n + '.'; },
    att: ['צילום מסך', 'סימון על המסך', 'פרטי הדפדפן'], send: 'שליחה',
    s2h: 'נפתח כרטיס', title: function (n) { return 'כפתור ההדגמה: לצבוע ב' + n; },
    labs: ['שינוי', 'עיצוב'], li: ['איפה: דף הנחיתה, הכפתור הראשי', 'מה ביקשו: צבע אחר', 'מצורף: צילום מסך עם סימון'],
    timer: 'הכרטיס מוכן תוך', sec: 'שניות', next: 'המשך',
    skip: 'כמה דקות אחר כך', real: 'בהדגמה הזמן מקוצר. בפועל התיקון לוקח כמה דקות, ואדם בודק אותו לפני שהוא עולה.', s3h: 'bugloop.studio מתקן', chk: ['קורא את הכרטיס', 'כותב את השינוי', 'בודק ומעלה'],
    s4h: 'הבודק מאשר', s4p: 'השינוי עלה. מסתכלים על הדף ומאשרים בקליק.', ok: 'לאשר', back: 'להחזיר',
    fin: 'המעגל נסגר: מהבקשה ועד האישור, בלי טופס אחד.', finp: 'השינוי נשאר רק אצלכם, עד שתרעננו את הדף.',
    demo: 'קביעת הדגמה קצרה'
  } : {
    fab: 'Live demo: ask the ladybug to change something on this page', hint: 'Try me: ask for a change on this page',
    ttl: 'New report', tag: 'Demo', close: 'Close',
    steps: ['Report', 'Ticket', 'Fix', 'Approve'],
    s1h: 'What should change?', voice: 'Voice', text: 'Text', pick: 'Which colour for the demo button?',
    note: function (n) { return 'I want the demo button in ' + n.toLowerCase() + '.'; },
    att: ['Screenshot', 'Marked on screen', 'Browser details'], send: 'Send',
    s2h: 'Ticket opened', title: function (n) { return 'Demo button: make it ' + n.toLowerCase(); },
    labs: ['change', 'design'], li: ['Where: landing page, main button', 'Asked for: a different colour', 'Attached: marked screenshot'],
    timer: 'Ticket ready in', sec: 'seconds', next: 'Next',
    skip: 'A few minutes later', real: 'Time is shortened in this demo. In real life the fix takes a few minutes, and a person reviews it before it ships.', s3h: 'bugloop.studio fixes it', chk: ['Reads the ticket', 'Writes the change', 'Checks and ships'],
    s4h: 'The tester approves', s4p: 'The change is live. Look at the page and approve in one click.', ok: 'Approve', back: 'Undo',
    fin: 'Loop closed: from the request to the approval, without a single form.', finp: 'The change stays only on your screen until you reload.',
    demo: 'Book a short demo'
  };
  var BUG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><ellipse cx="12" cy="13" rx="7.5" ry="8" fill="#ffffff"/><path d="M12 5.5c-1.6 0-3 .7-4 1.8.9 1.1 2.4 1.7 4 1.7s3.1-.6 4-1.7c-1-1.1-2.4-1.8-4-1.8z" fill="#2a1240"/><path d="M12 5v16" stroke="#2a1240" stroke-width="1.2"/><circle cx="8.6" cy="12" r="1.15" fill="#2a1240"/><circle cx="15.4" cy="12" r="1.15" fill="#2a1240"/><circle cx="8.2" cy="16" r="1.05" fill="#2a1240"/><circle cx="15.8" cy="16" r="1.05" fill="#2a1240"/><circle cx="10" cy="3.6" r="1.3" fill="#2a1240"/><circle cx="14" cy="3.6" r="1.3" fill="#2a1240"/></svg>';
  var MAIL = 'mailto:ifatbiran@gmail.com?subject=LadyBugLoop%20demo';

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, reduce ? Math.min(ms, 150) : ms)); }
  function clearAll() { timers.forEach(clearTimeout); timers = []; }

  /* count-up on the number tiles (final value is already in the HTML) */
  function countUp() {
    if (reduce || !('IntersectionObserver' in window)) return;
    var nums = [].slice.call(document.querySelectorAll('.tile b'));
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        var b = e.target, m = /^(\d+)(\+?)$/.exec(b.textContent.trim()); if (!m) return;
        var to = +m[1], plus = m[2], t0 = performance.now(), d = 900;
        (function f(t) { var k = Math.min(1, (t - t0) / d); b.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + plus; if (k < 1) requestAnimationFrame(f); })(t0);
      });
    }, { threshold: .6 });
    nums.forEach(function (b) { io.observe(b); });
  }

  /* build */
  var fab = el('button', 'dm-fab', BUG + '<span class="dm-pulse"></span>');
  fab.type = 'button'; fab.setAttribute('aria-label', T.fab); fab.setAttribute('aria-haspopup', 'dialog');
  var hint = el('div', 'dm-hint', T.hint); hint.setAttribute('aria-hidden', 'true');
  var sheet = el('div', 'dm-sheet'); sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'false'); sheet.setAttribute('aria-label', T.ttl); sheet.hidden = true;
  sheet.innerHTML = '<div class="dm-head"><span class="disc" aria-hidden="true">' + BUG + '</span><span class="dm-ttl">' + T.ttl + '</span><span class="dm-tag">' + T.tag + '</span><button type="button" class="dm-x" aria-label="' + T.close + '">&times;</button></div>' +
    '<ol class="dm-steps">' + T.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol><div class="dm-body" aria-live="polite"></div>';
  var ring = el('div', 'dm-ring', '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M50 3 C78 3 97 24 97 50 C97 76 78 97 50 97 C22 97 3 76 3 50 C3 24 22 3 50 3"/></svg>');
  document.body.appendChild(ring); document.body.appendChild(hint); document.body.appendChild(fab); document.body.appendChild(sheet);
  var body = sheet.querySelector('.dm-body'), lis = sheet.querySelectorAll('.dm-steps li');
  var color = null, target = null;

  function setStep(i) { [].forEach.call(lis, function (li, k) { li.className = k < i ? 'dm-done' : k === i ? 'dm-now' : ''; }); }
  function firstVisiblePri() {
    var all = [].slice.call(document.querySelectorAll('main .btn.pri'));
    return all[0] || null;
  }
  function placeRing() {
    if (!target) return; var r = target.getBoundingClientRect(), p = 14;
    ring.style.left = (r.left + scrollX - p) + 'px'; ring.style.top = (r.top + scrollY - p) + 'px';
    ring.style.width = (r.width + 2 * p) + 'px'; ring.style.height = (r.height + 2 * p) + 'px';
  }
  function showRing() { placeRing(); ring.classList.add('dm-vis'); ring.classList.remove('dm-on', 'dm-fade'); void ring.offsetWidth; ring.classList.add('dm-on'); }
  function hideRing() { ring.classList.add('dm-fade'); later(function () { ring.classList.remove('dm-vis', 'dm-on'); }, 450); }
  addEventListener('resize', placeRing);

  function type(node, text, done) {
    node.innerHTML = '<span></span><i class="dm-caret"></i>'; var s = node.firstChild, i = 0;
    if (reduce) { s.textContent = text; return later(done, 50); }
    (function step() { s.textContent = text.slice(0, ++i); if (i < text.length) later(step, 32); else later(done, 250); })();
  }

  function step1() {
    setStep(0); color = null;
    body.innerHTML = '<div class="dm-top1"><h4>' + T.s1h + '</h4><div class="dm-modes"><span class="dm-mode">' + T.voice + '</span><span class="dm-mode dm-sel">' + T.text + '</span></div></div>' +
      '<p>' + T.pick + '</p><div class="dm-sw">' + COLORS.map(function (c, k) { return '<button type="button" aria-pressed="false" data-k="' + k + '"><i style="background:' + c.c + '"></i>' + c[he ? 'he' : 'en'] + '</button>'; }).join('') + '</div>' +
      '<div class="dm-note"></div><div class="dm-att">' + T.att.map(function (a) { return '<span>' + a + '</span>'; }).join('') + '</div>' +
      '<div class="dm-row"><button type="button" class="btn pri dm-send" disabled>' + T.send + '</button></div>';
    var note = body.querySelector('.dm-note'), send = body.querySelector('.dm-send');
    [].forEach.call(body.querySelectorAll('.dm-sw button'), function (b) {
      b.addEventListener('click', function () {
        clearAll();
        [].forEach.call(body.querySelectorAll('.dm-sw button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        color = COLORS[+b.dataset.k]; send.disabled = true; showRing();
        type(note, T.note(color[he ? 'he' : 'en']), function () { body.querySelector('.dm-att').classList.add('dm-on'); send.disabled = false; sheet.scrollTop = sheet.scrollHeight; send.focus({ preventScroll: true }); });
      });
    });
    send.addEventListener('click', function () { if (color) step2(); });
  }
  function step2() {
    setStep(1); var n = color[he ? 'he' : 'en'];
    body.innerHTML = '<h4>' + T.s2h + '</h4><div class="dm-ticket"><b>' + T.title(n) + '</b>' + T.labs.map(function (l) { return '<span class="dm-lab">' + l + '</span>'; }).join('') +
      '<ul>' + T.li.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul><code>page: /landing/  ·  element: .btn.pri  ·  viewport: ' + innerWidth + 'x' + innerHeight + '</code></div>' +
      '<div class="dm-timer">' + T.timer + ' <span>0.0</span> ' + T.sec + '</div><div class="dm-row"><button type="button" class="btn neu dm-next">' + T.next + '</button></div>';
    var out = body.querySelector('.dm-timer span'), t0 = performance.now(), end = 9.7, d = reduce ? 1 : 1600;
    (function f(t) { var k = Math.min(1, (t - t0) / d); out.textContent = (end * k).toFixed(1); if (k < 1 && body.contains(out)) requestAnimationFrame(f); })(t0);
    body.querySelector('.dm-next').addEventListener('click', function () { clearAll(); step3(); });
    later(step3, 3400);
  }
  function step3() {
    setStep(2);
    body.innerHTML = '<span class="dm-skip">' + T.skip + '</span><h4>' + T.s3h + '</h4><ul class="dm-check">' + T.chk.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul><p class="dm-real">' + T.real + '</p>';
    var items = body.querySelectorAll('.dm-check li');
    [0, 1, 2].forEach(function (k) { later(function () { items[k].classList.add('dm-ok'); }, 900 * (k + 1)); });
    later(function () {
      document.documentElement.style.setProperty('--dm-c', color.c);
      document.documentElement.classList.add('dm-c');
      if (target) { target.classList.remove('dm-flash'); void target.offsetWidth; target.classList.add('dm-flash'); }
      hideRing();
    }, 3100);
    later(step4, 5200);
  }
  function step4() {
    setStep(3);
    body.innerHTML = '<h4>' + T.s4h + '</h4><p>' + T.s4p + '</p><div class="dm-row"><button type="button" class="btn pri dm-ok">' + T.ok + '</button><button type="button" class="btn neu dm-back">' + T.back + '</button></div>';
    body.querySelector('.dm-ok').addEventListener('click', function () {
      [].forEach.call(lis, function (li) { li.className = 'dm-done'; });
      body.innerHTML = '<p class="dm-fin">' + T.fin + '</p><p>' + T.finp + '</p><div class="dm-row"><a class="btn pri" href="' + MAIL + '">' + T.demo + '</a><button type="button" class="btn neu dm-close2">' + T.close + '</button></div>';
      body.querySelector('.dm-close2').addEventListener('click', close);
    });
    body.querySelector('.dm-back').addEventListener('click', function () {
      document.documentElement.classList.remove('dm-c'); step1();
    });
  }

  function open() {
    hint.classList.remove('dm-on'); clearAll();
    target = firstVisiblePri();
    if (target) { var r = target.getBoundingClientRect(); if (r.top < 70 || r.bottom > innerHeight * .30) scrollTo({ top: Math.max(0, scrollY + r.top - 90), behavior: reduce ? 'auto' : 'smooth' }); }
    sheet.hidden = false; void sheet.offsetWidth; sheet.classList.add('dm-open'); fab.setAttribute('aria-expanded', 'true');
    step1(); later(function () { var b = body.querySelector('.dm-sw button'); if (b) b.focus({ preventScroll: true }); }, 500);
  }
  function close() {
    clearAll(); hideRing(); sheet.classList.remove('dm-open'); fab.setAttribute('aria-expanded', 'false');
    setTimeout(function () { sheet.hidden = true; }, reduce ? 0 : 450); fab.focus({ preventScroll: true });
  }
  fab.addEventListener('click', function () { if (sheet.classList.contains('dm-open')) close(); else open(); });
  sheet.querySelector('.dm-x').addEventListener('click', close);
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) close(); });
  [].forEach.call(document.querySelectorAll('[data-demo-open]'), function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(); }); });
  addEventListener('scroll', function () { if (!sheet.hidden) placeRing(); }, { passive: true });

  setTimeout(function () { if (sheet.hidden) { hint.classList.add('dm-on'); setTimeout(function () { hint.classList.remove('dm-on'); }, 7000); } }, 1500);
  countUp();
})();
