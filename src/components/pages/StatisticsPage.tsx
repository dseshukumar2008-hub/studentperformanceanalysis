import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { useData } from '../../context/DataContext';
import { FormulaCard } from '../common/FormulaCard';
import {
  calculateSummaryStats,
  generateFrequencyTable,
  generateStemAndLeaf,
  calculateBoxPlotStats,
  calculateChebyshevBound,
  calculatePearsonCorrelation
} from '../../utils/mathEngine';
import type { NumericalFeature } from '../../types';

export const StatisticsPage: React.FC = () => {
  const { data } = useData();
  const [selectedVar, setSelectedVar] = useState<NumericalFeature>('Final_Score');
  const [binCount, setBinCount] = useState<number>(8);
  const [chebyshevK, setChebyshevK] = useState<number>(2);
  const [scatterX, setScatterX] = useState<NumericalFeature>('Study_Hours_Per_Day');
  const [scatterY, setScatterY] = useState<NumericalFeature>('Final_Score');

  const numericalVars: { key: NumericalFeature; label: string }[] = [
    { key: 'Final_Score', label: 'Final Score' },
    { key: 'Attendance_Percentage', label: 'Attendance %' },
    { key: 'Study_Hours_Per_Day', label: 'Study Hours' },
    { key: 'Previous_Semester_Score', label: 'Prev Semester Score' },
    { key: 'Mathematics_Marks', label: 'Mathematics Marks' },
    { key: 'Physics_Marks', label: 'Physics Marks' },
    { key: 'Chemistry_Marks', label: 'Chemistry Marks' },
    { key: 'English_Marks', label: 'English Marks' },
    { key: 'Programming_Marks', label: 'Programming Marks' },
  ];

  const values = data.map(s => s[selectedVar] as number);
  const stats = calculateSummaryStats(values);
  const freqTable = generateFrequencyTable(values, binCount);
  const stemAndLeaf = generateStemAndLeaf(values);
  const boxStats = calculateBoxPlotStats(values, selectedVar);
  const chebyshev = calculateChebyshevBound(values, chebyshevK);

  // Boxplots for all 5 subjects
  const subjects: NumericalFeature[] = ['Mathematics_Marks', 'Physics_Marks', 'Chemistry_Marks', 'English_Marks', 'Programming_Marks', 'Final_Score'];
  const allBoxStats = subjects.map(s => calculateBoxPlotStats(data.map(d => d[s] as number), s));

  // Scatter plot data
  const scatterData = data.slice(0, 300).map(s => ({
    x: s[scatterX] as number,
    y: s[scatterY] as number,
    id: s.Student_ID
  }));
  const scatterCorr = calculatePearsonCorrelation(data.map(s => s[scatterX] as number), data.map(s => s[scatterY] as number));

  return (
    <div className="space-y-8 pb-12">
      {/* VARIABLE SELECTOR BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Numerical Variable:</span>
          <select
            value={selectedVar}
            onChange={(e) => setSelectedVar(e.target.value as NumericalFeature)}
            className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500"
          >
            {numericalVars.map(v => (
              <option key={v.key} value={v.key}>{v.label}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          N = <strong>{data.length}</strong> Observations • Selected: <strong>{selectedVar}</strong>
        </div>
      </div>

      {/* SUMMARY STATISTICS GRID CARD */}
      <FormulaCard
        conceptTitle="Descriptive Summary Statistics"
        moduleBadge="MODULE I"
        formula="x̄ = Σx / n ,  σ² = Σ(x - x̄)² / (n - 1) ,  IQR = Q₃ - Q₁"
        formulaDescription="Measures of Central Tendency (Mean, Median, Mode) and Dispersion (Variance, Std Dev, IQR)."
        results={[
          { label: 'Sample Mean (x̄)', value: stats.mean, highlight: true },
          { label: 'Median (Q₂)', value: stats.median },
          { label: 'Mode', value: stats.mode.join(', ') },
          { label: 'Std Dev (σ)', value: stats.stdDev, highlight: true },
          { label: 'Sample Variance (σ²)', value: stats.variance },
          { label: 'Range', value: stats.range },
          { label: 'Min Value', value: stats.min },
          { label: 'Max Value', value: stats.max },
          { label: 'Quartile 1 (Q₁)', value: stats.q1 },
          { label: 'Quartile 3 (Q₃)', value: stats.q3 },
          { label: 'IQR', value: stats.iqr, highlight: true },
          { label: 'Skewness Coefficient', value: stats.skewness }
        ]}
        interpretation={`The empirical mean of ${selectedVar} is ${stats.mean} with a standard deviation of ${stats.stdDev}. The median of ${stats.median} is close to the mean, indicating a balanced academic distribution across the student sample.`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Central Tendency</span>
            <div className="text-sm font-extrabold text-indigo-600 mt-1">Mean: {stats.mean}</div>
            <div className="text-xs text-slate-500">Median: {stats.median}</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Spread / Dispersion</span>
            <div className="text-sm font-extrabold text-violet-600 mt-1">StdDev: {stats.stdDev}</div>
            <div className="text-xs text-slate-500">Var: {stats.variance}</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Quartiles</span>
            <div className="text-sm font-extrabold text-slate-800 mt-1">Q1: {stats.q1} | Q3: {stats.q3}</div>
            <div className="text-xs text-slate-500">IQR: {stats.iqr}</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Extremes</span>
            <div className="text-sm font-extrabold text-emerald-600 mt-1">Min: {stats.min}</div>
            <div className="text-xs text-slate-500">Max: {stats.max}</div>
          </div>
        </div>
      </FormulaCard>

      {/* FREQUENCY TABLE & HISTOGRAM */}
      <FormulaCard
        conceptTitle="Frequency Distribution & Histogram"
        moduleBadge="MODULE I"
        formula="Relative Freq = f / n ,  Cumulative Freq = Σf_i"
        formulaDescription="Grouping continuous data into discrete class intervals to inspect density."
        results={[
          { label: 'Bin Count', value: binCount },
          { label: 'Modal Class Interval', value: freqTable.reduce((prev, current) => (prev.frequency > current.frequency) ? prev : current).interval, highlight: true },
          { label: 'Total Frequencies (N)', value: stats.count }
        ]}
        interpretation={`The modal class interval is ${freqTable.reduce((prev, current) => (prev.frequency > current.frequency) ? prev : current).interval} containing the highest concentration of student scores.`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
              <span>Adjust Histogram Bins:</span>
              <input
                type="range"
                min="5"
                max="15"
                value={binCount}
                onChange={e => setBinCount(Number(e.target.value))}
                className="w-32 accent-indigo-600"
              />
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-mono rounded text-xs">{binCount} bins</span>
            </label>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={freqTable} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="interval" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="frequency" fill="#6366F1" radius={[8, 8, 0, 0]} name="Student Count">
                  {freqTable.map((_, idx) => (
                    <Cell key={idx} fill={idx % 2 === 0 ? '#4F46E5' : '#7C3AED'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Frequency Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold uppercase text-slate-600">
                <tr>
                  <th className="px-3 py-2">Class Interval</th>
                  <th className="px-3 py-2">Frequency (f)</th>
                  <th className="px-3 py-2">Relative Freq</th>
                  <th className="px-3 py-2">Cumulative Freq</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {freqTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono font-bold text-indigo-700">{row.interval}</td>
                    <td className="px-3 py-2 font-bold">{row.frequency}</td>
                    <td className="px-3 py-2">{(row.relativeFrequency * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2 font-mono text-slate-900">{row.cumulativeFrequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FormulaCard>

      {/* CUMULATIVE FREQUENCY CURVE (OGIVE) */}
      <FormulaCard
        conceptTitle="Cumulative Frequency Curve (Less-Than Ogive)"
        moduleBadge="MODULE I"
        formula="Ogive(x) = P(X ≤ x) · N"
        formulaDescription="Cumulative frequency line chart showing the total number of students scoring below given thresholds."
        results={[
          { label: '50th Percentile Score', value: stats.median, highlight: true },
          { label: '75th Percentile Score', value: stats.q3 }
        ]}
        interpretation="The Less-Than Ogive curve allows direct estimation of percentiles. 50% of the student population scores below the median value."
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={freqTable} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="max" tick={{ fontSize: 10 }} label={{ value: 'Upper Class Limit', position: 'bottom', offset: 0, fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
              <ReferenceLine y={stats.count / 2} label={{ value: 'Median (50%)', fill: '#4F46E5', fontSize: 10 }} stroke="#4F46E5" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="cumulativeFrequency" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5' }} name="Cumulative Freq" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </FormulaCard>





      {/* SKEWNESS ANALYSIS */}
      <FormulaCard
        conceptTitle="Skewness Analysis"
        moduleBadge="MODULE I"
        formula="G₁ = [n / ((n-1)(n-2))] Σ ((x_i - x̄) / s)³"
        formulaDescription="Measures symmetry of score distribution around the sample mean."
        results={[
          { label: 'Skewness Coefficient', value: stats.skewness, highlight: true },
          { label: 'Symmetry Classification', value: Math.abs(stats.skewness) < 0.5 ? 'Approximately Symmetric' : stats.skewness > 0 ? 'Positive Skew' : 'Negative Skew' }
        ]}
        interpretation={`The skewness coefficient of ${stats.skewness} indicates that the distribution of ${selectedVar} is ${Math.abs(stats.skewness) < 0.5 ? 'approximately symmetric' : stats.skewness > 0 ? 'positively skewed (right-tailed)' : 'negatively skewed (left-tailed)'}.`}
      >
        <div className="flex items-center justify-around p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-xs font-semibold text-indigo-950">
          <div>Mean: <strong className="text-indigo-700">{stats.mean}</strong></div>
          <div>Median: <strong className="text-indigo-700">{stats.median}</strong></div>
          <div>Skew: <strong className="text-indigo-700">{stats.skewness}</strong></div>
        </div>
      </FormulaCard>

      {/* KURTOSIS ANALYSIS */}
      <FormulaCard
        conceptTitle="Kurtosis Analysis"
        moduleBadge="MODULE I"
        formula="Excess Kurtosis = [n(n+1) / ((n-1)(n-2)(n-3))] Σ ((x_i - x̄) / s)⁴ - 3(n-1)²/((n-2)(n-3))"
        formulaDescription="Measures the concentration of values around the center and the thickness of the tails relative to a normal distribution."
        results={[
          { label: 'Kurtosis Coefficient', value: stats.kurtosis },
          { label: 'Excess Kurtosis', value: stats.excessKurtosis, highlight: true },
          { label: 'Kurtosis Classification', value: stats.excessKurtosis > 0.5 ? 'Leptokurtic' : stats.excessKurtosis < -0.5 ? 'Platykurtic' : 'Mesokurtic' }
        ]}
        interpretation={
          <div className="space-y-2 text-[13px] leading-relaxed mt-2">
            <strong className="text-amber-950 font-bold block">What this tells us:</strong>
            <p>
              {stats.excessKurtosis > 0.5 
                ? "The distribution is leptokurtic, meaning it has a relatively sharper concentration around the center and heavier tails than a normal distribution." 
                : stats.excessKurtosis < -0.5 
                ? "The distribution is platykurtic, meaning it is relatively flatter with lighter tails than a normal distribution."
                : "The distribution is approximately mesokurtic, meaning its peak and tail behavior are similar to a normal distribution."}
              {" "}The calculated excess kurtosis is {stats.excessKurtosis}.
            </p>
          </div>
        }
      >
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center space-y-2 transition-all ${stats.excessKurtosis < -0.5 ? 'bg-indigo-50 border-indigo-400 shadow-sm scale-105' : 'bg-white border-slate-200 opacity-60'}`}>
            <div className="font-bold text-sm text-indigo-900">Platykurtic</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Excess &lt; -0.5</div>
            <p className="text-[11px] text-slate-600 leading-tight">Flatter peak with lighter tails than normal.</p>
          </div>
          
          <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center space-y-2 transition-all ${Math.abs(stats.excessKurtosis) <= 0.5 ? 'bg-indigo-50 border-indigo-400 shadow-sm scale-105' : 'bg-white border-slate-200 opacity-60'}`}>
            <div className="font-bold text-sm text-indigo-900">Mesokurtic</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">-0.5 ≤ Excess ≤ +0.5</div>
            <p className="text-[11px] text-slate-600 leading-tight">Normal-like peak and normal-like tails.</p>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center space-y-2 transition-all ${stats.excessKurtosis > 0.5 ? 'bg-indigo-50 border-indigo-400 shadow-sm scale-105' : 'bg-white border-slate-200 opacity-60'}`}>
            <div className="font-bold text-sm text-indigo-900">Leptokurtic</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Excess &gt; +0.5</div>
            <p className="text-[11px] text-slate-600 leading-tight">Sharper peak with heavier tails than normal.</p>
          </div>
        </div>
      </FormulaCard>

      {/* OVERALL DISTRIBUTION SHAPE */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 shadow-xl border border-indigo-500/20 text-white">
        <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          Overall Distribution Shape
        </h3>
        <p className="text-[14px] leading-relaxed text-indigo-50">
          {selectedVar.replace(/_/g, ' ')} is {Math.abs(stats.skewness) < 0.5 ? 'approximately symmetric' : stats.skewness > 0 ? 'positively skewed' : 'negatively skewed'} (skewness = {stats.skewness}) and {stats.excessKurtosis > 0.5 ? 'leptokurtic' : stats.excessKurtosis < -0.5 ? 'platykurtic' : 'mesokurtic'} (excess kurtosis = {stats.excessKurtosis}). 
          Therefore, the distribution {Math.abs(stats.skewness) < 0.5 && Math.abs(stats.excessKurtosis) <= 0.5 ? 'closely resembles a standard normal bell curve.' : 'departs from a standard normal distribution.'}
        </p>
      </div>

      {/* BIVARIATE SCATTER PLOT */}
      <FormulaCard
        conceptTitle="Bivariate Scatter Plot Analysis"
        moduleBadge="MODULE I"
        formula="Scatter(X, Y) ⟹ Visual inspection of association"
        formulaDescription="Interactive scatter plot of any two numerical features from dataset."
        results={[
          { label: 'X Variable', value: scatterX },
          { label: 'Y Variable', value: scatterY },
          { label: 'Pearson Correlation (r)', value: scatterCorr, highlight: true }
        ]}
        interpretation={`Scatter plot of ${scatterX} vs ${scatterY} shows a Pearson correlation coefficient of r = ${scatterCorr}, demonstrating a ${Math.abs(scatterCorr) > 0.7 ? 'strong' : Math.abs(scatterCorr) > 0.4 ? 'moderate' : 'weak'} linear association.`}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-xs font-bold">
            <div className="flex items-center space-x-2">
              <span>X Axis:</span>
              <select value={scatterX} onChange={e => setScatterX(e.target.value as NumericalFeature)} className="p-1.5 bg-white border border-slate-300 rounded-lg">
                {numericalVars.map(v => <option key={v.key} value={v.key}>{v.label}</option>)}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span>Y Axis:</span>
              <select value={scatterY} onChange={e => setScatterY(e.target.value as NumericalFeature)} className="p-1.5 bg-white border border-slate-300 rounded-lg">
                {numericalVars.map(v => <option key={v.key} value={v.key}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="x" type="number" name={scatterX} tick={{ fontSize: 10 }} />
                <YAxis dataKey="y" type="number" name={scatterY} tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                <Scatter name="Students" data={scatterData} fill="#6366F1" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FormulaCard>
    </div>
  );
};
