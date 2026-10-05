export const STATUSES = ['todo', 'progress', 'done'] as const;
export const PRIORITIES = ['low', 'medium', 'high'] as const;
export type Status = typeof STATUSES[number];
export type Priority = typeof PRIORITIES[number];
export type Phase = 'focus' | 'break';
export const STATUS_LABELS: Record<Status, string> = { todo: 'To do', progress: 'In progress', done: 'Done' };

export interface TaskDraft { title: string; notes: string; dueDate: string; priority: Priority; status: Status }
export interface Task extends TaskDraft { id: string; createdAt: number; updatedAt: number }
export interface Session { id: string; taskId: string | null; taskTitle: string | null; durationMs: number; completedAt: number }
export interface Settings { theme: 'light' | 'dark'; focusMinutes: number; breakMinutes: number }
export interface Timer {
  id: string | null; phase: Phase; status: 'idle' | 'running' | 'paused' | 'complete';
  durationMs: number; remainingMs: number; endsAt: number | null;
  taskId: string | null; taskTitle: string | null;
}
export interface AppState { version: 1; tasks: Task[]; sessions: Session[]; settings: Settings; timer: Timer; demoLoaded: boolean }

export const defaultSettings: Settings = { theme: 'light', focusMinutes: 25, breakMinutes: 5 };
export const blankDraft = (status: Status = 'todo'): TaskDraft => ({ title: '', notes: '', dueDate: '', priority: 'medium', status });
export function freshTimer(settings: Settings, phase: Phase = 'focus', taskId: string | null = null): Timer {
  const durationMs = (phase === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60_000;
  return { id: null, phase, status: 'idle', durationMs, remainingMs: durationMs, endsAt: null, taskId, taskTitle: null };
}
export function initialState(): AppState {
  return { version: 1, tasks: [], sessions: [], settings: { ...defaultSettings }, timer: freshTimer(defaultSettings), demoLoaded: false };
}
export function localDate(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime()) && localDate(parsed) === value;
}
export function validateDraft(draft: TaskDraft): string | null {
  if (!draft.title.trim()) return 'Give your task a title.';
  if (draft.title.trim().length > 160) return 'Keep the title under 161 characters.';
  if (draft.notes.length > 4000) return 'Keep notes under 4,001 characters.';
  if (draft.dueDate && !validDate(draft.dueDate)) return 'Choose a valid due date.';
  if (!PRIORITIES.includes(draft.priority) || !STATUSES.includes(draft.status)) return 'Choose a valid priority and status.';
  return null;
}
export const isOverdue = (task: Task, today = localDate()): boolean => task.status !== 'done' && !!task.dueDate && task.dueDate < today;
export function remainingTime(timer: Timer, now: number): number {
  return timer.status === 'running' && timer.endsAt !== null ? Math.max(0, timer.endsAt - now) : timer.remainingMs;
}
export function reconcileTimer(state: AppState, now: number): AppState {
  const timer = state.timer;
  if (timer.status !== 'running' || timer.endsAt === null || timer.endsAt > now) return state;
  const session: Session | null = timer.phase === 'focus' && timer.id ? {
    id: timer.id, taskId: timer.taskId, taskTitle: timer.taskTitle, durationMs: timer.durationMs, completedAt: timer.endsAt,
  } : null;
  return {
    ...state,
    sessions: session && !state.sessions.some(item => item.id === session.id) ? [...state.sessions, session] : state.sessions,
    timer: { ...timer, status: 'complete', remainingMs: 0, endsAt: null },
  };
}
export type Action =
  | { type: 'task/add'; id: string; draft: TaskDraft }
  | { type: 'task/edit'; id: string; draft: TaskDraft }
  | { type: 'task/delete'; id: string }
  | { type: 'task/status'; id: string; status: Status }
  | { type: 'settings'; settings: Settings }
  | { type: 'demo' }
  | { type: 'timer/tick' }
  | { type: 'timer/start'; id: string }
  | { type: 'timer/pause' }
  | { type: 'timer/reset' }
  | { type: 'timer/phase'; phase: Phase }
  | { type: 'timer/task'; taskId: string | null };

export function reduceState(previous: AppState, action: Action, now = Date.now()): AppState {
  const state = reconcileTimer(previous, now);
  const timer = state.timer;
  switch (action.type) {
    case 'task/add':
      if (validateDraft(action.draft) || state.tasks.some(task => task.id === action.id)) return state;
      return { ...state, tasks: [...state.tasks, { ...action.draft, title: action.draft.title.trim(), id: action.id, createdAt: now, updatedAt: now }] };
    case 'task/edit':
      if (validateDraft(action.draft)) return state;
      return { ...state, tasks: state.tasks.map(task => task.id === action.id ? { ...task, ...action.draft, title: action.draft.title.trim(), updatedAt: now } : task) };
    case 'task/delete':
      return { ...state, tasks: state.tasks.filter(task => task.id !== action.id), timer: timer.status === 'idle' && timer.taskId === action.id ? { ...timer, taskId: null, taskTitle: null } : timer };
    case 'task/status':
      if (!STATUSES.includes(action.status)) return state;
      return { ...state, tasks: state.tasks.map(task => task.id === action.id ? { ...task, status: action.status, updatedAt: now } : task) };
    case 'settings': {
      const settings = action.settings;
      if (!['light', 'dark'].includes(settings.theme) || !validMinutes(settings.focusMinutes) || !validMinutes(settings.breakMinutes)) return state;
      return { ...state, settings, timer: timer.status === 'idle' ? freshTimer(settings, timer.phase, timer.taskId) : timer };
    }
    case 'demo': {
      if (state.demoLoaded) return state;
      const date = new Date(now);
      const today = localDate(date);
      date.setDate(date.getDate() + 1);
      const tomorrow = localDate(date);
      const demo: TaskDraft[] = [
        { title: 'Map out the week ahead', notes: 'Pick three things that would make this a great week. Leave some breathing room.', dueDate: today, priority: 'high', status: 'todo' },
        { title: 'Make space for a good idea', notes: 'A blank page, a fresh coffee, and a little time to think.', dueDate: '', priority: 'low', status: 'todo' },
        { title: 'Read a chapter', notes: 'Small steps add up. Spend a little time with the book on your desk.', dueDate: tomorrow, priority: 'medium', status: 'todo' },
        { title: 'Work on the personal project', notes: 'Start with one small piece. Progress is the goal.', dueDate: today, priority: 'high', status: 'progress' },
        { title: 'Clear the desk, clear the mind', notes: 'Keep the essentials. Put everything else in its place.', dueDate: '', priority: 'low', status: 'done' },
      ];
      return { ...state, demoLoaded: true, tasks: [...state.tasks, ...demo.map((draft, index) => ({ ...draft, id: `focusboard-demo-${index}`, createdAt: now, updatedAt: now })).filter(task => !state.tasks.some(existing => existing.id === task.id))] };
    }
    case 'timer/start': {
      if (timer.status === 'running') return state;
      const next = timer.status === 'complete' ? freshTimer(state.settings, timer.phase, timer.taskId) : timer;
      const task = state.tasks.find(task => task.id === next.taskId);
      return { ...state, timer: { ...next, id: next.id ?? action.id, status: 'running', endsAt: now + next.remainingMs, taskTitle: next.id ? next.taskTitle : task?.title ?? null, taskId: next.id ? next.taskId : task?.id ?? null } };
    }
    case 'timer/pause':
      return timer.status === 'running' ? { ...state, timer: { ...timer, status: 'paused', remainingMs: remainingTime(timer, now), endsAt: null } } : state;
    case 'timer/reset': return { ...state, timer: freshTimer(state.settings, timer.phase, state.tasks.some(task => task.id === timer.taskId) ? timer.taskId : null) };
    case 'timer/phase':
      return timer.status === 'running' || timer.status === 'paused' ? state : { ...state, timer: freshTimer(state.settings, action.phase, timer.taskId) };
    case 'timer/task':
      return timer.status !== 'idle' ? state : { ...state, timer: { ...timer, taskId: state.tasks.some(task => task.id === action.taskId) ? action.taskId : null } };
    case 'timer/tick': return state;
  }
}
export function validMinutes(value: unknown): value is number { return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 180; }
export function statistics(state: AppState, now = new Date()) {
  const completed = state.tasks.filter(task => task.status === 'done').length;
  const sessions = state.sessions.filter(session => localDate(new Date(session.completedAt)) === localDate(now));
  return { total: state.tasks.length, pending: state.tasks.length - completed, completed, sessions: sessions.length, minutes: Math.round(sessions.reduce((sum, session) => sum + session.durationMs, 0) / 60_000) };
}
