import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useData } from '../../context/DataContext';
import { FormulaCard } from '../common/FormulaCard';
import { calculateSummaryStats, calculatePearsonCorrelation } from '../../utils/mathEngine';
import type { NumericalFeature } from '../../types';

export const SubjectAnalysisPage: React.FC = () => {
  const { data } = useData();

  const subjects: { key: NumericalFeature; name: string }[] = [
    { key: 'Mathematics_Marks', name: 'Mathematics' },
    { key: 'Physics_Marks', name: 'Physics' },
    { key: 'Chemistry_Marks', name: 'Chemistry' },
    { key: 'English_Marks', name: 'English' },
    { key: 'Programming_Marks', name: 'Programming' },
  ];

  const subjectStats = subjects.map(s => {
    const vals = data.map(d => d[s.key] as number);
    const stats = calculateSummaryStats(vals);
    const corrWithFinal = calculatePearsonCorrelation(vals, data.map(d => d.Final_Score));
    return {
      name: s.name,
      mean: stats.mean,
      median: stats.median,
      stdDev: stats.stdDev,
      min: stats.min,
      max: stats.max,
      corrWithFinal
    };
  });

  const radarData = subjectStats.map(s => ({
    subject: s.name,
    AverageScore: s.mean,
    MedianScore: s.median
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* SUBJECT OVERVIEW RADAR CHART */}
      <FormulaCard
        conceptTitle="5-Subject Academic Performance Overview"
        moduleBadge="SUBJECT ANALYSIS"
        formula="Average_Subject = (1/n) Σ Mark_ij"
        formulaDescription="Comprehensive subject analysis across Mathematics, Physics, Chemistry, English, and Programming."
        results={subjectStats.map(s => ({
          label: `${s.name} Mean`,
          value: `${s.mean} / 100`,
          highlight: s.name === 'Mathematics' || s.name === 'Programming'
        }))}
        interpretation="Subject performance comparison shows that Mathematics and Programming exhibit the strongest correlation with Final_Score."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#0F172A', fontWeight: 'bold' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Average Marks" dataKey="AverageScore" stroke="#4F46E5" fill="#6366F1" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectStats} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="mean" fill="#7C3AED" radius={[8, 8, 0, 0]} name="Subject Mean" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FormulaCard>

      {/* SUBJECT VS FINAL SCORE CORRELATION RANKING */}
      <FormulaCard
        conceptTitle="Subject Correlation Ranking with Final Score"
        moduleBadge="SUBJECT ANALYSIS"
        formula="r_(Subject, Final) = Pearson(Mark_Subject, Final_Score)"
        formulaDescription="Evaluating which subject marks exert the strongest influence on overall student final scores."
        results={subjectStats.map(s => ({
          label: `${s.name} r`,
          value: s.corrWithFinal,
          highlight: true
        }))}
        interpretation="Mathematics and Programming marks demonstrate the highest predictive weight toward overall academic success."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-900 text-white font-bold uppercase">
              <tr>
                <th className="px-4 py-3">Subject Name</th>
                <th className="px-4 py-3">Mean Mark</th>
                <th className="px-4 py-3">Std Dev (σ)</th>
                <th className="px-4 py-3">Correlation with Final Score (r)</th>
                <th className="px-4 py-3">Influence Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {[...subjectStats].sort((a, b) => b.corrWithFinal - a.corrWithFinal).map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">{s.name}</td>
                  <td className="px-4 py-3 font-mono">{s.mean}</td>
                  <td className="px-4 py-3 font-mono">{s.stdDev}</td>
                  <td className="px-4 py-3 font-mono text-indigo-700 font-bold">r = {s.corrWithFinal}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-bold rounded-md text-[10px]">
                      Rank #{idx + 1}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormulaCard>
    </div>
  );
};
