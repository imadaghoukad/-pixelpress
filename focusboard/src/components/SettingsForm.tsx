import { useState, type FormEvent } from 'react';
import { validMinutes, type Settings } from '../model';
import { Modal } from './Modal';

export function SettingsForm({ settings, onSave, onClose }: { settings: Settings; onSave: (settings: Settings) => Promise<void>; onClose: () => void }) {
  const [draft, setDraft] = useState(settings);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!validMinutes(draft.focusMinutes) || !validMinutes(draft.breakMinutes)) { setError('Choose whole minutes between 1 and 180.'); return; }
    await onSave(draft); onClose();
  }
  return <Modal title="Make it your space" description="Find a rhythm that works for you." onClose={onClose}><form className="form-stack" onSubmit={submit}>
    <div className="form-row"><div><label htmlFor="focus-minutes">Focus minutes</label><input autoFocus id="focus-minutes" type="number" min={1} max={180} step={1} required value={draft.focusMinutes || ''} onChange={event => setDraft({ ...draft, focusMinutes: Number(event.target.value) })} /></div><div><label htmlFor="break-minutes">Break minutes</label><input id="break-minutes" type="number" min={1} max={180} step={1} required value={draft.breakMinutes || ''} onChange={event => setDraft({ ...draft, breakMinutes: Number(event.target.value) })} /></div></div>
    <p className="form-help">New durations apply to your next timer or after a reset. A running or paused session keeps its original duration.</p>
    <label htmlFor="theme">Appearance</label><select id="theme" value={draft.theme} onChange={event => setDraft({ ...draft, theme: event.target.value as Settings['theme'] })}><option value="light">Light</option><option value="dark">Dark</option></select>
    {error && <p className="field-error" role="alert">{error}</p>}
    <div className="privacy-note">Your tasks, settings, and focus history stay in this browser. No account, no tracking, just your space.</div>
    <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" type="submit">Save settings</button></div>
  </form></Modal>;
}
