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

export function QuestionCard({ question, selectedValue, onAnswer, questionNumber }: Props) {
  const options =
    question.type === 'scenario'
      ? question.options || []
      : question.type === 'frequency'
        ? FREQUENCY_OPTIONS
        : LIKERT_OPTIONS;

  return (
    <div className="bg-[--color-surface] rounded-xl border border-[--color-border] p-5 sm:p-6">
      <h3
        className="text-[0.9375rem] sm:text-base font-medium text-[--color-text] leading-relaxed"
        id={`question-${question.id}`}
      >
        {question.text}
      </h3>

      <fieldset className="mt-5" aria-labelledby={`question-${question.id}`}>
        <legend className="sr-only">{question.text}</legend>
        <div className="space-y-2" role="radiogroup">
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
                  const move = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1
                    : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
                  if (move) {
                    e.preventDefault();
                    const next = (index + move + options.length) % options.length;
                    onAnswer(options[next].value);
                    (e.currentTarget.parentElement?.children[next] as HTMLElement)?.focus();
                  }
                }}
                className={`
                  w-full text-left px-3.5 py-2.5 rounded-lg text-[0.8125rem] border transition-all
                  ${isSelected
                    ? 'border-[--color-primary] bg-[--color-primary-soft] text-[--color-text] font-medium'
                    : 'border-[--color-border] text-[--color-text] hover:border-[--color-text-light]/40 hover:bg-[--color-muted]/50'
                  }
                `}
              >
                <span className="flex items-center gap-2.5">
                  <span className={`
                    w-4 h-4 rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center transition-all
                    ${isSelected ? 'border-[--color-primary] bg-[--color-primary]' : 'border-[--color-border]'}
                  `}>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
