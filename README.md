# Risale Sohbet

Sohbet hazırlığı için telefonda okunacak dersler: metin, zor kelimelerin anlamı, kısa açıklama ve günlük hayattan örnek.

**Canlı adres:** https://tecviddedektif.github.io/Risale-Sohbet/

## Renkler

| Ne | Renk |
| --- | --- |
| Risale metni | siyah |
| Kelime anlamları (metnin içinde, parantezde) | mavi |
| Açıklama | kırmızı |
| Günlük hayattan örnek | yeşil kutu |

Alttaki çubukla anlamlar, açıklamalar ve örnekler ayrı ayrı açılıp kapatılır, yazı büyütülüp küçültülür. Ayarlar telefonda hatırlanır.

## Özellikler

| Özellik | Nerede |
| --- | --- |
| Sohbet modu: sadece metin, büyük yazı, ekran kararmaz | Ders sayfasında üstte "Sohbet modu" |
| Kendi notların (sadece bu telefonda) | Her bölümün altında "Not yaz"; yedek ana sayfada |
| Paylaş (WhatsApp vb.) | Her bölümün altında "Paylaş" |
| Lügat: derslerdeki bütün anlamlar | Üstte "Lügat" |
| Kelime tekrarı | Üstte "Tekrar" |
| Arama (şapka ve Türkçe harf farkı önemsiz) | Üstte "Ara" |
| Sayfa numarası (eRisale'deki gibi) | Kitapta yeni sayfa hangi bölümle başlıyorsa, ders dosyasında o bölüme `sayfa: 26,` yaz |
| Telefona kurma ve internetsiz açılma | Tarayıcı menüsünde "Ana ekrana ekle" |
| Pekiştir: her bölümün altında boşluk doldurma, soru, eşleştirme, "kapat ve anlat" | Bölümün altında "Pekiştir" kutusu |
| Pekiştirme oturumu: dersin bütün etkinlikleri arka arkaya, sonunda sonuç ve takıldığın yerler | Ders başında "Pekiştir" düğmesi |
| Kart modu: bölüm başına tek mesaj, ipucu kelimeleri ve örnek; kaydırarak ilerler, "Prova" ile mesaj gizlenir | Ders başında "Kart modu" |
| Şekiller: bölümün altında küçük çizimler | Bölümün açıklamasından sonra |
| Kalıcı kelime tekrarı: bilmediğin kelime sık, bildiğin seyrek gelir (1, 3, 7, 14, 30 gün) | Üstte "Tekrar" |
| Çalışma ilerlemesi ve günlük seri | Ana sayfa (ders kartlarında çubuk, üstte "Bugün N kelime sırada") |
| Yazıyı takip: dinlerken okunan kelime sayfada işaretlenir, ekran onunla kayar. Elle kaydırırsan takip 5 saniye bekler ve kendiliğinden geri döner ("Takibe dön" düğmesi hemen döndürür); "Takip" düğmesiyle kapatılır | Oynatıcıda "Takip" düğmesi |
| Günün kelimesi: her gün herkese aynı Risale kelimesi, 6 hakta bulunur; seri ve istatistik; sonuç cevabı ele vermeden renkli karelerle gruba gönderilir | Üstte "Oyun", ana sayfadaki kutu |
| Çengel bulmaca: her dersin lügatinden kendiliğinden kurulur (derse göre 1–3 bulmaca), ipucu kelimenin anlamı; harf aç, kelimeyi aç, dersteki cümle; süre ve sonuç gruba gönderilir | Ders başında "Bulmaca", üstte "Oyun" |
| Dinle: dersi sesli dinle; ekran kilitliyken de çalar, kilit ekranından durdurulur. Tam ve Özet kayıt, bölüme atlama, hız, uyku zamanlayıcısı, kaldığın yerden devam | Ders başında "Dinle" (sesi olan derslerde) |

## Dosyalar

```
index.html                sayfanın iskeleti
css/stil.css              görünüm ve renkler
js/risale.js              uygulama (ders eklerken dokunmana gerek yok)
js/pekistir.js            pekiştirme etkinlikleri, kart modu, kelime tekrarı (dokunmana gerek yok)
js/sekiller.js            şekil çizici (dokunmana gerek yok)
js/ses.js                 sesli dinleme oynatıcısı (dokunmana gerek yok)
js/oyunlar.js             Günün kelimesi ve Çengel bulmaca (dokunmana gerek yok)
oyun/kelimeler.js         Günün kelimesi listesi (yeni kelimeyi hep en sona ekle)
dersler/                  İÇERİK: senin çalışacağın yer
  liste.js                ana sayfadaki derslerin sırası
  lugat.js                derslerde geçmeyen ek kelimeler
  birinci-mektup-1.js     Birinci Mektup, Birinci Suâl: hayatın beş tabakası
  birinci-mektup-2.js     Birinci Mektup, İkinci Suâl: ölüm nasıl nimet olur?
  yirmi-altinci-mektup-3-5.js  Yirmi Altıncı Mektup, Üçüncü Mebhas, Beşinci Mesele: körü körüne taklit
  yirmi-altinci-mektup-3-6.js  Yirmi Altıncı Mektup, Üçüncü Mebhas, Altıncı Mesele: menfî milliyete iki cevap
  yirmi-altinci-mektup-3-7.js  Yirmi Altıncı Mektup, Üçüncü Mebhas, Yedinci Mesele: gerçek hamiyet şefkattir
  yirmi-altinci-mektup-4-1.js  Yirmi Altıncı Mektup, Dördüncü Mebhas, Birinci Mesele: âlemlerin Rabbi ve nefsin ayıbı
ses/                      sesli anlatımlar (mp3) ve liste.js; araclar/ses_uret.py yazar, elle değiştirme
araclar/ses_uret.py       bir dersin sesli anlatımını üretir (bilgisayarda çalıştırılır, siteye girmez)
fonts/                    yazı tipleri ve lisansları
ikon/                     telefona kurulunca görünen simge
sw.js, manifest.webmanifest  internetsiz çalışma ve kurulum
```

## Yeni ders eklemek

1. `dersler/birinci-mektup-1.js` dosyasını kopyala, yeni bir ad ver (örneğin `ikinci-mektup.js`). İçindeki `id` dosya adıyla aynı olsun.
2. Metni, açıklamaları ve örnekleri değiştir. Zor kelimenin anlamını kelimenin hemen arkasına çift parantezle yaz: `merâtib‑i hayat ((hayatın mertebeleri))`
   Anlamı daha önce bir derste yazılmış kelimede boş parantez yeter: `tenvir (())`. Anlam lügatten gelir; hiçbir derste olmayan kelimeleri `dersler/lugat.js` dosyasına yaz.
   Anlamı sayfada göstermek ve sesli okumada okutmak istemezsen başına `~` koy: `kayıtlarla ((~sınırlarla))`, `tenvir ((~))`. Kelime lügatte ve kelime kartlarında yine çıkar. Derslerde anlamlar sadece gerçekten zor kelimelerde ve dersteki ilk geçişte görünür; diğerleri böyle gizlidir. Birini göstermek için `~` işaretini sil.
3. `dersler/liste.js` dosyasına yeni dersin adını ekle.
4. İstersen derse bir sohbet planı ekle (`plan`): bir açılış sorusu, iki üç ana nokta (her birinde tek cümlelik mesaj, kısa bir hikâye ve metindeki bölümün numarası) ve bir kapanış. Plan, ders sayfasının başında açılıp kapanan bir kutuda görünür. Örnek: `dersler/yirmi-altinci-mektup-4-1.js`.

## Pekiştirme ve şekil eklemek (isteğe bağlı)

Pekiştirme ve şekiller derse sonradan eklenebilir; olmayan derste hiçbir şey görünmez, ders eskisi gibi çalışır. Dolu bir örnek: `dersler/yirmi-altinci-mektup-4-1.js`.

Her bölüme (metin, aciklama, ornek yanına) şunlar yazılır:

```js
sekil: { tur: 'merkez', baslik: '...', merkez: 'Bir âyet', dallar: ['A', 'B', 'C'] },
pekistir: {
  mesaj: 'Üstad ne diyor: tek, kısa mesaj (kart modunda büyük görünür)',
  anahtar: ['ipucu kelime', 'ipucu kelime'],
  kisa: 'Sohbette söyleyeceğin tek cümlelik günlük örnek',
  bosluk: [{ cumle: 'Cümle {{doğru kelime}} cümle', yanlis: ['yanlış 1', 'yanlış 2'], not: 'isteğe bağlı açıklama' }],
  soru: [{ s: 'Soru?', sec: ['a', 'b', 'c'], dogru: 0, not: 'neden doğru' }],   // dogru: 0'dan sayılır
  esles: { baslik: '...', ciftler: [['sol', 'sağ'], ['sol', 'sağ']] },
},
```

Şekil türleri ve yazımları `js/sekiller.js` dosyasının başında: `merkez`, `halka`, `akis`, `ikiyan`, `basamak`. Şekil, "Açıklama" düğmesiyle birlikte gizlenir; sohbet modunda görünmez.

Dersin bütününe ait etkinlikler (örneğin günlük örnekleri fikirlerle eşleştirme, dersin akışını sıralama) `bolumler` listesinden önce yazılır:

```js
pekistir: {
  esles: { baslik: '...', ciftler: [['örnek', 'fikir'], ...] },
  zincir: { baslik: '...', adimlar: ['1. adım', '2. adım', ...] },   // doğru sırada yaz, site karıştırır
},
```

İlerleme, kelime kutuları ve günlük seri sadece o telefonda saklanır (tarayıcı verisi silinirse gider).

Kelime anlamları ve açıklamalar sohbet hazırlığı içindir; okumadan önce bilen birine göstermek iyi olur.

## Oyunlar

- **Çengel bulmaca** için bir şey yapman gerekmez: yeni dersin lügatindeki tek kelimelik terimlerden kendiliğinden kurulur. Herkeste aynı bulmaca çıkar, böylece sonuçlar karşılaştırılabilir. Dersin anlamları değişirse bulmaca da değişir; o dersin yarım kalan bulmacası sıfırlanır.
- **Günün kelimesi** `oyun/kelimeler.js` listesinden sırayla gelir (1. gün: 22 Kasım 2026). Kelime 5, 6 ya da 7 harf olmalı (şapkalar sayılmaz). Yeni kelimeyi **hep en sona** ekle; araya eklersen sonraki günlerin kelimesi kayar.
- Sonuçlar ve seriler sadece o telefonda durur. Ortak puan tablosu yok (sitenin sunucusu yok); sonuç "Gruba gönder" ile paylaşılır.

## Sesli dinleme eklemek (isteğe bağlı)

Sesi olmayan derste "Dinle" düğmesi görünmez; ders eskisi gibi çalışır. Ses, ders metninden **yapay Türkçe sesle** (Piper, `fahrettin`) üretilir ve `ses/` klasörüne mp3 olarak konur. Her ders için iki kayıt çıkar:

- **Tam**: bölüm başlığı, metin, açıklama, günlük örnek (yaklaşık 15 dakika)
- **Özet**: sadece açıklama ve günlük örnek (yaklaşık 8 dakika)

Üretmek için (bilgisayarda, bir kez kurulum):

```
pip install piper-tts numpy onnx             # ffmpeg ve node da kurulu olmalı
python3 araclar/ses_uret.py --model yol/tr_TR-fahrettin-medium.onnx --ders yirmi-altinci-mektup-4-1
```

Kullanılan ses `tr_TR-fahrettin-medium` (veri seti CC0, yani serbest). Ses modeli (`.onnx` ve `.onnx.json` yan yana) için kaynaklar `araclar/ses_uret.py` başında yazılı. Okunacak metni önceden görmek için: `--metni-goster`.

Bilmen gerekenler:

- Kelime kelime takip için her kelimenin başlangıç zamanı ses modelinden alınır (`onnx` kuruluysa kesin, yoksa tahmin). Zamanlar `ses/<ders>.json` içinde durur; ders açılınca oynatıcı onları okur.
- Sayfadaki kelimeler seslendirilen kelimelerle sırayla eşleştirilir. Arapça ve okunmayan anlamlar (ders dosyasında boş `(())` olup anlamı lügattan gelenler) işaretlenmez; `((~…))` ile gizlenen anlamlar ne görünür ne okunur, işaret bir sonraki okunan kelimeye geçer. Çok eski telefonlarda (kelime işaretini desteklemeyen tarayıcılar) sadece okunan paragraf işaretlenir.
- Yapay ses **Arapça okumaz**; âyet ve hadis metni atlanır, hemen ardından gelen Türkçe anlam okunur.
- Metindeki kelime anlamları "kelime, yani anlamı" diye okunur. Şapkalı harfler sade okunur.
- Osmanlıca kelimelerde telaffuz bazen kayar. Ders dosyasında düzeltme yapınca sesi yeniden üretmek gerekir.
- Ses internetten çalınır (internetsiz indirme yok). Her ders yaklaşık 7 MB tutar; depo büyüklüğünü akılda tut.
- Ders metni değişirse `ses_uret.py`yi aynı komutla yeniden çalıştır; kayıtlar ve zaman çizelgesi birlikte yenilenir (kayıt adresindeki `?v=` özeti de değişir, eski kayıt önbellekte kalmaz).
