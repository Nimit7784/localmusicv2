/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../audio/AudioEngine';

interface VisualizerCanvasProps {
  className?: string;
  height?: number;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({ className = '', height = 80 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'frequency' | 'oscilloscope'>('frequency');
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(256);

    const render = () => {
      animFrameId.current = requestAnimationFrame(render);

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== h * dpr) {
        canvas.width = width * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, h);

      if (mode === 'frequency') {
        audioEngine.getFrequencyData(dataArray);

        // Draw frequency grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.25);
        ctx.lineTo(width, h * 0.25);
        ctx.moveTo(0, h * 0.5);
        ctx.lineTo(width, h * 0.5);
        ctx.moveTo(0, h * 0.75);
        ctx.lineTo(width, h * 0.75);
        ctx.stroke();

        const barCount = 48;
        const step = Math.floor(dataArray.length / barCount);
        const barWidth = Math.max(2, (width / barCount) - 2);

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i * step] || 0;
          const percent = val / 255;
          const barHeight = Math.max(2, percent * (h - 8));
          const x = i * (barWidth + 2) + 2;
          const y = h - barHeight;

          // Studio phosphor gradient: warm amber to subtle gold
          const grad = ctx.createLinearGradient(0, y, 0, h);
          grad.addColorStop(0, '#f59e0b');
          grad.addColorStop(0.6, '#d97706');
          grad.addColorStop(1, '#78350f');

          ctx.fillStyle = grad;
          ctx.fillRect(x, y, barWidth, barHeight);

          // Top peak point
          if (percent > 0.08) {
            ctx.fillStyle = '#fde68a';
            ctx.fillRect(x, y - 2, barWidth, 1.5);
          }
        }
      } else {
        // Oscilloscope / Time Domain waveform
        audioEngine.getTimeDomainData(dataArray);

        // Center baseline
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(width, h / 2);
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();

        const sliceWidth = width / (dataArray.length - 1);
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0; // 0 to 2, 1 is center
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.stroke();
      }

      ctx.restore();
    };

    render();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [mode]);

  return (
    <div className={`relative bg-[#0d1017] rounded-xl border border-slate-800/80 p-2 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between pb-1 px-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
        <span>RTA Spectrum Analysis · 60 FPS</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMode((m) => (m === 'frequency' ? 'oscilloscope' : 'frequency'));
          }}
          className="text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-widest text-[9px] px-1.5 py-0.5 rounded bg-slate-800/60"
        >
          {mode === 'frequency' ? 'Oscilloscope Mode' : 'FFT Bars Mode'}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="block w-full"
      />
    </div>
  );
};
