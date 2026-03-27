import { useReducer, useEffect, useCallback } from 'react';
import type { QuizData, QuizState } from '../../lib/quiz-types';
import { calculateResults, encodeResults } from '../../lib/quiz-scoring';
import { QuestionCard } from './QuestionCard';
import { QuizResults } from './QuizResults';
import { ProgressBar } from './ProgressBar';

type Action =
  | { type: 'ANSWER'; questionId: string; value: number }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'COMPLETE' }
  | { type: 'RESTART' }
  | { type: 'RESTORE'; state: QuizState };

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.value },
      };
    case 'NEXT':
      return { ...state, currentIndex: state.currentIndex + 1 };
    case 'PREV':
      return { ...state, currentIndex: Math.max(0, state.currentIndex - 1) };
    case 'COMPLETE':
      return { ...state, completed: true };
    case 'RESTART':
      return { currentIndex: 0, answers: {}, completed: false };
    case 'RESTORE':
      return action.state;
    default:
      return state;
  }
}

const initialState: QuizState = {
  currentIndex: 0,
  answers: {},
  completed: false,
};

interface Props {
  quiz: QuizData;
}

export function QuizPlayer({ quiz }: Props) {
  const storageKey = `quiz-${quiz.id}`;
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as QuizState;
        if (!parsed.completed && Object.keys(parsed.answers).length > 0) {
          dispatch({ type: 'RESTORE', state: parsed });
        }
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Save to localStorage
  useEffect(() => {
    if (!state.completed && Object.keys(state.answers).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, storageKey]);

  const currentQuestion = quiz.questions[state.currentIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = state.currentIndex === totalQuestions - 1;
  const hasCurrentAnswer = currentQuestion
    ? state.answers[currentQuestion.id] !== undefined
    : false;

  const handleAnswer = useCallback(
    (value: number) => {
      if (!currentQuestion) return;
      dispatch({ type: 'ANSWER', questionId: currentQuestion.id, value });
    },
    [currentQuestion],
  );

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      dispatch({ type: 'COMPLETE' });
      localStorage.removeItem(storageKey);
    } else {
      dispatch({ type: 'NEXT' });
    }
  }, [isLastQuestion, storageKey]);

  const handlePrev = useCallback(() => {
    dispatch({ type: 'PREV' });
  }, []);

  const handleRestart = useCallback(() => {
    dispatch({ type: 'RESTART' });
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  if (state.completed) {
    const results = calculateResults(quiz, state.answers);
    const shareCode = encodeResults(results);
    return (
      <QuizResults
        quiz={quiz}
        results={results}
        shareCode={shareCode}
        onRestart={handleRestart}
      />
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <ProgressBar current={state.currentIndex + 1} total={totalQuestions} />

      <div className="mt-6">
        <QuestionCard
          question={currentQuestion}
          selectedValue={state.answers[currentQuestion.id]}
          onAnswer={handleAnswer}
          questionNumber={state.currentIndex + 1}
          totalQuestions={totalQuestions}
        />
      </div>

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-[--color-border]">
        <button
          onClick={handlePrev}
          disabled={state.currentIndex === 0}
          className="text-sm text-[--color-text-light] hover:text-[--color-text] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          &larr; Back
        </button>

        <button
          onClick={handleNext}
          disabled={!hasCurrentAnswer}
          className="text-sm font-medium text-white bg-[--color-text] px-5 py-2 rounded-md hover:bg-[--color-text]/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {isLastQuestion ? 'See Results' : 'Continue'} &rarr;
        </button>
      </div>
    </div>
  );
}
