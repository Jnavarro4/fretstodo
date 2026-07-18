interface StepperProps {
  value: string;
  onStep: (delta: number) => void;
}

export function Stepper({ value, onStep }: StepperProps) {
  return (
    <div className="stepper">
      <button onClick={() => onStep(-1)} aria-label="−">−</button>
      <span>{value}</span>
      <button onClick={() => onStep(1)} aria-label="+">+</button>
    </div>
  );
}
