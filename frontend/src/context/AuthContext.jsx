import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'ca_auth'; // { user_id, username, session_id, expires_at }
const AuthContext = createContext(null);

function readStored() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && new Date(s.expires_at) > new Date()) return s;
  } catch { /* ignore */ }
  localStorage.removeItem(KEY);
  return null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStored);

  const login = useCallback((data) => {
    localStorage.setItem(KEY, JSON.stringify(data));
    setSession(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setSession(null);
  }, []);

  // auto-logout the moment the session expires
  useEffect(() => {
    if (!session) return undefined;
    const ms = Math.max(new Date(session.expires_at) - Date.now(), 0);
    const t = setTimeout(logout, ms);
    return () => clearTimeout(t);
  }, [session, logout]);

  const value = useMemo(() => ({ session, login, logout }), [session, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
