import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { getAdminToken, setAdminToken } from '../lib/adminToken.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (getAdminToken()) return <Navigate to="/admin/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { token } = await api.adminLogin(form);
      setAdminToken(token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Admin</h1>
        <p className="dim">Enter the admin credentials to view analytics.</p>
        {error && <p className="msg error" role="alert">{error}</p>}
        <label>Admin name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="username" required />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" required />
        </label>
        <button className="btn primary" disabled={busy}>{busy ? 'Checking…' : 'Enter'}</button>
        <p className="dim center"><Link to="/login">← Back to login</Link></p>
      </form>
    </div>
  );
}
