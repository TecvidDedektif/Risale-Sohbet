/* ============================================================
   Risale Sohbet: uygulama
   Ders dosyaları (dersler/ klasörü) RISALE.dersEkle(...) ile eklenir.
   Adres:  #/                 ana sayfa
           #/birinci-mektup-1 o dersin sayfası
   ============================================================ */

window.RISALE = {
  dersler: {},
  sira: [],
  dersEkle: function (d) { this.dersler[d.id] = d; },
  liste: function (l) { this.sira = l; },
};

(function () {
  var R = window.RISALE;
  var ust = document.getElementById('ust');
  var govde = document.getElementById('govde');
  var cubuk = document.getElementById('cubuk');
  var hatalar = [];

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  // Arapça harfleri ayrı yazı tipiyle göster
  function arapca(html) {
    return html.replace(/([؀-ۿ][؀-ۿً-ٰٟ\s]*[؀-ۿً-ٰٟ])/g, '<span class="ar" lang="ar">$1</span>');
  }

  // "kelime ((anlamı))"  ->  kelime <span class="anlam">(anlamı)</span>
  function metinCiz(s) {
    var html = esc(s).replace(/\(\((.+?)\)\)/g, function (_, a) { return '<span class="anlam">(' + a + ')</span>'; });
    return arapca(html);
  }

  // ---------- Ayarlar: telefonda hatırlanır ----------
  var AYAR_ANAHTARI = 'risale-ayar';
  var ayar = { anlam: true, aciklama: true, ornek: true, boyut: 19 };
  try { Object.assign(ayar, JSON.parse(localStorage.getItem(AYAR_ANAHTARI) || '{}')); } catch (e) {}
  function kaydet() { try { localStorage.setItem(AYAR_ANAHTARI, JSON.stringify(ayar)); } catch (e) {} }

  function ayarUygula() {
    ['anlam', 'aciklama', 'ornek'].forEach(function (k) {
      document.body.classList.toggle(k + '-gizli', !ayar[k]);
      var d = cubuk.querySelector('[data-anahtar="' + k + '"]');
      if (d) d.setAttribute('aria-pressed', String(ayar[k]));
    });
    document.documentElement.style.setProperty('--boyut', ayar.boyut + 'px');
  }

  cubuk.addEventListener('click', function (e) {
    var d = e.target.closest('button');
    if (!d) return;
    if (d.dataset.anahtar) ayar[d.dataset.anahtar] = !ayar[d.dataset.anahtar];
    if (d.dataset.boyut) ayar.boyut = Math.max(15, Math.min(28, ayar.boyut + Number(d.dataset.boyut)));
    kaydet();
    ayarUygula();
  });

  // ---------- Ana sayfa ----------
  function anaSayfa() {
    document.title = 'Risale Sohbet';
    ust.innerHTML = '<div class="kap"><a class="marka" href="#/">Risale Sohbet</a></div>';
    cubuk.hidden = true;
    var kartlar = R.sira.map(function (id) {
      var d = R.dersler[id];
      if (!d) return '';
      return '<a class="ders-kart" href="#/' + esc(d.id) + '"><small>' + esc(d.kitap) + '</small>' +
        '<h2>' + esc(d.baslik) + '</h2><p>' + esc(d.ozet) + '</p></a>';
    }).join('');
    govde.innerHTML = '<div class="ana"><h1>Sohbet dersleri</h1>' +
      '<p>Her derste metin, zor kelimelerin anlamı, kısa bir açıklama ve günlük hayattan bir örnek var.</p>' +
      (hatalar.length ? '<div class="hata">' + hatalar.map(esc).join('<br>') + '</div>' : '') +
      kartlar + '</div>';
  }

  // ---------- Ders sayfası ----------
  function dersSayfasi(d) {
    document.title = d.baslik + ' · Risale Sohbet';
    ust.innerHTML = '<div class="kap"><a class="geri" href="#/">‹ Dersler</a></div>';
    cubuk.hidden = false;

    var icindekiler = d.bolumler.map(function (b, i) {
      return b.alt ? '' : '<li><a href="#/' + esc(d.id) + '/' + i + '">' + esc(b.baslik) + '</a></li>';
    }).join('');

    var bolumler = d.bolumler.map(function (b, i) {
      return '<section class="bolum' + (b.alt ? ' alt' : '') + '" id="b' + i + '">' +
        '<h2>' + esc(b.baslik) + '</h2>' +
        '<div class="metin">' + (b.metin || []).map(function (p) { return '<p>' + metinCiz(p) + '</p>'; }).join('') + '</div>' +
        (b.aciklama ? '<div class="aciklama"><span class="etiket">Açıklama</span>' + b.aciklama.map(function (p) { return '<p>' + arapca(esc(p)) + '</p>'; }).join('') + '</div>' : '') +
        (b.ornek ? '<div class="ornek"><span class="etiket">Günlük hayattan</span>' + b.ornek.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' : '') +
        '</section>';
    }).join('');

    var sorular = d.sorular && d.sorular.length
      ? '<section class="sorular"><h2>Sohbet için sorular</h2><ol>' + d.sorular.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></section>'
      : '';

    govde.innerHTML = '<header class="ders-bas"><small>' + esc(d.kitap) + '</small><h1>' + esc(d.baslik) + '</h1>' +
      '<ul class="icindekiler">' + icindekiler + '</ul></header>' + bolumler + sorular +
      '<p class="alt-not">Kelime anlamları ve açıklamalar sohbet hazırlığı içindir; asıl metin esastır.</p>';
  }

  // ---------- Gezinme ----------
  function yonlendir() {
    var p = location.hash.split('/');           // '#/ders/3' -> ['#','ders','3']
    var d = R.dersler[p[1]];
    if (!d) { anaSayfa(); window.scrollTo(0, 0); return; }
    if (!govde.dataset.ders || govde.dataset.ders !== d.id) { dersSayfasi(d); govde.dataset.ders = d.id; window.scrollTo(0, 0); }
    if (p[2] !== undefined) {
      var hedef = document.getElementById('b' + p[2]);
      if (hedef) hedef.scrollIntoView({ block: 'start' });
    }
  }
  window.addEventListener('hashchange', function () {
    if (!R.dersler[location.hash.split('/')[1]]) govde.dataset.ders = '';
    yonlendir();
  });

  // ---------- Ders dosyalarını yükle (liste.js okunduktan sonra) ----------
  document.addEventListener('DOMContentLoaded', function () { Promise.all(R.sira.map(function (id) {
    return new Promise(function (bitti) {
      var s = document.createElement('script');
      s.src = 'dersler/' + id + '.js';
      s.onload = function () { if (!R.dersler[id]) hatalar.push('dersler/' + id + '.js içinde id, dosya adıyla aynı olmalı.'); bitti(); };
      s.onerror = function () { hatalar.push('dersler/' + id + '.js bulunamadı.'); bitti(); };
      document.head.appendChild(s);
    });
  })).then(function () { ayarUygula(); yonlendir(); }); });

  window.addEventListener('error', function (e) {
    if ((e.filename || '').indexOf('/dersler/') !== -1) hatalar.push((e.filename.split('/dersler/')[1]) + ', ' + e.lineno + '. satır: yazım hatası (' + e.message + ')');
  });
})();
