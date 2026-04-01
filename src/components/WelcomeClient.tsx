'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ParticleField from './ParticleField';
import DnaHelix from './DnaHelix';
import ScenarioCard from './ScenarioCard';
import IntroModule from './IntroModule';
import { SCENARIOS, MODULE_ONE } from '@/data/scenarios';

interface CompletedScenario {
  id: string;
  score: number;
}

export default function WelcomeClient() {
  const router = useRouter();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [completedScenarios, setCompletedScenarios] = useState<CompletedScenario[]>([]);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    const stored = localStorage.getItem('omicsmind_completed');
    if (stored) {
      try {
        setCompletedScenarios(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
    return () => clearTimeout(timer);
  }, []);

  const handleCardSelect = (id: string) => {
    setSelectedCard(prev => (prev === id ? null : id));
  };

  const handleLaunch = () => {
    if (!selectedCard) return;
    if (selectedCard === 'module_1') {
      setShowIntro(true);
      return;
    }
    // Store selected scenario for simulator
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('omicsmind_scenario', selectedCard);
    }
    router.push('/simulator');
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    setSelectedCard(null);
  };

  if (showIntro) {
    return <IntroModule onComplete={handleIntroComplete} />;
  }

  const completedCount = completedScenarios.length;

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#0a0f1e' }}>
      {/* Particle field */}
      <ParticleField />

      {/* DNA Helix top-right */}
      <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none z-0 opacity-60">
        <DnaHelix />
      </div>

      {/* Header bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(0,212,170,0.08)',
              border: '1px solid rgba(0,212,170,0.2)',
            }}
          >
            <span className="text-lg">⬡</span>
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{
                color: '#00d4aa',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              GENOFLOW AGENCY · OMICSMIND
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {completedCount > 0 && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.3)',
                color: '#c9a84c',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              <span>🏆</span>
              <span>{completedCount}/3 scenarios</span>
            </div>
          )}
          <button
            onClick={() => router.push('/certificate')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95"
            style={{
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.3)',
              color: '#c9a84c',
            }}
          >
            Certificate →
          </button>
        </div>
      </header>

      {/* Hero section */}
      <section
        className="relative z-10 flex flex-col items-center text-center px-6 pt-12 pb-16 md:pt-20"
        style={{
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}
      >
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-6"
          style={{
            background: 'rgba(0,212,170,0.08)',
            border: '1px solid rgba(0,212,170,0.2)',
            color: '#00d4aa',
            fontFamily: 'IBM Plex Mono, monospace',
          }}
        >
          <span className="pulse-dot" style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#00d4aa', boxShadow: '0 0 0 0 rgba(0,212,170,0.4)', animation: 'pulse-teal 2s infinite' }} />
          AI-Powered Omics Simulation · 2026
        </div>

        {/* Main title */}
        <h1
          className="font-bold leading-none mb-6"
          style={{
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            fontFamily: 'DM Sans, sans-serif',
            color: '#e8eaf0',
            letterSpacing: '-0.02em',
          }}
        >
          Omics
          <span className="text-teal-gradient">Mind</span>
        </h1>

        {/* Subtitle */}
        <p
          className="max-w-2xl text-lg leading-relaxed mb-4"
          style={{ color: '#8892a4', fontFamily: 'DM Sans, sans-serif' }}
        >
          Navigate real omics decisions. Reason with AI.
          <br />
          <span style={{ color: '#e8eaf0' }}>
            Discover what classical pipelines miss.
          </span>
        </p>

        {/* tool badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {['GATK', 'DeepVariant', 'FastQC', 'BWA', 'Kraken2', 'Claude AI'].map(tool => (
            <span
              key={`tool-${tool}`}
              className="px-3 py-1 rounded text-xs font-medium"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#8892a4',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              {tool}
            </span>
          ))}
        </div>
      </section>

      {/* Scenario grid */}
      <section className="relative z-10 px-6 md:px-10 xl:px-16 2xl:px-24 pb-16 max-w-screen-2xl mx-auto">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-lg font-semibold mb-1"
              style={{ color: '#e8eaf0', fontFamily: 'DM Sans, sans-serif' }}
            >
              Choose your scenario
            </h2>
            <p className="text-sm" style={{ color: '#8892a4' }}>
              Start with Module 1 if you&apos;re new to omics analysis
            </p>
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: '#8892a4', fontFamily: 'IBM Plex Mono, monospace' }}
          >
            {completedCount}/3 completed
          </div>
        </div>

        {/* 4-card grid: Module 1 (full width top) + 3 scenario cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Module 1 — spans full width on desktop */}
          <div className="md:col-span-3">
            <ScenarioCard
              id="module_1"
              emoji={MODULE_ONE.emoji}
              title={MODULE_ONE.title}
              description={MODULE_ONE.description}
              tags={MODULE_ONE.tags}
              time={MODULE_ONE.time}
              difficulty={MODULE_ONE.difficulty}
              color={MODULE_ONE.color}
              isSelected={selectedCard === 'module_1'}
              isCompleted={false}
              isRequired
              onSelect={handleCardSelect}
              scenarioNumber={0}
              isModule
            />
          </div>

          {/* 3 scenario cards */}
          {SCENARIOS.map((scenario, idx) => (
            <ScenarioCard
              key={`scenario-${scenario.id}`}
              id={scenario.id}
              emoji={scenario.emoji}
              title={scenario.title}
              description={scenario.description}
              tags={scenario.tags}
              time={scenario.time}
              difficulty={scenario.difficulty}
              color={scenario.color}
              isSelected={selectedCard === scenario.id}
              isCompleted={completedScenarios.some(c => c.id === scenario.id)}
              completedScore={completedScenarios.find(c => c.id === scenario.id)?.score}
              onSelect={handleCardSelect}
              scenarioNumber={idx + 1}
            />
          ))}
        </div>

        {/* Launch button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleLaunch}
            disabled={!selectedCard}
            className="px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: selectedCard
                ? 'linear-gradient(135deg, #00d4aa, #0f9d8a)'
                : 'rgba(255,255,255,0.05)',
              color: selectedCard ? '#0a0f1e' : '#8892a4',
              border: selectedCard ? 'none' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: selectedCard ? '0 0 30px rgba(0,212,170,0.3)' : 'none',
              fontFamily: 'DM Sans, sans-serif',
              minWidth: 240,
            }}
          >
            {selectedCard
              ? selectedCard === 'module_1' ? 'Launch Intro Module →'
                : `Launch Scenario →`
              : 'Select a scenario above'}
          </button>

          {selectedCard && selectedCard !== 'module_1' && (
            <p className="text-sm" style={{ color: '#8892a4' }}>
              {SCENARIOS.find(s => s.id === selectedCard)?.context}
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 border-t py-8 px-6 md:px-10 text-center"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-lg">⬡</span>
            <div className="text-left">
              <p
                className="text-sm font-semibold"
                style={{ color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace' }}
              >
                GenoFlow Agency
              </p>
              <p className="text-xs" style={{ color: '#8892a4' }}>
                AI-Powered Bioinformatics Education
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 text-xs" style={{ color: '#8892a4' }}>
            <a
              href="mailto:noor@genoflow.bio"
              className="hover:text-teal-400 transition-colors"
              style={{ color: '#8892a4' }}
            >
              noor@genoflow.bio
            </a>
            <span className="hidden md:block opacity-30">·</span>
            <span>+216 28 533 434</span>
            <span className="hidden md:block opacity-30">·</span>
            <span>Powered by OmicsMind · 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
