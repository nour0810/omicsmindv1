'use client';

import React from 'react';
import { type ScenarioStep, type Scenario } from '@/data/scenarios';
import { type Decision } from './SimulatorClient';
import QualityChart from './QualityChart';
import ReadPileup from './ReadPileup';
import VariantTable from './VariantTable';
import SummaryCards from './SummaryCards';

interface VisualizationPanelProps {
  step: ScenarioStep;
  scenario: Scenario;
  qcThreshold: number;
  vafThreshold: number;
  alignerMode: string;
  decisionMade: boolean;
  decisions: Decision[];
  onThresholdChange: (v: number) => void;
  onVafChange: (v: number) => void;
  onAlignerChange: (v: string) => void;
}

export default function VisualizationPanel({
  step,
  scenario,
  qcThreshold,
  vafThreshold,
  alignerMode,
  decisionMade,
  decisions,
  onThresholdChange,
  onVafChange,
  onAlignerChange,
}: VisualizationPanelProps) {
  return (
    <div className="space-y-4">
      {/* Step visualization label */}
      <div className="flex items-center gap-3">
        <div
          className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
          style={{
            background: 'rgba(0,212,170,0.08)',
            color: '#00d4aa',
            border: '1px solid rgba(0,212,170,0.2)',
            fontFamily: 'IBM Plex Mono, monospace',
          }}
        >
          {step.label} — Data Visualization
        </div>
      </div>

      {/* Sample metadata card */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: 'Coverage', value: `${scenario.sampleData.coverage}x`, color: '#00d4aa' },
          { label: 'GC Content', value: `${scenario.sampleData.gc}%`, color: '#a78bfa' },
          { label: 'Total Reads', value: `${(scenario.sampleData.reads / 1e6).toFixed(1)}M`, color: '#f0d080' },
          { label: 'Mapping Rate', value: `${Math.round(scenario.sampleData.mapping_rate * 100)}%`,
            color: scenario.sampleData.mapping_rate < 0.8 ? '#ef4444' : '#22c55e' },
        ].map(item => (
          <div
            key={`meta-${item.label}`}
            className="rounded-xl px-4 py-3"
            style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="text-xs mb-1"
              style={{ color: '#8892a4', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.05em' }}
            >
              {item.label}
            </div>
            <div
              className="text-xl font-bold"
              style={{ color: item.color, fontFamily: 'IBM Plex Mono, monospace', fontVariantNumeric: 'tabular-nums' }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main visualization */}
      {step.visualization === 'quality_chart' && (
        <QualityChart
          threshold={qcThreshold}
          onThresholdChange={onThresholdChange}
          decisionMade={decisionMade}
          scenarioId={scenario.id}
        />
      )}
      {step.visualization === 'pileup' && (
        <ReadPileup
          mode={alignerMode}
          onModeChange={onAlignerChange}
          snpPosition={scenario.snpPosition}
          decisionMade={decisionMade}
          scenarioId={scenario.id}
        />
      )}
      {step.visualization === 'variant_table' && (
        <VariantTable
          vafThreshold={vafThreshold}
          onVafChange={onVafChange}
          decisionMade={decisionMade}
          scenarioId={scenario.id}
          decisions={decisions}
        />
      )}
      {step.visualization === 'summary' && (
        <SummaryCards
          scenario={scenario}
          decisions={decisions}
        />
      )}
    </div>
  );
}
