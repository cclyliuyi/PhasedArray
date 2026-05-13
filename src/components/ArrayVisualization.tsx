import type { FC } from 'react';
import { useRef, useEffect } from 'react';
import type { ArrayParams } from '../lib/arrayFactor';

interface ArrayVisualizationProps {
  params: ArrayParams;
}

export const ArrayVisualization: FC<ArrayVisualizationProps> = ({ params }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { numElements, dOverLambda, scanAngleDeg } = params;

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

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    const N = numElements;
    const dPx = Math.max(20, Math.min(50, dOverLambda * 40));
    const totalLength = (N - 1) * dPx;
    const startX = (W - totalLength) / 2;
    const centerY = H / 2;

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(W, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('阵列轴 (x)', W / 2, centerY - 10);

    const elementRadius = 6;
    for (let i = 0; i < N; i++) {
      const x = startX + i * dPx;

      const gradient = ctx.createRadialGradient(x, centerY, 1, x, centerY, elementRadius + 4);
      gradient.addColorStop(0, '#06b6d4');
      gradient.addColorStop(0.5, '#0891b2');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, centerY, elementRadius + 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(x, centerY, elementRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText(`n=${i + 1}`, x, centerY + elementRadius + 14);

      const theta0 = (scanAngleDeg * Math.PI) / 180;
      const phase = i * dOverLambda * (Math.cos(0) - Math.cos(theta0)) * 2 * Math.PI;
      const arrowLen = 12;
      const arrowAngle = -phase;

      ctx.save();
      ctx.translate(x, centerY - elementRadius - 20);
      ctx.rotate(arrowAngle);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(arrowLen, 0);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(arrowLen, 0);
      ctx.lineTo(arrowLen - 4, -3);
      ctx.lineTo(arrowLen - 4, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`d = ${dOverLambda.toFixed(2)}λ`, startX + totalLength / 2, centerY + 30);

    if (scanAngleDeg !== 0) {
      const arrowStartX = W / 2;
      const arrowStartY = centerY - 30;
      const arrowLen2 = 40;
      const arrowAngle2 = (-scanAngleDeg * Math.PI) / 180;

      ctx.save();
      ctx.translate(arrowStartX, arrowStartY);
      ctx.rotate(arrowAngle2);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(arrowLen2, 0);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(arrowLen2, 0);
      ctx.lineTo(arrowLen2 - 6, -5);
      ctx.lineTo(arrowLen2 - 6, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`θ = ${scanAngleDeg}°`, arrowStartX + arrowLen2 * 0.7, arrowStartY - 8);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(12, H - 20, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.fillText('相对相位', 20, H - 16);

    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(12, H - 36, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.fillText('扫描方向', 20, H - 32);
  }, [numElements, dOverLambda, scanAngleDeg]);

  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-slate-800 border-b border-slate-700">
        <h3 className="text-sm font-medium text-slate-200">📐 物理阵列</h3>
      </div>
      <div className="p-2">
        <canvas ref={canvasRef} className="w-full h-48" style={{ display: 'block' }} />
      </div>
    </div>
  );
};
