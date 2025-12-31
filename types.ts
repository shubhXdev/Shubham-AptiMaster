export enum Subject {
  ARITHMETIC = 'Arithmetic',
  REASONING = 'Reasoning'
}

export enum Difficulty {
  MEDIUM = 'Medium',
  HARD = 'Hard' // Easy removed as per requirement for competitive standard
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic?: string;
  figureSVG?: string; // Optional field for non-verbal reasoning images
}

export interface QuizConfig {
  subject: Subject;
  difficulty: Difficulty;
  questionCount: number;
  timeLimitMinutes: number; 
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<number, number>; // questionId -> selectedOptionIndex
  questionTimes: Record<number, number>; // questionId -> seconds taken
  isFinished: boolean;
  score: number;
  totalTimeTaken: number;
  startTime: number;
}

export interface ExamResult {
  id: string;
  date: string; // ISO string
  subject: Subject;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTaken: number;
  answers: Record<number, number>; // Store strictly essential data
}
