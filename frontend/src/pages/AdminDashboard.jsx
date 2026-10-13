import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { clearAdminToken } from '../lib/adminToken.js';
import useAdminFetch from '../hooks/useAdminFetch.js';
import HeatmapView from '../components/admin/HeatmapView.jsx';
import PageViewsView from '../components/admin/PageViewsView.jsx';
import PageTimeView from '../components/admin/PageTimeView.jsx';

const TABS = [
  { id: 'heatmap', label: 'Heatmap' },
  { id: 'views', label: 'Page views' },
  { id: 'time', label: 'Time on page' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('heatmap');
  const [userId, setUserId] = useState('');
  const [days, setDays] = useState(7);
  const users = useAdminFetch(() => api.users(), []);

  const logout = () => { clearAdminToken(); navigate('/admin'); };
  const filters = { userId, days };

  return (
    <div className="page wide">
      <header className="topbar">
        <strong>Admin analytics</strong>
        <div className="filters">
          <select value={userId} onChange={(e) => setUserId(e.target.value)} aria-label="User">
            <option value="">All users</option>
            {(users.data || []).map((u) => <option key={u._id} value={u._id}>{u.username}</option>)}
          </select>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Days">
            {[1, 7, 30, 90].map((d) => <option key={d} value={d}>Last {d} day{d > 1 ? 's' : ''}</option>)}
          </select>
          <button className="btn ghost" onClick={logout}>Log out</button>
        </div>
      </header>

      <nav className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'heatmap' && <HeatmapView {...filters} />}
      {tab === 'views' && <PageViewsView {...filters} />}
      {tab === 'time' && <PageTimeView {...filters} />}
    </div>
  );
}
