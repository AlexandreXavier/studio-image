import React from 'react';
import ThemeToggle from './ThemeToggle';

export default function EditorHeader() {
  return (
    <header className="site-header" style={{ padding: '8px 0' }}>
      <div className="container inner" style={{ justifyContent: 'space-between' }}>
        <div className="brand">
          <h1 className="brand-title" style={{ fontSize: '1.25rem', margin: 0 }}>Xani</h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
