import { describe, expect, it } from 'vitest';
import { blankDraft, initialState, isOverdue, localDate, reconcileTimer, reduceState, remainingTime, statistics, validDate, validateDraft, type AppState } from '../../src/model';
import { decodeState } from '../../src/persistence';

const now = new Date(2026, 9, 5, 9).getTime();
const draft = { ...blankDraft(), title: '  Write a chapter  ', notes: 'First draft', dueDate: '2026-10-04' };
const withTask = () => reduceState(initialState(), { type: 'task/add', id: 'task-1', draft }, now);
const running = (state: AppState = initialState()) => reduceState(state, { type: 'timer/start', id: 'session-1' }, now);

describe('task changes', () => {
  it('creates a trimmed task with all fields and timestamps', () => {
    expect(withTask().tasks).toEqual([{ ...draft, title: 'Write a chapter', id: 'task-1', createdAt: now, updatedAt: now }]);
  });
  it('rejects empty and whitespace-only titles, invalid dates, and oversized notes', () => {
    for (const title of ['', '  \n\t ']) expect(reduceState(initialState(), { type: 'task/add', id: 'x', draft: { ...draft, title } }).tasks).toEqual([]);
    expect(validateDraft({ ...draft, dueDate: '2026-02-30' })).toBeTruthy();
    expect(validateDraft({ ...draft, notes: 'a'.repeat(4001) })).toBeTruthy();
    expect(validateDraft({ ...draft, title: 'a'.repeat(161) })).toBeTruthy();
  });
  it('edits fields without changing identity or creation time', () => {
    const result = reduceState(withTask(), { type: 'task/edit', id: 'task-1', draft: { ...draft, title: 'Edited', notes: '', priority: 'high', dueDate: '', status: 'progress' } }, now + 10);
    expect(result.tasks[0]).toMatchObject({ id: 'task-1', createdAt: now, updatedAt: now + 10, title: 'Edited', notes: '', priority: 'high', dueDate: '', status: 'progress' });
  });
  it('moves through all statuses and calculates real totals', () => {
    let state = withTask();
    expect(statistics(state)).toMatchObject({ total: 1, pending: 1, completed: 0 });
    state = reduceState(state, { type: 'task/status', id: 'task-1', status: 'progress' });
    expect(state.tasks[0].status).toBe('progress');
    state = reduceState(state, { type: 'task/status', id: 'task-1', status: 'done' });
    expect(statistics(state)).toMatchObject({ total: 1, pending: 0, completed: 1 });
  });
  it('deletes only the requested task', () => {
    let state = reduceState(withTask(), { type: 'task/add', id: 'task-2', draft });
    state = reduceState(state, { type: 'task/delete', id: 'task-1' });
    expect(state.tasks.map(task => task.id)).toEqual(['task-2']);
  });
  it('does not add duplicate task IDs or apply an invalid edit', () => {
    const state = withTask();
    expect(reduceState(state, { type: 'task/add', id: 'task-1', draft })).toBe(state);
    expect(reduceState(state, { type: 'task/edit', id: 'task-1', draft: { ...draft, title: ' ' } })).toBe(state);
  });
  it('marks only unfinished tasks strictly before the local current date overdue', () => {
    const task = withTask().tasks[0];
    expect(isOverdue(task, '2026-10-05')).toBe(true);
    expect(isOverdue(task, '2026-10-04')).toBe(false);
    expect(isOverdue({ ...task, status: 'done' }, '2026-10-05')).toBe(false);
    expect(isOverdue({ ...task, dueDate: '' }, '2026-10-05')).toBe(false);
  });
  it('appends demo tasks once without replacing user data or adding fake sessions', () => {
    const state = reduceState(withTask(), { type: 'demo' }, now);
    expect(state.tasks[0]).toEqual(withTask().tasks[0]);
    expect(state.tasks.length).toBe(6);
    expect(state.sessions).toEqual([]);
    expect(reduceState(state, { type: 'demo' }, now)).toBe(state);
    const deleted = reduceState(state, { type: 'task/delete', id: 'focusboard-demo-0' });
    expect(reduceState(deleted, { type: 'demo' })).toBe(deleted);
  });
});

describe('timestamp timer', () => {
  it('defaults to 25 minutes focus and 5 minutes break', () => {
    expect(initialState().timer.remainingMs).toBe(25 * 60_000);
    expect(reduceState(initialState(), { type: 'timer/phase', phase: 'break' }).timer.remainingMs).toBe(5 * 60_000);
  });
  it('derives time from the deadline even when no interval ticks run', () => {
    const state = running();
    expect(remainingTime(state.timer, now + 10 * 60_000)).toBe(15 * 60_000);
    expect(remainingTime(state.timer, now + 2 * 60 * 60_000)).toBe(0);
  });
  it('pauses and resumes using the exact remaining milliseconds and same session ID', () => {
    const paused = reduceState(running(), { type: 'timer/pause' }, now + 30_250);
    expect(paused.timer).toMatchObject({ status: 'paused', remainingMs: 1_469_750, endsAt: null });
    expect(remainingTime(paused.timer, now + 500_000)).toBe(1_469_750);
    const resumed = reduceState(paused, { type: 'timer/start', id: 'ignored-id' }, now + 500_000);
    expect(resumed.timer.id).toBe('session-1');
    expect(resumed.timer.endsAt).toBe(now + 500_000 + 1_469_750);
  });
  it('records a completed focus session exactly once across repeated ticks and reloads', () => {
    const state = running();
    const complete = reconcileTimer(state, now + 25 * 60_000);
    expect(complete.sessions).toHaveLength(1);
    expect(complete.timer).toMatchObject({ status: 'complete', endsAt: null, remainingMs: 0 });
    let reloaded = decodeState(JSON.stringify(complete)).state;
    for (let tick = 0; tick < 10; tick++) reloaded = reduceState(reloaded, { type: 'timer/tick' }, now + 60 * 60_000);
    expect(reloaded.sessions).toHaveLength(1);
    expect(reloaded.timer.status).toBe('complete');
  });
  it('deduplicates an already recorded session against a stale running timer', () => {
    const state = running();
    const complete = reconcileTimer(state, now + 25 * 60_000);
    expect(reconcileTimer({ ...state, sessions: complete.sessions }, now + 25 * 60_000).sessions).toHaveLength(1);
  });
  it('finishes expired persisted timers at their actual deadline, not reopen time', () => {
    const state = decodeState(JSON.stringify(running())).state;
    const complete = reconcileTimer(state, now + 48 * 60 * 60_000);
    expect(complete.sessions[0].completedAt).toBe(now + 25 * 60_000);
    expect(statistics(complete, new Date(now + 48 * 60 * 60_000)).sessions).toBe(0);
  });
  it('reconciles completion before a late pause or reset', () => {
    const paused = reduceState(running(), { type: 'timer/pause' }, now + 25 * 60_000);
    expect(paused.sessions).toHaveLength(1);
    expect(paused.timer.status).toBe('complete');
    const reset = reduceState(running(), { type: 'timer/reset' }, now + 25 * 60_000);
    expect(reset.sessions).toHaveLength(1);
    expect(reset.timer.status).toBe('idle');
  });
  it('reset discards partial time without recording a session', () => {
    const state = reduceState(running(), { type: 'timer/reset' }, now + 60_000);
    expect(state.sessions).toEqual([]);
    expect(state.timer).toMatchObject({ id: null, status: 'idle', remainingMs: 25 * 60_000 });
  });
  it('completes breaks without recording focus time or starting the next timer', () => {
    const state = running(reduceState(initialState(), { type: 'timer/phase', phase: 'break' }));
    const complete = reconcileTimer(state, now + 5 * 60_000);
    expect(complete.sessions).toEqual([]);
    expect(complete.timer).toMatchObject({ phase: 'break', status: 'complete', endsAt: null });
  });
  it('prevents mode or association changes while active', () => {
    const state = running();
    expect(reduceState(state, { type: 'timer/phase', phase: 'break' }, now)).toBe(state);
    expect(reduceState(state, { type: 'timer/task', taskId: 'task-1' }, now)).toBe(state);
    expect(reduceState(state, { type: 'timer/start', id: 'duplicate' }, now)).toBe(state);
  });
  it('keeps history and task title snapshots when tasks are edited or deleted', () => {
    let state = reduceState(withTask(), { type: 'timer/task', taskId: 'task-1' }, now);
    state = running(state);
    state = reduceState(state, { type: 'task/edit', id: 'task-1', draft: { ...draft, title: 'New title' } }, now);
    state = reduceState(state, { type: 'task/delete', id: 'task-1' }, now);
    state = reconcileTimer(state, now + 25 * 60_000);
    expect(state.sessions[0]).toMatchObject({ taskId: 'task-1', taskTitle: 'Write a chapter' });
  });
  it('applies duration settings to idle and future sessions, preserving active sessions', () => {
    const settings = { theme: 'dark' as const, focusMinutes: 50, breakMinutes: 10 };
    expect(reduceState(initialState(), { type: 'settings', settings }).timer.durationMs).toBe(50 * 60_000);
    const state = reduceState(running(), { type: 'settings', settings }, now);
    expect(state.timer.durationMs).toBe(25 * 60_000);
    expect(reduceState(state, { type: 'timer/reset' }, now).timer.durationMs).toBe(50 * 60_000);
    expect(reduceState(state, { type: 'settings', settings: { ...settings, focusMinutes: 0 } }, now)).toBe(state);
  });
  it('counts the user’s local calendar date including midnight boundaries', () => {
    const today = new Date(2026, 9, 5, 0, 5);
    const state = initialState();
    state.sessions = [new Date(2026, 9, 4, 23, 59), new Date(2026, 9, 5, 0, 1), new Date(2026, 9, 5, 23, 59)].map((date, i) => ({ id: `${i}`, taskId: null, taskTitle: null, durationMs: 25 * 60_000, completedAt: date.getTime() }));
    expect(localDate(today)).toBe('2026-10-05');
    expect(statistics(state, today)).toMatchObject({ sessions: 2, minutes: 50 });
    expect(validDate('2024-02-29')).toBe(true);
    expect(validDate('2026-02-29')).toBe(false);
  });
});
