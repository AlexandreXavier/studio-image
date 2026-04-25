import React from 'react';
import { Icon } from './Icons';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
}

const TOOLS: Tool[] = [
  { id: 'crop', title: 'Crop image', description: 'Select and crop any rectangle area on an image.', icon: 'crop', link: '/crop' },
  { id: 'resize', title: 'Resize image', description: 'Resize an image, enter any size in pixels or percentage.', icon: 'resize', link: '/resize' },
  { id: 'convert', title: 'Convert image', description: 'Transform between formats: PNG, JPG, WebP.', icon: 'convert', link: '/convert' },
  { id: 'compress', title: 'Compress image', description: 'Optimize file size with quality control.', icon: 'compress', link: '/compress' },
  { id: 'rotate', title: 'Rotate & Flip', description: 'Rotate 90°/180°/270° and mirror horizontally or vertically.', icon: 'rotate', link: '/rotate' },
];

interface Props {
  disabled: boolean;
}

export default function ToolGrid({ disabled }: Props) {
  return (
    <section className="tool-grid" aria-label="Image tools">
      {TOOLS.map((tool) => (
        <a
          key={tool.id}
          href={disabled ? undefined : tool.link}
          className={`tool-card ${disabled ? 'disabled' : ''}`}
          aria-disabled={disabled}
          onClick={(e) => { if (disabled) e.preventDefault(); }}
        >
          <div className="tool-card-header">{tool.title}</div>
          <div className="tool-card-body">
            <div className="tool-card-icon">
              <Icon name={tool.icon} size={32} />
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--fg3)', lineHeight: 1.5, margin: 0 }}>
              {tool.description}
            </p>
          </div>
        </a>
      ))}
    </section>
  );
}
