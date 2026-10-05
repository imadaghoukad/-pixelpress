import { useSyncExternalStore } from 'react';
import { reduceState, type Action, type AppState } from './model';
import { loadState, saveState, STORAGE_KEY, type StoragePort } from './persistence';

export interface StoreSnapshot { state: AppState; warning: string | null; unsaved: boolean }
type Lock = <T>(callback: () => T) => Promise<T>;

export function createStore(storage: StoragePort, lock: Lock = async callback => callback(), now = Date.now) {
  const loaded = loadState(storage);
  let snapshot: StoreSnapshot = { ...loaded, unsaved: false };
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach(listener => listener());
  let queue = Promise.resolve();
  function dispatch(action: Action): Promise<void> {
    // Serialize this tab as well as tabs using the same origin's Web Lock.
    queue = queue.then(() => lock(() => {
      const stored = snapshot.unsaved ? null : loadState(storage);
      const base = stored?.state ?? snapshot.state;
      const next = reduceState(base, action, now());
      if (next === base) return;
      const warning = saveState(storage, next);
      snapshot = { state: next, warning: warning ?? stored?.warning ?? (snapshot.unsaved ? null : snapshot.warning), unsaved: !!warning };
      notify();
    })).catch(() => {
      snapshot = { ...snapshot, warning: 'This change could not be applied. Please try again.' }; notify();
    });
    return queue;
  }
  function refresh() {
    if (snapshot.unsaved) return;
    const loaded = loadState(storage);
    snapshot = { ...loaded, unsaved: false }; notify();
  }
  function retry() {
    const warning = saveState(storage, snapshot.state);
    snapshot = { ...snapshot, warning, unsaved: !!warning }; notify();
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    dispatch, refresh, retry,
  };
}

const storage: StoragePort = {
  getItem: key => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
};
const lock: Lock = callback => navigator.locks ? navigator.locks.request('focusboard-state', callback) : Promise.resolve(callback());
export const store = createStore(storage, lock);
window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEY || event.key === null) { store.refresh(); void store.dispatch({ type: 'timer/tick' }); }
});
export const useStore = () => useSyncExternalStore(store.subscribe, store.getSnapshot);
