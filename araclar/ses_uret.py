#!/usr/bin/env python3
"""
Bir dersin sesli anlatımını üretir (Piper, Türkçe, internetsiz çalışır).

Her ders için iki kayıt çıkar:
  ses/<ders>-tam.mp3    bölüm başlığı, metin, açıklama, günlük örnek
  ses/<ders>-ozet.mp3   bölüm başlığı, açıklama, günlük örnek (asıl metin okunmaz)
ve bir zaman çizelgesi: ses/<ders>.json. Sonra ses/liste.js bütün json'lardan yeniden yazılır;
site oynatıcıyı bu listeden kurar.

Okuma kuralları:
  - Arapça yazılar OKUNMAZ (yapay ses Arapçayı, özellikle âyet ve hadisi, hatalı okur).
    Arapçanın hemen ardından gelen ((Türkçe anlam)) okunur.
  - Metindeki kelime anlamları "kelime, yani anlamı," diye okunur.
  - Şapkalı harfler (â, î, û) sade okunur.

Kurulum (bir kez):
  pip install piper-tts numpy        # ffmpeg ve node da kurulu olmalı
  Türkçe ses modeli: tr_TR-dfki-medium, tr_TR-fettah-medium ya da tr_TR-fahrettin-medium
  (.onnx ve .onnx.json dosyaları yan yana durmalı).
  Modeller: https://huggingface.co/rhasspy/piper-voices (tr/tr_TR/...) ya da
  https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models (vits-piper-tr_TR-*.tar.bz2)

Kullanım:
  python3 araclar/ses_uret.py --model yol/tr_TR-dfki-medium.onnx --ders yirmi-altinci-mektup-4-1
  python3 araclar/ses_uret.py --ders yirmi-altinci-mektup-4-1 --metni-goster     # sadece okunacak metni göster
"""
import argparse
import glob
import json
import os
import re
import subprocess
import sys
import tempfile
import wave

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

AR = '؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿'


# ---------------------------------------------------------------
# Ders dosyasını oku (JS veri dosyası; node ile açılır)
# ---------------------------------------------------------------
def ders_oku(ders_id):
    dosya = os.path.join(KOK, 'dersler', ders_id + '.js')
    if not os.path.exists(dosya):
        sys.exit('Ders dosyası yok: ' + dosya)
    js = ("const fs=require('fs');let D;global.RISALE={dersEkle(d){D=d}};"
          "eval(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(JSON.stringify(D));")
    return json.loads(subprocess.check_output(['node', '-e', js, dosya]))


# ---------------------------------------------------------------
# Yazıdan konuşma metnine
# ---------------------------------------------------------------
DEGISTIR = [
    ('â', 'a'), ('Â', 'A'), ('î', 'i'), ('Î', 'İ'), ('û', 'u'), ('Û', 'U'), ('à', 'a'), ('À', 'A'),
    ('‑', '-'), ('‐', '-'), ('–', ', '), ('—', ', '), ('…', '.'),
    ('“', ''), ('”', ''), ('‘', ''), ('’', ''), ('"', ''), ('«', ''), ('»', ''),
    ('(', ', '), (')', ', '),
]


def konus(t):
    """Bir paragrafı okunacak düz metne çevirir."""
    cikti, son = '', 0
    for m in re.finditer(r'\(\((.*?)\)\)', t):
        onceki = t[son:m.start()]
        cikti += onceki
        anlam = m.group(1).strip()
        if anlam:
            arapca_sonrasi = re.search('[' + AR + r']\s*$', onceki) is not None
            cikti += (' ' + anlam + ' ') if arapca_sonrasi else (', yani ' + anlam + ', ')
        son = m.end()
    cikti += t[son:]
    cikti = re.sub('[' + AR + '][\\s' + AR + ']*', ' ', cikti)          # Arapça bloklar
    cikti = cikti.replace('Hz.', 'Hazreti')
    for a, b in DEGISTIR:
        cikti = cikti.replace(a, b)
    cikti = re.sub(r'\s+', ' ', cikti)
    cikti = re.sub(r'\s+([,.:;?!])', r'\1', cikti)
    cikti = re.sub(r'([,.:;?!])(?:\s*,)+', r'\1', cikti)                 # ".," ",," gibi artıklar
    cikti = re.sub(r',\s*([:;.?!])', r'\1', cikti)                       # ",:" gibi artıklar
    cikti = re.sub(r'^[\s,:;.]+', '', cikti).strip()
    if cikti and cikti[-1] not in '.?!':
        cikti = cikti.rstrip(',:;') + '.'
    return cikti if re.search(r'[A-Za-zÇĞİÖŞÜçğıöşü]', cikti) else ''


ETIKET = {'metin': 'Metin.', 'aciklama': 'Açıklama.', 'ornek': 'Günlük hayattan örnek.'}


def senaryo(d, kip):
    """[(bolum, tur, [okunacak paragraflar])] sırasıyla. İlk eleman dersin adıdır (bolum=-1)."""
    turler = ['metin', 'aciklama', 'ornek'] if kip == 'tam' else ['aciklama', 'ornek']
    liste = [(-1, 'baslik', [konus(d['baslik'])])]
    for bi, b in enumerate(d['bolumler']):
        ilk = True
        for tur in turler:
            paras = [konus(p) for p in (b.get(tur) or [])]
            paras = [p for p in paras if p]
            if not paras:
                continue
            on = []
            if ilk:
                on.append(konus(b['baslik']))
                ilk = False
            on.append(ETIKET[tur])
            liste.append((bi, tur, on + paras))
    return liste


# ---------------------------------------------------------------
# Seslendirme
# ---------------------------------------------------------------
def sessiz(np, sn, sr):
    return np.zeros(int(sn * sr), dtype=np.int16)


def sentez(np, ses, SynthesisConfig, metin, sr, hiz):
    parca = []
    for c in ses.synthesize(metin, syn_config=SynthesisConfig(length_scale=hiz)):
        parca.append(c.audio_int16_array)
        parca.append(sessiz(np, 0.2, sr))
    return np.concatenate(parca) if parca else sessiz(np, 0.1, sr)


def kip_uret(d, kip, ses, hiz, hedef):
    import numpy as np
    from piper import SynthesisConfig
    sr = ses.config.sample_rate
    parcalar, kisimlar, toplam = [], [], 0
    for bi, tur, paras in senaryo(d, kip):
        kisimlar.append({'b': bi, 'p': tur, 'bas': round(toplam / sr, 2)})
        for i, p in enumerate(paras):
            a = sentez(np, ses, SynthesisConfig, p, sr, hiz)
            parcalar.append(a); toplam += len(a)
            # etiketten ve başlıktan sonra kısa, paragraflar arası daha uzun sessizlik
            bos = sessiz(np, 0.35 if (i < len(paras) - 1 and len(p) < 60) else 0.6, sr)
            parcalar.append(bos); toplam += len(bos)
        bos = sessiz(np, 0.7, sr)
        parcalar.append(bos); toplam += len(bos)
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, 'k.wav')
        with wave.open(wav, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
            w.writeframes(np.concatenate(parcalar).astype('<i2').tobytes())
        subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav,
                               '-af', 'loudnorm=I=-18:TP=-3:LRA=9,alimiter=limit=0.89', '-ac', '1', '-ar', '22050',
                               '-c:a', 'libmp3lame', '-b:a', '40k', hedef])
    return {'dosya': 'ses/' + os.path.basename(hedef), 'sure': round(toplam / sr, 1), 'kisimlar': kisimlar}


def liste_yaz():
    veri = {}
    for j in sorted(glob.glob(os.path.join(KOK, 'ses', '*.json'))):
        veri[os.path.basename(j)[:-5]] = json.load(open(j, encoding='utf-8'))
    with open(os.path.join(KOK, 'ses', 'liste.js'), 'w', encoding='utf-8') as f:
        f.write('/* Bu dosyayı araclar/ses_uret.py yazar; elle değiştirme. */\n')
        f.write('RISALE.sesEkle(' + json.dumps(veri, ensure_ascii=False, separators=(',', ':')) + ');\n')


def main():
    ap = argparse.ArgumentParser(description='Dersin sesli anlatımını üretir.')
    ap.add_argument('--ders', required=True, help='dersler/ klasöründeki ders kimliği')
    ap.add_argument('--model', help='Piper .onnx dosyası (yanında .onnx.json olmalı)')
    ap.add_argument('--hiz', type=float, default=1.0, help='1.0 normal, 1.1 biraz yavaş, 0.9 biraz hızlı')
    ap.add_argument('--metni-goster', action='store_true', help='seslendirmeden, okunacak metni yazdır')
    a = ap.parse_args()

    d = ders_oku(a.ders)
    if a.metni_goster:
        for bi, tur, paras in senaryo(d, 'tam'):
            print('--- [%s] %s' % (bi, tur))
            for p in paras:
                print(p)
        return
    if not a.model:
        sys.exit('--model gerekli (Piper .onnx dosyası).')
    from piper import PiperVoice
    ses = PiperVoice.load(a.model, config_path=a.model + '.json')
    ses_adi = os.path.basename(a.model).replace('.onnx', '')
    os.makedirs(os.path.join(KOK, 'ses'), exist_ok=True)
    sonuc = {'ses': ses_adi, 'kipler': {}}
    for kip in ('tam', 'ozet'):
        hedef = os.path.join(KOK, 'ses', '%s-%s.mp3' % (a.ders, kip))
        sonuc['kipler'][kip] = kip_uret(d, kip, ses, a.hiz, hedef)
        print('%s: %.1f dk, %.1f MB' % (kip, sonuc['kipler'][kip]['sure'] / 60, os.path.getsize(hedef) / 1048576))
    with open(os.path.join(KOK, 'ses', a.ders + '.json'), 'w', encoding='utf-8') as f:
        json.dump(sonuc, f, ensure_ascii=False, separators=(',', ':'))
    liste_yaz()


if __name__ == '__main__':
    main()
