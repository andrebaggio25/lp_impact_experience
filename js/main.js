/* ==========================================================================
   LP IMPACTXPERIENCE
   ========================================================================== */

// --- Configuração -----------------------------------------------------------
// Data-limite do 1º lote (countdown) e link de checkout (Kiwify)
const LOTE_DEADLINE = '2026-10-14T23:59:59-03:00';
const CHECKOUT_URL = '#'; // ex.: 'https://pay.kiwify.com.br/XXXXXXX'
const SUPORTE_URL = '#';  // ex.: 'https://wa.me/55XXXXXXXXXXX'

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

// --- Carrossel de depoimentos (rotação simples dos cards) ------------------
const carousel = document.getElementById('carousel');
function rotate(dir) {
  const cards = Array.from(carousel.children);
  if (dir > 0) carousel.appendChild(cards[0]);
  else carousel.insertBefore(cards[cards.length - 1], cards[0]);
  carousel.animate(
    [{ opacity: 0.55, transform: 'translateX(' + dir * -18 + 'px)' }, { opacity: 1, transform: 'translateX(0)' }],
    { duration: 350, easing: 'ease' }
  );
}
document.getElementById('car-prev').addEventListener('click', () => rotate(-1));
document.getElementById('car-next').addEventListener('click', () => rotate(1));

// --- Links configuráveis ---------------------------------------------------
const checkout = document.getElementById('checkout');
if (checkout && CHECKOUT_URL !== '#') checkout.href = CHECKOUT_URL;
const suporte = document.getElementById('suporte');
if (suporte && SUPORTE_URL !== '#') suporte.href = SUPORTE_URL;

// --- Eventos do Meta Pixel (disparam só quando o pixel estiver ativo) ------
// Ative o pixel no <head> do index.html; nada mais precisa mudar aqui.
function pixelTrack(event, params) {
  if (typeof window.fbq === 'function') window.fbq('track', event, params || {});
}
if (checkout) checkout.addEventListener('click', () =>
  pixelTrack('InitiateCheckout', { value: 187.0, currency: 'BRL', content_name: 'Primeiro Lote' }));
if (suporte) suporte.addEventListener('click', () => pixelTrack('Contact'));
const avisar = document.querySelector('.plan__btn--red');
if (avisar) avisar.addEventListener('click', () =>
  pixelTrack('Lead', { content_name: 'Avisar quando abrir - Segundo Lote' }));
