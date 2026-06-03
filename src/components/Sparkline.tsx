interface Props {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
}

// Minimal SVG line graph of rating over recent solves. No axis labels.
export function Sparkline({ values, width = 280, height = 70, className }: Props) {
  if (values.length < 2) {
    return (
      <div
        className={`flex items-center justify-center font-body text-xs text-ink-light border-2 border-ink shadow-pixel bg-paper ${className ?? ''}`}
        style={{ width, height }}
      >
        Solve more puzzles to chart your rating.
      </div>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 6;
  const stepX = (width - pad * 2) / (values.length - 1);
  const points = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (height - pad * 2) * (1 - (v - min) / range);
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const last = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`border-2 border-ink shadow-pixel bg-paper ${className ?? ''}`}
      role="img"
      aria-label={`Rating trend, latest ${values[values.length - 1]}`}
    >
      <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth={2} />
      <rect x={last[0] - 3} y={last[1] - 3} width={6} height={6} fill="var(--color-ink)" />
    </svg>
  );
}
