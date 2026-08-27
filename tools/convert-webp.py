#!/usr/bin/env python3
"""Converte as fotos dos palestrantes para WebP otimizado.

Uso:
  1. Coloque as fotos originais (jpg/png) em assets/src/palestrantes/
     com o nome do slug do palestrante (ex.: fernanda-dornelles.jpg).
  2. Rode: python3 tools/convert-webp.py
  Saída: assets/img/palestrantes/<slug>.webp (626×1102, proporção do card 313×551, ~60-90 KB)
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps

SRC = Path('assets/src/palestrantes')
OUT = Path('assets/img/palestrantes')
W, H = 626, 1102  # 2x do card 313×551 (nítido em telas retina)

OUT.mkdir(parents=True, exist_ok=True)
files = sorted(p for p in SRC.iterdir() if p.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp'))
if not files:
    sys.exit(f'Nenhuma imagem em {SRC}/')
for p in files:
    im = Image.open(p)
    im = ImageOps.exif_transpose(im).convert('RGB')
    im = ImageOps.fit(im, (W, H), Image.LANCZOS, centering=(0.5, 0.25))  # foco no rosto (topo)
    out = OUT / f'{p.stem}.webp'
    im.save(out, 'WEBP', quality=82, method=6)
    print(f'{p.name} -> {out} ({out.stat().st_size // 1024} KB)')
