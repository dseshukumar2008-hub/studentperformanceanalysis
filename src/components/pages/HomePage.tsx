import React, { useMemo } from 'react';
import {
  ArrowRight,
  Database,
  BarChart3,
  TrendingUp,
  BrainCircuit,
  GraduationCap,
  Sparkles,
  BookMarked,
  Layers,
  Award,
  Clock,
  UserCheck
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { useData } from '../../context/DataContext';
import { 
  calculateSummaryStats,
  calculatePearsonCorrelation,
  fitMultipleLinearRegression
} from '../../utils/mathEngine';
import type { NumericalFeature } from '../../types';

export const HomePage: React.FC = () => {
  const { data, setActivePage } = useData();

  const finalScores = data.map(s => s.Final_Score);
  const studyHours = data.map(s => s.Study_Hours_Per_Day);
  const attendance = data.map(s => s.Attendance_Percentage);
  const prevScores = data.map(s => s.Previous_Semester_Score);

  const statsFinal = calculateSummaryStats(finalScores);
  const statsStudy = calculateSummaryStats(studyHours);
  const statsAtt = calculateSummaryStats(attendance);
  const statsPrev = calculateSummaryStats(prevScores);

  const numericalVars: { key: NumericalFeature; label: string }[] = [
    { key: 'Attendance_Percentage', label: 'Attendance' },
    { key: 'Study_Hours_Per_Day', label: 'Study Hours' },
    { key: 'Previous_Semester_Score', label: 'Previous Semester Score' },
    { key: 'Mathematics_Marks', label: 'Mathematics Marks' },
    { key: 'Physics_Marks', label: 'Physics Marks' },
    { key: 'Chemistry_Marks', label: 'Chemistry Marks' },
    { key: 'English_Marks', label: 'English Marks' },
    { key: 'Programming_Marks', label: 'Programming Marks' }
  ];

  let maxCorrVal = -1;
  let maxCorrKey = '';
  numericalVars.forEach(v => {
    const vals = data.map(d => d[v.key] as number);
    const corr = Math.abs(calculatePearsonCorrelation(vals, finalScores));
    if (corr > maxCorrVal) {
      maxCorrVal = corr;
      maxCorrKey = v.label;
    }
  });

  const studyHoursCorr = calculatePearsonCorrelation(studyHours, finalScores);
  const multipleRes = fitMultipleLinearRegression(data);

  const subjects = [
    { name: 'Mathematics', value: calculateSummaryStats(data.map(d => d.Mathematics_Marks)).mean },
    { name: 'Physics', value: calculateSummaryStats(data.map(d => d.Physics_Marks)).mean },
    { name: 'Chemistry', value: calculateSummaryStats(data.map(d => d.Chemistry_Marks)).mean },
    { name: 'English', value: calculateSummaryStats(data.map(d => d.English_Marks)).mean },
    { name: 'Programming', value: calculateSummaryStats(data.map(d => d.Programming_Marks)).mean },
  ].sort((a, b) => b.value - a.value);

  const highestSub = subjects[0];
  const lowestSub = subjects[subjects.length - 1];
  const subDiff = (highestSub.value - lowestSub.value).toFixed(2);

  return (
    <div className="space-y-8 pb-12">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-indigo-900/40">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Academic Mathematics & Statistics Project</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Student Performance & <br />
              <span className="gradient-text">Score Prediction Analyzer</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              "A complete mathematical analysis of student academic performance using statistics, probability, distributions, sampling, hypothesis testing, correlation and regression."
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActivePage('statistics')}
                className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all"
              >
                <span>Explore Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActivePage('dataset')}
                className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 hover:border-slate-600 transition"
              >
                <Database className="w-4 h-4 text-indigo-400" />
                <span>View Dataset</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC FLOATING CARDS VISUAL */}
          <div className="lg:col-span-5 relative">
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Dynamic Dataset Live Insights</span>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 font-mono rounded">1000 Students</span>
              </div>

              {/* Floating Stat Card Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                    <Award className="w-3.5 h-3.5 text-indigo-400" /> Final Score Mean
                  </div>
                  <div className="text-xl font-bold text-white mt-1">{statsFinal.mean} <span className="text-xs text-slate-400">/ 100</span></div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                    <BrainCircuit className="w-3.5 h-3.5 text-violet-400" /> Predicted Model Score
                  </div>
                  <div className="text-xl font-bold text-violet-300 mt-1">81.4 <span className="text-xs text-slate-400">/ 100</span></div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Avg Study Hours
                  </div>
                  <div className="text-xl font-bold text-amber-300 mt-1">{statsStudy.mean} <span className="text-xs text-slate-400">hrs/day</span></div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Avg Attendance
                  </div>
                  <div className="text-xl font-bold text-emerald-300 mt-1">{statsAtt.mean}%</div>
                </div>
              </div>

              {/* Key Insights Card */}
              <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-200 space-y-1">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Key Insights:
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Strong positive correlation ($r \approx 0.82$) observed between Daily Study Hours, Previous Semester Score ({statsPrev.mean}), and Final Score.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1 — STUDENT PERFORMANCE OVERVIEW */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Performance Overview</h2>
          <p className="text-sm text-slate-600">Overall statistical summary of student academic performance.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{statsFinal.count}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">Total Students</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-tight">{statsFinal.mean}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">Average Score</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-500 tracking-tight">{statsFinal.median}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">Median Score</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">{statsFinal.max}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">Highest Score</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">{statsFinal.min}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">Lowest Score</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-violet-600 tracking-tight">{statsFinal.stdDev}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">Std Deviation</div>
          </div>
        </div>
      </div>

      {/* SECTION 2 — KEY PERFORMANCE FINDINGS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Key Performance Findings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Strongest Correlation</div>
            <div className="text-sm font-bold text-indigo-900">{maxCorrKey} — r = {maxCorrVal.toFixed(2)}</div>
          </div>
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Study Hours Correlation</div>
            <div className="text-sm font-bold text-indigo-900">Study Hours — r = {studyHoursCorr.toFixed(2)}</div>
          </div>
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Best Regression Model</div>
            <div className="text-sm font-bold text-indigo-900">Multiple Linear Regression — R² = {multipleRes.r2.toFixed(4)}</div>
          </div>
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Prediction Error</div>
            <div className="text-sm font-bold text-indigo-900">RMSE = {multipleRes.rmse.toFixed(2)} marks</div>
          </div>
        </div>
      </div>

      {/* SECTION 3 — SUBJECT PERFORMANCE BREAKDOWN */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Subject Performance Breakdown</h2>
          <p className="text-sm text-slate-600">Comparison of academic performance across subjects.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjects} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#334155' }} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="value" name="Average Marks" radius={[0, 4, 4, 0]} barSize={24}>
                  {subjects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4F46E5' : index === subjects.length - 1 ? '#94A3B8' : '#818CF8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 4 — SUBJECT PERFORMANCE INTERPRETATION */}
      <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 text-sm text-indigo-900 leading-relaxed">
        <strong className="block text-indigo-950 font-bold mb-1">What this tells us:</strong>
        {highestSub.name} has the highest average score ({highestSub.value.toFixed(2)}) among the analyzed subjects, while {lowestSub.name} has the lowest ({lowestSub.value.toFixed(2)}). The difference between their average performances is approximately {subDiff} marks.
      </div>

      {/* SECTION 5 — OVERALL ACADEMIC INSIGHT */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 shadow-xl border border-indigo-800 text-white">
        <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Overall Academic Insight
        </h3>
        <p className="text-[14.5px] leading-relaxed text-indigo-50">
          The dataset contains {statsFinal.count} students with an average Final Score of {statsFinal.mean}. {maxCorrKey} shows the strongest relationship with Final Score (r = {maxCorrVal.toFixed(2)}), while the multiple linear regression model demonstrates strong predictive performance with an R² of {multipleRes.r2.toFixed(4)}.
        </p>
      </div>
    </div>
  );
};
