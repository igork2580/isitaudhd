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

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrev}
          disabled={state.currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-[--radius-md] text-sm font-medium text-[--color-text-light] hover:text-[--color-text] hover:bg-[--color-muted] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!hasCurrentAnswer}
          className="btn-primary !text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {isLastQuestion ? 'See Results' : 'Continue'}
          <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
}
