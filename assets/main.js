// MEBLE BIAŁOSKÓRSKI - menu, pojawianie się sekcji, karuzela oferty, opinie, licznik dema
document.documentElement.classList.add('js');

// menu pełnoekranowe
(function () {
  var btn = document.querySelector('.menu-btn'), menu = document.getElementById('menu');
  if (!btn || !menu) return;
  function zamknij() {
    document.body.classList.remove('menu-open'); menu.classList.remove('is-on');
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Otwórz menu');
    setTimeout(function () { if (!menu.classList.contains('is-on')) menu.hidden = true; }, 450);
  }
  btn.addEventListener('click', function () {
    if (menu.classList.contains('is-on')) return zamknij();
    menu.hidden = false; document.body.classList.add('menu-open');
    requestAnimationFrame(function () { menu.classList.add('is-on'); });
    btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Zamknij menu');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zamknij(); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) zamknij(); });
})();

// pojawianie się sekcji (bezpiecznik: po 2,5 s wszystko widoczne)
(function () {
  var els = document.querySelectorAll('.reveal');
  function pokaz(el) { el.classList.add('in'); }
  if (!('IntersectionObserver' in window)) { els.forEach(pokaz); return; }
  var io = new IntersectionObserver(function (wpisy) {
    wpisy.forEach(function (w) { if (w.isIntersecting) { pokaz(w.target); io.unobserve(w.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach(function (el) { io.observe(el); });
  setTimeout(function () {
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) pokaz(el); });
  }, 2500);
})();

// karuzela oferty
(function () {
  var tor = document.querySelector('.sv-track');
  if (!tor) return;
  var bar = document.querySelector('.sv-bar i');
  function krok() { var k = tor.querySelector('.sv-item'); return k ? k.getBoundingClientRect().width + 60 : 400; }
  var n = document.querySelector('.sv-next'), p = document.querySelector('.sv-prev');
  if (n) n.addEventListener('click', function () { tor.scrollBy({ left: krok(), behavior: 'smooth' }); });
  if (p) p.addEventListener('click', function () { tor.scrollBy({ left: -krok(), behavior: 'smooth' }); });
  function pasek() {
    if (!bar) return;
    var max = tor.scrollWidth - tor.clientWidth, w = Math.max(18, tor.clientWidth / tor.scrollWidth * 100);
    bar.style.width = w + '%';
    bar.style.marginLeft = (max > 0 ? tor.scrollLeft / max * (100 - w) : 0) + '%';
  }
  tor.addEventListener('scroll', pasek, { passive: true });
  window.addEventListener('resize', pasek);
  pasek();
})();

// opinie - strzałki
(function () {
  var q = document.querySelectorAll('.q-item');
  if (q.length < 2) return;
  var i = 0;
  function idz(d) {
    q[i].classList.remove('is-on'); q[i].hidden = true;
    i = (i + d + q.length) % q.length;
    q[i].hidden = false; q[i].classList.add('is-on');
  }
  var n = document.querySelector('.q-next'), p = document.querySelector('.q-prev');
  if (n) n.addEventListener('click', function () { idz(1); });
  if (p) p.addEventListener('click', function () { idz(-1); });
})();

// licznik ważności dema
(function () {
  var el = document.querySelector('.demo-wazne');
  if (!el || !el.getAttribute('data-do')) return;
  var koniec = new Date(el.getAttribute('data-do') + 'T23:59:59');
  if (isNaN(koniec)) return;
  var txt = el.querySelector('.dw-txt') || el;
  var dwa = function (n) { return (n < 10 ? '0' : '') + n; };
  var cykl = parseInt(el.getAttribute('data-cykl') || '0', 10);
  function tyka() {
    var teraz = new Date(), ms = koniec - teraz;
    while (ms <= 0 && cykl > 0) { koniec = new Date(koniec.getTime() + cykl * 86400000); ms = koniec - teraz; }
    if (ms <= 0) { txt.innerHTML = 'Wersja pokazowa wygasła'; return false; }
    var s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
    var zegar = dwa(Math.floor((s % 86400) / 3600)) + ':' + dwa(Math.floor((s % 3600) / 60)) + ':' + dwa(s % 60);
    txt.innerHTML = d > 0
      ? 'Wersja pokazowa · <b>' + d + ' dni</b> <span class="dw-zeg">' + zegar + '</span>'
      : 'Wersja pokazowa · <b>' + zegar + '</b>';
    el.classList.toggle('is-pilne', d === 0);
    return true;
  }
  if (tyka() !== false) setInterval(tyka, 1000);
  el.hidden = false;
  function stan() { el.classList.toggle('is-on', (window.scrollY || 0) > window.innerHeight * 0.55); }
  window.addEventListener('scroll', stan, { passive: true });
  stan();
})();

// pasek kontaktu: wjeżdża po zejściu z pierwszego ekranu, chowa się przy numerze telefonu i stopce
(function () {
  var pasek = document.querySelector('.sticky-reserve');
  if (!pasek) return;
  var widoczne = new Set();
  function stan() {
    var nisko = (window.scrollY || 0) > window.innerHeight * 0.6;
    pasek.classList.toggle('schowany', !nisko || widoczne.size > 0);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (w) {
      w.forEach(function (e) { e.isIntersecting ? widoczne.add(e.target) : widoczne.delete(e.target); });
      stan();
    }, { threshold: 0.01 });
    document.querySelectorAll('.together, .site-foot').forEach(function (el) { io.observe(el); });
  }
  window.addEventListener('scroll', stan, { passive: true });
  stan();
})();

// stopklatka: stojące zdjęcie malujemy tylko, gdy okno jest blisko ekranu
(function () {
  var s = document.querySelectorAll('.stopklatka');
  if (!s.length) return;
  if (!('IntersectionObserver' in window)) { document.documentElement.classList.add('no-io'); return; }
  var io = new IntersectionObserver(function (w) {
    w.forEach(function (e) { e.target.classList.toggle('is-near', e.isIntersecting); });
  }, { rootMargin: '200px 0px' });
  s.forEach(function (el) { io.observe(el); });
})();
