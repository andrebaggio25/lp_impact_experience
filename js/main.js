/* ==========================================================================
   LP IMPACTXPERIENCE
   ========================================================================== */

// --- Configuração -----------------------------------------------------------
// >>> ÚNICO VALOR PENDENTE: data/hora em que o 1º lote encerra (fuso de Brasília).
//     Quando passar, a página troca sozinha para o 2º lote (cards, countdown,
//     badge do hero e CTA final).
const LOTE_DEADLINE = '2026-10-14T23:59:59-03:00';

const CHECKOUT_LOTE1 = 'https://pay.kiwify.com.br/CLcumTX'; // R$187 à vista / 12x R$18,78
const CHECKOUT_LOTE2 = 'https://pay.kiwify.com.br/aPrPPPN'; // R$397 à vista / 12x R$29,82

const WHATSAPP_NUMERO = '5511992526671';
const WHATSAPP_MSG_SUPORTE = 'Olá! Tenho dúvidas sobre o IMPACTXPERIENCE (21 de outubro, Jlab Alphaville) e gostaria de mais informações.';
const WHATSAPP_MSG_AVISAR = 'Olá! Quero ser avisado(a) quando o 2º lote do IMPACTXPERIENCE abrir.';
const waLink = (msg) => `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`;

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
// Desktop: compensa a escala do canvas; mobile: scroll normal até o elemento.
document.querySelectorAll('[data-scroll]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(el.getAttribute('href'));
    if (isMobile()) {
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const y = parseFloat(el.dataset.scroll) || 0;
    const scale = document.documentElement.clientWidth / DESIGN_WIDTH;
    window.scrollTo({ top: y * scale, behavior: 'smooth' });
  });
});

// --- Marquee da faixa (duplica as logos para o loop) -----------------------
const track = document.querySelector('.marquee__track');
if (track) {
  const unit = track.querySelector('img');
  for (let i = 0; i < 23; i++) track.appendChild(unit.cloneNode(true));
}

// --- Countdown do 1º lote --------------------------------------------------
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
tick();
setInterval(tick, 1000);

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
let loteAtual = 1;

function applyLoteState(now) {
  const lote1Aberto = (now || new Date()) < new Date(LOTE_DEADLINE);
  loteAtual = lote1Aberto ? 1 : 2;
  const status = document.getElementById('lote1-status');
  const badge = document.getElementById('lote-badge');
  const ctaFinal = document.getElementById('cta-final-text');
  const label = document.querySelector('.countdown__label');
  if (lote1Aberto) {
    checkout.href = CHECKOUT_LOTE1;
    checkout.textContent = 'Quero garantir por R$187';
    checkout.classList.remove('is-disabled');
    lote2Btn.href = waLink(WHATSAPP_MSG_AVISAR);
    lote2Btn.textContent = 'Avisar quando abrir 🔒';
    lote2Btn.classList.add('plan__btn--red'); lote2Btn.classList.remove('plan__btn--gold');
    if (status) status.textContent = '[Disponível agora]';
    if (badge) badge.textContent = '1º lote por R$ 197';
    if (ctaFinal) ctaFinal.textContent = 'Garantir minha vaga por R$187';
    if (label) label.innerHTML = '<strong>Primeiro Lote</strong> encerra em:';
  } else {
    checkout.href = '#';
    checkout.textContent = '1º lote encerrado';
    checkout.classList.add('is-disabled');
    lote2Btn.href = CHECKOUT_LOTE2;
    lote2Btn.textContent = 'Quero garantir por R$397';
    lote2Btn.classList.remove('plan__btn--red'); lote2Btn.classList.add('plan__btn--gold');
    if (status) status.textContent = '[Encerrado]';
    if (badge) badge.textContent = '2º lote por R$ 397';
    if (ctaFinal) ctaFinal.textContent = 'Garantir minha vaga por R$397';
    if (label) label.innerHTML = '<strong>Primeiro Lote</strong> encerrado — 2º lote disponível';
  }
  [checkout, lote2Btn].forEach((a) => { a.target = '_blank'; a.rel = 'noopener'; });
}
applyLoteState();
setInterval(() => applyLoteState(), 60000);
window.__applyLoteState = applyLoteState; // para testes

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
