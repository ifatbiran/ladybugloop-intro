/* demo-lab shared helpers. Plain JS, no dependencies. Motion = transform/opacity/clip-path only.
   Under prefers-reduced-motion nothing auto-advances: every beat waits for its own button. */
(function () {
  var L = window.LAB = {};
  var rm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
  L.reduce = !!(rm && rm.matches);
  L.BUG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><ellipse cx="12" cy="13" rx="7.5" ry="8" fill="#ffffff"/><path d="M12 5.5c-1.6 0-3 .7-4 1.8.9 1.1 2.4 1.7 4 1.7s3.1-.6 4-1.7c-1-1.1-2.4-1.8-4-1.8z" fill="#2a1240"/><path d="M12 5v16" stroke="#2a1240" stroke-width="1.2"/><circle cx="8.6" cy="12" r="1.15" fill="#2a1240"/><circle cx="15.4" cy="12" r="1.15" fill="#2a1240"/><circle cx="8.2" cy="16" r="1.05" fill="#2a1240"/><circle cx="15.8" cy="16" r="1.05" fill="#2a1240"/><circle cx="10" cy="3.6" r="1.3" fill="#2a1240"/><circle cx="14" cy="3.6" r="1.3" fill="#2a1240"/></svg>';
  L.COLORS = [
    { n: 'סגול', c: '#6b3fd4' }, { n: 'טורקיז', c: '#0f7c80' },
    { n: 'כתום', c: '#d9480f' }, { n: 'ירוק', c: '#2b8a3e' }
  ];
  L.MAIL = 'mailto:ifatbiran@gmail.com?subject=LadyBugLoop%20demo';

  L.el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  L.timers = function () {
    var t = [];
    return { later: function (fn, ms) { t.push(setTimeout(fn, ms)); }, clear: function () { t.forEach(clearTimeout); t = []; } };
  };

  /* typing effect; reduced motion = instant */
  L.type = function (node, text, tm, done) {
    node.innerHTML = '<span></span><i class="lb-caret"></i>';
    var s = node.firstChild, i = 0;
    if (L.reduce) { s.textContent = text; node.lastChild.remove(); return tm.later(done, 0); }
    (function step() { s.textContent = text.slice(0, ++i); if (i < text.length) tm.later(step, 34); else tm.later(function () { node.lastChild.remove(); done(); }, 250); })();
  };

  /* the thing the visitor changes: the first primary button inside <main> */
  L.target = function () { return document.querySelector('main .btn.pri'); };
  L.toTarget = function () {
    var t = L.target(); if (!t) return;
    var r = t.getBoundingClientRect();
    if (r.top < 70 || r.bottom > innerHeight * .3) scrollTo({ top: Math.max(0, scrollY + r.top - 90), behavior: L.reduce ? 'auto' : 'smooth' });
  };
  L.paint = function (c) {
    document.documentElement.style.setProperty('--dm-c', c.c);
    document.documentElement.classList.add('dm-c');
    var t = L.target(); if (t) { t.classList.remove('lb-flash'); void t.offsetWidth; t.classList.add('lb-flash'); }
  };
  L.unpaint = function () { document.documentElement.classList.remove('dm-c'); };

  /* ring drawn around the target: scale + opacity only */
  var ring = null;
  function ringEl() { if (!ring) { ring = L.el('div', 'lb-ring'); ring.setAttribute('aria-hidden', 'true'); document.body.appendChild(ring); } return ring; }
  L.ringPlace = function () {
    var t = L.target(); if (!t || !ring) return; var r = t.getBoundingClientRect(), p = 12;
    ring.style.left = (r.left + scrollX - p) + 'px'; ring.style.top = (r.top + scrollY - p) + 'px';
    ring.style.width = (r.width + 2 * p) + 'px'; ring.style.height = (r.height + 2 * p) + 'px';
  };
  L.ringOn = function () { var r = ringEl(); L.ringPlace(); r.classList.remove('on'); void r.offsetWidth; r.classList.add('on'); };
  L.ringOff = function () { if (ring) ring.classList.remove('on'); };
  addEventListener('resize', L.ringPlace);

  /* a ghost copy flies from element/rect a to element/rect b (translate + scale on the compositor) */
  L.fly = function (a, b, html, cls, cb) {
    var ra = a.getBoundingClientRect ? a.getBoundingClientRect() : a, rb = b.getBoundingClientRect ? b.getBoundingClientRect() : b;
    if (L.reduce || !ra.width || !document.body.animate) { if (cb) cb(); return; }
    var g = L.el('div', 'lb-ghost ' + (cls || ''), html);
    g.style.cssText = 'left:' + ra.left + 'px;top:' + ra.top + 'px;width:' + ra.width + 'px;height:' + ra.height + 'px';
    document.body.appendChild(g);
    var dx = (rb.left + rb.width / 2) - (ra.left + ra.width / 2), dy = (rb.top + rb.height / 2) - (ra.top + ra.height / 2);
    var s = Math.max(.12, Math.min(rb.width / ra.width, rb.height / ra.height)), m = (1 + s) / 2;
    var an = g.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + dx * .5 + 'px,' + (dy * .5 - 56) + 'px) scale(' + m + ')', opacity: 1, offset: .55 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')', opacity: .9 }
    ], { duration: 850, easing: 'cubic-bezier(.45,.05,.2,1)', fill: 'forwards' });
    an.onfinish = function () { g.remove(); if (cb) cb(); };
  };

  /* mini screenshot of "this page" with the marked button (drawn, not described) */
  L.shot = function (color, cls) {
    return '<div class="ms ' + (cls || '') + '"' + (color ? ' style="--c:' + color + '"' : '') + '><div class="ms-bar"><i></i><i></i><i></i></div>' +
      '<div class="ms-pg"><b class="ms-h"></b><s class="ms-l"></s><s class="ms-l w2"></s><span class="ms-btn"></span><em class="ms-mark"></em></div></div>';
  };

  /* floating ladybug button + hint bubble */
  L.fab = function (label, hintText) {
    var fab = L.el('button', 'dm-fab', L.BUG + '<span class="dm-pulse"></span>');
    fab.type = 'button'; fab.setAttribute('aria-label', label); fab.setAttribute('aria-haspopup', 'dialog');
    var hint = L.el('div', 'dm-hint', hintText); hint.setAttribute('aria-hidden', 'true');
    document.body.appendChild(hint); document.body.appendChild(fab);
    setTimeout(function () { if (fab.getAttribute('aria-expanded') !== 'true') { hint.classList.add('dm-on'); setTimeout(function () { hint.classList.remove('dm-on'); }, 7000); } }, 1500);
    if (!L.reduce) setInterval(function () { if (fab.getAttribute('aria-expanded') !== 'true') { fab.classList.remove('wig'); void fab.offsetWidth; fab.classList.add('wig'); } }, 9000);
    return { fab: fab, hint: hint };
  };

  /* page motion outside the demo: scroll reveal, count-up, tiles */
  function countUp(nodes) {
    if (L.reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        var b = e.target, m = /^(\d+)(\+?)$/.exec(b.textContent.trim()); if (!m) return;
        var to = +m[1], plus = m[2], t0 = performance.now(), d = 900;
        (function f(t) { var k = Math.min(1, (t - t0) / d); b.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + plus; if (k < 1) requestAnimationFrame(f); })(t0);
      });
    }, { threshold: .6 });
    nodes.forEach(function (b) { io.observe(b); });
  }
  function reveal() {
    var items = [].slice.call(document.querySelectorAll('.sr'));
    if (L.reduce || !('IntersectionObserver' in window)) { items.forEach(function (n) { n.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    items.forEach(function (n, i) { n.style.transitionDelay = (n.matches('.how li') ? ([].indexOf.call(n.parentNode.children, n) * 90) : 0) + 'ms'; io.observe(n); });
  }
  L.page = function () { reveal(); countUp([].slice.call(document.querySelectorAll('.tile b, .kpi b'))); };
  L.page();
})();
