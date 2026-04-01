'use client';

import React from 'react';
import { type Scenario } from '@/data/scenarios';
import { type Decision, type ChatMessage } from './SimulatorClient';

interface ComparisonScreenProps {
  scenario: Scenario;
  decisions: Decision[];
  score: number;
  chatMessages: ChatMessage[];
  isTyping: boolean;
  onContinue: () => void;
}

export default function ComparisonScreen({
  scenario,
  decisions,
  score,
  chatMessages,
  isTyping,
  onContinue,
}: ComparisonScreenProps) {
  const COLOR_MAP: Record<string, string> = {
    teal: '#00d4aa',
    purple: '#a78bfa',
    amber: '#f0d080',
  };
  const accent = COLOR_MAP[scenario.color] || '#00d4aa';

  const cr = scenario.classicalResult;
  const ar = scenario.aiResult;

  const compRows: Array<{
    label: string;
    classical: string;
    ai: string;
    delta: string;
    better: boolean;
  }> = scenario.id === 'bacterial_wgs'
    ? [
        { label: 'Variants identified', classical: String(cr.variants), ai: String(ar.variants), delta: `+${(ar.variants as number) - (cr.variants as number)}`, better: true },
        { label: 'Resistance genes', classical: String(cr.resistance_genes), ai: String((ar as Record<string,unknown>).resistance_genes), delta: `+${((ar as Record<string,unknown>).resistance_genes as number) - (cr.resistance_genes as number)}`, better: true },
        { label: 'Clinical confidence', classical: String(cr.clinical_confidence), ai: String(ar.clinical_confidence), delta: '↑', better: true },
        { label: 'Novel features', classical: '0', ai: '1 ★', delta: '+1', better: true },
        { label: 'Correct treatment', classical: 'Meropenem ✗', ai: 'Colistin combo ✓', delta: '—', better: true },
      ]
    : scenario.id === 'tumor_wgs'
    ? [
        { label: 'Variants found', classical: String(cr.variants), ai: String(ar.variants), delta: `+${(ar.variants as number) - (cr.variants as number)}`, better: true },
        { label: 'Actionable variants', classical: String(cr.actionable), ai: String((ar as Record<string,unknown>).actionable), delta: `+${((ar as Record<string,unknown>).actionable as number) - (cr.actionable as number)}`, better: true },
        { label: 'Clinical confidence', classical: String(cr.clinical_confidence), ai: String(ar.clinical_confidence), delta: '↑', better: true },
        { label: 'Subclonal variants', classical: '0', ai: '3', delta: '+3', better: true },
        { label: '2-year survival', classical: '41%', ai: '78%', delta: '+37%', better: true },
      ]
    : [
        { label: 'Shannon diversity', classical: String(cr.diversity), ai: String(ar.diversity), delta: 'Corrected', better: true },
        { label: 'Species identified', classical: String(cr.species), ai: String(ar.species), delta: 'Accurate', better: true },
        { label: 'AI confidence', classical: String(cr.confidence), ai: String(ar.confidence), delta: '+33%', better: true },
        { label: 'Novel discoveries', classical: '0', ai: '1 (phage)', delta: '+1', better: true },
        { label: 'Publication outcome', classical: 'Rejected', ai: 'Nature Microbiology', delta: '★', better: true },
      ];

  const comparisonMessages = chatMessages.filter(m => m.role === 'ai' && !m.badge);

  return (
    <div
      className="min-h-screen"
      style={{ background: '#0a0f1e', color: '#e8eaf0', fontFamily: 'DM Sans, sans-serif' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between"
        style={{ background: '#0f1729', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{scenario.emoji}</span>
          <div>
            <div className="font-semibold text-sm" style={{ color: '#e8eaf0' }}>
              AI vs Classical — What Changed?
            </div>
            <div className="text-xs" style={{ color: accent }}>
              {scenario.title}
            </div>
          </div>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}
        >
          <span className="text-xs" style={{ color: '#8892a4' }}>Final Score</span>
          <span
            className="font-bold"
            style={{ color: '#c9a84c', fontFamily: 'IBM Plex Mono, monospace' }}
          >
            {score}/100
          </span>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-8 xl:px-10 2xl:px-16">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#e8eaf0' }}>
            AI vs Classical — What Changed?
          </h1>
          <p className="text-base" style={{ color: accent }}>
            {scenario.title} · {decisions.filter(d => d.isOptimal).length}/{decisions.length} optimal decisions
          </p>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Classical */}
          <div
            className="rounded-2xl p-6"
            style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="px-3 py-1 rounded-lg text-xs font-bold tracking-widest uppercase"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#8892a4', fontFamily: 'IBM Plex Mono, monospace' }}
              >
                CLASSICAL PIPELINE
              </div>
            </div>
            <div className="space-y-3">
              {compRows.map(row => (
                <div
                  key={`cr-${row.label}`}
                  className="flex items-center justify-between py-2 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  <span className="text-sm" style={{ color: '#8892a4' }}>{row.label}</span>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: '#e8eaf0', fontFamily: 'IBM Plex Mono, monospace' }}
                  >
                    {row.classical}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="mt-4 p-3 rounded-xl text-xs"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#8892a4' }}
            >
              <div className="font-semibold mb-2" style={{ color: '#ef4444' }}>Missed:</div>
              {scenario.id === 'bacterial_wgs' && (
                <ul className="space-y-1">
                  <li>• 2 novel resistance genes (OXA-type)</li>
                  <li>• 14kb genomic island</li>
                  <li>• Carbapenem resistance → treatment failure</li>
                </ul>
              )}
              {scenario.id === 'tumor_wgs' && (
                <ul className="space-y-1">
                  <li>• STK11 co-mutation at 4.2% VAF</li>
                  <li>• 5 variants in low-complexity regions</li>
                  <li>• Immunotherapy resistance prediction</li>
                </ul>
              )}
              {scenario.id === 'metagenomics' && (
                <ul className="space-y-1">
                  <li>• Novel IBD-associated phage</li>
                  <li>• 23% human contamination</li>
                  <li>• Inflated Shannon diversity (+34%)</li>
                </ul>
              )}
            </div>
          </div>

          {/* AI */}
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: '#1a2235',
              border: `1px solid ${accent}`,
              boxShadow: `0 0 30px ${accent}1a`,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="px-3 py-1 rounded-lg text-xs font-bold tracking-widest uppercase"
                style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44`, fontFamily: 'IBM Plex Mono, monospace' }}
              >
                AI-ASSISTED ANALYSIS
              </div>
              <span
                className="ml-auto px-2 py-0.5 rounded text-xs font-bold"
                style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }}
              >
                ELITE
              </span>
            </div>
            <div className="space-y-3">
              {compRows.map(row => (
                <div
                  key={`ar-${row.label}`}
                  className="flex items-center justify-between py-2 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  <span className="text-sm" style={{ color: '#8892a4' }}>{row.label}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: accent, fontFamily: 'IBM Plex Mono, monospace' }}
                    >
                      {row.ai}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-bold"
                      style={{ background: `${accent}18`, color: accent, fontFamily: 'IBM Plex Mono, monospace' }}
                    >
                      {row.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="mt-4 p-3 rounded-xl text-xs"
              style={{ background: `${accent}08`, border: `1px solid ${accent}30`, color: '#8892a4' }}
            >
              <div className="font-semibold mb-2" style={{ color: accent }}>Discovered:</div>
              {scenario.id === 'bacterial_wgs' && (
                <ul className="space-y-1">
                  <li>• OXA-900 carbapenemase (novel)</li>
                  <li>• Complete 14kb genomic island</li>
                  <li>• Correct treatment: Colistin + Tigecycline</li>
                </ul>
              )}
              {scenario.id === 'tumor_wgs' && (
                <ul className="space-y-1">
                  <li>• STK11 subclonal mutation at 4.2% VAF</li>
                  <li>• All 5 GATK-missed variants recovered</li>
                  <li>• Monotherapy protocol: 78% 2-yr response</li>
                </ul>
              )}
              {scenario.id === 'metagenomics' && (
                <ul className="space-y-1">
                  <li>• Novel phage IBD1 (publishable finding)</li>
                  <li>• True Shannon diversity: 2.5</li>
                  <li>• Accepted: Nature Microbiology</li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* AI Narrative */}
        <div
          className="rounded-2xl p-6 mb-8"
          style={{ background: '#1a1535', border: '1px solid rgba(0,212,170,0.2)' }}
        >
          <div
            className="text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-2"
            style={{ color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace' }}
          >
            <span>🧬</span>
            AI ANALYSIS SUMMARY
            {isTyping && (
              <div className="flex gap-1 ml-2">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            )}
          </div>
          {comparisonMessages.length > 0 ? (
            <p className="text-sm leading-relaxed" style={{ color: '#e8eaf0', lineHeight: 1.8 }}>
              {comparisonMessages[comparisonMessages.length - 1].text}
              {comparisonMessages[comparisonMessages.length - 1].streaming && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 14,
                    background: '#00d4aa',
                    marginLeft: 2,
                    verticalAlign: 'middle',
                    animation: 'blink 0.8s infinite',
                  }}
                />
              )}
            </p>
          ) : (
            <p className="text-sm" style={{ color: '#8892a4' }}>
              Generating AI narrative...
            </p>
          )}
        </div>

        {/* Key insight */}
        <div
          className="rounded-2xl p-6 mb-8 text-center"
          style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.2)' }}
        >
          <p className="text-base font-semibold leading-relaxed" style={{ color: '#e8eaf0' }}>
            &ldquo;Classical bioinformatics finds what it knows to look for.
            <span style={{ color: '#00d4aa' }}> AI finds what it doesn&apos;t know exists.</span>&rdquo;
          </p>
        </div>

        {/* Continue button */}
        <div className="flex justify-center">
          <button
            onClick={onContinue}
            className="px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #00d4aa, #0f9d8a)',
              color: '#0a0f1e',
              boxShadow: '0 0 30px rgba(0,212,170,0.3)',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            Continue to Results →
          </button>
        </div>
      </div>
    </div>
  );
}
