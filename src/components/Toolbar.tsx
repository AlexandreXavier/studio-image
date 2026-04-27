import React from 'react';
import { Icon } from './Icons';

const TOOLS = [
  { id: 'crop', label: 'Crop', icon: 'crop' },
  { id: 'resize', label: 'Resize', icon: 'resize' },
  { id: 'convert', label: 'Convert', icon: 'convert' },
  { id: 'compress', label: 'Compress', icon: 'compress' },
  { id: 'rotate', label: 'Rotate/Flip', icon: 'rotate' },
] as const;

interface Props {
  activeTool: string | null;
  onSelect: (tool: string) => void;
}

export default function Toolbar({ activeTool, onSelect }: Props) {
  return (
    <nav data-testid="toolbar" className="toolbar" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12 }}>
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          aria-label={tool.label}
          title={tool.label}
          onClick={() => onSelect(tool.id)}
          style={{
            background: activeTool === tool.id ? 'var(--accent)' : 'transparent',
            border: 'none',
            borderRadius: 8,
            padding: 10,
            cursor: 'pointer',
            color: activeTool === tool.id ? '#fff' : 'var(--fg2)',
            transition: 'background 0.15s',
          }}
        >
          <Icon name={tool.icon} size={22} />
        </button>
      ))}
    </nav>
  );
}
