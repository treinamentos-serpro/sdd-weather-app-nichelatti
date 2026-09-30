import type { TemperatureUnit } from '../types/weather';

interface UnitToggleProps {
  unit: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      aria-label="Unidade de temperatura"
      className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1"
      role="group"
    >
      {(['celsius', 'fahrenheit'] as const).map((option) => (
        <button
          aria-label={option === 'celsius' ? 'Celsius' : 'Fahrenheit'}
          aria-pressed={unit === option}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 ${unit === option ? 'bg-accent-500 text-night-900' : 'text-slate-300 hover:text-white'}`}
          key={option}
          onClick={() => onChange(option)}
          type="button"
        >
          {option === 'celsius' ? '°C' : '°F'}
        </button>
      ))}
    </div>
  );
}
