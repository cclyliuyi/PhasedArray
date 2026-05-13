import type { FC } from 'react';
import { useRef, useEffect, useMemo } from 'react';
import type { ArrayParams } from '../lib/arrayFactor';
import { computePattern, detectGratingLobes } from '../lib/arrayFactor';

interface PolarPlotProps {
  params: ArrayParams;
}

export const PolarPlot: FC<PolarPlotProps> = ({ params }) => {
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
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) / 2 - 30;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
    levels.forEach((level, i) => {
      ctx.strokeStyle = i === levels.length - 1 ? '#334155' : '#1e293b';
      ctx.lineWidth = i === levels.length - 1 ? 1 : 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * level, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${(level * 10).toFixed(0)}`, cx + radius * level + 4, cy + 4);
    });

    for (let angle = 0; angle < 360; angle += 30) {
      const rad = ((angle - 90) * Math.PI) / 180;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(rad), cy + radius * Math.sin(rad));
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      const labelRadius = radius + 16;
      ctx.fillText(`${angle}°`, cx + labelRadius * Math.cos(rad), cy + labelRadius * Math.sin(rad) + 3);
    }

    ctx.beginPath();
    for (let i = 0; i < pattern.angles.length; i++) {
      const thetaDeg = pattern.angles[i];
      const mag = pattern.magnitudes[i];
      const canvasAngle = ((90 - thetaDeg) * Math.PI) / 180;
      const r = mag * radius;
      const x = cx + r * Math.cos(canvasAngle);
      const y = cy + r * Math.sin(canvasAngle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (gl.present) {
      gl.angles.forEach((glAngle) => {
        const glIdx = glAngle;
        if (glIdx >= 0 && glIdx <= 180) {
          const mag = pattern.magnitudes[glIdx];
          const canvasAngle = ((90 - glAngle) * Math.PI) / 180;
          const r = mag * radius;
          const x = cx + r * Math.cos(canvasAngle);
          const y = cy + r * Math.sin(canvasAngle);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`GL ${glAngle}°`, x + 12, y - 4);
        }
      });
    }

    const scanRad = ((90 - params.scanAngleDeg) * Math.PI) / 180;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * 0.7 * Math.cos(scanRad), cy + radius * 0.7 * Math.sin(scanRad));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('极坐标方向图 (Polar Pattern)', cx, 16);
  }, [params, pattern, gl]);

  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-72" style={{ display: 'block' }} />
    </div>
  );
};
