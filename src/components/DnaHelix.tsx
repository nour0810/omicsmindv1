'use client';

import React from 'react';

export default function DnaHelix() {
  return (
    <svg
      viewBox="0 0 200 300"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ filter: 'drop-shadow(0 0 12px rgba(0,212,170,0.3))' }}
    >
      <defs>
        <linearGradient id="helix-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7c5cbf" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="helix-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7c5cbf" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#00d4aa" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* Strand 1 — sine wave */}
      <path
        d="M 60 10 Q 120 40 60 70 Q 0 100 60 130 Q 120 160 60 190 Q 0 220 60 250 Q 120 280 60 300"
        fill="none"
        stroke="url(#helix-grad-1)"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{
          strokeDasharray: 400,
          strokeDashoffset: 0,
          animation: 'dna-strand 6s linear infinite',
        }}
      />
      {/* Strand 2 — opposite phase */}
      <path
        d="M 140 10 Q 80 40 140 70 Q 200 100 140 130 Q 80 160 140 190 Q 200 220 140 250 Q 80 280 140 300"
        fill="none"
        stroke="url(#helix-grad-2)"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{
          strokeDasharray: 400,
          strokeDashoffset: 200,
          animation: 'dna-strand 6s linear infinite',
        }}
      />
      {/* Rungs */}
      {[40, 70, 100, 130, 160, 190, 220, 250]?.map((y, i) => {
        const x1 = i % 2 === 0 ? 60 : 140;
        const x2 = i % 2 === 0 ? 140 : 60;
        return (
          <line
            key={`rung-${y}`}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke={i % 2 === 0 ? 'rgba(0,212,170,0.4)' : 'rgba(124,92,191,0.4)'}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
      {/* Base pair dots */}
      {[40, 70, 100, 130, 160, 190, 220, 250]?.map((y, i) => (
        <React.Fragment key={`bp-${y}`}>
          <circle
            cx={i % 2 === 0 ? 60 : 140}
            cy={y}
            r="4"
            fill={i % 2 === 0 ? '#00d4aa' : '#7c5cbf'}
            opacity="0.8"
          />
          <circle
            cx={i % 2 === 0 ? 140 : 60}
            cy={y}
            r="4"
            fill={i % 2 === 0 ? '#7c5cbf' : '#00d4aa'}
            opacity="0.8"
          />
        </React.Fragment>
      ))}
    </svg>
  );
}
