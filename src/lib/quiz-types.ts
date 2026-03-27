export interface QuizQuestion {
  id: string;
  text: string;
  type: 'likert' | 'frequency' | 'scenario';
  category: string;
  weight: number;
  options?: ScenarioOption[];
}

export interface ScenarioOption {
  label: string;
  value: number;
}

export interface QuizProfile {
  id: string;
  title: string;
  emoji: string;
  description: string;
  recommendations: string[];
  condition: Record<string, number>;
}

export interface QuizScoring {
  type: 'multi-axis';
  axes: string[];
  maxPerAxis: number;
  profiles: QuizProfile[];
}

export interface QuizData {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  categories: string[];
  questions: QuizQuestion[];
  scoring: QuizScoring;
}

export interface QuizState {
  currentIndex: number;
  answers: Record<string, number>;
  completed: boolean;
}

export interface QuizResults {
  scores: Record<string, number>;
  percentages: Record<string, number>;
  profile: QuizProfile;
}
