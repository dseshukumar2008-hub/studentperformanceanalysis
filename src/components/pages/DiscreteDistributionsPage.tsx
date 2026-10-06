import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FormulaCard } from '../common/FormulaCard';
import { calculateBinomialDistribution, calculatePoissonDistribution } from '../../utils/mathEngine';

export const DiscreteDistributionsPage: React.FC = () => {
  const [binomN, setBinomN] = useState<number>(20);
  const [binomP, setBinomP] = useState<number>(0.35);
  const [highlightK, setHighlightK] = useState<number>(7);

  const [poissonLambda, setPoissonLambda] = useState<number>(4);

  const binomRes = calculateBinomialDistribution(binomN, binomP);
  const poissonRes = calculatePoissonDistribution(poissonLambda, 15);

  const highlightBinomProb = binomRes.data.find(d => d.k === highlightK)?.probability || 0;
  const highlightPoissonProb = poissonRes.data.find(d => d.k === highlightK)?.probability || 0;

  return (
    <div className="space-y-8 pb-12">
      {/* THEORETICAL DISCLAIMER BADGE */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded">Theoretical Simulation</span>
          <span>These probability models demonstrate exact mathematical formulas, separate from empirical dataset observations.</span>
        </div>
      </div>

      {/* BINOMIAL DISTRIBUTION */}
      <FormulaCard
        conceptTitle="Binomial Distribution B(n, p)"
        moduleBadge="MODULE IV"
        formula="P(X = k) = C(n, k) · p^k · (1 - p)^(n - k)"
        formulaDescription="Probability of observing exactly k successes in n independent Bernoulli trials with success probability p."
        results={[
          { label: 'Trials (n)', value: binomN },
          { label: 'Success Prob (p)', value: binomP },
          { label: 'Mean μ = np', value: binomRes.mean, highlight: true },
          { label: 'Variance σ² = np(1-p)', value: binomRes.variance },
          { label: 'Std Dev σ', value: binomRes.stdDev, highlight: true },
          { label: `P(X = ${highlightK})`, value: highlightBinomProb, highlight: true }
        ]}
        interpretation={`For n = ${binomN} trials and p = ${binomP}, the expected mean number of successes is μ = ${binomRes.mean} with a standard deviation of ${binomRes.stdDev}.`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="space-y-1">
              <span>Trials (n = {binomN}):</span>
              <input type="range" min="5" max="50" value={binomN} onChange={e => setBinomN(Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>
            <div className="space-y-1">
              <span>Probability (p = {binomP}):</span>
              <input type="range" min="0.05" max="0.95" step="0.05" value={binomP} onChange={e => setBinomP(Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>
            <div className="space-y-1">
              <span>Highlight Successes (k = {highlightK}):</span>
              <input type="range" min="0" max={binomN} value={highlightK} onChange={e => setHighlightK(Number(e.target.value))} className="w-full accent-violet-600" />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={binomRes.data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="k" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="probability" name="P(X = k)">
                  {binomRes.data.map((entry, idx) => (
                    <Cell key={idx} fill={entry.k === highlightK ? '#EC4899' : '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FormulaCard>

      {/* POISSON DISTRIBUTION */}
      <FormulaCard
        conceptTitle="Poisson Distribution P(λ)"
        moduleBadge="MODULE IV"
        formula="P(X = k) = (e^-λ · λ^k) / k!"
        formulaDescription="Models the count of rare educational occurrences over a fixed sampling space."
        results={[
          { label: 'Rate Parameter λ', value: poissonLambda, highlight: true },
          { label: 'Mean μ = λ', value: poissonRes.mean },
          { label: 'Variance σ² = λ', value: poissonRes.variance, highlight: true },
          { label: 'Std Dev σ = √λ', value: poissonRes.stdDev }
        ]}
        interpretation={`In a Poisson distribution with average rate λ = ${poissonLambda}, the mean and variance are equal (μ = σ² = ${poissonLambda}).`}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span>Adjust Average Rate (λ = {poissonLambda}):</span>
            <input type="range" min="1" max="12" step="0.5" value={poissonLambda} onChange={e => setPoissonLambda(Number(e.target.value))} className="w-48 accent-purple-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={poissonRes.data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="k" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="probability" fill="#8B5CF6" radius={[8, 8, 0, 0]} name="P(X = k)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FormulaCard>

      {/* BINOMIAL VS POISSON COMPARISON */}
      <FormulaCard
        conceptTitle="Binomial vs Poisson Approximation"
        moduleBadge="MODULE IV"
        formula="P(X=k)_{Binom} ≈ P(X=k)_{Poisson}  when n → ∞, p → 0, λ = np"
        formulaDescription="Poisson approximation to the Binomial distribution when n is large and p is small."
        results={[
          { label: 'Binom P(X=k)', value: highlightBinomProb },
          { label: 'Poisson Approx P(X=k)', value: highlightPoissonProb },
          { label: 'Approximation Error', value: Math.abs(highlightBinomProb - highlightPoissonProb).toFixed(5), highlight: true }
        ]}
        interpretation="When sample size n is large (n ≥ 20) and probability p is small (p ≤ 0.05), the Poisson distribution with λ = np provides a close, computationally efficient approximation to the Binomial distribution."
      >
        <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-950 font-medium">
          Comparison condition verified for λ = np = {(binomN * binomP).toFixed(2)}.
        </div>
      </FormulaCard>
    </div>
  );
};
