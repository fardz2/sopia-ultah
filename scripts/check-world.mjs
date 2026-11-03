import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const selected = process.argv[process.argv.indexOf('--case') + 1] || 'all';
async function moduleAt(name) {
  const source = await readFile(new URL(`../src/lib/birthday/world/${name}.ts`, import.meta.url), 'utf8');
  let { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  outputText = outputText.replace(/from ['"]three['"]/g, `from '${import.meta.resolve('three')}'`);
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
if (selected === 'state' || selected === 'all') {
  const { canShowChapter, resolveRitual } = await moduleAt('access');
  assert.equal(canShowChapter(false, 'gallery'), false);
  assert.equal(canShowChapter(false, 'teaser'), true);
  assert.equal(resolveRitual(false, true, 'letter'), null);
  const { reduceBook, sampleBookTurn } = await moduleAt('bookState');
  const fresh = () => ({ index: 0, turn: null, nextId: 1 });
  let state = reduceBook(fresh(), { type: 'step', direction: 'next', at: 0 }, 10);
  assert.equal(sampleBookTurn(state.turn, 280).done, true);
  state = reduceBook(state, { type: 'complete', id: state.turn.id }, 10);
  assert.equal(state.index, 1); assert.equal(state.turn, null);
  state = reduceBook(fresh(), { type: 'step', direction: 'next', at: 0 }, 10);
  const old = state.turn.id;
  state = reduceBook(state, { type: 'step', direction: 'next', at: 50 }, 10);
  assert.equal(state.turn.to, 2);
  assert.equal(reduceBook(state, { type: 'complete', id: old }, 10).turn.id, state.turn.id);
  assert.equal(reduceBook(fresh(), { type: 'step', direction: 'prev', at: 0 }, 10).turn.to, 9);
  state = reduceBook(fresh(), { type: 'drag-start', direction: 'next' }, 10);
  state = reduceBook(state, { type: 'drag', progress: .3 }, 10);
  state = reduceBook(state, { type: 'release', commit: false, at: 0 }, 10);
  state = reduceBook(state, { type: 'complete', id: state.turn.id }, 10);
  assert.equal(state.index, 0);
  console.log('PASS world access and book transactions (release, wrapping, cancellation, stale completion)');
}
