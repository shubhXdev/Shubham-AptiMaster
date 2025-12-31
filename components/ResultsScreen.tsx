import React, { useState, useEffect } from 'react';
import { Question, QuizState } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Check, X, RotateCcw, Award, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { saveExamResult } from '../services/storageService';

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
    // Save to history on mount
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
    <div className="max-w-6xl mx-auto p-6 pb-20 text-zinc-100">
      <div className="text-center mb-10 no-print">
        <h1 className="text-4xl font-bold font-space mb-2">Exam Analysis</h1>
        <p className="text-zinc-400">Shubham AptiMaster Performance Report</p>
      </div>

      <div className="grid md:grid-cols-12 gap-6 mb-12">
        {/* Score Card */}
        <div className="md:col-span-4 bg-zinc-900 p-8 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-center z-10">
            <div className="inline-block p-4 bg-amber-500/10 rounded-full text-amber-500 mb-4">
               <Award size={48} />
            </div>
            <div className="text-6xl font-extrabold text-white mb-2 font-space">{scorePercentage}%</div>
            <div className="text-zinc-400 font-medium uppercase tracking-widest text-sm">Overall Score</div>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm">
                <div className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                    Accuracy: <span className={accuracy > 80 ? "text-emerald-400" : "text-amber-400"}>{accuracy}%</span>
                </div>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Breakdown */}
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
                <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-bold">
                    {questions.length} Qs
                </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1"><Check size={16} /> Correct</div>
                    <div className="text-2xl font-mono text-white">{correctCount}</div>
                </div>
                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                    <div className="flex items-center gap-2 text-red-400 font-bold mb-1"><X size={16} /> Incorrect</div>
                    <div className="text-2xl font-mono text-white">{incorrectCount}</div>
                </div>
                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                    <div className="flex items-center gap-2 text-zinc-400 font-bold mb-1">Skipped</div>
                    <div className="text-2xl font-mono text-white">{skippedCount}</div>
                </div>
                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                    <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">Time Taken</div>
                    <div className="text-2xl font-mono text-white">{formatTime(state.totalTimeTaken)}</div>
                </div>
            </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-zinc-800 no-print">
        <button 
            onClick={() => setActiveTab('summary')}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'summary' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            Action Plan
        </button>
        <button 
            onClick={() => setActiveTab('solutions')}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'solutions' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            Detailed Solutions
        </button>
      </div>

      {activeTab === 'summary' && (
        <div className="animate-fade-in no-print">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Shubham's Recommendations</h3>
                <div className="space-y-4">
                    {accuracy < 60 && (
                        <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-xl text-red-200">
                            <strong className="block mb-1 text-red-400">Focus Area: Basics</strong>
                            Your accuracy is below 60%. Please revisit the fundamental concepts of {subject} before taking another mock.
                        </div>
                    )}
                    {state.totalTimeTaken > (totalTimeMinutes * 60) * 0.9 && (
                        <div className="p-4 bg-amber-900/10 border border-amber-900/30 rounded-xl text-amber-200">
                            <strong className="block mb-1 text-amber-400">Time Management</strong>
                            You utilized most of the time. Try to use elimination methods for options to speed up.
                        </div>
                    )}
                     <div className="p-4 bg-emerald-900/10 border border-emerald-900/30 rounded-xl text-emerald-200">
                        <strong className="block mb-1 text-emerald-400">Consistency</strong>
                        Take this test again after 2 days to check retention.
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onViewAnalytics}
                    className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <FileText size={20} /> View Full Analytics
                </button>
                <button
                    onClick={onRestart}
                    className="flex-1 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <RotateCcw size={20} /> Attempt New Exam
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
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                            isCorrect ? 'bg-emerald-500/10 text-emerald-500' : isSkipped ? 'bg-zinc-700 text-zinc-400' : 'bg-red-500/10 text-red-500'
                        }`}>
                            {isCorrect ? 'Correct' : isSkipped ? 'Skipped' : 'Incorrect'}
                        </span>
                        <span className={`text-xs font-mono ${timeSpent > 30 ? 'text-red-400' : 'text-zinc-500'}`}>
                             ⏱ {timeSpent}s
                        </span>
                        <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">{q.topic || 'General'}</span>
                    </div>
                    <h3 className="text-lg font-medium text-zinc-200">{q.text}</h3>
                  </div>
                  <div className="no-print">
                      {isExpanded ? <ChevronUp className="text-zinc-500" /> : <ChevronDown className="text-zinc-500" />}
                  </div>
                </div>

                {(isExpanded || window.matchMedia('print').matches) && (
                    <div className="mt-6 pt-6 border-t border-zinc-800 animate-fade-in">
                        {/* Render SVG in Solutions */}
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
                                <div key={optIdx} className={`p-3 rounded-lg border text-sm flex items-center justify-between ${
                                    isActuallyCorrect ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-200' : 
                                    isSelected ? 'bg-red-900/20 border-red-900/50 text-red-200' : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                                }`}>
                                    <span className="flex items-center gap-2">
                                        <span className="opacity-50">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                                    </span>
                                    {isActuallyCorrect && <Check size={16} />}
                                    {isSelected && !isActuallyCorrect && <X size={16} />}
                                </div>
                                );
                            })}
                        </div>
                        <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-xl">
                            <strong className="block mb-2 text-amber-500 text-sm uppercase tracking-wider">Shubham's Logic</strong>
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
