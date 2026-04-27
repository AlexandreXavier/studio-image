import React from 'react';

interface Props {
  name: string;
}

export default function PlaceholderToolPanel({ name }: Props) {
  return (
    <div data-testid="tool-panel" style={{ padding: 12, borderTop: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
      <h3 style={{ margin: '0 0 10px', fontSize: '1rem' }}>{name}</h3>
      <p style={{ color: 'var(--fg3)' }}>Em breve — controles para {name.toLowerCase()}.</p>
    </div>
  );
}
