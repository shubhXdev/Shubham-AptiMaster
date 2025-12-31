import React, { useEffect, useState } from 'react';
import { Question, QuizState, Subject } from '../types';
import { Clock, ChevronRight, AlertTriangle, Timer, Lightbulb, Unlock } from 'lucide-react';

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
  
  // Total Exam Timer (Counts Down)
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(timeLimitMinutes * 60);
  
  // Current Question Timer (Counts Up to track 30s target)
  const [currentQTimer, setCurrentQTimer] = useState(0);

  // Auto-reveal solution state
  const [isTimeLimitBreached, setIsTimeLimitBreached] = useState(false);

  const [startTime] = useState(Date.now());
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  
  // Global Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Question Timer Reset on change
  useEffect(() => {
    setCurrentQTimer(0);
    setIsTimeLimitBreached(false); // Reset auto-reveal on new question
    const qTimer = setInterval(() => {
      setCurrentQTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(qTimer);
  }, [currentQuestionIndex]);

  // Logic: Arithmetic Auto-Reveal after 60 seconds
  useEffect(() => {
    if (
      subject === Subject.ARITHMETIC && 
      currentQTimer >= 60 && 
      !isTimeLimitBreached && 
      answers[currentQuestion.id] === undefined
    ) {
      setIsTimeLimitBreached(true);
    }
  }, [currentQTimer, subject, isTimeLimitBreached, answers, currentQuestion.id]);

  // Track time when moving away
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
      if (answers[q.id] === q.correctAnswerIndex) {
        score++;
      }
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
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
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
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  // Negative Time Logic: If > 30s, we show negative time visually
  const isOverTime = currentQTimer > 30;
  const negativeTime = currentQTimer - 30;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 min-h-screen flex flex-col font-inter text-zinc-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold font-space text-white">Shubham AptiMaster <span className="text-amber-500 text-sm font-normal ml-2">Live Exam</span></h2>
          <div className="text-sm text-zinc-500 mt-1">Topic: {currentQuestion.topic || 'General'}</div>
        </div>
        
        <div className="flex gap-4">
           {/* Per Question Timer */}
           <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isOverTime ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}>
             <Timer size={18} />
             <span className="font-mono font-bold">
               {isOverTime ? `-${formatTime(negativeTime)}` : formatTime(currentQTimer)}
             </span>
             <span className="text-xs opacity-60">/ 00:30</span>
           </div>

           {/* Total Timer */}
           <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${totalTimeRemaining < 60 ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-800 border-zinc-700 text-amber-500'}`}>
             <Clock size={18} />
             <span className="font-mono font-bold">{formatTime(totalTimeRemaining)}</span>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {/* Progress */}
        <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
        </div>

        {/* Question Card */}
        <div className="flex-1 bg-zinc-900 rounded-3xl border border-zinc-800 p-6 md:p-10 shadow-2xl shadow-black/50 flex flex-col">
          <div className="flex justify-between items-start mb-6">
             <span className="text-zinc-500 font-mono text-sm">Q.{currentQuestionIndex + 1}</span>
             {answers[currentQuestion.id] !== undefined && <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-1 rounded">Answered</span>}
          </div>

          <h3 className="text-xl md:text-2xl font-medium text-zinc-100 leading-relaxed mb-6 font-space">
            {currentQuestion.text}
          </h3>

          {/* Render SVG Figure if available */}
          {currentQuestion.figureSVG && (
            <div className="mb-8 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 flex justify-center">
              <div 
                className="w-full max-w-2xl text-zinc-200 [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[300px]"
                dangerouslySetInnerHTML={{ __html: currentQuestion.figureSVG }}
              />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, idx) => {
              // Logic to visually highlight the correct answer if time limit breached for Arithmetic
              const isCorrectAndRevealed = isTimeLimitBreached && idx === currentQuestion.correctAnswerIndex;
              const isSelected = answers[currentQuestion.id] === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`text-left p-5 rounded-xl border transition-all flex items-center gap-4 group ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 text-amber-100'
                      : isCorrectAndRevealed
                        ? 'border-emerald-500 bg-emerald-900/20 text-emerald-100' // Highlight revealed answer
                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                    isSelected 
                      ? 'bg-amber-500 text-black' 
                      : isCorrectAndRevealed
                        ? 'bg-emerald-500 text-black'
                        : 'bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-lg">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Solution Auto-Reveal Section */}
          {isTimeLimitBreached && (
            <div className="mt-8 p-6 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl animate-fade-in relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
               <div className="flex items-center gap-3 text-indigo-400 font-bold mb-3 uppercase tracking-wider text-sm">
                 <Unlock size={18} />
                 <span>Time Limit (60s) Exceeded — Solution Revealed</span>
               </div>
               <div className="flex items-start gap-3">
                 <Lightbulb className="flex-shrink-0 text-amber-400 mt-1" size={20} />
                 <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                   {currentQuestion.explanation}
                 </p>
               </div>
            </div>
          )}

          <div className="mt-auto pt-8 flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-black bg-white hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Exam' : 'Next Question'} <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <AlertTriangle size={32} />
              <h3 className="text-2xl font-bold font-space text-white">Submit Exam?</h3>
            </div>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              You have answered <strong className="text-white">{answeredCount}</strong> out of <strong className="text-white">{questions.length}</strong> questions.
              <br/>
              Unanswered questions will be marked as skipped.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="flex-1 px-6 py-3 rounded-xl border border-zinc-700 font-bold text-zinc-300 hover:bg-zinc-800"
              >
                Review
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 px-6 py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizScreen;