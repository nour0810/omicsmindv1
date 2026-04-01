'use client';

import React, { useEffect, useRef } from 'react';
import { type ChatMessage } from './SimulatorClient';

interface AIChatPanelProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

const BADGE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  PREDICTION: {
    bg: 'rgba(245,158,11,0.15)',
    color: '#f59e0b',
    border: 'rgba(245,158,11,0.3)',
  },
  EXPLANATION: {
    bg: 'rgba(0,212,170,0.12)',
    color: '#00d4aa',
    border: 'rgba(0,212,170,0.3)',
  },
  CHALLENGE: {
    bg: 'rgba(124,92,191,0.15)',
    color: '#a78bfa',
    border: 'rgba(124,92,191,0.3)',
  },
};

export default function AIChatPanel({ messages, isTyping }: AIChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Panel title */}
      <div
        className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)', flexShrink: 0 }}
      >
        <span className="text-base">🧬</span>
        <span className="font-semibold text-sm" style={{ color: '#e8eaf0' }}>
          AI Analysis
        </span>
        <div
          className="pulse-dot ml-1"
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#00d4aa',
            animation: 'pulse-teal 2s infinite',
            flexShrink: 0,
          }}
        />
        <span className="ml-auto text-xs" style={{ color: '#8892a4', fontFamily: 'IBM Plex Mono, monospace' }}>
          Claude Sonnet
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="text-3xl mb-3">🧬</div>
            <p className="text-sm" style={{ color: '#8892a4' }}>
              AI reasoning will appear here as you work through the scenario.
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' ? (
              <div
                className="ai-bubble max-w-full rounded-xl rounded-tl-sm p-4"
                style={{
                  background: '#1a1535',
                  borderLeft: '3px solid #00d4aa',
                  maxWidth: '92%',
                }}
              >
                {msg.badge && BADGE_STYLES[msg.badge] && (
                  <span
                    className="inline-block px-2 py-0.5 rounded text-xs font-bold tracking-widest uppercase mb-2"
                    style={{
                      background: BADGE_STYLES[msg.badge].bg,
                      color: BADGE_STYLES[msg.badge].color,
                      border: `1px solid ${BADGE_STYLES[msg.badge].border}`,
                      fontFamily: 'IBM Plex Mono, monospace',
                    }}
                  >
                    {msg.badge}
                  </span>
                )}
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: '#e8eaf0', wordBreak: 'break-word' }}
                >
                  {msg.text}
                  {msg.streaming && (
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
                <div
                  className="text-xs mt-2"
                  style={{ color: '#8892a4', fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ) : (
              <div
                className="user-bubble rounded-xl rounded-tr-sm px-4 py-3"
                style={{ maxWidth: '85%' }}
              >
                <div
                  className="text-xs font-semibold mb-1"
                  style={{ color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  You chose:
                </div>
                <p className="text-sm" style={{ color: '#e8eaf0' }}>
                  {msg.text.replace('I chose: ', '')}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div
              className="ai-bubble rounded-xl rounded-tl-sm px-4 py-3"
              style={{ background: '#1a1535', borderLeft: '3px solid #00d4aa' }}
            >
              <div className="flex gap-1.5 items-center">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
                <span className="text-xs ml-1" style={{ color: '#8892a4' }}>
                  Analyzing...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
