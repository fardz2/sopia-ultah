import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/birthday/date.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { birthdayState } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const stateAt = (date, preview = false) => birthdayState(Date.parse(date), preview);

test('the gift stays closed until the last second before midnight in Jakarta', () => {
  for (const date of ['2026-11-01T00:00:00+07:00', '2026-11-06T23:59:59+07:00']) {
    const state = stateAt(date);
    assert.equal(state.unlocked, false);
    assert.equal(state.today, false);
  }
  assert.equal(stateAt('2026-11-06T23:59:59+07:00').seconds, 1);
});

test('the gift opens exactly at 7 November 2026, 00.00 WIB', () => {
  const state = stateAt('2026-11-06T17:00:00Z');
  assert.equal(state.unlocked, true);
  assert.equal(state.today, true);
  assert.equal(state.days + state.hours + state.minutes + state.seconds, 0);
});

test('the keepsake stays open after the birthday and after the year changes', () => {
  for (const date of ['2026-11-08T00:00:00+07:00', '2027-01-01T00:00:00+07:00', '2028-06-01T00:00:00+07:00']) {
    const state = stateAt(date);
    assert.equal(state.unlocked, true);
    assert.equal(state.today, false);
  }
  assert.equal(stateAt('2026-11-08T00:00:00+07:00').days, 364);
});

test('the next birthday celebrates again without relocking its archive', () => {
  assert.equal(stateAt('2027-11-06T23:59:59+07:00').unlocked, true);
  assert.equal(stateAt('2027-11-07T00:00:00+07:00').today, true);
});

test('preview opens a marked simulation before release', () => {
  const state = stateAt('2026-11-01T00:00:00+07:00', true);
  assert.equal(state.unlocked, true);
  assert.equal(state.today, true);
  assert.equal(state.preview, true);
});
