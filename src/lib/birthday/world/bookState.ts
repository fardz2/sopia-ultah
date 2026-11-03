export type Direction = 'next' | 'prev';
export interface BookTurn {
  id: number; from: number; to: number; direction: Direction; progress: number;
  animation: { from: number; to: 0 | 1; start: number; duration: number } | null;
}
export interface BookState { index: number; turn: BookTurn | null; nextId: number }
export type BookCommand =
  | { type: 'step'; direction: Direction; at: number }
  | { type: 'drag-start'; direction: Direction }
  | { type: 'drag'; progress: number }
  | { type: 'release'; commit: boolean; at: number }
  | { type: 'seek'; index: number }
  | { type: 'complete'; id: number }
  | { type: 'settle' };
const clamp = (v: number) => Math.max(0, Math.min(1, v));
export function sampleBookTurn(turn: BookTurn, now: number) {
  const a = turn.animation;
  if (!a) return { progress: turn.progress, done: false };
  const t = clamp((now - a.start) / a.duration);
  return { progress: a.from + (a.to - a.from) * (1 - (1 - t) ** 3), done: t >= 1 };
}
export function reduceBook(state: BookState, command: BookCommand, count: number): BookState {
  const wrap = (i: number) => ((i % count) + count) % count;
  const settled = () => state.turn
    ? { ...state, index: (state.turn.animation?.to ?? (state.turn.progress > 0.42 ? 1 : 0)) === 0 ? state.turn.from : state.turn.to, turn: null }
    : state;
  if (command.type === 'settle') return settled();
  if (command.type === 'seek') return { ...settled(), index: wrap(command.index) };
  if (command.type === 'complete') {
    if (state.turn?.id !== command.id) return state;
    return settled();
  }
  if (command.type === 'drag') return state.turn
    ? { ...state, turn: { ...state.turn, progress: clamp(command.progress), animation: null } } : state;
  if (command.type === 'release') {
    if (!state.turn) return state;
    const t = state.turn.progress, target = command.commit ? 1 : 0;
    return { ...state, turn: { ...state.turn, animation: {
      from: t, to: target, start: command.at,
      duration: Math.max(80, (target ? 280 : 180) * Math.abs(target - t)),
    } } };
  }
  const base = settled();
  const turn: BookTurn = { id: base.nextId, from: base.index,
    to: wrap(base.index + (command.direction === 'next' ? 1 : -1)), direction: command.direction,
    progress: 0, animation: command.type === 'step' ? { from: 0, to: 1, start: command.at, duration: 280 } : null };
  return { ...base, turn, nextId: base.nextId + 1 };
}
