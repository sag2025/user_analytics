import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { session, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (session) return <Navigate to="/home" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      login(await api.login(form));
      navigate('/home');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/admin" className="btn ghost admin-link">Admin</Link>
      <form className="card auth-card" onSubmit={submit}>
        <h1>Welcome back</h1>
        <p className="dim">Log in to play Hit &amp; Win.</p>
        {location.state?.registered && <p className="msg ok">Account created. Please log in.</p>}
        {error && <p className="msg error" role="alert">{error}</p>}
        <label>Username
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" required />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" required />
        </label>
        <button className="btn primary" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="dim center">New here? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}
