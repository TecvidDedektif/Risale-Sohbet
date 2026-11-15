/* ============================================================
   Risale Sohbet: uygulama

   Ders dosyaları (dersler/ klasörü) RISALE.dersEkle(...) ile eklenir.
   Ortak kelimeler dersler/lugat.js içinde RISALE.lugatEkle(...) ile.

   Adresler:
     #/                    ana sayfa
     #/<ders>              ders sayfası      (#/<ders>/3 = 3. bölüme git)
     #/lugat               bütün kelimeler
     #/tekrar              kelime tekrarı
     #/ara                 arama
   ============================================================ */

window.RISALE = {
  dersler: {},
  sira: [],
  ekLugat: {},
  dersEkle: function (d) { this.dersler[d.id] = d; },
  liste: function (l) { this.sira = l; },
  lugatEkle: function (o) { Object.assign(this.ekLugat, o); },
};

(function () {
  var R = window.RISALE;
  var ust = document.getElementById('ust');
  var govde = document.getElementById('govde');
  var cubuk = document.getElementById('cubuk');
  var sohbetCik = document.getElementById('sohbet-cik');
  var hatalar = [];

  // =========================================================
  // 1. Yardımcılar
  // =========================================================
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  // Arapça harfleri ayrı yazı tipiyle göster
  function arapca(html) {
    return html.replace(/([؀-ۿ][؀-ۿً-ٰٟ\s]*[؀-ۿً-ٰٟ])/g, '<span class="ar" lang="ar">$1</span>');
  }

  // Aramada ve lügatte harf farkları önemsiz olsun: "Şühedâ" = "suheda"
  function sade(s) {
    return String(s).toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[‑‐–-]/g, '-').replace(/[’'`]/g, "'");
  }

  // Bir anlamın hangi kelimeye ait olduğunu bulur: "… merâtib‑i hayat" -> "merâtib‑i hayat"
  // İzafetli kelimeleri (‑i, ‑ı, ‑u, ‑ü ile bağlananlar) birlikte alır.
  function terimBul(onceki) {
    var t = onceki.replace(/\s+$/, '').split(/\s+/);
    var temizle = function (w) { return w.replace(/^[“"'(«]+|[,;:.!?”"'»)]+$/g, ''); };
    var son = temizle(t.pop() || '');
    while (t.length && /[‑-](i|ı|u|ü|yi|yı|yu|yü)$/.test(temizle(t[t.length - 1]))) son = temizle(t.pop()) + ' ' + son;
    return son;
  }

  // =========================================================
  // 2. Lügat: bütün derslerdeki (( )) anlamlarından kendiliğinden oluşur
  // =========================================================
  var lugat = {};   // sade(terim) -> { terim, anlam, yerler: [{ders, bolum}] }

  function lugatKur() {
    Object.keys(R.ekLugat).forEach(function (terim) {
      lugat[sade(terim)] = { terim: terim, anlam: R.ekLugat[terim], yerler: [] };
    });
    R.sira.forEach(function (id) {
      var d = R.dersler[id];
      if (!d) return;
      d.bolumler.forEach(function (b, bi) {
        (b.metin || []).forEach(function (p) {
          var re = /\(\((.*?)\)\)/g, m;
          while ((m = re.exec(p))) {
            var terim = terimBul(p.slice(0, m.index).replace(/\(\(.*?\)\)/g, ''));
            if (!terim || /[؀-ۿ]/.test(terim)) continue;   // Arapça satırlar lügate girmez
            var k = sade(terim);
            if (!lugat[k]) lugat[k] = { terim: terim, anlam: '', yerler: [] };
            if (m[1] && !lugat[k].anlam) lugat[k].anlam = m[1];
            if (!lugat[k].yerler.some(function (y) { return y.ders === id && y.bolum === bi; })) lugat[k].yerler.push({ ders: id, bolum: bi });
          }
        });
      });
    });
  }

  // "kelime ((anlamı))"  ->  kelime <span class="anlam">(anlamı)</span>
  // "kelime (())"        ->  anlamı lügatten getirir
  function metinCiz(s, yer) {
    var cikti = '', son = 0, re = /\(\((.*?)\)\)/g, m;
    while ((m = re.exec(s))) {
      cikti += esc(s.slice(son, m.index));
      var anlam = m[1];
      if (!anlam) {
        var terim = terimBul(s.slice(0, m.index).replace(/\(\(.*?\)\)/g, ''));
        var kayit = lugat[sade(terim)];
        anlam = kayit && kayit.anlam;
        var h = yer + ': "' + terim + '" lügatte yok, anlamını (( )) içine yaz.';
        if (!anlam && hatalar.indexOf(h) === -1) hatalar.push(h);
      }
      if (anlam) cikti += '<span class="anlam">(' + esc(anlam) + ')</span>';
      son = re.lastIndex;
    }
    return arapca(cikti + esc(s.slice(son)));
  }

  // Paylaşım ve arama için düz metin
  function duzMetin(s) {
    return s.replace(/\(\((.*?)\)\)/g, function (_, a, i) {
      if (a) return '(' + a + ')';
      var k = lugat[sade(terimBul(s.slice(0, i).replace(/\(\(.*?\)\)/g, '')))];
      return k && k.anlam ? '(' + k.anlam + ')' : '';
    }).replace(/\s+\)/g, ')');
  }

  // =========================================================
  // 3. Ayarlar ve notlar: sadece bu telefonda saklanır
  // =========================================================
  function oku(anahtar, varsayilan) {
    try { return Object.assign(varsayilan, JSON.parse(localStorage.getItem(anahtar) || '{}')); } catch (e) { return varsayilan; }
  }
  function yaz(anahtar, deger) { try { localStorage.setItem(anahtar, JSON.stringify(deger)); return true; } catch (e) { return false; } }

  var ayar = oku('risale-ayar', { anlam: true, aciklama: true, ornek: true, boyut: 19 });
  var notlar = oku('risale-notlar', {});   // "ders:bölüm:paragraf" -> not

  function ayarUygula() {
    ['anlam', 'aciklama', 'ornek'].forEach(function (k) {
      document.body.classList.toggle(k + '-gizli', !ayar[k]);
      var d = cubuk.querySelector('[data-anahtar="' + k + '"]');
      if (d) d.setAttribute('aria-pressed', String(ayar[k]));
    });
    var boyut = ayar.boyut + (document.body.classList.contains('sohbet') ? 5 : 0);
    document.documentElement.style.setProperty('--boyut', boyut + 'px');
  }

  cubuk.addEventListener('click', function (e) {
    var d = e.target.closest('button');
    if (!d) return;
    if (d.dataset.anahtar) ayar[d.dataset.anahtar] = !ayar[d.dataset.anahtar];
    if (d.dataset.boyut) ayar.boyut = Math.max(15, Math.min(28, ayar.boyut + Number(d.dataset.boyut)));
    yaz('risale-ayar', ayar);
    ayarUygula();
  });

  // =========================================================
  // 4. Sohbet modu: sadece metin, büyük yazı, ekran kararmaz
  // =========================================================
  var ekranKilidi = null;
  function ekranAcikKalsin() {
    if (!document.body.classList.contains('sohbet') || !('wakeLock' in navigator)) return;
    navigator.wakeLock.request('screen').then(function (k) { ekranKilidi = k; }).catch(function () {});
  }
  function sohbetModu(acik) {
    document.body.classList.toggle('sohbet', acik);
    sohbetCik.hidden = !acik;
    if (acik) ekranAcikKalsin();
    else if (ekranKilidi) { ekranKilidi.release().catch(function () {}); ekranKilidi = null; }
    ayarUygula();
  }
  // Telefon kilitlenip açılınca ekran kilidi düşer, yeniden iste
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') ekranAcikKalsin(); });
  sohbetCik.addEventListener('click', function () { sohbetModu(false); });

  // =========================================================
  // 5. Sayfalar
  // =========================================================
  function ustCiz(sol) {
    ust.innerHTML = '<div class="kap">' + sol +
      '<nav class="ust-baglanti" aria-label="Sayfalar">' +
      '<a href="#/ara">Ara</a><a href="#/lugat">Lügat</a><a href="#/tekrar">Tekrar</a></nav></div>';
  }
  function hataKutusu() {
    return hatalar.length ? '<div class="hata"><b>Ders dosyalarında düzeltilecek yerler:</b><br>' + hatalar.map(esc).join('<br>') + '</div>' : '';
  }

  // ---------- Ana sayfa ----------
  function anaSayfa() {
    document.title = 'Risale Sohbet';
    ustCiz('<a class="marka" href="#/">Risale Sohbet</a>');
    cubuk.hidden = true;
    var kartlar = R.sira.map(function (id) {
      var d = R.dersler[id];
      if (!d) return '';
      return '<a class="ders-kart" href="#/' + esc(d.id) + '"><small>' + esc(d.kitap) + '</small>' +
        '<h2>' + esc(d.baslik) + '</h2><p>' + esc(d.ozet) + '</p></a>';
    }).join('');
    var notSayisi = Object.keys(notlar).length;
    govde.innerHTML = '<div class="ana"><h1>Sohbet dersleri</h1>' +
      '<p>Her derste metin, zor kelimelerin anlamı, kısa bir açıklama ve günlük hayattan bir örnek var.</p>' +
      hataKutusu() + kartlar +
      '<section class="yedek"><h2>Notlarım</h2>' +
      '<p>' + (notSayisi ? notSayisi + ' notun var.' : 'Henüz notun yok.') + ' Notlar sadece bu telefonda durur. Telefon değiştirmeden ya da tarayıcıyı temizlemeden önce yedek al.</p>' +
      '<div class="yedek-dugmeler"><button type="button" class="dugme" id="yedek-al"' + (notSayisi ? '' : ' disabled') + '>Yedek al</button>' +
      '<label class="dugme">Yedekten yükle<input type="file" id="yedek-yukle" accept=".json,application/json" hidden></label></div>' +
      '<p class="durum" id="yedek-durum" role="status"></p></section></div>';

    document.getElementById('yedek-al').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(notlar, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'risale-notlarim.json';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
    document.getElementById('yedek-yukle').addEventListener('change', function (e) {
      var dosya = e.target.files[0];
      if (!dosya) return;
      dosya.text().then(function (t) {
        var gelen = JSON.parse(t);
        if (typeof gelen !== 'object' || Array.isArray(gelen)) throw new Error();
        Object.assign(notlar, gelen);
        yaz('risale-notlar', notlar);
        anaSayfa();
        document.getElementById('yedek-durum').textContent = Object.keys(gelen).length + ' not yüklendi.';
      }).catch(function () {
        document.getElementById('yedek-durum').textContent = 'Bu dosya okunamadı. "Yedek al" ile indirdiğin dosyayı seç.';
      });
    });
  }

  // ---------- Ders sayfası ----------
  function notAnahtari(d, bi, pi) { return d.id + ':' + bi + ':' + pi; }

  function notCiz(anahtar) {
    var n = notlar[anahtar];
    return '<div class="not' + (n ? '' : ' bos') + '" data-not="' + esc(anahtar) + '">' +
      (n ? '<span class="etiket">Notum</span><p>' + esc(n).replace(/\n/g, '<br>') + '</p>' : '') + '</div>';
  }

  function dersSayfasi(d) {
    document.title = d.baslik + ' · Risale Sohbet';
    ustCiz('<a class="geri" href="#/">‹ Dersler</a><button type="button" class="sohbet-dugme" id="sohbet-ac">Sohbet modu</button>');
    cubuk.hidden = false;
    document.getElementById('sohbet-ac').addEventListener('click', function () { sohbetModu(true); });

    var icindekiler = d.bolumler.map(function (b, i) {
      return b.alt ? '' : '<li><a href="#/' + esc(d.id) + '/' + i + '">' + esc(b.baslik) + '</a></li>';
    }).join('');

    var bolumler = d.bolumler.map(function (b, bi) {
      var yer = 'dersler/' + d.id + '.js, "' + b.baslik + '"';
      var metin = (b.metin || []).map(function (p, pi) {
        var k = notAnahtari(d, bi, pi);
        return '<div class="paragraf"><p>' + metinCiz(p, yer) + '</p>' + notCiz(k) + '</div>';
      }).join('');
      return '<section class="bolum' + (b.alt ? ' alt' : '') + '" id="b' + bi + '">' +
        '<h2>' + esc(b.baslik) + (b.sayfa ? ' <span class="sayfa">s. ' + esc(b.sayfa) + '</span>' : '') + '</h2>' +
        '<div class="metin">' + metin + '</div>' +
        (b.aciklama ? '<div class="aciklama"><span class="etiket">Açıklama</span>' + b.aciklama.map(function (p) { return '<p>' + arapca(esc(p)) + '</p>'; }).join('') + '</div>' : '') +
        (b.ornek ? '<div class="ornek"><span class="etiket">Günlük hayattan</span>' + b.ornek.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' : '') +
        '<div class="bolum-araclar">' +
          '<button type="button" class="kucuk" data-not-yaz="' + bi + '">Not yaz</button>' +
          '<button type="button" class="kucuk" data-paylas="' + bi + '">Paylaş</button>' +
        '</div>' +
        '</section>' +
        (b.sayfaSonu ? '<div class="sayfa-sonu" aria-label="Sayfa ' + esc(b.sayfaSonu) + '">' + esc(b.sayfaSonu) + '</div>' : '');
    }).join('');

    var sorular = d.sorular && d.sorular.length
      ? '<section class="sorular"><h2>Sohbet için sorular</h2><ol>' + d.sorular.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></section>'
      : '';

    govde.innerHTML = '<header class="ders-bas"><small>' + esc(d.kitap) + (d.baski ? ' · ' + esc(d.baski) : '') + '</small><h1>' + esc(d.baslik) + '</h1>' +
      '<ul class="icindekiler">' + icindekiler + '</ul></header>' + hataKutusu() + bolumler + sorular +
      '<p class="alt-not">Kelime anlamları ve açıklamalar sohbet hazırlığı içindir; asıl metin esastır.</p>';

    govde.querySelectorAll('[data-not-yaz]').forEach(function (b) {
      b.addEventListener('click', function () { notDuzenle(d, Number(b.dataset.notYaz)); });
    });
    govde.querySelectorAll('[data-paylas]').forEach(function (b) {
      b.addEventListener('click', function () { paylas(d, Number(b.dataset.paylas), b); });
    });
  }

  // Not yazma: bölümdeki her paragraf için bir kutu açılır
  function notDuzenle(d, bi) {
    var bolum = document.getElementById('b' + bi);
    bolum.querySelectorAll('.paragraf').forEach(function (p, pi) {
      var k = notAnahtari(d, bi, pi);
      var kutu = p.querySelector('.not');
      kutu.className = 'not duzenle';
      kutu.innerHTML = '<label class="etiket" for="n-' + bi + '-' + pi + '">Notum' + (d.bolumler[bi].metin.length > 1 ? ' (' + (pi + 1) + '. paragraf)' : '') + '</label>' +
        '<textarea id="n-' + bi + '-' + pi + '" rows="3" placeholder="Bu paragraf için notun">' + esc(notlar[k] || '') + '</textarea>';
    });
    var araclar = bolum.querySelector('.bolum-araclar');
    araclar.innerHTML = '<button type="button" class="kucuk ana-dugme" data-kaydet>Notu kaydet</button><button type="button" class="kucuk" data-vazgec>Vazgeç</button>';
    bolum.querySelector('textarea').focus();
    function bitir(kaydet) {
      if (kaydet) {
        bolum.querySelectorAll('.paragraf').forEach(function (p, pi) {
          var k = notAnahtari(d, bi, pi), v = p.querySelector('textarea').value.trim();
          if (v) notlar[k] = v; else delete notlar[k];
        });
        if (!yaz('risale-notlar', notlar)) alert('Not kaydedilemedi: bu tarayıcı kayıt yapmaya izin vermiyor.');
      }
      var y = window.scrollY;
      dersSayfasi(d);
      window.scrollTo(0, y);
    }
    araclar.querySelector('[data-kaydet]').addEventListener('click', function () { bitir(true); });
    araclar.querySelector('[data-vazgec]').addEventListener('click', function () { bitir(false); });
  }

  // Paylaş: telefonun paylaşım menüsü, yoksa WhatsApp
  function paylas(d, bi, dugme) {
    var b = d.bolumler[bi];
    var adres = location.href.split('#')[0] + '#/' + d.id + '/' + bi;
    var metin = d.baslik + ' · ' + b.baslik + '\n\n' + (b.metin || []).map(duzMetin).join('\n\n') +
      (b.aciklama ? '\n\nAçıklama: ' + b.aciklama.join('\n\n') : '') + '\n\n' + adres;
    if (navigator.share) {
      navigator.share({ text: metin }).catch(function () {});
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(metin), '_blank', 'noopener');
    }
    dugme.blur();
  }

  // ---------- Lügat sayfası ----------
  function lugatListesi() {
    return Object.keys(lugat).map(function (k) { return lugat[k]; }).filter(function (x) { return x.anlam; })
      .sort(function (a, b) { return a.terim.localeCompare(b.terim, 'tr'); });
  }

  function lugatSayfasi() {
    document.title = 'Lügat · Risale Sohbet';
    ustCiz('<a class="geri" href="#/">‹ Dersler</a>');
    cubuk.hidden = true;
    var liste = lugatListesi();
    govde.innerHTML = '<div class="ana"><h1>Lügat</h1><p>' + liste.length + ' kelime. Derslerdeki anlamlardan kendiliğinden oluşur.</p>' +
      '<input type="search" class="arama-kutu" id="lugat-suz" placeholder="Kelime ya da anlam yaz" aria-label="Lügatte ara">' +
      '<dl class="lugat" id="lugat-liste"></dl></div>';
    var dl = document.getElementById('lugat-liste');
    function ciz(suz) {
      var s = sade(suz || '');
      dl.innerHTML = liste.filter(function (x) { return !s || sade(x.terim + ' ' + x.anlam).indexOf(s) !== -1; }).map(function (x) {
        var yerler = x.yerler.map(function (y) {
          var dr = R.dersler[y.ders];
          return '<a href="#/' + esc(y.ders) + '/' + y.bolum + '">' + esc(dr.bolumler[y.bolum].baslik) + '</a>';
        }).join(', ');
        return '<div><dt>' + esc(x.terim) + '</dt><dd>' + esc(x.anlam) + (yerler ? '<small>' + yerler + '</small>' : '') + '</dd></div>';
      }).join('') || '<p class="bos-sonuc">Bulunamadı.</p>';
    }
    document.getElementById('lugat-suz').addEventListener('input', function (e) { ciz(e.target.value); });
    ciz('');
  }

  // ---------- Kelime tekrarı ----------
  function tekrarSayfasi() {
    document.title = 'Kelime tekrarı · Risale Sohbet';
    ustCiz('<a class="geri" href="#/">‹ Dersler</a>');
    cubuk.hidden = true;
    var deste = lugatListesi().sort(function () { return Math.random() - 0.5; });
    var toplam = deste.length, bilinen = 0;
    govde.innerHTML = '<div class="ana"><h1>Kelime tekrarı</h1><p>Kelimeyi gör, anlamını hatırlamaya çalış, sonra kartı çevir.</p><div id="tekrar"></div></div>';
    var alan = document.getElementById('tekrar');
    function kart() {
      if (!deste.length) {
        alan.innerHTML = '<div class="kart bitti"><p class="kart-terim">Bitti!</p><p>' + toplam + ' kelimenin hepsini bildin.</p>' +
          '<button type="button" class="dugme ana-dugme" id="bastan">Baştan başla</button></div>';
        document.getElementById('bastan').addEventListener('click', tekrarSayfasi);
        return;
      }
      var x = deste[0];
      alan.innerHTML = '<p class="sayac">' + bilinen + ' / ' + toplam + ' biliniyor</p>' +
        '<div class="kart"><p class="kart-terim">' + esc(x.terim) + '</p><p class="kart-anlam" hidden>' + esc(x.anlam) + '</p>' +
        '<div class="kart-dugmeler"><button type="button" class="dugme ana-dugme" id="cevir">Anlamı göster</button></div></div>';
      document.getElementById('cevir').addEventListener('click', function () {
        alan.querySelector('.kart-anlam').hidden = false;
        alan.querySelector('.kart-dugmeler').innerHTML =
          '<button type="button" class="dugme" id="tekrar-sor">Tekrar sor</button><button type="button" class="dugme ana-dugme" id="bildim">Bildim</button>';
        document.getElementById('bildim').addEventListener('click', function () { deste.shift(); bilinen++; kart(); });
        document.getElementById('tekrar-sor').addEventListener('click', function () { deste.push(deste.shift()); kart(); });
        document.getElementById('bildim').focus();
      });
    }
    kart();
  }

  // ---------- Arama ----------
  function araSayfasi() {
    document.title = 'Ara · Risale Sohbet';
    ustCiz('<a class="geri" href="#/">‹ Dersler</a>');
    cubuk.hidden = true;
    govde.innerHTML = '<div class="ana"><h1>Ara</h1><p>Bütün derslerin metninde, açıklamasında ve örneklerinde arar. Şapka ve Türkçe harf farkı önemli değil.</p>' +
      '<input type="search" class="arama-kutu" id="ara-kutu" placeholder="Örneğin: berzah" aria-label="Ara">' +
      '<div id="ara-sonuc" role="status"></div></div>';
    var kutu = document.getElementById('ara-kutu'), sonuc = document.getElementById('ara-sonuc');
    kutu.addEventListener('input', function () {
      var s = sade(kutu.value.trim());
      if (s.length < 2) { sonuc.innerHTML = ''; return; }
      var bulunan = [];
      R.sira.forEach(function (id) {
        var d = R.dersler[id];
        if (!d) return;
        d.bolumler.forEach(function (b, bi) {
          var parcalar = (b.metin || []).map(duzMetin).concat(b.aciklama || [], b.ornek || []);
          parcalar.forEach(function (p) {
            var i = sade(p).indexOf(s);
            if (i === -1) return;
            var bas = Math.max(0, i - 50), parca = p.slice(bas, i + s.length + 70);
            bulunan.push('<a class="sonuc" href="#/' + esc(id) + '/' + bi + '"><small>' + esc(d.baslik) + ' · ' + esc(b.baslik) + '</small>' +
              '<p>' + (bas ? '… ' : '') + esc(parca.slice(0, i - bas)) + '<mark>' + esc(parca.slice(i - bas, i - bas + s.length)) + '</mark>' +
              esc(parca.slice(i - bas + s.length)) + ' …</p></a>');
          });
        });
      });
      sonuc.innerHTML = bulunan.length ? '<p class="sayac">' + bulunan.length + ' yerde geçiyor</p>' + bulunan.join('') : '<p class="bos-sonuc">Bulunamadı.</p>';
    });
    kutu.focus();
  }

  // =========================================================
  // 6. Gezinme
  // =========================================================
  var acikDers = null;
  function yonlendir() {
    var p = location.hash.split('/');           // '#/ders/3' -> ['#','ders','3']
    var d = R.dersler[p[1]];
    if (!d) {
      acikDers = null;
      if (document.body.classList.contains('sohbet')) sohbetModu(false);
      if (p[1] === 'lugat') lugatSayfasi();
      else if (p[1] === 'tekrar') tekrarSayfasi();
      else if (p[1] === 'ara') araSayfasi();
      else anaSayfa();
      window.scrollTo(0, 0);
      return;
    }
    if (acikDers !== d.id) { dersSayfasi(d); acikDers = d.id; window.scrollTo(0, 0); }
    if (p[2] !== undefined) {
      var hedef = document.getElementById('b' + p[2]);
      if (hedef) hedef.scrollIntoView({ block: 'start' });
    }
  }
  window.addEventListener('hashchange', yonlendir);

  // =========================================================
  // 7. Başlat: ders dosyalarını yükle (liste.js okunduktan sonra)
  // =========================================================
  window.addEventListener('error', function (e) {
    var f = e.filename || '';
    if (f.indexOf('/dersler/') !== -1) hatalar.push(f.split('/dersler/')[1] + ', ' + e.lineno + '. satır: yazım hatası (' + e.message + '). Çoğu zaman bir önceki satırın sonunda virgül ya da tırnak eksiktir.');
  });

  document.addEventListener('DOMContentLoaded', function () {
    var dosyalar = ['lugat'].concat(R.sira);
    Promise.all(dosyalar.map(function (id) {
      return new Promise(function (bitti) {
        var s = document.createElement('script');
        s.src = 'dersler/' + id + '.js';
        s.onload = function () { if (id !== 'lugat' && !R.dersler[id]) hatalar.push('dersler/' + id + '.js içinde id, dosya adıyla aynı olmalı.'); bitti(); };
        s.onerror = function () { hatalar.push('dersler/' + id + '.js bulunamadı.'); bitti(); };
        document.head.appendChild(s);
      });
    })).then(function () {
      lugatKur();
      ayarUygula();
      yonlendir();
      // İnternetsiz çalışma: ders dosyalarını da telefona kaydet
      if ('serviceWorker' in navigator && window.isSecureContext) {
        navigator.serviceWorker.register('sw.js').then(function () { return navigator.serviceWorker.ready; }).then(function (reg) {
          if (reg.active) reg.active.postMessage({ kaydet: dosyalar.map(function (id) { return 'dersler/' + id + '.js'; }) });
        }).catch(function () {});
      }
    });
  });
})();
