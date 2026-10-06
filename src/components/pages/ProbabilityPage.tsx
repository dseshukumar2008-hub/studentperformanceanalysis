import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FormulaCard } from '../common/FormulaCard';
import { calculateProbabilityEvents, calculateBayesTheorem } from '../../utils/mathEngine';

export const ProbabilityPage: React.FC = () => {
  const { data } = useData();

  const [scoreThreshold, setScoreThreshold] = useState<number>(70);
  const [hoursThreshold, setHoursThreshold] = useState<number>(5);

  const eventA = (s: any) => s.Final_Score >= scoreThreshold;
  const eventB = (s: any) => s.Study_Hours_Per_Day >= hoursThreshold;

  const probRes = calculateProbabilityEvents(data, eventA, eventB);

  // Bayes calculation
  const bayesRes = calculateBayesTheorem(probRes.pA, probRes.pBgivenA, (probRes.countB - probRes.countAandB) / Math.max(1, data.length - probRes.countA));

  return (
    <div className="space-y-8 pb-12">
      {/* EVENT CONTROLS BAR */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Define Empirical Dataset Events:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
            <span className="text-indigo-900 font-bold">Event A: Final Score ≥ {scoreThreshold}</span>
            <div className="flex items-center space-x-3">
              <span>Threshold:</span>
              <input
                type="range" min="40" max="95" value={scoreThreshold}
                onChange={e => setScoreThreshold(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <span className="font-mono bg-white px-2 py-0.5 rounded border">{scoreThreshold}</span>
            </div>
          </div>

          <div className="p-4 bg-violet-50/60 rounded-xl border border-violet-100 space-y-2">
            <span className="text-violet-900 font-bold">Event B: Daily Study Hours ≥ {hoursThreshold} hrs</span>
            <div className="flex items-center space-x-3">
              <span>Threshold:</span>
              <input
                type="range" min="1" max="9" value={hoursThreshold}
                onChange={e => setHoursThreshold(Number(e.target.value))}
                className="w-full accent-violet-600"
              />
              <span className="font-mono bg-white px-2 py-0.5 rounded border">{hoursThreshold} hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* BASIC PROBABILITY */}
      <FormulaCard
        conceptTitle="Basic Axiomatic & Joint Probabilities"
        moduleBadge="MODULE II"
        formula="P(A ∪ B) = P(A) + P(B) - P(A ∩ B)"
        formulaDescription="Calculation of marginal, joint, and union event probabilities directly from sample counts."
        results={[
          { label: 'P(A) [High Score]', value: probRes.pA, highlight: true },
          { label: 'P(B) [High Study]', value: probRes.pB, highlight: true },
          { label: 'Joint P(A ∩ B)', value: probRes.pAandB, highlight: true },
          { label: 'Union P(A ∪ B)', value: probRes.pAorB },
          { label: 'Count n(A)', value: probRes.countA },
          { label: 'Count n(B)', value: probRes.countB },
          { label: 'Count n(A ∩ B)', value: probRes.countAandB },
          { label: 'Total Students (N)', value: probRes.countTotal }
        ]}
        interpretation={`Out of ${probRes.countTotal} students, ${probRes.countA} score ≥ ${scoreThreshold} (P(A) = ${probRes.pA}) and ${probRes.countB} study ≥ ${hoursThreshold} hrs (P(B) = ${probRes.pB}). The joint probability P(A ∩ B) is ${probRes.pAandB}.`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-4 bg-white rounded-xl border border-indigo-100">
            <div className="text-[10px] text-indigo-500 font-bold uppercase">n(A) Count</div>
            <div className="text-xl font-bold text-indigo-700 mt-1">{probRes.countA}</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-violet-100">
            <div className="text-[10px] text-violet-500 font-bold uppercase">n(B) Count</div>
            <div className="text-xl font-bold text-violet-700 mt-1">{probRes.countB}</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-emerald-100">
            <div className="text-[10px] text-emerald-500 font-bold uppercase">n(A ∩ B) Count</div>
            <div className="text-xl font-bold text-emerald-700 mt-1">{probRes.countAandB}</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-amber-100">
            <div className="text-[10px] text-amber-500 font-bold uppercase">Total Sample (N)</div>
            <div className="text-xl font-bold text-amber-700 mt-1">{probRes.countTotal}</div>
          </div>
        </div>
      </FormulaCard>

      {/* CONDITIONAL PROBABILITY */}
      <FormulaCard
        conceptTitle="Conditional Probability P(A | B)"
        moduleBadge="MODULE II"
        formula="P(A | B) = P(A ∩ B) / P(B) = n(A ∩ B) / n(B)"
        formulaDescription="Probability of student scoring high given that they study at least 5 hours per day."
        results={[
          { label: 'P(A | B) [Given Study ≥ 5]', value: probRes.pAgivenB, highlight: true },
          { label: 'P(B | A) [Given Score ≥ 70]', value: probRes.pBgivenA },
          { label: 'Unconditional P(A)', value: probRes.pA }
        ]}
        interpretation={`Given that a student studies ≥ ${hoursThreshold} hrs/day, the probability of achieving a score ≥ ${scoreThreshold} rises from the base rate P(A) = ${probRes.pA} to conditional P(A|B) = ${probRes.pAgivenB}.`}
      >
        <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span>P(A | B) Formula Breakdown:</span>
            <span className="text-indigo-400 font-bold">{probRes.countAandB} / {probRes.countB} = {probRes.pAgivenB}</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full" style={{ width: `${probRes.pAgivenB * 100}%` }} />
          </div>
        </div>
      </FormulaCard>

      {/* BAYES THEOREM */}
      <FormulaCard
        conceptTitle="Bayes' Theorem Demonstration"
        moduleBadge="MODULE II"
        formula="P(A | B) = [P(B | A) · P(A)] / P(B)"
        formulaDescription="Updating prior belief P(A) with likelihood P(B|A) to compute posterior probability P(A|B)."
        results={[
          { label: 'Prior P(A)', value: bayesRes.priorA },
          { label: 'Likelihood P(B | A)', value: bayesRes.likelihoodB_A },
          { label: 'Evidence P(B)', value: bayesRes.evidenceB },
          { label: 'Posterior P(A | B)', value: bayesRes.posteriorA_B, highlight: true }
        ]}
        interpretation={`Bayesian updating validates that prior probability P(A) = ${bayesRes.priorA} updates to posterior P(A|B) = ${bayesRes.posteriorA_B} upon observing evidence B.`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 bg-white border rounded-xl">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Prior P(A)</span>
            <div className="text-base font-bold text-slate-800 mt-1">{bayesRes.priorA}</div>
          </div>
          <div className="p-3 bg-white border rounded-xl">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Likelihood P(B|A)</span>
            <div className="text-base font-bold text-indigo-600 mt-1">{bayesRes.likelihoodB_A}</div>
          </div>
          <div className="p-3 bg-white border rounded-xl">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Evidence P(B)</span>
            <div className="text-base font-bold text-slate-800 mt-1">{bayesRes.evidenceB}</div>
          </div>
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
            <span className="text-indigo-200 font-bold uppercase text-[10px]">Posterior P(A|B)</span>
            <div className="text-base font-bold mt-1">{bayesRes.posteriorA_B}</div>
          </div>
        </div>
      </FormulaCard>

      {/* INDEPENDENT VS DEPENDENT EVENTS */}
      <FormulaCard
        conceptTitle="Independent vs Dependent Events Test"
        moduleBadge="MODULE II"
        formula="P(A ∩ B) = P(A) · P(B)  (If Independent)"
        formulaDescription="Testing whether performance event A and study event B are statistically independent."
        results={[
          { label: 'Joint P(A ∩ B)', value: probRes.pAandB, highlight: true },
          { label: 'Product P(A) · P(B)', value: probRes.productPA_PB },
          { label: 'Absolute Diff (|Δ|)', value: probRes.difference },
          { label: 'Statistical Classification', value: probRes.isIndependent ? 'Approximately Independent' : 'Statistically Dependent', highlight: true }
        ]}
        interpretation={`Because P(A ∩ B) = ${probRes.pAandB} differs significantly from P(A)P(B) = ${probRes.productPA_PB} (Δ = ${probRes.difference}), Events A and B are statistically dependent.`}
      >
        <div className={`p-4 rounded-xl border text-center font-bold text-sm ${probRes.isIndependent ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
          Event A (Score ≥ {scoreThreshold}) and Event B (Study Hours ≥ {hoursThreshold}) are {probRes.isIndependent ? 'Approximately Independent' : 'Statistically Dependent'}.
        </div>
      </FormulaCard>
    </div>
  );
};
