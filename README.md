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

## Dosyalar

```
index.html                sayfanın iskeleti
css/stil.css              görünüm ve renkler
js/risale.js              uygulama (ders eklerken dokunmana gerek yok)
dersler/                  İÇERİK: senin çalışacağın yer
  liste.js                ana sayfadaki derslerin sırası
  lugat.js                derslerde geçmeyen ek kelimeler
  birinci-mektup-1.js     Birinci Mektup, Birinci Suâl: hayatın beş tabakası
  birinci-mektup-2.js     Birinci Mektup, İkinci Suâl: ölüm nasıl nimet olur?
  yirmi-altinci-mektup-3-5.js  Yirmi Altıncı Mektup, Üçüncü Mebhas, Beşinci Mesele: körü körüne taklit
fonts/                    yazı tipleri ve lisansları
ikon/                     telefona kurulunca görünen simge
sw.js, manifest.webmanifest  internetsiz çalışma ve kurulum
```

## Yeni ders eklemek

1. `dersler/birinci-mektup-1.js` dosyasını kopyala, yeni bir ad ver (örneğin `ikinci-mektup.js`). İçindeki `id` dosya adıyla aynı olsun.
2. Metni, açıklamaları ve örnekleri değiştir. Zor kelimenin anlamını kelimenin hemen arkasına çift parantezle yaz: `merâtib‑i hayat ((hayatın mertebeleri))`
   Anlamı daha önce bir derste yazılmış kelimede boş parantez yeter: `tenvir (())`. Anlam lügatten gelir; hiçbir derste olmayan kelimeleri `dersler/lugat.js` dosyasına yaz.
3. `dersler/liste.js` dosyasına yeni dersin adını ekle.

Kelime anlamları ve açıklamalar sohbet hazırlığı içindir; okumadan önce bilen birine göstermek iyi olur.
