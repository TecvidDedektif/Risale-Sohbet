/* ============================================================
   Sesli dinleme: ders sayfasında "Dinle" düğmesiyle açılan oynatıcı.

   - Kayıtlar ses/ klasöründedir; liste ve zaman çizelgesi ses/liste.js içindedir
     (araclar/ses_uret.py yazar). Ders için kayıt yoksa "Dinle" düğmesi görünmez.
   - İki kip: "Tam" (metin + açıklama + örnek), "Özet" (açıklama + örnek).
   - Ekran kilitliyken de çalar; kilit ekranında oynat/duraklat, ileri/geri, bölüm atlama.
   - Kaldığın yer, hız ve kip bu telefonda hatırlanır.
   ============================================================ */

(function () {
  var R = window.RISALE, K = R.ic;
  var veri = {};
  R.sesEkle = function (o) { Object.assign(veri, o); };
  if (!K) return;
  var esc = K.esc;

  var HIZLAR = [0.85, 1, 1.15, 1.3, 1.5, 1.75];
  var UYKU = [0, 10, 20, 30];
  var ETIKET = { baslik: 'Giriş', metin: 'Metin', aciklama: 'Açıklama', ornek: 'Günlük hayattan örnek' };
  var KIP_AD = { tam: 'Tam', ozet: 'Özet' };

  var kayit = K.oku('risale-ses', { kip: 'tam', hiz: 1, konum: {} });
  var ses = new Audio();
  ses.preload = 'metadata';
  var id = null, kip = 'tam', surukleme = false, sonKayit = 0, uykuIndeks = 0, uykuZamani = null, sonBolum = null, degisiyor = false;
  var el = {};

  var IKON = {
    oynat: '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
    duraklat: '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/></svg>',
    onceki: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6h2v12H6zM9.5 12l8.5 6V6z" fill="currentColor"/></svg>',
    sonraki: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" fill="currentColor"/></svg>',
  };

  function sure(sn) {
    sn = Math.max(0, Math.floor(sn || 0));
    var s = sn % 60, d = Math.floor(sn / 60) % 60, sa = Math.floor(sn / 3600);
    return (sa ? sa + ':' + ('0' + d).slice(-2) : d) + ':' + ('0' + s).slice(-2);
  }
  function ders() { return R.dersler[id]; }
  function kipVeri() { return veri[id] && veri[id].kipler[kip]; }
  function sureToplam() { return (ses.duration && isFinite(ses.duration)) ? ses.duration : (kipVeri() ? kipVeri().sure : 0); }

  // ---------- Zaman çizelgesi ----------
  function kisimBul(t) {
    var l = kipVeri().kisimlar, i = 0;
    for (var j = 0; j < l.length; j++) { if (l[j].bas <= t + 0.05) i = j; else break; }
    return l[i];
  }
  // Bölüm başlangıçları: her bölümün ilk kısmı
  function bolumler() {
    var gorulen = {}, sonuc = [];
    kipVeri().kisimlar.forEach(function (k) { if (!gorulen[k.b]) { gorulen[k.b] = 1; sonuc.push({ b: k.b, bas: k.bas }); } });
    return sonuc;
  }
  function bolumAdi(b) {
    var d = ders();
    return b < 0 ? 'Giriş: ' + d.baslik : (d.bolumler[b] ? d.bolumler[b].baslik : 'Bölüm ' + (b + 1));
  }

  // ---------- Arayüz ----------
  function kur() {
    if (el.kok) return;
    var kok = document.createElement('section');
    kok.className = 'oyn'; kok.hidden = true; kok.setAttribute('aria-label', 'Sesli dinleme');
    kok.innerHTML = '<div class="kap">' +
      '<div class="oyn-liste" id="oyn-liste" hidden></div>' +
      '<div class="oyn-ust"><div class="oyn-bilgi"><b id="oyn-bolum"></b><small id="oyn-parca"></small></div>' +
      '<button type="button" class="oyn-kapat" id="oyn-kapat" aria-label="Dinlemeyi kapat">✕</button></div>' +
      '<div class="oyn-zaman"><span id="oyn-t">0:00</span><input type="range" id="oyn-ara" min="0" max="1000" value="0" aria-label="Konum"><span id="oyn-s">0:00</span></div>' +
      '<div class="oyn-dugmeler">' +
      '<button type="button" class="oyn-d" id="oyn-onceki" aria-label="Önceki bölüm">' + IKON.onceki + '</button>' +
      '<button type="button" class="oyn-d" id="oyn-geri" aria-label="15 saniye geri">−15</button>' +
      '<button type="button" class="oyn-d ana" id="oyn-oynat" aria-label="Oynat">' + IKON.oynat + '</button>' +
      '<button type="button" class="oyn-d" id="oyn-ileri" aria-label="15 saniye ileri">+15</button>' +
      '<button type="button" class="oyn-d" id="oyn-sonraki" aria-label="Sonraki bölüm">' + IKON.sonraki + '</button></div>' +
      '<div class="oyn-alt"><button type="button" class="kucuk" id="oyn-kip" aria-label="Kayıt türünü değiştir"></button>' +
      '<button type="button" class="kucuk" id="oyn-bolumler" aria-expanded="false">Bölümler</button>' +
      '<button type="button" class="kucuk" id="oyn-hiz"></button><button type="button" class="kucuk" id="oyn-uyku"></button></div></div>';
    document.body.appendChild(kok);
    el.kok = kok;
    ['liste', 'bolum', 'parca', 'kip', 'bolumler', 'kapat', 't', 's', 'ara', 'onceki', 'geri', 'oynat', 'ileri', 'sonraki', 'hiz', 'uyku'].forEach(function (a) { el[a] = document.getElementById('oyn-' + a); });

    el.oynat.addEventListener('click', function () { if (ses.paused) calis(); else ses.pause(); });
    el.geri.addEventListener('click', function () { git(ses.currentTime - 15); });
    el.ileri.addEventListener('click', function () { git(ses.currentTime + 15); });
    el.onceki.addEventListener('click', function () { oncekiBolum(); });
    el.sonraki.addEventListener('click', function () { sonrakiBolum(); });
    el.kapat.addEventListener('click', kapat);
    el.kip.addEventListener('click', kipDegistir);
    el.hiz.addEventListener('click', function () {
      var i = HIZLAR.indexOf(kayit.hiz); kayit.hiz = HIZLAR[(i + 1) % HIZLAR.length];
      ses.playbackRate = kayit.hiz; K.yaz('risale-ses', kayit); durumYaz();
    });
    el.uyku.addEventListener('click', function () {
      uykuIndeks = (uykuIndeks + 1) % UYKU.length;
      if (uykuZamani) { clearTimeout(uykuZamani); uykuZamani = null; }
      if (UYKU[uykuIndeks]) uykuZamani = setTimeout(function () { ses.pause(); uykuIndeks = 0; uykuZamani = null; durumYaz(); }, UYKU[uykuIndeks] * 60000);
      durumYaz();
    });
    el.bolumler.addEventListener('click', function () {
      var acik = el.liste.hidden; el.liste.hidden = !acik; el.bolumler.setAttribute('aria-expanded', String(acik));
      if (acik) listeCiz();
    });
    el.liste.addEventListener('click', function (e) {
      var b = e.target.closest('[data-bas]'); if (!b) return;
      git(Number(b.dataset.bas)); calis(); el.liste.hidden = true; el.bolumler.setAttribute('aria-expanded', 'false'); sayfadaGoster();
    });
    el.ara.addEventListener('input', function () { surukleme = true; el.t.textContent = sure(el.ara.value / 1000 * sureToplam()); });
    el.ara.addEventListener('change', function () { git(el.ara.value / 1000 * sureToplam()); surukleme = false; });

    ses.addEventListener('timeupdate', guncelle);
    ses.addEventListener('play', durumYaz);
    ses.addEventListener('pause', function () { durumYaz(); if (!ses.ended) konumKaydet(true); });
    ses.addEventListener('ended', function () { if (id) { kayit.konum[id + ':' + kip] = 0; K.yaz('risale-ses', kayit); } durumYaz(); });
    ses.addEventListener('loadedmetadata', guncelle);
    window.addEventListener('resize', yukseklik);
    ses.addEventListener('error', function () { el.bolum.textContent = 'Ses dosyası açılamadı'; el.parca.textContent = 'İnternet bağlantını kontrol et.'; durumYaz(); });

    // Okuma sırasında dinleme: sohbet ya da kart moduna girince durdur
    new MutationObserver(function () {
      if ((document.body.classList.contains('sohbet') || document.body.classList.contains('kartlar')) && !ses.paused) ses.pause();
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

    medyaOturumu();
  }

  function listeCiz() {
    var sn = ses.currentTime || 0, simdi = kisimBul(sn).b;
    el.liste.innerHTML = bolumler().map(function (x) {
      return '<button type="button" class="oyn-oge' + (x.b === simdi ? ' simdi' : '') + '" data-bas="' + x.bas + '"><span>' + esc(bolumAdi(x.b)) + '</span><small>' + sure(x.bas) + '</small></button>';
    }).join('');
  }

  function durumYaz() {
    if (!el.kok) return;
    el.oynat.innerHTML = ses.paused ? IKON.oynat : IKON.duraklat;
    el.oynat.setAttribute('aria-label', ses.paused ? 'Oynat' : 'Duraklat');
    el.hiz.textContent = 'Hız ' + String(kayit.hiz).replace('.', ',') + '×';
    el.uyku.textContent = UYKU[uykuIndeks] ? 'Uyku ' + UYKU[uykuIndeks] + ' dk' : 'Uyku';
    el.uyku.setAttribute('aria-label', UYKU[uykuIndeks] ? 'Uyku zamanlayıcısı: ' + UYKU[uykuIndeks] + ' dakika sonra durdur' : 'Uyku zamanlayıcısı kapalı');
    el.kip.textContent = KIP_AD[kip];
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = ses.paused ? 'paused' : 'playing';
  }

  function guncelle() {
    if (!id || !el.kok) return;
    var t = ses.currentTime || 0, top = sureToplam(), k = kisimBul(t);
    if (!surukleme) { el.ara.value = top ? Math.round(t / top * 1000) : 0; el.t.textContent = sure(t); }
    el.s.textContent = sure(top);
    el.bolum.textContent = bolumAdi(k.b);
    el.parca.textContent = ETIKET[k.p] + ' · ' + KIP_AD[kip] + ' · ' + sure(t) + ' / ' + sure(top);
    if (sonBolum !== k.b) { sonBolum = k.b; vurgula(k.b); medyaBilgi(k); if (!el.liste.hidden) listeCiz(); }
    if ('mediaSession' in navigator && navigator.mediaSession.setPositionState && top) {
      try { navigator.mediaSession.setPositionState({ duration: top, playbackRate: ses.playbackRate, position: Math.min(t, top) }); } catch (e) {}
    }
    konumKaydet(false);
  }

  function yukseklik() {
    if (el.kok && !el.kok.hidden) document.documentElement.style.setProperty('--oyn-h', el.kok.offsetHeight + 'px');
  }

  function konumKaydet(zorla) {
    var simdi = Date.now();
    if (!id || degisiyor || (!zorla && simdi - sonKayit < 5000)) return;
    sonKayit = simdi;
    kayit.konum[id + ':' + kip] = Math.floor(ses.currentTime || 0);
    K.yaz('risale-ses', kayit);
  }

  // Sayfadaki bölümü işaretle ("Dinleniyor")
  function vurgula(b) {
    document.querySelectorAll('.bolum.dinleniyor').forEach(function (x) { x.classList.remove('dinleniyor'); });
    if (location.hash.split('/')[1] !== id) return;
    var h = document.getElementById('b' + b);
    if (h) h.classList.add('dinleniyor');
  }
  function sayfadaGoster() {
    if (location.hash.split('/')[1] !== id || sonBolum === null || sonBolum < 0) return;
    var h = document.getElementById('b' + sonBolum);
    if (h) h.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  // ---------- Kontroller ----------
  function git(sn) {
    var top = sureToplam();
    ses.currentTime = Math.max(0, top ? Math.min(sn, top - 0.5) : sn);
    guncelle();
  }
  function calis() { var p = ses.play(); if (p && p.catch) p.catch(function () { durumYaz(); }); }
  function oncekiBolum() {
    var l = bolumler(), t = ses.currentTime, i = 0;
    for (var j = 0; j < l.length; j++) { if (l[j].bas <= t + 0.05) i = j; }
    git(t - l[i].bas > 3 || i === 0 ? l[i].bas : l[i - 1].bas); sayfadaGoster();
  }
  function sonrakiBolum() {
    var l = bolumler(), t = ses.currentTime;
    for (var j = 0; j < l.length; j++) { if (l[j].bas > t + 0.05) { git(l[j].bas); sayfadaGoster(); return; } }
  }

  // Kaydı yükler. baslangic verilmezse bu telefonda kalınan yerden başlar.
  function yukle(yeniKip, baslangic) {
    kip = yeniKip; kayit.kip = kip; K.yaz('risale-ses', kayit);
    var k = kipVeri(), konum = baslangic != null ? baslangic : (kayit.konum[id + ':' + kip] || 0);
    if (baslangic == null && (konum <= 5 || konum >= k.sure - 5)) konum = 0;
    degisiyor = true; sonBolum = null;
    ses.src = k.dosya;
    ses.playbackRate = kayit.hiz;
    var hazir = function () {
      ses.removeEventListener('loadedmetadata', hazir);
      degisiyor = false;
      if (konum > 0) ses.currentTime = konum;
      guncelle();
    };
    ses.addEventListener('loadedmetadata', hazir);
    durumYaz();
  }

  function kipDegistir() {
    var kipler = Object.keys(veri[id].kipler), yeni = kipler[(kipler.indexOf(kip) + 1) % kipler.length];
    if (yeni === kip) return;
    var b = kisimBul(ses.currentTime || 0).b, caliyor = !ses.paused;
    konumKaydet(true);
    ses.pause();
    // aynı bölümden devam: yeni kayıtta bu bölümün (yoksa sonraki bölümün) başı
    var hedef = veri[id].kipler[yeni].kisimlar.filter(function (x) { return x.b >= b; })[0];
    yukle(yeni, hedef ? hedef.bas : 0);
    if (caliyor) calis();
    if (!el.liste.hidden) listeCiz();
  }

  function medyaBilgi(k) {
    if (!('mediaSession' in navigator) || !window.MediaMetadata) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: bolumAdi(k.b) + ' · ' + ETIKET[k.p],
      artist: 'Risale Sohbet',
      album: ders().baslik,
      artwork: [{ src: 'ikon/ikon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'ikon/ikon-512.png', sizes: '512x512', type: 'image/png' }],
    });
  }
  function medyaOturumu() {
    if (!('mediaSession' in navigator)) return;
    var m = navigator.mediaSession;
    function ayarla(ad, f) { try { m.setActionHandler(ad, f); } catch (e) {} }
    ayarla('play', calis);
    ayarla('pause', function () { ses.pause(); });
    ayarla('seekbackward', function () { git(ses.currentTime - 15); });
    ayarla('seekforward', function () { git(ses.currentTime + 15); });
    ayarla('previoustrack', oncekiBolum);
    ayarla('nexttrack', sonrakiBolum);
    ayarla('seekto', function (d) { if (d && d.seekTime != null) git(d.seekTime); });
  }

  function ac(dersId) {
    if (!veri[dersId] || !R.dersler[dersId]) return;
    kur();
    if (id === dersId && !el.kok.hidden) { if (ses.paused) calis(); return; }   // zaten açık
    if (id) { konumKaydet(true); ses.pause(); }          // başka bir ders dinleniyorduysa yerini sakla
    id = dersId;
    var kipler = Object.keys(veri[id].kipler);
    yukle(kipler.indexOf(kayit.kip) >= 0 ? kayit.kip : kipler[0]);
    el.kok.hidden = false;
    document.body.classList.add('ses-acik');
    el.liste.hidden = true; el.bolumler.setAttribute('aria-expanded', 'false');
    yukseklik();
    guncelle();
    calis();
  }

  function kapat() {
    if (!el.kok) return;
    konumKaydet(true); ses.pause();
    el.kok.hidden = true;
    document.body.classList.remove('ses-acik');
    document.documentElement.style.removeProperty('--oyn-h');
    document.querySelectorAll('.bolum.dinleniyor').forEach(function (x) { x.classList.remove('dinleniyor'); });
    if (uykuZamani) { clearTimeout(uykuZamani); uykuZamani = null; uykuIndeks = 0; }
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = null;
    id = null;
  }

  // Başka sayfaya gidip dönünce işaret yeniden konsun
  window.addEventListener('hashchange', function () { if (id && sonBolum !== null) setTimeout(function () { vurgula(sonBolum); }, 0); });

  R.ses = {
    var: function (dersId) { return !!veri[dersId]; },
    sure: function (dersId) { return veri[dersId] ? veri[dersId].kipler.tam ? veri[dersId].kipler.tam.sure : 0 : 0; },
    ac: ac,
    duraklat: function () { if (!ses.paused) ses.pause(); },
  };
})();
