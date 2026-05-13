// 相控阵核心数学计算

export interface ArrayParams {
  frequencyGHz: number;    // 工作频率 (GHz)
  dOverLambda: number;     // 单元间距 / 波长
  scanAngleDeg: number;    // 扫描角度 (度)
  numElements: number;     // 单元数量
}

export interface ArrayMetrics {
  hpbwDeg: number;         // 半功率波束宽度 (度)
  sllDb: number;           // 第一旁瓣电平 (dB)
  gratingLobePresent: boolean;
  gratingLobeAngles: number[]; // 栅瓣角度列表
  status: 'safe' | 'warning' | 'danger';
  statusMessage: string;
}

const C = 3e8; // 光速 m/s

/**
 * 计算波长 (米)
 */
export function getWavelength(frequencyGHz: number): number {
  const freqHz = frequencyGHz * 1e9;
  return C / freqHz;
}

/**
 * 计算阵列因子 AF(θ)
 * 均匀线性阵列，均匀激励
 * AF(θ) = |sin(N·ψ/2) / sin(ψ/2)|
 * 其中 ψ = kd·cosθ + β
 * β = -kd·cosθ₀ (扫描到 θ₀)
 */
export function arrayFactor(
  thetaDeg: number,
  params: ArrayParams
): number {
  const { dOverLambda, scanAngleDeg, numElements } = params;
  const N = numElements;
  const dOverLam = dOverLambda;
  const theta0 = (scanAngleDeg * Math.PI) / 180;

  const theta = (thetaDeg * Math.PI) / 180;
  const k = (2 * Math.PI) / 1; // k·λ = 2π, 用归一化单位

  // ψ = k·d·(cosθ - cosθ₀)
  const psi = k * dOverLam * (Math.cos(theta) - Math.cos(theta0));

  const psiHalf = psi / 2;
  const NpsiHalf = (N * psi) / 2;

  // 处理 ψ → 0 的极限情况 (主瓣方向)
  if (Math.abs(psiHalf) < 1e-10) {
    return 1;
  }

  const af = Math.abs(Math.sin(NpsiHalf) / Math.sin(psiHalf));
  return af / N; // 归一化
}

/**
 * 计算方向图数据 (0° ~ 180°, 即 θ = 0 到 π)
 */
export function computePattern(params: ArrayParams): {
  angles: number[];
  magnitudes: number[];
  magnitudesDb: number[];
} {
  const angles: number[] = [];
  const magnitudes: number[] = [];
  const magnitudesDb: number[] = [];

  for (let theta = 0; theta <= 180; theta++) {
    const af = arrayFactor(theta, params);
    angles.push(theta);
    magnitudes.push(af);
    magnitudesDb.push(20 * Math.log10(Math.max(af, 1e-10)));
  }

  return { angles, magnitudes, magnitudesDb };
}

/**
 * 检测栅瓣
 * 栅瓣条件: |d/λ · (cosθ - cosθ₀)| = m (m = ±1, ±2, ...)
 * 即 cosθ = cosθ₀ ± m·λ/d
 */
export function detectGratingLobes(params: ArrayParams): {
  present: boolean;
  angles: number[];
} {
  const { dOverLambda, scanAngleDeg } = params;
  const theta0 = (scanAngleDeg * Math.PI) / 180;
  const cosTheta0 = Math.cos(theta0);
  const dOverLam = dOverLambda;

  const gratingLobeAngles: number[] = [];

  // 检查 m = ±1, ±2, ...
  for (let m = 1; m <= 5; m++) {
    for (const sign of [1, -1]) {
      const cosTheta = cosTheta0 + sign * m / dOverLam;
      if (Math.abs(cosTheta) <= 1) {
        const theta = (Math.acos(cosTheta) * 180) / Math.PI;
        // 排除主瓣附近 (|θ - θ₀| < 5°)
        if (Math.abs(theta - Math.abs(scanAngleDeg)) > 5) {
          gratingLobeAngles.push(Math.round(theta));
        }
      }
    }
  }

  // 去重并排序
  const uniqueAngles = [...new Set(gratingLobeAngles)].sort((a, b) => a - b);

  return {
    present: uniqueAngles.length > 0,
    angles: uniqueAngles,
  };
}

/**
 * 计算 HPBW (半功率波束宽度)
 * 对于大 N 均匀阵列: HPBW ≈ 0.886 · λ / (N·d·cosθ₀) (弧度)
 */
export function computeHPBW(params: ArrayParams): number {
  const { numElements, dOverLambda, scanAngleDeg } = params;
  const N = numElements;
  const dOverLam = dOverLambda;
  const theta0 = (scanAngleDeg * Math.PI) / 180;

  const arrayLength = N * dOverLam; // 阵列总长度 (以 λ 为单位)
  const cosTheta0 = Math.abs(Math.cos(theta0));

  // 避免端射方向除零
  const effectiveLength = cosTheta0 > 0.01 ? arrayLength * cosTheta0 : arrayLength * 0.01;

  // HPBW (弧度) ≈ 0.886 / (N·d/λ·cosθ₀)
  let hpbwRad = 0.886 / effectiveLength;

  // 端射方向波束展宽修正
  if (cosTheta0 < 0.1) {
    hpbwRad *= 1 / Math.sqrt(cosTheta0 + 0.01);
  }

  return (hpbwRad * 180) / Math.PI;
}

/**
 * 计算第一旁瓣电平 (均匀阵列 ≈ -13.2 dB)
 */
export function computeSLL(): number {
  // 均匀线性阵列的第一旁瓣电平约为 -13.26 dB
  // 这是理论值，与 N 无关（N 足够大时）
  return -13.26;
}

/**
 * 综合评估状态
 */
export function evaluateStatus(params: ArrayParams): ArrayMetrics {
  const gl = detectGratingLobes(params);
  const hpbw = computeHPBW(params);
  const sll = computeSLL();

  let status: 'safe' | 'warning' | 'danger' = 'safe';
  let statusMessage = '✅ 参数安全，无栅瓣风险';

  if (gl.present) {
    status = 'danger';
    statusMessage = `🚨 严重栅瓣！检测到 ${gl.angles.length} 个栅瓣，角度: ${gl.angles.join('°, ')}°`;
  } else if (params.dOverLambda > 0.5) {
    status = 'warning';
    statusMessage = '⚠️ 注意：单元间距超过 λ/2，可能出现栅瓣';
  }

  return {
    hpbwDeg: hpbw,
    sllDb: sll,
    gratingLobePresent: gl.present,
    gratingLobeAngles: gl.angles,
    status,
    statusMessage,
  };
}
