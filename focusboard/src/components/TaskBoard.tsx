import { useState } from 'react';
import { isOverdue, localDate, PRIORITIES, STATUSES, STATUS_LABELS, type Priority, type Status, type Task } from '../model';
import { Icon } from './Icon';

export function TaskBoard({ tasks, now, onNew, onEdit, onDelete, onStatus }: { tasks: Task[]; now: number; onNew: (status: Status) => void; onEdit: (task: Task) => void; onDelete: (task: Task) => void; onStatus: (id: string, status: Status) => void }) {
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState<Priority | 'all'>('all');
  const filtered = tasks.filter(task => task.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) && (priority === 'all' || task.priority === priority));
  const filtering = !!query.trim() || priority !== 'all';
  const today = localDate(new Date(now));
  return <section id="board" className="board-section" aria-labelledby="board-title">
    <div className="section-heading"><div><h2 id="board-title">Your task board <span className="subtle-count">{tasks.length}</span></h2><p>A clear view of what’s next.</p></div><button className="button primary" onClick={() => onNew('todo')}><Icon name="plus" size={18} /> New task</button></div>
    <div className="board-toolbar">
      <div className="search-field"><Icon name="search" size={18} /><label className="sr-only" htmlFor="task-search">Search tasks by title</label><input id="task-search" type="search" placeholder="Search tasks…" value={query} onChange={event => setQuery(event.target.value)} /></div>
      <div className="priority-filter"><Icon name="filter" size={18} /><label className="sr-only" htmlFor="priority-filter">Filter by priority</label><select id="priority-filter" value={priority} onChange={event => setPriority(event.target.value as Priority | 'all')}><option value="all">All priorities</option>{PRIORITIES.map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)} priority</option>)}</select></div>
    </div>
    {filtering && <div className="filter-summary" role="status">Showing {filtered.length} of {tasks.length} tasks<button className="text-button" onClick={() => { setQuery(''); setPriority('all'); }}>Clear filters</button></div>}
    <div className="board-columns">
      {STATUSES.map(status => {
        const columnTasks = filtered.filter(task => task.status === status);
        return <section className={`board-column ${status}`} key={status} aria-labelledby={`column-${status}`}>
          <div className="column-heading"><h3 id={`column-${status}`}><span className="status-dot" />{STATUS_LABELS[status]} <span className="column-count">{columnTasks.length}</span></h3><button className="icon-button small" aria-label={`Add task to ${STATUS_LABELS[status]}`} onClick={() => onNew(status)}><Icon name="plus" size={17} /></button></div>
          <div className="column-tasks">
            {columnTasks.map(task => <TaskCard key={task.id} task={task} today={today} onEdit={onEdit} onDelete={onDelete} onStatus={onStatus} />)}
            {!columnTasks.length && <div className="column-empty"><div className="empty-symbol"><Icon name={status === 'done' ? 'circleCheck' : status === 'progress' ? 'spark' : 'board'} size={24} /></div><strong>{filtering ? 'No matching tasks' : status === 'done' ? 'Good things take a little focus' : status === 'progress' ? 'One thing at a time' : 'A fresh start'}</strong><p>{filtering ? 'Try another search or priority.' : status === 'done' ? 'Your completed tasks will land here.' : status === 'progress' ? 'Move a task here when you’re ready to begin.' : 'Give your next idea a place to start.'}</p></div>}
          </div>
          <button className="add-to-column" onClick={() => onNew(status)}><Icon name="plus" size={16} /> Add task</button>
        </section>;
      })}
    </div>
    <p className="board-hint"><Icon name="spark" size={15} /> A little progress every day goes a long way.</p>
  </section>;
}

function TaskCard({ task, today, onEdit, onDelete, onStatus }: { task: Task; today: string; onEdit: (task: Task) => void; onDelete: (task: Task) => void; onStatus: (id: string, status: Status) => void }) {
  const overdue = isOverdue(task, today);
  const dateLabel = task.dueDate === today ? 'Today' : task.dueDate ? new Date(`${task.dueDate}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(task.dueDate.slice(0, 4) !== today.slice(0, 4) ? { year: 'numeric' as const } : {}) }) : '';
  return <article className={`task-card ${overdue ? 'overdue' : ''} ${task.status === 'done' ? 'task-complete' : ''}`} aria-label={task.title}>
    <div className="task-top"><span className={`priority-badge ${task.priority}`}><span />{task.priority} priority</span><div className="task-actions"><button className="icon-button small" aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}><Icon name="edit" size={15} /></button><button className="icon-button small delete-button" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task)}><Icon name="trash" size={15} /></button></div></div>
    <h4>{task.status === 'done' && <Icon name="check" size={16} />}{task.title}</h4>
    {task.notes && <p className="task-notes">{task.notes}</p>}
    {dateLabel && <div className={`task-due ${overdue ? 'overdue-text' : ''}`}><Icon name="calendar" size={14} /><span>{overdue ? `Overdue · ${dateLabel}` : dateLabel}</span></div>}
    <div className="task-footer"><label className="sr-only" htmlFor={`status-${task.id}`}>Status for {task.title}</label><select id={`status-${task.id}`} value={task.status} onChange={event => onStatus(task.id, event.target.value as Status)}>{STATUSES.map(status => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select><Icon name={task.status === 'done' ? 'circleCheck' : 'arrow'} size={16} /></div>
  </article>;
}
