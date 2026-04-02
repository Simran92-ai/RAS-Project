// components/Header.js
import React from 'react';
import './Header.css';

export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              {/* Process circle */}
              <circle cx="8" cy="14" r="5" fill="none" stroke="#6475ff" strokeWidth="2"/>
              {/* Resource square */}
              <rect x="16" y="9" width="10" height="10" rx="2" fill="none" stroke="#f49058" strokeWidth="2"/>
              {/* Arrow */}
              <path d="M13 14 L16 14" stroke="#6475ff" strokeWidth="1.5" markerEnd="url(#arr)"/>
              <defs>
                <marker id="arr" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                  <path d="M0,0 L4,2 L0,4" fill="#6475ff"/>
                </marker>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="brand-title">RAG Visualizer</h1>
            <p className="brand-sub">Resource Allocation Graph · OS Deadlock Detection</p>
          </div>
        </div>

        <nav className="header-controls">
          <a
            href="https://en.wikipedia.org/wiki/Deadlock_(computer_science)"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            Docs
          </a>
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="theme-icon">{theme === 'dark' ? '☀' : '☾'}</span>
            <span className="theme-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}