import type { Attachment } from 'svelte/attachments';

export function reveal(delay = 0): Attachment<HTMLElement> {
  return (node) => {
    node.dataset.reveal = '';
    node.style.setProperty('--d', Math.min(delay, 0.18) + 's');
    if (!('IntersectionObserver' in window)) {
      node.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          node.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  };
}
