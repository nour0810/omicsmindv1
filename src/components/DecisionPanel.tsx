'use client';

import React from 'react';
import { type ScenarioStep } from '@/data/scenarios';
import { type Decision } from './SimulatorClient';

interface DecisionPanelProps {
  step: ScenarioStep;
  decisionMade: boolean;
  decisions: Decision[];
  currentStep: number;
  onDecision: (optionIdx: number) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function DecisionPanel({
  step,
  decisionMade,
  decisions,
  currentStep,
  onDecision,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
}: DecisionPanelProps) {
  const currentDecision = decisions.find(d => d.step === currentStep);

  return (
    <div
      className="border-t flex-shrink-0"
      style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0f1729' }}
    >
      {/* Question */}
      <div className="px-5 pt-4 pb-2">
        <p className="font-semibold text-sm" style={{ color: '#00d4aa' }}>
          {step.question}
        </p>
      </div>

      {/* Options */}
      <div className="px-5 pb-3 space-y-2">
        {step.options.map((opt, i) => {
          const isSelected = currentDecision?.choiceIdx === i;
          const isDimmed = decisionMade && !isSelected;
          const isOptimal = i === step.optimalChoice;

          return (
            <button
              key={`opt-${step.id}-${opt.id}`}
              onClick={() => !decisionMade && onDecision(i)}
              disabled={decisionMade}
              className="option-card w-full text-left rounded-xl px-4 py-3 transition-all duration-200 active:scale-[0.99]"
              style={{
                background: isSelected
                  ? 'rgba(0,212,170,0.12)'
                  : 'rgba(255,255,255,0.03)',
                border: isSelected
                  ? '1px solid #00d4aa' :'1px solid rgba(255,255,255,0.08)',
                opacity: isDimmed ? 0.35 : 1,
                cursor: decisionMade ? 'default' : 'pointer',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Option letter */}
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{
                    background: isSelected ? '#00d4aa' : 'rgba(255,255,255,0.08)',
                    color: isSelected ? '#0a0f1e' : '#8892a4',
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: isSelected ? '#00d4aa' : '#e8eaf0' }}>
                      {opt.label}
                    </span>
                    {isSelected && isOptimal && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-bold"
                        style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
                      >
                        +25 pts
                      </span>
                    )}
                    {isSelected && !isOptimal && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-bold"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
                      >
                        +10 pts
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#8892a4' }}>
                    {opt.description}
                  </p>
                  {isSelected && (
                    <p
                      className="text-xs mt-2 leading-relaxed animate-fade-in-fast"
                      style={{ color: isOptimal ? '#22c55e' : '#f59e0b' }}
                    >
                      {opt.outcome.note as string}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#00d4aa' }}
                  >
                    <span className="text-xs font-bold" style={{ color: '#0a0f1e' }}>✓</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div
        className="flex items-center justify-between px-5 py-3 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={onPrev}
          disabled={isFirstStep}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#8892a4',
          }}
        >
          ← Prev
        </button>

        <button
          onClick={onNext}
          disabled={!decisionMade}
          className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: decisionMade
              ? 'linear-gradient(135deg, #00d4aa, #0f9d8a)'
              : 'rgba(255,255,255,0.05)',
            color: decisionMade ? '#0a0f1e' : '#8892a4',
            border: decisionMade ? 'none' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: decisionMade ? '0 0 16px rgba(0,212,170,0.25)' : 'none',
          }}
        >
          {isLastStep ? 'View Comparison →' : 'Next Step →'}
        </button>
      </div>
    </div>
  );
}
