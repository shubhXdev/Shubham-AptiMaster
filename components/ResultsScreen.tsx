import React, { useState, useEffect } from 'react';
import { Question, QuizState } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Check, X, RotateCcw, Award, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { saveExamResult } from '../services/storageService';
import BrandLogo from './BrandLogo';

interface ResultsScreenProps {
  questions: Question[];
  state: QuizState;
  totalTimeMinutes: number;
  subject: any;
  difficulty: any;
  onRestart: () => void;
  onViewAnalytics: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ 
  questions, state, totalTimeMinutes, onRestart, onViewAnalytics, subject, difficulty 
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'solutions'>('summary');
  const [expandedSolution, setExpandedSolution] = useState<number | null>(null);

  const correctCount = state.score;
  const incorrectCount = Object.keys(state.answers).length - correctCount;
  const skippedCount = questions.length - Object.keys(state.answers).length;
  const accuracy = Math.round((correctCount / Object.keys(state.answers).length || 0) * 100);
  const scorePercentage = Math.round((correctCount / questions.length) * 100);

  useEffect(() => {
    saveExamResult({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      subject,
      difficulty,
      score: correctCount,
      totalQuestions: questions.length,
      accuracy: isNaN(accuracy) ? 0 : accuracy,
      timeTaken: state.totalTimeTaken,
      answers: state.answers
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data = [
    { name: 'Correct', value: correctCount, color: '#10b981' },
    { name: 'Incorrect', value: incorrectCount, color: '#ef4444' },
    { name: 'Skipped', value: skippedCount, color: '#52525b' },
  ].filter(d => d.value > 0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 pb-20 text-zinc-100 animate-fade-in">
      <div className="flex flex-col items-center text-center mb-10 no-print">
        <BrandLogo size={64} className="mb-4" />
        <h1 className="text-4xl font-bold font-space mb-2">Mission Debriefing</h1>
        <p className="text-zinc-500 font-medium uppercase tracking-[0.2em] text-[10px]">Shubham AptiMaster • Official Performance Report</p>
      </div>

      <div className="grid md:grid-cols-12 gap-6 mb-12">
        <div className="md:col-span-4 bg-zinc-900 p-8 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="text-center z-10">
            <div className="inline-block p-4 bg-amber-500/10 rounded-full text-amber-500 mb-4 group-hover:scale-110 transition-transform">
               <Award size={48} />
            </div>
            <div className="text-6xl font-extrabold text-white mb-2 font-space">{scorePercentage}%</div>
            <div className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Net Score Acquired</div>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm">
                <div className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">
                    ACC: <span className={accuracy > 80 ? "text-emerald-400" : "text-amber-400"}>{accuracy}%</span>
                </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="md:col-span-8 bg-zinc-900 p-8 rounded-3xl border border-zinc-800 flex flex-col md:flex-row gap-8 items-center">
            <div className="h-48 w-48 flex-shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={data}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    </Pie>
                </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-white font-bold text-2xl font-space">{questions.length}</span>
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest">Questions</span>
                </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1 text-xs uppercase tracking-tighter"><Check size={14} /> Correct</div>
                    <div className="text-2xl font-mono text-white">{correctCount}</div>
                </div>
                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                    <div className="flex items-center gap-2 text-red-400 font-bold mb-1 text-xs uppercase tracking-tighter"><X size={14} /> Incorrect</div>
                    <div className="text-2xl font-mono text-white">{incorrectCount}</div>
                </div>
                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                    <div className="flex items-center gap-2 text-zinc-400 font-bold mb-1 text-xs uppercase tracking-tighter">Skipped</div>
                    <div className="text-2xl font-mono text-white">{skippedCount}</div>
                </div>
                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                    <div className="flex items-center gap-2 text-amber-400 font-bold mb-1 text-xs uppercase tracking-tighter">Combat Time</div>
                    <div className="text-2xl font-mono text-white">{formatTime(state.totalTimeTaken)}</div>
                </div>
            </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-zinc-800 no-print">
        <button 
            onClick={() => setActiveTab('summary')}
            className={`pb-4 px-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${activeTab === 'summary' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            Tactical Analysis
        </button>
        <button 
            onClick={() => setActiveTab('solutions')}
            className={`pb-4 px-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${activeTab === 'solutions' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            Detailed Solutions
        </button>
      </div>

      {activeTab === 'summary' && (
        <div className="animate-fade-in no-print">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-8 border-l-4 border-l-red-500">
                <h3 className="text-xl font-bold text-white mb-6 font-space">Expert Recommendation</h3>
                <div className="space-y-4">
                    {accuracy < 60 && (
                        <div className="p-4 bg-red-950/40 border border-red-900/30 rounded-xl text-red-100">
                            <strong className="block mb-1 text-red-400 uppercase text-xs tracking-wider">Critical Weakness</strong>
                            Base accuracy is insufficient for selection. Intense revision of {subject} fundamentals required immediately.
                        </div>
                    )}
                    {state.totalTimeTaken > (totalTimeMinutes * 60) * 0.9 && (
                        <div className="p-4 bg-amber-950/40 border border-amber-900/30 rounded-xl text-amber-100">
                            <strong className="block mb-1 text-amber-400 uppercase text-xs tracking-wider">Time Warning</strong>
                            You are surviving, not dominating. Optimize your mental math to save at least 5s per question.
                        </div>
                    )}
                     <div className="p-4 bg-emerald-950/40 border border-emerald-900/30 rounded-xl text-emerald-100">
                        <strong className="block mb-1 text-emerald-400 uppercase text-xs tracking-wider">Next Step</strong>
                        Mission complete. Analyze mistakes in solutions tab then recalibrate for the next mock.
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onViewAnalytics}
                    className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-zinc-700"
                >
                    <FileText size={20} /> Full Analytics
                </button>
                <button
                    onClick={onRestart}
                    className="flex-1 py-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                >
                    <RotateCcw size={20} /> Next Mission
                </button>
            </div>
        </div>
      )}

      {activeTab === 'solutions' && (
        <div className="space-y-4 animate-fade-in print-only">
          {questions.map((q, index) => {
            const userAnswer = state.answers[q.id];
            const isCorrect = userAnswer === q.correctAnswerIndex;
            const isSkipped = userAnswer === undefined;
            const timeSpent = state.questionTimes[q.id] || 0;
            const isExpanded = expandedSolution === q.id;

            return (
              <div key={q.id} className={`bg-zinc-900 rounded-2xl border p-6 transition-all ${
                isCorrect ? 'border-zinc-800' : isSkipped ? 'border-zinc-800 opacity-80' : 'border-red-900/30 bg-red-900/5'
              }`}>
                <div 
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedSolution(isExpanded ? null : q.id)}
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-zinc-500 font-mono text-sm">Q.{index + 1}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-tighter ${
                            isCorrect ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : isSkipped ? 'bg-zinc-700 text-zinc-400' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                            {isCorrect ? 'PASSED' : isSkipped ? 'SKIPPED' : 'FAILED'}
                        </span>
                        <span className={`text-xs font-mono font-bold ${timeSpent > 30 ? 'text-red-400' : 'text-zinc-500'}`}>
                             {timeSpent}s
                        </span>
                        <span className="text-[10px] bg-zinc-950 text-zinc-500 px-2 py-0.5 rounded border border-zinc-800 uppercase font-black">{q.topic || 'General'}</span>
                    </div>
                    <h3 className="text-lg font-medium text-zinc-200">{q.text}</h3>
                  </div>
                  <div className="no-print">
                      {isExpanded ? <ChevronUp className="text-zinc-500" /> : <ChevronDown className="text-zinc-500" />}
                  </div>
                </div>

                {(isExpanded || window.matchMedia('print').matches) && (
                    <div className="mt-6 pt-6 border-t border-zinc-800 animate-fade-in">
                        {q.figureSVG && (
                            <div className="mb-6 p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-center">
                                <div 
                                    className="w-full max-w-lg text-zinc-300 [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[200px]"
                                    dangerouslySetInnerHTML={{ __html: q.figureSVG }}
                                />
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-3 mb-6">
                            {q.options.map((opt, optIdx) => {
                                const isSelected = userAnswer === optIdx;
                                const isActuallyCorrect = optIdx === q.correctAnswerIndex;
                                return (
                                <div key={optIdx} className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
                                    isActuallyCorrect ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-100 ring-1 ring-emerald-500/20' : 
                                    isSelected ? 'bg-red-950/40 border-red-500/30 text-red-100' : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                                }`}>
                                    <span className="flex items-center gap-3">
                                        <span className="opacity-30 font-bold">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                                    </span>
                                    {isActuallyCorrect && <Check size={16} className="text-emerald-500" />}
                                    {isSelected && !isActuallyCorrect && <X size={16} className="text-red-500" />}
                                </div>
                                );
                            })}
                        </div>
                        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                            <strong className="block mb-3 text-amber-500 text-xs font-black uppercase tracking-[0.2em]">Strategy Insight</strong>
                            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{q.explanation}</p>
                        </div>
                    </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResultsScreen;