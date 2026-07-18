interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
}

export function ProgressBar({ value, max = 100, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="progress-bar">
      {label ? <div className="progress-bar-label">{label}</div> : null}
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-bar-value">{Math.round(pct)}%</div>
    </div>
  );
}
