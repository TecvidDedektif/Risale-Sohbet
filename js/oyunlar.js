/* ============================================================
   Oyunlar: Günün kelimesi ve Çengel bulmaca.

   Günün kelimesi (#/kelime)
     Her gün herkese aynı Risale kelimesi; 6 hakta bulunur. Liste: oyun/kelimeler.js.
     Sonuç, cevabı ele vermeden renkli karelerle paylaşılır.

   Çengel bulmaca (#/<ders>/bulmaca/<no>)
     Her dersin lügatteki kelimelerinden kendiliğinden kurulur; ipucu kelimenin anlamıdır.
     Herkeste aynı bulmaca çıkar (rastgelelik ders adından türetilir). Ders dosyasına
     bir şey eklemen gerekmez; dersin lügati değişirse bulmaca da değişir.

   Oyun sayfası: #/oyun. Her şey sadece bu telefonda saklanır (localStorage: risale-oyun).
   ============================================================ */

(function () {
  var R = window.RISALE, K = R.ic;
  if (!K) return;
  var esc = K.esc;

  var HARFLER = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
  var HARF = {};
  HARFLER.split('').forEach(function (h) { HARF[h] = 1; });
  var ILK_GUN = Date.UTC(2026, 10, 22);       // Günün kelimesi #1
  var HAK = 6;

  var kayit = K.oku('risale-oyun', {});
  if (!kayit.kelime) kayit.kelime = {};
  if (!kayit.bulmaca) kayit.bulmaca = {};
  function sakla() { K.yaz('risale-oyun', kayit); }

  // ---------- Yardımcılar ----------
  // Türkçe büyük harf, şapkasız: "hakîki" -> "HAKİKİ"
  function buyuk(s) {
    return String(s).replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase()
      .replace(/[ÂÀÁ]/g, 'A').replace(/[ÎÌÍ]/g, 'İ').replace(/[ÛÙÚ]/g, 'U').replace(/[ÊÈÉ]/g, 'E').replace(/[ÔÒÓ]/g, 'O');
  }
  // Kelimenin harfleri; Türk alfabesi dışında bir şey varsa (boşluk, kesme, tire) null
  function harfler(s) {
    var l = Array.from(buyuk(s));
    for (var i = 0; i < l.length; i++) if (!HARF[l[i]]) return null;
    return l;
  }
  function tohum(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rastgele(t) {
    var a = t >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var x = Math.imul(a ^ (a >>> 15), 1 | a);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  function karistir(a, rnd) {
    var b = a.slice(), i, j, x;
    for (i = b.length - 1; i > 0; i--) { j = Math.floor(rnd() * (i + 1)); x = b[i]; b[i] = b[j]; b[j] = x; }
    return b;
  }
  function gunAdi(t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); }
  function gunNo(t) { return Math.round((Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) - ILK_GUN) / 86400000) + 1; }
  function sure(sn) { sn = Math.max(0, Math.floor(sn)); var d = Math.floor(sn / 60); return (d < 10 ? '0' : '') + d + ':' + ('0' + sn % 60).slice(-2); }
  function adres(yol) { return location.origin + location.pathname + yol; }
  function dersAdi(d) { return d.baslik; }

  function paylas(metin) {
    if (navigator.share) { navigator.share({ text: metin }).catch(function () {}); return; }
    window.open('https://wa.me/?text=' + encodeURIComponent(metin), '_blank', 'noopener');
  }
  function kopyala(metin, dugme) {
    var bitti = function () { var e = dugme.textContent; dugme.textContent = 'Kopyalandı'; setTimeout(function () { dugme.textContent = e; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(metin).then(bitti, function () {});
    else { var t = document.createElement('textarea'); t.value = metin; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); bitti(); } catch (e) {} t.remove(); }
  }
  function paylasDugmeleri(metin) {
    return '<div class="oy-paylas"><button type="button" class="dugme ana-dugme" data-paylas>Gruba gönder</button><button type="button" class="dugme" data-kopyala>Kopyala</button></div>';
  }
  function paylasBagla(kok, metin) {
    var p = kok.querySelector('[data-paylas]'), k = kok.querySelector('[data-kopyala]');
    if (p) p.addEventListener('click', function () { paylas(metin()); });
    if (k) k.addEventListener('click', function () { kopyala(metin(), k); });
  }

  // ---------- Ekran klavyesi (Türkçe Q, Q-W-X yok) ----------
  var SATIRLAR = [['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'], ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'], ['⏎', 'Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', '⌫']];
  function klavye(enterYazi) {
    return '<div class="tk" role="group" aria-label="Klavye">' + SATIRLAR.map(function (s) {
      return '<div class="tk-s">' + s.map(function (t) {
        if (t === '⏎') return '<button type="button" class="tk-t genis" data-t="enter">' + esc(enterYazi) + '</button>';
        if (t === '⌫') return '<button type="button" class="tk-t genis" data-t="sil" aria-label="Sil"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M21 5H8l-6 7 6 7h13a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zm-3.3 10.3-1.4 1.4L13 13.4l-3.3 3.3-1.4-1.4 3.3-3.3-3.3-3.3 1.4-1.4 3.3 3.3 3.3-3.3 1.4 1.4-3.3 3.3z" fill="currentColor"/></svg></button>';
        return '<button type="button" class="tk-t" data-t="' + t + '">' + t + '</button>';
      }).join('') + '</div>';
    }).join('') + '</div>';
  }
  var tusDinle = null;
  function tusBagla(kok, f) {
    kok.addEventListener('click', function (e) {
      var b = e.target.closest('[data-t]');
      if (b && kok.contains(b)) f(b.dataset.t);
    });
    tusDinle = function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      var t = null;
      if (e.key === 'Enter') t = 'enter';
      else if (e.key === 'Backspace') t = 'sil';
      else if (/^Arrow/.test(e.key)) t = e.key;
      else if (e.key.length === 1) { var h = buyuk(e.key.toLocaleLowerCase('tr')); if (HARF[h]) t = h; }
      if (!t) return;
      if (t === 'enter' && e.target && e.target.tagName === 'BUTTON' && !e.target.closest('.tk')) return;
      e.preventDefault();
      f(t);
    };
    document.addEventListener('keydown', tusDinle);
    // Sayfanın altı, sabit klavyenin arkasında kalmasın
    altOlc = function () { document.documentElement.style.setProperty('--oy-alt-h', kok.offsetHeight + 'px'); };
    altOlc();
    window.addEventListener('resize', altOlc);
    if (window.ResizeObserver) { altGozcu = new ResizeObserver(altOlc); altGozcu.observe(kok); }
  }
  var altOlc = null, altGozcu = null;

  var saat = null;
  function birak() {
    if (tusDinle) { document.removeEventListener('keydown', tusDinle); tusDinle = null; }
    if (saat) { clearInterval(saat); saat = null; }
    if (altOlc) { window.removeEventListener('resize', altOlc); altOlc = null; }
    if (altGozcu) { altGozcu.disconnect(); altGozcu = null; }
    document.body.classList.remove('oyun', 'oyun-bitti');
  }
  function sayfaAc(baslik, geri) {
    document.title = baslik + ' · Risale Sohbet';
    K.ustCiz(geri);
    K.cubuk.hidden = true;
    document.body.classList.add('oyun');
  }

  // Kelimenin derslerde geçtiği ilk yer: { ders, bolum }
  function kelimeYeri(cevap) {
    var c = cevap.join(''), bulunan = null;
    K.lugatListesi().some(function (x) {
      var h = harfler(x.terim);
      if (h && h.join('').indexOf(c) === 0 && h.length <= c.length + 3) { bulunan = x.yerler[0]; return true; }
      return false;
    });
    if (bulunan) return bulunan;
    R.sira.some(function (id) {
      var d = R.dersler[id];
      return d && d.bolumler.some(function (b, bi) {
        return (b.metin || []).some(function (p) {
          var kel = p.replace(/\(\(.*?\)\)/g, ' ').split(/[^A-Za-zÇĞİIÖŞÜçğıöşüÂÎÛâîû]+/);
          for (var i = 0; i < kel.length; i++) {
            var h = kel[i] && harfler(kel[i]);
            if (h && h.join('').indexOf(c) === 0 && h.length <= c.length + 3) { bulunan = { ders: id, bolum: bi }; return true; }
          }
          return false;
        });
      });
    });
    return bulunan;
  }

  // =========================================================
  // 1. GÜNÜN KELİMESİ
  // =========================================================
  function bugunku(t) {
    var l = R.gunlukKelimeler || [];
    if (!l.length) return null;
    t = t || new Date();
    var no = gunNo(t), x = l[((no - 1) % l.length + l.length) % l.length];
    return { no: no, gun: gunAdi(t), kelime: x[0], anlam: x[1], cevap: harfler(x[0]) };
  }
  function gkDurum(g) { return kayit.kelime[g.gun] || { no: g.no, t: [], d: 0, i: false }; }

  function renkle(tahmin, cevap) {
    var n = cevap.length, r = [], kalan = {}, i;
    for (i = 0; i < n; i++) {
      if (tahmin[i] === cevap[i]) r[i] = 'd';
      else { r[i] = 'y'; kalan[cevap[i]] = (kalan[cevap[i]] || 0) + 1; }
    }
    for (i = 0; i < n; i++) if (r[i] !== 'd' && kalan[tahmin[i]]) { r[i] = 'v'; kalan[tahmin[i]]--; }
    return r;
  }

  function gkIstatistik() {
    var oyunlar = Object.keys(kayit.kelime).map(function (g) { return kayit.kelime[g]; }).filter(function (x) { return x.d; });
    var kazanilan = oyunlar.filter(function (x) { return x.d === 1; });
    var dagilim = [0, 0, 0, 0, 0, 0];
    kazanilan.forEach(function (x) { if (x.t.length >= 1 && x.t.length <= HAK) dagilim[x.t.length - 1]++; });
    var nolar = {};
    oyunlar.forEach(function (x) { nolar[x.no] = x.d; });
    var bugun = gunNo(new Date()), seri = 0, n = nolar[bugun] ? bugun : bugun - 1;
    while (nolar[n] === 1) { seri++; n--; }
    var enUzun = 0, s = 0, sirali = Object.keys(nolar).map(Number).sort(function (a, b) { return a - b; }), onceki = null;
    sirali.forEach(function (no) {
      if (nolar[no] === 1) { s = (onceki === no - 1 && nolar[onceki] === 1) ? s + 1 : 1; enUzun = Math.max(enUzun, s); } else s = 0;
      onceki = no;
    });
    return { oynanan: oyunlar.length, kazanma: oyunlar.length ? Math.round(kazanilan.length * 100 / oyunlar.length) : 0, seri: seri, enUzun: enUzun, dagilim: dagilim };
  }

  function gkPaylasMetni(g, dur) {
    var kare = { d: '🟩', v: '🟨', y: '⬜' };
    return 'Risale · Günün Kelimesi #' + g.no + '\n' +
      (dur.d === 1 ? dur.t.length : 'X') + '/' + HAK + (dur.i ? ' 💡' : '') + '\n' +
      dur.t.map(function (t) { return renkle(Array.from(t), g.cevap).map(function (r) { return kare[r]; }).join(''); }).join('\n') +
      '\n' + adres('#/kelime');
  }

  function kalanSure() {
    var t = new Date(), yarin = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1), dk = Math.ceil((yarin - t) / 60000);
    return (Math.floor(dk / 60) ? Math.floor(dk / 60) + ' sa ' : '') + dk % 60 + ' dk';
  }

  function gunlukKelime() {
    var g = bugunku();
    sayfaAc('Günün kelimesi', '<a class="geri" href="#/oyun">‹ Oyunlar</a>');
    var govde = K.govde;
    if (!g || !g.cevap) { govde.innerHTML = '<div class="ana"><h1>Günün kelimesi</h1><p>Kelime listesi bulunamadı.</p></div>'; return; }
    var n = g.cevap.length, dur = gkDurum(g), yazilan = [], kilit = false;

    var satirlar = '';
    for (var r = 0; r < HAK; r++) {
      satirlar += '<div class="gk-s" data-s="' + r + '">';
      for (var c = 0; c < n; c++) satirlar += '<div class="gk-k" style="--i:' + c + '"></div>';
      satirlar += '</div>';
    }
    govde.innerHTML = '<div class="gk" style="--n:' + n + '">' +
      '<div class="gk-bas"><h1>Günün kelimesi <span>#' + g.no + '</span></h1>' +
      '<p>' + n + ' harfli bir Risale kelimesi. ' + HAK + ' hakkın var. <button type="button" class="baglanti" id="gk-nasil">Nasıl oynanır?</button></p>' +
      '<div class="gk-nasil" id="gk-nasil-kutu" hidden><p>Bir kelime yaz, <b>Dene</b>\'ye bas. Kutular renklenir:</p>' +
      '<p><span class="gk-ornek d">A</span> harf doğru ve yeri doğru · <span class="gk-ornek v">A</span> harf kelimede var, yeri yanlış · <span class="gk-ornek y">A</span> harf kelimede yok</p>' +
      '<p>Şapkalar sayılmaz (â = a, î = i). Takılırsan <b>İpucu</b> anlamını gösterir. Her gün yeni kelime.</p></div></div>' +
      '<div class="gk-tablo" id="gk-tablo">' + satirlar + '</div>' +
      '<p class="gk-mesaj" id="gk-mesaj" role="status" aria-live="polite"></p>' +
      '<div class="gk-ipucu" id="gk-ipucu"></div>' +
      '<div id="gk-sonuc"></div></div>' +
      '<div class="oy-alt" id="gk-alt">' + klavye('Dene') + '</div>';

    var tablo = document.getElementById('gk-tablo'), mesaj = document.getElementById('gk-mesaj'), ipucu = document.getElementById('gk-ipucu'),
      sonuc = document.getElementById('gk-sonuc'), alt = document.getElementById('gk-alt');
    document.getElementById('gk-nasil').addEventListener('click', function () { var k = document.getElementById('gk-nasil-kutu'); k.hidden = !k.hidden; });

    function satir(i) { return tablo.children[i]; }
    function yaz() {
      var s = satir(dur.t.length);
      if (!s) return;
      for (var c = 0; c < n; c++) { s.children[c].textContent = yazilan[c] || ''; s.children[c].classList.toggle('dolu', !!yazilan[c]); }
    }
    function tuslariBoya() {
      var durum = {};
      dur.t.forEach(function (t) {
        var h = Array.from(t), r = renkle(h, g.cevap);
        h.forEach(function (x, i) { var o = durum[x]; if (r[i] === 'd' || (r[i] === 'v' && o !== 'd') || !o) durum[x] = r[i]; });
      });
      alt.querySelectorAll('.tk-t[data-t]').forEach(function (b) {
        b.classList.remove('d', 'v', 'y');
        if (durum[b.dataset.t]) b.classList.add(durum[b.dataset.t]);
      });
    }
    function satirBoya(i, animasyon) {
      var h = Array.from(dur.t[i]), r = renkle(h, g.cevap), s = satir(i);
      for (var c = 0; c < n; c++) {
        var k = s.children[c];
        k.textContent = h[c];
        k.classList.add('dolu');
        k.classList.toggle('cevir', !!animasyon);
        k.classList.add(r[c]);
      }
    }
    function ipucuCiz() {
      ipucu.innerHTML = dur.d ? '' : dur.i ? '<p><b>İpucu:</b> ' + esc(g.anlam) + '</p>' :
        (dur.d ? '' : '<button type="button" class="dugme kucuk-dugme" id="gk-ipucu-ac">İpucu: anlamını göster</button>');
      var b = document.getElementById('gk-ipucu-ac');
      if (b) b.addEventListener('click', function () { dur.i = true; kaydet(); ipucuCiz(); });
    }
    function kaydet() { kayit.kelime[g.gun] = dur; sakla(); }
    function sallaMesaj(m) {
      mesaj.textContent = m;
      var s = satir(dur.t.length);
      if (s) { s.classList.remove('salla'); void s.offsetWidth; s.classList.add('salla'); }
    }

    function bitisCiz() {
      alt.hidden = true;
      document.body.classList.add('oyun-bitti');
      var ist = gkIstatistik(), yer = kelimeYeri(g.cevap), enCok = Math.max.apply(null, ist.dagilim.concat([1]));
      mesaj.textContent = dur.d === 1 ? ['Maşallah! İlk denemede!', 'Harika!', 'Çok güzel!', 'Güzel!', 'Oldu!', 'Son anda!'][dur.t.length - 1] : 'Olmadı. Yarın yeni kelime var.';
      sonuc.innerHTML = '<div class="gk-cevap"><small>Bugünün kelimesi</small><b>' + esc(g.kelime) + '</b><p>' + esc(g.anlam) + '</p>' +
        (yer && R.dersler[yer.ders] ? '<a href="#/' + esc(yer.ders) + '/' + yer.bolum + '">Derste geçtiği yer: ' + esc(dersAdi(R.dersler[yer.ders])) + ' ›</a>' : '') + '</div>' +
        paylasDugmeleri() +
        '<div class="gk-ist"><div><b>' + ist.oynanan + '</b><small>Oynanan</small></div><div><b>' + ist.kazanma + '%</b><small>Bulunan</small></div>' +
        '<div><b>' + ist.seri + '</b><small>Seri</small></div><div><b>' + ist.enUzun + '</b><small>En uzun seri</small></div></div>' +
        '<div class="gk-dag" aria-label="Kaçıncı denemede buldun">' + ist.dagilim.map(function (v, i) {
          return '<div class="gk-dag-s"><span>' + (i + 1) + '</span><i class="' + (dur.d === 1 && dur.t.length === i + 1 ? 'bu' : '') + '" style="width:' + Math.max(8, Math.round(v * 100 / enCok)) + '%">' + v + '</i></div>';
        }).join('') + '</div>' +
        '<p class="gk-yarin">Yeni kelime ' + kalanSure() + ' sonra. <a href="#/oyun">Çengel bulmacalar ›</a></p>';
      paylasBagla(sonuc, function () { return gkPaylasMetni(g, dur); });
    }

    function tus(t) {
      if (kilit || dur.d) return;
      mesaj.textContent = '';
      if (t === 'sil') { yazilan.pop(); yaz(); return; }
      if (t === 'enter') {
        if (yazilan.length < n) { sallaMesaj('Kelime ' + n + ' harf olmalı.'); return; }
        var tahmin = yazilan.join('');
        dur.t.push(tahmin); yazilan = [];
        var i = dur.t.length - 1;
        satirBoya(i, true); tuslariBoya();
        if (tahmin === g.cevap.join('')) dur.d = 1;
        else if (dur.t.length >= HAK) dur.d = 2;
        kaydet();
        if (dur.d) { kilit = true; setTimeout(function () { kilit = false; bitisCiz(); ipucuCiz(); }, n * 120 + 350); }
        return;
      }
      if (t.length === 1 && yazilan.length < n) { yazilan.push(t); yaz(); }
    }

    dur.t.forEach(function (_, i) { satirBoya(i, false); });
    tuslariBoya(); ipucuCiz();
    if (dur.d) bitisCiz(); else tusBagla(alt, tus);
  }

  // =========================================================
  // 2. ÇENGEL BULMACA
  // =========================================================
  var EN_GENIS = 12, EN_UZUN = 13, EN_COK = 14, GRUP = 12;
  var onbellek = {};

  function dersKelimeleri(d) {
    if (onbellek['k:' + d.id]) return onbellek['k:' + d.id];
    var gor = {}, l = [];
    K.lugatListesi().forEach(function (x) {
      var yer = x.yerler.filter(function (y) { return y.ders === d.id; })[0];
      if (!yer || !x.anlam) return;
      var h = harfler(x.terim);
      if (!h || h.length < 3 || h.length > 11) return;
      var c = h.join('');
      if (gor[c]) return;
      gor[c] = 1;
      l.push({ c: c, h: h, terim: x.terim, anlam: x.anlam, yer: yer });
    });
    l.sort(function (a, b) { return a.c < b.c ? -1 : a.c > b.c ? 1 : 0; });
    return (onbellek['k:' + d.id] = karistir(l, rastgele(tohum(d.id))));
  }
  function bulmacaSayisi(d) {
    var n = dersKelimeleri(d).length;
    return n < 8 ? 0 : Math.max(1, Math.min(3, Math.floor(n / GRUP)));
  }

  function yerlestir(sira, rnd) {
    var iz = {}, yer = [], kes = 0, k = { r0: 0, r1: 0, c0: 0, c1: 0 };
    function al(r, c) { return iz[r + ',' + c]; }
    function dene(w, r, c, yon) {
      var dr = yon, dc = 1 - yon, n = w.h.length, say = 0, i, rr, cc, v;
      if (al(r - dr, c - dc) || al(r + dr * n, c + dc * n)) return -1;
      for (i = 0; i < n; i++) {
        rr = r + dr * i; cc = c + dc * i; v = al(rr, cc);
        if (v) { if (v.h !== w.h[i] || v.y[yon]) return -1; say++; }
        else if (al(rr + dc, cc + dr) || al(rr - dc, cc - dr)) return -1;
      }
      var r2 = r + dr * (n - 1), c2 = c + dc * (n - 1);
      if (Math.max(k.r1, r2) - Math.min(k.r0, r) + 1 > EN_UZUN) return -1;
      if (Math.max(k.c1, c2) - Math.min(k.c0, c) + 1 > EN_GENIS) return -1;
      return say === n ? -1 : say;
    }
    function koy(w, r, c, yon, say) {
      var dr = yon, dc = 1 - yon;
      for (var i = 0; i < w.h.length; i++) {
        var key = (r + dr * i) + ',' + (c + dc * i);
        if (!iz[key]) iz[key] = { h: w.h[i], y: [false, false] };
        iz[key].y[yon] = true;
      }
      k.r0 = Math.min(k.r0, r); k.c0 = Math.min(k.c0, c);
      k.r1 = Math.max(k.r1, r + dr * (w.h.length - 1)); k.c1 = Math.max(k.c1, c + dc * (w.h.length - 1));
      yer.push({ w: w, r: r, c: c, yon: yon });
      kes += say;
    }
    if (!sira.length) return { yer: yer, kes: 0, alan: 0 };
    koy(sira[0], 0, 0, 0, 0);
    var kalan = sira.slice(1), ilerledi = true;
    while (ilerledi && yer.length < EN_COK) {
      ilerledi = false;
      for (var wi = 0; wi < kalan.length && yer.length < EN_COK; wi++) {
        var w = kalan[wi], en = null;
        Object.keys(iz).forEach(function (key) {
          var hc = iz[key], p = key.split(','), r = +p[0], c = +p[1];
          for (var i = 0; i < w.h.length; i++) {
            if (w.h[i] !== hc.h) continue;
            for (var yon = 0; yon < 2; yon++) {
              if (hc.y[yon]) continue;
              var sr = yon ? r - i : r, sc = yon ? c : c - i, say = dene(w, sr, sc, yon);
              if (say < 1) continue;
              var alan = (Math.max(k.r1, sr + yon * (w.h.length - 1)) - Math.min(k.r0, sr) + 1) * (Math.max(k.c1, sc + (1 - yon) * (w.h.length - 1)) - Math.min(k.c0, sc) + 1);
              var puan = say * 40 - alan + rnd() * 6;
              if (!en || puan > en.puan) en = { r: sr, c: sc, yon: yon, say: say, puan: puan };
            }
          }
        });
        if (en) { koy(w, en.r, en.c, en.yon, en.say); kalan.splice(wi, 1); wi--; ilerledi = true; }
      }
    }
    return { yer: yer, kes: kes, alan: (k.r1 - k.r0 + 1) * (k.c1 - k.c0 + 1), k: k };
  }

  function bulmacaKur(d, no) {
    var anahtar = d.id + '#' + no;
    if (onbellek[anahtar]) return onbellek[anahtar];
    var sayi = bulmacaSayisi(d);
    if (!sayi || no < 1 || no > sayi) return null;
    var l = dersKelimeleri(d), boy = Math.ceil(l.length / sayi), grup = l.slice((no - 1) * boy, no * boy);
    var rnd = rastgele(tohum(anahtar)), en = null;
    for (var deneme = 0; deneme < 36; deneme++) {
      var anah = grup.map(function (w) { return { w: w, s: w.h.length + rnd() * 4 }; });
      anah.sort(function (a, b) { return b.s - a.s || (a.w.c < b.w.c ? -1 : 1); });
      var s = yerlestir(anah.map(function (x) { return x.w; }), rnd);
      s.puan = s.yer.length * 1000 + s.kes * 12 - s.alan;
      if (!en || s.puan > en.puan) en = s;
    }
    // Koordinatları sıfırdan başlat, numarala
    var W = en.k.c1 - en.k.c0 + 1, H = en.k.r1 - en.k.r0 + 1, hucre = {}, baslar = {};
    en.yer.forEach(function (y, i) {
      y.r -= en.k.r0; y.c -= en.k.c0;
      baslar[y.r + ',' + y.c] = true;
      for (var j = 0; j < y.w.h.length; j++) {
        var key = (y.r + y.yon * j) + ',' + (y.c + (1 - y.yon) * j);
        if (!hucre[key]) hucre[key] = { h: y.w.h[j], kel: [-1, -1] };
        hucre[key].kel[y.yon] = i;
      }
    });
    var no2 = 0, nolar = {};
    for (var r = 0; r < H; r++) for (var c = 0; c < W; c++) if (baslar[r + ',' + c]) nolar[r + ',' + c] = ++no2;
    var kelimeler = en.yer.map(function (y, i) {
      var hucreler = [];
      for (var j = 0; j < y.w.h.length; j++) hucreler.push((y.r + y.yon * j) + ',' + (y.c + (1 - y.yon) * j));
      return { i: i, no: nolar[y.r + ',' + y.c], yon: y.yon, r: y.r, c: y.c, cevap: y.w.c, terim: y.w.terim, anlam: y.w.anlam, yer: y.w.yer, hucreler: hucreler };
    });
    var sira = kelimeler.slice().sort(function (a, b) { return a.yon - b.yon || a.no - b.no; });
    var imza = tohum(kelimeler.map(function (k) { return k.cevap + k.r + k.c + k.yon; }).join('|')).toString(36);
    return (onbellek[anahtar] = { d: d, no: no, sayi: sayi, W: W, H: H, hucre: hucre, nolar: nolar, kelimeler: kelimeler, sira: sira, imza: imza });
  }

  function bmKayit(b) {
    var key = b.d.id + '#' + b.no, k = kayit.bulmaca[key];
    if (!k || k.imza !== b.imza) k = kayit.bulmaca[key] = { imza: b.imza, g: {}, a: {}, sure: 0, ipucu: 0, bitti: false };
    return k;
  }
  function bmDurumu(d, no) {
    var b = bulmacaKur(d, no), k = b && kayit.bulmaca[d.id + '#' + no];
    if (!k || k.imza !== b.imza) return { b: b, durum: 'yeni' };
    return { b: b, durum: k.bitti ? 'bitti' : (Object.keys(k.g).length ? 'devam' : 'yeni'), k: k };
  }

  // Dersteki cümle: kelimenin geçtiği paragraftan kısa bir parça, kelime boşlukla
  function cumleBul(w) {
    var b = w.yer && R.dersler[w.yer.ders] && R.dersler[w.yer.ders].bolumler[w.yer.bolum];
    if (!b) return '';
    var bulunan = '';
    (b.metin || []).concat(b.aciklama || []).some(function (p) {
      var duz = p.replace(/\(\(.*?\)\)/g, '').replace(/[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+[\s؀-ۿ]*/g, '… ').replace(/\s+/g, ' ');
      var kel = duz.split(' ');
      for (var i = 0; i < kel.length; i++) {
        var h = harfler(kel[i].replace(/^[^A-Za-zÇĞİIÖŞÜçğıöşüÂÎÛâîû]+|[^A-Za-zÇĞİIÖŞÜçğıöşüÂÎÛâîû]+$/g, ''));
        if (h && h.join('') === w.cevap) {
          var once = kel.slice(Math.max(0, i - 7), i).join(' '), sonra = kel.slice(i + 1, i + 6).join(' ');
          var son = kel[i].match(/[^A-Za-zÇĞİIÖŞÜçğıöşüÂÎÛâîû]+$/);
          bulunan = (i > 7 ? '… ' : '') + esc(once) + ' <span class="bm-bos">' + w.cevap.split('').map(function () { return '_'; }).join(' ') + '</span>' + esc(son ? son[0] : '') + ' ' + esc(sonra) + (i + 6 < kel.length ? ' …' : '');
          return true;
        }
      }
      return false;
    });
    return bulunan;
  }

  function bulmacaSayfasi(d, no) {
    no = no || 1;
    var b = bulmacaKur(d, no);
    sayfaAc('Bulmaca · ' + d.baslik, '<a class="geri" href="#/' + esc(d.id) + '">‹ Derse dön</a>');
    var govde = K.govde;
    if (!b) { govde.innerHTML = '<div class="ana"><h1>Çengel bulmaca</h1><p>Bu dersin lügatinde bulmaca kurmaya yetecek kelime yok.</p></div>'; return; }
    var k = bmKayit(b), sec = null, yon = 0, sonKelime = null;

    var izgara = '';
    for (var r = 0; r < b.H; r++) for (var c = 0; c < b.W; c++) {
      var key = r + ',' + c, h = b.hucre[key];
      izgara += h ? '<div class="bm-h" data-k="' + key + '">' + (b.nolar[key] ? '<small>' + b.nolar[key] + '</small>' : '') + '<span></span></div>' : '<div class="bm-b" aria-hidden="true"></div>';
    }
    var secim = b.sayi > 1 ? '<div class="bm-sec">' + Array.apply(null, Array(b.sayi)).map(function (_, i) {
      var dd = bmDurumu(d, i + 1).durum;
      return '<a href="#/' + esc(d.id) + '/bulmaca/' + (i + 1) + '" class="' + (i + 1 === no ? 'simdi' : '') + '">' + (i + 1) + (dd === 'bitti' ? ' ✓' : '') + '</a>';
    }).join('') + '</div>' : '';
    function listeCiz(y) {
      return b.sira.filter(function (w) { return w.yon === y; }).map(function (w) {
        return '<li data-w="' + w.i + '"><b>' + w.no + '</b> ' + esc(w.anlam) + ' <small>(' + w.cevap.length + ')</small></li>';
      }).join('');
    }
    govde.innerHTML = '<div class="bm"><div class="bm-bas"><div><small>' + esc(d.baslik) + '</small><h1>Çengel bulmaca ' + (b.sayi > 1 ? no : '') + '</h1></div>' +
      '<span class="bm-saat" id="bm-saat" aria-label="Süre">00:00</span></div>' + secim +
      '<div class="bm-iz" id="bm-iz" style="--w:' + b.W + ';--h:' + b.H + '" role="grid" aria-label="Bulmaca">' + izgara + '</div>' +
      '<div class="bm-ipuclari" id="bm-yardim"><button type="button" class="dugme kucuk-dugme" id="bm-cumle">Dersteki cümle</button>' +
      '<button type="button" class="dugme kucuk-dugme" id="bm-harf">Harf aç</button><button type="button" class="dugme kucuk-dugme" id="bm-kelime">Kelimeyi aç</button></div>' +
      '<div id="bm-sonuc"></div>' +
      '<div class="bm-liste"><h2>Soldan sağa</h2><ol id="bm-l0">' + listeCiz(0) + '</ol><h2>Yukarıdan aşağı</h2><ol id="bm-l1">' + listeCiz(1) + '</ol>' +
      '<p class="bm-not">Kelimeler bu dersin lügatinden, ipuçları anlamları. Şapkalar yazılmaz (â = A, î = İ). Harf aç ve Kelimeyi aç ipucu sayılır; Dersteki cümle sayılmaz.</p></div></div>' +
      '<div class="oy-alt" id="bm-alt"><p class="bm-cumle" id="bm-cumle-kutu" hidden></p><div class="bm-ip" id="bm-ip"><button type="button" class="bm-ok" id="bm-onceki" aria-label="Önceki soru">‹</button>' +
      '<div class="bm-ip-yazi" id="bm-ip-yazi" role="status" aria-live="polite"></div><button type="button" class="bm-ok" id="bm-sonraki" aria-label="Sonraki soru">›</button></div>' + klavye('Sonraki') + '</div>';

    var iz = document.getElementById('bm-iz'), alt = document.getElementById('bm-alt'), ipYazi = document.getElementById('bm-ip-yazi'),
      saatEl = document.getElementById('bm-saat'), cumleKutu = document.getElementById('bm-cumle-kutu'), sonucEl = document.getElementById('bm-sonuc');
    function hEl(key) { return iz.querySelector('[data-k="' + key + '"]'); }
    function kelimeTamam(w) { return w.hucreler.every(function (key) { return k.g[key] === b.hucre[key].h; }); }
    function kelimeDolu(w) { return w.hucreler.every(function (key) { return k.g[key]; }); }
    function aktifKelime() {
      if (!sec) return null;
      var h = b.hucre[sec], i = h.kel[yon];
      if (i < 0) { yon = 1 - yon; i = h.kel[yon]; }
      return b.kelimeler[i];
    }

    function ciz() {
      var w = aktifKelime();
      iz.querySelectorAll('.bm-h').forEach(function (el) {
        var key = el.dataset.k;
        el.querySelector('span').textContent = k.g[key] || '';
        el.classList.toggle('acik', !!k.a[key]);
        el.classList.toggle('secili', key === sec);
        el.classList.toggle('kelimede', !!w && w.hucreler.indexOf(key) >= 0 && key !== sec);
        var h = b.hucre[key];
        el.classList.toggle('tamam', [0, 1].some(function (y) { return h.kel[y] >= 0 && kelimeTamam(b.kelimeler[h.kel[y]]); }));
      });
      document.querySelectorAll('.bm-liste li').forEach(function (li) {
        var x = b.kelimeler[+li.dataset.w];
        li.classList.toggle('tamam', kelimeTamam(x));
        li.classList.toggle('simdi', !!w && x.i === w.i);
      });
      if (w) {
        var yanlis = kelimeDolu(w) && !kelimeTamam(w);
        ipYazi.innerHTML = '<span><b>' + w.no + ' ' + (w.yon ? 'Aşağı' : 'Sağa') + '</b> ' + esc(w.anlam) + ' <small>(' + w.cevap.length + ')</small></span>' + (yanlis ? '<em>Bu kelimede yanlış harf var</em>' : '');
        ipYazi.parentNode.classList.toggle('yanlis', yanlis);
        if (sonKelime !== w.i) { cumleKutu.hidden = true; sonKelime = w.i; }
      }
    }
    function sec_(key, y) {
      sec = key; if (y != null) yon = y;
      if (b.hucre[sec].kel[yon] < 0) yon = 1 - yon;
      ciz();
      var el = hEl(sec), r = el.getBoundingClientRect(), ust = alt.getBoundingClientRect().top;
      if (r.bottom > ust - 8 || r.top < 8) window.scrollBy({ top: r.top - 90, behavior: 'smooth' });
    }
    function kelimeyeGit(w) {
      var bos = w.hucreler.filter(function (key) { return !k.g[key]; })[0];
      sec_(bos || w.hucreler[0], w.yon);
    }
    function sonrakiKelime(adim) {
      var w = aktifKelime(), i = w ? b.sira.indexOf(w) : -1;
      for (var j = 1; j <= b.sira.length; j++) {
        var x = b.sira[((i + adim * j) % b.sira.length + b.sira.length) % b.sira.length];
        if (!kelimeTamam(x) || j === b.sira.length) { kelimeyeGit(x); return; }
      }
    }
    function sakla_() { kayit.bulmaca[b.d.id + '#' + b.no] = k; sakla(); }
    function bittiMi() {
      if (k.bitti || !b.kelimeler.every(kelimeTamam)) return;
      k.bitti = true; sakla_();
      if (saat) { clearInterval(saat); saat = null; }
      bitisCiz(true);
    }
    function yaz(h) {
      if (!sec || k.bitti) return;
      var w = aktifKelime(), once = kelimeTamam(w);
      if (!k.a[sec]) k.g[sec] = h;
      var i = w.hucreler.indexOf(sec);
      sakla_();
      if (!once && kelimeTamam(w)) {
        ciz(); bittiMi();
        if (!k.bitti) sonrakiKelime(1);
        return;
      }
      if (i < w.hucreler.length - 1) sec = w.hucreler[i + 1];
      ciz();
    }
    function sil() {
      if (!sec || k.bitti) return;
      var w = aktifKelime(), i = w.hucreler.indexOf(sec);
      if (k.g[sec] && !k.a[sec]) delete k.g[sec];
      else if (i > 0) { sec = w.hucreler[i - 1]; if (!k.a[sec]) delete k.g[sec]; }
      sakla_(); ciz();
    }
    function ok(t) {
      if (!sec) return;
      var p = sec.split(','), r = +p[0], c = +p[1], dr = 0, dc = 0;
      if (t === 'ArrowUp') dr = -1; if (t === 'ArrowDown') dr = 1; if (t === 'ArrowLeft') dc = -1; if (t === 'ArrowRight') dc = 1;
      var y = dr ? 1 : 0;
      for (var s = 1; s < 14; s++) { var key = (r + dr * s) + ',' + (c + dc * s); if (b.hucre[key]) { sec_(key, b.hucre[key].kel[y] >= 0 ? y : null); return; } }
    }
    function tus(t) {
      if (t === 'enter') sonrakiKelime(1);
      else if (t === 'sil') sil();
      else if (/^Arrow/.test(t)) ok(t);
      else yaz(t);
    }

    iz.addEventListener('click', function (e) {
      var el = e.target.closest('.bm-h');
      if (!el || k.bitti) return;
      var key = el.dataset.k;
      if (key === sec && b.hucre[key].kel[1 - yon] >= 0) sec_(key, 1 - yon); else sec_(key);
    });
    document.querySelector('.bm-liste').addEventListener('click', function (e) {
      var li = e.target.closest('li[data-w]');
      if (li && !k.bitti) { kelimeyeGit(b.kelimeler[+li.dataset.w]); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });
    document.getElementById('bm-onceki').addEventListener('click', function () { sonrakiKelime(-1); });
    document.getElementById('bm-sonraki').addEventListener('click', function () { sonrakiKelime(1); });
    document.getElementById('bm-ip-yazi').addEventListener('click', function () {
      if (sec && b.hucre[sec].kel[1 - yon] >= 0) sec_(sec, 1 - yon);
    });
    document.getElementById('bm-harf').addEventListener('click', function () {
      var w = aktifKelime(); if (!w || k.bitti) return;
      var key = k.g[sec] !== b.hucre[sec].h ? sec : w.hucreler.filter(function (x) { return k.g[x] !== b.hucre[x].h; })[0];
      if (!key) return;
      k.g[key] = b.hucre[key].h; k.a[key] = 1; k.ipucu++; sakla_();
      sec = key; ciz();
      if (kelimeTamam(w)) { bittiMi(); if (!k.bitti) sonrakiKelime(1); }
    });
    document.getElementById('bm-kelime').addEventListener('click', function () {
      var w = aktifKelime(); if (!w || k.bitti) return;
      var acilan = 0;
      w.hucreler.forEach(function (key) { if (k.g[key] !== b.hucre[key].h) { k.g[key] = b.hucre[key].h; k.a[key] = 1; acilan++; } });
      if (!acilan) return;
      k.ipucu += acilan; sakla_(); ciz(); bittiMi();
      if (!k.bitti) sonrakiKelime(1);
    });
    document.getElementById('bm-cumle').addEventListener('click', function () {
      var w = aktifKelime(); if (!w) return;
      var s = cumleBul(w);
      cumleKutu.innerHTML = '<button type="button" class="bm-cumle-kapat" aria-label="Kapat">✕</button>' + (s ? '<b>Dersteki cümle:</b> ' + s : 'Bu kelime için dersteki cümle bulunamadı.');
      cumleKutu.hidden = false;
      cumleKutu.querySelector('button').addEventListener('click', function () { cumleKutu.hidden = true; });
    });

    function paylasMetni() {
      return 'Risale · Çengel Bulmaca\n' + d.baslik + (b.sayi > 1 ? ' · ' + no : '') + '\n✅ ' + b.kelimeler.length + ' kelime · ' + sure(k.sure) +
        ' · ' + (k.ipucu ? k.ipucu + ' harf ipucu' : 'ipucusuz') + '\n' + adres('#/' + d.id + '/bulmaca/' + no);
    }
    function bitisCiz(yeni) {
      alt.hidden = true;
      document.body.classList.add('oyun-bitti');
      document.getElementById('bm-yardim').hidden = true;
      cumleKutu.hidden = true;
      sec = null; ciz();
      saatEl.textContent = sure(k.sure);
      var sonraki = no < b.sayi ? '<a class="dugme" href="#/' + esc(d.id) + '/bulmaca/' + (no + 1) + '">Sonraki bulmaca ›</a>' : '<a class="dugme" href="#/oyun">Başka dersin bulmacası ›</a>';
      sonucEl.innerHTML = '<div class="bm-bitti"><b>' + (yeni ? 'Tebrikler, bulmaca tamam!' : 'Bu bulmacayı bitirdin.') + '</b>' +
        '<p>' + b.kelimeler.length + ' kelime · ' + sure(k.sure) + ' · ' + (k.ipucu ? k.ipucu + ' harf ipucu' : 'ipucu almadan') + '</p>' +
        paylasDugmeleri() + '<div class="bm-bitti-alt">' + sonraki + '<button type="button" class="dugme" id="bm-bastan">Baştan çöz</button></div>' +
        '<h2>Bu bulmacadaki kelimeler</h2><dl class="lugat">' + b.sira.map(function (w) {
          return '<dt>' + esc(w.terim) + '</dt><dd>' + esc(w.anlam) + '</dd>';
        }).join('') + '</dl></div>';
      paylasBagla(sonucEl, paylasMetni);
      document.getElementById('bm-bastan').addEventListener('click', function () {
        delete kayit.bulmaca[b.d.id + '#' + b.no]; sakla();
        document.body.classList.remove('oyun-bitti');
        birak(); bulmacaSayfasi(d, no); window.scrollTo(0, 0);
      });
    }

    if (k.bitti) { ciz(); bitisCiz(false); return; }
    tusBagla(alt, tus);
    saatEl.textContent = sure(k.sure);
    saat = setInterval(function () {
      if (document.hidden) return;
      k.sure++; saatEl.textContent = sure(k.sure);
      if (k.sure % 5 === 0) sakla_();
    }, 1000);
    kelimeyeGit(b.sira.filter(function (w) { return !kelimeTamam(w); })[0] || b.sira[0]);
    window.scrollTo(0, 0);
  }

  // =========================================================
  // 3. Oyun sayfası, ana sayfa kutusu, ders düğmesi
  // =========================================================
  function gkOzet() {
    var g = bugunku();
    if (!g || !g.cevap) return null;
    var dur = kayit.kelime[g.gun];
    return { g: g, durum: !dur || !dur.t.length ? 'yeni' : (dur.d === 1 ? 'buldu' : dur.d === 2 ? 'bulamadi' : 'devam'), dur: dur, n: dur ? dur.t.length : 0 };
  }

  function oyunSayfasi() {
    sayfaAc('Oyunlar', '<a class="geri" href="#/">‹ Dersler</a>');
    document.body.classList.remove('oyun');
    var o = gkOzet(), ist = gkIstatistik();
    var gk = o ? '<a class="oy-kart gk-kart" href="#/kelime"><div><small>Günün kelimesi #' + o.g.no + '</small><b>' +
      ({ yeni: o.g.cevap.length + ' harfli bugünkü kelime seni bekliyor', devam: 'Yarım kaldı: ' + o.n + '/' + HAK + ' deneme', buldu: 'Bugün buldun: ' + o.n + '/' + HAK, bulamadi: 'Bugün olmadı, yarın yeni kelime' })[o.durum] +
      '</b>' + (ist.seri ? '<span>Seri: ' + ist.seri + ' gün</span>' : '') + '</div><span class="dugme ana-dugme">' + (o.durum === 'yeni' ? 'Oyna' : o.durum === 'devam' ? 'Devam' : 'Sonuç') + '</span></a>' : '';
    var bm = R.sira.map(function (id) {
      var d = R.dersler[id];
      if (!d) return '';
      var n = bulmacaSayisi(d);
      if (!n) return '';
      return '<div class="oy-ders"><b>' + esc(d.baslik) + '</b><div class="bm-sec">' + Array.apply(null, Array(n)).map(function (_, i) {
        var x = bmDurumu(d, i + 1);
        return '<a href="#/' + esc(d.id) + '/bulmaca/' + (i + 1) + '" class="' + x.durum + '">' + (n > 1 ? 'Bulmaca ' + (i + 1) : 'Bulmaca') +
          (x.durum === 'bitti' ? ' ✓ <small>' + sure(x.k.sure) + '</small>' : x.durum === 'devam' ? ' <small>yarım</small>' : '') + '</a>';
      }).join('') + '</div></div>';
    }).join('');
    K.govde.innerHTML = '<div class="ana"><h1>Oyunlar</h1><p>Derslerin kelimeleriyle oyna, sonucunu gruba gönder.</p>' + gk +
      '<h2 class="oy-alt-bas">Çengel bulmaca</h2><p class="oy-acik">Her dersin zor kelimelerinden. İpucu kelimenin anlamı.</p>' + bm + '</div>';
  }

  function anaKutu() {
    var o = gkOzet();
    if (!o) return '';
    var yazi = { yeni: 'Günün kelimesi #' + o.g.no + ' seni bekliyor', devam: 'Günün kelimesi yarım kaldı', buldu: 'Günün kelimesini buldun: ' + o.n + '/' + HAK, bulamadi: 'Günün kelimesi bugün olmadı' }[o.durum];
    return '<div class="pk-ana oy-ana"><div><b>' + yazi + '</b><small>Çengel bulmacalar da Oyunlar\'da</small></div>' +
      '<a class="dugme ana-dugme" href="' + (o.durum === 'yeni' || o.durum === 'devam' ? '#/kelime' : '#/oyun') + '">' + (o.durum === 'yeni' ? 'Oyna' : o.durum === 'devam' ? 'Devam' : 'Oyunlar') + '</a></div>';
  }

  function dersDugmesi(d) {
    return bulmacaSayisi(d) ? '<a class="dugme" href="#/' + esc(d.id) + '/bulmaca">Bulmaca</a>' : '';
  }

  R.oyun = {
    kelime: gunlukKelime,
    bulmaca: bulmacaSayfasi,
    sayfa: oyunSayfasi,
    anaKutu: anaKutu,
    dersDugmesi: dersDugmesi,
    birak: birak,
    // testler ve ileride puan tablosu için
    _bulmacaKur: bulmacaKur, _bulmacaSayisi: bulmacaSayisi, _bugunku: bugunku, _renkle: renkle, _harfler: harfler,
  };
})();
