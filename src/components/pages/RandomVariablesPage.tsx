import React, { useState } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';
import { FormulaCard } from '../common/FormulaCard';
import { calculateDiscreteRandomVariable, calculateSummaryStats, normalPDF } from '../../utils/mathEngine';
import type { NumericalFeature } from '../../types';

export const RandomVariablesPage: React.FC = () => {
  const { data } = useData();
  const [selectedVar, setSelectedVar] = useState<NumericalFeature>('Final_Score');

  const values = data.map(s => s[selectedVar] as number);
  const discreteRV = calculateDiscreteRandomVariable(values);
  const contStats = calculateSummaryStats(values);

  // Generate continuous PDF density points for chart
  const contPoints = [];
  const minX = contStats.min - 10;
  const maxX = contStats.max + 10;
  const step = (maxX - minX) / 60;
  for (let x = minX; x <= maxX; x += step) {
    contPoints.push({
      x: parseFloat(x.toFixed(1)),
      pdf: parseFloat(normalPDF(x, contStats.mean, contStats.stdDev).toFixed(5))
    });
  }

  return (
    <div className="space-y-8 pb-12">
      {/* VARIABLE SELECTOR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-500 uppercase">Select Random Variable X:</span>
          <select
            value={selectedVar}
            onChange={e => setSelectedVar(e.target.value as NumericalFeature)}
            className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-indigo-700"
          >
            <option value="Final_Score">Final Score (0–100)</option>
            <option value="Study_Hours_Per_Day">Study Hours (1–10)</option>
            <option value="Attendance_Percentage">Attendance Percentage (50–100)</option>
          </select>
        </div>
        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">
          X ~ Academic Metric
        </span>
      </div>

      {/* DISCRETE RANDOM VARIABLE DEMO */}
      <FormulaCard
        conceptTitle="Discrete Random Variable & Expectation E[X]"
        moduleBadge="MODULE III"
        formula="E[X] = Σ x_i · P(X = x_i) ,  Var(X) = Σ (x_i - E[X])² · P(X = x_i)"
        formulaDescription="Probability Mass Function (PMF) mapping discrete categories to probabilities."
        results={[
          { label: 'Expected Value E[X]', value: discreteRV.expectedValue, highlight: true },
          { label: 'Variance Var(X)', value: discreteRV.variance },
          { label: 'Std Dev σ(X)', value: discreteRV.stdDev, highlight: true }
        ]}
        interpretation={`The Expected Value E[X] = ${discreteRV.expectedValue} represents the long-run average value of the discrete random variable X with variance Var(X) = ${discreteRV.variance}.`}
      >
        <div className="space-y-6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={discreteRV.items} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="px" fill="#6366F1" radius={[8, 8, 0, 0]} name="P(X = x)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-600 uppercase">
                <tr>
                  <th className="px-3 py-2">Category Interval</th>
                  <th className="px-3 py-2">Representative x_i</th>
                  <th className="px-3 py-2">Frequency</th>
                  <th className="px-3 py-2">P(X = x_i)</th>
                  <th className="px-3 py-2">x_i · P(X = x_i)</th>
                  <th className="px-3 py-2">(x_i - E[X])² · P(X)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {discreteRV.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-bold text-indigo-700">{item.category}</td>
                    <td className="px-3 py-2 font-mono">{item.x}</td>
                    <td className="px-3 py-2">{item.frequency}</td>
                    <td className="px-3 py-2 font-bold">{item.px}</td>
                    <td className="px-3 py-2 font-mono text-slate-900">{item.xPx}</td>
                    <td className="px-3 py-2 font-mono text-slate-600">{item.xMinusMeanSquaredPx}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FormulaCard>

      {/* CONTINUOUS RANDOM VARIABLE DEMO */}
      <FormulaCard
        conceptTitle="Continuous Random Variable & Probability Density (PDF)"
        moduleBadge="MODULE III"
        formula="P(a ≤ X ≤ b) = ∫_a^b f(x) dx ,  ∫_-∞^∞ f(x) dx = 1"
        formulaDescription="Probability Density Function (PDF) concept for continuous student metrics."
        results={[
          { label: 'Continuous Mean (μ)', value: contStats.mean, highlight: true },
          { label: 'Continuous Variance (σ²)', value: contStats.variance },
          { label: 'Continuous Std Dev (σ)', value: contStats.stdDev, highlight: true }
        ]}
        interpretation={`For a continuous random variable X, the probability of taking an exact point value P(X = x) is zero. Probabilities are defined over intervals P(a ≤ X ≤ b) corresponding to the integral area under the density curve.`}
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={contPoints} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="x" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="pdf" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} strokeWidth={3} name="f(x) Density" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </FormulaCard>

      {/* COMPARISON CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
          <h4 className="font-bold text-sm text-indigo-700 flex items-center gap-2">Discrete Random Variables</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Takes countable discrete values $x_1, x_2, \dots$. Defined by Probability Mass Function $P(X=x)$. Probability at a single point can be greater than zero.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
          <h4 className="font-bold text-sm text-violet-700 flex items-center gap-2">Continuous Random Variables</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Takes uncountable values over a continuous range. Defined by Probability Density Function $f(x)$. Point probability $P(X=x) = 0$; probabilities exist over intervals.
          </p>
        </div>
      </div>
    </div>
  );
};
