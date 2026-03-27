interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-[--color-text-light]">
        <span>Question {current} of {total}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2.5 bg-[--color-border] rounded-full overflow-hidden">
        <div
          className="h-full bg-[--color-primary] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
