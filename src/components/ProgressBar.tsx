interface ProgressBarProps {
  /** 0–100 */
  percent: number;
}

/** Barra de progreso Orange Tiger (regla visual del documento maestro). */
export function ProgressBar({ percent }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      className="progress-bar-track"
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <i className="progress-bar-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}
