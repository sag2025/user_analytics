import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import useAdminFetch from '../../hooks/useAdminFetch.js';
import { pathOf } from '../../lib/format.js';

export default function HeatmapView({ userId, days }) {
  const [url, setUrl] = useState('');
  const pages = useAdminFetch(() => api.pages({ user_id: userId, days }), [userId, days]);

  // keep the selected page valid when filters change
  useEffect(() => {
    const list = pages.data || [];
    if (!list.length) setUrl('');
    else if (!list.some((p) => p.url === url)) setUrl(list[0].url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.data]);

  const clicks = useAdminFetch(
    () => (url ? api.clicks({ user_id: userId, days, url }) : Promise.resolve([])),
    [url, userId, days]
  );

  if (pages.error) return <p className="msg error">{pages.error}</p>;
  if (pages.loading) return <p className="msg">Loading pages…</p>;
  if (!pages.data.length) return <p className="msg">No click data for this filter yet.</p>;

  const list = clicks.data || [];
  // frame = largest recorded page size; each dot is placed using the size of the page it was clicked on
  const W = Math.max(1, ...list.map((c) => c.page_width || 0));
  const H = Math.max(1, ...list.map((c) => c.page_height || 0));

  return (
    <section className="card">
      <div className="row-head">
        <h2>Click heatmap</h2>
        <select value={url} onChange={(e) => setUrl(e.target.value)} aria-label="Page">
          {pages.data.map((p) => <option key={p.url} value={p.url}>{pathOf(p.url)} ({p.clicks} clicks)</option>)}
        </select>
      </div>
      {clicks.error && <p className="msg error">{clicks.error}</p>}
      <div className="heat" style={{ aspectRatio: `${W} / ${H}` }}>
        {list.map((c, i) => (
          <i
            key={i}
            className="dot"
            style={{ left: `${(c.x / (c.page_width || W)) * 100}%`, top: `${(c.y / (c.page_height || H)) * 100}%` }}
          />
        ))}
      </div>
      <p className="dim">{list.length} clicks plotted on a {W}×{H}px frame. Overlapping dots glow brighter.</p>
    </section>
  );
}
