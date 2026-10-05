import { remainingTime, type Action, type AppState } from '../model';
import { Icon } from './Icon';

export function FocusTimer({ state, now, dispatch, onSettings }: { state: AppState; now: number; dispatch: (action: Action) => void; onSettings: () => void }) {
  const timer = state.timer;
  const seconds = Math.ceil(remainingTime(timer, now) / 1000);
  const display = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const progress = Math.min(1, Math.max(0, 1 - remainingTime(timer, now) / timer.durationMs));
  const active = timer.status === 'running' || timer.status === 'paused';
  const deletedTask = timer.taskId && !state.tasks.some(task => task.id === timer.taskId);
  return <section className="focus-panel" id="focus" aria-labelledby="focus-title">
    <div className="focus-heading"><div className="eyebrow"><Icon name="timer" size={17} /> MAKE TIME FOR FOCUS</div><button className="icon-button" aria-label="Timer settings" onClick={onSettings}><Icon name="settings" size={18} /></button></div>
    <h2 id="focus-title">One task. Full attention.</h2><p className="muted">Settle in. You’ve got this.</p>
    <div className="timer-tabs" aria-label="Timer mode"><button aria-pressed={timer.phase === 'focus'} disabled={active} onClick={() => dispatch({ type: 'timer/phase', phase: 'focus' })}><Icon name="timer" size={15} /> Focus</button><button aria-pressed={timer.phase === 'break'} disabled={active} onClick={() => dispatch({ type: 'timer/phase', phase: 'break' })}><Icon name="leaf" size={15} /> Break</button></div>
    <div className={`timer-face ${timer.status === 'running' ? 'is-running' : ''}`}>
      <svg className="timer-ring" viewBox="0 0 220 220" aria-hidden="true"><circle className="ring-track" cx="110" cy="110" r="98" /><circle className="ring-progress" cx="110" cy="110" r="98" strokeDasharray={2 * Math.PI * 98} strokeDashoffset={2 * Math.PI * 98 * (1 - progress)} /></svg>
      <div className="timer-digits" role="timer" aria-label={`${timer.phase === 'focus' ? 'Focus' : 'Break'} time remaining`}><span>{display}</span><small>{timer.status === 'running' ? 'IN THE ZONE' : timer.status === 'paused' ? 'TAKE YOUR TIME' : timer.status === 'complete' ? 'NICELY DONE' : 'READY WHEN YOU ARE'}</small></div>
    </div>
    <div className="timer-message" role="status">{timer.status === 'complete' ? timer.phase === 'focus' ? 'Focus session complete. Time for a breather.' : 'Break complete. Ready for a fresh start?' : timer.status === 'paused' ? 'Paused. Pick up right where you left off.' : `${Math.round(timer.durationMs / 60_000)} minutes to ${timer.phase === 'focus' ? 'make a little progress' : 'rest and recharge'}.`}</div>
    <label htmlFor="session-task" className="timer-task-label">{timer.phase === 'focus' ? 'WORKING ON' : 'ASSOCIATED TASK'} <span>optional</span></label>
    <select id="session-task" value={timer.taskId ?? ''} disabled={timer.status !== 'idle'} onChange={event => dispatch({ type: 'timer/task', taskId: event.target.value || null })}><option value="">Free focus · no task</option>{deletedTask && <option value={timer.taskId!}>{timer.taskTitle ?? 'Removed task'} (deleted)</option>}{state.tasks.map(task => <option key={task.id} value={task.id}>{task.title}</option>)}</select>
    <div className="timer-controls"><button className="button primary" onClick={() => dispatch(timer.status === 'running' ? { type: 'timer/pause' } : { type: 'timer/start', id: crypto.randomUUID() })}><Icon name={timer.status === 'running' ? 'pause' : 'play'} size={18} />{timer.status === 'running' ? 'Pause' : timer.status === 'paused' ? 'Resume' : timer.phase === 'focus' ? 'Start focus' : 'Start break'}</button><button className="button secondary reset-button" aria-label="Reset timer" title="Reset timer" onClick={() => dispatch({ type: 'timer/reset' })}><Icon name="reset" size={19} /></button></div>
    <div className="timer-footnote"><span className="tiny-dot" />{state.settings.focusMinutes} min focus <span>·</span> {state.settings.breakMinutes} min break</div>
  </section>;
}
