export const pathOf = (u) => { try { return new URL(u).pathname || '/'; } catch { return u; } };
export const fmtDateTime = (d) => new Date(d).toLocaleString();

export function fmtDuration(ms) {
  if (ms == null) return '-';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, '0')}s`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
}
