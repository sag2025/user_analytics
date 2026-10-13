import { API_BASE } from '../api/client.js';

const ENDPOINT = `${API_BASE}/api/events`;

let sessionId = null;
let onExpired = null;
let current = null; // { url, start } for the page the user is on
let bound = false;

const pageUrl = (pathname) => `${location.origin}${pathname}`;
const now = () => new Date().toISOString();

// Async, never awaited. text/plain avoids a CORS preflight; sendBeacon survives tab close.
function post(events, beacon = false) {
  const body = JSON.stringify(events);
  if (beacon && navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return;
  fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body, keepalive: true })
    .then((res) => { if (res.status === 401 && onExpired) onExpired(); })
    .catch(() => {});
}

function onClick(ev) {
  if (!sessionId) return;
  const d = document.documentElement;
  post([{
    session_id: sessionId,
    type: 'click',
    url: pageUrl(location.pathname),
    timestamp: now(),
    x: Math.round(ev.pageX),
    y: Math.round(ev.pageY),
    page_width: Math.max(d.scrollWidth, d.clientWidth),
    page_height: Math.max(d.scrollHeight, d.clientHeight),
  }]);
}

function bind() {
  if (bound) return;
  bound = true;
  document.addEventListener('click', onClick, true);
  window.addEventListener('pagehide', () => pageLeave(true));
}

export function startTracking(id, expiredCallback) {
  sessionId = id;
  onExpired = expiredCallback;
  bind();
}

export function stopTracking() {
  pageLeave();
  sessionId = null;
}

export function pageEnter(pathname) {
  if (!sessionId) return;
  const url = pageUrl(pathname);
  if (current && current.url === url) return; // de-dupe (React StrictMode runs effects twice in dev)
  pageLeave();
  current = { url, start: Date.now() };
  post([{ session_id: sessionId, type: 'page_view', url, timestamp: now() }]);
}

export function pageLeave(beacon = false) {
  if (!sessionId || !current) return;
  const { url, start } = current;
  current = null;
  post([{ session_id: sessionId, type: 'page_leave', url, timestamp: now(), duration_ms: Date.now() - start }], beacon);
}
