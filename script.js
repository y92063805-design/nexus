/* ═══════════════════════════════════════════
   NEXUS · نسخه بهینه + پس‌زمینه زنده
   ═══════════════════════════════════════════ */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const rand = (a, b) => Math.random() * (b - a) + a;

/* ─── وضعیت موس (فقط یک listener سبک) ─── */
const mouse = { x: -9999, y: -9999 };
let hasMouse = false;

const dotEl  = $('.cursor-dot');
const ringEl = $('.cursor-ring');
const orbA   = $('.orb-a');
const orbB   = $('.orb-b');
const consoleEl = $('.hero-console');
const bgPhoto  = $('#bgPhoto');

let cx = innerWidth / 2, cy = innerHeight / 2;
let rx = cx, ry = cy;

addEventListener('mousemove', e => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  hasMouse = true; cx = mouse.x; cy = mouse.y;
  if (dotEl) dotEl.style.transform = `translate(${cx}px,${cy}px)`;
}, { passive: true });

document.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

/* ─── ۱) ذرات (سبک‌تر + کیفیت خودکار) ─── */
const canvas = $('#particles');
if (canvas) {
  const pctx = canvas.getContext('2d');
  const DPR = Math.min(devicePixelRatio || 1, 1.5);
  let W = 0, H = 0, parts = [];
  let LINK = 110, MOUSE_R = 130;
  const COLORS = ['124,92,255', '34,211,238', '167,139,250'];

  function buildParts() {
    const n = Math.min(Math.floor(W * H / 22000), 65);
    parts = Array.from({ length: n }, () => ({
      x: rand(0, W), y: rand(0, H),
      vx: rand(-.3, .3), vy: rand(-.3, .3),
      r: rand(1, 2.2),
      c: COLORS[(Math.random() * COLORS.length) | 0]
    }));
  }
  function pResize() {
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    pctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildParts();
  }
  let rT;
  addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(pResize, 180); });
  pResize();

  let fpsFrames = 0, fpsLast = performance.now(), degrade = 0, pRunning = true;

  function particleLoop() {
    if (!pRunning) return;
    pctx.clearRect(0, 0, W, H);
    const mx = mouse.x, my = mouse.y;
    const LINK2 = LINK * LINK, MR2 = MOUSE_R * MOUSE_R;

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < -15) p.x = W + 15; else if (p.x > W + 15) p.x = -15;
      if (p.y < -15) p.y = H + 15; else if (p.y > H + 15) p.y = -15;

      const dxm = p.x - mx, dym = p.y - my;
      const dm2 = dxm * dxm + dym * dym;

      if (dm2 < 10000 && dm2 > 1) {
        const dm = Math.sqrt(dm2), f = (100 - dm) / 100 * 1.4;
        p.x += dxm / dm * f; p.y += dym / dm * f;
      }

      for (let j = i + 1; j < parts.length; j++) {
        const q = parts[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK2) {
          pctx.strokeStyle = 'rgba(124,92,255,' + ((1 - Math.sqrt(d2) / LINK) * .3).toFixed(3) + ')';
          pctx.beginPath(); pctx.moveTo(p.x, p.y); pctx.lineTo(q.x, q.y); pctx.stroke();
        }
      }

      if (dm2 < MR2) {
        pctx.strokeStyle = 'rgba(34,211,238,' + ((1 - Math.sqrt(dm2) / MOUSE_R) * .45).toFixed(3) + ')';
        pctx.beginPath(); pctx.moveTo(p.x, p.y); pctx.lineTo(mx, my); pctx.stroke();
      }

      pctx.fillStyle = 'rgba(' + p.c + ',.85)';
      pctx.beginPath(); pctx.arc(p.x, p.y, p.r, 0, 6.2832); pctx.fill();
    }

    /* ─── کیفیت خودکار: اگه سیستم ضعیف بود خودش سبک می‌شه ─── */
    fpsFrames++;
    const now = performance.now();
    if (now - fpsLast >= 2000) {
      const fps = fpsFrames / ((now - fpsLast) / 1000);
      fpsFrames = 0; fpsLast = now;
      if (fps < 42 && degrade < 2) {
        degrade++;
        if (degrade === 1) { parts.length = Math.ceil(parts.length / 2); LINK = 90; }
        else { canvas.style.display = 'none'; pRunning = false; return; }
      }
    }
    requestAnimationFrame(particleLoop);
  }
  particleLoop();
}

/* ─── ۲) حلقه روان کرسر + پارالاکس (همه در یک حلقه) ─── */
let parX = 0, parY = 0;
(function uiLoop() {
  if (ringEl) {
    rx += (cx - rx) * .22; ry += (cy - ry) * .22;
    ringEl.style.transform = `translate(${rx}px,${ry}px)`;
  }
  const tx = hasMouse ? cx / innerWidth - .5 : 0;
  const ty = hasMouse ? cy / innerHeight - .5 : 0;
  parX += (tx - parX) * .05; parY += (ty - parY) * .05;
  if (bgPhoto) bgPhoto.style.translate = `${(parX * -16).toFixed(1)}px ${(parY * -12).toFixed(1)}px`;
  if (orbA) orbA.style.translate = `${(parX * -34).toFixed(1)}px ${(parY * -24).toFixed(1)}px`;
  if (orbB) orbB.style.translate = `${(parX * 28).toFixed(1)}px ${(parY * 20).toFixed(1)}px`;
  if (consoleEl) consoleEl.style.translate = `${(parX * 10).toFixed(1)}px ${(parY * 8).toFixed(1)}px`;
  requestAnimationFrame(uiLoop);
})();

/* ─── ۳) حالت‌های کرسر ─── */
document.addEventListener('mouseover', e => {
  if (e.target.closest('a,button,input,.agent-card,.metric-card,.arch-box,.node')) ringEl?.classList.add('hovering');
});
document.addEventListener('mouseout', e => {
  if (e.target.closest('a,button,input,.agent-card,.metric-card,.arch-box,.node')) ringEl?.classList.remove('hovering');
});
addEventListener('mousedown', () => ringEl?.classList.add('down'));
addEventListener('mouseup', () => ringEl?.classList.remove('down'));

/* ─── ۴) توقف انیمیشن‌ها وقتی تب مخفیه ─── */
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('tab-hidden', document.hidden);
});

/* ─── ۵) ساعت ─── */
const clock = $('#clock');
if (clock) {
  const tick = () => clock.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
  tick(); setInterval(tick, 1000);
}

/* ─── ۶) شمارنده ─── */
const reqEl = $('#requests');
let shown = 0, counted = false;
function animateCount() {
  if (counted || !reqEl) return; counted = true;
  const t0 = performance.now(), dur = 2200, target = 128642;
  (function step(t) {
    const k = Math.min((t - t0) / dur, 1);
    shown = Math.round(target * (1 - Math.pow(1 - k, 3)));
    reqEl.textContent = shown.toLocaleString('en-US');
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}
setInterval(() => {
  if (counted && reqEl) {
    shown += Math.floor(rand(2, 9));
    reqEl.textContent = shown.toLocaleString('en-US');
  }
}, 3000);

/* ─── ۷) نمودار میله‌ای زنده ─── */
const spark = $('.spark');
if (spark) setInterval(() => {
  $$('span', spark).forEach(s => s.style.height = Math.round(rand(25, 95)) + '%');
}, 2400);

/* ─── ۸) تایپ وضعیت ─── */
const statusEl = $('.console-status strong');
if (statusEl) {
  const words = ['OPTIMAL', 'SYNCED', 'NOMINAL', 'STABLE'];
  let wi = 0;
  const type = (w, i = 0) => {
    statusEl.textContent = w.slice(0, i);
    if (i < w.length) setTimeout(() => type(w, i + 1), 70);
    else setTimeout(() => del(w, w.length), 1800);
  };
  const del = (w, i) => {
    statusEl.textContent = w.slice(0, i);
    if (i > 0) setTimeout(() => del(w, i - 1), 40);
    else { wi = (wi + 1) % words.length; setTimeout(() => type(words[wi]), 300); }
  };
  type(words[0]);
}

/* ─── ۹) فید فعالیت ─── */
const list = $('#activityList');
const pool = [
  ['purple', '⌘', 'Orchestrator', 'Workflow «Sentinel Sweep» برای پایش امنیتی اجرا شد.'],
  ['blue',   '⌁', 'Research Agent', '۳ گزارش بازار با اولویت بالا صف‌بندی شد.'],
  ['green',  '✓', 'Code Agent', 'تست‌های regression نسخه 2.4.2 پاس شدند.'],
  ['amber',  '◇', 'Vision Agent', '۲ سند اسکن و ساختاردهی شد.'],
  ['cyan',   '◎', 'Security Agent', 'الگوی ترافیک غیرعادی شناسایی و مسدود شد.'],
  ['purple', '⌘', 'Orchestrator', 'بار پردازش بین ۳ ایجنت بازتوزیع شد.'],
  ['green',  '✓', 'Code Agent', 'پیشنهاد بهینه‌سازی کوئری D-14 اعمال شد.'],
  ['blue',   '⌁', 'Research Agent', 'نقشه دانش با ۸ مفهوم جدید به‌روزرسانی شد.'],
];
let pi = 0;
function pushActivity() {
  if (!list) return;
  const [color, icon, who, msg] = pool[pi++ % pool.length];
  $$('time', list).forEach(t => { if (t.textContent === 'اکنون') t.textContent = '۸ث'; });
  const el = document.createElement('div');
  el.className = 'activity enter';
  el.innerHTML = `<span class="activity-icon ${color}">${icon}</span><div><b>${who}</b><p>${msg}</p></div><time>اکنون</time>`;
  list.prepend(el);
  const items = $$('.activity', list);
  if (items.length > 6) {
    const last = items[items.length - 1];
    last.classList.add('exit');
    setTimeout(() => last.remove(), 400);
  }
}
setInterval(pushActivity, 8000);
 $('#refreshActivity')?.addEventListener('click', pushActivity);

/* ─── ۱۰) ریویل اسکرول ─── */
const revealEls = $$('.section-heading, .metric-card, .panel, .agent-card, .arch-layer, .connector, .manifesto-inner, footer');
revealEls.forEach(el => {
  el.classList.add('reveal');
  let i = 0;
  for (const s of el.parentElement.children) {
    if (s === el) break;
    if (s.classList.contains('reveal')) i++;
  }
  el.style.setProperty('--d', Math.min(i * 90, 360) + 'ms');
});
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        if (en.target.querySelector?.('#requests')) animateCount();
        io.unobserve(en.target);
      }
    });
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
  animateCount();
}

/* ─── ۱۱) اسپات‌لایت (با موقعیت کش‌شده = بدون لگ) ─── */
 $$('.metric-card, .agent-card, .panel, .arch-box').forEach(el => {
  let rect = null;
  el.addEventListener('mouseenter', () => rect = el.getBoundingClientRect());
  el.addEventListener('mouseleave', () => rect = null);
  el.addEventListener('mousemove', e => {
    if (!rect) return;
    el.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    el.style.setProperty('--my', (e.clientY - rect.top) + 'px');
  });
});

/* ─── ۱۲) تیلت سه‌بعدی (بهینه) ─── */
if (matchMedia('(hover:hover)').matches) {
  $$('.agent-card').forEach(card => {
    let rect = null, raf = 0, lx = 0, ly = 0;
    card.addEventListener('mouseenter', () => rect = card.getBoundingClientRect());
    card.addEventListener('mousemove', e => {
      if (!rect) return;
      lx = e.clientX; ly = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const px = (lx - rect.left) / rect.width - .5;
        const py = (ly - rect.top) / rect.height - .5;
        card.style.transform = `perspective(900px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) translateY(-6px)`;
        raf = 0;
      });
    });
    card.addEventListener('mouseleave', () => { rect = null; card.style.transform = ''; });
  });
}

/* ─── ۱۳) هدر ─── */
const topbar = $('.topbar');
addEventListener('scroll', () => {
  topbar?.classList.toggle('scrolled', scrollY > 40);
}, { passive: true });

/* ─── ۱۴) پالت فرمان ─── */
const modal = $('#commandModal'), openBtn = $('#commandBtn'),
      closeBtn = $('#closeModal'), backdrop = $('#modalBackdrop'),
      input = $('#commandInput');

const openModal = () => {
  modal?.classList.add('open');
  modal?.setAttribute('aria-hidden', 'false');
  setTimeout(() => input?.focus(), 60);
};
const closeModal = () => {
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden', 'true');
  if (input) input.value = '';
  filterList('');
};
openBtn?.addEventListener('click', openModal);
closeBtn?.addEventListener('click', closeModal);
backdrop?.addEventListener('click', closeModal);

addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    modal?.classList.contains('open') ? closeModal() : openModal();
  }
  if (e.key === 'Escape') closeModal();
});

 $$('.command-list button').forEach(b => {
  b.addEventListener('click', () => {
    const t = $(b.dataset.target);
    if (t) t.scrollIntoView({ behavior: 'smooth' });
    closeModal();
  });
});

function filterList(q) {
  $$('.command-list button').forEach(b => {
    b.style.display = b.textContent.includes(q) ? '' : 'none';
  });
}
input?.addEventListener('input', e => filterList(e.target.value.trim()));

})();