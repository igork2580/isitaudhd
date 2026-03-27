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
    <div>
      <h3 className="text-base sm:text-lg font-medium text-[--color-text] leading-relaxed" id={`question-${question.id}`}>
        {question.text}
      </h3>

      <fieldset className="mt-5" aria-labelledby={`question-${question.id}`}>
        <legend className="sr-only">{question.text}</legend>
        <div className="space-y-1.5" role="radiogroup">
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
                  w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-colors
                  ${isSelected
                    ? 'bg-[--color-btn] text-[--color-btn-text]'
                    : 'text-[--color-text] hover:bg-[--color-muted]'
                  }
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
