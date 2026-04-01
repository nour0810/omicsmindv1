'use client';

import React, { useRef, useEffect, useState } from 'react';

interface ReadPileupProps {
  mode: string;
  onModeChange: (mode: string) => void;
  snpPosition: number;
  decisionMade: boolean;
  scenarioId: string;
}

const NUC_COLORS: Record<string, string> = {
  A: '#22c55e',
  T: '#ef4444',
  C: '#3b82f6',
  G: '#f59e0b',
};

const BASES = ['A', 'T', 'C', 'G'];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateRefSequence(length: number, seed: number) {
  const rand = seededRandom(seed);
  return Array.from({ length }, () => BASES[Math.floor(rand() * 4)]);
}

interface ReadData {
  start: number;
  end: number;
  quality: number;
  mismatches: number[];
  altBase: string;
}

function generateReads(refSeq: string[], snpPos: number, mode: string, seed: number): ReadData[] {
  const rand = seededRandom(seed + (mode === 'denovo' || mode === 'deepvariant' || mode === 'ai' ? 100 : 0));
  const readCount = mode === 'denovo' || mode === 'deepvariant' || mode === 'ai' ? 18 : 12;
  const reads: ReadData[] = [];
  for (let i = 0; i < readCount; i++) {
    const start = Math.floor(rand() * 10);
    const length = 35 + Math.floor(rand() * 20);
    const end = Math.min(start + length, refSeq.length - 1);
    const quality = 25 + Math.floor(rand() * 16);
    const mismatches: number[] = [];
    // SNP at snpPos if read covers it
    if (start <= snpPos && end >= snpPos) {
      mismatches.push(snpPos);
    }
    // Random mismatches (sequencing errors)
    if (rand() > 0.7) {
      const errPos = start + Math.floor(rand() * (end - start));
      if (errPos !== snpPos) mismatches.push(errPos);
    }
    reads.push({ start, end, quality, mismatches, altBase: 'T' });
  }
  return reads;
}

export default function ReadPileup({
  mode,
  onModeChange,
  snpPosition,
  decisionMade,
  scenarioId,
}: ReadPileupProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const seed = scenarioId === 'tumor_wgs' ? 42 : scenarioId === 'metagenomics' ? 77 : 13;
  const refSeq = generateRefSequence(60, seed);
  const reads = generateReads(refSeq, snpPosition, mode, seed);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const BASE_W = Math.floor(W / 60);
    const REF_H = 22;
    const READ_H = 6;
    const READ_GAP = 8;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0a0f1e';
    ctx.fillRect(0, 0, W, H);

    // SNP column glow
    const snpX = snpPosition * BASE_W;
    const grd = ctx.createLinearGradient(snpX, 0, snpX + BASE_W, 0);
    grd.addColorStop(0, 'rgba(0,212,170,0)');
    grd.addColorStop(0.5, 'rgba(0,212,170,0.18)');
    grd.addColorStop(1, 'rgba(0,212,170,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(snpX - 2, 0, BASE_W + 4, H);

    // Reference sequence
    refSeq.forEach((base, i) => {
      const x = i * BASE_W;
      ctx.fillStyle = NUC_COLORS[base] || '#e8eaf0';
      ctx.fillRect(x + 1, 2, BASE_W - 2, REF_H - 4);

      ctx.fillStyle = '#0a0f1e';
      ctx.font = `bold ${Math.max(9, BASE_W - 4)}px IBM Plex Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(base, x + BASE_W / 2, REF_H / 2);
    });

    // Reads
    reads.forEach((read, ri) => {
      const y = REF_H + 4 + ri * (READ_H + READ_GAP);
      if (y + READ_H > H) return;

      const opacity = 0.35 + (read.quality / 40) * 0.55;
      ctx.fillStyle = `rgba(0,212,170,${opacity})`;
      ctx.fillRect(read.start * BASE_W, y, (read.end - read.start) * BASE_W, READ_H);

      // Mismatches
      read.mismatches.forEach(mPos => {
        if (mPos >= read.start && mPos <= read.end) {
          ctx.fillStyle = '#ff6b35';
          ctx.fillRect(mPos * BASE_W + 1, y, BASE_W - 2, READ_H);
        }
      });
    });

    // SNP label
    ctx.fillStyle = '#00d4aa';
    ctx.font = '10px IBM Plex Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('SNP', snpPosition * BASE_W + BASE_W / 2, H - 14);

    // Position ruler
    ctx.fillStyle = '#8892a4';
    ctx.font = '9px IBM Plex Mono, monospace';
    ctx.textAlign = 'center';
    [0, 15, 30, 45, 59].forEach(pos => {
      ctx.fillText(String(pos + 1), pos * BASE_W + BASE_W / 2, H - 4);
    });
  }, [mode, snpPosition, reads, refSeq]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const BASE_W = Math.floor(canvas.width / 60);
    const REF_H = 22;
    const READ_H = 6;
    const READ_GAP = 8;

    const baseIdx = Math.floor(x / BASE_W);
    const readIdx = Math.floor((y - REF_H - 4) / (READ_H + READ_GAP));

    if (readIdx >= 0 && readIdx < reads.length) {
      const read = reads[readIdx];
      if (baseIdx >= read.start && baseIdx <= read.end) {
        setTooltip({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          text: `MQ: ${read.quality} | Len: ${read.end - read.start}bp | ${read.mismatches.includes(baseIdx) ? 'MISMATCH' : 'Match'}`,
        });
        return;
      }
    }
    setTooltip(null);
  };

  const modeButtons =
    scenarioId === 'tumor_wgs'
      ? [
          { value: 'gatk', label: 'GATK HaplotypeCaller', desc: 'Classical' },
          { value: 'deepvariant', label: 'DeepVariant', desc: 'Deep Learning' },
        ]
      : scenarioId === 'metagenomics'
      ? [
          { value: 'discard', label: 'Discard Unknown', desc: 'Standard' },
          { value: 'investigate', label: 'Investigate Reads', desc: 'AI Anomaly' },
        ]
      : [
          { value: 'reference', label: 'Reference Mapping', desc: 'BWA MEM' },
          { value: 'denovo', label: 'De novo Assembly', desc: 'SPAdes' },
        ];

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm mb-0.5" style={{ color: '#e8eaf0' }}>
            Read Alignment Pileup
          </h3>
          <p className="text-xs" style={{ color: '#8892a4' }}>
            60-base window · SNP position highlighted · Orange = mismatch
          </p>
        </div>
        <div
          className="flex items-center gap-2 text-xs"
          style={{ fontFamily: 'IBM Plex Mono, monospace' }}
        >
          {[
            { color: '#22c55e', label: 'A' },
            { color: '#ef4444', label: 'T' },
            { color: '#3b82f6', label: 'C' },
            { color: '#f59e0b', label: 'G' },
          ].map(n => (
            <span key={`nuc-leg-${n.label}`} style={{ color: n.color }}>{n.label}</span>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden mb-4" style={{ background: '#0a0f1e' }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={220}
          className="w-full"
          style={{ display: 'block', cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        />
        {tooltip && (
          <div
            className="absolute pointer-events-none px-2 py-1.5 rounded-lg text-xs z-10"
            style={{
              left: Math.min(tooltip.x + 12, 460),
              top: Math.max(tooltip.y - 30, 4),
              background: '#1a2235',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e8eaf0',
              fontFamily: 'IBM Plex Mono, monospace',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              whiteSpace: 'nowrap',
            }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      {/* Mode buttons */}
      <div className="grid grid-cols-2 gap-3">
        {modeButtons.map(btn => (
          <button
            key={`mode-${btn.value}`}
            onClick={() => !decisionMade && onModeChange(btn.value)}
            disabled={decisionMade}
            className="rounded-xl px-4 py-3 text-left transition-all duration-200 active:scale-[0.98]"
            style={{
              background: mode === btn.value ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${mode === btn.value ? '#00d4aa' : 'rgba(255,255,255,0.08)'}`,
              opacity: decisionMade && mode !== btn.value ? 0.4 : 1,
            }}
          >
            <div className="font-semibold text-sm mb-0.5" style={{ color: mode === btn.value ? '#00d4aa' : '#e8eaf0' }}>
              {btn.label}
            </div>
            <div className="text-xs" style={{ color: '#8892a4', fontFamily: 'IBM Plex Mono, monospace' }}>
              {btn.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div
        className="mt-3 p-3 rounded-xl flex items-center justify-between text-xs"
        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span style={{ color: '#8892a4' }}>
          Reads shown: <span style={{ color: '#e8eaf0', fontFamily: 'IBM Plex Mono, monospace' }}>{reads.length}</span>
        </span>
        <span style={{ color: '#8892a4' }}>
          Mismatches: <span style={{ color: '#ff6b35', fontFamily: 'IBM Plex Mono, monospace' }}>{reads.filter(r => r.mismatches.length > 0).length}</span>
        </span>
        <span style={{ color: '#8892a4' }}>
          SNP pos: <span style={{ color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace' }}>{snpPosition + 1}</span>
        </span>
      </div>
    </div>
  );
}
