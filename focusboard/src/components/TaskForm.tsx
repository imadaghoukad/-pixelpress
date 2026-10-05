import { useState, type FormEvent } from 'react';
import { blankDraft, PRIORITIES, STATUSES, STATUS_LABELS, validateDraft, type Status, type Task, type TaskDraft } from '../model';
import { Modal } from './Modal';

export function TaskForm({ task, status, onSave, onClose }: { task?: Task; status: Status; onSave: (draft: TaskDraft) => Promise<void>; onClose: () => void }) {
  const [draft, setDraft] = useState<TaskDraft>(task ?? blankDraft(status));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  function update<K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) { setDraft(current => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const error = validateDraft(draft);
    setError(error);
    if (error) { document.getElementById('task-title')?.focus(); return; }
    setSaving(true); await onSave(draft); onClose();
  }
  return <Modal title={task ? 'Edit task' : 'Make a little progress'} description={task ? 'Refine the details and keep moving forward.' : 'Every good day starts with a small next step.'} onClose={onClose}>
    <form onSubmit={submit} className="form-stack">
      <label htmlFor="task-title">Task title <span className="required">*</span></label>
      <input autoFocus id="task-title" placeholder="What would you like to work on?" maxLength={160} value={draft.title} onChange={event => update('title', event.target.value)} aria-invalid={!!error} aria-describedby={error ? 'task-error' : undefined} />
      {error && <p id="task-error" className="field-error" role="alert">{error}</p>}
      <label htmlFor="task-notes">Notes <span className="optional">optional</span></label>
      <textarea id="task-notes" placeholder="A few details to help you get started…" rows={4} maxLength={4000} value={draft.notes} onChange={event => update('notes', event.target.value)} />
      <div className="form-row">
        <div><label htmlFor="task-priority">Priority</label><select id="task-priority" value={draft.priority} onChange={event => update('priority', event.target.value as TaskDraft['priority'])}>{PRIORITIES.map(priority => <option key={priority} value={priority}>{priority[0].toUpperCase() + priority.slice(1)}</option>)}</select></div>
        <div><label htmlFor="task-due">Due date <span className="optional">optional</span></label><input id="task-due" type="date" min="0001-01-01" max="9999-12-31" value={draft.dueDate} onChange={event => update('dueDate', event.target.value)} /></div>
      </div>
      <label htmlFor="task-status">Status</label><select id="task-status" value={draft.status} onChange={event => update('status', event.target.value as Status)}>{STATUSES.map(status => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select>
      <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" type="submit" disabled={saving}>{saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button></div>
    </form>
  </Modal>;
}
