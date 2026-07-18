interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <label className="switch">
      <span className="switch-track" data-checked={checked}>
        <input
          type="checkbox"
          className="switch-input"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="switch-thumb" />
      </span>
      {label ? <span className="switch-label">{label}</span> : null}
    </label>
  );
}
