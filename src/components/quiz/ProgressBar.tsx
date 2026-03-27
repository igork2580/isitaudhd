interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-[--color-text]">
          Question {current} <span className="text-[--color-text-light] font-normal">of {total}</span>
        </span>
        <span className="text-xs font-semibold text-[--color-primary] tabular-nums">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-[--color-muted] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, var(--color-primary), var(--color-accent-dark))`,
          }}
        />
      </div>
    </div>
  );
}
