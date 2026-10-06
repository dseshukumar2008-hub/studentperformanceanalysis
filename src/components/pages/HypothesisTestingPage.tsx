import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useData } from '../../context/DataContext';
import { FormulaCard } from '../common/FormulaCard';
import {
  runOneSampleMeanTest,
  runOneProportionTest,
  runTwoProportionTest
} from '../../utils/mathEngine';
import type { NumericalFeature } from '../../types';

export const HypothesisTestingPage: React.FC = () => {
  const { data } = useData();

  const [targetVar, setTargetVar] = useState<NumericalFeature>('Final_Score');
  const [hypothesizedMean, setHypothesizedMean] = useState<number>(65);
  const [alpha, setAlpha] = useState<0.01 | 0.05 | 0.10>(0.05);

  const [propThreshold, setPropThreshold] = useState<number>(70);
  const [hypothesizedP0, setHypothesizedP0] = useState<number>(0.50);

  const values = data.map(s => s[targetVar] as number);
  const meanTestRes = runOneSampleMeanTest(values, hypothesizedMean, alpha);

  const onePropRes = runOneProportionTest(data, s => s.Final_Score >= propThreshold, hypothesizedP0, alpha);

  const group1 = data.filter(s => s.Study_Hours_Per_Day < 5);
  const group2 = data.filter(s => s.Study_Hours_Per_Day >= 5);
  const twoPropRes = runTwoProportionTest(group1, group2, s => s.Final_Score >= propThreshold, alpha);

  const distCurveData = useMemo(() => {
    const curve = [];
    const maxZ = 4;
    const minZ = -4;
    const step = (maxZ - minZ) / 100;
    const cv = meanTestRes.criticalValue;

    for (let z = minZ; z <= maxZ; z += step) {
      const density = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * Math.pow(z, 2));
      let rejectionLeft = 0;
      let nonRejection = 0;
      let rejectionRight = 0;

      if (z <= -cv) rejectionLeft = density;
      else if (z >= cv) rejectionRight = density;
      else nonRejection = density;

      curve.push({
        z: parseFloat(z.toFixed(2)),
        density: parseFloat(density.toFixed(4)),
        rejectionLeft: rejectionLeft ? parseFloat(density.toFixed(4)) : null,
        nonRejection: nonRejection ? parseFloat(density.toFixed(4)) : null,
        rejectionRight: rejectionRight ? parseFloat(density.toFixed(4)) : null,
      });
    }
    return curve;
  }, [meanTestRes.criticalValue]);

  const displayTestStat = Math.min(Math.max(meanTestRes.testStatistic, -3.9), 3.9);
  const testStatLabel = meanTestRes.testStatistic > 4 ? `Test Statistic = ${meanTestRes.testStatistic} →` : 
                        meanTestRes.testStatistic < -4 ? `← Test Statistic = ${meanTestRes.testStatistic}` :
                        `Test Statistic = ${meanTestRes.testStatistic}`;

  return (
    <div className="space-y-8 pb-12">
      {/* SIGNIFICANCE LEVEL ALIGNMENT CONTROL */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600 uppercase">Set Global Significance Level (α):</span>
        <div className="flex space-x-2">
          {([0.01, 0.05, 0.10] as const).map(a => (
            <button
              key={a}
              onClick={() => setAlpha(a)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition ${
                alpha === a ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-700'
              }`}
            >
              α = {a} ({a * 100}%)
            </button>
          ))}
        </div>
      </div>

      {/* MODULE VII: HYPOTHESIS TESTING FOR MEAN */}
      <FormulaCard
        conceptTitle="One-Sample Hypothesis Test for Mean (Module VII)"
        moduleBadge="MODULE VII"
        formula="t = (x̄ - μ₀) / (s / √n)  or  Z = (x̄ - μ₀) / (σ / √n)"
        formulaDescription="Testing whether the population mean score equals hypothesized value μ₀."
        results={[
          { label: 'Null Hypothesis', value: meanTestRes.nullHypothesis },
          { label: 'Alternative H₁', value: meanTestRes.alternativeHypothesis },
          { label: 'Sample Mean (x̄)', value: meanTestRes.sampleMean, highlight: true },
          { label: 'Test Statistic (Z/t)', value: meanTestRes.testStatistic, highlight: true },
          { label: 'p-Value', value: meanTestRes.pValue, highlight: true },
          { label: 'Critical Value (Z_crit)', value: `±${meanTestRes.criticalValue}` },
          { label: 'Decision', value: meanTestRes.decision, highlight: true }
        ]}
        customConclusion={
          <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-6 space-y-5">
            <h4 className="text-lg font-extrabold text-indigo-950 border-b border-indigo-100 pb-2">Final Hypothesis Conclusion</h4>
            
            <div className="space-y-1 text-sm">
              <span className="font-bold text-slate-700">Question:</span>
              <p className="text-slate-800 italic">"Is the mean {targetVar.replace('_Marks', '').replace('_', ' ')} significantly different from {hypothesizedMean}?"</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 text-sm bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <span className="font-bold text-slate-700">Hypotheses:</span>
                <div className="font-mono font-bold text-indigo-800 mt-1">
                  <div>H₀: μ = {hypothesizedMean}</div>
                  <div>H₁: μ ≠ {hypothesizedMean}</div>
                </div>
              </div>
              
              <div className="space-y-1 text-sm bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                <span className="font-bold text-slate-700">Decision:</span>
                <div className={`text-lg font-bold uppercase tracking-wide mt-1 ${meanTestRes.rejectNull ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {meanTestRes.rejectNull ? 'Reject H₀' : 'Do Not Reject H₀'}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className={`text-base sm:text-lg font-bold p-4 rounded-lg border ${meanTestRes.rejectNull ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                {meanTestRes.rejectNull 
                  ? `YES — The mean ${targetVar.replace('_Marks', '').replace('_', ' ')} is significantly different from ${hypothesizedMean}.`
                  : `NO — We do not have sufficient evidence to conclude that the mean ${targetVar.replace('_Marks', '').replace('_', ' ')} is significantly different from ${hypothesizedMean}.`}
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-6 text-sm font-mono font-bold text-slate-500 border-b border-slate-100 pb-3">
                <span>Significance Level: α = {alpha}</span>
                <span>p-value: {meanTestRes.pValue < 0.001 ? '< 0.001' : meanTestRes.pValue}</span>
                <span className={meanTestRes.rejectNull ? 'text-rose-600' : 'text-emerald-600'}>Decision: {meanTestRes.rejectNull ? 'Reject H₀' : 'Do Not Reject H₀'}</span>
              </div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                {meanTestRes.rejectNull 
                  ? `At the ${alpha * 100}% significance level, we reject H₀ because the p-value (${meanTestRes.pValue < 0.001 ? '< 0.001' : meanTestRes.pValue}) is less than α (${alpha}). Therefore, there is sufficient statistical evidence to conclude that the population mean ${targetVar.replace('_Marks', '').replace('_', ' ')} is significantly different from ${hypothesizedMean}.`
                  : `At the ${alpha * 100}% significance level, we do not reject H₀ because the p-value (${meanTestRes.pValue < 0.001 ? '< 0.001' : meanTestRes.pValue}) is greater than or equal to α (${alpha}). Therefore, there is insufficient statistical evidence to conclude that the population mean ${targetVar.replace('_Marks', '').replace('_', ' ')} is significantly different from ${hypothesizedMean}.`}
              </p>
            </div>
          </div>
        }
        interpretation={meanTestRes.interpretation}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="space-y-1">
              <span>Select Variable:</span>
              <select
                value={targetVar}
                onChange={e => setTargetVar(e.target.value as NumericalFeature)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl"
              >
                <option value="Final_Score">Final Score</option>
                <option value="Mathematics_Marks">Mathematics Marks</option>
                <option value="Physics_Marks">Physics Marks</option>
                <option value="Chemistry_Marks">Chemistry Marks</option>
              </select>
            </div>

            <div className="space-y-1">
              <span>Hypothesized Mean μ₀ ({hypothesizedMean}):</span>
              <input
                type="range"
                min="40"
                max="85"
                value={hypothesizedMean}
                onChange={e => setHypothesizedMean(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl space-y-3 mb-2 shadow-sm">
            <h4 className="font-bold text-[13px] text-indigo-900 leading-snug">
              QUESTION: "Is the mean {targetVar.replace('_Marks', '').replace('_', ' ')} significantly different from {hypothesizedMean}?"
            </h4>
            <div className="font-mono text-xs text-indigo-800 font-bold space-y-1 bg-white/60 p-2 rounded-lg inline-block border border-indigo-50/50">
              <div>H₀: μ = {hypothesizedMean}</div>
              <div>H₁: μ ≠ {hypothesizedMean}</div>
            </div>
          </div>

          {/* SAMPLING DISTRIBUTION & REJECTION REGIONS GRAPH */}
          <div className="border border-slate-200 rounded-xl bg-white p-6 space-y-6 shadow-sm">
            <div className="text-center">
              <h4 className="font-bold text-lg text-slate-800">Sampling Distribution & Rejection Regions</h4>
              <p className="text-xs text-slate-500 mt-1">Standardized academic visualization of hypothesis testing (t-distribution approximation).</p>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={distCurveData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis 
                    dataKey="z" 
                    type="number" 
                    domain={[-4, 4]} 
                    ticks={[-4, -3, -2, -1, 0, 1, 2, 3, 4]}
                    tick={{ fontSize: 11 }}
                    label={{ value: 't value', position: 'bottom', fontSize: 12, fontWeight: 'bold', offset: 0 }} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ stroke: '#94A3B8', strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                    labelFormatter={(val) => `t = ${val}`}
                    formatter={(val) => [val, 'Density']}
                  />
                  
                  {/* Non-Rejection Region */}
                  <Area type="monotone" dataKey="nonRejection" stroke="#6366F1" fill="#EEF2FF" strokeWidth={2} connectNulls={false} isAnimationActive={false} />
                  
                  {/* Left Rejection Region */}
                  <Area type="monotone" dataKey="rejectionLeft" stroke="#EF4444" fill="#FEF2F2" strokeWidth={2} fillOpacity={0.8} connectNulls={false} isAnimationActive={false} />
                  
                  {/* Right Rejection Region */}
                  <Area type="monotone" dataKey="rejectionRight" stroke="#EF4444" fill="#FEF2F2" strokeWidth={2} fillOpacity={0.8} connectNulls={false} isAnimationActive={false} />

                  {/* Left Critical Boundary */}
                  <ReferenceLine x={-meanTestRes.criticalValue} stroke="#EF4444" strokeDasharray="4 4" label={{ value: `−t critical`, position: 'top', fill: '#EF4444', fontSize: 11, fontWeight: 'bold' }} />
                  
                  {/* Right Critical Boundary */}
                  <ReferenceLine x={meanTestRes.criticalValue} stroke="#EF4444" strokeDasharray="4 4" label={{ value: `+t critical`, position: 'top', fill: '#EF4444', fontSize: 11, fontWeight: 'bold' }} />
                  
                  {/* Test Statistic Marker */}
                  <ReferenceLine x={displayTestStat} stroke="#10B981" strokeWidth={2.5} label={{ value: testStatLabel, position: 'top', fill: '#10B981', fontSize: 11, fontWeight: 'bold' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider px-8 text-rose-500">
              <span className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-md shadow-sm">Reject H₀</span>
              <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-md shadow-sm">Do Not Reject H₀</span>
              <span className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-md shadow-sm">Reject H₀</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Test Statistic:</span>
                <span className="font-bold text-slate-800">{meanTestRes.testStatistic}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Critical Region:</span>
                <span className="font-bold text-slate-800">t &lt; -{meanTestRes.criticalValue} or t &gt; +{meanTestRes.criticalValue}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">p-value:</span>
                <span className="font-bold text-slate-800">{meanTestRes.pValue < 0.001 ? '< 0.001' : meanTestRes.pValue}</span>
              </div>
              <div className="flex justify-between font-mono border-b pb-3 mb-2">
                <span className="text-slate-500">Decision:</span>
                <span className={`font-bold ${meanTestRes.rejectNull ? 'text-rose-600' : 'text-emerald-600'}`}>{meanTestRes.rejectNull ? 'Reject H₀' : 'Fail to Reject H₀'}</span>
              </div>
              <div className="text-center pt-2 font-medium text-slate-700 italic">
                {meanTestRes.rejectNull 
                  ? "Since the test statistic lies beyond the critical value, it falls in the rejection region. Therefore, we reject H₀."
                  : "Since the test statistic lies within the non-rejection region, we do not reject H₀."}
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border text-xs font-bold text-center ${meanTestRes.rejectNull ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
            Decision: {meanTestRes.decision} (p-value = {meanTestRes.pValue} {meanTestRes.rejectNull ? '<' : '>'} α = {alpha})
          </div>
        </div>
      </FormulaCard>

      {/* TYPE I AND TYPE II ERRORS EXPLANATION MATRIX */}
      <FormulaCard
        conceptTitle="Type I & Type II Error Decision Matrix"
        moduleBadge="MODULE VII"
        formula="α = P(Reject H₀ | H₀ is True) ,  β = P(Fail to Reject H₀ | H₀ is False)"
        formulaDescription="Academic error matrix explaining decision outcomes in statistical inference."
        results={[
          { label: 'Significance α (Type I)', value: alpha, highlight: true },
          { label: 'Confidence (1 - α)', value: `${(1 - alpha) * 100}%` }
        ]}
        interpretation="Lowering significance α reduces Type I false positive risk but increases Type II false negative risk."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 font-bold uppercase text-slate-700">
              <tr>
                <th className="px-4 py-2 text-left">Decision / True State</th>
                <th className="px-4 py-2 bg-emerald-50 text-emerald-900">H₀ is True</th>
                <th className="px-4 py-2 bg-rose-50 text-rose-900">H₀ is False</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="px-4 py-3 text-left font-bold bg-slate-50">Reject H₀</td>
                <td className="px-4 py-3 bg-rose-100/60 text-rose-900 font-bold">Type I Error (α = {alpha})</td>
                <td className="px-4 py-3 bg-emerald-100/60 text-emerald-900 font-bold">Correct Decision (Power = 1 - β)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-left font-bold bg-slate-50">Fail to Reject H₀</td>
                <td className="px-4 py-3 bg-emerald-100/60 text-emerald-900 font-bold">Correct Decision (Confidence = 1 - α)</td>
                <td className="px-4 py-3 bg-rose-100/60 text-rose-900 font-bold">Type II Error (β Risk)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FormulaCard>


    </div>
  );
};
