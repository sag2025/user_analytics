import { getAdminToken } from '../lib/adminToken.js';

export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

async function request(path, { method = 'GET', body, admin = false } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (admin) headers.Authorization = `Bearer ${getAdminToken()}`;

  let res;
  try {
    res = await fetch(API_BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Cannot reach the server. Please try again.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const qs = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== null && v !== '' && q.set(k, v));
  const s = q.toString();
  return s ? `?${s}` : '';
};

export const api = {
  register: (body) => request('/api/users/register', { method: 'POST', body }),
  login: (body) => request('/api/users/login', { method: 'POST', body }),
  adminLogin: (body) => request('/api/admin/login', { method: 'POST', body }),
  // admin analytics
  users: () => request('/api/users', { admin: true }),
  pageViews: (p) => request(`/api/users/pageview${qs(p)}`, { admin: true }),
  clicks: (p) => request(`/api/users/click${qs(p)}`, { admin: true }),
  pages: (p) => request(`/api/users/pages${qs(p)}`, { admin: true }),
  pageTimes: (p) => request(`/api/users/pagetime${qs(p)}`, { admin: true }),
};
