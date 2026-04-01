'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SCENARIOS, type Scenario } from '@/data/scenarios';
import StepHeader from './StepHeader';
import VisualizationPanel from './VisualizationPanel';
import AIChatPanel from './AIChatPanel';
import DecisionPanel from './DecisionPanel';
import ComparisonScreen from './ComparisonScreen';
import OutcomeScreen from './OutcomeScreen';

export interface Decision {
  step: number;
  stepLabel: string;
  choiceIdx: number;
  choiceLabel: string;
  choiceValue: string | number;
  outcome: Record<string, unknown>;
  isOptimal: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
  badge?: 'PREDICTION' | 'EXPLANATION' | 'CHALLENGE' | null;
  streaming?: boolean;
}

type Screen = 'simulator' | 'comparison' | 'outcome';

export default function SimulatorClient() {
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [score, setScore] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [stepDecisionMade, setStepDecisionMade] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [screen, setScreen] = useState<Screen>('simulator');
  const [qcThreshold, setQcThreshold] = useState(30);
  const [vafThreshold, setVafThreshold] = useState(10);
  const [alignerMode, setAlignerMode] = useState<string>('reference');

  // Load scenario from sessionStorage
  useEffect(() => {
    const stored =
      typeof window !== 'undefined' ? sessionStorage.getItem('omicsmind_scenario')
        : null;
    const storedKey =
      typeof window !== 'undefined' ? localStorage.getItem('omicsmind_apikey')
        : null;
    if (storedKey) setApiKey(storedKey);

    if (stored) {
      const found = SCENARIOS.find(s => s.id === stored);
      if (found) {
        setScenario(found);
      } else {
        setScenario(SCENARIOS[0]);
      }
    } else {
      setScenario(SCENARIOS[0]);
    }
  }, []);

  // Trigger prediction after scenario loads
  useEffect(() => {
    if (!scenario) return;
    const step = scenario.steps[0];
    setTimeout(() => {
      streamAIMessage(
        buildPredictionPrompt(scenario, step),
        'PREDICTION'
      );
    }, 800);
  }, [scenario]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildPredictionPrompt = (sc: Scenario, step: { question: string; options: Array<{ label: string }> }) => {
    return `Scenario: ${sc.title}
Sample: coverage=${sc.sampleData.coverage}x, GC=${sc.sampleData.gc}%
Decision: ${step.question}
Options: A) ${step.options[0].label} | B) ${step.options[1].label}
Predict in 2 sentences the consequence of each option. Numbers required. Do not recommend yet.`;
  };

  const buildExplanationPrompt = (sc: Scenario, choiceLabel: string, outcomeNote: string) => {
    return `Scenario: ${sc.title}
User chose: ${choiceLabel}
Outcome: ${outcomeNote}
Explain in 3 sentences: (1) biological mechanism (2) specific number that proves it (3) one sentence they will remember forever.`;
  };

  const buildChallengePrompt = (sc: Scenario, choiceLabel: string) => {
    return `Scenario: ${sc.title}
User chose: ${choiceLabel} — this is suboptimal for this case.
Challenge their reasoning with one specific question. Force them to think about what they missed. Max 2 sentences. Do not give the answer.`;
  };

  const buildComparisonPrompt = (sc: Scenario) => {
    return `Scenario: ${sc.title} completed.
Classical result: ${JSON.stringify(sc.classicalResult)}
AI result: ${JSON.stringify(sc.aiResult)}
Write 3 sentences: what AI contributed that classical could not. Use the numbers. Make the last sentence unforgettable.`;
  };

  const SYSTEM_PROMPT = `You are an expert bioinformatician and AI researcher at a leading genomics institute.
Your role: explain omics analysis decisions to learners clearly and memorably.
Rules:
- Always mention at least ONE specific number/threshold (coverage depth, VAF%, Phred score, etc.)
- Always explain the BIOLOGICAL consequence, not just the technical one
- Max 3 sentences. Never more.
- End with ONE insight the user will remember for years
- Use real tool names when relevant: GATK, DeepVariant, FastQC, BWA, Kraken2, STAR
- Tone: brilliant professor talking to a motivated student — not a textbook, not a chatbot
- Never say "Great choice!" or praise the user artificially
- Never use markdown formatting — plain text only`;

  const streamAIMessage = useCallback(
    async (prompt: string, badge: ChatMessage['badge']) => {
      const msgId = `ai-${Date.now()}-${Math.floor(prompt.length * 0.1)}`;

      setChatMessages(prev => [
        ...prev,
        { id: msgId, role: 'ai', text: '', badge, streaming: true },
      ]);
      setIsTyping(true);

      // Backend integration point: replace with real Anthropic streaming call
      if (!apiKey) {
        // Fallback mock responses
        const fallbacks: Record<string, string> = {
          PREDICTION:
            'At Phred ≥20, you keep 91% of reads but introduce ~7 false variants from chimeric reads. At Phred ≥30, you lose 27% of reads but reduce false positives to 1 — the tradeoff that defines downstream accuracy.',
          EXPLANATION:
            'De novo assembly with SPAdes recovered a 14kb genomic island completely absent from all 4,200 reference genomes in the database. This island carries an OXA-900 carbapenemase with only 64% identity to known variants — invisible to BLAST but structurally recognized by the AI model. The gene that changes the treatment from meropenem failure to colistin success was hiding in the reads that reference mapping discarded.',
          CHALLENGE:
            'If 31% of your reads map to nothing in the reference database, what does that tell you about the assumption underlying reference-based assembly? What biological feature could explain reads that belong to this organism but not to any known relative?',
          null: 'Analysis complete. The AI pipeline identified findings that changed the clinical recommendation. Proceed to the comparison screen.',
        };
        const fallbackText = fallbacks[badge || 'null'] || fallbacks['null'];
        let i = 0;
        setIsTyping(false);
        const words = fallbackText.split(' ');
        const interval = setInterval(() => {
          if (i >= words.length) {
            clearInterval(interval);
            setChatMessages(prev =>
              prev.map(m => (m.id === msgId ? { ...m, streaming: false } : m))
            );
            return;
          }
          setChatMessages(prev =>
            prev.map(m =>
              m.id === msgId
                ? { ...m, text: words.slice(0, i + 1).join(' ') }
                : m
            )
          );
          i++;
        }, 60);
        return;
      }

      try {
        // Real Anthropic API streaming
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 200,
            stream: true,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!response.ok || !response.body) throw new Error('API error');

        setIsTyping(false);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (
                parsed.type === 'content_block_delta' &&
                parsed.delta?.type === 'text_delta'
              ) {
                const text = parsed.delta.text;
                setChatMessages(prev =>
                  prev.map(m =>
                    m.id === msgId ? { ...m, text: m.text + text } : m
                  )
                );
              }
            } catch {
              // skip malformed SSE line
            }
          }
        }

        setChatMessages(prev =>
          prev.map(m => (m.id === msgId ? { ...m, streaming: false } : m))
        );
      } catch {
        setIsTyping(false);
        setChatMessages(prev =>
          prev.map(m =>
            m.id === msgId
              ? {
                  ...m,
                  text: 'Analysis complete. Proceed to the next step.',
                  streaming: false,
                }
              : m
          )
        );
      }
    },
    [apiKey]
  );

  const handleDecision = useCallback(
    (optionIdx: number) => {
      if (!scenario || stepDecisionMade) return;
      const step = scenario.steps[currentStep];
      const choice = step.options[optionIdx];
      const isOptimal = optionIdx === step.optimalChoice;
      const points = isOptimal ? 25 : 10;

      setScore(prev => prev + points);
      setStepDecisionMade(true);

      const decision: Decision = {
        step: currentStep,
        stepLabel: step.label,
        choiceIdx: optionIdx,
        choiceLabel: choice.label,
        choiceValue: String(choice.value),
        outcome: choice.outcome,
        isOptimal,
      };
      setDecisions(prev => [...prev, decision]);

      // Add user bubble
      const userMsgId = `user-${Date.now()}-${optionIdx}`;
      setChatMessages(prev => [
        ...prev,
        {
          id: userMsgId,
          role: 'user',
          text: `I chose: ${choice.label}`,
          badge: null,
        },
      ]);

      // Stream AI response
      setTimeout(() => {
        if (isOptimal) {
          streamAIMessage(
            buildExplanationPrompt(scenario, choice.label, choice.outcome.note as string),
            'EXPLANATION'
          );
        } else {
          streamAIMessage(
            buildChallengePrompt(scenario, choice.label),
            'CHALLENGE'
          );
        }
      }, 400);

      // Update viz state
      if (step.visualization === 'quality_chart') {
        setQcThreshold(choice.value as number);
      } else if (step.visualization === 'pileup') {
        setAlignerMode(String(choice.value));
      } else if (step.visualization === 'variant_table') {
        setVafThreshold(choice.value === 'standard' ? 5 : 10);
      }
    },
    [scenario, currentStep, stepDecisionMade, streamAIMessage]
  );

  const handleNextStep = useCallback(() => {
    if (!scenario) return;
    const nextStep = currentStep + 1;
    if (nextStep >= scenario.steps.length) {
      // Go to comparison
      setTimeout(() => {
        streamAIMessage(buildComparisonPrompt(scenario), null);
      }, 600);
      setScreen('comparison');
      return;
    }
    setCurrentStep(nextStep);
    setStepDecisionMade(false);
    const step = scenario.steps[nextStep];
    setTimeout(() => {
      streamAIMessage(buildPredictionPrompt(scenario, step), 'PREDICTION');
    }, 500);
  }, [scenario, currentStep, streamAIMessage]);

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleContinueToOutcome = () => {
    setScreen('outcome');
  };

  const handleTryAnother = () => {
    router.push('/welcome');
  };

  const handleDownloadCert = () => {
    if (scenario && typeof window !== 'undefined') {
      sessionStorage.setItem('omicsmind_cert_scenario', scenario.id);
      sessionStorage.setItem('omicsmind_cert_score', String(score));
      sessionStorage.setItem('omicsmind_cert_decisions', JSON.stringify(decisions));
    }
    router.push('/certificate');
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('omicsmind_apikey', key);
    }
    setShowApiKeyPrompt(false);
  };

  if (!scenario) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0a0f1e' }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent mx-auto mb-4"
            style={{ borderColor: '#00d4aa', animation: 'spin 1s linear infinite' }}
          />
          <p style={{ color: '#8892a4' }}>Loading scenario...</p>
        </div>
      </div>
    );
  }

  if (screen === 'comparison') {
    return (
      <ComparisonScreen
        scenario={scenario}
        decisions={decisions}
        score={score}
        chatMessages={chatMessages}
        isTyping={isTyping}
        onContinue={handleContinueToOutcome}
      />
    );
  }

  if (screen === 'outcome') {
    return (
      <OutcomeScreen
        scenario={scenario}
        decisions={decisions}
        score={score}
        onTryAnother={handleTryAnother}
        onDownloadCert={handleDownloadCert}
      />
    );
  }

  const step = scenario.steps[currentStep];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0f1e', fontFamily: 'DM Sans, sans-serif' }}>
      {/* API Key prompt modal */}
      {showApiKeyPrompt && (
        <ApiKeyModal onSave={handleSaveApiKey} onClose={() => setShowApiKeyPrompt(false)} />
      )}

      {/* Sticky header */}
      <StepHeader
        scenario={scenario}
        currentStep={currentStep}
        totalSteps={scenario.steps.length}
        score={score}
        onBack={() => router.push('/welcome')}
        onApiKey={() => setShowApiKeyPrompt(true)}
        hasApiKey={!!apiKey}
      />

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — visualizations */}
        <div
          className="flex-1 overflow-y-auto p-6"
          style={{ background: '#0a0f1e', minWidth: 0 }}
        >
          <VisualizationPanel
            step={step}
            scenario={scenario}
            qcThreshold={qcThreshold}
            vafThreshold={vafThreshold}
            alignerMode={alignerMode}
            decisionMade={stepDecisionMade}
            decisions={decisions}
            onThresholdChange={setQcThreshold}
            onVafChange={setVafThreshold}
            onAlignerChange={setAlignerMode}
          />
        </div>

        {/* Right panel — AI chat + decisions */}
        <div
          className="flex flex-col overflow-hidden"
          style={{
            width: '42%',
            minWidth: 340,
            maxWidth: 520,
            background: '#0f1729',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Context card */}
          <div
            className="px-5 py-4 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#1a2235' }}
          >
            <div
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace' }}
            >
              {step.label}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#8892a4' }}>
              {step.context}
            </p>
          </div>

          {/* AI Chat */}
          <AIChatPanel messages={chatMessages} isTyping={isTyping} />

          {/* Decision panel */}
          <DecisionPanel
            step={step}
            decisionMade={stepDecisionMade}
            decisions={decisions}
            currentStep={currentStep}
            onDecision={handleDecision}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === scenario.steps.length - 1}
          />
        </div>
      </div>
    </div>
  );
}

function ApiKeyModal({
  onSave,
  onClose,
}: {
  onSave: (key: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState('');
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: '#1a2235', border: '1px solid rgba(0,212,170,0.2)' }}
      >
        <h3 className="font-semibold text-lg mb-2" style={{ color: '#e8eaf0' }}>
          Anthropic API Key
        </h3>
        <p className="text-sm mb-4" style={{ color: '#8892a4' }}>
          Enter your Claude API key to enable live AI reasoning. Without it, demo responses are shown.
        </p>
        <input
          type="password"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full px-4 py-3 rounded-xl text-sm mb-4 outline-none"
          style={{
            background: '#0f1729',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e8eaf0',
            fontFamily: 'IBM Plex Mono, monospace',
          }}
        />
        <div className="flex gap-3">
          <button
            onClick={() => onSave(value)}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #00d4aa, #0f9d8a)', color: '#0a0f1e' }}
          >
            Save Key
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl text-sm transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#8892a4' }}
          >
            Use Demo
          </button>
        </div>
      </div>
    </div>
  );
}
