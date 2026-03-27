import type { QuizData, QuizResults, QuizProfile } from './quiz-types';

export function calculateResults(
  quiz: QuizData,
  answers: Record<string, number>,
): QuizResults {
  const scores: Record<string, number> = {};
  for (const axis of quiz.scoring.axes) {
    scores[axis] = 0;
  }

  for (const question of quiz.questions) {
    const answer = answers[question.id];
    if (answer === undefined) continue;

    const value = answer * question.weight;

    // Map category to axis — convention: category like "autism-traits" maps to "autism" axis,
    // or "both-indicators" maps to all axes
    const matchedAxes = getAxesForCategory(question.category, quiz.scoring.axes);
    for (const axis of matchedAxes) {
      scores[axis] = (scores[axis] || 0) + value;
    }
  }

  const percentages: Record<string, number> = {};
  for (const axis of quiz.scoring.axes) {
    percentages[axis] = Math.round((scores[axis] / quiz.scoring.maxPerAxis) * 100);
  }

  const profile = matchProfile(scores, quiz.scoring.profiles);

  return { scores, percentages, profile };
}

function getAxesForCategory(category: string, axes: string[]): string[] {
  // "both-indicators" or "overlap-traits" → map to axis named "overlap" if it exists,
  // otherwise map to ALL axes
  if (category.startsWith('both-') || category.startsWith('overlap-')) {
    const overlapAxis = axes.find((a) => a === 'overlap');
    if (overlapAxis) return [overlapAxis];
    return [...axes]; // score on all axes
  }

  // "burnout" category or single-axis quizzes: match any axis
  if (axes.length === 1) return [axes[0]];

  // "autism-traits" → "autism", "adhd-indicators" → "adhd", etc.
  for (const axis of axes) {
    if (category.startsWith(axis)) return [axis];
  }

  // Fallback: first axis
  return [axes[0]];
}

function matchProfile(
  scores: Record<string, number>,
  profiles: QuizProfile[],
): QuizProfile {
  for (const profile of profiles) {
    if (!profile.condition || Object.keys(profile.condition).length === 0) {
      continue; // Skip profiles with no condition (used as default)
    }

    const matches = Object.entries(profile.condition).every(
      ([axis, minScore]) => (scores[axis] || 0) >= minScore,
    );

    if (matches) return profile;
  }

  // Return last profile as default
  return profiles[profiles.length - 1];
}

export function encodeResults(results: QuizResults): string {
  const data = {
    s: results.scores,
    p: results.profile.id,
  };
  return btoa(JSON.stringify(data));
}

export function decodeResults(
  encoded: string,
  quiz: QuizData,
): QuizResults | null {
  try {
    const data = JSON.parse(atob(encoded));
    const scores = data.s as Record<string, number>;
    const profileId = data.p as string;

    const percentages: Record<string, number> = {};
    for (const axis of quiz.scoring.axes) {
      percentages[axis] = Math.round(
        ((scores[axis] || 0) / quiz.scoring.maxPerAxis) * 100,
      );
    }

    const profile =
      quiz.scoring.profiles.find((p) => p.id === profileId) ||
      quiz.scoring.profiles[quiz.scoring.profiles.length - 1];

    return { scores, percentages, profile };
  } catch {
    return null;
  }
}
