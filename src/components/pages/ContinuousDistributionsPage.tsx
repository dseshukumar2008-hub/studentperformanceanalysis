import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';
import { FormulaCard } from '../common/FormulaCard';
import {
  calculateSummaryStats,
  calculateNormalDistributionChart,
  generateContinuousDistributionsData
} from '../../utils/mathEngine';

export const ContinuousDistributionsPage: React.FC = () => {
  const { data } = useData();
  const [targetScore, setTargetScore] = useState<number>(75);

  const [uniformA, setUniformA] = useState<number>(40);
  const [uniformB, setUniformB] = useState<number>(90);
  const [expLambda, setExpLambda] = useState<number>(0.1);
  const [gammaK, setGammaK] = useState<number>(2);
  const [betaAlpha, setBetaAlpha] = useState<number>(2);

  const stats = calculateSummaryStats(data.map(s => s.Final_Score));
  const normData = calculateNormalDistributionChart(stats.mean, stats.stdDev, targetScore);

  const uniformPoints = generateContinuousDistributionsData('uniform', { a: uniformA, b: uniformB });
  const expPoints = generateContinuousDistributionsData('exponential', { lambda: expLambda });
  const gammaPoints = generateContinuousDistributionsData('gamma', { k: gammaK, theta: 2 });
  const betaPoints = generateContinuousDistributionsData('beta', { alpha: betaAlpha, beta: 5 });

  return (
    <div className="space-y-8 pb-12">


      {/* Z-SCORE TABLE CALCULATOR */}
      <FormulaCard
        conceptTitle="Z-Score Standard Normal Calculator"
        moduleBadge="MODULE V"
        formula="Z = (X - μ) / σ"
        formulaDescription="Standardizing continuous variables to Standard Normal Distribution N(0, 1)."
        results={[
          { label: 'Z-Score Formula', value: `(${targetScore} - ${stats.mean}) / ${stats.stdDev}` },
          { label: 'Standardized Z', value: normData.zScore, highlight: true },
          { label: 'Left-Tail P(Z ≤ z)', value: normData.pLess, highlight: true },
          { label: 'Right-Tail P(Z ≥ z)', value: normData.pGreater }
        ]}
        interpretation={`Standardization converts raw performance score X = ${targetScore} into Z = ${normData.zScore} standard deviations from the population mean.`}
      >
        <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2 text-xs font-mono">
          <div className="flex justify-between text-indigo-300">
            <span>Formula: Z = (X - μ) / σ</span>
            <span>({targetScore} - {stats.mean}) / {stats.stdDev} = {normData.zScore}</span>
          </div>
        </div>
      </FormulaCard>

      {/* UNIFORM DISTRIBUTION */}
      <FormulaCard
        conceptTitle="Continuous Uniform Distribution U(a, b)"
        moduleBadge="MODULE V"
        formula="f(x) = 1 / (b - a) ,  Mean = (a + b) / 2"
        formulaDescription="Constant probability density over a bounded numerical range [a, b]."
        results={[
          { label: 'Lower Bound (a)', value: uniformA },
          { label: 'Upper Bound (b)', value: uniformB },
          { label: 'Mean μ', value: ((uniformA + uniformB) / 2).toFixed(2), highlight: true },
          { label: 'Variance σ²', value: (Math.pow(uniformB - uniformA, 2) / 12).toFixed(2) }
        ]}
        interpretation={`In a uniform distribution U(${uniformA}, ${uniformB}), every equal sub-interval has an identical probability density of ${ (1 / (uniformB - uniformA)).toFixed(4)}.`}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <span>Bound a:</span>
            <input type="range" min="10" max="50" value={uniformA} onChange={e => setUniformA(Number(e.target.value))} className="w-32 accent-indigo-600" />
            <span>Bound b:</span>
            <input type="range" min="60" max="100" value={uniformB} onChange={e => setUniformB(Number(e.target.value))} className="w-32 accent-indigo-600" />
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={uniformPoints} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="x" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Area type="stepAfter" dataKey="pdf" stroke="#10B981" fill="#10B981" fillOpacity={0.3} strokeWidth={2} name="PDF" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FormulaCard>

      {/* EXPONENTIAL DISTRIBUTION */}
      <FormulaCard
        conceptTitle="Exponential Distribution Exp(λ)"
        moduleBadge="MODULE V"
        formula="f(x) = λ · e^(-λx) ,  Mean = 1 / λ"
        formulaDescription="Models waiting times and study session interval durations."
        results={[
          { label: 'Rate λ', value: expLambda, highlight: true },
          { label: 'Mean Waiting Time (1/λ)', value: (1 / expLambda).toFixed(2), highlight: true },
          { label: 'Variance (1/λ²)', value: (1 / (expLambda * expLambda)).toFixed(2) }
        ]}
        interpretation={`The exponential distribution models continuous waiting intervals with an average waiting time of ${(1 / expLambda).toFixed(2)} units.`}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span>Rate Parameter (λ = {expLambda}):</span>
            <input type="range" min="0.05" max="0.5" step="0.05" value={expLambda} onChange={e => setExpLambda(Number(e.target.value))} className="w-48 accent-indigo-600" />
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expPoints} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="x" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="pdf" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} strokeWidth={2} name="PDF" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FormulaCard>

      {/* GAMMA & BETA DISTRIBUTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormulaCard
          conceptTitle="Gamma Distribution"
          moduleBadge="MODULE V"
          formula="f(x) = (x^(k-1) · e^(-x/θ)) / (θ^k · Γ(k))"
          formulaDescription="Generalization of exponential distribution for sum of k waiting times."
          results={[{ label: 'Shape (k)', value: gammaK, highlight: true }]}
          interpretation="Gamma modeling flexibly handles positively skewed waiting distributions."
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <span>Shape (k = {gammaK}):</span>
              <input type="range" min="1" max="5" value={gammaK} onChange={e => setGammaK(Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gammaPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="x" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Area type="monotone" dataKey="pdf" stroke="#EC4899" fill="#EC4899" fillOpacity={0.3} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </FormulaCard>

        <FormulaCard
          conceptTitle="Beta Distribution"
          moduleBadge="MODULE V"
          formula="f(x) = (x^(α-1) · (1-x)^(β-1)) / B(α, β)"
          formulaDescription="Bounded continuous distribution on interval [0, 1] for proportions."
          results={[{ label: 'Shape (α)', value: betaAlpha, highlight: true }]}
          interpretation="Beta distribution models student pass probabilities and completion proportions."
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <span>Shape (α = {betaAlpha}):</span>
              <input type="range" min="1" max="5" value={betaAlpha} onChange={e => setBetaAlpha(Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={betaPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="x" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Area type="monotone" dataKey="pdf" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </FormulaCard>
      </div>
    </div>
  );
};
