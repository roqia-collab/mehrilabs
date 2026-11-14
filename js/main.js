const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Menu mobile
const toggle = document.getElementById('toggle');
const menu = document.getElementById('menu');
const setMenu = open => {
  menu.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.textContent = open ? toggle.dataset.close : toggle.dataset.open;
};
toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

// Apparition au défilement
const revealSel = '.statement, .cols, .facts, .split--head h2, .row, .trio article, .motto, .contact__big, .contact__item';
document.querySelectorAll(revealSel).forEach((el, i) => {
  el.classList.add('reveal');
  // léger décalage pour les éléments d'une même rangée
  const sibs = [...el.parentElement.children].filter(c => c.matches(revealSel));
  el.style.transitionDelay = `${sibs.indexOf(el) * 90}ms`;
});
const targets = document.querySelectorAll('.reveal, .reveal-img');
if ('IntersectionObserver' in window && !reduceMotion) {
  // Un élément entièrement masqué (clip-path) n'est pas détecté : on observe alors son parent.
  const watched = new Map();
  targets.forEach(el => {
    const key = el.classList.contains('reveal-img') ? el.parentElement : el;
    if (!watched.has(key)) watched.set(key, []);
    watched.get(key).push(el);
  });
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) {
      watched.get(e.target).forEach(el => el.classList.add('is-in'));
      io.unobserve(e.target);
    }
  }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  watched.forEach((_, key) => io.observe(key));
} else {
  targets.forEach(el => el.classList.add('is-in'));
}

// Parallaxe : panorama d'Alger et M du hero
const pano = document.querySelector('.pano img');
const mark = document.querySelector('.hero__mark');
if (!reduceMotion) {
  let ticking = false;
  const update = () => {
    ticking = false;
    if (pano) {
      const r = pano.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -1 → 1
        pano.style.transform = `translate3d(0, ${p * -10}%, 0)`;
      }
    }
    if (mark && scrollY < innerHeight * 1.2) mark.style.translate = `0 ${scrollY * 0.25}px`;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

// Secteurs : image qui suit la souris
const rows = document.querySelector('.rows');
if (rows && matchMedia('(hover: hover) and (min-width: 901px)').matches) {
  const box = document.createElement('div');
  box.className = 'float-img';
  box.setAttribute('aria-hidden', 'true');
  const img = document.createElement('img');
  img.alt = '';
  box.appendChild(img);
  document.body.appendChild(box);
  rows.querySelectorAll('.row').forEach(row => {
    const src = row.querySelector('.row__img')?.getAttribute('src');
    if (src) new Image().src = src; // préchargement
    row.addEventListener('mouseenter', () => { if (src) img.src = src; box.classList.add('is-on'); });
    row.addEventListener('mouseleave', () => box.classList.remove('is-on'));
  });
  const rtl = document.dir === 'rtl';
  rows.addEventListener('mousemove', e => {
    const half = box.offsetWidth / 2 + 16;
    const x = rtl ? e.clientX - 220 : e.clientX + 220;
    box.style.setProperty('--x', `${Math.min(Math.max(x, half), innerWidth - half)}px`);
    box.style.setProperty('--y', `${e.clientY}px`);
  });
}

// Année
document.getElementById('year').textContent = new Date().getFullYear();
