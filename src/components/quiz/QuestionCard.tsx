import type { QuizQuestion } from '../../lib/quiz-types';

interface Props {
  question: QuizQuestion;
  selectedValue: number | undefined;
  onAnswer: (value: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

const LIKERT_OPTIONS = [
  { label: 'Strongly Disagree', shortKey: '1', value: 0 },
  { label: 'Disagree', shortKey: '2', value: 1 },
  { label: 'Neutral', shortKey: '3', value: 2 },
  { label: 'Agree', shortKey: '4', value: 3 },
  { label: 'Strongly Agree', shortKey: '5', value: 4 },
];

const FREQUENCY_OPTIONS = [
  { label: 'Never', shortKey: '1', value: 0 },
  { label: 'Rarely', shortKey: '2', value: 1 },
  { label: 'Sometimes', shortKey: '3', value: 2 },
  { label: 'Often', shortKey: '4', value: 3 },
  { label: 'Always', shortKey: '5', value: 4 },
];

export function QuestionCard({ question, selectedValue, onAnswer }: Props) {
  const options =
    question.type === 'scenario'
      ? (question.options || []).map((o, i) => ({ ...o, shortKey: String.fromCharCode(65 + i) }))
      : question.type === 'frequency'
        ? FREQUENCY_OPTIONS
        : LIKERT_OPTIONS;

  return (
    <div>
      <p
        className="text-base sm:text-lg text-[--color-text] leading-relaxed"
        id={`question-${question.id}`}
      >
        {question.text}
      </p>

      <fieldset className="mt-6" aria-labelledby={`question-${question.id}`}>
        <legend className="sr-only">{question.text}</legend>
        <div className="space-y-2.5" role="radiogroup">
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
                  w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all flex items-center gap-3
                  ${isSelected
                    ? 'bg-[--color-primary] text-white shadow-sm'
                    : 'bg-[--color-surface] border border-[--color-border] text-[--color-text] hover:border-[--color-primary]/50'
                  }
                `}
              >
                <span className={`
                  w-6 h-6 rounded-md text-[11px] font-semibold flex items-center justify-center flex-shrink-0
                  ${isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-[--color-muted] text-[--color-text-light]'
                  }
                `}>
                  {option.shortKey}
                </span>
                <span className={isSelected ? 'font-medium' : ''}>{option.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
