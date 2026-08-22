const menuBtn = document.getElementById('menuBtn');
const glassMenu = document.getElementById('glassMenu');

function closeMenu() {
  menuBtn.classList.remove('active');
  glassMenu.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}

menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = glassMenu.classList.toggle('open');
  menuBtn.classList.toggle('active', isOpen);
  menuBtn.setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('click', (e) => {
  if (!glassMenu.contains(e.target) && e.target !== menuBtn) {
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

  let sweepTimer = null;
  const ON_MS = 500;
  const GAP_MS = 220;
  const ALL_ON_MS = 700;
  const ALL_GAP_MS = 320;

  function step(index) {
    if (index < boxes.length) {
      boxes[index].classList.add('lit');
      sweepTimer = setTimeout(() => {
        boxes[index].classList.remove('lit');
        sweepTimer = setTimeout(() => step(index + 1), GAP_MS);
      }, ON_MS);
    } else {
      boxes.forEach((box) => box.classList.add('lit'));
      sweepTimer = setTimeout(() => {
        boxes.forEach((box) => box.classList.remove('lit'));
        sweepTimer = setTimeout(() => step(0), ALL_GAP_MS);
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
  const platforms = ['Windows', 'macOS', 'Linux', 'Android', 'iOS', 'Apple TV', 'Android TV'];
  const chips = document.querySelectorAll('#nextgatePlatforms .ng-chip');
  const nameEl = document.getElementById('nextgatePlatformName');
  const titleEl = nameEl ? nameEl.closest('.ng-hero-title') : null;
  if (!chips.length || !nameEl || !titleEl) return;

  let index = 0;
  function update() {
    chips.forEach((chip, i) => chip.classList.toggle('active', i === index));
    titleEl.classList.add('fading');
    setTimeout(() => {
      nameEl.textContent = platforms[index];
      titleEl.classList.remove('fading');
      index = (index + 1) % platforms.length;
    }, 300);
  }
  update();
  setInterval(update, 2000);
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

const words = ["сервисы", "технологии", "продукты", "приложения", "сайты", "документацию", "программы", "сообщество", "speedware", "статьи", "автоматизации", "будущее", "свободу"];
const wordEl = document.getElementById('changing-word');
let index = 0;

function updateWord() {
  wordEl.style.opacity = '0';
  wordEl.style.transform = 'translateY(15px)';

  setTimeout(() => {
    index = (index + 1) % words.length;
    wordEl.textContent = words[index];
    setTimeout(() => {
      wordEl.style.opacity = '1';
      wordEl.style.transform = 'translateY(0)';
    }, 10);

  }, 200);
}
setInterval(updateWord, 4000);

document.addEventListener('DOMContentLoaded', function() {
  const marqueeContent = document.querySelector('.marquee-content');
  const track = document.querySelector('.marquee-track');

  const clone = marqueeContent.cloneNode(true);
  track.appendChild(clone);

  const contentWidth = marqueeContent.scrollWidth;
  track.style.width = (contentWidth * 2) + 'px';
});

document.addEventListener('DOMContentLoaded', function() {
  const video = document.querySelector('.video-bg');
  const hero = document.querySelector('.hero');

  if (video && hero) {
    let videoLoaded = false;
    let minTimePassed = false;

    video.preload = 'auto';

    setTimeout(function() {
      minTimePassed = true;
      if (videoLoaded) {
        showVideo();
      }
    }, 10000);

    video.addEventListener('canplaythrough', function() {
      videoLoaded = true;
      if (minTimePassed) {
        showVideo();
      }
    });

    function showVideo() {
      hero.classList.add('video-loaded');
      video.play().catch(function(error) {
        console.log('Автоплей заблокирован, видео начнется после взаимодействия');
      });
    }

    if (video.readyState >= 4) {
      videoLoaded = true;
      if (minTimePassed) {
        showVideo();
      }
    }
  }
});
