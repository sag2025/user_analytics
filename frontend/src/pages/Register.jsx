import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setBusy(true);
    try {
      await api.register({ username: form.username, password: form.password });
      navigate('/login', { state: { registered: true } }); // 201 -> back to login
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Create account</h1>
        <p className="dim">3-30 characters: letters, numbers, underscore.</p>
        {error && <p className="msg error" role="alert">{error}</p>}
        <label>Username
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" required />
        </label>
        <label>Password (min 6)
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" required />
        </label>
        <label>Confirm password
          <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} autoComplete="new-password" required />
        </label>
        <button className="btn primary" disabled={busy}>{busy ? 'Creating…' : 'Register'}</button>
        <p className="dim center">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
