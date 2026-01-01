import React, { useEffect, useState } from 'react';
import { Question, QuizState, Subject } from '../types';
import { Clock, ChevronRight, AlertTriangle, Timer, Lightbulb, Unlock, Info, HelpCircle } from 'lucide-react';

interface QuizScreenProps {
  questions: Question[];
  timeLimitMinutes: number;
  onFinish: (state: QuizState) => void;
  subject: Subject;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ questions, timeLimitMinutes, onFinish, subject }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(timeLimitMinutes * 60);
  const [currentQTimer, setCurrentQTimer] = useState(0);
  const [isTimeLimitBreached, setIsTimeLimitBreached] = useState(false);
  const [startTime] = useState(Date.now());
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [visibleHints, setVisibleHints] = useState<number>(0);
  
  const currentQuestion = questions[currentQuestionIndex];
  
  useEffect(() => {
    const timer = setInterval(() => setTotalTimeRemaining((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setCurrentQTimer(0);
    setIsTimeLimitBreached(false);
    setVisibleHints(0);
    const qTimer = setInterval(() => setCurrentQTimer(t => t + 1), 1000);
    return () => clearInterval(qTimer);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (subject === Subject.ARITHMETIC && currentQTimer >= 60 && !isTimeLimitBreached && answers[currentQuestion.id] === undefined) {
      setIsTimeLimitBreached(true);
    }
  }, [currentQTimer, subject, isTimeLimitBreached, answers, currentQuestion.id]);

  const saveCurrentQTime = () => {
    setQuestionTimes(prev => ({
      ...prev,
      [currentQuestion.id]: (prev[currentQuestion.id] || 0) + currentQTimer
    }));
  };

  const handleFinish = () => {
    saveCurrentQTime();
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswerIndex) score++;
    });
    onFinish({
      currentQuestionIndex,
      answers,
      questionTimes: { ...questionTimes, [currentQuestion.id]: currentQTimer },
      isFinished: true,
      score,
      totalTimeTaken: (timeLimitMinutes * 60) - totalTimeRemaining,
      startTime
    });
  };

  const handleOptionSelect = (optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  const handleNext = () => {
    saveCurrentQTime();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsSubmitConfirmOpen(true);
    }
  };

  const formatTime = (seconds: number) => {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds % 60;
    return `${isNegative ? '-' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isOverTime = currentQTimer > 30 && subject !== Subject.THINKING;
  const negativeTime = currentQTimer - 30;
  const isGlobalOvertime = totalTimeRemaining < 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen flex flex-col font-inter text-zinc-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold font-space text-white">Shubham AptiMaster <span className="text-amber-500 text-sm font-normal ml-2">{subject} Mission</span></h2>
          <div className="text-sm text-zinc-500 mt-1">Topic: {currentQuestion.topic || 'General Analysis'}</div>
        </div>
        
        <div className="flex gap-4">
           <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isOverTime ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}>
             <Timer size={18} />
             <span className="font-mono font-bold">
               {isOverTime ? `-${formatTime(negativeTime)}` : formatTime(currentQTimer)}
             </span>
             {subject !== Subject.THINKING && <span className="text-xs opacity-60">/ 00:30</span>}
           </div>
           <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isGlobalOvertime ? 'bg-red-600 border-red-500 text-white animate-pulse' : 'bg-zinc-800 border-zinc-700 text-amber-500'}`}>
             <Clock size={18} />
             <span className="font-mono font-bold">{formatTime(totalTimeRemaining)}</span>
           </div>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
          </div>

          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 md:p-10 shadow-2xl flex flex-col">
            <h3 className="text-xl md:text-2xl font-medium text-zinc-100 leading-relaxed mb-8 font-space">
              {currentQuestion.text}
            </h3>

            {currentQuestion.figureSVG && (
              <div className="mb-8 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 flex justify-center">
                <div className="w-full max-w-2xl text-zinc-200" dangerouslySetInnerHTML={{ __html: currentQuestion.figureSVG }} />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;
                const isCorrectAndRevealed = isTimeLimitBreached && idx === currentQuestion.correctAnswerIndex;
                return (
                  <button key={idx} onClick={() => handleOptionSelect(idx)} className={`text-left p-5 rounded-xl border transition-all flex items-center gap-4 group ${isSelected ? 'border-amber-500 bg-amber-500/10' : isCorrectAndRevealed ? 'border-emerald-500 bg-emerald-900/20' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isSelected ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>{String.fromCharCode(65 + idx)}</div>
                    <span className="text-lg">{option}</span>
                  </button>
                );
              })}
            </div>

            {isTimeLimitBreached && (
              <div className="mt-8 p-6 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl animate-fade-in relative">
                 <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                 <p className="text-zinc-300 whitespace-pre-wrap">{currentQuestion.explanation}</p>
              </div>
            )}

            <div className="mt-8 pt-8 flex justify-end">
              <button onClick={handleNext} className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-black bg-white hover:bg-zinc-200">
                {currentQuestionIndex === questions.length - 1 ? 'Finish Exam' : 'Next Question'} <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar for Thinking Section (Rules & Hints) */}
        <div className="lg:col-span-4 space-y-6">
          {subject === Subject.THINKING && (
            <>
              {/* Strategy Rules */}
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
                <div className="flex items-center gap-2 text-indigo-400 mb-4 font-bold uppercase tracking-widest text-xs">
                  <Info size={16} /> Strategy to Dominate
                </div>
                <ul className="space-y-3">
                  {(currentQuestion.strategyRules || ["Read carefully", "Eliminate extremes", "Focus on logic"]).map((rule, i) => (
                    <li key={i} className="text-zinc-400 text-sm flex gap-3">
                      <span className="text-indigo-500 font-bold">•</span> {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hints */}
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-widest text-xs">
                    <HelpCircle size={16} /> Cognitive Hints
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono">{visibleHints}/{currentQuestion.hints?.length || 0}</span>
                </div>
                
                <div className="space-y-4">
                  {currentQuestion.hints?.map((hint, i) => (
                    <div key={i}>
                      {visibleHints > i ? (
                        <div className="p-3 bg-zinc-800 rounded-xl text-zinc-300 text-xs italic animate-fade-in border-l-2 border-amber-500">
                          {hint}
                        </div>
                      ) : (
                        <button 
                          onClick={() => setVisibleHints(i + 1)}
                          className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-500 text-[10px] uppercase font-bold rounded-lg border border-zinc-700 border-dashed"
                        >
                          Unlock Hint {i + 1}
                        </button>
                      )}
                    </div>
                  ))}
                  {(!currentQuestion.hints || currentQuestion.hints.length === 0) && (
                    <p className="text-zinc-600 text-[10px] italic">No hints available for this mission.</p>
                  )}
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/20 rounded-3xl">
                <p className="text-indigo-400 text-xs font-bold mb-2">Cognitive Goal</p>
                <p className="text-zinc-400 text-[10px] leading-relaxed">
                  Thinking questions are designed to stress-test your decision-making under ambiguity. Aim for accuracy over speed here.
                </p>
              </div>
            </>
          )}

          {subject !== Subject.THINKING && (
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl text-center">
              <Lightbulb className="mx-auto text-amber-500 mb-4" size={32} />
              <p className="text-zinc-400 text-sm">Focus on accuracy. Use shortcuts only when certain.</p>
            </div>
          )}
        </div>
      </div>

      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold font-space text-white mb-4">Submit Exam?</h3>
            <p className="text-zinc-400 mb-8">Answered: <strong className="text-white">{answeredCount}</strong> / {questions.length}</p>
            <div className="flex gap-4">
              <button onClick={() => setIsSubmitConfirmOpen(false)} className="flex-1 px-6 py-3 rounded-xl border border-zinc-700 font-bold text-zinc-300">Review</button>
              <button onClick={handleFinish} className="flex-1 px-6 py-3 rounded-xl bg-amber-500 text-black font-bold">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizScreen;