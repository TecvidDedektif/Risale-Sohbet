/* ============================================================
   Şekiller: bir bölümün altına konan küçük çizimler.

   Ders dosyasında bölüme şöyle eklenir:
     sekil: { tur: 'merkez', baslik: '...', ... }

   Türler:
     merkez   bir fikir ortada, 2-4 dal etrafında
              { merkez: 'Bir âyet', dallar: ['Keşif', 'Delil', 'Meşrep'] }
     halka    iç içe halkalar (dıştan içe), ortada bir kelime
              { halkalar: ['Gökler', 'Canlılar', 'İnsan'], merkez: 'Rab' }
              Halka yazıları kısa olsun (içe doğru daha da kısa).
     akis     yukarıdan aşağıya adım adım zincir
              { adimlar: ['Önce', 'Sonra', 'En son'] }
     ikiyan   iki sütun, ortada isteğe bağlı perde
              { solBaslik: 'A', sagBaslik: 'B', satirlar: [['a1', 'b1'], ...], perde: 'Berzah' }
     basamak  yukarı çıkan basamaklar
              { basamaklar: [{ ad: 'Birinci', not: 'kısa not' }, ...] }

   Her şekilde isteğe bağlı: baslik (üstte küçük başlık), alt (altta kısa not).
   Renkler stil.css'ten gelir, koyu temada kendiliğinden uyar.
   ============================================================ */

(function () {
  var R = window.RISALE;

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  // Yazıyı en çok n karakterlik satırlara böler
  function satirla(t, n) {
    var kelimeler = String(t).split(/\s+/), satirlar = [], k = '';
    kelimeler.forEach(function (w) {
      if (k && (k + ' ' + w).length > n) { satirlar.push(k); k = w; }
      else k = k ? k + ' ' + w : w;
    });
    if (k) satirlar.push(k);
    return satirlar;
  }

  // Ortalanmış çok satırlı SVG yazısı
  function yazi(satirlar, x, y, sinif, lh) {
    var ilk = y - (satirlar.length - 1) * lh / 2;
    return satirlar.map(function (s, i) {
      return '<text class="' + sinif + '" x="' + x + '" y="' + (ilk + i * lh).toFixed(1) + '">' + esc(s) + '</text>';
    }).join('');
  }

  function svg(w, h, ic, etiket) {
    return '<svg class="sk-svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(etiket) + '" focusable="false">' + ic + '</svg>';
  }

  // ---------- merkez ----------
  function merkez(s) {
    var d = (s.dallar || []).slice(0, 4), n = d.length;
    var yerler = {
      2: [[170, 46], [170, 254]],
      3: [[170, 46], [88, 254], [252, 254]],
      4: [[88, 50], [252, 50], [88, 250], [252, 250]],
    }[n];
    if (!yerler) return '';
    var cx = 170, cy = 150, r = 46, W = 152, o = '';
    yerler.forEach(function (p) { o += '<line class="sk-cizgi" x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '"/>'; });
    o += '<circle class="sk-merkez" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>' + yazi(satirla(s.merkez || '', 10), cx, cy, 'sk-merkez-yazi', 16);
    yerler.forEach(function (p, i) {
      var sat = satirla(d[i], 17), h = sat.length * 17 + 18;
      o += '<rect class="sk-kutu" x="' + (p[0] - W / 2) + '" y="' + (p[1] - h / 2) + '" width="' + W + '" height="' + h + '" rx="10"/>' + yazi(sat, p[0], p[1], 'sk-yazi', 17);
    });
    return svg(340, 300, o, (s.baslik || '') + ': ' + (s.merkez || '') + ' → ' + d.join(', '));
  }

  // ---------- halka ----------
  function halka(s) {
    var h = (s.halkalar || []).slice(0, 4), n = h.length;
    if (!n) return '';
    var cx = 170, cy = 156, dis = 150, ic = 46, adim = (dis - ic) / n, o = '', i, r;
    for (i = 0; i < n; i++) {
      r = dis - i * adim;
      o += '<circle class="sk-halka" cx="' + cx + '" cy="' + cy + '" r="' + r.toFixed(1) + '" style="fill-opacity:' + (0.05 + 0.06 * i).toFixed(2) + '"/>';
    }
    o += '<circle class="sk-merkez" cx="' + cx + '" cy="' + cy + '" r="' + ic + '"/>' + yazi(satirla(s.merkez || '', 9), cx, cy, 'sk-merkez-yazi', 16);
    for (i = 0; i < n; i++) {
      r = dis - i * adim;
      o += yazi([h[i]], cx, cy - r + adim / 2, 'sk-yazi', 15);
    }
    return svg(340, 312, o, (s.baslik || '') + ': ' + h.join(' içinde ') + ' içinde ' + (s.merkez || ''));
  }

  // ---------- akış ----------
  function akis(s) {
    var a = s.adimlar || [];
    if (!a.length) return '';
    return '<ol class="sk-akis">' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>';
  }

  // ---------- iki yan ----------
  function ikiyan(s) {
    var o = '<div class="sk-iy"><div class="sk-iy-bas"><b>' + esc(s.solBaslik || '') + '</b><b>' + esc(s.sagBaslik || '') + '</b></div>';
    (s.satirlar || []).forEach(function (r) {
      o += '<div class="sk-iy-satir"><span>' + esc(r[0]) + '</span><span>' + esc(r[1]) + '</span></div>';
    });
    if (s.perde) o += '<div class="sk-iy-perde">' + esc(s.perde) + '</div>';
    return o + '</div>';
  }

  // ---------- basamak ----------
  function basamak(s) {
    var b = s.basamaklar || [];
    if (!b.length) return '';
    return '<ol class="sk-bas">' + b.map(function (x, i) {
      return '<li style="--h:' + (64 + i * 38) + 'px"><span class="sk-bas-ad">' + esc(x.ad) + '</span>' + (x.not ? '<small>' + esc(x.not) + '</small>' : '') + '</li>';
    }).join('') + '</ol>';
  }

  var turler = { merkez: merkez, halka: halka, akis: akis, ikiyan: ikiyan, basamak: basamak };

  R.sekil = {
    ciz: function (s) {
      var f = s && turler[s.tur];
      if (!f) return '';
      var ic = f(s);
      if (!ic) return '';
      return '<figure class="sekil sekil-' + esc(s.tur) + '">' +
        (s.baslik ? '<figcaption><span class="etiket">Şekil</span>' + esc(s.baslik) + '</figcaption>' : '') +
        ic + (s.alt ? '<p class="sk-alt">' + esc(s.alt) + '</p>' : '') + '</figure>';
    },
  };
})();
