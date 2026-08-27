# LP IMPACTXPERIENCE

Landing page estática (HTML/CSS/JS puro) construída pixel-perfect a partir do Figma
**LP-IMPACTXPERIENCE** (frame `LP` 1:41, 1920×8181).

## Rodar localmente

```bash
python3 -m http.server 8931
# abrir http://localhost:8931
```

Ou apenas abrir `index.html` no navegador (as fontes vêm de CDN — precisa de internet).

## Configuração (js/main.js)

| Constante | O que é |
|---|---|
| `LOTE_DEADLINE` | Data-limite do countdown do 1º lote (hoje: `2026-10-14T23:59:59-03:00`) |
| `CHECKOUT_URL` | Link do checkout Kiwify do botão "Quero garantir por R$187" |
| `SUPORTE_URL` | Link do botão "Falar com suporte!" (ex.: WhatsApp) |

Todos os botões "Garantir minha vaga" rolam até a seção de oferta (`#oferta`).

## Pixel / Analytics

O `<head>` do `index.html` tem dois blocos comentados e marcados:

- **Meta Pixel**: substitua `SEU_PIXEL_ID` pelo ID e descomente o bloco.
  Com o pixel ativo, os eventos disparam automaticamente (`js/main.js`):
  `PageView` (base), `InitiateCheckout` (botão R$187, com value/currency),
  `Contact` (Falar com suporte) e `Lead` (Avisar quando abrir).
- **Google tag (GA4/Ads)**: substitua `G-XXXXXXX` e descomente (opcional).

## Favicon

`assets/img/favicon-{32,180,512}.png` — o X dourado recortado do logo,
já linkado no `<head>` (inclui `apple-touch-icon`).

## Arquitetura

- **Desktop (>1024px)**: canvas fixo de **1920px** (geometria idêntica ao Figma)
  escalado proporcionalmente ao viewport via `transform: scale()` — pixel-perfect.
- **Mobile/tablet (≤1024px)**: layout próprio em coluna única (media query no fim de
  `css/styles.css`), com o mesmo HTML reordenado via flex — textos legíveis, cards
  empilhados, carrossel com swipe (scroll-snap), acordeão e countdown funcionais.
  O breakpoint é a constante `MOBILE_BREAKPOINT` em `js/main.js`.
- `assets/img` e `assets/svg`: todos os assets exportados direto do Figma.
- As faixas diagonais "IMPACTXPERIENCE" (nó 1:42 do Figma) foram recriadas em CSS
  (strip dourado rotacionado + logo como `mask-image`), pois o export excedeu o
  limite mensal do MCP no plano Starter.

## Fontes (self-hosted)

Todas as fontes estão em `assets/fonts/` (woff2, subset latin, só os pesos usados —
629 KB no total) e declaradas em `css/fonts.css`. Nada é carregado de CDN.

- **Clash Display** 400/500/600 — Fontshare (ITF Free Font License)
- **Inter, Archivo, DM Sans, Lexend, Instrument Sans** — Google Fonts (OFL)
- **PP Neue Montreal** (garantia/FAQ) é fonte comercial: o CSS usa
  `'PP Neue Montreal', 'Instrument Sans', ...` — se você tiver a licença, basta
  adicionar o `@font-face` em `css/fonts.css` que ela é usada automaticamente.

## Interações

- Countdown ao vivo até `LOTE_DEADLINE`
- FAQ acordeão (primeira pergunta aberta, como no design)
- Carrossel de depoimentos com setas (cards placeholder do design — substituir
  pelos vídeos reais quando existirem)
- Faixa marquee do hero animada
- Header fixo com blur

## Palestrantes confirmados (carrossel)

13 cards (313×551) na seção azul, acima de "Garanta sua vaga". Setas + autoplay no
desktop, swipe no mobile. Nomes e bios estão no `index.html` (`<article class="spk">`).

**Fotos**: os originais (PNG 2× exportados do Figma) ficam em `assets/src/palestrantes/`
e as versões otimizadas usadas na página em `assets/img/palestrantes/<slug>.webp`
(626×1102, 20–80 KB cada, 467 KB no total). Para trocar/adicionar uma foto: coloque o
original em `assets/src/palestrantes/<slug>.jpg|png` e rode `python3 tools/convert-webp.py`.
