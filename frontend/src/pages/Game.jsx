import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const BUBBLE_COUNT = 5;
const COUNTDOWN = 5;
const rand = (min, max) => Math.random() * (max - min) + min;

export default function Game() {
  const arena = useRef(null);
  const startedAt = useRef(0);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState('countdown'); // countdown | playing | won
  const [count, setCount] = useState(COUNTDOWN);
  const [bubbles, setBubbles] = useState([]);
  const [popped, setPopped] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // Create bubbles at random positions based on the arena's real size
  const spawn = () => {
    const { width, height } = arena.current.getBoundingClientRect();
    setBubbles(
      Array.from({ length: BUBBLE_COUNT }, (_, id) => {
        const size = Math.round(rand(56, 92));
        const dur = rand(6, 11);
        return {
          id,
          size,
          x: Math.round(rand(0, Math.max(width - size, 0))),
          rise: Math.round(height + size * 2), // distance to travel upward
          sway: Math.round(rand(-40, 40)),
          dur: dur.toFixed(1),
          delay: (-rand(0, dur)).toFixed(1), // negative delay = already part-way up when it appears
        };
      })
    );
    startedAt.current = Date.now();
    setPhase('playing');
  };

  // Countdown 5..0, then start. Re-runs on "Play again".
  useEffect(() => {
    setPhase('countdown');
    setCount(COUNTDOWN);
    setBubbles([]);
    setPopped(0);
    let n = COUNTDOWN;
    const t = setInterval(() => {
      n -= 1;
      setCount(n);
      if (n <= 0) { clearInterval(t); spawn(); }
    }, 1000);
    return () => clearInterval(t);
  }, [round]);

  const pop = (id) => {
    setBubbles((list) => list.filter((b) => b.id !== id));
    setPopped((p) => {
      const next = p + 1;
      if (next === BUBBLE_COUNT) {
        setSeconds(((Date.now() - startedAt.current) / 1000).toFixed(1));
        setPhase('won');
      }
      return next;
    });
  };

  return (
    <div className="page game-page">
      <header className="topbar">
        <Link to="/home" className="btn ghost">← Home</Link>
        <strong>Popped {popped} / {BUBBLE_COUNT}</strong>
      </header>

      <div className="arena card" ref={arena}>
        {phase === 'countdown' && (
          <div className="overlay"><p className="dim">Game starts in</p><div className="big">{count}</div></div>
        )}
        {phase === 'won' && (
          <div className="overlay"><div className="big">🎉 You win!</div><p className="dim">All {BUBBLE_COUNT} bubbles popped in {seconds}s.</p></div>
        )}
        {bubbles.map((b) => (
          <button
            key={b.id}
            className="bubble"
            aria-label="Pop bubble"
            onClick={() => pop(b.id)}
            style={{
              width: b.size, height: b.size, left: b.x,
              '--rise': `${b.rise}px`, '--sway': `${b.sway}px`,
              animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="game-actions">
        <button className="btn primary" onClick={() => setRound((r) => r + 1)}>Play again</button>
      </div>
    </div>
  );
}
