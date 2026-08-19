const WEDDING_DATE = new Date("2026-09-12T17:10:00+03:00");
const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function resetInitialScroll() {
  if (qs('#hero')?.classList.contains('invite-open')) return;
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
}

function lockInitialTop() {
  if (window.location.hash) return;
  resetInitialScroll();
  [50, 150, 400, 900].forEach((delay) => {
    window.setTimeout(resetInitialScroll, delay);
  });
}

function applyArtboardScale() {
  const viewportWidth = window.innerWidth;
  const isMobileLayout = viewportWidth < 640;

  qsa('.pixel-block.mobile-record').forEach((section) => {
    const artboard = qs('.z-artboard', section);
    if (!artboard || !isMobileLayout) return;

    const designWidth = 320;
    const heightOverrides = {
      'dress-code': 460,
      contacts: 450
    };
    const designHeight = heightOverrides[section.id] || Number(
      artboard.getAttribute('data-artboard-height-res-320') ||
      artboard.getAttribute('data-artboard-height')
    );
    const scale = viewportWidth / designWidth;
    let scaledHeight = Math.floor(designHeight * scale);
    if (designHeight === 790 && viewportWidth > 320 && viewportWidth < 400) {
      scaledHeight += 1;
    }
    const carrier = qs('.z-carrier', artboard);
    const filter = qs('.z-filter', artboard);

    section.style.setProperty('height', `${scaledHeight}px`, 'important');
    artboard.style.setProperty('width', `${designWidth}px`, 'important');
    artboard.style.setProperty('height', `${designHeight}px`, 'important');
    artboard.style.setProperty('zoom', String(scale));

    [carrier, filter].forEach((layer) => {
      if (!layer) return;
      layer.style.setProperty('width', `${designWidth}px`, 'important');
      layer.style.setProperty('height', `${designHeight}px`, 'important');
    });
  });
}

function initReveal() {
  const items = qsa(".reveal");
  const groups = new Map();

  items.forEach((item) => {
    item.classList.remove('is-visible');
    item.style.setProperty('--reveal-duration', `${item.dataset.animateDuration || 1.5}s`);
    item.style.setProperty('--reveal-distance', `${item.dataset.animateDistance || 100}px`);
    const section = item.closest('.pixel-block') || item.parentElement;
    const group = groups.get(section) || [];
    group.push(item);
    groups.set(section, group);
  });

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        groups.get(entry.target)?.forEach((item) => item.classList.add('is-visible'));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });

  groups.forEach((group, section) => observer.observe(section));
}

function initScheduleHeart() {
  const schedule = qs('#schedule');
  const heart = qs('#sbs-2420827621-1781561746053');
  if (!schedule || !heart) return;

  const path = [
    [0, 0],
    [43, 31],
    [13, 62],
    [-42, 97],
    [-24, 137],
    [35, 167],
    [26, 202],
    [-31, 234],
    [-30, 272],
    [23, 292]
  ];
  const step = 50;
  let frameRequested = false;

  const render = () => {
    frameRequested = false;

    if (window.innerWidth >= 640 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      heart.style.transform = 'translate3d(0, 0, 0)';
      return;
    }

    const scale = window.innerWidth / 320;
    const heartTop = schedule.offsetTop + 184 * scale;
    const start = heartTop - window.innerHeight * 0.5;
    const maxProgress = (path.length - 1) * step;
    const progress = Math.min(maxProgress, Math.max(0, (window.scrollY - start) / scale));
    const segment = Math.min(path.length - 2, Math.floor(progress / step));
    const amount = Math.min(1, (progress - segment * step) / step);
    const from = path[segment];
    const to = path[segment + 1];
    const x = from[0] + (to[0] - from[0]) * amount;
    const y = from[1] + (to[1] - from[1]) * amount;

    heart.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const requestRender = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(render);
  };

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender);
  requestRender();
}

function initOpenButton() {
  const hero = qs('#hero');
  const openers = [
    qs('[data-elem-id="1783401092945000003"]'),
    qs('[data-elem-id="1783401092946000004"]')
  ].filter(Boolean);

  if (!hero || !openers.length) return;

  const openInvitation = () => {
    if (hero.classList.contains('invite-open')) return;
    hero.classList.add('invite-open');
    document.body.classList.remove('locked');
    qs('#background-music')?.play().catch(() => {});
  };

  openers.forEach((opener) => {
    opener.setAttribute('role', 'button');
    opener.setAttribute('tabindex', '0');
    opener.setAttribute('aria-label', 'Открыть приглашение');
    opener.addEventListener('click', openInvitation);
    opener.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openInvitation();
      }
    });
  });
}

function initAudio() {
  const audio = qs('#background-music');
  if (!audio) return;
  audio.volume = 0.4;
  audio.play().catch(() => {});
}

function initContact() {
  const phone = qs('#contacts [data-elem-id="1781793943849000001"] .z-atom');
  if (!phone) return;

  phone.innerHTML = '<a href="tel:+79213259424">+7 921 325 94 24</a>';
}

function initCustomImages() {
  const locationImage = qs('#location [data-elem-id="1781790303435000001"] img');
  if (locationImage) {
    locationImage.src = './assets/images/location-zags.webp';
  }
}

function initCustomContent() {
  const content = {
    '#hero [data-elem-id="1781784352111000002"] .z-atom': 'Сергей &amp;',
    '#hero [data-elem-id="1778428408449000002"] .z-atom': 'приглашают<br>на свою свадьбу',
    '#intro [data-elem-id="1781785362621000004"] .z-atom': '12 сентября в 17:10',
    '#schedule [data-elem-id="1779285775491000005"] .z-atom': '16:50',
    '#schedule [data-elem-id="1779285810996000008"] .z-atom': 'Сбор гостей<br>на регистрацию',
    '#schedule [data-elem-id="1781785836179000001"] .z-atom': '18:40',
    '#schedule [data-elem-id="1781785836179000002"] .z-atom': 'Городской причал<br>у Адмиралтейства',
    '#schedule [data-elem-id="1779285848531000011"] .z-atom': '19:00',
    '#schedule [data-elem-id="1778435477849000001"] .z-atom': 'Теплоход «Аврора»',
    '#schedule [data-elem-id="1779285810996000007"] .z-atom': '23:00',
    '#schedule [data-elem-id="1779285829285000010"] .z-atom': 'Завершение<br>вечера',
    '#max-channel [data-elem-id="1781787214846000002"] .z-atom': 'Пожалуйста, не дарите нам цветы.<br>Вместо букета будем рады бутылочке<br>хорошего вина. Приходите всей семьёй —<br>маленьким гостям мы тоже<br>будем очень рады!'
  };

  Object.entries(content).forEach(([selector, html]) => {
    const element = qs(selector);
    if (element) element.innerHTML = html;
  });
}

function getPlural(value, one, few, many) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function initCountdown() {
  const output = qs(".zero-timer .z-atom") || qs(".countdown");
  if (!output) return;

  const render = () => {
    const now = new Date();
    const remaining = Math.max(0, WEDDING_DATE.getTime() - now.getTime());
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value) => String(value).padStart(2, "0");

    output.textContent = `${days} : ${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
  };

  render();
  window.setInterval(render, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add('locked');
  applyArtboardScale();
  lockInitialTop();
  initCustomContent();
  initReveal();
  initScheduleHeart();
  initOpenButton();
  initAudio();
  initContact();
  initCustomImages();
  initCountdown();
});

window.addEventListener("load", () => {
  applyArtboardScale();
  lockInitialTop();
});
window.addEventListener("pageshow", lockInitialTop);
window.addEventListener('resize', applyArtboardScale);
