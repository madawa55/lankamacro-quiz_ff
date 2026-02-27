import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { User, ArrowRight, CheckCircle2, XCircle, Clock, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameState, Player, ServerToClientEvents, ClientToServerEvents } from '../types';
import { QUESTIONS } from '../questions';
import { generateEducationalImage } from '../services/gemini';
import MacroCalculator from './MacroCalculator';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

export default function PlayerView() {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string; imageUrl?: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    socket.on('gameStateUpdate', (state) => setGameState(state));
    socket.on('nextQuestion', (idx, startTime) => {
      setFeedback(null);
      setTimeLeft(30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on('answerFeedback', async (isCorrect, explanation) => {
      if (isCorrect) confetti();
      
      setFeedback({ isCorrect, explanation });
      
      // Generate AI Image for explanation
      const currentQ = QUESTIONS[gameState?.currentQuestionIndex || 0];
      if (currentQ) {
        setIsGeneratingImage(true);
        const imageUrl = await generateEducationalImage(currentQ.imagePrompt);
        setFeedback(prev => prev ? { ...prev, imageUrl: imageUrl || undefined } : null);
        setIsGeneratingImage(false);
      }
    });

    socket.on('gameFinished', () => {
      if (timerRef.current) clearInterval(timerRef.current);
    });

    return () => {
      socket.off('gameStateUpdate');
      socket.off('nextQuestion');
      socket.off('answerFeedback');
      socket.off('gameFinished');
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState?.currentQuestionIndex]);

  const joinRoom = () => {
    if (name && roomId) {
      socket.emit('joinRoom', roomId.toUpperCase(), name);
      setJoined(true);
    }
  };

  const submitAnswer = (idx: number) => {
    if (gameState && !feedback) {
      socket.emit('submitAnswer', gameState.roomId, gameState.currentQuestionIndex, idx);
    }
  };

  if (!joined) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[40px] shadow-2xl max-w-md w-full"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8">
            <Sparkles className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight">Join the Quiz</h1>
          <p className="text-zinc-500 mb-8">Enter the room code and your name to participate.</p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Room Code</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="E.G. AB12CD"
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-mono font-bold text-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={joinRoom}
              disabled={!name || !roomId}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-xl hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 mt-4"
            >
              Join Game <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (gameState?.status === 'waiting') {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-6 text-center">
        <div className="space-y-8">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">Waiting for Host...</h2>
          <p className="text-zinc-400 text-lg">The game will start once the administrator begins the session.</p>
          <div className="inline-block px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-white font-mono">
            Room: {gameState.roomId}
          </div>
        </div>
      </div>
    );
  }

  if (gameState?.status === 'finished') {
    const myPlayer = gameState.players.find(p => p.id === socket.id);
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

    return (
      <div className="min-h-screen bg-zinc-50 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-[40px] shadow-xl border border-black/5 text-center"
          >
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Trophy className="w-12 h-12 text-amber-600" />
            </div>
            <h1 className="text-4xl font-black text-zinc-900 mb-4">Quiz Complete!</h1>
            <p className="text-zinc-500 text-xl mb-8">Great job, {name}! You scored <span className="text-zinc-900 font-black">{myPlayer?.score}</span> points.</p>
            
            <div className="mb-12 max-w-md mx-auto">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Final Leaderboard</h3>
              <div className="space-y-2">
                {sortedPlayers.map((player, idx) => (
                  <div 
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border ${player.id === socket.id ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-50 border-zinc-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-zinc-400 w-6">{idx + 1}</span>
                      <span className={`font-bold ${player.id === socket.id ? 'text-emerald-900' : 'text-zinc-900'}`}>{player.name}</span>
                    </div>
                    <span className="font-black text-zinc-900">{player.score} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {!showCalculator ? (
              <button
                onClick={() => setShowCalculator(true)}
                className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-bold text-xl hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-3 mx-auto"
              >
                Calculate My Macros <Sparkles className="w-6 h-6" />
              </button>
            ) : (
              <MacroCalculator />
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[gameState?.currentQuestionIndex || 0];

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-black/5 flex items-center justify-center">
              <User className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Player</div>
              <div className="font-bold text-zinc-900">{name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Score</div>
            <div className="text-2xl font-black text-emerald-600">{gameState?.players.find(p => p.id === socket.id)?.score || 0}</div>
          </div>
        </header>

        <div className="mb-6 flex items-center justify-between px-2">
          <div className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest">
            {currentQuestion.round}
          </div>
          <div className={`flex items-center gap-2 font-black text-xl ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-zinc-900'}`}>
            <Clock className="w-5 h-5" /> {timeLeft}s
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white p-10 rounded-[40px] shadow-xl border border-black/5">
                <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-10 leading-tight">
                  {currentQuestion.text}
                </h2>
                
                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => submitAnswer(idx)}
                      className="group flex items-center gap-4 p-6 bg-zinc-50 border-2 border-zinc-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                    >
                      <span className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center font-bold text-zinc-400 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-all">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="font-bold text-zinc-700 group-hover:text-emerald-900 transition-all">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className={`p-10 rounded-[40px] shadow-xl border-4 ${feedback.isCorrect ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500'}`}>
                <div className="flex items-center gap-4 mb-6">
                  {feedback.isCorrect ? (
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                  ) : (
                    <XCircle className="w-12 h-12 text-rose-600" />
                  )}
                  <h2 className={`text-3xl font-black ${feedback.isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                    {feedback.isCorrect ? 'Correct!' : 'Not quite...'}
                  </h2>
                </div>

                <p className="text-lg font-medium text-zinc-700 mb-8 leading-relaxed">
                  {feedback.explanation}
                </p>

                {isGeneratingImage ? (
                  <div className="aspect-square w-full max-w-sm mx-auto bg-zinc-200/50 rounded-3xl flex flex-col items-center justify-center gap-4 animate-pulse border-2 border-dashed border-zinc-300">
                    <Sparkles className="w-10 h-10 text-zinc-400" />
                    <span className="text-zinc-500 font-bold text-sm uppercase tracking-widest">AI Visualizing...</span>
                  </div>
                ) : feedback.imageUrl ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="aspect-square w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                  >
                    <img src={feedback.imageUrl} alt="Educational visualization" className="w-full h-full object-cover" />
                  </motion.div>
                ) : null}
                
                <div className="mt-8 text-center text-zinc-400 font-bold uppercase text-xs tracking-widest">
                  Waiting for next question...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
