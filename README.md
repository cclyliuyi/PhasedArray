# 📡 相控阵天线仿真 | Phased Array Simulator

> 均匀线性阵列方向图仿真 — 波束扫描、阵列因子、栅瓣可视化教学工具

## 功能

- 📶 **波束扫描** — 实时调整扫描角度，观察波束偏转
- 📐 **阵列因子方向图** — 极坐标 + 直角坐标双视图
- 🚨 **栅瓣检测** — 颜色警示 + 动态演示栅瓣产生过程
- 📊 **实时指标** — HPBW（半功率波束宽度）和 SLL（旁瓣电平）自动计算

## 技术栈

- React + TypeScript + Vite
- Tailwind CSS
- Canvas API（纯前端可视化）

## 快速开始

```bash
npm install
npm run dev
```

## 部署

本项目已配置 GitHub Actions 自动部署到 GitHub Pages。

推送代码到 `main` 分支后，访问：
`https://cclyliuyi.github.io/PhasedArray/`

## 教学提示

1. 将 **d/λ** 拖到 0.5 以上，观察栅瓣如何出现
2. 增加 **N**，观察波束如何变窄（HPBW 减小）
3. 拖动 **扫描角度**，观察波束如何偏转
4. 在端射方向（±90°），波束会变宽，这是相控阵的物理限制

## 核心公式

均匀线性阵列阵列因子：

$$AF(\theta) = \frac{1}{N} \left| \frac{\sin(N\psi/2)}{\sin(\psi/2)} \right|$$

其中 $\psi = kd(\cos\theta - \cos\theta_0)$

---

*教学演示版 · 仅供学习使用*
