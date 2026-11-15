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

## Dosyalar

```
index.html                sayfanın iskeleti
css/stil.css              görünüm ve renkler
js/risale.js              uygulama (ders eklerken dokunmana gerek yok)
dersler/                  İÇERİK: senin çalışacağın yer
  liste.js                ana sayfadaki derslerin sırası
  birinci-mektup-1.js     Birinci Mektup, hayatın beş tabakası
fonts/                    yazı tipleri ve lisansları
```

## Yeni ders eklemek

1. `dersler/birinci-mektup-1.js` dosyasını kopyala, yeni bir ad ver (örneğin `ikinci-mektup.js`). İçindeki `id` dosya adıyla aynı olsun.
2. Metni, açıklamaları ve örnekleri değiştir. Zor kelimenin anlamını kelimenin hemen arkasına çift parantezle yaz: `merâtib‑i hayat ((hayatın mertebeleri))`
3. `dersler/liste.js` dosyasına yeni dersin adını ekle.

Kelime anlamları ve açıklamalar sohbet hazırlığı içindir; okumadan önce bilen birine göstermek iyi olur.
