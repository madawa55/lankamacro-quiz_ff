import { Type } from "@google/genai";

export enum Round {
  THINK_AGAIN = "THINK AGAIN",
  REALITY_CHECK = "REALITY CHECK",
  MACRO_INTELLIGENCE = "MACRO INTELLIGENCE",
}

export interface Question {
  id: number;
  round: Round;
  text: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  explanation: string;
  visualPrompt: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  answers: { [questionId: number]: { selected: number; isCorrect: boolean } };
  isReady: boolean;
}

export interface GameState {
  roomId: string;
  status: 'waiting' | 'playing' | 'results' | 'finished';
  currentQuestionIndex: number;
  players: Player[];
  startTime?: number;
}

export interface ServerToClientEvents {
  gameUpdate: (state: GameState) => void;
  questionStarted: (question: Question, timeLeft: number) => void;
  showExplanation: (question: Question, results: any) => void;
  gameOver: (leaderboard: Player[]) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  createRoom: () => void;
  joinRoom: (roomId: string, name: string) => void;
  startGame: (roomId: string) => void;
  submitAnswer: (roomId: string, questionId: number, answerIndex: number) => void;
  nextQuestion: (roomId: string) => void;
}
