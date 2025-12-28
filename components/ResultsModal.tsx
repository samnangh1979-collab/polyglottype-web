import React from 'react';
import { TypingStats, Language, Difficulty } from '../types';
import { RefreshCcw, ArrowRight } from 'lucide-react';

interface ResultsModalProps {
  stats: TypingStats;
  language: Language;
  difficulty: Difficulty;
  onRestart: () => void;
  onNext: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  stats,
  language,
  difficulty,
  onRestart,
  onNext
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Session Complete!</h2>
        <p className="text-slate-500 text-center mb-8">
          Great job practicing {language} on {difficulty} mode.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-brand-50 p-4 rounded-xl text-center">
            <p className="text-brand-600 text-sm font-bold uppercase tracking-wider">WPM</p>
            <p className="text-4xl font-black text-brand-700">{stats.wpm}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl text-center">
            <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider">Accuracy</p>
            <p className="text-4xl font-black text-emerald-700">{stats.accuracy}%</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl text-center">
             <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Errors</p>
             <p className="text-2xl font-bold text-slate-700">{stats.errors}</p>
          </div>
           <div className="bg-slate-50 p-4 rounded-xl text-center">
             <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Time</p>
             <p className="text-2xl font-bold text-slate-700">{stats.timeElapsed}s</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Retry
          </button>
          <button
            onClick={onNext}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
          >
            Next Text
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};