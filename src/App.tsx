import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Timer,
  Calculator,
  Info,
  ChevronRight,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameState, Question, ServerToClientEvents, ClientToServerEvents } from './types';
import { generateNutritionVisual } from './services/geminiService';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

export default function App() {
  const [view, setView] = useState<'home' | 'host' | 'player'>('home');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    socket.on('gameUpdate', (state) => {
      setGameState(state);
      if (state.status === 'finished') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    });

    socket.on('questionStarted', (question, time) => {
      setCurrentQuestion(question);
      setTimeLeft(time);
      setSelectedAnswer(null);
      setAiImage(null);
    });

    socket.on('showExplanation', async (question) => {
      setIsGeneratingImage(true);
      const img = await generateNutritionVisual(question.visualPrompt);
      setAiImage(img);
      setIsGeneratingImage(false);
    });

    socket.on('error', (msg) => alert(msg));

    return () => {
      socket.off('gameUpdate');
      socket.off('questionStarted');
      socket.off('showExplanation');
      socket.off('error');
    };
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && gameState?.status === 'playing') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, gameState?.status]);

  const handleCreateRoom = () => {
    socket.emit('createRoom');
    setView('host');
  };

  const handleJoinRoom = () => {
    if (roomIdInput && playerName) {
      socket.emit('joinRoom', roomIdInput.toUpperCase(), playerName);
      setView('player');
    }
  };

  const handleStartGame = () => {
    if (gameState) socket.emit('startGame', gameState.roomId);
  };

  const handleSubmitAnswer = (index: number) => {
    if (selectedAnswer !== null || !gameState || !currentQuestion) return;
    setSelectedAnswer(index);
    socket.emit('submitAnswer', gameState.roomId, currentQuestion.id, index);
  };

  const handleNextQuestion = () => {
    if (gameState) socket.emit('nextQuestion', gameState.roomId);
  };

  const renderHome = () => (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-sm border border-black/5"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Calculator size={32} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-center text-slate-900 mb-2 tracking-tight">LankaMacro</h1>
        <p className="text-slate-500 text-center mb-8">Fuel your code with the right macros.</p>
        
        <div className="space-y-4">
          <button 
            onClick={handleCreateRoom}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
          >
            <Play size={20} /> Host a Game
          </button>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">or join as player</span></div>
          </div>

          <input 
            type="text" 
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          <input 
            type="text" 
            placeholder="Room ID (e.g. AB12CD)"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all uppercase"
          />
          <button 
            onClick={handleJoinRoom}
            className="w-full bg-white border-2 border-slate-900 text-slate-900 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
          >
            Join Room <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );

  const renderHost = () => {
    if (!gameState) return null;
    const currentQ = gameState.currentQuestionIndex >= 0 ? gameState.currentQuestionIndex + 1 : 0;
    
    return (
      <div className="min-h-screen bg-[#F5F5F5] p-6 font-sans">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-black/5"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-1">Host Dashboard</h2>
                  <h1 className="text-3xl font-bold text-slate-900">Room: {gameState.roomId}</h1>
                </div>
                <div className="bg-slate-100 px-4 py-2 rounded-full text-sm font-medium text-slate-600">
                  {gameState.players.length} Players Joined
                </div>
              </div>

              {gameState.status === 'waiting' ? (
                <div className="text-center py-12">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center animate-pulse">
                      <Users size={40} className="text-slate-300" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Waiting for players...</h3>
                  <p className="text-slate-500 mb-8">Share the Room ID with your team to start the challenge.</p>
                  <button 
                    onClick={handleStartGame}
                    disabled={gameState.players.length === 0}
                    className="bg-emerald-500 text-white px-12 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Game
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${(currentQ / 15) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-400">Question {currentQ}/15</span>
                  </div>

                  {gameState.status === 'results' && (
                    <div className="flex justify-center pt-4">
                      <button 
                        onClick={handleNextQuestion}
                        className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
                      >
                        Next Question <ChevronRight size={20} />
                      </button>
                    </div>
                  )}

                  {gameState.status === 'playing' && (
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Info size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Current Question</span>
                      </div>
                      <p className="text-lg font-medium text-slate-800">{currentQuestion?.text}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gameState.players.map((player) => {
                const hasAnswered = currentQuestion && player.answers[currentQuestion.id];
                return (
                  <motion.div 
                    key={player.id}
                    layout
                    className={`p-4 rounded-2xl border transition-all ${
                      hasAnswered ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        hasAnswered ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {player.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{player.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{hasAnswered ? 'Answered' : 'Thinking...'}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-black/5 h-fit"
          >
            <div className="flex items-center gap-2 mb-6">
              <Trophy size={20} className="text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">Leaderboard</h2>
            </div>
            <div className="space-y-4">
              {[...gameState.players].sort((a, b) => b.score - a.score).map((player, idx) => (
                <div key={player.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-300 w-4">{idx + 1}</span>
                    <span className="text-sm font-semibold text-slate-700">{player.name}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{player.score} pts</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderPlayer = () => {
    if (!gameState || !currentQuestion) return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Connected!</h2>
        <p className="text-slate-400">Waiting for the host to start...</p>
      </div>
    );

    const player = gameState.players.find(p => p.id === socket.id);
    const hasAnswered = player?.answers[currentQuestion.id];

    if (gameState.status === 'results') {
      const answerData = player?.answers[currentQuestion.id];
      const isCorrect = answerData?.isCorrect;

      return (
        <div className="min-h-screen bg-[#F5F5F5] p-6 font-sans">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div className={`rounded-3xl p-8 text-white shadow-xl ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              <div className="flex items-center gap-4 mb-4">
                {isCorrect ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
                <div>
                  <h2 className="text-3xl font-bold">{isCorrect ? 'Brilliant!' : 'Not quite...'}</h2>
                  <p className="opacity-90">{isCorrect ? 'You know your macros!' : 'Every mistake is a learning step.'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">The Science</h3>
              <p className="text-lg text-slate-700 leading-relaxed mb-8">{currentQuestion.explanation}</p>
              
              <div className="aspect-square w-full bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-100">
                {isGeneratingImage ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-bold text-slate-400">AI Visualizing...</p>
                  </div>
                ) : aiImage ? (
                  <motion.img 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={aiImage} 
                    alt="Educational visual" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <Info size={48} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    if (gameState.status === 'finished') {
      const finalScore = player?.score || 0;
      return (
        <div className="min-h-screen bg-[#F5F5F5] p-6 font-sans flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-sm border border-black/5 text-center"
          >
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy size={48} className="text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h1>
            <p className="text-slate-500 mb-8">Great job, {playerName}!</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-6 rounded-3xl">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Score</p>
                <p className="text-3xl font-bold text-emerald-600">{finalScore}/15</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">BMI Est.</p>
                <p className="text-3xl font-bold text-slate-900">24.5</p>
              </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-3xl text-left mb-8">
              <h3 className="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2">
                <Calculator size={16} /> Macro Breakdown
              </h3>
              <p className="text-xs text-emerald-600 leading-relaxed">
                Based on your answers, we've calculated your personalized macronutrient breakdown.
              </p>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
            >
              Play Again
            </button>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F5F5F5] p-6 font-sans">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-black/5">
                <User size={20} className="text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Player</p>
                <p className="text-sm font-bold text-slate-900">{playerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time Left</p>
                <p className={`text-sm font-bold ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-slate-900'}`}>{timeLeft}s</p>
              </div>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-black/5">
                <Timer size={20} className={timeLeft < 10 ? 'text-rose-500' : 'text-slate-400'} />
              </div>
            </div>
          </div>

          <motion.div 
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 mb-8"
          >
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-widest mb-4">
              {currentQuestion.round}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-8">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmitAnswer(idx)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-5 rounded-2xl text-left font-semibold transition-all flex items-center justify-between group ${
                    selectedAnswer === idx 
                      ? 'bg-slate-900 text-white shadow-lg scale-[1.02]' 
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
                  } ${selectedAnswer !== null && selectedAnswer !== idx ? 'opacity-50' : ''}`}
                >
                  <span>{option}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedAnswer === idx ? 'border-white bg-white/20' : 'border-slate-200 group-hover:border-slate-300'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div className="selection:bg-emerald-100 selection:text-emerald-900">
      <AnimatePresence mode="wait">
        {view === 'home' && renderHome()}
        {view === 'host' && renderHost()}
        {view === 'player' && renderPlayer()}
      </AnimatePresence>
    </div>
  );
}
