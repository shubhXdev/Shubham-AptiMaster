import React, { useState } from 'react';
import { getExamHistory, getSubjectAttemptCount } from '../services/storageService';
import { Subject, Difficulty } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { ArrowLeft, Download, Filter, TrendingUp, Calendar } from 'lucide-react';

interface AnalyticsScreenProps {
  onBack: () => void;
}

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ onBack }) => {
  const history = getExamHistory();
  const [filterSubject, setFilterSubject] = useState<Subject | 'ALL'>('ALL');
  
  // Prepare data for charts
  const filteredHistory = history.filter(h => filterSubject === 'ALL' || h.subject === filterSubject);
  
  // Sort by date old -> new
  const chartData = filteredHistory.map((h, i) => ({
    attempt: i + 1,
    date: new Date(h.date).toLocaleDateString(),
    score: Math.round((h.score / h.totalQuestions) * 100),
    accuracy: h.accuracy,
    subject: h.subject
  }));

  const overallAccuracy = chartData.length > 0 
    ? Math.round(chartData.reduce((acc, curr) => acc + curr.accuracy, 0) / chartData.length) 
    : 0;

  const totalExams = chartData.length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen text-zinc-100 pb-20">
      <div className="flex items-center justify-between mb-8 no-print">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
            <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-700"
        >
            <Download size={18} /> Download Report
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-zinc-800 pb-6">
        <div>
            <h1 className="text-3xl font-bold font-space text-white mb-2">My Performance Report</h1>
            <p className="text-zinc-400">Student: <strong>Aspirant</strong> | Platform: <strong>Shubham AptiMaster</strong></p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0 no-print">
            <button 
                onClick={() => setFilterSubject('ALL')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${filterSubject === 'ALL' ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-zinc-700'}`}
            >
                All
            </button>
            <button 
                onClick={() => setFilterSubject(Subject.ARITHMETIC)} 
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${filterSubject === Subject.ARITHMETIC ? 'bg-amber-500 text-black border-amber-500' : 'bg-transparent text-zinc-400 border-zinc-700'}`}
            >
                Arithmetic
            </button>
            <button 
                onClick={() => setFilterSubject(Subject.REASONING)} 
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${filterSubject === Subject.REASONING ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-transparent text-zinc-400 border-zinc-700'}`}
            >
                Reasoning
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-zinc-400">
                <Calendar size={20} /> Total Attempts
            </div>
            <div className="text-4xl font-bold text-white">{totalExams}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-zinc-400">
                <TrendingUp size={20} /> Avg. Accuracy
            </div>
            <div className={`text-4xl font-bold ${overallAccuracy > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{overallAccuracy}%</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-zinc-400">
                <Filter size={20} /> Recent Subject
            </div>
            <div className="text-xl font-bold text-white mt-2">{chartData[chartData.length -1]?.subject || 'N/A'}</div>
        </div>
      </div>

      {/* Charts */}
      {totalExams > 0 ? (
          <div className="space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-6">Accuracy Trend (%)</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#666" fontSize={12} />
                            <YAxis stroke="#666" fontSize={12} domain={[0, 100]} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} 
                                itemStyle={{ color: '#fbbf24' }}
                            />
                            <Line type="monotone" dataKey="accuracy" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl print-break-inside-avoid">
                <h3 className="text-lg font-bold text-white mb-6">Detailed Exam Log</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-950 text-zinc-200 uppercase tracking-wider">
                            <tr>
                                <th className="p-4 rounded-tl-lg">Date</th>
                                <th className="p-4">Subject</th>
                                <th className="p-4">Score</th>
                                <th className="p-4">Accuracy</th>
                                <th className="p-4 rounded-tr-lg">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredHistory.slice().reverse().map((h) => {
                                const acc = Math.round((h.score / h.totalQuestions) * 100);
                                return (
                                    <tr key={h.id} className="hover:bg-zinc-800/50">
                                        <td className="p-4">{new Date(h.date).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs border ${h.subject === Subject.ARITHMETIC ? 'border-amber-900 text-amber-500 bg-amber-900/10' : 'border-emerald-900 text-emerald-500 bg-emerald-900/10'}`}>
                                                {h.subject}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-white">{h.score}/{h.totalQuestions}</td>
                                        <td className="p-4 font-mono">{acc}%</td>
                                        <td className="p-4 font-bold text-white">{acc > 80 ? 'Excellent' : acc > 60 ? 'Good' : 'Needs Work'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
      ) : (
          <div className="text-center py-20 bg-zinc-900 rounded-3xl border border-zinc-800 border-dashed">
              <p className="text-zinc-500">No exam history found. Start a test to generate reports!</p>
          </div>
      )}
    </div>
  );
};

export default AnalyticsScreen;
