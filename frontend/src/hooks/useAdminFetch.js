import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAdminToken } from '../lib/adminToken.js';

// Runs an admin API call whenever deps change. A 401 sends the admin back to the admin login.
export default function useAdminFetch(fn, deps) {
  const [state, setState] = useState({ data: null, error: '', loading: true });
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fn()
      .then((data) => alive && setState({ data, error: '', loading: false }))
      .catch((err) => {
        if (!alive) return;
        if (err.status === 401) { clearAdminToken(); navigate('/admin'); return; }
        setState({ data: null, error: err.message, loading: false });
      });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
