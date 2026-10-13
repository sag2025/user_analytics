import { api } from '../../api/client.js';
import useAdminFetch from '../../hooks/useAdminFetch.js';
import { fmtDuration, pathOf } from '../../lib/format.js';

export default function PageTimeView({ userId, days }) {
  const { data, error, loading } = useAdminFetch(() => api.pageTimes({ user_id: userId, days }), [userId, days]);

  if (error) return <p className="msg error">{error}</p>;
  if (loading) return <p className="msg">Loading…</p>;
  if (!data.length) return <p className="msg">No time-on-page data for this filter yet.</p>;

  return (
    <section className="card">
      <h2>Time spent per page</h2>
      <table>
        <thead><tr><th>Page</th><th>Visits</th><th>Average time</th><th>Total time</th></tr></thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.url}>
              <td className="mono">{pathOf(r.url)}</td>
              <td>{r.visits}</td>
              <td>{fmtDuration(r.avg_ms)}</td>
              <td>{fmtDuration(r.total_ms)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
