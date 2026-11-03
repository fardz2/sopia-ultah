import type { RitualPhase, StoryChapter } from './types';
export const canShowChapter = (unlocked: boolean, chapter: StoryChapter) =>
  unlocked || chapter === 'opening' || chapter === 'teaser';
export const resolveRitual = (unlocked: boolean, open: boolean, phase: RitualPhase) =>
  unlocked && open ? phase : null;
