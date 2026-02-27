import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Play, ChevronRight, Trophy, CheckCircle2, XCircle, Clock, LayoutDashboard } from 'lucide-react';
import { GameState, Player, ServerToClientEvents, ClientToServerEvents } from '../types';
import { QUESTIONS } from '../questions';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

export default function AdminDashboard() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    socket.on('roomCreated', (id) => setRoomId(id));
    socket.on('gameStateUpdate', (state) => setGameState(state));

    return () => {
      socket.off('roomCreated');
      socket.off('gameStateUpdate');
    };
  }, []);

  const createRoom = () => socket.emit('createRoom');
  const startGame = () => roomId && socket.emit('startGame', roomId);
  const nextQuestion = () => roomId && socket.emit('nextQuestion', roomId);

  if (!roomId) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[40px] shadow-2xl border border-black/5 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <LayoutDashboard className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-black text-zinc-900 mb-4 tracking-tight">Game Master</h1>
          <p className="text-zinc-500 mb-10 text-lg">Create a room to start the interactive nutrition quiz.</p>
          <button
            onClick={createRoom}
            className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold text-xl hover:bg-zinc-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Create New Room
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = gameState?.currentQuestionIndex !== undefined && gameState.currentQuestionIndex >= 0 
    ? QUESTIONS[gameState.currentQuestionIndex] 
    : null;

  const answeredCount = gameState?.players.filter(p => p.lastAnswer?.questionId === gameState.currentQuestionIndex).length || 0;
  const totalPlayers = gameState?.players.length || 0;

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest">Admin Panel</span>
              <span className="text-zinc-400">•</span>
              <span className="text-zinc-900 font-mono font-bold">ROOM: {roomId}</span>
            </div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Quiz Control Center</h1>
          </div>
          
          <div className="flex gap-4">
            {gameState?.status === 'waiting' && totalPlayers > 0 && (
              <button
                onClick={startGame}
                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg"
              >
                <Play className="w-5 h-5" /> Start Game
              </button>
            )}
            {gameState?.status === 'playing' && (
              <button
                onClick={nextQuestion}
                className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg"
              >
                Next Question <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Game Status */}
          <div className="lg:col-span-2 space-y-8">
            {gameState?.status === 'waiting' ? (
              <div className="bg-white p-12 rounded-[40px] border border-black/5 shadow-sm text-center">
                <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Users className="w-10 h-10 text-zinc-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">Waiting for Players...</h2>
                <p className="text-zinc-500 mb-8">Share the room ID with your participants.</p>
                <div className="text-6xl font-black text-zinc-900 tracking-widest mb-4">{roomId}</div>
              </div>
            ) : currentQuestion ? (
              <div className="bg-white p-10 rounded-[40px] border border-black/5 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="px-4 py-2 bg-zinc-100 rounded-xl text-sm font-bold text-zinc-600">
                    Question {gameState.currentQuestionIndex + 1} of {QUESTIONS.length}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 font-medium">
                    <Clock className="w-5 h-5" />
                    <span>Live Session</span>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-zinc-900 mb-10 leading-tight">
                  {currentQuestion.text}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((opt, idx) => (
                    <div 
                      key={idx}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        idx === currentQuestion.correctAnswer 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                          : 'border-zinc-100 bg-zinc-50 text-zinc-500'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-lg bg-white border border-black/5 flex items-center justify-center font-bold text-sm">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-semibold">{opt}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Host Explanation Reference</span>
                  </div>
                  <p className="text-amber-900 font-medium leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>

                <div className="mt-8 p-8 bg-zinc-900 rounded-3xl text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Progress</span>
                    <span className="text-emerald-400 font-bold">{answeredCount} / {totalPlayers} Answered</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(answeredCount / totalPlayers) * 100}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ) : gameState?.status === 'finished' ? (
              <div className="bg-white p-12 rounded-[40px] border border-black/5 shadow-sm text-center">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10 text-amber-600" />
                </div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-2">Game Over!</h2>
                <p className="text-zinc-500">The quiz has concluded. View the final rankings on the right.</p>
              </div>
            ) : null}
          </div>

          {/* Right Column: Leaderboard & Player Status */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm">
              <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5" /> Participants ({totalPlayers})
              </h3>
              
              <div className="space-y-3">
                {[...(gameState?.players || [])].sort((a, b) => b.score - a.score).map((player, idx) => (
                  <motion.div 
                    layout
                    key={player.id}
                    className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-black/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-zinc-400 border border-black/5">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900">{player.name}</div>
                        <div className="text-xs text-zinc-400 font-medium">
                          {player.lastAnswer?.questionId === gameState.currentQuestionIndex ? (
                            <span className="text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Submitted
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Thinking...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-zinc-900">{player.score}</div>
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Points</div>
                    </div>
                  </motion.div>
                ))}
                {totalPlayers === 0 && (
                  <div className="text-center py-8 text-zinc-400 font-medium italic">
                    No players joined yet...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
