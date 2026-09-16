"use client";

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
};

export default function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  formatValue,
}: SliderProps) {
  return (
    <label className="flex flex-col gap-1 text-xs text-neutral-300">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="text-neutral-500">
          {formatValue ? formatValue(value) : value.toFixed(2)}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="accent-indigo-400 h-1 w-full cursor-pointer appearance-none rounded-full bg-neutral-700"
      />
    </label>
  );
}
