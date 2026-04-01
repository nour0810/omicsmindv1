'use client';

import React, { useState } from 'react';
import { type Decision } from './SimulatorClient';

interface VariantTableProps {
  vafThreshold: number;
  onVafChange: (v: number) => void;
  decisionMade: boolean;
  scenarioId: string;
  decisions: Decision[];
}

interface Variant {
  id: string;
  chr: string;
  position: number;
  ref: string;
  alt: string;
  vaf: number;
  depth: number;
  consequence: 'synonymous' | 'missense' | 'stop-gain' | 'frameshift';
  gene: string;
  aiOnly: boolean;
}

const VARIANT_DATA: Record<string, Variant[]> = {
  bacterial_wgs: [
    { id: 'var-bact-001', chr: 'contig_1', position: 142350, ref: 'G', alt: 'A', vaf: 98.2, depth: 44, consequence: 'missense', gene: 'blaOXA-48', aiOnly: false },
    { id: 'var-bact-002', chr: 'contig_1', position: 287640, ref: 'C', alt: 'T', vaf: 96.8, depth: 41, consequence: 'synonymous', gene: 'ompK35', aiOnly: false },
    { id: 'var-bact-003', chr: 'contig_3', position: 14220, ref: 'ATG', alt: 'A', vaf: 94.1, depth: 38, consequence: 'frameshift', gene: 'ompK36', aiOnly: false },
    { id: 'var-bact-004', chr: 'contig_5', position: 8840, ref: 'T', alt: 'C', vaf: 99.3, depth: 46, consequence: 'missense', gene: 'aac(6\')Ib', aiOnly: false },
    { id: 'var-bact-005', chr: 'contig_7', position: 22100, ref: 'G', alt: 'T', vaf: 97.6, depth: 43, consequence: 'stop-gain', gene: 'mgrB', aiOnly: false },
    { id: 'var-bact-006', chr: 'contig_9', position: 3310, ref: 'A', alt: 'G', vaf: 95.4, depth: 40, consequence: 'missense', gene: 'wbaP', aiOnly: false },
    { id: 'var-bact-007', chr: 'island_1', position: 1240, ref: 'C', alt: 'A', vaf: 88.7, depth: 31, consequence: 'missense', gene: 'blaOXA-900*', aiOnly: true },
    { id: 'var-bact-008', chr: 'island_1', position: 2890, ref: 'T', alt: 'G', vaf: 91.2, depth: 36, consequence: 'missense', gene: 'blaOXA-900*', aiOnly: true },
    { id: 'var-bact-009', chr: 'contig_2', position: 67430, ref: 'G', alt: 'C', vaf: 93.8, depth: 39, consequence: 'synonymous', gene: 'ftsZ', aiOnly: false },
    { id: 'var-bact-010', chr: 'contig_4', position: 19870, ref: 'A', alt: 'T', vaf: 96.1, depth: 42, consequence: 'missense', gene: 'pmrB', aiOnly: false },
  ],
  tumor_wgs: [
    { id: 'var-tumor-001', chr: 'chr7', position: 55174772, ref: 'AATTAAGAGAAGC', alt: 'A', vaf: 34.2, depth: 98, consequence: 'frameshift', gene: 'EGFR exon19', aiOnly: false },
    { id: 'var-tumor-002', chr: 'chr7', position: 55181378, ref: 'C', alt: 'T', vaf: 28.7, depth: 94, consequence: 'missense', gene: 'EGFR T790M', aiOnly: false },
    { id: 'var-tumor-003', chr: 'chr17', position: 7674220, ref: 'G', alt: 'A', vaf: 22.4, depth: 87, consequence: 'missense', gene: 'TP53 R175H', aiOnly: false },
    { id: 'var-tumor-004', chr: 'chr3', position: 179234297, ref: 'C', alt: 'T', vaf: 18.9, depth: 82, consequence: 'missense', gene: 'PIK3CA', aiOnly: false },
    { id: 'var-tumor-005', chr: 'chr19', position: 1207014, ref: 'A', alt: 'C', vaf: 14.3, depth: 76, consequence: 'stop-gain', gene: 'STK11', aiOnly: true },
    { id: 'var-tumor-006', chr: 'chr2', position: 209113192, ref: 'G', alt: 'T', vaf: 11.8, depth: 71, consequence: 'missense', gene: 'KEAP1', aiOnly: true },
    { id: 'var-tumor-007', chr: 'chr9', position: 21974773, ref: 'C', alt: 'T', vaf: 9.6, depth: 64, consequence: 'frameshift', gene: 'CDKN2A', aiOnly: true },
    { id: 'var-tumor-008', chr: 'chr13', position: 32340300, ref: 'A', alt: 'G', vaf: 7.1, depth: 58, consequence: 'missense', gene: 'BRCA2', aiOnly: true },
    { id: 'var-tumor-009', chr: 'chr12', position: 25398284, ref: 'C', alt: 'A', vaf: 4.2, depth: 97, consequence: 'missense', gene: 'KRAS G12C', aiOnly: true },
    { id: 'var-tumor-010', chr: 'chr1', position: 27023530, ref: 'G', alt: 'A', vaf: 19.4, depth: 84, consequence: 'synonymous', gene: 'ARID1A', aiOnly: false },
  ],
  metagenomics: [
    { id: 'var-meta-001', chr: 'Bacteroides_fragilis', position: 1240300, ref: 'G', alt: 'A', vaf: 78.4, depth: 34, consequence: 'missense', gene: 'rpoB', aiOnly: false },
    { id: 'var-meta-002', chr: 'Faecalibacterium_prausnitzii', position: 880440, ref: 'C', alt: 'T', vaf: 61.2, depth: 28, consequence: 'synonymous', gene: 'gyrA', aiOnly: false },
    { id: 'var-meta-003', chr: 'Roseburia_intestinalis', position: 340120, ref: 'T', alt: 'G', vaf: 55.8, depth: 24, consequence: 'missense', gene: 'butyryl-CoA', aiOnly: false },
    { id: 'var-meta-004', chr: 'Akkermansia_muciniphila', position: 1890220, ref: 'A', alt: 'C', vaf: 48.3, depth: 21, consequence: 'missense', gene: 'Amuc_1100', aiOnly: false },
    { id: 'var-meta-005', chr: 'novel_phage_IBD1', position: 12440, ref: 'G', alt: 'T', vaf: 3.1, depth: 12, consequence: 'missense', gene: 'tail_fiber*', aiOnly: true },
    { id: 'var-meta-006', chr: 'novel_phage_IBD1', position: 28870, ref: 'C', alt: 'A', vaf: 2.8, depth: 11, consequence: 'frameshift', gene: 'integrase*', aiOnly: true },
    { id: 'var-meta-007', chr: 'Bifidobacterium_longum', position: 670340, ref: 'T', alt: 'C', vaf: 42.1, depth: 19, consequence: 'synonymous', gene: 'lacZ', aiOnly: false },
    { id: 'var-meta-008', chr: 'Eubacterium_rectale', position: 1120880, ref: 'G', alt: 'A', vaf: 37.6, depth: 17, consequence: 'missense', gene: 'but', aiOnly: false },
  ],
};

const CONSEQUENCE_LABELS: Record<string, { label: string; style: string }> = {
  synonymous: { label: 'Synonymous', style: 'badge-synonymous' },
  missense: { label: 'Missense', style: 'badge-missense' },
  'stop-gain': { label: 'Stop-gain', style: 'badge-stopgain' },
  frameshift: { label: 'Frameshift', style: 'badge-frameshift' },
};

const NUC_COLORS_TABLE: Record<string, string> = {
  A: '#22c55e', T: '#ef4444', C: '#3b82f6', G: '#f59e0b',
};

export default function VariantTable({
  vafThreshold,
  onVafChange,
  decisionMade,
  scenarioId,
  decisions,
}: VariantTableProps) {
  const [localThreshold, setLocalThreshold] = useState(vafThreshold);
  const [sortCol, setSortCol] = useState<keyof Variant>('vaf');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const variants = VARIANT_DATA[scenarioId] || VARIANT_DATA['bacterial_wgs'];

  const sorted = [...variants].sort((a, b) => {
    const av = a[sortCol];
    const bv = b[sortCol];
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'desc' ? bv - av : av - bv;
    }
    return sortDir === 'desc'
      ? String(bv).localeCompare(String(av))
      : String(av).localeCompare(String(bv));
  });

  const classicalCount = variants.filter(v => !v.aiOnly).length;
  const aiCount = variants.length;
  const filteredCount = sorted.filter(v => v.vaf >= localThreshold).length;

  const handleSort = (col: keyof Variant) => {
    if (sortCol === col) {
      setSortDir(d => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ col }: { col: keyof Variant }) => (
    <span style={{ color: sortCol === col ? '#00d4aa' : '#8892a4', fontSize: 10 }}>
      {sortCol === col ? (sortDir === 'desc' ? ' ▼' : ' ▲') : ' ↕'}
    </span>
  );

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm mb-0.5" style={{ color: '#e8eaf0' }}>
            Variant Call Table
          </h3>
          <p className="text-xs" style={{ color: '#8892a4' }}>
            {scenarioId === 'tumor_wgs' ? 'DeepVariant · somatic variants' : scenarioId === 'metagenomics' ? 'Kraken2 + AI · species variants' : 'De novo assembly · resistance genes'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
          <span style={{ color: '#8892a4' }}>Classical:</span>
          <span style={{ color: '#e8eaf0' }}>{classicalCount}</span>
          <span style={{ color: '#8892a4' }}>|</span>
          <span style={{ color: '#00d4aa' }}>AI:</span>
          <span style={{ color: '#00d4aa' }}>{aiCount}</span>
          <span
            className="px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}
          >
            +{aiCount - classicalCount}
          </span>
        </div>
      </div>

      {/* VAF slider */}
      <div
        className="p-3 rounded-xl mb-4 flex items-center gap-4"
        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="text-xs flex-shrink-0" style={{ color: '#8892a4' }}>VAF filter</span>
        <input
          type="range"
          min="0"
          max="30"
          value={localThreshold}
          onChange={e => {
            const v = Number(e.target.value);
            setLocalThreshold(v);
            onVafChange(v);
          }}
          className="flex-1"
          style={{ accentColor: '#00d4aa' }}
          disabled={decisionMade}
        />
        <span
          className="text-sm font-bold flex-shrink-0"
          style={{ color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace', minWidth: 40 }}
        >
          ≥{localThreshold}%
        </span>
        <span className="text-xs flex-shrink-0" style={{ color: '#8892a4' }}>
          Showing <span style={{ color: '#e8eaf0' }}>{filteredCount}</span>/{variants.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ background: '#1a2235', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {(['chr', 'position', 'ref', 'alt', 'vaf', 'depth', 'gene', 'consequence'] as const).map(col => (
                <th
                  key={`th-${col}`}
                  className="px-3 py-2.5 text-left font-semibold cursor-pointer select-none"
                  style={{
                    color: sortCol === col ? '#00d4aa' : '#8892a4',
                    fontFamily: 'IBM Plex Mono, monospace',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontSize: 10,
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => handleSort(col)}
                >
                  {col === 'vaf' ? 'VAF%' : col === 'chr' ? 'Contig/Chr' : col}
                  <SortIcon col={col} />
                </th>
              ))}
              <th
                className="px-3 py-2.5 text-left font-semibold"
                style={{ color: '#8892a4', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 10 }}
              >
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((v, i) => {
              const isFiltered = v.vaf < localThreshold;
              return (
                <tr
                  key={v.id}
                  className="variant-row-fade"
                  style={{
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    opacity: isFiltered ? 0.2 : 1,
                    textDecoration: isFiltered ? 'line-through' : 'none',
                    transition: 'opacity 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isFiltered) (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(0,212,170,0.04)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent';
                  }}
                >
                  <td className="px-3 py-2" style={{ color: '#8892a4', fontFamily: 'IBM Plex Mono, monospace', maxWidth: 120 }}>
                    <span className="truncate block">{v.chr}</span>
                  </td>
                  <td className="px-3 py-2" style={{ color: '#e8eaf0', fontFamily: 'IBM Plex Mono, monospace', whiteSpace: 'nowrap' }}>
                    {v.position.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-bold" style={{ color: NUC_COLORS_TABLE[v.ref] || '#e8eaf0', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {v.ref.length > 4 ? v.ref.slice(0, 4) + '…' : v.ref}
                  </td>
                  <td className="px-3 py-2 font-bold" style={{ color: NUC_COLORS_TABLE[v.alt] || '#ff6b35', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {v.alt}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(v.vaf, 100)}%`,
                            background: v.vaf > 50 ? '#00d4aa' : v.vaf > 15 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      </div>
                      <span style={{ color: '#e8eaf0', fontFamily: 'IBM Plex Mono, monospace', whiteSpace: 'nowrap' }}>
                        {v.vaf.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2" style={{ color: '#8892a4', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {v.depth}x
                  </td>
                  <td className="px-3 py-2" style={{ color: '#e8eaf0', fontFamily: 'IBM Plex Mono, monospace', whiteSpace: 'nowrap' }}>
                    {v.gene}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${CONSEQUENCE_LABELS[v.consequence]?.style}`}
                    >
                      {CONSEQUENCE_LABELS[v.consequence]?.label}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {v.aiOnly ? (
                      <span
                        className="px-1.5 py-0.5 rounded text-xs font-bold"
                        style={{ background: 'rgba(124,92,191,0.15)', color: '#a78bfa', border: '1px solid rgba(124,92,191,0.3)', fontFamily: 'IBM Plex Mono, monospace' }}
                      >
                        AI only
                      </span>
                    ) : (
                      <span
                        className="px-1.5 py-0.5 rounded text-xs font-medium"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#8892a4', fontFamily: 'IBM Plex Mono, monospace' }}
                      >
                        Classical
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
