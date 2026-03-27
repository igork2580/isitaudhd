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
}: Props) {
  const options =
    question.type === 'scenario'
      ? question.options || []
      : question.type === 'frequency'
        ? FREQUENCY_OPTIONS
        : LIKERT_OPTIONS;

  return (
    <div className="bg-[--color-surface] rounded-[--radius-xl] p-6 sm:p-8 shadow-sm border border-[--color-border]">
      <p className="text-xs font-medium text-[--color-text-light] uppercase tracking-wide mb-3">
        Question {questionNumber}
      </p>
      <h3 className="text-lg sm:text-xl font-medium text-[--color-text] leading-relaxed mb-8">
        {question.text}
      </h3>

      <div className={question.type === 'scenario' ? 'space-y-3' : 'space-y-2.5'}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <button
              key={option.label}
              onClick={() => onAnswer(option.value)}
              className={`
                w-full text-left px-5 py-3.5 rounded-[--radius-lg] border-2 transition-all duration-150
                ${
                  isSelected
                    ? 'border-[--color-primary] bg-[--color-primary]/8 text-[--color-primary-dark] font-medium'
                    : 'border-[--color-border] hover:border-[--color-primary]/40 text-[--color-text]'
                }
              `}
            >
              {question.type === 'scenario' ? (
                <span className="text-[15px] leading-relaxed">{option.label}</span>
              ) : (
                <div className="flex items-center gap-3">
                  <span
                    className={`
                      w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                      ${isSelected ? 'border-[--color-primary] bg-[--color-primary]' : 'border-[--color-border]'}
                    `}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="text-[15px]">{option.label}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
