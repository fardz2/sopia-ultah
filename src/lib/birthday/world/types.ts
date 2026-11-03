import type { BookState } from './bookState';
export type StoryChapter = 'opening' | 'teaser' | 'frame' | 'iris' | 'gallery' | 'book' | 'wishes' | 'closing';
export type RitualPhase = 'sealed' | 'opening' | 'letter' | 'candle' | 'finale';
export type WorldStatus = 'idle' | 'loading' | 'ready' | 'failed';
export interface ScreenRect { x: number; y: number; width: number; height: number }
export interface WorldLayout {
  width: number; height: number; dpr: number; mobile: boolean; portrait: boolean;
  targets: Partial<Record<'portrait' | 'book' | 'letter' | 'candle' | 'finale', ScreenRect>>;
}
export interface WorldSnapshot {
  unlocked: boolean; hidden: boolean;
  story: { chapter: StoryChapter; progress: number };
  ritual: { open: boolean; phase: RitualPhase; revision: number; blow: number; replay: number };
  book: BookState & { zoom: number; loupe: { on: boolean; u: number; v: number }; videoPlaying: boolean };
}
export interface WorldCallbacks {
  onStatus(status: WorldStatus): void;
  onBookTurnEnd(id: number): void;
  onBookProjection(rects: { spread: ScreenRect | null; video: ScreenRect | null }): void;
}
export interface WorldDriver { update(snapshot: WorldSnapshot): void; resize(layout: WorldLayout): void; destroy(): void }
