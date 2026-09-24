/* ═══════════════════════════════════════════
   NEXUS · دو صفحه‌ای: ویترین + اتاق فرماندهی
   ═══════════════════════════════════════════ */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const rand = (a, b) => Math.random() * (b - a) + a;

/* ─── وضعیت موس ─── */
const mouse = { x: -9999, y: -9999 };
let hasMouse = false;
let missionActive = false;

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

/* ─── ۱) ذرات ─── */
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

/* ─── ۲) کرسر + پارالاکس ─── */
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
  if (e.target.closest('a,button,input,.agent-card,.metric-card,.arch-box,.node,.chip,.agent-mini')) ringEl?.classList.add('hovering');
});
document.addEventListener('mouseout', e => {
  if (e.target.closest('a,button,input,.agent-card,.metric-card,.arch-box,.node,.chip,.agent-mini')) ringEl?.classList.remove('hovering');
});
addEventListener('mousedown', () => ringEl?.classList.add('down'));
addEventListener('mouseup', () => ringEl?.classList.remove('down'));

/* ─── ۴) تب مخفی ─── */
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

/* ─── ۷) نمودار میله‌ای ─── */
const spark = $('.spark');
if (spark) setInterval(() => {
  $$('span', spark).forEach(s => s.style.height = Math.round(rand(25, 95)) + '%');
}, 2400);

/* ─── ۸) تایپ وضعیت کنسول (فقط صفحه اصلی) ─── */
const statusEl = $('.console-status strong');
if (statusEl) {
  const words = ['OPTIMAL', 'SYNCED', 'NOMINAL', 'STABLE'];
  let wi = 0;
  const type = (w, i = 0) => {
    if (missionActive) { setTimeout(() => type(w, 0), 700); return; }
    statusEl.textContent = w.slice(0, i);
    if (i < w.length) setTimeout(() => type(w, i + 1), 70);
    else setTimeout(() => del(w, w.length), 1800);
  };
  const del = (w, i) => {
    if (missionActive) { setTimeout(() => del(w, i), 700); return; }
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

function addActivity(color, icon, who, msg) {
  if (!list) return;
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

function pushActivity() {
  const p = pool[pi++ % pool.length];
  addActivity(...p);
}
setInterval(() => { if (!missionActive) pushActivity(); }, 9000);
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

/* ─── ۱۱) اسپات‌لایت ─── */
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

/* ─── ۱۲) تیلت سه‌بعدی ─── */
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

/* ─── ۱۴) پالت فرمان (فقط صفحه اصلی) ─── */
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
    const t = b.dataset.target;
    if (t && t.endsWith('.html')) { location.href = t; closeModal(); return; }
    const el = $(t);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    closeModal();
  });
});

function filterList(q) {
  $$('.command-list button').forEach(b => {
    b.style.display = b.textContent.includes(q) ? '' : 'none';
  });
}
input?.addEventListener('input', e => filterList(e.target.value.trim()));

/* ═══════════════════════════════════════════
   ۱۵) موتور مأموریت — اتاق فرماندهی (console.html)
   ═══════════════════════════════════════════ */
const cmdInput  = $('#cmdInput');
const cmdBtn    = $('#cmdBtn');
const cmdResult = $('#cmdResult');
const cmdBox    = $('#cmdBox');
const cmdStatus = $('#cmdStatus');

const AGENT_RULES = [
  { card: 'Code',     name: 'Code Agent',     color: 'green', icon: '✓',
    keys: ['کد', 'برنامه', 'باگ', 'تابع', 'اسکریپت', 'بیلد', 'تست', 'code', 'bug', 'api'],
    steps: ['ریپازیتوری اسکن شد و ۳ فایل مرتبط پیدا شد', 'تغییرات اعمال و تست‌های خودکار اجرا شد', 'نسخه‌ی جدید با موفقیت build شد'] },
  { card: 'Research', name: 'Research Agent', color: 'blue', icon: '⌁',
    keys: ['تحقیق', 'سرچ', 'جستجو', 'منبع', 'خبر', 'قیمت', 'درباره', 'مقاله', 'بازار', 'research', 'search'],
    steps: ['۸ منبع بررسی و اعتبارسنجی شد', '۳ منبع معتبر انتخاب شد', 'خلاصه‌ی یافته‌ها تهیه شد'] },
  { card: 'Vision',   name: 'Vision Agent',   color: 'amber', icon: '◇',
    keys: ['عکس', 'تصویر', 'سند', 'فایل', 'اسکن', 'ocr', 'تصاویر'],
    steps: ['ورودی‌های بصری پردازش شد', 'متن و ساختار استخراج شد', 'داده‌های ساختاریافته ثبت شد'] },
  { card: 'Security', name: 'Security Agent', color: 'cyan', icon: '◎',
    keys: ['امنیت', 'هک', 'ریسک', 'ترافیک', 'نفوذ', 'لاگ', 'حمله'],
    steps: ['لاگ‌های ۲۴ ساعت اخیر بررسی شد', 'یک الگوی غیرعادی شناسایی شد', 'منبع مشکوک مسدود و گزارش شد'] },
  { card: 'Analyst',  name: 'Analyst Agent',  color: 'purple', icon: '⌘',
    keys: ['گزارش', 'تحلیل', 'آمار', 'شاخص', 'kpi', 'نمودار'],
    steps: ['داده‌های خام جمع‌آوری شد', 'شاخص‌های کلیدی محاسبه شد', 'گزارش نهایی تولید شد'] },
];

function pickAgent(task) {
  const t = task.toLowerCase();
  let best = null, bestHits = 0;
  for (const r of AGENT_RULES) {
    const hits = r.keys.filter(k => t.includes(k)).length;
    if (hits > bestHits) { bestHits = hits; best = r; }
  }
  return best || AGENT_RULES[1];
}

function agentCard(n) { return $(`.agent-mini[data-agent="${n}"]`); }
function setWorking(n, on) { agentCard(n)?.classList.toggle('working', on); }

function wakeAgent(n) {
  const c = agentCard(n);
  if (!c) return;
  const st = c.querySelector('.status');
  if (st && st.classList.contains('standby')) {
    st.classList.remove('standby');
    st.classList.add('active');
    st.textContent = 'ACTIVE';
  }
  const b = c.querySelector('.mini-load b');
  if (b) {
    const cur = parseInt(b.textContent) || 0;
    b.textContent = Math.min(cur + Math.round(rand(9, 18)), 95) + '%';
  }
}

function runMission() {
  if (missionActive || !cmdInput) return;
  const task = cmdInput.value.trim();
  if (!task) { cmdInput.focus(); return; }

  missionActive = true;
  cmdBox?.classList.add('working');
  if (cmdBtn) { cmdBtn.textContent = 'در حال اجرا…'; cmdBtn.disabled = true; }
  cmdInput.disabled = true;
  if (cmdResult) { cmdResult.classList.remove('show'); cmdResult.innerHTML = ''; }
  if (cmdStatus) { cmdStatus.textContent = 'PROCESSING…'; cmdStatus.className = 'cmd-status busy'; }

  const rule = pickAgent(task);
  const short = task.length > 42 ? task.slice(0, 42) + '…' : task;

  /* مدیر اول دستور را می‌گیرد */
  setWorking('Orchestrator', true);
  addActivity('purple', '⌘', 'Orchestrator', `مأموریت جدید دریافت شد: «${short}»`);
  setTimeout(() => setWorking('Orchestrator', false), 1500);

  const seq = [
    ['purple', '⌘', 'Orchestrator', `تحلیل شد — مأموریت به ${rule.name} سپرده شد.`],
    ...rule.steps.map(s => [rule.color, rule.icon, rule.name, s + '.']),
  ];
  const step = 1100;
  seq.forEach((s, i) => setTimeout(() => {
    addActivity(...s);
    if (i === 0) { wakeAgent(rule.card); setWorking(rule.card, true); }
  }, 900 + i * step));

  const doneAt = 900 + seq.length * step + 500;

  setTimeout(() => {
    if (cmdResult) {
      const t = Math.round(rand(3, 12)), c = Math.round(rand(88, 99));
      cmdResult.innerHTML = `
        <div class="mr-head"><span class="mr-badge">✓ DONE</span><b>${rule.name}</b></div>
        <p class="mr-task">مأموریت: «${short}»</p>
        <p class="mr-sum">${rule.steps[rule.steps.length - 1]} و نتیجه برای Orchestrator ارسال شد.</p>
        <div class="mr-meta">
          <span>زمان اجرا<b>${t}s</b></span>
          <span>منابع<b>${Math.round(rand(4, 12))}</b></span>
          <span>اعتماد<b>${c}%</b></span>
        </div>`;
      cmdResult.classList.add('show');
    }
    setWorking(rule.card, false);
    addActivity('green', '✓', 'System', `مأموریت «${short}» با موفقیت تکمیل شد.`);
    if (cmdStatus) {
      cmdStatus.textContent = 'MISSION COMPLETE ✓';
      cmdStatus.className = 'cmd-status ok';
      setTimeout(() => { cmdStatus.textContent = 'SYSTEM READY'; cmdStatus.className = 'cmd-status'; }, 2600);
    }
  }, doneAt);

  setTimeout(() => {
    cmdBox?.classList.remove('working');
    if (cmdBtn) { cmdBtn.textContent = 'اجرا مأموریت'; cmdBtn.disabled = false; }
    cmdInput.disabled = false;
    cmdInput.value = '';
    missionActive = false;
    cmdInput.focus();
  }, doneAt + 1600);
}

cmdBtn?.addEventListener('click', runMission);
cmdInput?.addEventListener('keydown', e => { if (e.key === 'Enter') runMission(); });

/* دکمه‌های آماده — کلیک کن و مأموریت اجرا شه */
 $$('.chip[data-cmd]').forEach(ch => ch.addEventListener('click', () => {
  if (missionActive || !cmdInput) return;
  cmdInput.value = ch.dataset.cmd;
  runMission();
}));

})();