const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');

function closeMenu() {
  menuBtn.classList.remove('active');
  menu.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}

menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = menu.classList.toggle('open');
  menuBtn.classList.toggle('active', isOpen);
  menuBtn.setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('click', (e) => {
  if (!menu.contains(e.target) || e.target.closest('.menu-item')) {
    closeMenu();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

document.getElementById('year').textContent = new Date().getFullYear();

(function () {
  const boxes = Array.from(document.querySelectorAll('#anyscreenCodes .code-digit'));
  const timerEl = document.getElementById('anyscreenTimer');
  if (!boxes.length || !timerEl) return;

  const ON_MS = 500;
  const GAP_MS = 220;
  const ALL_ON_MS = 700;
  const ALL_GAP_MS = 320;

  function step(index) {
    if (index < boxes.length) {
      boxes[index].classList.add('lit');
      setTimeout(() => {
        boxes[index].classList.remove('lit');
        setTimeout(() => step(index + 1), GAP_MS);
      }, ON_MS);
    } else {
      boxes.forEach((box) => box.classList.add('lit'));
      setTimeout(() => {
        boxes.forEach((box) => box.classList.remove('lit'));
        setTimeout(() => step(0), ALL_GAP_MS);
      }, ALL_ON_MS);
    }
  }
  step(0);

  let seconds = 9 * 60 + 56;
  setInterval(() => {
    seconds = seconds > 0 ? seconds - 1 : 9 * 60 + 56;
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
  }, 1000);
})();

(function () {
  const rows = Array.from(document.querySelectorAll('#nextgateNodes .ng-row'));
  if (!rows.length) return;

  function update() {
    let best = null;
    rows.forEach((row) => {
      const base = Number(row.dataset.ping);
      const ping = Math.max(3, base + Math.round((Math.random() - 0.5) * base * 0.2));
      row.querySelector('.ng-ping b').textContent = ping;
      row.classList.remove('best');
      if (!best || ping < best.ping) best = { row, ping };
    });
    best.row.classList.add('best');
  }
  update();
  setInterval(update, 1800);
})();

(function () {
  const container = document.getElementById('finmanDigits');
  if (!container) return;

  const values = ['128400', '131900', '126750', '134200'];
  const strips = [];

  function buildSlot() {
    const slot = document.createElement('span');
    slot.className = 'finman-digit-slot';
    const strip = document.createElement('span');
    strip.className = 'finman-digit-strip';
    for (let d = 0; d <= 9; d++) {
      const s = document.createElement('span');
      s.textContent = String(d);
      strip.appendChild(s);
    }
    slot.appendChild(strip);
    strips.push(strip);
    container.appendChild(slot);
  }

  for (let i = 0; i < 3; i++) buildSlot();
  const sep = document.createElement('span');
  sep.className = 'finman-sep';
  container.appendChild(sep);
  for (let i = 0; i < 3; i++) buildSlot();

  function setDigits(value, animate) {
    value.split('').forEach((d, i) => {
      const strip = strips[i];
      if (!animate) strip.style.transition = 'none';
      strip.style.transform = `translateY(-${Number(d) * 1.15}em)`;
      if (!animate) {
        strip.getBoundingClientRect();
        strip.style.transition = '';
      }
    });
  }

  setDigits(values[0], false);
  let index = 0;
  setInterval(() => {
    index = (index + 1) % values.length;
    setDigits(values[index], true);
  }, 2600);
})();

const words = ["сервисы", "технологии", "продукты", "приложения", "сайты", "программы", "сообщество", "автоматизации", "будущее", "свободу"];
const wordEl = document.getElementById('changing-word');
let index = 0;

function updateWord() {
  wordEl.style.opacity = '0';
  wordEl.style.transform = 'translateY(12px)';

  setTimeout(() => {
    index = (index + 1) % words.length;
    wordEl.textContent = words[index];
    setTimeout(() => {
      wordEl.style.opacity = '1';
      wordEl.style.transform = 'translateY(0)';
    }, 10);
  }, 300);
}
setInterval(updateWord, 4000);

document.addEventListener('DOMContentLoaded', function() {
  const marqueeContent = document.querySelector('.marquee-content');
  const track = document.querySelector('.marquee-track');
  track.appendChild(marqueeContent.cloneNode(true));
});
