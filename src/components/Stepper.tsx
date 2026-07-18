interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
}

export function Stepper({ value, onChange, min, max, step = 1, label }: StepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div className="stepper">
      {label ? <div className="stepper-label">{label}</div> : null}
      <div className="stepper-controls">
        <button
          type="button"
          className="stepper-button"
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          aria-label="decrease"
        >
          −
        </button>
        <span className="stepper-value">{value}</span>
        <button
          type="button"
          className="stepper-button"
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          aria-label="increase"
        >
          +
        </button>
      </div>
    </div>
  );
}
