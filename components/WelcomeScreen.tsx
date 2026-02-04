import React, { useEffect, useState } from 'react';
import { Subject, Difficulty, QuizConfig } from '../types';
import { BookOpen, Brain, Play, BarChart2, ShieldCheck, Crown, Lightbulb, RefreshCw, Zap } from 'lucide-react';
import { getTotalAttempts } from '../services/storageService';
import BrandLogo from './BrandLogo';

interface WelcomeScreenProps {
  onStart: (config: QuizConfig) => void;
  onViewAnalytics: () => void;
  isLoading: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onViewAnalytics, isLoading }) => {
  const [subject, setSubject] = useState<Subject>(Subject.ARITHMETIC);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [attemptCount, setAttemptCount] = useState(0);
  
  useEffect(() => {
    const total = getTotalAttempts();
    setAttemptCount(total);
    if (total > 120) {
      setDifficulty(Difficulty.HARD);
    } else if (total > 50) {
      setDifficulty(Difficulty.MEDIUM);
    } else {
      setDifficulty(Difficulty.EASY);
    }
  }, []);

  const getQuestionCount = (subj: Subject) => {
    if (subj === Subject.ARITHMETIC) return 16;
    if (subj === Subject.REASONING) return 25;
    return 2; // Thinking
  };
  
  const getTimeLimit = (subj: Subject) => {
    if (subj === Subject.ARITHMETIC) return 8;
    if (subj === Subject.REASONING) return 12.5;
    return 5; // Thinking (more time for deep analysis)
  };

  const handleStart = () => {
    onStart({
      subject,
      difficulty,
      questionCount: getQuestionCount(subject),
      timeLimitMinutes: getTimeLimit(subject)
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in text-zinc-100">
      <div className="text-center mb-12 pt-10">
        <div className="flex justify-center mb-8 relative">
           <div className="absolute inset-0 bg-red-500/20 blur-[60px] rounded-full scale-150 animate-pulse"></div>
           <BrandLogo size={140} className="z-10 drop-shadow-[0_0_30px_rgba(239,68,68,0.4)]" />
        </div>
        
        <div className="inline-flex items-center justify-center p-3 mb-6 bg-zinc-900 rounded-2xl border border-zinc-800 gap-4">
          <div className="flex items-center text-amber-500 text-[10px] font-black uppercase tracking-widest border-r border-zinc-800 pr-4">
            <Crown className="w-4 h-4 mr-2" /> Elite Standards
          </div>
          <div className="flex items-center text-emerald-500 text-[10px] font-black uppercase tracking-widest">
            <Zap className="w-3 h-3 mr-2 text-emerald-400" /> New Mission: #{attemptCount + 1}
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight font-space">
          Shubham <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">AptiMaster</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
          Questions refresh <span className="text-white font-medium italic underline decoration-emerald-500 underline-offset-4 decoration-2">with every attempt</span>.
          <br/><span className="text-zinc-600 text-sm mt-2 block">Systematic topic rotation ensures 100% syllabus mastery.</span>
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {/* Arithmetic */}
        <div 
          onClick={() => setSubject(Subject.ARITHMETIC)}
          className={`cursor-pointer group relative p-6 rounded-3xl border transition-all duration-500 overflow-hidden ${
            subject === Subject.ARITHMETIC 
              ? 'border-amber-500/50 bg-zinc-900 shadow-[0_0_40px_rgba(245,158,11,0.1)]' 
              : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
          }`}
        >
          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${subject === Subject.ARITHMETIC ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
              <BookOpen size={24} />
            </div>
            {subject === Subject.ARITHMETIC && <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full uppercase tracking-tighter">Serieswise Rotation</span>}
          </div>
          <h3 className="text-xl font-bold mb-2">Arithmetic</h3>
          <p className="text-zinc-400 text-xs mb-6 leading-relaxed">16 Qs. Topics change per attempt following the official chapter series.</p>
          <div className="flex gap-2 text-[10px] font-mono font-bold text-zinc-500">
            <span className="bg-zinc-800 px-2 py-1 rounded">16 Qs</span>
            <span className="bg-zinc-800 px-2 py-1 rounded">08 Mins</span>
          </div>
        </div>

        {/* Reasoning */}
        <div 
          onClick={() => setSubject(Subject.REASONING)}
          className={`cursor-pointer group relative p-6 rounded-3xl border transition-all duration-500 overflow-hidden ${
            subject === Subject.REASONING 
              ? 'border-emerald-500/50 bg-zinc-900 shadow-[0_0_40px_rgba(16,185,129,0.1)]' 
              : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
          }`}
        >
          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${subject === Subject.REASONING ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
              <Brain size={24} />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">Reasoning</h3>
          <p className="text-zinc-400 text-xs mb-6 leading-relaxed">25 Qs. Fresh verbal & visual logic patterns generated for every single mission.</p>
          <div className="flex gap-2 text-[10px] font-mono font-bold text-zinc-500">
            <span className="bg-zinc-800 px-2 py-1 rounded">25 Qs</span>
            <span className="bg-zinc-800 px-2 py-1 rounded">12.5 Mins</span>
          </div>
        </div>

        {/* Thinking */}
        <div 
          onClick={() => setSubject(Subject.THINKING)}
          className={`cursor-pointer group relative p-6 rounded-3xl border transition-all duration-500 overflow-hidden ${
            subject === Subject.THINKING 
              ? 'border-indigo-500/50 bg-zinc-900 shadow-[0_0_40px_rgba(99,102,241,0.1)]' 
              : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
          }`}
        >
          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${subject === Subject.THINKING ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
              <Lightbulb size={24} />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">Thinking</h3>
          <p className="text-zinc-400 text-xs mb-6 leading-relaxed">2 Elite Qs. Built to strengthen your analytical power with new logic daily.</p>
          <div className="flex gap-2 text-[10px] font-mono font-bold text-zinc-500">
            <span className="bg-zinc-800 px-2 py-1 rounded">02 Qs</span>
            <span className="bg-zinc-800 px-2 py-1 rounded">05 Mins</span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 p-8 rounded-[40px] flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-zinc-800 rounded-2xl text-zinc-300 ring-1 ring-zinc-700">
             <ShieldCheck size={32} />
           </div>
           <div>
             <div className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black mb-1">Target Intensity</div>
             <div className="text-2xl font-bold text-white flex items-center gap-2">Level: {difficulty}</div>
           </div>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <button onClick={onViewAnalytics} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-2xl transition-all border border-zinc-700">
            <BarChart2 size={20} /> History
          </button>
          <button onClick={handleStart} disabled={isLoading} className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-br from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-red-900/20 transform active:scale-95 group ${isLoading ? 'opacity-70 cursor-wait' : ''}`}>
            {isLoading ? <span className="flex items-center gap-3"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Constructing Exam...</span> : <>Mission Start <Play size={20} fill="currentColor" /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;