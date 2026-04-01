'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface CertData {
  name: string;
  scenarioTitle: string;
  scenarioEmoji: string;
  score: number;
  wowMoment: string;
  completedDate: string;
  scenariosCompleted: number;
  aiReasoning: number;
}

const SCENARIO_TITLES: Record<string, { title: string; emoji: string; wow: string }> = {
  bacterial_wgs: {
    title: 'Mystery Bacterial Strain',
    emoji: '🦠',
    wow: 'OXA-900 carbapenemase discovered via de novo assembly — not in any reference database. Novel resistance gene that changed the treatment decision from meropenem failure to colistin success.',
  },
  tumor_wgs: {
    title: 'Tumor Somatic Variants',
    emoji: '🧬',
    wow: 'STK11 co-mutation at 4.2% VAF detected by DeepVariant at 100x coverage. Predicted immunotherapy resistance. Monotherapy protocol: 78% 2-year response rate vs 41% with combination.',
  },
  metagenomics: {
    title: 'Contaminated Metagenome',
    emoji: '🧫',
    wow: '277,200 "noise" reads contained a novel IBD-associated temperate phage. AI anomaly detection found the discovery that defines the paper. Accepted: Nature Microbiology.',
  },
};

export default function CertificateClient() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [certData, setCertData] = useState<CertData>({
    name: '',
    scenarioTitle: 'Mystery Bacterial Strain',
    scenarioEmoji: '🦠',
    score: 85,
    wowMoment: SCENARIO_TITLES['bacterial_wgs'].wow,
    completedDate: '',
    scenariosCompleted: 1,
    aiReasoning: 85,
  });
  const [nameInput, setNameInput] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPngDownloading, setIsPngDownloading] = useState(false);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    setDateStr(formatted);

    const scenarioId =
      typeof window !== 'undefined' ? sessionStorage.getItem('omicsmind_cert_scenario') || 'bacterial_wgs'
        : 'bacterial_wgs';
    const scoreRaw =
      typeof window !== 'undefined' ? sessionStorage.getItem('omicsmind_cert_score')
        : null;
    const score = scoreRaw ? Number(scoreRaw) : 85;

    const scenarioInfo = SCENARIO_TITLES[scenarioId] || SCENARIO_TITLES['bacterial_wgs'];

    const stored =
      typeof window !== 'undefined' ? localStorage.getItem('omicsmind_completed')
        : null;
    let completedCount = 1;
    if (stored) {
      try {
        completedCount = JSON.parse(stored).length || 1;
      } catch {
        completedCount = 1;
      }
    }

    setCertData({
      name: '',
      scenarioTitle: scenarioInfo.title,
      scenarioEmoji: scenarioInfo.emoji,
      score,
      wowMoment: scenarioInfo.wow,
      completedDate: formatted,
      scenariosCompleted: completedCount,
      aiReasoning: Math.round((score / 100) * 100),
    });
  }, []);

  const drawCertificate = useCallback(
    (canvas: HTMLCanvasElement, data: CertData, date: string) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;

      // Background
      ctx.fillStyle = '#0a0f1e';
      ctx.fillRect(0, 0, W, H);

      // Dot pattern background
      ctx.fillStyle = 'rgba(255,255,255,0.025)';
      for (let x = 20; x < W; x += 28) {
        for (let y = 20; y < H; y += 28) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Inner white card
      const margin = 40;
      const cardX = margin;
      const cardY = margin;
      const cardW = W - margin * 2;
      const cardH = H - margin * 2;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 16);
      ctx.fill();

      // Card shadow
      ctx.shadowColor = 'rgba(0,212,170,0.2)';
      ctx.shadowBlur = 30;
      ctx.strokeStyle = 'rgba(201,168,76,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Gold corner L-brackets
      const gold = '#c9a84c';
      const bSize = 28;
      const bThick = 3;
      const corners = [
        [cardX + 16, cardY + 16],
        [cardX + cardW - 16, cardY + 16],
        [cardX + 16, cardY + cardH - 16],
        [cardX + cardW - 16, cardY + cardH - 16],
      ];

      ctx.strokeStyle = gold;
      ctx.lineWidth = bThick;
      ctx.lineCap = 'round';

      // TL
      ctx.beginPath(); ctx.moveTo(corners[0][0] + bSize, corners[0][1]); ctx.lineTo(corners[0][0], corners[0][1]); ctx.lineTo(corners[0][0], corners[0][1] + bSize); ctx.stroke();
      // TR
      ctx.beginPath(); ctx.moveTo(corners[1][0] - bSize, corners[1][1]); ctx.lineTo(corners[1][0], corners[1][1]); ctx.lineTo(corners[1][0], corners[1][1] + bSize); ctx.stroke();
      // BL
      ctx.beginPath(); ctx.moveTo(corners[2][0] + bSize, corners[2][1]); ctx.lineTo(corners[2][0], corners[2][1]); ctx.lineTo(corners[2][0], corners[2][1] - bSize); ctx.stroke();
      // BR
      ctx.beginPath(); ctx.moveTo(corners[3][0] - bSize, corners[3][1]); ctx.lineTo(corners[3][0], corners[3][1]); ctx.lineTo(corners[3][0], corners[3][1] - bSize); ctx.stroke();

      const cx = W / 2;
      let y = cardY + 52;

      // GenoFlow header
      ctx.fillStyle = '#0a0f1e';
      ctx.font = '600 11px IBM Plex Mono, monospace';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '0.2em';
      ctx.fillText('GENOFLOW AGENCY', cx, y);
      y += 20;

      ctx.fillStyle = '#00d4aa';
      ctx.font = '500 10px IBM Plex Mono, monospace';
      ctx.fillText('OmicsMind Platform  ·  AI-Powered Omics Simulation', cx, y);
      y += 24;

      // Gold rule
      const drawGoldRule = (yPos: number, width = 340) => {
        const grad = ctx.createLinearGradient(cx - width / 2, yPos, cx + width / 2, yPos);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.2, gold);
        grad.addColorStop(0.5, '#f0d080');
        grad.addColorStop(0.8, gold);
        grad.addColorStop(1, 'transparent');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - width / 2, yPos);
        ctx.lineTo(cx + width / 2, yPos);
        ctx.stroke();
      };
      drawGoldRule(y);
      y += 28;

      // Certificate of Achievement
      ctx.fillStyle = '#0a0f1e';
      ctx.font = 'italic 700 28px Georgia, serif';
      ctx.letterSpacing = '0';
      ctx.fillText('Certificate of Achievement', cx, y);
      y += 28;

      // Gold ornament
      ctx.fillStyle = gold;
      ctx.font = '500 14px Georgia, serif';
      ctx.fillText('✦  ✦  ✦', cx, y);
      y += 28;

      // This certifies that
      ctx.fillStyle = '#555';
      ctx.font = '500 10px IBM Plex Mono, monospace';
      ctx.letterSpacing = '0.15em';
      ctx.fillText('THIS CERTIFIES THAT', cx, y);
      y += 30;

      // Student name
      const displayName = data.name || 'Learner';
      ctx.fillStyle = '#0a0f1e';
      ctx.font = `700 ${displayName.length > 20 ? '22px' : '28px'} DM Sans, sans-serif`;
      ctx.letterSpacing = '0';
      ctx.fillText(displayName, cx, y);

      // Underline
      const nameWidth = ctx.measureText(displayName).width;
      ctx.strokeStyle = '#0a0f1e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - nameWidth / 2, y + 5);
      ctx.lineTo(cx + nameWidth / 2, y + 5);
      ctx.stroke();
      y += 30;

      // Achievement text
      ctx.fillStyle = '#333';
      ctx.font = '400 13px DM Sans, sans-serif';
      ctx.fillText('has demonstrated mastery of AI-Driven Omics Analysis', cx, y);
      y += 20;
      ctx.fillText('and scientific reasoning across omics data interpretation', cx, y);
      y += 28;

      drawGoldRule(y, 300);
      y += 24;

      // Score boxes
      const boxes = [
        { label: 'Overall Score', value: `${data.score}/100` },
        { label: 'Scenarios', value: `${data.scenariosCompleted}/3` },
        { label: 'AI Reasoning', value: `${data.aiReasoning}%` },
      ];
      const boxW = 110;
      const boxH = 52;
      const boxGap = 18;
      const totalBoxW = boxes.length * boxW + (boxes.length - 1) * boxGap;
      const boxStartX = cx - totalBoxW / 2;

      boxes.forEach((box, i) => {
        const bx = boxStartX + i * (boxW + boxGap);
        const by = y;

        ctx.strokeStyle = gold;
        ctx.lineWidth = 1.5;
        ctx.fillStyle = 'rgba(201,168,76,0.05)';
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#888';
        ctx.font = '500 9px IBM Plex Mono, monospace';
        ctx.letterSpacing = '0.1em';
        ctx.textAlign = 'center';
        ctx.fillText(box.label.toUpperCase(), bx + boxW / 2, by + 16);

        ctx.fillStyle = gold;
        ctx.font = `700 ${box.value.length > 5 ? '16px' : '20px'} IBM Plex Mono, monospace`;
        ctx.letterSpacing = '0';
        ctx.fillText(box.value, bx + boxW / 2, by + 40);
      });
      y += boxH + 24;

      // Scenario info
      ctx.textAlign = 'center';
      ctx.fillStyle = '#555';
      ctx.font = '500 10px IBM Plex Mono, monospace';
      ctx.letterSpacing = '0.1em';
      ctx.fillText('SCENARIO COMPLETED', cx, y);
      y += 18;

      ctx.fillStyle = '#0a0f1e';
      ctx.font = '600 14px DM Sans, sans-serif';
      ctx.letterSpacing = '0';
      ctx.fillText(`${data.scenarioEmoji}  ${data.scenarioTitle}`, cx, y);
      y += 20;

      // Key discovery box
      const discBoxX = cardX + 50;
      const discBoxW = cardW - 100;
      const maxLineW = discBoxW - 32;

      ctx.fillStyle = 'rgba(0,212,170,0.05)';
      ctx.strokeStyle = 'rgba(0,212,170,0.3)';
      ctx.lineWidth = 1;

      // Word wrap the wow moment
      ctx.font = '400 11px DM Sans, sans-serif';
      const words = data.wowMoment.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxLineW && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      const discBoxH = 20 + lines.length * 16 + 16;
      ctx.beginPath();
      ctx.roundRect(discBoxX, y, discBoxW, discBoxH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00d4aa';
      ctx.font = '600 9px IBM Plex Mono, monospace';
      ctx.letterSpacing = '0.1em';
      ctx.fillText('KEY DISCOVERY', cx, y + 14);

      ctx.fillStyle = '#333';
      ctx.font = '400 11px DM Sans, sans-serif';
      ctx.letterSpacing = '0';
      lines.forEach((line, li) => {
        ctx.fillText(line, cx, y + 30 + li * 16);
      });
      y += discBoxH + 20;

      drawGoldRule(y, 260);
      y += 22;

      // Signature block
      ctx.fillStyle = '#0a0f1e';
      ctx.font = '600 12px DM Sans, sans-serif';
      ctx.fillText('⬡ GenoFlow Agency', cx, y);
      y += 16;

      ctx.fillStyle = '#888';
      ctx.font = '400 10px IBM Plex Mono, monospace';
      ctx.letterSpacing = '0.05em';
      ctx.fillText(`Issued: ${date}`, cx, y);
      y += 16;

      ctx.fillStyle = '#00d4aa';
      ctx.font = '400 10px IBM Plex Mono, monospace';
      ctx.fillText('noor@genoflow.bio  ·  +216 28 533 434', cx, y);
      y += 18;

      ctx.fillStyle = '#aaa';
      ctx.font = '400 9px IBM Plex Mono, monospace';
      ctx.fillText('Powered by OmicsMind  ·  GenoFlow Agency  ·  2026', cx, y);
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dateStr) return;
    drawCertificate(canvas, { ...certData, name: nameInput, completedDate: dateStr }, dateStr);
  }, [certData, nameInput, dateStr, drawCertificate]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`OmicsMind_Certificate_${nameInput || 'Learner'}_${certData.scenarioTitle.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPNG = () => {
    setIsPngDownloading(true);
    const canvas = canvasRef.current;
    if (!canvas) { setIsPngDownloading(false); return; }
    const link = document.createElement('a');
    link.download = `OmicsMind_Certificate_${nameInput || 'Learner'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setTimeout(() => setIsPngDownloading(false), 1000);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: '#0a0f1e', color: '#e8eaf0', fontFamily: 'DM Sans, sans-serif' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: '#0f1729', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/welcome')}
            className="text-sm px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95"
            style={{ color: '#8892a4', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
          >
            ← Back
          </button>
          <span className="font-semibold text-sm" style={{ color: '#e8eaf0' }}>
            Certificate of Achievement
          </span>
        </div>
        <div
          className="text-xs px-3 py-1 rounded-lg flex items-center gap-2"
          style={{ background: 'rgba(201,168,76,0.08)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.2)', fontFamily: 'IBM Plex Mono, monospace' }}
        >
          <span>⬡</span>
          <span>GenoFlow Agency</span>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-8 xl:px-10 2xl:px-16">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Controls panel */}
          <div className="xl:col-span-1 space-y-5">
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: '#e8eaf0' }}>
                Your Certificate
              </h2>
              <p className="text-sm" style={{ color: '#8892a4' }}>
                Customize and download your achievement certificate.
              </p>
            </div>

            {/* Name input */}
            <div
              className="rounded-2xl p-5"
              style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: '#8892a4', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono, monospace' }}
              >
                Your Name
              </label>
              <p className="text-xs mb-3" style={{ color: '#8892a4' }}>
                Enter your name as it should appear on the certificate.
              </p>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="Dr. Nour Ben Ali"
                maxLength={40}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: '#0f1729',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e8eaf0',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              />
            </div>

            {/* Scenario info */}
            <div
              className="rounded-2xl p-5"
              style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="text-xs font-semibold mb-3"
                style={{ color: '#8892a4', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono, monospace' }}
              >
                Certificate Details
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Scenario', value: `${certData.scenarioEmoji} ${certData.scenarioTitle}` },
                  { label: 'Score', value: `${certData.score}/100` },
                  { label: 'Date', value: dateStr || '—' },
                  { label: 'Issued by', value: 'GenoFlow Agency' },
                ].map(item => (
                  <div key={`detail-${item.label}`} className="flex justify-between">
                    <span className="text-xs" style={{ color: '#8892a4' }}>{item.label}</span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: '#e8eaf0', fontFamily: 'IBM Plex Mono, monospace' }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Download buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="w-full py-4 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #c9a84c, #f0d080)',
                  color: '#0a0f1e',
                  boxShadow: '0 0 20px rgba(201,168,76,0.25)',
                }}
              >
                {isDownloading ? 'Generating PDF...' : '⬇ Download PDF Certificate'}
              </button>

              <button
                onClick={handleDownloadPNG}
                disabled={isPngDownloading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-60"
                style={{
                  background: 'rgba(0,212,170,0.08)',
                  border: '1px solid rgba(0,212,170,0.3)',
                  color: '#00d4aa',
                }}
              >
                {isPngDownloading ? 'Downloading...' : '⬇ Download PNG Image'}
              </button>

              <button
                onClick={() => router.push('/welcome')}
                className="w-full py-3 rounded-xl text-sm transition-all duration-150 active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#8892a4',
                }}
              >
                Try Another Scenario →
              </button>
            </div>

            {/* genoFlow branding */}
            <div
              className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.12)' }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-base">⬡</span>
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  GenoFlow Agency
                </span>
              </div>
              <p className="text-xs" style={{ color: '#8892a4' }}>
                noor@genoflow.bio · +216 28 533 434
              </p>
              <p className="text-xs mt-1" style={{ color: '#8892a4' }}>
                Powered by OmicsMind · 2026
              </p>
            </div>
          </div>

          {/* Certificate canvas preview */}
          <div className="xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm mb-0.5" style={{ color: '#e8eaf0' }}>
                  Certificate Preview
                </h3>
                <p className="text-xs" style={{ color: '#8892a4' }}>
                  Updates live as you type your name
                </p>
              </div>
              <div
                className="text-xs px-2 py-1 rounded"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#8892a4', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'IBM Plex Mono, monospace' }}
              >
                800 × 560 px
              </div>
            </div>

            {/* Canvas wrapper */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(201,168,76,0.2)',
                boxShadow: '0 0 40px rgba(201,168,76,0.08)',
              }}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={560}
                className="w-full"
                style={{ display: 'block' }}
              />
            </div>

            {/* Tips */}
            <div
              className="mt-4 p-4 rounded-xl"
              style={{ background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.12)' }}
            >
              <div
                className="text-xs font-semibold mb-2"
                style={{ color: '#00d4aa', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.05em' }}
              >
                CERTIFICATE TIPS
              </div>
              <ul className="space-y-1 text-xs" style={{ color: '#8892a4' }}>
                <li>• Enter your full name above — it will appear on the certificate</li>
                <li>• PDF download uses jsPDF for high-quality print output</li>
                <li>• PNG download exports the canvas at full resolution (800×560px)</li>
                <li>• Complete all 3 scenarios to show 3/3 on your certificate</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="border-t py-6 px-6 text-center mt-8"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}
      >
        <p className="text-xs" style={{ color: '#8892a4' }}>
          Powered by OmicsMind · GenoFlow Agency · 2026 ·{' '}
          <a href="mailto:noor@genoflow.bio" style={{ color: '#00d4aa' }}>
            noor@genoflow.bio
          </a>
        </p>
      </footer>
    </div>
  );
}
