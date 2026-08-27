/* ==========================================================================
   LP IMPACTXPERIENCE
   ========================================================================== */

// --- Configuração -----------------------------------------------------------
// >>> TROCA DE LOTE (manual, por número de vagas):
//     1 = primeiro lote vendendo (R$187)  |  2 = primeiro lote esgotado, segundo vendendo (R$397)
//     Basta trocar o número abaixo e publicar. Cards, badge do hero, CTA final e
//     rótulo da oferta mudam sozinhos.
const LOTE_ATUAL = 1;

// Opcional: vagas restantes no lote atual -> mostra "restam N vagas" na oferta. null = não mostra.
const VAGAS_RESTANTES = null;

// Opcional: se um dia houver data-limite, coloque aqui (ex.: '2026-10-14T23:59:59-03:00')
// que o countdown aparece. '' = sem countdown (só o rótulo do lote).
const LOTE_DEADLINE = '';

const CHECKOUT_LOTE1 = 'https://pay.kiwify.com.br/CLcumTX'; // R$187 à vista / 2x R$93,50
const CHECKOUT_LOTE2 = 'https://pay.kiwify.com.br/aPrPPPN'; // R$397 à vista / 2x R$198,50

const WHATSAPP_NUMERO = '5511992526671';
const WHATSAPP_MSG_SUPORTE = 'Olá! Tenho dúvidas sobre o IMPACTXPERIENCE (21 de outubro, Jlab Alphaville) e gostaria de mais informações.';
const WHATSAPP_MSG_AVISAR = 'Olá! Quero ser avisado(a) quando o 2º lote do IMPACTXPERIENCE abrir.';
const waLink = (msg) => `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`;

let loteAtual = LOTE_ATUAL;
const DESIGN_WIDTH = 1920;
const MOBILE_BREAKPOINT = 1024; // ≤ isso usa o layout mobile (reflow), sem scale
const stage = document.getElementById('stage');
const viewport = document.getElementById('viewport');
const fixo = document.getElementById('fixo');

const isMobile = () => document.documentElement.clientWidth <= MOBILE_BREAKPOINT;

// --- Escala proporcional do canvas de 1920px (só desktop) ------------------
function rescale() {
  if (isMobile()) {
    stage.style.transform = '';
    fixo.style.transform = '';
    viewport.style.height = '';
    return 1;
  }
  const scale = document.documentElement.clientWidth / DESIGN_WIDTH;
  stage.style.transform = `scale(${scale})`;
  fixo.style.transform = `scale(${scale})`;
  viewport.style.height = `${stage.offsetHeight * scale}px`;
  return scale;
}
window.addEventListener('resize', rescale);
rescale();

// --- Scroll suave para âncoras ---------------------------------------------
// "#oferta" mira o card do lote ativo e garante que o botão de checkout fique
// visível (alinha o topo do card sob o header; se o card for mais alto que a
// tela, alinha o rodapé do card). Funciona no canvas escalado e no mobile.
function scrollToActiveCard() {
  const card = document.querySelector(loteAtual === 2 ? '.plan--2' : '.plan--1');
  const header = document.getElementById('fixo').getBoundingClientRect().height;
  const r = card.getBoundingClientRect();
  const y1 = window.scrollY + r.top - header - 16;
  const y2 = window.scrollY + r.bottom + 24 - window.innerHeight;
  window.scrollTo({ top: Math.max(y1, y2), behavior: 'smooth' });
}
document.querySelectorAll('[data-scroll]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    if (el.getAttribute('href') === '#oferta') return scrollToActiveCard();
    const target = document.querySelector(el.getAttribute('href'));
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
  });
});

// --- Marquee da faixa (duplica as logos para o loop) -----------------------
const track = document.querySelector('.marquee__track');
if (track) {
  const unit = track.querySelector('img');
  for (let i = 0; i < 23; i++) track.appendChild(unit.cloneNode(true));
}

// --- Countdown (só se LOTE_DEADLINE estiver preenchido) --------------------
const pad = (n) => String(Math.max(0, n)).padStart(2, '0');
function tick() {
  const diff = new Date(LOTE_DEADLINE) - new Date();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;
  document.getElementById('cd-d').textContent = pad(d);
  document.getElementById('cd-h').textContent = pad(h);
  document.getElementById('cd-m').textContent = pad(m);
  document.getElementById('cd-s').textContent = pad(s);
}
const timerEl = document.getElementById('countdown');
if (LOTE_DEADLINE) { tick(); setInterval(tick, 1000); }
else { if (timerEl) timerEl.style.display = 'none'; document.getElementById('oferta').classList.add('no-countdown'); }

// --- FAQ (acordeão) --------------------------------------------------------
document.querySelectorAll('.faq__item').forEach((item) => {
  item.querySelector('.faq__q').addEventListener('click', () => {
    const wasOpen = item.classList.contains('is-open');
    document.querySelectorAll('.faq__item.is-open').forEach((o) => {
      o.classList.remove('is-open');
      o.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      item.classList.add('is-open');
      item.querySelector('.faq__q').setAttribute('aria-expanded', 'true');
    }
  });
});

// --- Carrossel de depoimentos (Vimeo, carregado só ao clicar) --------------
const carousel = document.getElementById('carousel');
function scrollCarousel(dir) {
  const card = carousel.querySelector('.video');
  const step = card.offsetWidth + 14.16;
  const max = carousel.scrollWidth - carousel.clientWidth;
  let next = carousel.scrollLeft + dir * step;
  if (next > max + 1) next = 0;
  if (next < -1) next = max;
  carousel.scrollTo({ left: next, behavior: 'smooth' });
}
document.getElementById('car-prev').addEventListener('click', () => scrollCarousel(-1));
document.getElementById('car-next').addEventListener('click', () => scrollCarousel(1));

function stopAllVideos() {
  carousel.querySelectorAll('.video.is-playing').forEach((v) => {
    v.querySelector('iframe')?.remove();
    v.classList.remove('is-playing');
  });
}
carousel.querySelectorAll('.video').forEach((v) => {
  v.addEventListener('click', () => {
    if (v.classList.contains('is-playing')) return;
    stopAllVideos();
    const id = v.dataset.vimeo;
    const f = document.createElement('iframe');
    f.src = `https://player.vimeo.com/video/${id}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1`;
    f.title = `Depoimento de ${v.dataset.name}`;
    f.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share';
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.setAttribute('allowfullscreen', '');
    v.appendChild(f);
    v.classList.add('is-playing');
    pixelTrack('ViewContent', { content_name: `Depoimento - ${v.dataset.name}`, content_type: 'video' });
  });
});

// --- Eventos do Meta Pixel (disparam só quando o pixel estiver ativo) ------
// Ative o pixel no <head> do index.html; nada mais precisa mudar aqui.
function pixelTrack(event, params) {
  if (typeof window.fbq === 'function') window.fbq('track', event, params || {});
}

// --- Lotes, checkout e WhatsApp --------------------------------------------
const checkout = document.getElementById('checkout');
const lote2Btn = document.getElementById('lote2-btn');
const suporte = document.getElementById('suporte');
function applyLoteState(lote) {
  loteAtual = lote || LOTE_ATUAL;
  const lote1Aberto = loteAtual === 1;
  const status = document.getElementById('lote1-status');
  const badge = document.getElementById('lote-badge');
  const ctaFinal = document.getElementById('cta-final-text');
  const label = document.querySelector('.countdown__label');
  const vagas = Number.isFinite(VAGAS_RESTANTES) ? ` — restam ${VAGAS_RESTANTES} vagas` : '';
  const oferta = document.getElementById('oferta');
  const lote2Title = document.getElementById('lote2-title');
  const lote2Status = document.getElementById('lote2-status');
  oferta.classList.toggle('lote2-active', !lote1Aberto);
  if (lote2Title) lote2Title.classList.toggle('t-red', lote1Aberto);
  if (lote2Status) lote2Status.textContent = lote1Aberto ? '' : '[Disponível agora]';
  if (lote1Aberto) {
    checkout.href = CHECKOUT_LOTE1;
    checkout.textContent = 'Quero garantir por R$187';
    checkout.classList.remove('is-disabled');
    lote2Btn.href = waLink(WHATSAPP_MSG_AVISAR);
    lote2Btn.textContent = 'Avisar quando abrir 🔒';
    lote2Btn.classList.add('plan__btn--red'); lote2Btn.classList.remove('plan__btn--gold');
    if (status) status.textContent = '[Disponível agora]';
    if (badge) badge.textContent = '1º lote por R$ 187';
    if (ctaFinal) ctaFinal.textContent = 'Garantir minha vaga por R$187';
    if (label) label.innerHTML = LOTE_DEADLINE
      ? '<strong>Primeiro Lote</strong> encerra em:'
      : `<strong>Primeiro Lote</strong> aberto${vagas || ' — vagas limitadas'}`;
  } else {
    checkout.href = '#';
    checkout.textContent = '1º lote esgotado';
    checkout.classList.add('is-disabled');
    lote2Btn.href = CHECKOUT_LOTE2;
    lote2Btn.textContent = 'Quero garantir por R$397';
    lote2Btn.classList.remove('plan__btn--red'); lote2Btn.classList.add('plan__btn--gold');
    if (status) status.textContent = '[Esgotado]';
    if (badge) badge.textContent = '2º lote por R$ 397';
    if (ctaFinal) ctaFinal.textContent = 'Garantir minha vaga por R$397';
    if (label) label.innerHTML = LOTE_DEADLINE
      ? '<strong>Segundo Lote</strong> encerra em:'
      : `<strong>Segundo Lote</strong> disponível${vagas} — 1º lote esgotado`;
  }
  [checkout, lote2Btn].forEach((a) => { a.target = '_blank'; a.rel = 'noopener'; });
}
applyLoteState();
window.__applyLoteState = applyLoteState; // para testes: __applyLoteState(2)

// CTA final passa a ir direto ao checkout do lote vigente
const ctaFinalBtn = document.querySelector('.ctafinal__btn');
if (ctaFinalBtn) ctaFinalBtn.addEventListener('click', (e) => {
  e.preventDefault(); e.stopImmediatePropagation();
  const url = loteAtual === 1 ? CHECKOUT_LOTE1 : CHECKOUT_LOTE2;
  pixelTrack('InitiateCheckout', { value: loteAtual === 1 ? 187.0 : 397.0, currency: 'BRL', content_name: loteAtual === 1 ? 'Primeiro Lote' : 'Segundo Lote' });
  window.open(url, '_blank', 'noopener');
}, true);

suporte.href = waLink(WHATSAPP_MSG_SUPORTE);
suporte.target = '_blank'; suporte.rel = 'noopener';

checkout.addEventListener('click', () =>
  pixelTrack('InitiateCheckout', { value: 187.0, currency: 'BRL', content_name: 'Primeiro Lote' }));
lote2Btn.addEventListener('click', () => loteAtual === 1
  ? pixelTrack('Lead', { content_name: 'Avisar quando abrir - Segundo Lote' })
  : pixelTrack('InitiateCheckout', { value: 397.0, currency: 'BRL', content_name: 'Segundo Lote' }));
suporte.addEventListener('click', () => pixelTrack('Contact'));

// --- Carrossel de palestrantes ---------------------------------------------
const spkViewport = document.getElementById('spk-viewport');
if (spkViewport) {
  const step = () => {
    const card = spkViewport.querySelector('.spk');
    return card ? card.offsetWidth + 11 : 324; // offsetWidth ignora o scale do canvas
  };
  const scrollSpk = (dir) => {
    const max = spkViewport.scrollWidth - spkViewport.clientWidth;
    let next = spkViewport.scrollLeft + dir * step();
    if (next > max + 1) next = 0;            // volta ao início no fim
    if (next < -1) next = max;               // vai ao fim se voltar do início
    spkViewport.scrollTo({ left: next, behavior: 'smooth' });
  };
  document.getElementById('spk-prev').addEventListener('click', () => scrollSpk(-1));
  document.getElementById('spk-next').addEventListener('click', () => scrollSpk(1));

  // autoplay suave (pausa no hover/toque; respeita reduced-motion)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let paused = false;
    ['mouseenter', 'touchstart', 'pointerdown'].forEach((ev) =>
      spkViewport.addEventListener(ev, () => { paused = true; }, { passive: true }));
    ['mouseleave', 'touchend'].forEach((ev) =>
      spkViewport.addEventListener(ev, () => { paused = false; }, { passive: true }));
    setInterval(() => { if (!paused && document.visibilityState === 'visible') scrollSpk(1); }, 4000);
  }
}
