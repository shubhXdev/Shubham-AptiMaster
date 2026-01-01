export enum Subject {
  ARITHMETIC = 'Arithmetic',
  REASONING = 'Reasoning',
  THINKING = 'Thinking'
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic?: string;
  figureSVG?: string;
  hints?: string[]; // New for Thinking section
  strategyRules?: string[]; // New for Thinking section
}

export interface QuizConfig {
  subject: Subject;
  difficulty: Difficulty;
  questionCount: number;
  timeLimitMinutes: number; 
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<number, number>; 
  questionTimes: Record<number, number>; 
  isFinished: boolean;
  score: number;
  totalTimeTaken: number;
  startTime: number;
}

export interface ExamResult {
  id: string;
  date: string; 
  subject: Subject;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTaken: number;
  answers: Record<number, number>; 
}