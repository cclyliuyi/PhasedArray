import type { FC } from 'react';
import { useRef, useEffect, useMemo } from 'react';
import type { ArrayParams } from '../lib/arrayFactor';
import { computePattern, detectGratingLobes } from '../lib/arrayFactor';

interface RectangularPlotProps {
  params: ArrayParams;
}

export const RectangularPlot: FC<RectangularPlotProps> = ({ params }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pattern = useMemo(() => computePattern(params), [params]);
  const gl = useMemo(() => detectGratingLobes(params), [params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const padLeft = 50;
    const padRight = 20;
    const padTop = 30;
    const padBottom = 30;
    const plotW = W - padLeft - padRight;
    const plotH = H - padTop - padBottom;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    const minDb = -40;
    const maxDb = 0;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;

    for (let db = minDb; db <= maxDb; db += 10) {
      const y = padTop + plotH - ((db - minDb) / (maxDb - minDb)) * plotH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(W - padRight, y);
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${db} dB`, padLeft - 4, y + 3);
    }

    for (let theta = 0; theta <= 180; theta += 30) {
      const x = padLeft + (theta / 180) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, H - padBottom);
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${theta}°`, x, H - padBottom + 14);
    }

    ctx.beginPath();
    for (let i = 0; i < pattern.angles.length; i++) {
      const theta = pattern.angles[i];
      const db = pattern.magnitudesDb[i];
      const x = padLeft + (theta / 180) * plotW;
      const y = padTop + plotH - ((db - minDb) / (maxDb - minDb)) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padTop, 0, H - padBottom);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.02)');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (gl.present) {
      gl.angles.forEach((glAngle) => {
        const glIdx = glAngle;
        if (glIdx >= 0 && glIdx <= 180) {
          const db = pattern.magnitudesDb[glIdx];
          const x = padLeft + (glIdx / 180) * plotW;
          const y = padTop + plotH - ((db - minDb) / (maxDb - minDb)) * plotH;
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('GL', x, y - 8);
        }
      });
    }

    const scanX = padLeft + (params.scanAngleDeg / 180) * plotW;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(scanX, padTop);
    ctx.lineTo(scanX, H - padBottom);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('直角坐标方向图 (Rectangular Pattern)', W / 2, 16);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('θ (度)', W / 2, H - 8);
  }, [params, pattern, gl]);

  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-56" style={{ display: 'block' }} />
    </div>
  );
};
