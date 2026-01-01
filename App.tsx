import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import BrandLogo from './components/BrandLogo';
import { QuizConfig, Question, QuizState, Subject } from './types';
import { generateQuestions } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'welcome' | 'quiz' | 'results' | 'analytics'>('welcome');
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizResultState, setQuizResultState] = useState<QuizState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartQuiz = async (newConfig: QuizConfig) => {
    setIsLoading(true);
    setError(null);
    setConfig(newConfig);

    try {
      const generatedQuestions = await generateQuestions(
        newConfig.subject,
        newConfig.difficulty,
        newConfig.questionCount
      );
      setQuestions(generatedQuestions);
      setAppState('quiz');
    } catch (err: any) {
      console.error(err);
      setError("Exam construction failed. Please verify API Connectivity.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishQuiz = (resultState: QuizState) => {
    setQuizResultState(resultState);
    setAppState('results');
  };

  const handleRestart = () => {
    setAppState('welcome');
    setConfig(null);
    setQuestions([]);
    setQuizResultState(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-inter selection:bg-amber-500 selection:text-black">
      {appState !== 'quiz' && (
        <nav className="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 no-print">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={handleRestart}>
            <BrandLogo size={44} className="group-hover:scale-110 transition-transform duration-300" />
            <div>
               <span className="font-bold text-xl tracking-tight text-white font-space">
                 Shubham <span className="text-amber-500">AptiMaster</span>
               </span>
               <div className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none font-bold">Govt Exam Specialist</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <span className="hover:text-amber-500 transition-colors cursor-default">SSC</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            <span className="hover:text-amber-500 transition-colors cursor-default">Bank PO</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            <span className="hover:text-amber-500 transition-colors cursor-default">UPSC CSAT</span>
          </div>
        </nav>
      )}

      <main className="container mx-auto">
        {error && (
          <div className="max-w-md mx-auto mt-8 bg-red-900/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl relative animate-bounce" role="alert">
            <strong className="font-bold">System Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {appState === 'welcome' && (
          <WelcomeScreen 
            onStart={handleStartQuiz} 
            onViewAnalytics={() => setAppState('analytics')}
            isLoading={isLoading} 
          />
        )}

        {appState === 'analytics' && (
            <AnalyticsScreen onBack={() => setAppState('welcome')} />
        )}

        {appState === 'quiz' && config && (
          <QuizScreen 
            questions={questions} 
            timeLimitMinutes={config.timeLimitMinutes}
            onFinish={handleFinishQuiz}
            subject={config.subject}
          />
        )}

        {appState === 'results' && quizResultState && config && (
          <ResultsScreen 
            questions={questions}
            state={quizResultState}
            totalTimeMinutes={config.timeLimitMinutes}
            subject={config.subject}
            difficulty={config.difficulty}
            onRestart={handleRestart}
            onViewAnalytics={() => setAppState('analytics')}
          />
        )}
      </main>
    </div>
  );
};

export default App;