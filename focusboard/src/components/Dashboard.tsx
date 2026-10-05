import { useState } from 'react';
import { localDate, statistics, type AppState } from '../model';
import { Icon, type IconName } from './Icon';

export function Dashboard({ state, now }: { state: AppState; now: number }) {
  const stats = statistics(state, new Date(now));
  const cards: { label: string; value: number; icon: IconName; className: string; caption: string }[] = [
    { label: 'Total tasks', value: stats.total, icon: 'board', className: 'blue', caption: 'Everything on your board' },
    { label: 'Pending tasks', value: stats.pending, icon: 'clock', className: 'amber', caption: 'A little room for progress' },
    { label: 'Completed tasks', value: stats.completed, icon: 'circleCheck', className: 'green', caption: 'Small wins, well earned' },
    { label: 'Focus sessions', value: stats.sessions, icon: 'timer', className: 'purple', caption: 'Completed today' },
    { label: 'Focus minutes', value: stats.minutes, icon: 'spark', className: 'rose', caption: 'Time well spent today' },
  ];
  return <section className="stats-grid" aria-label="Your productivity statistics">{cards.map(card => <article className="stat-card" key={card.label}><div className="stat-top"><span>{card.label}</span><div className={`stat-icon ${card.className}`}><Icon name={card.icon} size={18} /></div></div><strong className="stat-value">{card.value}<span>{card.label === 'Focus minutes' ? 'min' : ''}</span></strong><p>{card.caption}</p></article>)}</section>;
}

export function SessionHistory({ state, now }: { state: AppState; now: number }) {
  const [limit, setLimit] = useState(5);
  const sorted = [...state.sessions].sort((a, b) => b.completedAt - a.completedAt);
  const today = localDate(new Date(now));
  return <section id="sessions" className="history-panel" aria-labelledby="history-title">
    <div className="section-heading"><div><h2 id="history-title"><Icon name="history" size={20} /> Focus history</h2><p>A record of time you made for what matters.</p></div><span className="history-total">{state.sessions.length} completed</span></div>
    {!sorted.length ? <div className="history-empty"><div className="history-empty-icon"><Icon name="leaf" size={26} /></div><div><h3>Your focus story starts here</h3><p>Finish your first focus session and we’ll save it here. One session at a time.</p></div><a className="text-button" href="#focus">Let’s focus <Icon name="arrow" size={17} /></a></div> : <><ul className="session-list">{sorted.slice(0, limit).map(session => { const date = new Date(session.completedAt); return <li key={session.id}><div className="session-icon"><Icon name="check" size={18} /></div><div className="session-detail"><strong>{session.taskTitle ?? 'Free focus'}</strong><span>{localDate(date) === today ? 'Today' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span></div><span className="session-duration">{Math.round(session.durationMs / 60_000)} min</span></li>; })}</ul>{sorted.length > limit && <button className="text-button history-more" onClick={() => setLimit(value => value + 10)}>Show more sessions <Icon name="plus" size={16} /></button>}</>}
  </section>;
}
