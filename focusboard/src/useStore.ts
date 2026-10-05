import { useSyncExternalStore } from 'react';
import { createStore } from './store';
import { STORAGE_KEY } from './persistence';

export const store = createStore({
  getItem: key => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
}, callback => navigator.locks ? navigator.locks.request('focusboard-state', callback) : Promise.resolve(callback()));
window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEY || event.key === null) { store.refresh(); void store.dispatch({ type: 'timer/tick' }); }
});
export const useStore = () => useSyncExternalStore(store.subscribe, store.getSnapshot);
