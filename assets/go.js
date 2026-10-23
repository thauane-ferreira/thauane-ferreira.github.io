(() => {
  const toast = document.querySelector('.toast');
  const b = document.querySelector('[data-copy]');
  if (!b) return;
  b.addEventListener('click', async () => {
    const v = b.dataset.copy;
    try { await navigator.clipboard.writeText(v); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = v; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch {}
      ta.remove();
    }
    toast.textContent = `Copiado: ${v}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  });
})();
