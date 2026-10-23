(() => {
  // Toast + copiar cupom/e-mail
  const toast = document.querySelector('.toast');
  let t;
  const show = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(t);
    t = setTimeout(() => toast.classList.remove('show'), 1800);
  };
  const copy = async (v) => {
    try { await navigator.clipboard.writeText(v); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = v; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch {}
      ta.remove();
    }
  };
  document.querySelectorAll('[data-copy]').forEach((b) => {
    b.addEventListener('click', async () => {
      await copy(b.dataset.copy);
      show(`Copiado: ${b.dataset.copy}`);
    });
  });

  // Marca: copia o cupom e vai para a página de redirecionamento
  document.querySelectorAll('[data-go]').forEach((a) => {
    a.addEventListener('click', async (e) => {
      e.preventDefault();
      await copy(a.dataset.go);
      show(`Cupom ${a.dataset.go} copiado`);
      setTimeout(() => { location.href = a.getAttribute('href'); }, 450);
    });
  });

  // Abas Cupons / Provador
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const setTab = (name) => tabs.forEach((t) => {
    const on = t.dataset.tab === name;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on);
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  tabs.forEach((t) => t.addEventListener('click', () => setTab(t.dataset.tab)));
  document.querySelectorAll('[data-tab-link]').forEach((a) =>
    a.addEventListener('click', () => setTab(a.dataset.tabLink)));

  // Modal estilo post do Instagram
  const posts = [...document.querySelectorAll('.post')];
  const modal = document.getElementById('modal');
  const media = document.getElementById('modal-media');
  const caption = document.getElementById('modal-caption');
  const count = document.getElementById('modal-count');
  let idx = 0, lastFocus = null, videoUrl = null;

  const render = () => {
    const p = posts[idx].dataset;
    media.textContent = '';
    if (p.video) {
      const v = document.createElement('video');
      ['controls', 'autoplay', 'muted', 'loop', 'playsinline'].forEach((a) => v.setAttribute(a, ''));
      v.muted = true; v.playsInline = true; v.poster = p.poster; v.preload = 'auto';
      media.appendChild(v);
      const play = () => { const r = v.play(); if (r) r.catch(() => {}); };
      if (!videoUrl) {
        videoUrl = fetch(p.video).then((r) => (r.ok ? r.blob() : Promise.reject()))
          .then((b) => URL.createObjectURL(b)).catch(() => p.video);
      }
      videoUrl.then((u) => { if (v.isConnected) { v.src = u; play(); } });
    } else {
      const pic = document.createElement('picture');
      const s = document.createElement('source');
      s.srcset = `img/${p.full}-full.webp`; s.type = 'image/webp';
      const img = document.createElement('img');
      img.src = `img/${p.full}-full.jpg`; img.alt = p.caption || '';
      pic.append(s, img); media.appendChild(pic);
    }
    caption.textContent = p.caption || '';
    count.textContent = `${idx + 1} / ${posts.length}`;
  };
  const open = (i) => {
    idx = i; lastFocus = document.activeElement;
    render();
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('open'));
    modal.querySelector('.close').focus();
  };
  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; media.textContent = ''; }, 250);
    lastFocus && lastFocus.focus();
  };
  const go = (d) => { idx = (idx + d + posts.length) % posts.length; render(); };

  posts.forEach((p, i) => p.addEventListener('click', () => open(i)));
  modal.querySelector('.close').addEventListener('click', close);
  modal.querySelector('.prev').addEventListener('click', () => go(-1));
  modal.querySelector('.next').addEventListener('click', () => go(1));
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });
  // Arrastar para o lado no celular
  let x0 = null;
  media.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  media.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    x0 = null;
  });
})();
