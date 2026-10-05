import { useEffect, useState } from 'react';
import { remainingTime, type Status, type Task } from './model';
import { store, useStore } from './useStore';
import { Dashboard, SessionHistory } from './components/Dashboard';
import { FocusTimer } from './components/FocusTimer';
import { Icon } from './components/Icon';
import { Modal } from './components/Modal';
import { SettingsForm } from './components/SettingsForm';
import { TaskBoard } from './components/TaskBoard';
import { TaskForm } from './components/TaskForm';

type Dialog = { type: 'task'; status: Status; task?: Task } | { type: 'delete'; task: Task } | { type: 'settings' } | null;

export default function App() {
  const { state, warning, unsaved } = useStore();
  const [now, setNow] = useState(Date.now);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [notice, setNotice] = useState('');
  const [activeSection, setActiveSection] = useState(location.hash || '#overview');
  useEffect(() => {
    function tick() {
      const now = Date.now(); setNow(now);
      const timer = store.getSnapshot().state.timer;
      if (timer.status === 'running' && timer.endsAt !== null && now >= timer.endsAt) void store.dispatch({ type: 'timer/tick' });
    }
    tick();
    const interval = window.setInterval(tick, 500);
    window.addEventListener('focus', tick);
    window.addEventListener('pageshow', tick);
    document.addEventListener('visibilitychange', tick);
    const hash = () => setActiveSection(location.hash || '#overview');
    window.addEventListener('hashchange', hash);
    return () => { clearInterval(interval); window.removeEventListener('focus', tick); window.removeEventListener('pageshow', tick); document.removeEventListener('visibilitychange', tick); window.removeEventListener('hashchange', hash); };
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = state.settings.theme; document.documentElement.style.colorScheme = state.settings.theme; }, [state.settings.theme]);
  useEffect(() => {
    const seconds = Math.ceil(remainingTime(state.timer, now) / 1000);
    document.title = state.timer.status === 'running' ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} · FocusBoard` : 'FocusBoard — Make room for your best work';
  }, [state.timer, now]);
  useEffect(() => { if (!notice) return; const timeout = setTimeout(() => setNotice(''), 5000); return () => clearTimeout(timeout); }, [notice]);
  const date = new Date(now);
  const greeting = date.getHours() < 12 ? 'Good morning' : date.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const close = () => setDialog(null);
  return <div className="app-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <aside className="sidebar">
      <a className="brand" href="#overview" aria-label="FocusBoard home"><span className="brand-mark"><Icon name="board" size={21} /></span><span>Focus<span className="brand-light">Board</span><small>A LITTLE MORE INTENTION</small></span></a>
      <div className="sidebar-section-label">YOUR WORKSPACE</div>
      <nav aria-label="Main navigation">{([{ href: '#overview', icon: 'grid', label: 'Overview' }, { href: '#board', icon: 'board', label: 'Task board' }, { href: '#focus', icon: 'timer', label: 'Focus timer' }, { href: '#sessions', icon: 'history', label: 'Session history' }] as const).map(link => <a key={link.href} className={activeSection === link.href ? 'active' : ''} aria-current={activeSection === link.href ? 'location' : undefined} href={link.href}><Icon name={link.icon} size={19} /><span>{link.label}</span>{link.href === '#board' && <span className="nav-count">{state.tasks.length}</span>}</a>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><div className="little-spark"><Icon name="spark" size={24} /></div><strong>Less rush.<br />More intention.</strong><p>You don’t have to do it all.<br />Just the next right thing.</p></div><button className="sidebar-setting" onClick={() => setDialog({ type: 'settings' })}><Icon name="settings" size={19} /> Settings</button><div className="local-label"><Icon name="lock" size={14} /><span>Your space. Your browser.</span></div></div>
    </aside>
    <div className="main-shell" id="overview">
      <header className="topbar"><div className="breadcrumb">My workspace <span>/</span> <strong>Overview</strong></div><div className="topbar-right"><span className="today"><Icon name="calendar" size={16} />{date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span><span className="topbar-divider" /><button className="icon-button theme-toggle" aria-label={`Switch to ${state.settings.theme === 'light' ? 'dark' : 'light'} theme`} onClick={() => void store.dispatch({ type: 'settings', settings: { ...state.settings, theme: state.settings.theme === 'light' ? 'dark' : 'light' } })}><Icon name={state.settings.theme === 'light' ? 'moon' : 'sun'} size={19} /></button><div className="workspace-avatar" aria-label="Personal workspace">F</div></div></header>
      <main id="main">
        {warning && <div className="storage-warning" role="alert"><Icon name="alert" /><span>{warning}</span>{unsaved && <button className="button secondary" onClick={() => store.retry()}>Retry saving</button>}</div>}
        <div className="welcome"><div><div className="eyebrow greeting"><span className="greeting-dot" />{greeting}. Let’s make room for what matters.</div><h1>A little structure. <span>A lot more focus.</span></h1><p>Your tasks, your time, your pace. Make today a good one.</p></div><button className="button demo-button" disabled={state.demoLoaded} onClick={async () => { await store.dispatch({ type: 'demo' }); setNotice('Demo tasks added. Your existing tasks and focus history are unchanged.'); }}><Icon name={state.demoLoaded ? 'check' : 'spark'} size={17} />{state.demoLoaded ? 'Demo data loaded' : 'Load demo data'}</button></div>
        <Dashboard state={state} now={now} />
        <div className="workspace-grid"><TaskBoard tasks={state.tasks} now={now} onNew={status => setDialog({ type: 'task', status })} onEdit={task => setDialog({ type: 'task', task, status: task.status })} onDelete={task => setDialog({ type: 'delete', task })} onStatus={(id, status) => { void store.dispatch({ type: 'task/status', id, status }); }} /><div className="focus-aside"><FocusTimer state={state} now={now} dispatch={action => { void store.dispatch(action); }} onSettings={() => setDialog({ type: 'settings' })} /><div className="focus-tip"><div><Icon name="leaf" size={19} /></div><p><strong>Focus is a practice.</strong>Start small. Take your breaks.<br />Come back a little clearer.</p></div></div></div>
        <SessionHistory state={state} now={now} />
        <footer className="page-footer"><span><Icon name="lock" size={13} /> Saved in this browser. No accounts. Just focus.</span><span>One small step at a time <Icon name="spark" size={13} /></span></footer>
      </main>
    </div>
    <div className={`toast ${notice ? 'visible' : ''}`} role="status">{notice && <><Icon name="circleCheck" size={19} />{notice}</>}</div>
    {dialog?.type === 'task' && <TaskForm task={dialog.task} status={dialog.status} onClose={close} onSave={async draft => { await store.dispatch(dialog.task ? { type: 'task/edit', id: dialog.task.id, draft } : { type: 'task/add', id: crypto.randomUUID(), draft }); setNotice(dialog.task ? 'Task updated. Keep the momentum going.' : 'Task created. A small step in the right direction.'); }} />}
    {dialog?.type === 'settings' && <SettingsForm settings={state.settings} onClose={close} onSave={async settings => { await store.dispatch({ type: 'settings', settings }); setNotice('Settings saved. Find your own rhythm.'); }} />}
    {dialog?.type === 'delete' && <Modal title="Delete this task?" description={`“${dialog.task.title}” will be removed from your board. Completed focus sessions will stay in your history.`} onClose={close}><div className="modal-actions"><button autoFocus className="button secondary" onClick={close}>Keep task</button><button className="button danger" onClick={async () => { await store.dispatch({ type: 'task/delete', id: dialog.task.id }); close(); setNotice('Task deleted.'); }}>Delete task</button></div></Modal>}
  </div>;
}
