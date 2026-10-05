import { initialState, PRIORITIES, STATUSES, validDate, validMinutes, type AppState, type Session, type Task, type Timer } from './model';

export const STORAGE_KEY = 'focusboard:v1';
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void }
type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown, max: number): value is string => typeof value === 'string' && value.length <= max;
const id = (value: unknown): value is string => text(value, 200) && value.length > 0;
const timestamp = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 8.64e15;
const duration = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 60_000 && value <= 180 * 60_000;
function isTask(value: unknown): value is Task {
  return record(value) && id(value.id) && text(value.title, 160) && !!value.title.trim() && text(value.notes, 4000)
    && (value.dueDate === '' || validDate(value.dueDate)) && PRIORITIES.includes(value.priority as Task['priority'])
    && STATUSES.includes(value.status as Task['status']) && timestamp(value.createdAt) && timestamp(value.updatedAt);
}
function isSession(value: unknown): value is Session {
  return record(value) && id(value.id) && (value.taskId === null || id(value.taskId))
    && (value.taskTitle === null || text(value.taskTitle, 160)) && duration(value.durationMs) && timestamp(value.completedAt);
}
function isTimer(value: unknown): value is Timer {
  if (!record(value) || !['focus', 'break'].includes(value.phase as string)
    || !['idle', 'running', 'paused', 'complete'].includes(value.status as string)
    || !duration(value.durationMs) || typeof value.remainingMs !== 'number' || !Number.isFinite(value.remainingMs)
    || value.remainingMs < 0 || value.remainingMs > value.durationMs
    || !(value.taskId === null || id(value.taskId)) || !(value.taskTitle === null || text(value.taskTitle, 160))) return false;
  if (value.status === 'idle') return value.id === null && value.endsAt === null && value.remainingMs === value.durationMs;
  if (!id(value.id)) return false;
  if (value.status === 'running') return timestamp(value.endsAt) && value.remainingMs > 0;
  return value.endsAt === null && (value.status === 'complete' ? value.remainingMs === 0 : value.remainingMs > 0);
}
export interface LoadResult { state: AppState; warning: string | null }
export function decodeState(raw: string | null): LoadResult {
  const state = initialState();
  if (raw === null) return { state, warning: null };
  try {
    const saved: unknown = JSON.parse(raw);
    if (!record(saved) || saved.version !== 1) throw new Error('Unsupported data');
    let repaired = false;
    function collection<T extends { id: string }>(value: unknown, validate: (item: unknown) => item is T): T[] {
      if (!Array.isArray(value)) { repaired = true; return []; }
      const seen = new Set<string>();
      return value.filter((item): item is T => {
        if (!validate(item) || seen.has(item.id)) { repaired = true; return false; }
        seen.add(item.id); return true;
      });
    }
    state.tasks = collection(saved.tasks, isTask);
    state.sessions = collection(saved.sessions, isSession);
    if (record(saved.settings)) {
      if (saved.settings.theme === 'light' || saved.settings.theme === 'dark') state.settings.theme = saved.settings.theme; else repaired = true;
      for (const key of ['focusMinutes', 'breakMinutes'] as const) {
        if (validMinutes(saved.settings[key])) state.settings[key] = saved.settings[key]; else repaired = true;
      }
    } else repaired = true;
    if (isTimer(saved.timer)) state.timer = saved.timer; else {
      state.timer.durationMs = state.timer.remainingMs = state.settings.focusMinutes * 60_000;
      repaired = true;
    }
    state.demoLoaded = saved.demoLoaded === true;
    return { state, warning: repaired ? 'Some saved data was invalid. Valid tasks and sessions were recovered; invalid entries were skipped.' : null };
  } catch {
    return { state, warning: 'Saved data could not be read. A fresh board is available. Existing browser data will only be replaced when you make a change.' };
  }
}
export function loadState(storage: StoragePort): LoadResult {
  try { return decodeState(storage.getItem(STORAGE_KEY)); }
  catch { return { state: initialState(), warning: 'Browser storage is unavailable. Changes may be lost when you close or reload this page.' }; }
}
export function saveState(storage: StoragePort, state: AppState): string | null {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return null; }
  catch { return 'Could not save your changes. Keep this page open and allow browser storage or free up space, then retry saving.'; }
}
