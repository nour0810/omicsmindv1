'use client';

import React, { useEffect, useState } from 'react';
import { type Scenario } from '@/data/scenarios';
import { type Decision } from './SimulatorClient';

interface SummaryCardsProps {
  scenario: Scenario;
  decisions: Decision[];
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
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

export default function SummaryCards({ scenario, decisions }: SummaryCardsProps) {
  const optimalCount = decisions.filter(d => d.isOptimal).length;
  const aiConfidence = 55 + optimalCount * 10 + (scenario.id === 'metagenomics' ? 4 : 0);
  const coverageDisplay = useCountUp(scenario.sampleData.coverage);
  const variantCount = scenario.id === 'tumor_wgs' ? 23 : scenario.id === 'metagenomics' ? 8 : 31;
  const variantDisplay = useCountUp(variantCount);
  const confidenceDisplay = useCountUp(aiConfidence);

  const classicalResult = scenario.classicalResult;
  const aiResult = scenario.aiResult;

  const MISSED_ITEMS: Record<string, string[]> = {
    bacterial_wgs: [
      '2 novel OXA-type resistance genes (64% identity)',
      '14kb genomic island — not in reference database',
      'Correct antibiotic recommendation (meropenem failure)',
    ],
    tumor_wgs: [
      'STK11 co-mutation at 4.2% VAF (subclonal)',
      '5 variants in low-complexity regions (GATK)',
      'Immunotherapy resistance prediction',
    ],
    metagenomics: [
      'Novel IBD-associated temperate phage',
      'Shannon diversity inflated by 34% (contamination)',
      'Paper would require major revision',
    ],
  };

  const AI_DISCOVERED: Record<string, string[]> = {
    bacterial_wgs: [
      'OXA-900 carbapenemase (novel, not in any database)',
      'Complete 14kb genomic island via de novo assembly',
      'Correct treatment: Colistin + Tigecycline (78% success)',
    ],
    tumor_wgs: [
      'STK11 co-mutation at 4.2% VAF — immunotherapy resistance',
      'KEAP1 + CDKN2A variants in low-complexity regions',
      'Targeted monotherapy: 78% 2-year response rate',
    ],
    metagenomics: [
      'Novel phage IBD1 — IBD-associated, now published',
      'Corrected Shannon diversity: 2.5 (real value)',
      'Paper accepted in Nature Microbiology',
    ],
  };

  const missed = MISSED_ITEMS[scenario.id] || MISSED_ITEMS['bacterial_wgs'];
  const discovered = AI_DISCOVERED[scenario.id] || AI_DISCOVERED['bacterial_wgs'];

  return (
    <div className="space-y-4">
      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Coverage Depth', value: `${coverageDisplay}x`, sub: 'Mean across genome', color: '#00d4aa' },
          { label: 'Variants Found', value: String(variantDisplay), sub: `Classical: ${classicalResult.variants ?? classicalResult.species ?? classicalResult.diversity}`, color: '#a78bfa' },
          { label: 'AI Confidence', value: `${confidenceDisplay}%`, sub: `Classical: ${classicalResult.confidence ?? classicalResult.clinical_confidence ?? '61%'}`, color: '#c9a84c' },
        ].map(card => (
          <div
            key={`summary-${card.label}`}
            className="rounded-2xl p-4 text-center"
            style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="text-xs mb-2" style={{ color: '#8892a4', letterSpacing: '0.05em' }}>
              {card.label}
            </div>
            <div
              className="text-3xl font-bold mb-1"
              style={{ color: card.color, fontFamily: 'IBM Plex Mono, monospace', fontVariantNumeric: 'tabular-nums' }}
            >
              {card.value}
            </div>
            <div className="text-xs" style={{ color: '#8892a4', fontFamily: 'IBM Plex Mono, monospace' }}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Key Finding */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.25)' }}
      >
        <div
          className="text-xs font-bold tracking-widest uppercase mb-2"
          style={{ color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace' }}
        >
          🔬 Key Finding
        </div>
        <p className="text-sm leading-relaxed" style={{ color: '#e8eaf0' }}>
          {scenario.wowMoment}
        </p>
      </div>

      {/* Classical vs AI comparison */}
      <div className="grid grid-cols-2 gap-4">
        {/* Classical missed */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <div
            className="text-xs font-bold tracking-widest uppercase mb-3"
            style={{ color: '#ef4444', fontFamily: 'IBM Plex Mono, monospace' }}
          >
            Classical missed:
          </div>
          <ul className="space-y-2">
            {missed.map((item, i) => (
              <li key={`missed-${i}`} className="flex items-start gap-2 text-xs" style={{ color: '#8892a4' }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }}>✗</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* AI discovered */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.2)' }}
        >
          <div
            className="text-xs font-bold tracking-widest uppercase mb-3"
            style={{ color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace' }}
          >
            AI discovered:
          </div>
          <ul className="space-y-2">
            {discovered.map((item, i) => (
              <li key={`disc-${i}`} className="flex items-start gap-2 text-xs" style={{ color: '#8892a4' }}>
                <span style={{ color: '#00d4aa', flexShrink: 0, marginTop: 1 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
