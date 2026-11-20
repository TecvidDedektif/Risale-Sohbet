/* ============================================================
   Pekiştirme: okuduğunu kalıcı öğrenmek için etkinlikler.

   Ders dosyasında her bölüme isteğe bağlı bir "pekistir" bloğu eklenir
   (yazım kuralı README.md içinde ve dersler/yirmi-altinci-mektup-4-1.js içinde):

     pekistir: {
       mesaj:  'Üstad ne diyor: tek, kısa mesaj',
       anahtar: ['ipucu', 'ipucu'],
       kisa:   'Sohbette söyleyeceğin tek cümlelik örnek',
       bosluk: [{ cumle: 'Cümle {{boşluk}} cümle', yanlis: ['yanlış1', 'yanlış2'] }],
       soru:   [{ s: 'Soru?', sec: ['a', 'b', 'c'], dogru: 0, not: 'neden' }],
       esles:  { baslik: '...', ciftler: [['sol', 'sağ'], ...] },
     }

   Dersin kendisine de (bölümlerin dışında) şunlar konabilir:
     pekistir: { esles: { ciftler: [...] }, zincir: { baslik: '...', adimlar: [...] } }

   Ne var:
     - her bölümün altında "Pekiştir" kutusu
     - ders sayfasının başında "Pekiştir" (bütün etkinlikler arka arkaya) ve "Kart modu"
     - kalıcı kelime tekrarı (#/tekrar): bilmediğin kelime sık, bildiğin seyrek gelir
   Her şey sadece bu telefonda saklanır (localStorage).
   ============================================================ */

(function () {
  var R = window.RISALE, K = R.ic;
  if (!K) return;
  var esc = K.esc, sade = K.sade;

  var GUN = 86400000;
  var ARALIK = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };   // kutu -> kaç gün sonra tekrar
  var YENI_GUNLUK = 10;                               // günde en çok kaç yeni kelime

  // =========================================================
  // 1. Kayıtlar (sadece bu telefonda)
  // =========================================================
  var ilerleme = K.oku('risale-ilerleme', {});   // 'ders:bölüm:etkinlik' -> { ok, ilk, zor, t }
  var kutu = K.oku('risale-kutu', {});           // sade(kelime) -> { k: 1..5, s: tekrar zamanı }
  var gunler = K.oku('risale-gunler', {});       // 'YYYY-AA-GG' -> o gün kaç işlem
  var yeniSayac = K.oku('risale-yeni', { gun: '', n: 0 });

  function kaydet() { K.yaz('risale-ilerleme', ilerleme); }
  function tamam(id) { return !!(ilerleme[id] && ilerleme[id].ok); }
  function gunAdi(t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); }
  function gunIsle() { var g = gunAdi(new Date()); gunler[g] = (gunler[g] || 0) + 1; K.yaz('risale-gunler', gunler); }
  function seri() {
    var t = new Date(), n = 0;
    if (!gunler[gunAdi(t)]) t.setDate(t.getDate() - 1);   // bugün henüz çalışmadıysan dünden say
    while (gunler[gunAdi(t)]) { n++; t.setDate(t.getDate() - 1); }
    return n;
  }
  function karistir(a) {
    var b = a.slice(), i, j, x;
    for (i = b.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); x = b[i]; b[i] = b[j]; b[j] = x; }
    return b;
  }

  // =========================================================
  // 2. Etkinlik listeleri
  // =========================================================
  function bolumEtkinlikleri(d, bi) {
    var p = d.bolumler[bi].pekistir, l = [], on = d.id + ':' + bi + ':';
    if (!p) return l;
    if (p.mesaj) l.push({ id: on + 'anlat', tur: 'anlat', v: p, bolum: bi });
    (p.bosluk || []).forEach(function (x, i) { l.push({ id: on + 'bosluk' + i, tur: 'bosluk', v: x, bolum: bi }); });
    (p.soru || []).forEach(function (x, i) { l.push({ id: on + 'soru' + i, tur: 'soru', v: x, bolum: bi }); });
    if (p.esles && p.esles.ciftler && p.esles.ciftler.length > 1) l.push({ id: on + 'esles', tur: 'esles', v: p.esles, bolum: bi });
    return l;
  }
  function dersEtkinlikleri(d) {
    var l = [], p = d.pekistir || {};
    d.bolumler.forEach(function (b, bi) { l = l.concat(bolumEtkinlikleri(d, bi)); });
    if (p.esles && p.esles.ciftler && p.esles.ciftler.length > 1) l.push({ id: d.id + ':d:esles', tur: 'esles', v: p.esles, bolum: -1 });
    if (p.zincir && p.zincir.adimlar && p.zincir.adimlar.length > 1) l.push({ id: d.id + ':d:zincir', tur: 'sira', v: p.zincir, bolum: -1 });
    return l;
  }
  function kayitli(e, sonra) {
    return {
      bitti: function (ilk) { ilerleme[e.id] = { ok: 1, ilk: ilk ? 1 : 0, t: Date.now() }; kaydet(); gunIsle(); if (sonra) sonra(ilk); },
      takildi: function () { ilerleme[e.id] = Object.assign({}, ilerleme[e.id], { zor: 1 }); kaydet(); },
    };
  }

  // =========================================================
  // 3. Etkinlik türleri. Hepsi (kap, veri, c) alır; c.bitti(ilkDeneme) ve c.takildi()
  // =========================================================
  var sayac = null;   // "1 dk" süresi

  function bas(t) { return '<p class="e-bas">' + esc(t) + '</p>'; }
  function fbKutu() { return '<p class="e-fb" role="status" aria-live="polite"></p>'; }
  function hataEtkinlik(kap, ne) { kap.innerHTML = '<p class="hata">Bu etkinlikte düzeltilecek yer var: ' + esc(ne) + '</p>'; }

  // ---------- Kapat ve anlat ----------
  function eAnlat(kap, v, c) {
    kap.innerHTML = bas('Kapat ve anlat') +
      '<p class="e-yonerge">Açıklamaya bakmadan, bu ipuçlarıyla sohbette nasıl anlatırdın? Sesli söyle ya da yaz.</p>' +
      '<ul class="ipucu">' + (v.anahtar || []).map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' +
      '<textarea rows="3" aria-label="Kendi cümlelerin" placeholder="İstersen buraya yaz (kaydedilmez)"></textarea>' +
      '<div class="e-btn"><button type="button" class="kucuk" data-zaman>Süre tut: 1 dk</button>' +
      '<button type="button" class="dugme ana-dugme" data-goster>Üstad’ın mesajını göster</button></div>' +
      '<div class="e-cevap" hidden><span class="etiket">Üstad’ın mesajı</span><p>' + esc(v.mesaj) + '</p>' +
      (v.kisa ? '<div class="e-ornek"><span class="etiket">Sohbette örnek</span><p>' + esc(v.kisa) + '</p></div>' : '') +
      '<p class="e-yonerge">Kendi anlatışın buna yakın mıydı?</p>' +
      '<div class="e-btn"><button type="button" class="dugme" data-takil>Takıldım</button><button type="button" class="dugme ana-dugme" data-bil>Anlattım</button></div></div>' + fbKutu();
    var fb = kap.querySelector('.e-fb'), cevap = kap.querySelector('.e-cevap'), z = kap.querySelector('[data-zaman]');
    z.addEventListener('click', function () {
      if (sayac) { clearInterval(sayac); sayac = null; z.textContent = 'Süre tut: 1 dk'; return; }
      var kalan = 60;
      z.textContent = kalan + ' sn';
      sayac = setInterval(function () {
        if (!document.body.contains(z)) { clearInterval(sayac); sayac = null; return; }
        kalan--;
        z.textContent = kalan > 0 ? kalan + ' sn' : 'Süre doldu';
        if (kalan <= 0) { clearInterval(sayac); sayac = null; }
      }, 1000);
    });
    kap.querySelector('[data-goster]').addEventListener('click', function (e) { cevap.hidden = false; e.currentTarget.hidden = true; cevap.scrollIntoView({ block: 'nearest' }); });
    kap.querySelector('[data-bil]').addEventListener('click', function () {
      cevap.querySelector('.e-btn').hidden = true;
      fb.className = 'e-fb dogru'; fb.textContent = 'Güzel. Şimdi bir de ekrana bakmadan, sesli söylemeyi dene.';
      c.bitti(true);
    });
    kap.querySelector('[data-takil]').addEventListener('click', function () {
      c.takildi();
      cevap.querySelector('.e-btn').innerHTML = '<button type="button" class="dugme ana-dugme" data-yine>Yeniden dene</button>';
      fb.className = 'e-fb yanlis'; fb.textContent = 'Sorun değil. Mesajı bir kez daha oku, sonra yeniden anlat.';
      kap.querySelector('[data-yine]').addEventListener('click', function () { eAnlat(kap, v, c); });
    });
  }

  // ---------- Boşluk doldur ----------
  function eBosluk(kap, v, c) {
    var m = /\{\{(.+?)\}\}/.exec(v.cumle || '');
    if (!m) return hataEtkinlik(kap, 'boşluk cümlesinde {{doğru kelime}} yok.');
    var dogru = m[1], ilk = true;
    var secenek = karistir([dogru].concat(v.yanlis || []));
    kap.innerHTML = bas('Boşluğu doldur') +
      '<p class="e-cumle">' + esc(v.cumle.slice(0, m.index)) + '<span class="bosluk">&nbsp;</span>' + esc(v.cumle.slice(m.index + m[0].length)) + '</p>' +
      '<div class="secenekler">' + secenek.map(function (s) { return '<button type="button" class="sec" data-s="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</div>' + fbKutu();
    var fb = kap.querySelector('.e-fb'), yer = kap.querySelector('.bosluk');
    kap.querySelectorAll('.sec').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.s === dogru) {
          yer.textContent = dogru; yer.classList.add('dolu');
          kap.querySelectorAll('.sec').forEach(function (x) { x.disabled = true; });
          b.classList.add('dogru');
          fb.className = 'e-fb dogru'; fb.textContent = 'Doğru.' + (v.not ? ' ' + v.not : '');
          c.bitti(ilk);
        } else {
          ilk = false; b.disabled = true; b.classList.add('yanlis');
          fb.className = 'e-fb yanlis'; fb.textContent = 'Olmadı, bir daha dene.';
        }
      });
    });
  }

  // ---------- Soru (çoktan seçmeli) ----------
  function eSoru(kap, v, c) {
    var dogru = (v.sec || [])[v.dogru], ilk = true;
    if (dogru == null) return hataEtkinlik(kap, 'soruda "dogru" numarası seçeneklerden birini göstermiyor.');
    kap.innerHTML = bas('Soru') + '<p class="e-cumle">' + esc(v.s) + '</p>' +
      '<div class="secenekler dikey">' + karistir(v.sec).map(function (s) { return '<button type="button" class="sec" data-s="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</div>' + fbKutu();
    var fb = kap.querySelector('.e-fb');
    kap.querySelectorAll('.sec').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.s === dogru) {
          kap.querySelectorAll('.sec').forEach(function (x) { x.disabled = true; });
          b.classList.add('dogru');
          fb.className = 'e-fb dogru'; fb.textContent = 'Doğru.' + (v.not ? ' ' + v.not : '');
          c.bitti(ilk);
        } else {
          ilk = false; b.disabled = true; b.classList.add('yanlis');
          fb.className = 'e-fb yanlis'; fb.textContent = 'Olmadı, bir daha dene.';
        }
      });
    });
  }

  // ---------- Eşleştir ----------
  function eEsles(kap, v, c) {
    var cift = v.ciftler || [], n = cift.length, ilk = true, bulunan = 0, secili = null;
    var sag = karistir(cift.map(function (x, i) { return { t: x[1], i: i }; }));
    kap.innerHTML = bas('Eşleştir') + '<p class="e-yonerge">' + esc(v.baslik || 'Önce soldakine, sonra ona uyan sağdakine dokun.') + '</p>' +
      '<div class="esles"><div class="esles-kol">' + cift.map(function (x, i) { return '<button type="button" class="es" data-sol="' + i + '">' + esc(x[0]) + '</button>'; }).join('') + '</div>' +
      '<div class="esles-kol">' + sag.map(function (x) { return '<button type="button" class="es" data-sag="' + x.i + '">' + esc(x.t) + '</button>'; }).join('') + '</div></div>' + fbKutu();
    var fb = kap.querySelector('.e-fb');
    function solBul(i) { return kap.querySelector('[data-sol="' + i + '"]'); }
    kap.querySelectorAll('[data-sol]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (secili !== null) solBul(secili).classList.remove('secili');
        secili = Number(b.dataset.sol);
        b.classList.add('secili');
        fb.textContent = '';
      });
    });
    kap.querySelectorAll('[data-sag]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (secili === null) { fb.className = 'e-fb'; fb.textContent = 'Önce soldan birini seç.'; return; }
        var sol = solBul(secili);
        if (Number(b.dataset.sag) === secili) {
          var renk = String(bulunan % 4);
          sol.classList.remove('secili'); sol.classList.add('esti'); sol.dataset.renk = renk; sol.disabled = true;
          b.classList.add('esti'); b.dataset.renk = renk; b.disabled = true;
          bulunan++; secili = null; fb.textContent = '';
          if (bulunan === n) { fb.className = 'e-fb dogru'; fb.textContent = 'Hepsini eşleştirdin.'; c.bitti(ilk); }
        } else {
          ilk = false;
          sol.classList.add('yanlis'); b.classList.add('yanlis');
          setTimeout(function () { sol.classList.remove('yanlis', 'secili'); b.classList.remove('yanlis'); }, 550);
          secili = null; fb.className = 'e-fb yanlis'; fb.textContent = 'Olmadı, bir daha dene.';
        }
      });
    });
  }

  // ---------- Sırala ----------
  function eSira(kap, v, c) {
    var adim = v.adimlar || [], n = adim.length, ilk = true, siradaki = 0;
    var havuz = adim.map(function (t, i) { return { t: t, i: i }; }), deneme = 0;
    do { havuz = karistir(havuz); deneme++; } while (deneme < 6 && havuz.every(function (x, i) { return x.i === i; }));
    kap.innerHTML = bas('Sırala') + '<p class="e-yonerge">' + esc(v.baslik || 'Doğru sırayla dokun: önce hangisi gelir?') + '</p>' +
      '<ol class="sira-sonuc" aria-label="Senin sıran"></ol>' +
      '<div class="secenekler dikey sira-havuz">' + havuz.map(function (x) { return '<button type="button" class="sec" data-i="' + x.i + '">' + esc(x.t) + '</button>'; }).join('') + '</div>' + fbKutu();
    var fb = kap.querySelector('.e-fb'), liste = kap.querySelector('.sira-sonuc');
    kap.querySelectorAll('.sira-havuz .sec').forEach(function (b) {
      b.addEventListener('click', function () {
        if (Number(b.dataset.i) === siradaki) {
          var li = document.createElement('li'); li.textContent = adim[siradaki]; liste.appendChild(li);
          b.remove(); siradaki++; fb.textContent = '';
          if (siradaki === n) { fb.className = 'e-fb dogru'; fb.textContent = 'Sıra doğru. Bunu sohbetin iskeleti olarak kullanabilirsin.'; c.bitti(ilk); }
        } else {
          ilk = false; b.classList.add('yanlis');
          setTimeout(function () { b.classList.remove('yanlis'); }, 550);
          fb.className = 'e-fb yanlis'; fb.textContent = 'Henüz sırası değil. Bir önceki adım nedi?';
        }
      });
    });
  }

  var TURLER = { anlat: eAnlat, bosluk: eBosluk, soru: eSoru, esles: eEsles, sira: eSira };
  function ciz(kap, e, c) { TURLER[e.tur](kap, e.v, c); }

  // =========================================================
  // 4. Ders sayfasına giren parçalar
  // =========================================================
  function kartlar(d) {
    var l = [];
    if (d.plan && d.plan.acilis) l.push({ tip: 'acilis', metin: d.plan.acilis });
    d.bolumler.forEach(function (b, bi) { if (b.pekistir && b.pekistir.mesaj) l.push({ tip: 'bolum', bi: bi, b: b }); });
    if (d.plan && d.plan.kapanis) l.push({ tip: 'kapanis', metin: d.plan.kapanis });
    return l.length > (d.plan && d.plan.acilis ? 1 : 0) + (d.plan && d.plan.kapanis ? 1 : 0) ? l : [];
  }

  function islemSatiri(d) {
    var l = dersEtkinlikleri(d), k = kartlar(d).length;
    if (!l.length && !k) return '';
    var bit = l.filter(function (e) { return tamam(e.id); }).length;
    return '<div class="ders-islem">' +
      (l.length ? '<a class="dugme ana-dugme" href="#/' + esc(d.id) + '/pekistir">Pekiştir <span class="rozet-acik">' + bit + '/' + l.length + '</span></a>' : '') +
      (k ? '<a class="dugme" href="#/' + esc(d.id) + '/kart">Kart modu</a>' : '') + '</div>';
  }

  function kartIlerleme(d) {
    var l = dersEtkinlikleri(d);
    if (!l.length) return '';
    var bit = l.filter(function (e) { return tamam(e.id); }).length;
    return '<span class="ilerle" aria-label="Pekiştirme: ' + bit + ' / ' + l.length + '"><i style="width:' + Math.round(bit * 100 / l.length) + '%"></i></span>' +
      '<small class="ilerle-yazi">Pekiştirme ' + bit + ' / ' + l.length + '</small>';
  }

  function bolumKutusu(d, b, bi) {
    var l = bolumEtkinlikleri(d, bi);
    if (!l.length) return '';
    var bit = l.filter(function (e) { return tamam(e.id); }).length;
    return '<details class="pekistir" data-bolum="' + bi + '"><summary><span>Pekiştir</span><span class="rozet' + (bit === l.length ? ' tam' : '') + '">' + bit + '/' + l.length + '</span></summary><div class="pk-ic"></div></details>';
  }

  function rozetYenile(det, d, bi) {
    var l = bolumEtkinlikleri(d, bi), bit = l.filter(function (e) { return tamam(e.id); }).length;
    var r = det.querySelector('.rozet');
    r.textContent = bit + '/' + l.length;
    r.classList.toggle('tam', bit === l.length);
  }

  function bagla(kok, d) {
    kok.querySelectorAll('details.pekistir').forEach(function (det) {
      det.addEventListener('toggle', function () {
        if (!det.open || det.dataset.hazir) return;
        det.dataset.hazir = '1';
        var bi = Number(det.dataset.bolum), ic = det.querySelector('.pk-ic');
        bolumEtkinlikleri(d, bi).forEach(function (e) {
          var kap = document.createElement('div');
          kap.className = 'e' + (tamam(e.id) ? ' tamam' : '');
          ic.appendChild(kap);
          ciz(kap, e, kayitli(e, function () { kap.classList.add('tamam'); rozetYenile(det, d, bi); }));
        });
      });
    });
  }

  // =========================================================
  // 5. Pekiştirme oturumu: dersin bütün etkinlikleri arka arkaya
  // =========================================================
  function oturum(d) {
    document.title = 'Pekiştir · ' + d.baslik + ' · Risale Sohbet';
    K.ustCiz('<a class="geri" href="#/' + esc(d.id) + '">‹ Derse dön</a>');
    var tum = dersEtkinlikleri(d), govde = K.govde;
    if (!tum.length) { govde.innerHTML = '<div class="ana"><h1>Pekiştir</h1><p>Bu derse henüz etkinlik eklenmedi.</p></div>'; return; }

    function baslat(liste) {
      var i = 0, sonuc = {};   // etkinlik id -> 1 (ilk denemede) | 0 (hata yaptı) ; yoksa atlandı
      function goster() {
        if (i >= liste.length) return bitis();
        var e = liste[i], yuzde = Math.round(i * 100 / liste.length);
        govde.innerHTML = '<div class="oturum"><div class="ilerleme-cubuk" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + yuzde + '"><span style="width:' + yuzde + '%"></span></div>' +
          '<p class="sayac">' + (i + 1) + ' / ' + liste.length + ' · ' + esc(e.bolum >= 0 ? d.bolumler[e.bolum].baslik : 'Bütün ders') + '</p>' +
          '<div class="e oturum-e"></div><div class="oturum-alt"><button type="button" class="dugme" id="atla">Atla</button><button type="button" class="dugme ana-dugme" id="ileri" hidden>Sonraki ›</button></div></div>';
        var kap = govde.querySelector('.oturum-e'), ileri = document.getElementById('ileri'), atla = document.getElementById('atla');
        ciz(kap, e, kayitli(e, function (ilk) { sonuc[e.id] = ilk ? 1 : 0; ileri.hidden = false; atla.hidden = true; ileri.focus(); }));
        function sonraki() { i++; goster(); window.scrollTo(0, 0); }
        ileri.addEventListener('click', sonraki);
        atla.addEventListener('click', sonraki);
      }
      function bitis() {
        var ilk = liste.filter(function (e) { return sonuc[e.id] === 1; }).length;
        var zor = liste.filter(function (e) { return sonuc[e.id] !== 1; });
        var bolumler = {};
        zor.forEach(function (e) { if (e.bolum >= 0) bolumler[e.bolum] = 1; });
        govde.innerHTML = '<div class="oturum"><div class="ilerleme-cubuk"><span style="width:100%"></span></div>' +
          '<div class="sonuc-kutu"><p class="sonuc-sayi">' + ilk + ' / ' + liste.length + '</p><p>etkinliği ilk denemede bildin.</p></div>' +
          (zor.length
            ? '<p class="e-yonerge">Biraz daha bakılacak yerler:</p><ul class="zor-liste">' + Object.keys(bolumler).map(function (bi) {
                return '<li><a href="#/' + esc(d.id) + '/' + bi + '">' + esc(d.bolumler[bi].baslik) + '</a></li>';
              }).join('') + (zor.some(function (e) { return e.bolum < 0; }) ? '<li>Bütün dersin akışı</li>' : '') + '</ul>'
            : '<p class="e-yonerge">Hepsi yerinde. Bunu bir iki gün sonra bir daha çöz; unutmayı ancak tekrar yener.</p>') +
          '<div class="oturum-alt">' + (zor.length ? '<button type="button" class="dugme ana-dugme" id="zorlar">Takıldıklarımı tekrar çöz</button>' : '') +
          '<a class="dugme" href="#/' + esc(d.id) + '">Derse dön</a></div></div>';
        var z = document.getElementById('zorlar');
        if (z) z.addEventListener('click', function () { baslat(zor); window.scrollTo(0, 0); });
      }
      goster();
    }
    baslat(tum);
  }

  // =========================================================
  // 6. Kart modu: sohbet sırasında telefondan tek bakış
  // =========================================================
  var kilit = null, tusDinleyici = null;
  function ekranAcik() {
    if (!('wakeLock' in navigator)) return;
    navigator.wakeLock.request('screen').then(function (k) { kilit = k; }).catch(function () {});
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && document.body.classList.contains('kartlar')) ekranAcik();
  });
  function birak() {
    if (sayac) { clearInterval(sayac); sayac = null; }
    if (kilit) { kilit.release().catch(function () {}); kilit = null; }
    if (tusDinleyici) { document.removeEventListener('keydown', tusDinleyici); tusDinleyici = null; }
    document.body.classList.remove('kartlar');
  }

  function kart(d) {
    document.title = 'Kart modu · ' + d.baslik + ' · Risale Sohbet';
    var liste = kartlar(d), govde = K.govde;
    if (!liste.length) {
      K.ustCiz('<a class="geri" href="#/' + esc(d.id) + '">‹ Derse dön</a>');
      govde.innerHTML = '<div class="ana"><h1>Kart modu</h1><p>Bu derse henüz kart eklenmedi.</p></div>';
      return;
    }
    document.body.classList.add('kartlar');
    ekranAcik();
    var ay = K.oku('risale-kartmod', { prova: false });
    var i = 0, acik = false;

    govde.innerHTML = '<div class="km"><div class="km-ust"><a class="km-kapat" href="#/' + esc(d.id) + '">✕ Kapat</a><span class="km-say" id="km-say"></span>' +
      '<button type="button" class="kucuk" id="km-prova" aria-pressed="' + ay.prova + '">Prova</button></div>' +
      '<div class="km-kart" id="km-kart" tabindex="-1" aria-live="polite"></div>' +
      '<div class="km-alt"><button type="button" class="dugme" id="km-geri">‹ Geri</button><div class="km-nokta" id="km-nokta"></div><button type="button" class="dugme ana-dugme" id="km-ileri">İleri ›</button></div></div>';
    var alan = document.getElementById('km-kart'), say = document.getElementById('km-say'), nokta = document.getElementById('km-nokta'), prova = document.getElementById('km-prova');

    function ciz() {
      var k = liste[i];
      say.textContent = (i + 1) + ' / ' + liste.length;
      nokta.innerHTML = liste.map(function (_, j) { return '<i class="' + (j === i ? 'on' : '') + '"></i>'; }).join('');
      document.getElementById('km-geri').disabled = i === 0;
      document.getElementById('km-ileri').disabled = i === liste.length - 1;
      var h = '';
      if (k.tip === 'acilis' || k.tip === 'kapanis') {
        h = '<span class="etiket">' + (k.tip === 'acilis' ? 'Açılış sorusu' : 'Kapanış') + '</span><p class="km-mesaj">' + esc(k.metin) + '</p>';
      } else {
        var p = k.b.pekistir, gizle = ay.prova && !acik;
        h = '<span class="etiket">' + esc(k.b.baslik) + '</span>' +
          '<ul class="ipucu km-ipucu">' + (p.anahtar || []).map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' +
          (gizle ? '<button type="button" class="dugme km-goster" id="km-goster">Dokun: Üstad’ın mesajı</button>'
            : '<p class="km-mesaj">' + esc(p.mesaj) + '</p>' + (p.kisa ? '<div class="km-ornek"><span class="etiket">Örnek</span><p>' + esc(p.kisa) + '</p></div>' : '')) +
          (R.sekil && k.b.sekil && !gizle ? R.sekil.ciz(k.b.sekil) : '') +
          '<a class="km-git" href="#/' + esc(d.id) + '/' + k.bi + '">Metne git ›</a>';
      }
      alan.innerHTML = h;
      alan.scrollTop = 0;
      var g = document.getElementById('km-goster');
      if (g) g.addEventListener('click', function () { acik = true; ciz(); });
    }
    function git(n) { if (n < 0 || n >= liste.length) return; i = n; acik = false; ciz(); }

    document.getElementById('km-geri').addEventListener('click', function () { git(i - 1); });
    document.getElementById('km-ileri').addEventListener('click', function () { git(i + 1); });
    prova.addEventListener('click', function () { ay.prova = !ay.prova; K.yaz('risale-kartmod', ay); prova.setAttribute('aria-pressed', String(ay.prova)); acik = false; ciz(); });

    // Kaydırma: sola = ileri, sağa = geri
    var x0 = null, y0 = null;
    alan.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    alan.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) git(dx < 0 ? i + 1 : i - 1);
    }, { passive: true });
    tusDinleyici = function (e) { if (e.key === 'ArrowRight') git(i + 1); else if (e.key === 'ArrowLeft') git(i - 1); };
    document.addEventListener('keydown', tusDinleyici);
    ciz();
  }

  // =========================================================
  // 7. Kalıcı kelime tekrarı (Leitner kutuları)
  //    Bildin: kutu +1, daha seyrek gelir (1, 3, 7, 14, 30 gün).
  //    Zor: aynı kutuda kalır, yarın gelir. Bilemedin: kutu 1, bu turda da yeniden sorulur.
  // =========================================================
  function yeniKalan() {
    var g = gunAdi(new Date());
    if (yeniSayac.gun !== g) { yeniSayac.gun = g; yeniSayac.n = 0; }
    return Math.max(0, YENI_GUNLUK - yeniSayac.n);
  }
  function deste(liste) {
    var simdi = Date.now(), vadesi = [], yeni = [];
    liste.forEach(function (x) {
      var k = kutu[sade(x.terim)];
      if (!k) yeni.push(x); else if (k.s <= simdi) vadesi.push({ x: x, s: k.s });
    });
    vadesi.sort(function (a, b) { return a.s - b.s; });
    return vadesi.map(function (v) { return v.x; }).concat(karistir(yeni).slice(0, yeniKalan()));
  }

  function anaKutu() {
    var liste = K.lugatListesi();
    if (!liste.length) return '';
    var n = deste(liste).length, s = seri();
    if (!n && !s) return '';
    return '<div class="pk-ana"><div><b>' + (n ? 'Bugün ' + n + ' kelime tekrar sırada' : 'Bugünkü kelime tekrarın tamam') + '</b>' +
      (s ? '<small>' + s + ' gün üst üste çalıştın</small>' : '') + '</div>' +
      (n ? '<a class="dugme ana-dugme" href="#/tekrar">Tekrar et</a>' : '') + '</div>';
  }

  var tekrarDers = '';
  function tekrar() {
    document.title = 'Kelime tekrarı · Risale Sohbet';
    K.ustCiz('<a class="geri" href="#/">‹ Dersler</a>');
    var govde = K.govde;
    var secenek = '<option value="">Bütün dersler</option>' + R.sira.filter(function (id) { return R.dersler[id]; }).map(function (id) {
      return '<option value="' + esc(id) + '"' + (id === tekrarDers ? ' selected' : '') + '>' + esc(R.dersler[id].baslik) + '</option>';
    }).join('');
    govde.innerHTML = '<div class="ana"><h1>Kelime tekrarı</h1><p>Kelimeyi gör, anlamını hatırlamaya çalış, sonra kartı çevir. Bildiklerin seyrek, bilmediklerin sık gelir.</p>' +
      '<select class="arama-kutu secim" id="tk-ders" aria-label="Ders seç">' + secenek + '</select><div id="tk-ozet"></div><div id="tekrar"></div></div>';
    var alan = document.getElementById('tekrar'), ozet = document.getElementById('tk-ozet');

    function liste() {
      return K.lugatListesi().filter(function (x) { return !tekrarDers || x.yerler.some(function (y) { return y.ders === tekrarDers; }); });
    }
    function ozetCiz() {
      var l = liste(), yeni = 0, ogren = 0, bil = 0;
      l.forEach(function (x) { var k = kutu[sade(x.terim)]; if (!k) yeni++; else if (k.k >= 4) bil++; else ogren++; });
      ozet.innerHTML = '<div class="seg" role="img" aria-label="Biliyorum ' + bil + ', öğreniyorum ' + ogren + ', yeni ' + yeni + '"><i class="bil" style="flex:' + bil + '"></i><i class="ogren" style="flex:' + ogren + '"></i><i class="yeni" style="flex:' + yeni + '"></i></div>' +
        '<p class="sayac">Biliyorum ' + bil + ' · Öğreniyorum ' + ogren + ' · Henüz görmedin ' + yeni + '</p>';
    }

    var kuyruk = [], toplam = 0, tamamlanan = 0;
    function baslat() {
      kuyruk = deste(liste()).map(function (x) { return { x: x, t: false }; });
      toplam = kuyruk.length; tamamlanan = 0;
      ozetCiz(); goster();
    }
    function bitti() {
      var kalan = Math.max(0, liste().filter(function (x) { return !kutu[sade(x.terim)]; }).length);
      alan.innerHTML = '<div class="kart bitti"><p class="kart-terim">Bugünlük bu kadar</p><p>' +
        (toplam ? toplam + ' kelimeyi gözden geçirdin. Aralıklı tekrar böyle işler: yarın bir kısmı yine gelir.' : 'Şu an sırada kelime yok. Aralıklı tekrar böyle işler: kelimeler vakti gelince döner.') + '</p>' +
        '<div class="kart-dugmeler">' + (kalan ? '<button type="button" class="dugme" id="daha">Yine de ' + Math.min(kalan, YENI_GUNLUK) + ' yeni kelime daha</button>' : '') +
        '<a class="dugme ana-dugme" href="#/">Derslere dön</a></div></div>';
      var dh = document.getElementById('daha');
      if (dh) dh.addEventListener('click', function () { yeniSayac.n = Math.max(0, yeniSayac.n - YENI_GUNLUK); K.yaz('risale-yeni', yeniSayac); baslat(); });
    }
    function cevapla(q, derece) {
      var a = sade(q.x.terim), k = kutu[a], simdi = Date.now(), eski = k ? k.k : 0;
      if (q.t) {   // bu turda ikinci kez soruluyor: kutu değişmez
        if (derece === 'bilme') kuyruk.push(kuyruk.shift()); else { kuyruk.shift(); tamamlanan++; }
        return;
      }
      if (!k) { yeniKalan(); yeniSayac.n++; K.yaz('risale-yeni', yeniSayac); }
      if (derece === 'bil') { var yk = Math.min(5, eski + 1); kutu[a] = { k: yk, s: simdi + ARALIK[yk] * GUN }; kuyruk.shift(); tamamlanan++; }
      else if (derece === 'zor') { kutu[a] = { k: Math.max(1, eski), s: simdi + GUN }; kuyruk.shift(); tamamlanan++; }
      else { kutu[a] = { k: 1, s: simdi + GUN }; var o = kuyruk.shift(); o.t = true; kuyruk.push(o); }
      K.yaz('risale-kutu', kutu); gunIsle();
    }
    function goster() {
      if (!kuyruk.length) { ozetCiz(); return bitti(); }
      var q = kuyruk[0], x = q.x;
      alan.innerHTML = '<p class="sayac">' + tamamlanan + ' / ' + toplam + ' tamam' + (q.t ? ' · bir daha bak' : '') + '</p>' +
        '<div class="kart"><p class="kart-terim">' + esc(x.terim) + '</p><p class="kart-anlam" hidden>' + esc(x.anlam) + '</p>' +
        '<div class="kart-dugmeler"><button type="button" class="dugme ana-dugme" id="cevir">Anlamı göster</button></div></div>';
      document.getElementById('cevir').addEventListener('click', function () {
        alan.querySelector('.kart-anlam').hidden = false;
        alan.querySelector('.kart-dugmeler').innerHTML = '<button type="button" class="dugme kotu" data-d="bilme">Bilemedim</button><button type="button" class="dugme" data-d="zor">Zor</button><button type="button" class="dugme iyi" data-d="bil">Bildim</button>';
        alan.querySelectorAll('[data-d]').forEach(function (b) {
          b.addEventListener('click', function () { cevapla(q, b.dataset.d); ozetCiz(); goster(); });
        });
        alan.querySelector('[data-d="bil"]').focus();
      });
    }
    document.getElementById('tk-ders').addEventListener('change', function (e) { tekrarDers = e.target.value; baslat(); });
    baslat();
  }

  R.pekistir = { islemSatiri: islemSatiri, bolumKutusu: bolumKutusu, bagla: bagla, oturum: oturum, kart: kart, tekrar: tekrar, anaKutu: anaKutu, kartIlerleme: kartIlerleme, birak: birak };
})();
