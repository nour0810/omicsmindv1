'use client';

import React, { useState, useEffect } from 'react';
import { type Scenario } from '@/data/scenarios';
import { type Decision } from './SimulatorClient';

interface OutcomeScreenProps {
  scenario: Scenario;
  decisions: Decision[];
  score: number;
  onTryAnother: () => void;
  onDownloadCert: () => void;
}

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

export default function OutcomeScreen({
  scenario,
  decisions,
  score,
  onTryAnother,
  onDownloadCert,
}: OutcomeScreenProps) {
  const [replayModal, setReplayModal] = useState<Decision | null>(null);
  const [copied, setCopied] = useState(false);

  const scoreDisplay = useCountUp(score);
  const optimalCount = decisions.filter(d => d.isOptimal).length;
  const aiReasoningPct = Math.round((optimalCount / Math.max(decisions.length, 1)) * 100);
  const aiReasoningDisplay = useCountUp(aiReasoningPct);

  const getBadge = () => {
    if (score >= 85) return { emoji: '🏆', label: 'Elite Bioinformatician', color: '#c9a84c', bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.3)' };
    if (score >= 65) return { emoji: '🧬', label: 'AI-Assisted Analyst', color: '#00d4aa', bg: 'rgba(0,212,170,0.1)', border: 'rgba(0,212,170,0.3)' };
    return { emoji: '⚙️', label: 'Classical Practitioner', color: '#8892a4', bg: 'rgba(136,146,164,0.08)', border: 'rgba(136,146,164,0.2)' };
  };

  const badge = getBadge();

  const handleShare = () => {
    const text = `I just completed the "${scenario.title}" scenario on OmicsMind — AI-Powered Omics Simulation by GenoFlow Agency. Score: ${score}/100 · Badge: ${badge.label}. Try it at omicsmind.genoflow.bio`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const ALTERNATE_OUTCOMES: Record<string, string> = {
    'Quality Control': 'At Phred ≥20, 7 false variants would have entered downstream analysis — 2 of them mimicking resistance genes, leading to incorrect treatment recommendation.',
    'Assembly': 'Reference mapping would have discarded 31% of reads containing the 14kb genomic island. The OXA-900 resistance gene would never have been found.',
    'Resistance Genes': 'BLAST similarity search would have reported 4 known genes, missing 2 novel OXA-type variants. Treatment: meropenem — patient non-responsive at 48h.',
    'Clinical Decision': 'Standard carbapenem treatment initiated. Patient deteriorates over 48h. Escalation to combination therapy delayed. 40% success probability vs 78%.',
    'Sequencing Depth': '30x coverage leaves all subclonal variants at 3-7% VAF invisible. STK11 co-mutation at 4.2% — the key finding — would have been missed entirely.',
    'Variant Caller': 'GATK misses 5 variants in low-complexity regions. STK11 and KEAP1 — both treatment-relevant — not in the report. Pembrolizumab added to protocol.',
    'Germline Filter': 'Hard MAF filter incorrectly removes somatic BRCA2 variant. Driver mutation excluded from report. Treatment protocol incomplete.',
    'Clinical Report': 'EGFR-only report: osimertinib + pembrolizumab initiated. STK11 co-mutation predicts immunotherapy resistance. Disease progresses at 5 months.',
    'Contamination Check': '23% human reads contaminate all downstream analysis. Shannon diversity inflated by 34%. All diversity conclusions invalid. Peer review rejection.',
    'Unknown Reads': '277,200 reads discarded as noise. Novel IBD-associated phage lost. The discovery that defines the paper: gone. Reviewer 2 finds nothing novel.',
    'Diversity Calculation': 'Raw Shannon 3.8 submitted. Residual contaminants inflate diversity by 52%. Reviewer 2 identifies the artifact. Major revision required.',
    'Publication Decision': 'Paper submitted without novel phage validation. Reviewer 2 flags human contamination. 6-month revision. Journal confidence reduced.',
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: '#0a0f1e', color: '#e8eaf0', fontFamily: 'DM Sans, sans-serif' }}
    >
      {/* Replay modal */}
      {replayModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setReplayModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-6"
            style={{ background: '#1a2235', border: '1px solid rgba(239,68,68,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: '#ef4444', fontFamily: 'IBM Plex Mono, monospace' }}
            >
              Alternate Outcome: {replayModal.stepLabel}
            </div>
            <h3 className="font-semibold text-base mb-1" style={{ color: '#e8eaf0' }}>
              You chose: {replayModal.choiceLabel}
            </h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#8892a4' }}>
              {ALTERNATE_OUTCOMES[replayModal.stepLabel] || replayModal.outcome.note as string}
            </p>
            <div
              className="p-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
            >
              Actual outcome: {replayModal.outcome.note as string}
            </div>
            <button
              onClick={() => setReplayModal(null)}
              className="mt-4 w-full py-2.5 rounded-xl text-sm transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#8892a4' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ background: '#0f1729', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{scenario.emoji}</span>
          <span className="font-semibold text-sm" style={{ color: '#e8eaf0' }}>
            {scenario.title} — Results
          </span>
        </div>
        <div
          className="text-xs px-3 py-1 rounded-lg"
          style={{ background: 'rgba(0,212,170,0.08)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)', fontFamily: 'IBM Plex Mono, monospace' }}
        >
          ⬡ OmicsMind · GenoFlow Agency
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-10 xl:px-10 2xl:px-16">
        {/* Score cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Overall Score', value: `${scoreDisplay}/100`, color: '#c9a84c' },
            { label: 'Optimal Decisions', value: `${optimalCount}/${decisions.length}`, color: '#00d4aa' },
            { label: 'AI Reasoning', value: `${aiReasoningDisplay}%`, color: '#a78bfa' },
          ].map(card => (
            <div
              key={`outcome-${card.label}`}
              className="rounded-2xl p-5 text-center"
              style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="text-xs mb-2" style={{ color: '#8892a4', letterSpacing: '0.05em' }}>
                {card.label}
              </div>
              <div
                className="text-4xl font-bold"
                style={{ color: card.color, fontFamily: 'IBM Plex Mono, monospace', fontVariantNumeric: 'tabular-nums' }}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div
            className="rounded-2xl px-8 py-6 text-center"
            style={{ background: badge.bg, border: `1px solid ${badge.border}`, boxShadow: `0 0 40px ${badge.bg}` }}
          >
            <div className="text-5xl mb-3">{badge.emoji}</div>
            <div
              className="text-2xl font-bold mb-1"
              style={{ color: badge.color }}
            >
              {badge.label}
            </div>
            <div className="text-sm" style={{ color: '#8892a4' }}>
              {score >= 85
                ? 'You made all optimal decisions. You think like a senior bioinformatician.'
                : score >= 65
                ? 'Strong AI-assisted reasoning. A few classical instincts to overcome.' :'Solid foundation. The AI pathway reveals what classical methods miss.'}
            </div>
          </div>
        </div>

        {/* Wow moment */}
        <div
          className="rounded-2xl p-6 mb-8"
          style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.25)' }}
        >
          <div
            className="text-xs font-bold tracking-widest uppercase mb-3"
            style={{ color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace' }}
          >
            🔬 The Key Discovery
          </div>
          <p className="text-base leading-relaxed" style={{ color: '#e8eaf0', lineHeight: 1.8 }}>
            {scenario.wowMoment}
          </p>
        </div>

        {/* Replay decisions */}
        <div className="mb-8">
          <h3 className="font-semibold text-base mb-4" style={{ color: '#e8eaf0' }}>
            What if you had chosen differently?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {decisions.map(d => (
              <button
                key={`replay-${d.step}`}
                onClick={() => setReplayModal(d)}
                className="rounded-xl p-4 text-left transition-all duration-150 active:scale-95"
                style={{
                  background: d.isOptimal ? 'rgba(34,197,94,0.05)' : 'rgba(245,158,11,0.05)',
                  border: `1px solid ${d.isOptimal ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
                }}
              >
                <div
                  className="text-xs font-semibold mb-1"
                  style={{ color: d.isOptimal ? '#22c55e' : '#f59e0b', fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  Step {d.step + 1}: {d.stepLabel}
                </div>
                <div className="text-xs leading-snug" style={{ color: '#8892a4' }}>
                  {d.choiceLabel}
                </div>
                <div
                  className="text-xs mt-2 font-medium"
                  style={{ color: d.isOptimal ? '#22c55e' : '#f59e0b' }}
                >
                  {d.isOptimal ? '✓ Optimal' : '⚠ Suboptimal'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={onDownloadCert}
            className="px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #c9a84c, #f0d080)',
              color: '#0a0f1e',
              boxShadow: '0 0 24px rgba(201,168,76,0.3)',
            }}
          >
            🏆 Download Certificate
          </button>
          <button
            onClick={onTryAnother}
            className="px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #00d4aa, #0f9d8a)',
              color: '#0a0f1e',
            }}
          >
            Try Another Scenario →
          </button>
          <button
            onClick={handleShare}
            className="px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: copied ? '#00d4aa' : '#e8eaf0',
            }}
          >
            {copied ? '✓ Copied!' : '⎘ Share Result'}
          </button>
        </div>
      </div>
    </div>
  );
}
