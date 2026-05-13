import { useState, useMemo } from 'react';
import type { ArrayParams } from './lib/arrayFactor';
import { evaluateStatus } from './lib/arrayFactor';
import { ParamPanel } from './components/ParamPanel';
import { ArrayVisualization } from './components/ArrayVisualization';
import { PolarPlot } from './components/PolarPlot';
import { RectangularPlot } from './components/RectangularPlot';

const defaultParams: ArrayParams = {
  frequencyGHz: 10,
  dOverLambda: 0.5,
  scanAngleDeg: 0,
  numElements: 8,
};

function App() {
  const [params, setParams] = useState<ArrayParams>(defaultParams);
  const metrics = useMemo(() => evaluateStatus(params), [params]);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <ParamPanel params={params} metrics={metrics} onChange={setParams} />
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">均匀线性阵列 · 方向图仿真</h2>
            <p className="text-sm text-slate-400 mt-1">调整左侧参数，实时观察波束扫描、方向图变化和栅瓣产生</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">阵列长度</p>
            <p className="text-lg font-bold text-cyan-400 font-mono">{(params.numElements * params.dOverLambda).toFixed(1)}λ</p>
          </div>
        </div>
        <ArrayVisualization params={params} />
        <PolarPlot params={params} />
        <RectangularPlot params={params} />
        <div className="mt-2 p-4 bg-slate-900 rounded-lg border border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-2">💡 教学提示</h3>
          <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
            <li>将 d/λ 拖到 0.5 以上，观察栅瓣如何出现</li>
            <li>增加 N，观察波束如何变窄（HPBW 减小）</li>
            <li>拖动扫描角度，观察波束如何偏转</li>
            <li>在端射方向（±90°），波束会变宽，这是相控阵的物理限制</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
