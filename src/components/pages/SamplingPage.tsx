import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';
import { FormulaCard } from '../common/FormulaCard';
import {
  performSampling,
  simulateCLT,
  calculateConfidenceInterval,
  calculateSummaryStats
} from '../../utils/mathEngine';

export const SamplingPage: React.FC = () => {
  const { data } = useData();

  const [sampleMethod, setSampleMethod] = useState<'random' | 'systematic' | 'stratified'>('random');
  const [sampleSize, setSampleSize] = useState<number>(30);
  const [cltN, setCltN] = useState<number>(30);
  const [confLevel, setConfLevel] = useState<0.90 | 0.95 | 0.99>(0.95);

  const [tDf, setTDf] = useState<number>(10);
  const [chiDf, setChiDf] = useState<number>(5);

  const popScores = data.map(s => s.Final_Score);
  const popStats = calculateSummaryStats(popScores);

  const sampleData = performSampling(data, sampleMethod, sampleSize);
  const sampleScores = sampleData.map(s => s.Final_Score);
  const sampleStats = calculateSummaryStats(sampleScores);

  const cltRes = simulateCLT(data, cltN, 300);
  const ciRes = calculateConfidenceInterval(sampleScores, confLevel);

  // Standard Error vs Sample Size curve data
  const seCurveData = [10, 20, 30, 50, 100, 200, 500, 1000].map(n => ({
    n,
    se: parseFloat((popStats.stdDev / Math.sqrt(n)).toFixed(2))
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* SAMPLING TECHNIQUES */}
      <FormulaCard
        conceptTitle="Sampling Methods & Representative Estimation"
        moduleBadge="MODULE VI"
        formula="Sample Mean (x̄) ≈ Population Mean (μ)"
        formulaDescription="Empirical comparison of Simple Random, Systematic, and Stratified Sampling."
        results={[
          { label: 'Sampling Method', value: sampleMethod.toUpperCase(), highlight: true },
          { label: 'Sample Size (n)', value: sampleSize },
          { label: 'Population Mean (μ)', value: popStats.mean },
          { label: 'Sample Mean (x̄)', value: sampleStats.mean, highlight: true },
          { label: 'Sample Std Dev (s)', value: sampleStats.stdDev }
        ]}
        interpretation={`Using ${sampleMethod} sampling with n = ${sampleSize}, the sample mean x̄ = ${sampleStats.mean} closely estimates the population mean μ = ${popStats.mean}.`}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
            <div className="flex items-center space-x-2">
              <span>Select Technique:</span>
              {(['random', 'systematic', 'stratified'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setSampleMethod(m)}
                  className={`px-3 py-1 rounded-xl capitalize transition ${sampleMethod === m ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-700'}`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <span>Sample Size (n = {sampleSize}):</span>
              <input type="range" min="10" max="200" step="10" value={sampleSize} onChange={e => setSampleSize(Number(e.target.value))} className="w-36 accent-indigo-600" />
            </div>
          </div>

          <div className="overflow-x-auto max-h-48 overflow-y-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold uppercase text-slate-600">
                <tr>
                  <th className="px-3 py-2">Student ID</th>
                  <th className="px-3 py-2">Study Hours</th>
                  <th className="px-3 py-2">Attendance %</th>
                  <th className="px-3 py-2">Final Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sampleData.slice(0, 8).map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono font-bold text-indigo-600">{s.Student_ID}</td>
                    <td className="px-3 py-2">{s.Study_Hours_Per_Day} hrs</td>
                    <td className="px-3 py-2">{s.Attendance_Percentage}%</td>
                    <td className="px-3 py-2 font-bold text-slate-900">{s.Final_Score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FormulaCard>

      {/* CENTRAL LIMIT THEOREM (CLT) SIMULATOR */}
      <FormulaCard
        conceptTitle="Central Limit Theorem (CLT) Demonstration"
        moduleBadge="MODULE VI"
        formula="x̄ ~ N(μ, σ² / n)  as n → ∞"
        formulaDescription="Sampling distribution of sample means approaches normality regardless of population shape."
        results={[
          { label: 'Sample Size (n)', value: cltN, highlight: true },
          { label: 'Simulated Samples (M)', value: 300 },
          { label: 'Mean of Sample Means', value: cltRes.meanOfMeans, highlight: true },
          { label: 'Theoretical SE (σ/√n)', value: cltRes.stdErrTheoretical },
          { label: 'Empirical SE', value: cltRes.stdErrEmpirical, highlight: true }
        ]}
        interpretation={`Central Limit Theorem holds: The sampling distribution of 300 sample means (size n = ${cltN}) forms a symmetric bell curve centered at ${cltRes.meanOfMeans} with Standard Error SE = ${cltRes.stdErrEmpirical}.`}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span>Select Sample Size (n):</span>
            {[10, 30, 50, 100].map(val => (
              <button
                key={val}
                onClick={() => setCltN(val)}
                className={`px-3 py-1 rounded-xl font-mono font-bold transition ${cltN === val ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-700'}`}
              >
                n = {val}
              </button>
            ))}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cltRes.histogram} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="bin" tick={{ fontSize: 9 }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#4F46E5" radius={[8, 8, 0, 0]} name="Sample Means Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FormulaCard>

      {/* STANDARD ERROR CHART */}
      <FormulaCard
        conceptTitle="Standard Error vs Sample Size"
        moduleBadge="MODULE VI"
        formula="SE = s / √n"
        formulaDescription="Standard error of the mean decreases inversely with the square root of sample size."
        results={[
          { label: 'Population StdDev (σ)', value: popStats.stdDev },
          { label: 'Current SE (n=30)', value: (popStats.stdDev / Math.sqrt(30)).toFixed(2), highlight: true }
        ]}
        interpretation="Increasing sample size reduces sampling error SE rapidly at first, demonstrating diminishing returns beyond n = 100."
      >
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={seCurveData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="n" tick={{ fontSize: 10 }} label={{ value: 'Sample Size (n)', position: 'bottom', fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="se" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} name="Standard Error (SE)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </FormulaCard>

      {/* POINT & INTERVAL ESTIMATION */}
      <FormulaCard
        conceptTitle="Confidence Interval for Population Mean μ"
        moduleBadge="MODULE VI"
        formula="CI = x̄ ± z_(α/2) · (s / √n)"
        formulaDescription="Interval estimation providing lower and upper bounds for the population mean."
        results={[
          { label: 'Confidence Level', value: `${confLevel * 100}%`, highlight: true },
          { label: 'Sample Mean (x̄)', value: ciRes.sampleMean },
          { label: 'Margin of Error (E)', value: `±${ciRes.marginOfError}`, highlight: true },
          { label: 'Lower Bound', value: ciRes.lowerBound, highlight: true },
          { label: 'Upper Bound', value: ciRes.upperBound, highlight: true }
        ]}
        interpretation={`With ${confLevel * 100}% confidence, the true population mean score μ lies within the interval [${ciRes.lowerBound}, ${ciRes.upperBound}].`}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span>Select Confidence Level:</span>
            {([0.90, 0.95, 0.99] as const).map(level => (
              <button
                key={level}
                onClick={() => setConfLevel(level)}
                className={`px-3 py-1 rounded-xl font-bold transition ${confLevel === level ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-700'}`}
              >
                {level * 100}%
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2 text-xs font-mono">
            <div className="flex justify-between text-indigo-300">
              <span>{confLevel * 100}% Confidence Interval:</span>
              <span className="font-bold">[{ciRes.lowerBound}  ≤  μ  ≤  {ciRes.upperBound}]</span>
            </div>
          </div>
        </div>
      </FormulaCard>

      {/* THEORETICAL SAMPLING DISTRIBUTIONS (t, Chi-sq, F) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormulaCard
          conceptTitle="Student's t-Distribution"
          moduleBadge="MODULE VI"
          formula="t = (x̄ - μ) / (s / √n)  with df = n - 1"
          formulaDescription="Used for hypothesis testing when sample size is small or σ is unknown."
          results={[{ label: 'Degrees of Freedom (df)', value: tDf, highlight: true }]}
          interpretation="t-distribution has heavier tails than standard normal, accounting for sample variance uncertainty."
        >
          <div className="flex items-center space-x-2 text-xs">
            <span>df:</span>
            <input type="range" min="1" max="30" value={tDf} onChange={e => setTDf(Number(e.target.value))} className="accent-indigo-600 w-full" />
            <span className="font-bold font-mono">{tDf}</span>
          </div>
        </FormulaCard>

        <FormulaCard
          conceptTitle="Chi-Squared Distribution (χ²)"
          moduleBadge="MODULE VI"
          formula="χ² = (n - 1) s² / σ²  with df = n - 1"
          formulaDescription="Used for variance testing and goodness-of-fit."
          results={[{ label: 'Degrees of Freedom (df)', value: chiDf, highlight: true }]}
          interpretation="As degrees of freedom increase, χ² approaches a symmetric normal bell shape."
        >
          <div className="flex items-center space-x-2 text-xs">
            <span>df:</span>
            <input type="range" min="1" max="20" value={chiDf} onChange={e => setChiDf(Number(e.target.value))} className="accent-indigo-600 w-full" />
            <span className="font-bold font-mono">{chiDf}</span>
          </div>
        </FormulaCard>
      </div>
    </div>
  );
};
