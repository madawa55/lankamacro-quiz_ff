import { Type } from "@google/genai";

export enum RoundType {
  THINK_AGAIN = "THINK AGAIN",
  REALITY_CHECK = "REALITY CHECK",
  MACRO_INTELLIGENCE = "MACRO INTELLIGENCE"
}

export interface Question {
  id: number;
  round: RoundType;
  text: string;
  options: string[];
  correctAnswer: number; // 0-3
  explanation: string;
  imagePrompt: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  lastAnswer?: {
    questionId: number;
    answerIndex: number;
    isCorrect: boolean;
    timestamp: number;
  };
}

export interface GameState {
  roomId: string;
  status: 'waiting' | 'playing' | 'finished';
  currentQuestionIndex: number;
  players: Player[];
  startTime?: number;
}

export interface ServerToClientEvents {
  roomCreated: (roomId: string) => void;
  playerJoined: (players: Player[]) => void;
  gameStarted: () => void;
  nextQuestion: (questionIndex: number, startTime: number) => void;
  answerFeedback: (isCorrect: boolean, explanation: string, imageUrl?: string) => void;
  gameStateUpdate: (state: GameState) => void;
  gameFinished: (leaderboard: Player[]) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  createRoom: () => void;
  joinRoom: (roomId: string, name: string) => void;
  startGame: (roomId: string) => void;
  submitAnswer: (roomId: string, questionId: number, answerIndex: number) => void;
  nextQuestion: (roomId: string) => void;
}
