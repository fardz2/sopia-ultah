import { reduceBook, type BookCommand, type BookState } from './bookState';
import type { RitualPhase, WorldStatus } from './types';
export class BirthdayExperience {
  book = $state.raw<BookState>({ index: 0, turn: null, nextId: 1 });
  zoom = $state(1);
  loupe = $state({ on: false, u: 0.3, v: 0.5 });
  videoPlaying = $state(false);
  greetingOpen = $state(false);
  phase = $state<RitualPhase>('sealed');
  blow = $state(0);
  replay = $state(0);
  worldStatus = $state<WorldStatus>('idle');
  dispatch(command: BookCommand) { this.book = reduceBook(this.book, command, 10); }
}
