// Inline-SVG charts for the admin (no chart library). Brand colours only.

const CORAL = "var(--poskoo-coral)";
const MINT = "var(--poskoo-mint)";
const LILAC = "var(--poskoo-lilac)";
const RED = "var(--poskoo-red)";
const LINE = "var(--poskoo-line)";
const MUTED = "var(--poskoo-muted)";

function toPoints(data: number[], w: number, h: number, pad = 4): [number, number][] {
  const max = Math.max(1, ...data);
  const n = data.length;
  return data.map((v, i) => {
    const x = n <= 1 ? w / 2 : (i / (n - 1)) * w;
    const y = h - pad - (v / max) * (h - pad * 2);
    return [x, y];
  });
}

function linePath(pts: [number, number][]): string {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
}

// Tiny coral sparkline with a 10% coral area fill.
export function Sparkline({ data, width = 120, height = 32 }: { data: number[]; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const pts = toPoints(data, width, height);
  const area = `${linePath(pts)} L${width},${height} L0,${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label="Trend sparkline" style={{ marginTop: 8 }}>
      <path d={area} fill="rgba(255,106,61,0.10)" />
      <path d={linePath(pts)} fill="none" stroke={CORAL} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

// Line + area chart (signups / revenue) with gridlines and a muted axis label row.
export function AreaChart({
  data,
  ariaLabel,
  xLabels,
  height = 180,
}: {
  data: number[];
  ariaLabel: string;
  xLabels?: [string, string];
  height?: number;
}) {
  const w = 600;
  const pts = toPoints(data, w, height, 12);
  const area = `${linePath(pts)} L${w},${height} L0,${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} role="img" aria-label={ariaLabel}>
      <g stroke={LINE}>
        <line x1={0} y1={40} x2={w} y2={40} />
        <line x1={0} y1={90} x2={w} y2={90} />
        <line x1={0} y1={140} x2={w} y2={140} />
      </g>
      <path d={area} fill="rgba(255,106,61,0.10)" />
      <path d={linePath(pts)} fill="none" stroke={CORAL} strokeWidth={3} strokeLinejoin="round" />
      {xLabels && (
        <g fill={MUTED} fontSize={11}>
          <text x={0} y={height - 2}>{xLabels[0]}</text>
          <text x={w} y={height - 2} textAnchor="end">{xLabels[1]}</text>
        </g>
      )}
    </svg>
  );
}

export type DayStatus = { published: number; scheduled: number; failed: number };

// Stacked bars per day: published (mint), scheduled (lilac), failed (red).
export function StackedBars({ data, ariaLabel, height = 180 }: { data: DayStatus[]; ariaLabel: string; height?: number }) {
  const w = 600;
  const n = data.length;
  const max = Math.max(1, ...data.map((d) => d.published + d.scheduled + d.failed));
  const gap = 2;
  const bw = n > 0 ? (w - gap * (n - 1)) / n : w;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} role="img" aria-label={ariaLabel}>
      {data.map((d, i) => {
        const x = i * (bw + gap);
        const total = d.published + d.scheduled + d.failed;
        const totalH = (total / max) * (height - 20);
        const pubH = (d.published / max) * (height - 20);
        const schH = (d.scheduled / max) * (height - 20);
        const failH = (d.failed / max) * (height - 20);
        let y = height - 12 - totalH;
        const seg = (h: number, fill: string) => {
          const rect = h > 0 ? <rect x={x} y={y} width={bw} height={h} fill={fill} rx={2} /> : null;
          y += h;
          return rect;
        };
        return (
          <g key={i}>
            {seg(pubH, MINT)}
            {seg(schH, LILAC)}
            {seg(failH, RED)}
          </g>
        );
      })}
    </svg>
  );
}
