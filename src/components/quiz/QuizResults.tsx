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
      if (btn) { btn.textContent = 'Copied'; setTimeout(() => { btn.textContent = 'Copy link'; }, 2000); }
    } catch { /* */ }
  };

  const handleDownloadPDF = () => {
    const printContent = `<!DOCTYPE html><html><head><title>${quiz.title} Results</title>
      <style>body{font-family:system-ui,sans-serif;max-width:560px;margin:40px auto;padding:20px;color:#111}
      h1{font-size:20px}h2{font-size:16px;margin-top:24px}.bar{background:#e5e5e5;border-radius:4px;height:8px;margin:4px 0 16px}
      .fill{height:100%;border-radius:4px;background:#111}.note{background:#f7f7f7;padding:16px;border-radius:8px;margin-top:32px;font-size:13px;color:#666}
      ul{padding-left:20px}li{margin-bottom:6px;font-size:14px}</style></head><body>
      <h1>${quiz.title}</h1><p style="color:#666;font-size:13px">isitaudhd.com</p>
      <h2 style="margin-top:32px">${profile.title}</h2><p style="font-size:14px;color:#666">${profile.description}</p>
      ${quiz.scoring.axes.map(axis => `<h2 style="text-transform:capitalize">${axis}</h2><p style="font-size:13px;color:#666">${scores[axis]||0} / ${quiz.scoring.maxPerAxis} (${percentages[axis]||0}%)</p><div class="bar"><div class="fill" style="width:${percentages[axis]||0}%"></div></div>`).join('')}
      <h2>Next steps</h2><ul>${profile.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
      <div class="note">This quiz is not a diagnostic tool. Consult a qualified professional for assessment.</div></body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(printContent); win.document.close(); win.print(); }
  };

  return (
    <div className="max-w-xl mx-auto" role="region" aria-label="Quiz results">
      {/* Result */}
      <div className="text-center pb-8 border-b border-[--color-border]">
        <p className="text-sm text-[--color-text-light] mb-2">Your result</p>
        <h2 className="text-2xl font-bold text-[--color-text]">{profile.title}</h2>
        <p className="mt-3 text-sm text-[--color-text-light] leading-relaxed max-w-md mx-auto">
          {profile.description}
        </p>
      </div>

      {/* Scores */}
      <div className="py-8 border-b border-[--color-border]">
        <p className="text-sm font-medium text-[--color-text] mb-4">
          {quiz.scoring.axes.length > 1 ? 'Score breakdown' : 'Your score'}
        </p>
        <div className="space-y-4">
          {quiz.scoring.axes.map((axis) => (
            <div key={axis}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[--color-text] capitalize">{axis}</span>
                <span className="text-[--color-text-light] tabular-nums">{percentages[axis] || 0}%</span>
              </div>
              <div className="h-1.5 bg-[--color-border] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[--color-primary] transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(percentages[axis] || 0, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="py-8 border-b border-[--color-border]">
        <p className="text-sm font-medium text-[--color-text] mb-3">Next steps</p>
        <ul className="space-y-2">
          {profile.recommendations.map((rec, i) => (
            <li key={i} className="text-sm text-[--color-text-light] leading-relaxed pl-4 relative before:absolute before:left-0 before:top-[9px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[--color-border]">
              {rec}
            </li>
          ))}
        </ul>
        <a href="/learn/after-your-quiz/" className="inline-block mt-4 text-xs text-[--color-text-light] hover:text-[--color-text] transition-colors">
          Read: What to do after your quiz &rarr;
        </a>
      </div>

      {/* Email */}
      <div className="py-8 border-b border-[--color-border]">
        <p className="text-sm font-medium text-[--color-text] mb-1">Get your detailed breakdown</p>
        <p className="text-xs text-[--color-text-light] mb-3">We'll email you a full analysis plus weekly AuDHD insights.</p>
        <form
          className="flex gap-2 max-w-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            const btn = (e.target as HTMLFormElement).querySelector('button') as HTMLButtonElement;
            btn.textContent = 'Sent';
            btn.disabled = true;
            try {
              await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: ((e.target as HTMLFormElement).elements.namedItem('email') as HTMLInputElement)?.value, quizId: quiz.id }),
              });
            } catch { /* */ }
          }}
        >
          <input type="email" name="email" placeholder="your@email.com" required aria-label="Email"
            className="flex-1 px-3 py-2 rounded-md border border-[--color-border] bg-[--color-surface] text-sm text-[--color-text] focus:border-[--color-text]/30 focus:outline-none" />
          <button type="submit" className="text-sm font-medium text-[--color-btn-text] bg-[--color-btn] px-4 py-2 rounded-md hover:bg-[--color-btn]/80 transition-colors flex-shrink-0">
            Send
          </button>
        </form>
        <p className="text-[11px] text-[--color-text-light] mt-2">No spam. Unsubscribe anytime.</p>
      </div>

      {/* Share */}
      <div className="py-8 border-b border-[--color-border]">
        <p className="text-sm font-medium text-[--color-text] mb-3">Share</p>
        <div className="flex flex-wrap gap-2">
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-[--color-text-light] border border-[--color-border] px-3 py-1.5 rounded-md hover:border-[--color-text]/30 hover:text-[--color-text] transition-colors">
            Share on X
          </a>
          <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-[--color-text-light] border border-[--color-border] px-3 py-1.5 rounded-md hover:border-[--color-text]/30 hover:text-[--color-text] transition-colors">
            Share on Reddit
          </a>
          <button id="copy-btn" onClick={handleCopyLink}
            className="text-xs text-[--color-text-light] border border-[--color-border] px-3 py-1.5 rounded-md hover:border-[--color-text]/30 hover:text-[--color-text] transition-colors">
            Copy link
          </button>
          <button onClick={handleDownloadPDF}
            className="text-xs text-[--color-text-light] border border-[--color-border] px-3 py-1.5 rounded-md hover:border-[--color-text]/30 hover:text-[--color-text] transition-colors">
            Download PDF
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="py-8 flex items-center justify-between">
        <button onClick={onRestart} className="text-sm text-[--color-text-light] hover:text-[--color-text] transition-colors">
          &larr; Retake quiz
        </button>
        <a href="/quiz/" className="text-sm text-[--color-text-light] hover:text-[--color-text] transition-colors">
          More quizzes &rarr;
        </a>
      </div>

      {/* Disclaimer */}
      <div className="bg-[--color-muted] rounded-lg p-4">
        <p className="text-xs text-[--color-text-light] leading-relaxed">
          This quiz is not a diagnostic tool. It explores traits associated with AuDHD.
          Only a qualified professional can provide a diagnosis.
        </p>
      </div>
    </div>
  );
}
