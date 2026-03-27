import type { QuizQuestion } from '../../lib/quiz-types';

interface Props {
  question: QuizQuestion;
  selectedValue: number | undefined;
  onAnswer: (value: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

const LIKERT_OPTIONS = [
  { label: 'Strongly Disagree', value: 0 },
  { label: 'Disagree', value: 1 },
  { label: 'Neutral', value: 2 },
  { label: 'Agree', value: 3 },
  { label: 'Strongly Agree', value: 4 },
];

const FREQUENCY_OPTIONS = [
  { label: 'Never', value: 0 },
  { label: 'Rarely', value: 1 },
  { label: 'Sometimes', value: 2 },
  { label: 'Often', value: 3 },
  { label: 'Always', value: 4 },
];

export function QuestionCard({
  question,
  selectedValue,
  onAnswer,
  questionNumber,
  totalQuestions,
}: Props) {
  const options =
    question.type === 'scenario'
      ? question.options || []
      : question.type === 'frequency'
        ? FREQUENCY_OPTIONS
        : LIKERT_OPTIONS;

  return (
    <div className="card p-6 sm:p-8" style={{ boxShadow: '0 2px 12px rgb(0 0 0 / 0.04), 0 1px 3px rgb(0 0 0 / 0.02)' }}>
      <h3 className="text-lg sm:text-xl font-medium text-[--color-text] leading-relaxed" id={`question-${question.id}`}>
        {question.text}
      </h3>

      <fieldset className="mt-7" aria-labelledby={`question-${question.id}`}>
        <legend className="sr-only">{question.text}</legend>
        <div className={question.type === 'scenario' ? 'space-y-2.5' : 'space-y-2'} role="radiogroup">
          {options.map((option, index) => {
            const isSelected = selectedValue === option.value;
            return (
              <button
                key={option.label}
                onClick={() => onAnswer(option.value)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const next = index < options.length - 1 ? index + 1 : 0;
                    onAnswer(options[next].value);
                    (e.currentTarget.parentElement?.children[next] as HTMLElement)?.focus();
                  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prev = index > 0 ? index - 1 : options.length - 1;
                    onAnswer(options[prev].value);
                    (e.currentTarget.parentElement?.children[prev] as HTMLElement)?.focus();
                  }
                }}
                className={`
                  w-full text-left px-4 py-3 rounded-[--radius-md] border transition-all duration-150 cursor-pointer
                  ${
                    isSelected
                      ? 'border-[--color-primary] bg-[--color-primary]/6 ring-1 ring-[--color-primary]/20'
                      : 'border-[--color-border] hover:border-[--color-text-light]/30 hover:bg-[--color-muted]/60'
                  }
                `}
              >
                {question.type === 'scenario' ? (
                  <div className="flex items-start gap-3">
                    <span className={`
                      mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                      ${isSelected ? 'border-[--color-primary] bg-[--color-primary]' : 'border-[--color-border]'}
                    `}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="text-[15px] leading-relaxed text-[--color-text]">{option.label}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className={`
                      w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                      ${isSelected ? 'border-[--color-primary] bg-[--color-primary]' : 'border-[--color-border]'}
                    `} aria-hidden="true">
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span className={`text-[15px] ${isSelected ? 'font-medium text-[--color-text]' : 'text-[--color-text]'}`}>
                      {option.label}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
