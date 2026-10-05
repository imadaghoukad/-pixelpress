import { describe, expect, it } from 'vitest';
import { blankDraft, initialState, reduceState } from '../../src/model';
import { decodeState, loadState, saveState, STORAGE_KEY, type StoragePort } from '../../src/persistence';
import { createStore } from '../../src/store';

function memoryStorage(): StoragePort {
  const values = new Map<string, string>();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
}
const add = { type: 'task/add' as const, id: 'one', draft: { ...blankDraft(), title: 'Persist me' } };

describe('persistence and recovery', () => {
  it('uses empty defaults for missing data', () => { expect(loadState(memoryStorage())).toEqual({ state: initialState(), warning: null }); });
  it('round trips tasks, settings, timer, and session history', () => {
    const storage = memoryStorage();
    let state = reduceState(initialState(), add, 1_000);
    state = reduceState(state, { type: 'settings', settings: { theme: 'dark', focusMinutes: 30, breakMinutes: 6 } }, 1_000);
    state = reduceState(state, { type: 'timer/start', id: 'session' }, 1_000);
    state = reduceState(state, { type: 'timer/tick' }, 1_801_000);
    expect(saveState(storage, state)).toBeNull();
    expect(loadState(storage)).toEqual({ state, warning: null });
  });
  it.each(['{broken', 'null', '[]', '23', '{"version":99}'])('recovers safely from invalid root data: %s', raw => {
    const result = decodeState(raw);
    expect(result.state).toEqual(initialState());
    expect(result.warning).toBeTruthy();
  });
  it('preserves valid records while dropping malformed and duplicate records', () => {
    const state = reduceState(initialState(), add);
    const result = decodeState(JSON.stringify({ ...state, tasks: [...state.tasks, state.tasks[0], null, { id: 'bad' }], sessions: [false], timer: { status: 'running', endsAt: 'soon' }, settings: { theme: 'dark', focusMinutes: -1, breakMinutes: 7 } }));
    expect(result.state.tasks).toEqual(state.tasks);
    expect(result.state.sessions).toEqual([]);
    expect(result.state.settings).toEqual({ theme: 'dark', focusMinutes: 25, breakMinutes: 7 });
    expect(result.state.timer.status).toBe('idle');
    expect(result.warning).toBeTruthy();
  });
  it('rejects inconsistent timers so malformed data cannot create fake completions', () => {
    const state = initialState();
    const corruptions = [
      { ...state.timer, status: 'running', id: null, endsAt: 1 },
      { ...state.timer, status: 'running', id: 'x', endsAt: -1 },
      { ...state.timer, status: 'paused', id: 'x', remainingMs: 0 },
      { ...state.timer, status: 'complete', id: 'x', remainingMs: 50 },
      { ...state.timer, durationMs: 0 },
    ];
    for (const timer of corruptions) expect(decodeState(JSON.stringify({ ...state, timer })).state.timer).toEqual(state.timer);
  });
  it('does not write while merely reading malformed data', () => {
    const storage = memoryStorage(); storage.setItem(STORAGE_KEY, 'broken');
    const store = createStore(storage);
    expect(store.getSnapshot().warning).toBeTruthy();
    expect(storage.getItem(STORAGE_KEY)).toBe('broken');
  });
  it('reports read and write failures without throwing', () => {
    const broken: StoragePort = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('quota'); } };
    expect(loadState(broken).warning).toMatch(/unavailable/);
    expect(saveState(broken, initialState())).toMatch(/Could not save/);
  });
});

describe('store transactions', () => {
  it('preserves changes across new store instances', async () => {
    const storage = memoryStorage(); const store = createStore(storage);
    await store.dispatch(add);
    expect(createStore(storage).getSnapshot().state.tasks[0].title).toBe('Persist me');
  });
  it('retains in-memory changes during storage failures and supports retry', async () => {
    const storage = memoryStorage(); let failing = true;
    const unreliable = { ...storage, setItem: (key: string, value: string) => { if (failing) throw new Error('quota'); storage.setItem(key, value); } };
    const store = createStore(unreliable);
    await store.dispatch(add);
    await store.dispatch({ ...add, id: 'two' });
    expect(store.getSnapshot().state.tasks).toHaveLength(2);
    expect(store.getSnapshot().unsaved).toBe(true);
    failing = false; store.retry();
    expect(store.getSnapshot().warning).toBeNull();
    expect(loadState(storage).state.tasks).toHaveLength(2);
  });
  it('retains existing data when reads become unavailable after a successful save', async () => {
    const storage = memoryStorage(); let failing = false;
    const store = createStore({ ...storage, getItem: key => { if (failing) throw new Error('denied'); return storage.getItem(key); } });
    await store.dispatch(add); failing = true;
    await store.dispatch({ ...add, id: 'two' });
    expect(store.getSnapshot().state.tasks).toHaveLength(2);
  });
  it('re-reads the newest saved state before mutations in separate tabs', async () => {
    const storage = memoryStorage(); const a = createStore(storage); const b = createStore(storage);
    await a.dispatch(add);
    await b.dispatch({ ...add, id: 'two' });
    a.refresh();
    expect(a.getSnapshot().state.tasks).toHaveLength(2);
  });
  it('records only one completion when two tabs finish the same timer', async () => {
    const storage = memoryStorage(); let now = 10_000;
    let queue: Promise<unknown> = Promise.resolve();
    const lock = <T>(callback: () => T): Promise<T> => { const result = queue.then(callback); queue = result; return result; };
    const a = createStore(storage, lock, () => now); const b = createStore(storage, lock, () => now);
    await a.dispatch({ type: 'timer/start', id: 'shared-session' });
    b.refresh(); now += 25 * 60_000;
    await Promise.all([a.dispatch({ type: 'timer/tick' }), b.dispatch({ type: 'timer/tick' })]);
    expect(loadState(storage).state.sessions).toHaveLength(1);
    a.refresh(); b.refresh();
    expect(a.getSnapshot().state.timer.status).toBe('complete');
    expect(b.getSnapshot().state.sessions).toHaveLength(1);
  });
});
