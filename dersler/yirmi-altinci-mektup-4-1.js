/* ============================================================
   DERS: Yirmi Altıncı Mektup, Dördüncü Mebhas, Birinci Mesele
         (Âlemlerin Rabbi ve nefsin ayıbı)

   Yazım kuralı:
     metin     : Risale'nin kendi metni. Zor kelimenin anlamını hemen
                 arkasına (( )) içinde yaz. Örnek:  münhasır ((sınırlı))
     aciklama  : sade açıklama (her paragraf ayrı bir satır)
     ornek     : günlük hayattan örnek (her paragraf ayrı bir satır)
     plan      : sohbet planı (isteğe bağlı): açılış sorusu, ana noktalar
                 (mesaj, hikâye, bolum = metne git numarası, 0'dan sayılır), kapanış
   Daha önce anlamı yazılmış kelimede (()) yazman yeter,
   anlam lügatten kendiliğinden gelir. Örnek:  hakîki (())
   Sayfa numarası (eRisale'deki gibi): kitapta yeni sayfa hangi bölümle başlıyorsa
   o bölüme  sayfa: 460,  yaz. Numara bölümün üstünde kesik çizgiyle görünür.
   ============================================================ */

RISALE.dersEkle({
  id: 'yirmi-altinci-mektup-4-1',    // dosya adıyla aynı olmalı
  kitap: 'Mektûbât',
  baski: 'sayfalar eRisale’ye göre',
  baslik: 'Dördüncü Mebhas: Âlemlerin Rabbi ve Nefsin Ayıbı',
  ozet: 'Yirmi Altıncı Mektup, Birinci Mesele: “on sekiz bin âlem” ne demek? Kusurunu görmek neden bahtiyarlıktır?',

  // Sohbet planı: ders sayfasının başında görünür. Sohbette telefondan tek bakış için.
  plan: {
    acilis: 'Kusurunu görmek insanı üzmeli mi, sevindirmeli mi?',
    noktalar: [
      { mesaj: 'Herkes Kur’an’ı kendi kabı kadar anlar; Üstad bile “bilmiyorum” der.', hikaye: 'Bahar yağmuru: gül koku yapar, domates meyve.', bolum: 1 },
      { mesaj: 'Sen de küçük bir âlemsin; Rabbin seni unutmaz.', hikaye: 'Uyurken atan kalp, karın altında bekleyen tohum.', bolum: 3 },
      { mesaj: 'Kusurunu gören bahtiyardır; içteki eski çekiş, mücadelenin sürdüğünü gösterir.', hikaye: 'Sigarayı bırakan amcanın eli çaydan sonra hâlâ cebine gider.', bolum: 4 },
    ],
    kapanis: 'Bu hafta her akşam bir dakika: “Bugün kimseyi kırdım mı?”',
  },

  bolumler: [
    {
      baslik: 'Bir talebenin soruları',
      metin: [
        'Dördüncü Mebhas ((bahis, konu bölümü))',
        'Tenbih ((uyarı, dikkat çekme)): Yirmialtıncı Mektûb’un Dört Mebhası, birbiri ile münâsebettar ((ilgili, bağlantılı)) olmadığı gibi, bu Dördüncü Mebhas’ın “On Mesâil”i ((on meselesi)) dahi birbiriyle münâsebettar (()) değildir. Onun için, münâsebeti ((bağlantıyı)) aramamalı. Nasıl gelmiş, öyle yazılmış. Mühim bir talebesine gönderdiği mektûbun bir parçasıdır. O talebenin beş altı suâllerine verilen cevaplardır.',
      ],
      aciklama: [
        'Bu bölüm bir talebenin Üstad’a sorduğu beş altı soruya verilen cevaplardır. Konular birbirine bağlı değil; “bu neden buradan buraya geçti?” diye bağlantı aramaya gerek yok.',
      ],
      ornek: [
        'Yıllar sonra köyüne dönen birini düşünün. Kahvede yaşlı bir amcanın yanına oturur ve aklına ne gelirse sorar: “Amca, bu sene zeytin nasıl? Bizim eski evin damı ne oldu? Sen o hastalıktan nasıl kurtuldun?” Amca da her birine ayrı ayrı cevap verir. Sohbette sorular birbirine bağlı değildir ama her cevabın kendi kıymeti vardır.',
        'Ya da bir anne, gurbetteki oğluna uzun bir mektup yazar: önce sağlığını sorar, sonra kardeşinin düğününü anlatır, en sonda “namazını kılıyor musun?” der. Mektup dağınık görünür ama hepsi aynı sevginin içinden çıkmıştır.',
      ],
    },
    {
      baslik: '“On sekiz bin âlem” nedir?',
      metin: [
        'Birincisi',
        'Sâniyen (()): Mektûbunda diyorsun: رَبِّ الْعَالَم۪ينَ ((âlemlerin Rabbi)) tâbir ((ifade, deyim)) ve tefsirinde ((açıklamasında)), “On sekiz bin âlem” demişler. O adedin hikmetini soruyorsun.',
        'Kardeşim, ben şimdi o adedin hikmetini bilmiyorum; fakat bu kadar derim ki: Kur\'ân‑ı Hakîm’in cümleleri, birer mânâya münhasır ((sınırlı)) değil, belki ((bilakis)) nev-i beşerin ((insanlığın)) umum ((bütün)) tabakàtına ((kesimlerine, seviyelerine)) hitap olduğu için, her tabakaya karşı birer mânâyı tazammun eden ((içine alan)) bir küllî ((genel, hepsini kapsayan)) hükmündedir. Beyân (()) olunan mânâlar, o küllî kaidenin ((kuralın)) cüz\'iyâtları ((parçaları, tek tek örnekleri)) hükmündedirler. Herbir müfessir ((Kur’an’ı açıklayan âlim)), herbir ârif ((Allah’ı tanımış veli)), o küllîden bir cüzü ((parçayı)) zikrediyor ((söylüyor)). Ya keşfine ((kalbine açılan manaya)), ya deliline, veyâhut meşrebine ((yoluna, mizacına)) istinat edip ((dayanıp)), bir mânâyı tercih ediyor. İşte bunda dahi, bir tâife ((topluluk)), o adede muvâfık ((uygun)) bir mânâ keşfetmiş.',
      ],
      aciklama: [
        'Talebe soruyor: Fâtiha’daki “âlemlerin Rabbi” için “on sekiz bin âlem” denmiş, bu sayının hikmeti ne? Üstad önce açıkça “bilmiyorum” diyor. Koca bir âlimin bunu rahatça söylemesi başlı başına bir derstir.',
        'Sonra asıl kuralı veriyor: Kur’an’ın bir cümlesi tek bir manaya kapalı değildir. Çobana da âlime de, çocuğa da ihtiyara da hitap eder. Her âlim o geniş manadan bir parçayı görüp söyler. “On sekiz bin” de böyle bir parçadır: yanlış değil, ama tamamı da değil.',
      ],
      ornek: [
        'Bahar yağmuru bir bahçeye yağar. Gül de aynı yağmuru içer, domates de, kenardaki ayrık otu da. Ama gül ondan koku yapar, domates meyve yapar, ot da kendi kadar yeşerir. Yağmur bir, alan çok. Kur’an’ın cümlesi de böyledir: herkes aynı âyeti okur, herkes kendi kabı kadar alır.',
        'Bir baba sofrada “bu nimetin kıymetini bilin” der. Beş yaşındaki çocuk “yemeği dökmeyeyim” diye anlar. On beş yaşındaki “ekmeği çöpe atmayayım” diye anlar. Annesi ise “babası bu ekmeği nasıl alnının teriyle kazandı” diye anlar. Söz bir, anlayan herkes doğru anlamıştır.',
        '“Bilmiyorum” demeye gelince: çarşıda bir esnafa bir şey sorarsınız, “bunu bilmiyorum, yanlış söylemeyeyim, şuna sorun” der. O esnafa bir daha gittiğinizde söylediği her şeye güvenirsiniz. Üstad’ın “bilmiyorum” demesi de sözünün geri kalanını sağlamlaştırıyor.',
      ],
    },
    {
      baslik: 'İki deniz misali',
      alt: true,
      sayfa: 460,
      metin: [
        'Meselâ: Ehl‑i velâyetin ((velilerin)), ehemmiyetle, virdlerinde ((her gün okudukları dualarda)) zikir ve tekrar ettikleri مَرَجَ الْبَحْرَيْنِ يَلْتَقِيَانِ ۝ بَيْنَهُمَا بَرْزَخٌ لَا يَبْغِيَانِ ((“İki denizi salıvermiştir, birbirine kavuşuyorlar. Aralarında bir perde vardır, birbirine taşmazlar.” Rahmân 19‑20)) cümlesinde; dâire‑i vücûb ((varlığı zorunlu olan Allah’a ait daire)) ile dâire‑i imkândaki ((yaratılmışlar dairesindeki)) bahr‑i Rubûbiyet ((Rabliğin denizi)) ve bahr‑i ubûdiyetten ((kulluğun denizinden)) tut, tâ dünya ve âhiret bahirlerine ((denizlerine)), tâ âlem-i gayp ((görünmeyen âlem)) ve âlem‑i şehâdet ((görünen âlem)) bahirlerine (()), tâ şark ((doğu)) ve garp ((batı)), şimâl ((kuzey)) ve cenûptaki ((güneydeki)) bahr‑i muhîtlerine ((okyanuslarına)), tâ Bahr‑i Rûm ((Rum denizi)) ve Fars bahrine ((Basra Körfezi’ne)), tâ Akdeniz ve Karadeniz ve Boğaz’ına – ki mercan denilen balık ondan çıkıyor – tâ Akdeniz ve Bahr‑i Ahmer’e ((Kızıldeniz’e)) ve Süveyş Kanalı’na, tâ tatlı ve tuzlu sular denizlerine, tâ toprak tabakası altındaki tatlı ve müteferrik ((dağınık, ayrı ayrı)) su denizleriyle, üstündeki tuzlu ve muttasıl ((birbirine bitişik)) denizlerine, tâ Nil ve Dicle ve Fırat gibi, büyük ırmaklar denilen küçük tatlı denizler ile onların karıştığı tuzlu büyük denizlerine kadar, mânâsındaki cüz\'iyâtları (()) var. Bunlar umumen ((hepsi birden)) murad ((kastedilmiş)) ve maksûd ((amaçlanmış)) olabilir ve onun hakîki (()) ve mecâzî ((benzetme yoluyla)) mânâlarıdır.',
      ],
      aciklama: [
        'Üstad kuralı bir âyetle gösteriyor: “İki denizi salıvermiştir, kavuşurlar ama aralarındaki perdeden taşmazlar.” Bu “iki deniz” en yüksekten en sadeye kadar pek çok şey olabilir: Allah’ın Rabliği ile kulun kulluğu, dünya ile âhiret, görünen âlem ile görünmeyen âlem, tatlı su ile tuzlu su, nehrin denize döküldüğü yer…',
        'Hepsi bir arada doğrudur. Kur’an’ın bir âyeti böyle kat kat manalar taşır; herkes kendi basamağından bakar.',
      ],
      ornek: [
        'Bir dağ deresinin denize döküldüğü yerde durun. Derenin tatlı, soğuk suyu ile denizin tuzlu suyu yan yana gelir; bir süre renkleri bile ayrı görünür. Kavuşurlar ama birbirini bozmazlar. Allah onların arasına görünmez bir sınır koymuştur.',
        'Bir de insanın içine bakalım: bir yanda dünya işleri, ekmek parası, ev kirası; öbür yanda namaz, dua, âhiret düşüncesi. İkisi aynı gün içinde, aynı kalpte buluşur. Akıllı insan ikisini de yaşar ama birini ötekine taşırmaz: dükkânı namazı unutturmaz, namazı da dükkânı ihmal ettirmez.',
        'Ya da bir anneyi düşünün: aynı gün hem çocuğuna kızar hem de onu bağrına basar. Öfke ile şefkat buluşur ama şefkat öfkenin taşmasına izin vermez. Âyetteki “berzah”, yani o görünmez perde, her yerde karşımıza çıkar.',
      ],
    },
    {
      baslik: 'Her âlemin doğrudan Rabbi',
      alt: true,
      metin: [
        'İşte onun gibi, اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَم۪ينَ ((“Hamd, âlemlerin Rabbi olan Allah’adır.”)) dahi, pek çok hakàikı ((hakikatleri)) câmi\'dir ((içine alır)). Ehl‑i keşf ((kalbine manalar açılan veliler)) ve hakikat, keşiflerine göre ayrı ayrı beyân (()) ederler.',
        'Ben de böyle fehmederim ((anlarım)) ki: Semâvâtta ((göklerde)) binler âlem var. Yıldızların bir kısmı her biri birer âlem olabilir. Yerde de herbir cins mahlûkat ((yaratılmışlar)), birer âlemdir. Hattâ herbir insan dahi, küçük bir âlemdir. رَبُّ الْعَالَم۪ينَ ((âlemlerin Rabbi)) tâbiri ((ifadesi)) ise; “Doğrudan doğruya her âlem, Cenâb‑ı Hakk’ın rubûbiyetiyle ((Rabliğiyle)) idare ve terbiye ((yetiştirme, olgunlaştırma)) ve tedbir ((düzenleme, işini görme)) edilir.” demektir.',
      ],
      aciklama: [
        'Üstad kendi anlayışını söylüyor: gökte binlerce âlem var; yerde her canlı türü bir âlem; her insan da küçük bir âlem. “Âlemlerin Rabbi” demek, bunların her biri doğrudan doğruya Allah tarafından idare edilir, yetiştirilir, işi görülür demektir.',
        'Mesaj şu: sayının kaç olduğundan çok önemlisi, hiçbir âlemin, hiçbir canlının, hiçbir insanın başıboş olmamasıdır. Sen de “küçük bir âlem”sin ve senin işini gören doğrudan Rabbindir.',
      ],
      ornek: [
        'Bir arı kovanını düşünün: binlerce arı, her birinin işi belli. Kimi bal toplar, kimi kovanı serinletir, kimi yavruya bakar. Bir karınca yuvası, bir ağacın dalındaki kuş yuvası, toprağın altındaki solucan… Her biri ayrı bir âlemdir ve hiçbiri unutulmamıştır. Kışın karın altındaki tohum bile baharda filizlenmek için bekletilir.',
        'Kendi bedenimize bakalım: biz uyurken kalp atar, mide yemeği öğütür, yara kendi kendine kapanır. Bunların hiçbirine biz karışmıyoruz. Küçük bir âlem olan bedenimizi bizden başkası idare ediyor.',
        'Bazen insan “kimse benimle ilgilenmiyor, unutuldum” diye düşünür. Bu ders ona şunu söyler: yıldızları idare eden, senin kalbinin atışını da şu an doğrudan idare ediyor. Sen unutulmuş biri değilsin.',
      ],
    },
    {
      baslik: 'Kusurunu görmek hayırdır',
      metin: [
        'Sâlisen (()): Resûl‑i Ekrem Aleyhissalâtü Vesselâm fermân etmiş ((buyurmuş)): اِذَا اَرَادَ اللّٰهُ بِقَوْمٍ خَيْرًا اَبْصَرَهُمْ بِعُيُوبِ اَنْفُسِهِمْ ((“Allah bir topluluğa hayır dilediğinde, onlara kendi nefislerinin kusurlarını gösterir.”))',
      ],
      aciklama: [
        'Talebe anlaşılan Üstad’a kendi nefsinden şikâyet etmiş. Üstad cevaba bu hadisle başlıyor: Allah birine hayır dilediğinde ona kendi kusurunu gösterir. Yani kusurunu görmek kötü haber değil, hayır işaretidir.',
      ],
      ornek: [
        'Bahçede domatesine bakan bir adam yaprağın altında küçük bir kurt görür. Hemen temizler, fide kurtulur. Görmeseydi bütün sıra kururdu. Kurdu görmek can sıkar ama asıl nimet odur.',
        'Bir de aynayı düşünün: sabah aynaya bakan, yüzündeki lekeyi görür ve siler. Aynaya hiç bakmayan, lekeyle bütün gün sokakta dolaşır. Allah’ın insana kusurunu göstermesi, ona ayna tutması gibidir.',
      ],
    },
    {
      baslik: 'Nefsini beğenen bahtsızdır',
      alt: true,
      sayfa: 461,
      metin: [
        'Kur\'ân‑ı Hakîm’de Hazret‑i Yûsuf Aleyhisselâm demiş: وَمَٓا اُبَرِّئُ نَفْس۪ي اِنَّ النَّفْسَ لَاَمَّارَةٌ بِالسُّٓوءِ ((“Ben nefsimi temize çıkarmam; çünkü nefis daima kötülüğü emreder.” Yûsuf 53))',
        'Evet, nefsini beğenen ve nefsine îtimat eden ((güvenen)), bedbahttır ((bahtsızdır)). Nefsinin ayıbını gören, bahtiyardır ((talihlidir)). Öyle ise, sen bahtiyarsın. Fakat bazen olur ki, nefs‑i emmâre ((kötülüğü emreden nefis)), ya levvâmeye ((yaptığı kötülükten dolayı kendini kınayan nefse)) veya mutmainneye ((Allah’a teslim olup huzura kavuşmuş nefse)) inkılâp eder ((dönüşür)); fakat silâhlarını ve cihâzâtını ((aletlerini)) âsâba ((sinirlere)) devreder. Âsap ((sinirler)) ve damarlar ise, o vazifeyi âhir ((son)) ömre kadar görür. Nefs‑i emmâre çoktan öldüğü hâlde, onun âsârı ((izleri)) yine görünür.',
      ],
      aciklama: [
        'Hz. Yûsuf gibi bir peygamber bile “ben nefsimi temize çıkarmam” diyor. Üstad’ın ölçüsü açık: nefsini beğenen bahtsızdır, nefsinin ayıbını gören bahtiyardır. Talebeye de “sen ayıbını görüyorsun, öyleyse bahtiyarsın” diyor.',
        'Sonra önemli bir sırrı açıyor: nefis terbiye olup düzelse bile, eski silahlarını sinirlere bırakır. Sinirler de o eski alışkanlığı ömür boyu hatırlatır. Yani içinde eski bir çekişi hissetmen, nefsinin hâlâ seni yönettiği anlamına gelmez.',
      ],
      ornek: [
        'Yıllar önce sigarayı bırakmış bir amca, çay içtikten sonra eli hâlâ farkında olmadan cebine gider. Sigara içmiyor, istemiyor da; ama el o hareketi unutmamış. Bu, onun hâlâ tiryaki olduğunu göstermez. Eski alışkanlığın izi sinirlerde kalmıştır.',
        'Gençliğinde çok sinirli olan, sonra kendini terbiye etmiş bir adam düşünün. Biri ona ters bir söz söylediğinde hâlâ yüzüne bir sıcaklık gelir, kalbi hızlanır. Ama artık bağırmaz, susar ve geçer. O sıcaklık eski nefsin bıraktığı izdir; susması ise nefsini yendiğinin delilidir.',
        'Kendini beğenen ise kasabadaki o kibirli usta gibidir: “Ben hata yapmam” der, kimseye danışmaz. Bir gün yaptığı duvar çöker. Mütevazı çırak ise her işte “bir daha bakayım” der; onun duvarı yıllarca ayakta durur.',
      ],
    },
    {
      baslik: 'Büyük zatların şikâyeti',
      alt: true,
      metin: [
        'Çok büyük asfiyâ ((kalbi tertemiz olan büyük zatlar)) ve evliyâ ((veliler)) var ki, nüfûsları ((nefisleri)) mutmainne ((huzura kavuşmuş)) iken, nefs‑i emmâreden ((kötülüğü emreden nefisten)) şekvâ ((şikâyet)) etmişler. Kalpleri gayet selîm ((sağlam, temiz)) ve münevver ((nurlu)) iken, emrâz-ı kalpten ((kalp hastalıklarından)) vâveylâ ((feryat)) etmişler. İşte bu zâtlardaki, nefs‑i emmâre (()) değil, belki ((bilakis)) âsâba (()) devredilen nefs‑i emmârenin ((kötülüğü emreden nefsin)) vazifesidir.',
        'Maraz ((hastalık)) ise, kalbî değil, belki maraz‑ı hayâlîdir ((hayalî hastalıktır, gerçekte yoktur)). İnşâallâh azîz ((değerli)) kardeşim, size hücum eden ((saldıran)) nefsiniz ve emrâz‑ı kalbiniz ((kalp hastalıklarınız)) değil, belki mücâhedenin ((nefisle mücadelenin)) devamı için beşeriyet ((insanlık)) itibariyle âsâba (()) intikal eden ((geçen)) ve terakkiyât‑ı dâimîye ((sürekli ilerlemeye)) sebebiyet veren dediğimiz gibi bir hâlettir ((hâldir)).',
      ],
      aciklama: [
        'Nice büyük veli, nefsi huzura kavuşmuşken yine “nefsim beni bırakmıyor, kalbim hasta” diye ağlamış. Üstad diyor ki: onlarda gördüğün nefis değil, sinirlere geçmiş eski nefsin izidir; hastalık da gerçek değil, hayalîdir.',
        'Talebeyi de böyle teselli ediyor: “Sana saldıran nefsin değil. Bu, mücadelen bitmesin ve hep ilerleyesin diye insan olmanın gereği olarak sinirlerine geçmiş bir hâldir.” Yani bu iç çekiş, insanı tembelleşmekten korur.',
        'Dikkat edilecek nokta: bu ders “benim sinirim böyle” deyip hataya bahane bulmak için değil, kendi kusurunu gören ve bundan üzülen insanı ümitsizlikten kurtarmak içindir.',
      ],
      ornek: [
        'Tarladaki çiftçi her bahar yabani otları yolar. Bir yıl yolar, ertesi yıl yine çıkar. Bu, tarlasının kötü olduğunu göstermez; toprak canlı olduğu için ot da biter. Çiftçi de bu sayede tarlasının başından ayrılmaz. Ot bitmeseydi belki tarlayı unutup giderdi.',
        'Kuyunun başındaki ip de böyledir: her gün kova inip çıktıkça taşı aşındırır. Su çeken el yorulur ama kuyunun suyu tatlı kalır. İnsanın iç mücadelesi de bitmez; bitmediği için kalbin suyu tazelenir.',
        'Bir nine her gece yatmadan “Ya Rabbi, bugün de kimseyi kırdım mı?” diye düşünür, gözü yaşarır. Torunu “nine, sen kimseyi kırmazsın ki” der. Ama nine o kaygıyı taşıdığı için kimseyi kırmaz. Büyük zatların şikâyeti de böyledir: kusursuz oldukları için değil, kusurdan korktukları için temizdirler.',
      ],
    },
  ],

  sorular: [
    'Kur’an’dan bir âyetin farklı yaşlarda bize farklı manalar verdiğini yaşadınız mı? Hangi âyet, ne zaman?',
    '“Her insan küçük bir âlemdir ve doğrudan Rabbi tarafından idare edilir.” Bu düşünce, zor bir günümüzde bize nasıl teselli olabilir?',
    'Bıraktığımız kötü bir alışkanlığın izi hâlâ içimizde kıpırdıyorsa, bunu nasıl anlamalıyız? Ümitsizliğe düşmeden mücadeleye nasıl devam ederiz?',
  ],
});
