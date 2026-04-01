'use client';

import React from 'react';
import { type Scenario } from '@/data/scenarios';

interface StepHeaderProps {
  scenario: Scenario;
  currentStep: number;
  totalSteps: number;
  score: number;
  onBack: () => void;
  onApiKey: () => void;
  hasApiKey: boolean;
}

export default function StepHeader({
  scenario,
  currentStep,
  totalSteps,
  score,
  onBack,
  onApiKey,
  hasApiKey,
}: StepHeaderProps) {
  const COLOR_MAP: Record<string, string> = {
    teal: '#00d4aa',
    purple: '#a78bfa',
    amber: '#f0d080',
  };
  const accent = COLOR_MAP[scenario.color] || '#00d4aa';

  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-4 px-6 py-3 border-b"
      style={{ background: '#0f1729', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 flex-shrink-0"
        style={{ color: '#8892a4', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
      >
        ← Back
      </button>

      {/* Scenario info */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-lg">{scenario.emoji}</span>
        <span className="font-semibold text-sm hidden sm:block" style={{ color: '#e8eaf0' }}>
          {scenario.title}
        </span>
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-2 flex-1 justify-center">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={`step-dot-${i}`} className="flex items-center gap-2">
            <div
              className="step-dot w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background:
                  i < currentStep
                    ? '#0f9d8a'
                    : i === currentStep
                    ? accent
                    : 'rgba(255,255,255,0.08)',
                color: i <= currentStep ? '#0a0f1e' : '#8892a4',
                boxShadow: i === currentStep ? `0 0 0 3px ${accent}33` : 'none',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              {i < currentStep ? '✓' : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div
                className="w-8 h-0.5 rounded"
                style={{ background: i < currentStep ? '#0f9d8a' : 'rgba(255,255,255,0.08)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step label */}
      <div className="hidden md:block flex-shrink-0 text-sm" style={{ color: '#8892a4' }}>
        Step <span style={{ color: accent }}>{currentStep + 1}</span>/{totalSteps}
        <span className="ml-2" style={{ color: '#e8eaf0' }}>
          {scenario.steps[currentStep]?.label}
        </span>
      </div>

      {/* Score */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-shrink-0"
        style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}
      >
        <span className="text-xs" style={{ color: '#8892a4' }}>Score</span>
        <span
          className="font-bold text-sm"
          style={{ color: '#c9a84c', fontFamily: 'IBM Plex Mono, monospace' }}
        >
          {score}
        </span>
      </div>

      {/* API key button */}
      <button
        onClick={onApiKey}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 flex-shrink-0"
        style={{
          color: hasApiKey ? '#00d4aa' : '#8892a4',
          border: `1px solid ${hasApiKey ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.08)'}`,
          background: hasApiKey ? 'rgba(0,212,170,0.06)' : 'rgba(255,255,255,0.03)',
        }}
      >
        {hasApiKey ? '🔑 Live AI' : '🔑 API Key'}
      </button>
    </header>
  );
}
