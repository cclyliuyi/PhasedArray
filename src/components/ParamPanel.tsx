import type { FC } from 'react';
import { useMemo } from 'react';
import type { ArrayParams, ArrayMetrics } from '../lib/arrayFactor';
import { getWavelength } from '../lib/arrayFactor';

interface ParamPanelProps {
  params: ArrayParams;
  metrics: ArrayMetrics;
  onChange: (params: ArrayParams) => void;
}

export const ParamPanel: FC<ParamPanelProps> = ({ params, metrics, onChange }) => {
  const wavelength = useMemo(
    () => getWavelength(params.frequencyGHz),
    [params.frequencyGHz]
  );

  const statusColor =
    metrics.status === 'safe'
      ? 'bg-emerald-500'
      : metrics.status === 'warning'
      ? 'bg-amber-500'
      : 'bg-red-500';

  const statusBg =
    metrics.status === 'safe'
      ? 'bg-emerald-50/10'
      : metrics.status === 'warning'
      ? 'bg-amber-50/10'
      : 'bg-red-50/10';

  const handleSlider =
    (key: keyof ArrayParams) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...params, [key]: parseFloat(e.target.value) });
    };

  const handleNumber =
    (key: keyof ArrayParams) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...params, [key]: parseInt(e.target.value, 10) });
    };

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-700 p-5 flex flex-col gap-5 overflow-y-auto">
      <div className="flex items-center gap-2">
        <span className="text-2xl">📡</span>
        <h1 className="text-lg font-bold text-white">相控阵仿真</h1>
      </div>
      <p className="text-xs text-slate-400">均匀线性阵列 · 教学演示版</p>

      <div className={`${statusBg} border ${metrics.status === 'danger' ? 'border-red-500/50' : metrics.status === 'warning' ? 'border-amber-500/50' : 'border-emerald-500/50'} rounded-lg p-3`}>
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`}></div>
          <span className={`text-sm font-medium ${metrics.status === 'safe' ? 'text-emerald-400' : metrics.status === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>
            {metrics.status === 'safe' ? '安全' : metrics.status === 'warning' ? '警告' : '危险'}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{metrics.statusMessage}</p>
      </div>

      <div className="space-y-2">
        <label className="flex justify-between text-sm">
          <span className="text-slate-300">📶 工作频率</span>
          <span className="text-cyan-400 font-mono">{params.frequencyGHz} GHz</span>
        </label>
        <input type="range" min={1} max={100} step={1} value={params.frequencyGHz} onChange={handleSlider('frequencyGHz')} className="w-full accent-cyan-500" />
        <p className="text-xs text-slate-500">波长 λ = {wavelength.toFixed(3)} m</p>
      </div>

      <div className="space-y-2">
        <label className="flex justify-between text-sm">
          <span className="text-slate-300">📏 单元间距 d / λ</span>
          <span className="text-cyan-400 font-mono">{params.dOverLambda.toFixed(2)}</span>
        </label>
        <input type="range" min={0.1} max={2} step={0.01} value={params.dOverLambda} onChange={handleSlider('dOverLambda')} className="w-full accent-cyan-500" />
        <div className="flex justify-between text-xs text-slate-500">
          <span>0.1</span>
          <span className={params.dOverLambda > 0.5 ? 'text-amber-400' : 'text-emerald-400'}>λ/2 = 0.5</span>
          <span>2.0</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex justify-between text-sm">
          <span className="text-slate-300">🎯 扫描角度 θ</span>
          <span className="text-cyan-400 font-mono">{params.scanAngleDeg}°</span>
        </label>
        <input type="range" min={-90} max={90} step={1} value={params.scanAngleDeg} onChange={handleSlider('scanAngleDeg')} className="w-full accent-cyan-500" />
        <div className="flex justify-between text-xs text-slate-500">
          <span>-90°</span>
          <span>0° (法向)</span>
          <span>+90°</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex justify-between text-sm">
          <span className="text-slate-300">🔢 单元数量 N</span>
          <span className="text-cyan-400 font-mono">{params.numElements}</span>
        </label>
        <input type="range" min={2} max={64} step={1} value={params.numElements} onChange={handleNumber('numElements')} className="w-full accent-cyan-500" />
        <div className="flex justify-between text-xs text-slate-500">
          <span>2</span>
          <span>64</span>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-3">📊 实时指标</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">HPBW</p>
            <p className="text-lg font-bold text-cyan-400 font-mono">{metrics.hpbwDeg.toFixed(1)}°</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">SLL</p>
            <p className="text-lg font-bold text-cyan-400 font-mono">{metrics.sllDb.toFixed(1)} dB</p>
          </div>
        </div>
      </div>
    </div>
  );
};
