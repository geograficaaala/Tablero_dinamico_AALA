export function mountPageMotion(root = document) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return () => {};
  const container = root.querySelector('#mainWrap');
  if (!container) return () => {};
  let pending = false;
  let first = true;
  const refresh = () => {
    pending = false;
    if (first) { first = false; return; }
    container.classList.remove('aala-v2-fade-in');
    void container.offsetWidth;
    container.classList.add('aala-v2-fade-in');
  };
  const observer = new MutationObserver(records => {
    if (!records.some(record => [...record.addedNodes].some(node => node.nodeType === 1 && (node.id === 'fullView' || node.id === 'execView')))) return;
    if (!pending) { pending = true; requestAnimationFrame(refresh); }
  });
  observer.observe(container, {childList:true});
  return () => observer.disconnect();
}
