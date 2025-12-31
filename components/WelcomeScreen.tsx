import React, { useEffect, useState } from 'react';
import { Subject, Difficulty, QuizConfig } from '../types';
import { BookOpen, Brain, Play, BarChart2, ShieldCheck, Crown } from 'lucide-react';
import { getTotalAttempts } from '../services/storageService';

interface WelcomeScreenProps {
  onStart: (config: QuizConfig) => void;
  onViewAnalytics: () => void;
  isLoading: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onViewAnalytics, isLoading }) => {
  const [subject, setSubject] = useState<Subject>(Subject.ARITHMETIC);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  
  useEffect(() => {
    // Adaptive Difficulty Rule: > 50 attempts = Hard
    const totalAttempts = getTotalAttempts();
    if (totalAttempts > 50) {
      setDifficulty(Difficulty.HARD);
    } else {
      setDifficulty(Difficulty.MEDIUM);
    }
  }, []);

  const getQuestionCount = (subj: Subject) => (subj === Subject.ARITHMETIC ? 12 : 25);
  
  // 30 seconds per question rule
  const getTimeLimit = (subj: Subject) => {
    const count = getQuestionCount(subj);
    return (count * 30) / 60; // Minutes
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
    <div className="max-w-5xl mx-auto p-6 animate-fade-in text-zinc-100">
      <div className="text-center mb-16 pt-10">
        <div className="inline-flex items-center justify-center p-3 mb-6 bg-amber-500/10 rounded-2xl border border-amber-500/20">
          <Crown className="text-amber-500 w-8 h-8 mr-2" />
          <span className="text-amber-500 font-bold tracking-widest text-sm uppercase">Official Prep Partner</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight font-space">
          Shubham <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">AptiMaster</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
          Shubham's Elite Aptitude Test Application. <br/>
          <span className="text-zinc-500 text-sm mt-2 block">Premium SSC • Banking • Railways • UPSC CSAT Preparation</span>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Arithmetic Card */}
        <div 
          onClick={() => setSubject(Subject.ARITHMETIC)}
          className={`cursor-pointer group relative p-8 rounded-3xl border transition-all duration-300 ${
            subject === Subject.ARITHMETIC 
              ? 'border-amber-500/50 bg-zinc-900 shadow-[0_0_30px_rgba(245,158,11,0.15)]' 
              : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
          }`}
        >
          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${subject === Subject.ARITHMETIC ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
              <BookOpen size={28} />
            </div>
            {subject === Subject.ARITHMETIC && <div className="text-amber-500 font-bold text-sm bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">SELECTED</div>}
          </div>
          <h3 className="text-2xl font-bold mb-2">Arithmetic</h3>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            12 Targeted Questions. Percentage, Ratio, Profit/Loss, Time & Work, DI. 
            <br/><span className="text-amber-500/80 text-xs mt-2 block">Strict 30s/Question Pace</span>
          </p>
          <div className="flex gap-2 text-xs font-mono text-zinc-500">
            <span className="bg-zinc-800 px-2 py-1 rounded">12 Qs</span>
            <span className="bg-zinc-800 px-2 py-1 rounded">6 Mins</span>
          </div>
        </div>

        {/* Reasoning Card */}
        <div 
          onClick={() => setSubject(Subject.REASONING)}
          className={`cursor-pointer group relative p-8 rounded-3xl border transition-all duration-300 ${
            subject === Subject.REASONING 
              ? 'border-emerald-500/50 bg-zinc-900 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
              : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
          }`}
        >
          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${subject === Subject.REASONING ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
              <Brain size={28} />
            </div>
            {subject === Subject.REASONING && <div className="text-emerald-500 font-bold text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">SELECTED</div>}
          </div>
          <h3 className="text-2xl font-bold mb-2">Reasoning</h3>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            25 Mixed Questions. Verbal & Non-Verbal. Syllogisms, Series, Coding.
            <br/><span className="text-emerald-500/80 text-xs mt-2 block">Strict 30s/Question Pace</span>
          </p>
          <div className="flex gap-2 text-xs font-mono text-zinc-500">
            <span className="bg-zinc-800 px-2 py-1 rounded">25 Qs</span>
            <span className="bg-zinc-800 px-2 py-1 rounded">12.5 Mins</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-zinc-800 rounded-xl text-zinc-400">
             <ShieldCheck size={24} />
           </div>
           <div>
             <div className="text-sm text-zinc-400 uppercase tracking-wider font-bold">Current Level</div>
             <div className="text-xl font-bold text-white">{difficulty} <span className="text-xs text-zinc-500 font-normal">(Auto-set based on history)</span></div>
           </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={onViewAnalytics}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl transition-all border border-zinc-700 hover:border-zinc-600"
          >
            <BarChart2 size={20} /> Analytics
          </button>
          
          <button
            onClick={handleStart}
            disabled={isLoading}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold rounded-xl transition-all shadow-lg shadow-amber-900/20 transform active:scale-95 ${
              isLoading ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {isLoading ? (
              <>Constructing Exam...</>
            ) : (
              <>
                Start Exam <Play size={20} fill="currentColor" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
