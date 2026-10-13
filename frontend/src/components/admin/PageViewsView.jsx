import { api } from '../../api/client.js';
import useAdminFetch from '../../hooks/useAdminFetch.js';
import { fmtDateTime, pathOf } from '../../lib/format.js';

export default function PageViewsView({ userId, days }) {
  const { data, error, loading } = useAdminFetch(() => api.pageViews({ user_id: userId, days }), [userId, days]);

  if (error) return <p className="msg error">{error}</p>;
  if (loading) return <p className="msg">Loading page views…</p>;
  if (!data.length) return <p className="msg">No page views for this filter yet.</p>;

  const perPage = Object.entries(
    data.reduce((acc, e) => { const p = pathOf(e.url); acc[p] = (acc[p] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="split">
      <section className="card">
        <h2>Views per page</h2>
        <table>
          <thead><tr><th>Page</th><th>Views</th></tr></thead>
          <tbody>{perPage.map(([p, n]) => <tr key={p}><td className="mono">{p}</td><td>{n}</td></tr>)}</tbody>
        </table>
        <p className="dim">{data.length} page views{userId ? ' (200 most recent for this user)' : ''}.</p>
      </section>

      <section className="card">
        <h2>Recent page views</h2>
        <table>
          <thead><tr><th>When</th><th>User</th><th>Page</th></tr></thead>
          <tbody>
            {data.slice(0, 100).map((e) => (
              <tr key={e._id}>
                <td>{fmtDateTime(e.timestamp)}</td>
                <td>{e.user_id?.username || '-'}</td>
                <td className="mono">{pathOf(e.url)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
