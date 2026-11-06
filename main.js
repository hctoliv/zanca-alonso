(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = '5511950547619';

  /* ---------- intro ---------- */
  const intro = $('.intro');
  const ready = () => root.classList.add('is-ready');
  if (root.classList.contains('intro-on')) {
    const freeze = new URLSearchParams(location.search).get('intro');
    let done = false;
    const end = () => {
      if (done) return; done = true;
      try { sessionStorage.setItem('za-intro', '1'); } catch (e) {}
      intro.classList.add('out');
      setTimeout(ready, 350);
      setTimeout(() => root.classList.remove('intro-on'), 1150);
    };
    if (freeze && /^\d+$/.test(freeze)) {
      $$('*', intro).forEach(el => { el.style.animationDelay = `-${freeze}ms`; el.style.animationPlayState = 'paused'; });
    } else {
      setTimeout(end, reduce ? 200 : 2300);
      intro.addEventListener('click', end);
      addEventListener('keydown', end, { once: true });
    }
  } else {
    requestAnimationFrame(() => requestAnimationFrame(ready));
  }

  /* ---------- header ---------- */
  const hd = $('.hd');
  const zones = $$('[data-tone]').filter(el => el !== hd);
  let lastY = scrollY;
  const updateHeader = () => {
    const y = scrollY;
    hd.classList.toggle('is-scrolled', y > 30);
    if (!document.body.classList.contains('menu-open')) hd.classList.toggle('is-hidden', y > lastY && y > 500);
    lastY = y;
    const probe = hd.offsetHeight / 2;
    for (const z of zones) {
      const r = z.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) { hd.dataset.tone = z.dataset.tone; break; }
    }
  };

  /* ---------- menu ---------- */
  const burger = $('.hd__burger'), menu = $('.menu');
  const setMenu = open => {
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- hero: fotos em rodízio ---------- */
  const hero = $('.hero');
  const slides = $$('.hero__media img');
  let si = 0, heroVisible = true;
  new IntersectionObserver(e => { heroVisible = e[0].isIntersecting; }).observe(hero);
  if (!reduce) setInterval(() => {
    if (!heroVisible || document.hidden) return;
    slides[si].classList.remove('is-on');
    si = (si + 1) % slides.length;
    slides[si].classList.add('is-on');
  }, 6000);
  const media = $('.hero__media');

  /* ---------- contador ---------- */
  const counter = $('[data-count]');
  const runCount = () => {
    const end = +counter.dataset.count, t0 = performance.now(), dur = 1800;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      counter.textContent = Math.round(end * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const waitReady = () => root.classList.contains('is-ready') ? setTimeout(runCount, 500) : setTimeout(waitReady, 120);
  waitReady();

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => { if (!el.closest('.hero')) io.observe(el); });
  const heroReveal = () => $$('.hero .reveal').forEach((el, i) => setTimeout(() => el.classList.add('in'), 500 + i * 140));
  const waitHero = () => root.classList.contains('is-ready') ? heroReveal() : setTimeout(waitHero, 120);
  waitHero();

  /* ---------- manifesto palavra por palavra ---------- */
  const mText = $('[data-words]'), mSec = $('.manifesto'), mBg = $('.manifesto__bg');
  const gold = new Set(['30', 'anos.', 'visão', 'global', 'melhores', 'soluções,']);
  mText.innerHTML = mText.textContent.trim().split(/\s+/)
    .map(w => `<span class="w${gold.has(w) ? ' gold' : ''}">${w}</span>`).join(' ');
  const words = $$('.w', mText);

  /* ---------- áreas ---------- */
  const panels = $$('.area'), list = $$('.areas__list li'), icons = $$('.areas__icon i'), aBg = $$('.areas__bg img');
  const digits = $$('.areas__digits b');
  let curArea = -1;
  const setArea = i => {
    if (i === curArea) return; curArea = i;
    list.forEach((li, k) => li.classList.toggle('is-on', k === i));
    icons.forEach((ic, k) => ic.classList.toggle('is-on', k === i));
    aBg.forEach((im, k) => im.classList.toggle('is-on', k === i));
    digits.forEach(d => d.style.setProperty('--a', i));
  };
  setArea(0);

  /* ---------- loop de scroll ---------- */
  const onFrame = () => {
    const y = scrollY, vh = innerHeight;
    if (heroVisible && !reduce) media.style.transform = 'translate3d(0,' + (y * .3) + 'px,0)';
    // manifesto
    const mr = mSec.getBoundingClientRect();
    if (mr.top < vh && mr.bottom > 0) {
      const p = Math.min(1, Math.max(0, -mr.top / (mr.height - vh) * 1.15));
      const on = Math.floor(p * words.length);
      words.forEach((w, k) => w.classList.toggle('on', k < on));
      mBg.style.setProperty('--py', ((p - .5) * -6) + '%'); mBg.style.setProperty('--sc', 1.05 + p * .08);
    }
    // áreas
    let best = 0;
    panels.forEach((pn, k) => { if (pn.getBoundingClientRect().top < vh * .55) best = k; });
    setArea(best);
    requestAnimationFrame(onFrame);
  };
  addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
  requestAnimationFrame(onFrame);

  /* ---------- balança ---------- */
  const sw = $('.switch'), beam = $('.balance__art svg');
  const setSide = side => {
    $$('button', sw).forEach(b => b.setAttribute('aria-selected', b.dataset.side === side));
    sw.classList.toggle('is-right', side === 'cont');
    $$('.balance__list').forEach(l => {
      l.hidden = l.dataset.list !== side;
      if (!l.hidden) $$('li', l).forEach(li => { li.style.animation = 'none'; li.offsetWidth; li.style.animation = ''; });
    });
    beam.style.setProperty('--tilt', side === 'prev' ? '-8deg' : '8deg');
  };
  $$('button', sw).forEach(b => b.addEventListener('click', () => { setSide(b.dataset.side); auto = false; }));
  let auto = true;
  new IntersectionObserver(es => {
    if (es[0].isIntersecting && auto) {
      setTimeout(() => auto && setSide('cont'), 1400);
      setTimeout(() => auto && setSide('prev'), 3200);
    }
  }, { threshold: .5 }).observe($('.balance'));

  /* ---------- formulário → WhatsApp ---------- */
  const form = $('.brief');
  $$('.area__cta').forEach(a => a.addEventListener('click', () => {
    const r = form.querySelector(`input[name=area][value="${a.dataset.area}"]`);
    if (r) r.checked = true;
  }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const nome = (fd.get('nome') || '').trim();
    const field = form.nome.closest('.field');
    if (!nome) { field.classList.add('err'); form.nome.focus(); return; }
    field.classList.remove('err');
    const area = fd.get('area') || 'Ainda não sei';
    const msg = (fd.get('msg') || '').trim();
    const txt = [
      `Olá, sou ${nome} e vim pelo site do Zanca Alonso Advogados.`,
      `Área: ${area}`,
      `Perfil: ${fd.get('perfil')}`,
      `Escritório: ${fd.get('cidade')}`,
      msg ? `\n${msg}` : ''
    ].join('\n').trim();
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
  });

  /* ---------- botão WhatsApp some no contato ---------- */
  const wa = $('.wa');
  new IntersectionObserver(es => wa.classList.toggle('is-off', es[0].isIntersecting), { threshold: .2 }).observe($('#contato'));

  $('[data-year]').textContent = new Date().getFullYear();
})();
