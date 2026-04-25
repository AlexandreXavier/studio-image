import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('xani_theme') : null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved ? (saved as 'light' | 'dark') : prefersDark ? 'dark' : 'light';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    if (typeof window !== 'undefined') localStorage.setItem('xani_theme', next);
  };

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
      <Icon name={theme === 'light' ? 'moon' : 'sun'} size={20} />
    </button>
  );
}
