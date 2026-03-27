import type { QuizData, QuizResults as QuizResultsType } from '../../lib/quiz-types';

interface Props {
  quiz: QuizData;
  results: QuizResultsType;
  shareCode: string;
  onRestart: () => void;
}

export function QuizResults({ quiz, results, shareCode, onRestart }: Props) {
  const { profile, percentages, scores } = results;
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/quiz/${quiz.id}/?r=${shareCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      const btn = document.getElementById('copy-btn');
      if (btn) {
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.textContent = 'Copy Link';
        }, 2000);
      }
    } catch {
      // fallback
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profile result */}
      <div className="bg-[--color-surface] rounded-[--radius-xl] p-8 sm:p-10 shadow-sm border border-[--color-border] text-center">
        <div className="text-5xl mb-4">{profile.emoji}</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[--color-text] mb-3">
          {profile.title}
        </h2>
        <p className="text-[--color-text-light] leading-relaxed max-w-lg mx-auto">
          {profile.description}
        </p>
      </div>

      {/* Score breakdown */}
      {quiz.scoring.axes.length > 1 && (
        <div className="bg-[--color-surface] rounded-[--radius-xl] p-6 sm:p-8 shadow-sm border border-[--color-border]">
          <h3 className="text-lg font-semibold text-[--color-text] mb-6">
            Your Scores
          </h3>
          <div className="space-y-5">
            {quiz.scoring.axes.map((axis) => (
              <div key={axis}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-[--color-text] capitalize">
                    {axis} traits
                  </span>
                  <span className="text-[--color-text-light]">
                    {scores[axis] || 0} / {quiz.scoring.maxPerAxis} ({percentages[axis] || 0}%)
                  </span>
                </div>
                <div className="h-3 bg-[--color-border] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(percentages[axis] || 0, 100)}%`,
                      backgroundColor:
                        axis === 'autism'
                          ? 'var(--color-primary)'
                          : axis === 'adhd'
                            ? 'var(--color-secondary)'
                            : axis === 'burnout'
                              ? 'var(--color-secondary)'
                              : 'var(--color-accent)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Single axis (burnout) */}
      {quiz.scoring.axes.length === 1 && (
        <div className="bg-[--color-surface] rounded-[--radius-xl] p-6 sm:p-8 shadow-sm border border-[--color-border]">
          <h3 className="text-lg font-semibold text-[--color-text] mb-4">
            Your Score
          </h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-[--color-primary] mb-1">
              {percentages[quiz.scoring.axes[0]]}%
            </div>
            <p className="text-sm text-[--color-text-light]">
              {scores[quiz.scoring.axes[0]]} out of {quiz.scoring.maxPerAxis}
            </p>
          </div>
          <div className="mt-4 h-3 bg-[--color-border] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[--color-secondary] transition-all duration-500"
              style={{ width: `${percentages[quiz.scoring.axes[0]]}%` }}
            />
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-[--color-surface] rounded-[--radius-xl] p-6 sm:p-8 shadow-sm border border-[--color-border]">
        <h3 className="text-lg font-semibold text-[--color-text] mb-4">
          What You Can Do Next
        </h3>
        <ul className="space-y-3">
          {profile.recommendations.map((rec, i) => (
            <li key={i} className="flex gap-3 text-[--color-text]">
              <span className="text-[--color-primary] mt-0.5 flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-[--color-accent]/10 rounded-[--radius-lg] p-5 border border-[--color-accent]/20">
        <p className="text-sm text-[--color-text-light] leading-relaxed">
          <strong>Important:</strong> This quiz is not a diagnostic tool. It is designed
          to help you explore traits associated with AuDHD (autism + ADHD). Only a
          qualified professional can provide a diagnosis. If your results resonate with
          you, consider speaking with a psychologist or psychiatrist who specializes in
          neurodivergence.
        </p>
      </div>

      {/* Email capture */}
      <div className="bg-[--color-surface] rounded-[--radius-xl] p-6 sm:p-8 shadow-sm border border-[--color-border] text-center">
        <h3 className="text-lg font-semibold text-[--color-text] mb-2">
          Get Your Detailed Breakdown
        </h3>
        <p className="text-sm text-[--color-text-light] mb-5">
          Enter your email to receive a detailed analysis of your quiz results,
          plus weekly AuDHD insights.
        </p>
        <form
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
            if (email) {
              // TODO: integrate with email service
              const btn = form.querySelector('button');
              if (btn) {
                btn.textContent = 'Subscribed!';
                btn.disabled = true;
              }
            }
          }}
        >
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            required
            className="flex-1 px-4 py-3 rounded-[--radius-lg] border-2 border-[--color-border] focus:border-[--color-primary] focus:outline-none text-[--color-text] bg-[--color-background]"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-[--radius-lg] font-semibold bg-[--color-secondary] text-white hover:bg-[--color-secondary-dark] transition-colors"
          >
            Send Results
          </button>
        </form>
        <p className="text-xs text-[--color-text-light] mt-3">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          id="copy-btn"
          onClick={handleCopyLink}
          className="px-6 py-3 rounded-[--radius-lg] font-medium border-2 border-[--color-border] text-[--color-text] hover:border-[--color-primary] transition-colors"
        >
          Copy Link
        </button>
        <button
          onClick={onRestart}
          className="px-6 py-3 rounded-[--radius-lg] font-medium text-[--color-text-light] hover:text-[--color-text] transition-colors"
        >
          Retake Quiz
        </button>
      </div>

      {/* More quizzes CTA */}
      <div className="text-center pt-4">
        <a
          href="/quiz/"
          className="text-[--color-primary] hover:text-[--color-primary-dark] font-medium transition-colors"
        >
          Explore more quizzes &rarr;
        </a>
      </div>
    </div>
  );
}
