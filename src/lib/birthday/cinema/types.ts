export type CinemaMode = 'gallery' | 'book' | 'candle';
export interface CinemaPhoto {
  src: string;
  alt: string;
}
export interface Composition {
  update(progress: number, aspect: number): void;
  resize?(): void;
}
export interface CinemaDriver {
  update(progress: number): void;
  resize(): void;
  setPaused(paused: boolean): void;
  destroy(): void;
}
export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const range = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
export const smooth = (value: number) => value * value * (3 - 2 * value);
