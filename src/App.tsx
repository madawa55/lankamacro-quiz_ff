import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import PlayerView from './components/PlayerView';
import { LayoutDashboard, User } from 'lucide-react';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/play" element={<PlayerView />} />
      </Routes>
    </BrowserRouter>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link to="/admin" className="group">
          <div className="h-full bg-white p-12 rounded-[40px] shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]">
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 transition-colors">
              <LayoutDashboard className="w-10 h-10 text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight">Host a Game</h2>
            <p className="text-zinc-500 text-lg leading-relaxed">Create a room, manage participants, and control the quiz flow in real-time.</p>
          </div>
        </Link>

        <Link to="/play" className="group">
          <div className="h-full bg-zinc-800 p-12 rounded-[40px] shadow-2xl border border-white/5 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-emerald-500 transition-colors">
              <User className="w-10 h-10 text-white transition-colors" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Join as Player</h2>
            <p className="text-zinc-400 text-lg leading-relaxed">Enter a room code to participate in the interactive nutrition challenge.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
