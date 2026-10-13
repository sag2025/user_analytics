import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { pageEnter, startTracking, stopTracking } from '../lib/tracker.js';

// Renders nothing. Sends page_view / page_leave on every route change for logged-in users
// (the admin area is never tracked).
export default function RouteTracker() {
  const { pathname } = useLocation();
  const { session, logout } = useAuth();

  useEffect(() => {
    if (session && !pathname.startsWith('/admin')) {
      startTracking(session.session_id, logout);
      pageEnter(pathname);
    } else {
      stopTracking();
    }
  }, [pathname, session, logout]);

  return null;
}
