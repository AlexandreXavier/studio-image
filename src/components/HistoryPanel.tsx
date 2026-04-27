import React from 'react';

interface Snapshot {
  id: string;
  toolName: string;
  timestamp: number;
}

interface Props {
  history: Snapshot[];
  activeIndex: number;
  onJump: (index: number) => void;
}

export default function HistoryPanel({ history, activeIndex, onJump }: Props) {
  return (
    <aside data-testid="history-panel" className="history-panel" style={{ width: 220, padding: 12, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h3 style={{ fontSize: '0.875rem', color: 'var(--fg3)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Histórico</h3>
      {history.length === 0 && (
        <p style={{ fontSize: '0.75rem', color: 'var(--fg3)', fontStyle: 'italic' }}>Nenhuma ação ainda</p>
      )}
      {history.map((snap, i) => (
        <button
          key={snap.id}
          onClick={() => onJump(i)}
          style={{
            textAlign: 'left',
            background: i === activeIndex ? 'var(--accent)' : 'transparent',
            color: i === activeIndex ? '#fff' : 'var(--fg2)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {snap.toolName}
        </button>
      ))}
    </aside>
  );
}
