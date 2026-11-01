import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

interface Options {
  delay?: number;
  reduced?: boolean;
}

export function letterDrop(_node: Element, { delay = 0, reduced = false }: Options = {}): TransitionConfig {
  return {
    delay: reduced ? 0 : delay * 1000,
    duration: reduced ? 0 : 360,
    easing: cubicOut,
    css: (_progress, remaining) => `transform:translate3d(0,${-135 * remaining}%,0)`,
  };
}

export function wordArrival(_node: Element, { delay = 0, reduced = false }: Options = {}): TransitionConfig {
  return {
    delay: reduced ? 0 : delay * 1000,
    duration: reduced ? 0 : 420,
    easing: cubicOut,
    css: (progress, remaining) =>
      `opacity:${0.3 + progress * 0.7};transform:translate3d(0,${remaining * 0.4}em,0)`,
  };
}

export function paperCurtain(_node: Element, { reduced = false }: Options = {}): TransitionConfig {
  return {
    delay: reduced ? 0 : 80,
    duration: reduced ? 0 : 640,
    easing: cubicOut,
    css: (_progress, remaining) => `transform:translate3d(0,${-101 * remaining}%,0)`,
  };
}

export function letterLift(_node: Element, { reduced = false }: Options = {}): TransitionConfig {
  return {
    duration: reduced ? 0 : 300,
    easing: cubicOut,
    css: (progress, remaining) => `opacity:${progress};transform:translate3d(0,${remaining * 24}px,0)`,
  };
}

export function counterFold(_node: Element, { reduced = false }: Options = {}): TransitionConfig {
  return {
    duration: reduced ? 0 : 240,
    easing: cubicOut,
    css: (progress, remaining) =>
      `opacity:${progress};transform:perspective(500px) translateY(${-remaining * 14}px) rotateX(${-remaining * 80}deg);transform-origin:top`,
  };
}

export function inkReveal(_node: Element, { reduced = false }: Options = {}): TransitionConfig {
  return {
    delay: reduced ? 0 : 850,
    duration: reduced ? 0 : 1100,
    easing: cubicOut,
    css: (_progress, remaining) => `clip-path:inset(0 ${remaining * 100}% 0 0)`,
  };
}

export function photoGather(
  _node: Element,
  { index, reduced = false }: { index: number; reduced?: boolean },
): TransitionConfig {
  const angle = [-9, 8, -6, 7, -5, 6, -3][index];
  const x = (index % 2 ? 1 : -1) * (70 + index * 9),
    y = (index < 2 ? -1 : 1) * (36 + index * 8);
  return {
    delay: reduced ? 0 : index * 65,
    duration: reduced ? 0 : 850,
    easing: cubicOut,
    css: (progress, remaining) =>
      `opacity:${0.35 + progress * 0.65};transform:translate(-50%,-50%) translate3d(${x * remaining}px,${y * remaining}px,0) rotate(${angle + remaining * 18}deg)`,
  };
}
