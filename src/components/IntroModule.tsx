'use client';

import React, { useState, useEffect } from 'react';

interface IntroModuleProps {
  onComplete: () => void;
}

const SLIDES = ['fastq', 'coverage', 'variant', 'pipeline'] as const;
type Slide = (typeof SLIDES)[number];

const PIPELINE_STEPS = [
  { id: 'fastq', label: 'FASTQ', desc: 'Raw sequencing reads — 4-line format per read' },
  { id: 'qc', label: 'QC', desc: 'FastQC + Trimmomatic — remove low-quality bases' },
  { id: 'align', label: 'Alignment', desc: 'BWA MEM — map reads to reference genome' },
  { id: 'variant', label: 'Variant Calling', desc: 'GATK / DeepVariant — find mutations' },
  { id: 'annotate', label: 'Annotation', desc: 'VEP / SnpEff — predict functional impact' },
  { id: 'report', label: 'Report', desc: 'Clinical findings — actionable insights' },
];

const CONSEQUENCE_INFO: Record<string, string> = {
  Synonymous: 'Same amino acid — no protein change. Usually benign.',
  Missense: 'Different amino acid — protein function may change. Could be pathogenic.',
  'Stop-gain': 'Premature stop codon — protein truncated. Often loss-of-function.',
};

export default function IntroModule({ onComplete }: IntroModuleProps) {
  const [slide, setSlide] = useState<Slide>('fastq');
  const [coverageDepth, setCoverageDepth] = useState(30);
  const [vafThreshold, setVafThreshold] = useState(10);
  const [fastqLine, setFastqLine] = useState(0);
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [selectedConsequence, setSelectedConsequence] = useState<string | null>(null);
  const [variantBlinkOn, setVariantBlinkOn] = useState(true);

  const slideIdx = SLIDES.indexOf(slide);

  // Animate FASTQ lines appearing
  useEffect(() => {
    if (slide !== 'fastq') return;
    setFastqLine(0);
    const timers = [0, 600, 1200, 1800].map((delay, i) =>
      setTimeout(() => setFastqLine(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [slide]);

  // Animate pipeline steps
  useEffect(() => {
    if (slide !== 'pipeline') return;
    setPipelineStep(-1);
    let current = -1;
    const interval = setInterval(() => {
      current += 1;
      if (current >= PIPELINE_STEPS.length) {
        clearInterval(interval);
      } else {
        setPipelineStep(current);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [slide]);

  // Blink variant position
  useEffect(() => {
    if (slide !== 'variant') return;
    const interval = setInterval(() => setVariantBlinkOn(v => !v), 600);
    return () => clearInterval(interval);
  }, [slide]);

  const getCoverageLabel = () => {
    if (coverageDepth <= 8) return { text: 'Too sparse — variants will be missed', color: '#ef4444' };
    if (coverageDepth <= 15) return { text: 'Dangerous — variants may be missed', color: '#ef4444' };
    if (coverageDepth <= 40) return { text: 'Standard WGS coverage', color: '#f59e0b' };
    return { text: 'Deep sequencing — needed for rare variants (cancer)', color: '#00d4aa' };
  };

  const getBarsCount = () => {
    if (coverageDepth <= 8) return 2;
    if (coverageDepth <= 15) return 4;
    if (coverageDepth <= 40) return 7;
    return 10;
  };

  const QUALITY_STRING = 'IIIIIIIIHHHHFFFFEEDD';
  const NUCLEOTIDES = 'ATCGATCGATCGATCGATCG'.split('');
  const NUC_COLORS: Record<string, string> = {
    A: '#22c55e', T: '#ef4444', C: '#3b82f6', G: '#f59e0b',
  };

  const REF_SEQ = ['A', 'T', 'C', 'A', 'T', 'G', 'C', 'A', 'T', 'C'];
  const ALT_SEQ = ['A', 'T', 'C', 'T', 'T', 'G', 'C', 'A', 'T', 'C'];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0a0f1e', color: '#e8eaf0', fontFamily: 'DM Sans, sans-serif' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: '#0f1729', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold" style={{ color: '#00d4aa' }}>
            Module 1 — From Biology to Data
          </span>
          {/* Slide dots */}
          <div className="flex gap-2">
            {SLIDES.map((s, i) => (
              <div
                key={`dot-${s}`}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: i <= slideIdx ? '#00d4aa' : 'rgba(255,255,255,0.15)',
                  boxShadow: i === slideIdx ? '0 0 6px rgba(0,212,170,0.6)' : 'none',
                }}
              />
            ))}
          </div>
        </div>
        <button
          onClick={onComplete}
          className="text-sm px-4 py-1.5 rounded-lg transition-all duration-150 active:scale-95"
          style={{
            color: '#8892a4',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          Skip →
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-3xl mx-auto w-full">
        {/* Slide 1: FASTQ */}
        {slide === 'fastq' && (
          <div className="w-full animate-fade-in">
            <div className="text-center mb-8">
              <span
                className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-3 inline-block"
                style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}
              >
                Slide 1 of 4
              </span>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#e8eaf0' }}>
                FASTQ Format
              </h2>
              <p className="text-sm" style={{ color: '#8892a4' }}>
                Every sequencing run produces FASTQ files. Here&apos;s what one read looks like.
              </p>
            </div>

            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="space-y-3"
                style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14 }}
              >
                {fastqLine >= 1 && (
                  <div style={{ color: '#8892a4', animation: 'fade-in-fast 0.4s ease' }}>
                    @SRR123456.1 read_1 length=20
                  </div>
                )}
                {fastqLine >= 2 && (
                  <div style={{ animation: 'fade-in-fast 0.4s ease' }}>
                    {NUCLEOTIDES.map((n, i) => (
                      <span key={`nuc-${i}`} style={{ color: NUC_COLORS[n] || '#e8eaf0' }}>
                        {n}
                      </span>
                    ))}
                  </div>
                )}
                {fastqLine >= 3 && (
                  <div style={{ color: '#8892a4', animation: 'fade-in-fast 0.4s ease' }}>+</div>
                )}
                {fastqLine >= 4 && (
                  <div style={{ animation: 'fade-in-fast 0.4s ease' }}>
                    {QUALITY_STRING.split('').map((ch, i) => {
                      const progress = i / (QUALITY_STRING.length - 1);
                      const r = Math.round(0 + progress * 239);
                      const g = Math.round(212 - progress * 144);
                      const b = Math.round(170 - progress * 102);
                      return (
                        <span key={`qual-${i}`} style={{ color: `rgb(${r},${g},${b})` }}>
                          {ch}
                        </span>
                      );
                    })}
                  </div>
                )}
                {fastqLine < 4 && (
                  <span
                    style={{ display: 'inline-block', width: 8, height: 14, background: '#00d4aa', animation: 'blink 1s infinite', verticalAlign: 'middle' }}
                  />
                )}
              </div>

              {fastqLine >= 4 && (
                <div
                  className="mt-4 p-3 rounded-lg text-sm"
                  style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)', color: '#8892a4' }}
                >
                  <span style={{ color: '#00d4aa' }}>Line 4 — Quality scores:</span> Each character = confidence of that base call.
                  <span style={{ color: '#00d4aa' }}> I = perfect (Phred 40).</span>
                  <span style={{ color: '#ef4444' }}> ! = terrible (Phred 0).</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Line 1', value: 'Read ID', color: '#8892a4' },
                { label: 'Line 2', value: 'DNA Sequence', color: '#00d4aa' },
                { label: 'Line 4', value: 'Quality Scores', color: '#f59e0b' },
              ].map(item => (
                <div
                  key={`info-${item.label}`}
                  className="rounded-xl p-3 text-center"
                  style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="text-xs mb-1" style={{ color: '#8892a4', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {item.label}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: item.color }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slide 2: Coverage */}
        {slide === 'coverage' && (
          <div className="w-full animate-fade-in">
            <div className="text-center mb-8">
              <span
                className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-3 inline-block"
                style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}
              >
                Slide 2 of 4
              </span>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#e8eaf0' }}>
                Coverage Depth
              </h2>
              <p className="text-sm" style={{ color: '#8892a4' }}>
                How many reads cover each position in the genome. More = better detection.
              </p>
            </div>

            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Slider */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm" style={{ color: '#8892a4' }}>Coverage depth</span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace' }}
                  >
                    {coverageDepth}x
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={coverageDepth}
                  onChange={e => setCoverageDepth(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none"
                  style={{
                    background: `linear-gradient(to right, #00d4aa ${(coverageDepth - 5) / 95 * 100}%, rgba(255,255,255,0.1) ${(coverageDepth - 5) / 95 * 100}%)`,
                    accentColor: '#00d4aa',
                  }}
                />
                <div className="flex justify-between mt-1 text-xs" style={{ color: '#8892a4', fontFamily: 'IBM Plex Mono, monospace' }}>
                  <span>5x</span>
                  <span>30x</span>
                  <span>100x</span>
                </div>
              </div>

              {/* Visual bars */}
              <div className="space-y-2 mb-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={`bar-${i}`}
                    className="h-5 rounded transition-all duration-300"
                    style={{
                      background: i < getBarsCount()
                        ? `rgba(0,212,170,${0.3 + (i / 10) * 0.5})`
                        : 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      width: i < getBarsCount() ? `${70 + i * 3}%` : '30%',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>

              {/* Label */}
              <div
                className="p-3 rounded-lg text-sm font-medium text-center"
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  color: getCoverageLabel().color,
                  border: `1px solid ${getCoverageLabel().color}33`,
                }}
              >
                {getCoverageLabel().text}
              </div>
            </div>

            {/* VAF mini explainer */}
            <div
              className="p-4 rounded-xl text-sm"
              style={{ background: 'rgba(124,92,191,0.06)', border: '1px solid rgba(124,92,191,0.2)', color: '#8892a4' }}
            >
              <span style={{ color: '#a78bfa' }}>Why does depth matter for cancer?</span> Subclonal mutations may be present in only 3-7% of cells. At 30x, variants below 10% VAF are invisible. At 100x, variants at 4.2% VAF become detectable — the difference between the right and wrong treatment.
            </div>
          </div>
        )}

        {/* Slide 3: Variant */}
        {slide === 'variant' && (
          <div className="w-full animate-fade-in">
            <div className="text-center mb-8">
              <span
                className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-3 inline-block"
                style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}
              >
                Slide 3 of 4
              </span>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#e8eaf0' }}>
                What is a Variant?
              </h2>
              <p className="text-sm" style={{ color: '#8892a4' }}>
                A position where your sample differs from the reference genome.
              </p>
            </div>

            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Sequence comparison */}
              <div
                className="space-y-3 mb-6"
                style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 16 }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs w-8 text-right" style={{ color: '#8892a4' }}>REF:</span>
                  <div className="flex gap-1">
                    {REF_SEQ.map((base, i) => (
                      <span
                        key={`ref-${i}`}
                        className="w-8 h-8 flex items-center justify-center rounded font-bold transition-all duration-300"
                        style={{
                          background: i === 3
                            ? variantBlinkOn ? 'rgba(0,212,170,0.3)' : 'rgba(0,212,170,0.1)'
                            : 'rgba(255,255,255,0.05)',
                          color: i === 3 ? '#00d4aa' : NUC_COLORS[base] || '#e8eaf0',
                          border: i === 3 ? '1px solid rgba(0,212,170,0.6)' : '1px solid rgba(255,255,255,0.06)',
                          boxShadow: i === 3 && variantBlinkOn ? '0 0 8px rgba(0,212,170,0.4)' : 'none',
                        }}
                      >
                        {base}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs w-8 text-right" style={{ color: '#8892a4' }}>ALT:</span>
                  <div className="flex gap-1">
                    {ALT_SEQ.map((base, i) => (
                      <span
                        key={`alt-${i}`}
                        className="w-8 h-8 flex items-center justify-center rounded font-bold"
                        style={{
                          background: i === 3 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                          color: i === 3 ? '#ef4444' : NUC_COLORS[base] || '#e8eaf0',
                          border: i === 3 ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        {base}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="p-3 rounded-lg text-sm text-center mb-4"
                style={{ background: 'rgba(0,212,170,0.06)', color: '#e8eaf0' }}
              >
                REF: <span style={{ color: '#00d4aa' }}>A</span> → ALT: <span style={{ color: '#ef4444' }}>T</span> — This is a{' '}
                <span style={{ color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace' }}>SNP</span> — Single Nucleotide Polymorphism
              </div>

              {/* Consequence badges */}
              <div className="text-xs mb-3" style={{ color: '#8892a4' }}>
                Click a consequence type to learn more:
              </div>
              <div className="flex gap-2 flex-wrap mb-3">
                {Object.keys(CONSEQUENCE_INFO).map(key => (
                  <button
                    key={`cons-${key}`}
                    onClick={() => setSelectedConsequence(prev => (prev === key ? null : key))}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95"
                    style={{
                      background:
                        selectedConsequence === key
                          ? key === 'Synonymous' ? 'rgba(34,197,94,0.2)' : key === 'Missense' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'
                          : 'rgba(255,255,255,0.05)',
                      color:
                        key === 'Synonymous' ? '#22c55e' : key === 'Missense' ? '#f59e0b' : '#ef4444',
                      border: `1px solid ${key === 'Synonymous' ? 'rgba(34,197,94,0.3)' : key === 'Missense' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
              {selectedConsequence && (
                <div
                  className="p-3 rounded-lg text-sm animate-fade-in-fast"
                  style={{ background: 'rgba(0,212,170,0.06)', color: '#8892a4', border: '1px solid rgba(0,212,170,0.15)' }}
                >
                  {CONSEQUENCE_INFO[selectedConsequence]}
                </div>
              )}
            </div>

            {/* VAF slider */}
            <div
              className="p-4 rounded-xl"
              style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm" style={{ color: '#8892a4' }}>Variant Allele Frequency (VAF)</span>
                <span style={{ color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace' }}>
                  {vafThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={vafThreshold}
                onChange={e => setVafThreshold(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: '#00d4aa' }}
              />
              <p className="text-xs mt-2" style={{ color: '#8892a4' }}>
                {vafThreshold < 5
                  ? 'Very sensitive — may detect noise as variants'
                  : vafThreshold < 15
                  ? 'Subclonal detection range — needed for cancer'
                  : vafThreshold < 30
                  ? 'Standard somatic calling threshold' :'Conservative — misses rare subclonal variants'}
              </p>
            </div>
          </div>
        )}

        {/* Slide 4: Pipeline */}
        {slide === 'pipeline' && (
          <div className="w-full animate-fade-in">
            <div className="text-center mb-8">
              <span
                className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-3 inline-block"
                style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}
              >
                Slide 4 of 4
              </span>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#e8eaf0' }}>
                The Bioinformatics Pipeline
              </h2>
              <p className="text-sm" style={{ color: '#8892a4' }}>
                From raw reads to clinical findings — every step matters.
              </p>
            </div>

            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex flex-col gap-3">
                {PIPELINE_STEPS.map((step, i) => (
                  <div
                    key={`pipe-${step.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl transition-all duration-500"
                    style={{
                      background: i <= pipelineStep ? 'rgba(0,212,170,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${i <= pipelineStep ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.05)'}`,
                      opacity: i <= pipelineStep ? 1 : 0.3,
                      transform: i <= pipelineStep ? 'translateX(0)' : 'translateX(-8px)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: i <= pipelineStep ? '#00d4aa' : 'rgba(255,255,255,0.05)',
                        color: i <= pipelineStep ? '#0a0f1e' : '#8892a4',
                        fontFamily: 'IBM Plex Mono, monospace',
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div
                        className="font-semibold text-sm mb-0.5"
                        style={{ color: i <= pipelineStep ? '#00d4aa' : '#8892a4' }}
                      >
                        {step.label}
                      </div>
                      <div className="text-xs" style={{ color: '#8892a4' }}>
                        {step.desc}
                      </div>
                    </div>
                    {(i === 3 || i === 4) && i <= pipelineStep && (
                      <span
                        className="text-xs px-2 py-0.5 rounded font-medium"
                        style={{ background: 'rgba(124,92,191,0.2)', color: '#a78bfa', border: '1px solid rgba(124,92,191,0.3)' }}
                      >
                        AI improves this
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="p-4 rounded-xl text-sm text-center"
              style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.2)', color: '#00d4aa' }}
            >
              AI improves every step — but especially Variant Calling and Annotation.
              <br />
              <span style={{ color: '#8892a4' }}>
                The scenarios ahead will show you exactly where and why.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div
        className="sticky bottom-0 z-20 flex items-center justify-between px-6 py-4 border-t"
        style={{ background: '#0f1729', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={() => {
            const idx = SLIDES.indexOf(slide);
            if (idx > 0) setSlide(SLIDES[idx - 1]);
          }}
          disabled={slideIdx === 0}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e8eaf0',
          }}
        >
          ← Previous
        </button>

        <span className="text-sm" style={{ color: '#8892a4' }}>
          {slideIdx + 1} / {SLIDES.length}
        </span>

        {slideIdx < SLIDES.length - 1 ? (
          <button
            onClick={() => {
              const idx = SLIDES.indexOf(slide);
              setSlide(SLIDES[idx + 1]);
            }}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #00d4aa, #0f9d8a)', color: '#0a0f1e' }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #00d4aa, #0f9d8a)',
              color: '#0a0f1e',
              boxShadow: '0 0 20px rgba(0,212,170,0.3)',
            }}
          >
            Start Scenarios →
          </button>
        )}
      </div>
    </div>
  );
}
