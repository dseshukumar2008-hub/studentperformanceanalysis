import React from 'react';
import { BookOpen, Calculator, LineChart, CheckCircle2, HelpCircle } from 'lucide-react';

interface FormulaCardProps {
  conceptTitle: string;
  moduleBadge?: string;
  formula?: string;
  formulaDescription?: string;
  children?: React.ReactNode; // Visualization & controls
  results?: { label: string; value: string | number; highlight?: boolean }[];
  customConclusion?: React.ReactNode;
  interpretation?: React.ReactNode;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({
  conceptTitle,
  moduleBadge,
  formula,
  formulaDescription,
  children,
  results = [],
  customConclusion,
  interpretation,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow duration-300 p-6 space-y-6">
      {/* 1. CONCEPT HEADER */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{conceptTitle}</h3>
              {moduleBadge && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 rounded-md">
                  {moduleBadge}
                </span>
              )}
            </div>
            {formulaDescription && (
              <p className="text-xs text-slate-500 font-medium">{formulaDescription}</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. MATHEMATICAL FORMULA DISPLAY */}
      {formula && (
        <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-sm border border-slate-800 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Calculator className="w-4 h-4 shrink-0" />
            <span className="text-xs text-slate-400 uppercase tracking-wider font-sans font-bold">Mathematical Formula:</span>
          </div>
          <div className="text-indigo-200 font-semibold tracking-wide text-base bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800/80">
            {formula}
          </div>
        </div>
      )}

      {/* 3. VISUALIZATION / INTERACTIVE CONTENT */}
      {children && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <LineChart className="w-3.5 h-3.5 text-indigo-500" />
            <span>Interactive Visualization & Data Computation</span>
          </div>
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            {children}
          </div>
        </div>
      )}

      {/* 4. COMPUTED NUMERICAL RESULTS */}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Empirical Dataset Results</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {results.map((res, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-center transition ${
                  res.highlight
                    ? 'bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200 text-indigo-950'
                    : 'bg-slate-50/80 border-slate-200/80 text-slate-800'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-500 truncate">{res.label}</div>
                <div className={`text-base font-bold tracking-tight mt-0.5 ${res.highlight ? 'text-indigo-700' : 'text-slate-900'}`}>
                  {res.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4.5. CUSTOM CONCLUSION BLOCK */}
      {customConclusion && (
        <div className="mt-6">
          {customConclusion}
        </div>
      )}

      {/* 5. ACADEMIC INTERPRETATION */}
      {interpretation && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-950">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900 block mb-0.5">Interpretation:</span>
            <p className="leading-relaxed font-medium text-amber-900/90">{interpretation}</p>
          </div>
        </div>
      )}
    </div>
  );
};
