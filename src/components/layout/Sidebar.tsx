import React from 'react';
import {
  Home,
  Database,
  BarChart3,
  FlaskConical,
  GitCommit,
  TrendingUp,
  BrainCircuit,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Sparkles,
  X,
  BookMarked
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import type { PageId } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavMenuItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
}

const navItems: NavMenuItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'dataset', label: 'Dataset', icon: Database },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'hypothesis-testing', label: 'Hypothesis Testing', icon: FlaskConical },
  { id: 'correlation', label: 'Correlation', icon: GitCommit },
  { id: 'regression', label: 'Regression', icon: TrendingUp },
  { id: 'prediction', label: 'Score Predictor', icon: BrainCircuit },
  { id: 'actual-vs-predicted', label: 'Actual vs Predicted', icon: CheckCircle2 },
  { id: 'subject-analysis', label: 'Subject Breakdown', icon: GraduationCap },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activePage, setActivePage } = useData();

  const handleNavClick = (id: PageId) => {
    setActivePage(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-slate-900 text-slate-100 z-50 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                Maths Project
              </h1>
              <p className="text-xs text-indigo-300 font-medium">Student Performance Analyzer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Target: <strong className="text-white">Final_Score</strong></span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">1000 Students</span>
          </div>
        </div>
      </aside>
    </>
  );
};
