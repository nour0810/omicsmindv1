'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

interface QualityChartProps {
  threshold: number;
  onThresholdChange: (v: number) => void;
  decisionMade: boolean;
  scenarioId: string;
}

// Generate realistic FastQC-style quality data
function generateQualityData(scenarioId: string) {
  const data = [];
  const seed = scenarioId === 'tumor_wgs' ? 2 : scenarioId === 'metagenomics' ? 3 : 1;
  for (let i = 1; i <= 150; i++) {
    let score: number;
    if (i <= 10) {
      // Ramp up at start
      score = 28 + (i / 10) * 6 + (seed * 0.3);
    } else if (i <= 120) {
      // Good quality zone with realistic noise
      const noise = ((i * seed * 7919) % 7) - 3;
      score = 35 + noise - (i > 100 ? (i - 100) * 0.05 : 0);
    } else {
      // 3-prime degradation
      const drop = ((i - 120) / 30) * 18;
      const noise = ((i * seed * 6271) % 5) - 2;
      score = 35 - drop + noise;
    }
    data.push({
      position: i,
      score: Math.max(2, Math.min(40, Math.round(score * 10) / 10)),
    });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: number;
}) => {
  if (active && payload && payload.length) {
    let score = payload[0].value;
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs"
        style={{
          background: '#1a2235',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#e8eaf0',
          fontFamily: 'IBM Plex Mono, monospace',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <div>Position: <span style={{ color: '#00d4aa' }}>{label}</span></div>
        <div>Phred: <span style={{ color: score >= 30 ? '#00d4aa' : score >= 20 ? '#f59e0b' : '#ef4444' }}>{score}</span></div>
      </div>
    );
  }
  return null;
};

export default function QualityChart({
  threshold,
  onThresholdChange,
  decisionMade,
  scenarioId,
}: QualityChartProps) {
  const data = generateQualityData(scenarioId);
  const [localThreshold, setLocalThreshold] = useState(threshold);

  useEffect(() => {
    setLocalThreshold(threshold);
  }, [threshold]);

  const above = data.filter(d => d.score >= localThreshold).length;
  const keptPct = Math.round((above / data.length) * 100);
  const falseVars = localThreshold < 20 ? 12 : localThreshold < 25 ? 7 : localThreshold < 30 ? 4 : localThreshold < 35 ? 1 : 0;

  const getBarColor = (score: number) => {
    if (score >= localThreshold) return '#00d4aa';
    if (score >= 20) return '#f59e0b';
    return '#ef4444';
  };

  // Downsample for performance — show every 3rd point
  const displayData = data.filter((_, i) => i % 3 === 0);

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm mb-0.5" style={{ color: '#e8eaf0' }}>
            Per-Base Quality Score
          </h3>
          <p className="text-xs" style={{ color: '#8892a4' }}>
            FastQC — 150bp reads · Phred score per position
          </p>
        </div>
        <div
          className="text-xs px-2 py-1 rounded"
          style={{ background: 'rgba(0,212,170,0.08)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)', fontFamily: 'IBM Plex Mono, monospace' }}
        >
          Q{localThreshold} threshold
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }} barCategoryGap="0%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="position"
              tick={{ fill: '#8892a4', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Base Position', position: 'insideBottom', offset: -2, fill: '#8892a4', fontSize: 10 }}
            />
            <YAxis
              domain={[0, 42]}
              tick={{ fill: '#8892a4', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Phred', angle: -90, position: 'insideLeft', fill: '#8892a4', fontSize: 10 }}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={localThreshold}
              stroke="#c9a84c"
              strokeWidth={2}
              strokeDasharray="6 3"
              label={{ value: `Q${localThreshold}`, fill: '#c9a84c', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', position: 'right' }}
            />
            <ReferenceLine y={30} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <ReferenceLine y={20} stroke="rgba(239,68,68,0.2)" strokeDasharray="3 3" />
            <Bar dataKey="score" radius={[1, 1, 0, 0]}>
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quality zones legend */}
      <div className="flex gap-4 mt-2 mb-4">
        {[
          { color: '#00d4aa', label: `≥ Q${localThreshold} (keep)` },
          { color: '#f59e0b', label: 'Q20–29 (borderline)' },
          { color: '#ef4444', label: '< Q20 (discard)' },
        ].map(item => (
          <div key={`legend-${item.label}`} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: item.color }} />
            <span className="text-xs" style={{ color: '#8892a4', fontFamily: 'IBM Plex Mono, monospace' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Threshold slider */}
      <div
        className="p-4 rounded-xl"
        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: '#e8eaf0' }}>
            Quality threshold (Phred)
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: '#c9a84c', fontFamily: 'IBM Plex Mono, monospace' }}
          >
            Q{localThreshold}
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="40"
          value={localThreshold}
          onChange={e => {
            const v = Number(e.target.value);
            setLocalThreshold(v);
            onThresholdChange(v);
          }}
          className="w-full mb-3"
          style={{ accentColor: '#c9a84c' }}
          disabled={decisionMade}
        />

        {/* Live stats */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-lg px-3 py-2 text-center"
            style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)' }}
          >
            <div className="text-xs mb-0.5" style={{ color: '#8892a4' }}>Reads kept</div>
            <div
              className="text-lg font-bold"
              style={{ color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace' }}
            >
              {keptPct}%
            </div>
          </div>
          <div
            className="rounded-lg px-3 py-2 text-center"
            style={{
              background: falseVars > 3 ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)',
              border: `1px solid ${falseVars > 3 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
            }}
          >
            <div className="text-xs mb-0.5" style={{ color: '#8892a4' }}>Expected false vars</div>
            <div
              className="text-lg font-bold"
              style={{ color: falseVars > 3 ? '#ef4444' : '#22c55e', fontFamily: 'IBM Plex Mono, monospace' }}
            >
              ~{falseVars}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
