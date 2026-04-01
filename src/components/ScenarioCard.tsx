'use client';

import React from 'react';

interface ScenarioCardProps {
  id: string;
  emoji: string;
  title: string;
  description: string;
  tags: string[];
  time: string;
  difficulty: 'Required' | 'Intermediate' | 'Advanced';
  color: 'teal' | 'purple' | 'amber';
  isSelected: boolean;
  isCompleted: boolean;
  completedScore?: number;
  onSelect: (id: string) => void;
  scenarioNumber: number;
  isRequired?: boolean;
  isModule?: boolean;
}

const COLOR_MAP = {
  teal: {
    accent: '#00d4aa',
    bg: 'rgba(0,212,170,0.06)',
    border: 'rgba(0,212,170,0.2)',
    tag: 'rgba(0,212,170,0.1)',
    tagText: '#00d4aa',
    tagBorder: 'rgba(0,212,170,0.3)',
  },
  purple: {
    accent: '#7c5cbf',
    bg: 'rgba(124,92,191,0.06)',
    border: 'rgba(124,92,191,0.2)',
    tag: 'rgba(124,92,191,0.1)',
    tagText: '#a78bfa',
    tagBorder: 'rgba(124,92,191,0.3)',
  },
  amber: {
    accent: '#c9a84c',
    bg: 'rgba(201,168,76,0.06)',
    border: 'rgba(201,168,76,0.2)',
    tag: 'rgba(201,168,76,0.1)',
    tagText: '#f0d080',
    tagBorder: 'rgba(201,168,76,0.3)',
  },
};

const DIFFICULTY_STYLE: Record<string, { color: string; bg: string }> = {
  Required: { color: '#00d4aa', bg: 'rgba(0,212,170,0.15)' },
  Intermediate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  Advanced: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

export default function ScenarioCard({
  id,
  emoji,
  title,
  description,
  tags,
  time,
  difficulty,
  color,
  isSelected,
  isCompleted,
  completedScore,
  onSelect,
  scenarioNumber,
  isRequired,
  isModule,
}: ScenarioCardProps) {
  const c = COLOR_MAP[color];
  const diff = DIFFICULTY_STYLE[difficulty];

  return (
    <div
      className="scenario-card relative rounded-2xl p-5 cursor-pointer overflow-hidden"
      style={{
        background: isSelected ? c.bg : '#1a2235',
        border: `1px solid ${isSelected ? c.accent : c.border}`,
        boxShadow: isSelected
          ? `0 0 0 1px ${c.accent}, 0 0 24px ${c.bg}`
          : '0 2px 8px rgba(0,0,0,0.3)',
      }}
      onClick={() => onSelect(id)}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(id);
      }}
    >
      {/* Module layout (full-width horizontal) */}
      {isModule ? (
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: c.bg, border: `1px solid ${c.border}` }}
            >
              {emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {isRequired && (
                  <span
                    className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                    style={{ background: 'rgba(0,212,170,0.2)', color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace' }}
                  >
                    START HERE
                  </span>
                )}
                <span className="text-xs font-medium" style={{ color: '#8892a4', fontFamily: 'IBM Plex Mono, monospace' }}>
                  Module 1
                </span>
              </div>
              <h3 className="font-semibold text-base mb-1" style={{ color: '#e8eaf0' }}>
                {title}
              </h3>
              <p className="text-sm" style={{ color: '#8892a4' }}>
                {description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
            <div className="flex gap-2">
              {tags.map(tag => (
                <span
                  key={`tag-${id}-${tag}`}
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: c.tag, color: c.tagText, border: `1px solid ${c.tagBorder}`, fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: '#8892a4' }}>
              <span>{time}</span>
              <span
                className="px-2 py-0.5 rounded font-medium"
                style={{ background: diff.bg, color: diff.color }}
              >
                {difficulty}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Scenario card (vertical) */
        <>
          {/* Top row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}
              >
                {emoji}
              </div>
              <div>
                <div
                  className="text-xs font-semibold tracking-widest uppercase mb-0.5"
                  style={{ color: c.accent, fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  Scenario {scenarioNumber}
                </div>
                <div className="text-xs" style={{ color: '#8892a4' }}>
                  {time}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ background: diff.bg, color: diff.color }}
              >
                {difficulty}
              </span>
              {isCompleted && (
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  {completedScore !== undefined ? `${completedScore}/100` : '✓ Done'}
                </span>
              )}
            </div>
          </div>

          {/* Title + description */}
          <h3 className="font-semibold text-base mb-2" style={{ color: '#e8eaf0' }}>
            {title}
          </h3>
          <p className="text-sm mb-4 leading-relaxed" style={{ color: '#8892a4' }}>
            {description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={`tag-${id}-${tag}`}
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  background: c.tag,
                  color: c.tagText,
                  border: `1px solid ${c.tagBorder}`,
                  fontFamily: 'IBM Plex Mono, monospace',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Selected indicator */}
          {isSelected && (
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl"
              style={{ background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)` }}
            />
          )}
        </>
      )}
    </div>
  );
}
