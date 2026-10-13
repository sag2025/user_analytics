import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="page">
      <header className="topbar">
        <strong>Hit &amp; Win</strong>
        <span className="dim">Signed in as {session.username}</span>
        <button className="btn ghost" onClick={logout}>Log out</button>
      </header>

      <main className="card hero">
        <h1>Welcome to Hit &amp; Win 🎯</h1>
        <p>It's a simple game with one rule: <b>find the bubbles and pop them</b>.</p>
        <ol>
          <li>Press <b>Play game</b> and wait for the 5-second countdown.</li>
          <li>Five bubbles will float up from the bottom of the screen.</li>
          <li>Click every bubble before you run out of patience. Pop all five and you win!</li>
        </ol>
      </main>

      <button className="btn primary fab" onClick={() => navigate('/game')}>Play game →</button>
    </div>
  );
}
