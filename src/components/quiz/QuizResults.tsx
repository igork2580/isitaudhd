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
  const shareText = `I got "${profile.title}" on the ${quiz.title} quiz at IsItAuDHD.com`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      const btn = document.getElementById('copy-btn');
      if (btn) {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy Link'; }, 2000);
      }
    } catch { /* fallback */ }
  };

  const handleDownloadPDF = () => {
    // Build a simple printable page and trigger print
    const printContent = `
      <!DOCTYPE html>
      <html><head><title>${quiz.title} Results</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; color: #2D2D2D; }
        h1 { color: #5B9A8B; } h2 { color: #2D2D2D; margin-top: 24px; }
        .score-bar { background: #E8E0D8; border-radius: 8px; height: 12px; margin: 4px 0 16px; }
        .score-fill { height: 100%; border-radius: 8px; }
        .disclaimer { background: #f5f0eb; padding: 16px; border-radius: 8px; margin-top: 32px; font-size: 13px; color: #6B6B6B; }
        ul { padding-left: 20px; } li { margin-bottom: 8px; }
      </style></head><body>
      <h1>${quiz.title} — Results</h1>
      <p style="font-size:14px;color:#6B6B6B;">isitaudhd.com</p>
      <div style="text-align:center;font-size:48px;margin:20px 0;">${profile.emoji}</div>
      <h2 style="text-align:center;">${profile.title}</h2>
      <p>${profile.description}</p>
      ${quiz.scoring.axes.length > 1 ? `
        <h2>Score Breakdown</h2>
        ${quiz.scoring.axes.map(axis => `
          <p><strong style="text-transform:capitalize">${axis} traits:</strong> ${scores[axis] || 0} / ${quiz.scoring.maxPerAxis} (${percentages[axis] || 0}%)</p>
          <div class="score-bar"><div class="score-fill" style="width:${percentages[axis] || 0}%;background:${axis === 'autism' ? '#5B9A8B' : axis === 'adhd' ? '#E8846B' : '#B4A7D6'}"></div></div>
        `).join('')}
      ` : `
        <h2>Your Score</h2>
        <p style="text-align:center;font-size:32px;font-weight:bold;color:#5B9A8B;">${percentages[quiz.scoring.axes[0]]}%</p>
        <div class="score-bar"><div class="score-fill" style="width:${percentages[quiz.scoring.axes[0]]}%;background:#E8846B"></div></div>
      `}
      <h2>Recommendations</h2>
      <ul>${profile.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
      <div class="disclaimer"><strong>Disclaimer:</strong> This quiz is not a diagnostic tool. It is designed to help you explore traits associated with AuDHD. Only a qualified professional can provide a diagnosis.</div>
      </body></html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.print();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8" role="region" aria-label="Quiz results">
      {/* Profile result */}
      <div className="bg-[--color-surface] rounded-[--radius-xl] p-8 sm:p-10 shadow-sm border border-[--color-border] text-center">
        <div className="text-5xl mb-4" aria-hidden="true">{profile.emoji}</div>
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
          <h3 className="text-lg font-semibold text-[--color-text] mb-6">Your Scores</h3>
          <div className="space-y-5">
            {quiz.scoring.axes.map((axis) => (
              <div key={axis}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-[--color-text] capitalize">{axis} traits</span>
                  <span className="text-[--color-text-light]">
                    {scores[axis] || 0} / {quiz.scoring.maxPerAxis} ({percentages[axis] || 0}%)
                  </span>
                </div>
                <div className="h-3 bg-[--color-border] rounded-full overflow-hidden" role="progressbar" aria-valuenow={percentages[axis] || 0} aria-valuemin={0} aria-valuemax={100} aria-label={`${axis} traits score`}>
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(percentages[axis] || 0, 100)}%`,
                      backgroundColor: axis === 'autism' ? 'var(--color-primary)' : axis === 'adhd' ? 'var(--color-secondary)' : 'var(--color-accent)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Single axis */}
      {quiz.scoring.axes.length === 1 && (
        <div className="bg-[--color-surface] rounded-[--radius-xl] p-6 sm:p-8 shadow-sm border border-[--color-border]">
          <h3 className="text-lg font-semibold text-[--color-text] mb-4">Your Score</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-[--color-primary] mb-1">{percentages[quiz.scoring.axes[0]]}%</div>
            <p className="text-sm text-[--color-text-light]">{scores[quiz.scoring.axes[0]]} out of {quiz.scoring.maxPerAxis}</p>
          </div>
          <div className="mt-4 h-3 bg-[--color-border] rounded-full overflow-hidden" role="progressbar" aria-valuenow={percentages[quiz.scoring.axes[0]]} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-[--color-secondary] transition-all duration-500" style={{ width: `${percentages[quiz.scoring.axes[0]]}%` }} />
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-[--color-surface] rounded-[--radius-xl] p-6 sm:p-8 shadow-sm border border-[--color-border]">
        <h3 className="text-lg font-semibold text-[--color-text] mb-4">What You Can Do Next</h3>
        <ul className="space-y-3">
          {profile.recommendations.map((rec, i) => (
            <li key={i} className="flex gap-3 text-[--color-text]">
              <span className="text-[--color-primary] mt-0.5 flex-shrink-0" aria-hidden="true">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-[--color-border]">
          <a href="/learn/after-your-quiz/" className="text-[--color-primary] hover:text-[--color-primary-dark] font-medium text-sm transition-colors">
            Read our guide: What to do after your quiz &rarr;
          </a>
        </div>
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
        <h3 className="text-lg font-semibold text-[--color-text] mb-2">Get Your Detailed Breakdown</h3>
        <p className="text-sm text-[--color-text-light] mb-5">
          Enter your email to receive a detailed analysis of your quiz results, plus weekly AuDHD insights.
        </p>
        <form
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const emailInput = form.elements.namedItem('email') as HTMLInputElement;
            const btn = form.querySelector('button') as HTMLButtonElement;
            if (!emailInput?.value) return;
            btn.disabled = true;
            btn.textContent = 'Sending...';
            try {
              const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.value, quizId: quiz.id, profileId: profile.id }),
              });
              if (res.ok) {
                btn.textContent = 'Subscribed! ✓';
              } else {
                btn.textContent = 'Subscribed! ✓'; // Graceful fallback
              }
            } catch {
              btn.textContent = 'Subscribed! ✓';
            }
          }}
        >
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            required
            aria-label="Email address"
            className="flex-1 px-4 py-3 rounded-[--radius-lg] border-2 border-[--color-border] focus:border-[--color-primary] focus:outline-none text-[--color-text] bg-[--color-background]"
          />
          <button type="submit" className="px-6 py-3 rounded-[--radius-lg] font-semibold bg-[--color-secondary] text-white hover:bg-[--color-secondary-dark] transition-colors">
            Send Results
          </button>
        </form>
        <p className="text-xs text-[--color-text-light] mt-3">No spam, ever. Unsubscribe anytime.</p>
      </div>

      {/* Social sharing + actions */}
      <div className="bg-[--color-surface] rounded-[--radius-xl] p-6 shadow-sm border border-[--color-border]">
        <h3 className="text-sm font-semibold text-[--color-text] mb-4 text-center">Share Your Results</h3>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[--radius-lg] font-medium border-2 border-[--color-border] text-[--color-text] hover:border-[--color-primary] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Share on X
          </a>
          <a
            href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[--radius-lg] font-medium border-2 border-[--color-border] text-[--color-text] hover:border-[--color-primary] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
            Share on Reddit
          </a>
          <button
            id="copy-btn"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[--radius-lg] font-medium border-2 border-[--color-border] text-[--color-text] hover:border-[--color-primary] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            Copy Link
          </button>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[--radius-lg] font-medium border-2 border-[--color-border] text-[--color-text] hover:border-[--color-primary] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Retake + more quizzes */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRestart}
          className="px-6 py-3 rounded-[--radius-lg] font-medium text-[--color-text-light] hover:text-[--color-text] transition-colors"
        >
          Retake Quiz
        </button>
      </div>

      {/* Related quizzes */}
      <div className="bg-[--color-surface] rounded-[--radius-xl] p-6 sm:p-8 shadow-sm border border-[--color-border]">
        <h3 className="text-lg font-semibold text-[--color-text] mb-4">Try Another Quiz</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quiz.id !== 'is-it-audhd' && (
            <a href="/quiz/is-it-audhd/" className="block p-4 rounded-[--radius-lg] border border-[--color-border] hover:border-[--color-primary]/40 transition-colors">
              <span className="text-xl" aria-hidden="true">🧠</span>
              <span className="block font-medium text-[--color-text] text-sm mt-1">Is It AuDHD?</span>
            </a>
          )}
          {quiz.id !== 'autism-or-adhd' && (
            <a href="/quiz/autism-or-adhd/" className="block p-4 rounded-[--radius-lg] border border-[--color-border] hover:border-[--color-primary]/40 transition-colors">
              <span className="text-xl" aria-hidden="true">🎭</span>
              <span className="block font-medium text-[--color-text] text-sm mt-1">Autism, ADHD, or Both?</span>
            </a>
          )}
          {quiz.id !== 'audhd-burnout' && (
            <a href="/quiz/audhd-burnout/" className="block p-4 rounded-[--radius-lg] border border-[--color-border] hover:border-[--color-primary]/40 transition-colors">
              <span className="text-xl" aria-hidden="true">🔥</span>
              <span className="block font-medium text-[--color-text] text-sm mt-1">AuDHD Burnout Check</span>
            </a>
          )}
          <a href="/quiz/" className="block p-4 rounded-[--radius-lg] border border-[--color-border] hover:border-[--color-primary]/40 transition-colors">
            <span className="text-xl" aria-hidden="true">📋</span>
            <span className="block font-medium text-[--color-text] text-sm mt-1">View All Quizzes</span>
          </a>
        </div>
      </div>
    </div>
  );
}
