import React from 'react';
import { TypingStats } from '../types';
import { Timer, Zap, AlertCircle, Target } from 'lucide-react';

interface StatsBoardProps {
  stats: TypingStats;
}

export const StatsBoard: React.FC<StatsBoardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto mb-8">
      <StatCard 
        icon={<Timer className="w-5 h-5 text-blue-500" />}
        label="Time"
        value={`${stats.timeElapsed}s`}
      />
      <StatCard 
        icon={<Zap className="w-5 h-5 text-yellow-500" />}
        label="WPM"
        value={stats.wpm}
      />
      <StatCard 
        icon={<Target className="w-5 h-5 text-green-500" />}
        label="Accuracy"
        value={`${stats.accuracy}%`}
      />
      <StatCard 
        icon={<AlertCircle className="w-5 h-5 text-red-500" />}
        label="Errors"
        value={stats.errors}
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4 transition-transform hover:scale-[1.02]">
    <div className="p-2 bg-slate-50 rounded-lg">
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);