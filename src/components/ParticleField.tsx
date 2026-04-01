'use client';

import React from 'react';

const PARTICLES = [
  { id: 'p-1', left: '5%', top: '15%', size: 3, duration: 8, delay: 0, type: 1 },
  { id: 'p-2', left: '12%', top: '60%', size: 2, duration: 12, delay: 1, type: 2 },
  { id: 'p-3', left: '18%', top: '35%', size: 4, duration: 9, delay: 2, type: 3 },
  { id: 'p-4', left: '25%', top: '80%', size: 2, duration: 14, delay: 0.5, type: 1 },
  { id: 'p-5', left: '32%', top: '20%', size: 3, duration: 11, delay: 3, type: 2 },
  { id: 'p-6', left: '38%', top: '70%', size: 2, duration: 7, delay: 1.5, type: 3 },
  { id: 'p-7', left: '45%', top: '45%', size: 3, duration: 13, delay: 2.5, type: 1 },
  { id: 'p-8', left: '52%', top: '10%', size: 2, duration: 10, delay: 0, type: 2 },
  { id: 'p-9', left: '58%', top: '85%', size: 4, duration: 8, delay: 4, type: 3 },
  { id: 'p-10', left: '65%', top: '30%', size: 2, duration: 15, delay: 1, type: 1 },
  { id: 'p-11', left: '72%', top: '55%', size: 3, duration: 9, delay: 2, type: 2 },
  { id: 'p-12', left: '78%', top: '15%', size: 2, duration: 11, delay: 3.5, type: 3 },
  { id: 'p-13', left: '85%', top: '75%', size: 3, duration: 12, delay: 0.5, type: 1 },
  { id: 'p-14', left: '92%', top: '40%', size: 2, duration: 8, delay: 2, type: 2 },
  { id: 'p-15', left: '8%', top: '90%', size: 4, duration: 10, delay: 1, type: 3 },
  { id: 'p-16', left: '22%', top: '50%', size: 2, duration: 13, delay: 0, type: 1 },
  { id: 'p-17', left: '35%', top: '5%', size: 3, duration: 9, delay: 4.5, type: 2 },
  { id: 'p-18', left: '48%', top: '65%', size: 2, duration: 14, delay: 1.5, type: 3 },
  { id: 'p-19', left: '60%', top: '92%', size: 3, duration: 7, delay: 3, type: 1 },
  { id: 'p-20', left: '75%', top: '25%', size: 2, duration: 11, delay: 2.5, type: 2 },
  { id: 'p-21', left: '88%', top: '60%', size: 4, duration: 10, delay: 0, type: 3 },
  { id: 'p-22', left: '3%', top: '45%', size: 2, duration: 12, delay: 1, type: 1 },
  { id: 'p-23', left: '15%', top: '72%', size: 3, duration: 8, delay: 3, type: 2 },
  { id: 'p-24', left: '28%', top: '12%', size: 2, duration: 15, delay: 0.5, type: 3 },
  { id: 'p-25', left: '42%', top: '88%', size: 3, duration: 9, delay: 2, type: 1 },
  { id: 'p-26', left: '55%', top: '38%', size: 2, duration: 11, delay: 4, type: 2 },
  { id: 'p-27', left: '68%', top: '68%', size: 4, duration: 13, delay: 1.5, type: 3 },
  { id: 'p-28', left: '80%', top: '8%', size: 2, duration: 7, delay: 3.5, type: 1 },
  { id: 'p-29', left: '93%', top: '82%', size: 3, duration: 10, delay: 0, type: 2 },
  { id: 'p-30', left: '10%', top: '28%', size: 2, duration: 12, delay: 2, type: 3 },
  { id: 'p-31', left: '20%', top: '95%', size: 3, duration: 9, delay: 0.5, type: 1 },
  { id: 'p-32', left: '33%', top: '58%', size: 2, duration: 14, delay: 3, type: 2 },
  { id: 'p-33', left: '46%', top: '22%', size: 4, duration: 8, delay: 1, type: 3 },
  { id: 'p-34', left: '62%', top: '48%', size: 2, duration: 11, delay: 4.5, type: 1 },
  { id: 'p-35', left: '73%', top: '82%', size: 3, duration: 10, delay: 2, type: 2 },
  { id: 'p-36', left: '84%', top: '18%', size: 2, duration: 13, delay: 1, type: 3 },
  { id: 'p-37', left: '96%', top: '52%', size: 3, duration: 9, delay: 0, type: 1 },
  { id: 'p-38', left: '6%', top: '68%', size: 2, duration: 15, delay: 3.5, type: 2 },
  { id: 'p-39', left: '40%', top: '35%', size: 4, duration: 8, delay: 2.5, type: 3 },
  { id: 'p-40', left: '70%', top: '42%', size: 2, duration: 12, delay: 1.5, type: 1 },
];

const COLORS = {
  1: 'rgba(0, 212, 170, 0.6)',
  2: 'rgba(124, 92, 191, 0.5)',
  3: 'rgba(201, 168, 76, 0.4)',
};
const ANIMS = {
  1: 'float-particle',
  2: 'float-particle-2',
  3: 'float-particle-3',
};

export default function ParticleField() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: COLORS[p.type as keyof typeof COLORS],
            animation: `${ANIMS[p.type as keyof typeof ANIMS]} ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
