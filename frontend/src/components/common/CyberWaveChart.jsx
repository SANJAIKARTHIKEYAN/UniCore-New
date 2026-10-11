import React from 'react';

/**
 * CyberWaveChart — Luminous Academic Trajectory Area Spline Chart
 * Renders an SVG area curve with dual curves (student actual + cohort target benchmark),
 * milestone data nodes, and smooth gradients matching the Stitch Academic Luminary specification.
 */
export default function CyberWaveChart({
  data = [45, 52, 68, 62, 85, 78, 88, 92],
  labels = ['W1', 'W4', 'W8', 'W11', 'W14', 'W16'],
  strokeColor = '#493ee5',
  benchmarkColor = '#0d50d5',
  fillGradientId = 'luminaryWaveGrad',
  height = 190,
  minVal = 0,
  maxVal = 100,
  showBenchmark = true,
  showDots = true,
}) {
  const width = 760;
  const padding = { top: 25, bottom: 35, left: 35, right: 35 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Normalize data items
  const numericValues = data.map((item) => (typeof item === 'number' ? item : item?.value ?? 0));
  const effectiveLabels = data[0]?.label ? data.map((item) => item.label) : labels;

  // Map student points
  const points = numericValues.map((val, idx) => {
    const x = padding.left + (idx / Math.max(1, numericValues.length - 1)) * chartW;
    const norm = Math.max(0, Math.min(1, (val - minVal) / Math.max(1, maxVal - minVal)));
    const y = padding.top + chartH - norm * chartH;
    return { x, y, val };
  });

  // Benchmark cohort target points (gentle upward curve ~75% to ~83%)
  const benchmarkPoints = numericValues.map((_, idx) => {
    const x = padding.left + (idx / Math.max(1, numericValues.length - 1)) * chartW;
    const benchVal = 70 + (idx / Math.max(1, numericValues.length - 1)) * 14;
    const norm = Math.max(0, Math.min(1, (benchVal - minVal) / Math.max(1, maxVal - minVal)));
    const y = padding.top + chartH - norm * chartH;
    return { x, y, val: benchVal };
  });

  // Generate smooth cubic bezier spline curve
  const createSplinePath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[0];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const linePath = createSplinePath(points);
  const benchmarkPath = createSplinePath(benchmarkPoints);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`
      : '';

  const lastPoint = points[points.length - 1] || { x: 0, y: 0, val: 0 };

  return (
    <div className="cyber-chart-wrapper" style={{ width: '100%', overflow: 'hidden', position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#493ee5" stopOpacity="0.28" />
            <stop offset="60%" stopColor="#635bff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#635bff" stopOpacity="0.00" />
          </linearGradient>
          <filter id="luminaryGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#493ee5" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Horizontal subtle guide lines */}
        {[25, 50, 75, 100].map((level) => {
          const y = padding.top + chartH - (level / 100) * chartH;
          return (
            <line
              key={level}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          );
        })}

        {/* Baseline */}
        <line
          x1={padding.left}
          y1={padding.top + chartH}
          x2={width - padding.right}
          y2={padding.top + chartH}
          stroke="#cbd5e1"
          strokeWidth="1.2"
        />

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${fillGradientId})`} />

        {/* Cohort Benchmark line (Target) */}
        {showBenchmark && (
          <path
            d={benchmarkPath}
            fill="none"
            stroke={benchmarkColor}
            strokeWidth="2"
            strokeDasharray="6 6"
            opacity="0.65"
            strokeLinecap="round"
          />
        )}

        {/* Student Performance spline line */}
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.5"
          filter="url(#luminaryGlow)"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data point nodes */}
        {showDots &&
          points.map((pt, i) => {
            const isLast = i === points.length - 1;
            return (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isLast ? '6' : '4.5'}
                  fill={isLast ? '#493ee5' : '#ffffff'}
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  filter={isLast ? 'url(#luminaryGlow)' : undefined}
                />
              </g>
            );
          })}

        {/* X-axis milestone labels */}
        {effectiveLabels.map((lbl, idx) => {
          const x = padding.left + (idx / Math.max(1, effectiveLabels.length - 1)) * chartW;
          const isCurrent = idx === effectiveLabels.length - 2 || idx === effectiveLabels.length - 1;
          return (
            <text
              key={lbl + idx}
              x={x}
              y={height - 8}
              fill={isCurrent ? '#493ee5' : '#64748b'}
              fontSize="11"
              fontWeight={isCurrent ? '700' : '500'}
              textAnchor="middle"
              fontFamily="var(--font-body)"
            >
              {lbl}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
