import React from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container inner">
        <div className="brand">
          <h1 className="brand-title">Xani Image Studio</h1>
          <p className="brand-subtitle">Edit images in your browser. Files never leave your device.</p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
