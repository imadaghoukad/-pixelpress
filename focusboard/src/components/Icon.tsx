import type { CSSProperties } from 'react';

const paths = {
  board: <><rect x="3" y="3" width="7" height="18" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  timer: <><circle cx="12" cy="14" r="8" /><path d="M12 10v4l2 2M9 2h6M12 2v4m6 0 2-2" /></>,
  history: <><path d="M3 11a9 9 0 1 1 2.6 7.4M3 4v7h7M12 7v5l3 2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  circleCheck: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18m-13 4h2m4 0h2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="10.5" cy="10.5" r="7.5" /><path d="m16 16 5 5" /></>,
  filter: <><path d="M4 7h16M7 12h10M10 17h4" /></>,
  edit: <><path d="m16 3 5 5-12 12-6 1 1-6L16 3Zm-2 2 5 5" /></>,
  trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  play: <path d="m8 5 11 7-11 7V5Z" />,
  pause: <><path d="M8 5v14M16 5v14" /></>,
  reset: <><path d="M3 10a9 9 0 1 1 2 8M3 3v7h7" /></>,
  moon: <path d="M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
  settings: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="3" /><circle cx="16" cy="17" r="3" /></>,
  spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" /></>,
  leaf: <><path d="M20 3C9 2 3 7 5 14s13 7 15-11ZM4 21 15 10" /></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
  alert: <><path d="m12 3 10 18H2L12 3Zm0 6v5m0 3h.01" /></>,
};
export type IconName = keyof typeof paths;
export function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]}</svg>;
}
