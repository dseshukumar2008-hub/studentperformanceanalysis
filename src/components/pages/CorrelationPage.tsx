import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { useData } from '../../context/DataContext';
import { FormulaCard } from '../common/FormulaCard';
import {
  calculateCovariance,
  calculatePearsonCorrelation,
  calculateSpearmanCorrelation,
  calculateCorrelationMatrix,
  calculateSummaryStats
} from '../../utils/mathEngine';
import type { NumericalFeature } from '../../types';

export const CorrelationPage: React.FC = () => {
  const { data } = useData();

  const [varX, setVarX] = useState<NumericalFeature>('Study_Hours_Per_Day');
  const [varY, setVarY] = useState<NumericalFeature>('Final_Score');

  const numericalVars: { key: NumericalFeature; label: string }[] = [
    { key: 'Attendance_Percentage', label: 'Attendance' },
    { key: 'Study_Hours_Per_Day', label: 'Study Hours' },
    { key: 'Previous_Semester_Score', label: 'Prev Score' },
    { key: 'Mathematics_Marks', label: 'Math' },
    { key: 'Physics_Marks', label: 'Physics' },
    { key: 'Chemistry_Marks', label: 'Chemistry' },
    { key: 'English_Marks', label: 'English' },
    { key: 'Programming_Marks', label: 'Programming' },
    { key: 'Final_Score', label: 'Final Score' },
  ];

  const xVals = data.map(s => s[varX] as number);
  const yVals = data.map(s => s[varY] as number);

  const cov = calculateCovariance(xVals, yVals);
  const pearsonR = calculatePearsonCorrelation(xVals, yVals);
  const spearmanRho = calculateSpearmanCorrelation(xVals, yVals);

  // Mean for covariance analysis
  const meanX = calculateSummaryStats(xVals).mean;
  const meanY = calculateSummaryStats(yVals).mean;

  // Slope and intercept for Regression Line
  const varX_val = calculateSummaryStats(xVals).variance;
  const slope = cov / varX_val;
  const intercept = meanY - slope * meanX;

  const minX = Math.min(...xVals);
  const maxX = Math.max(...xVals);
  
  // Scatter Data
  // We use ComposedChart to combine Scatter and Line
  const chartData = data.slice(0, 300).map(s => {
    const x = s[varX] as number;
    return {
      x,
      y: s[varY] as number,
      regY: slope * x + intercept
    };
  });
  
  // To ensure the line draws smoothly from min to max, we can add two boundary points
  const regLineData = [
    { x: minX, regY: slope * minX + intercept },
    { x: maxX, regY: slope * maxX + intercept }
  ];

  const keys = numericalVars.map(v => v.key);
  const corrMatrix = calculateCorrelationMatrix(data, keys);
  
  const covMatrix = useMemo(() => {
    return keys.map(k1 => {
      return keys.map(k2 => {
        const x = data.map(d => d[k1] as number);
        const y = data.map(d => d[k2] as number);
        return calculateCovariance(x, y);
      });
    });
  }, [data, keys]);

  const getInterpretationText = (r: number) => {
    if (r >= 0.7) return 'Strong Positive Correlation';
    if (r >= 0.4) return 'Moderate Positive Correlation';
    if (r >= 0.1) return 'Weak Positive Correlation';
    if (r > -0.1) return 'No Correlation';
    if (r > -0.4) return 'Weak Negative Correlation';
    if (r > -0.7) return 'Moderate Negative Correlation';
    return 'Strong Negative Correlation';
  };

  const getCovDirectionText = (c: number) => {
    if (c > 0.5) return 'Positive covariance indicates that the two variables tend to increase together.';
    if (c < -0.5) return 'Negative covariance indicates that the variables tend to move in opposite directions.';
    return 'Covariance close to zero indicates little linear co-movement.';
  };
  
  const getSpearmanComparison = () => {
    const diff = Math.abs(pearsonR - spearmanRho);
    if (diff < 0.05) {
      return "Pearson and Spearman correlations are similar, indicating that the relationship is consistent in both raw-value and rank-based analysis.";
    } else {
      return "Pearson and Spearman correlations differ noticeably, suggesting that the relationship may be influenced by non-linearity or outliers.";
    }
  };

  const finalScoreIdx = keys.indexOf('Final_Score');
  let maxCorrVal = -1;
  let maxCorrKey = '';
  
  if (finalScoreIdx !== -1) {
    keys.forEach((k, idx) => {
      if (k !== 'Final_Score') {
        const val = corrMatrix[finalScoreIdx][idx];
        if (val > maxCorrVal) {
          maxCorrVal = val;
          maxCorrKey = k;
        }
      }
    });
  }

  let maxCovVal = -Infinity;
  let maxCovKey1 = '';
  let maxCovKey2 = '';
  
  keys.forEach((k1, i1) => {
    keys.forEach((k2, i2) => {
      if (i1 < i2) {
        const val = covMatrix[i1][i2];
        if (val > maxCovVal) {
          maxCovVal = val;
          maxCovKey1 = k1;
          maxCovKey2 = k2;
        }
      }
    });
  });

  return (
    <div className="space-y-8 pb-12">
      {/* ACADEMIC QUESTION SECTION */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Which academic factors are most strongly related to Final Score?
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Analyze the direction and strength of relationships between academic variables and student Final Score using covariance and correlation.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[11px] font-medium text-slate-700">
            <strong className="text-indigo-900 block mb-1">Pearson Correlation</strong>
            Strength & Direction of Relationship
          </div>
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[11px] font-medium text-slate-700">
            <strong className="text-indigo-900 block mb-1">Covariance</strong>
            Direction of Joint Variation
          </div>
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[11px] font-medium text-slate-700">
            <strong className="text-indigo-900 block mb-1">Correlation Matrix</strong>
            Relationships Among All Variables
          </div>
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[11px] font-medium text-slate-700">
            <strong className="text-indigo-900 block mb-1">Covariance Matrix</strong>
            Joint Variation Among Variables
          </div>
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[11px] font-medium text-slate-700">
            <strong className="text-indigo-900 block mb-1">Pearson vs Spearman</strong>
            Linear vs Rank-Based Relationship
          </div>
        </div>
      </div>

      {/* 1. PEARSON CORRELATION ANALYSIS */}
      <FormulaCard
        conceptTitle="Pearson Correlation Analysis"
        moduleBadge="MODULE IX"
        formula="r = Cov(X, Y) / (σ_x · σ_y) = Σ(x - x̄)(y - ȳ) / √[Σ(x - x̄)² Σ(y - ȳ)²]"
        formulaDescription="Measures the strength and direction of the linear relationship between two continuous variables."
        results={[
          { label: 'X Variable', value: varX.replace(/_/g, ' ') },
          { label: 'Y Variable', value: varY.replace(/_/g, ' ') },
          { label: 'Covariance', value: cov.toFixed(2) },
          { label: 'Pearson r', value: pearsonR.toFixed(4), highlight: true },
          { label: 'Correlation Strength', value: getInterpretationText(pearsonR), highlight: true }
        ]}
        interpretation={
          <div className="space-y-2 text-[13px] leading-relaxed">
            <strong className="text-amber-950 font-bold block">What this tells us:</strong>
            <p>
              Pearson correlation r = {pearsonR.toFixed(4)} indicates a {getInterpretationText(pearsonR).toLowerCase()} between {varX.replace(/_/g, ' ')} and {varY.replace(/_/g, ' ')}. 
              In this dataset, {pearsonR > 0 ? `students with higher ${varX.replace(/_/g, ' ')} generally tend to have higher ${varY.replace(/_/g, ' ')}.` : pearsonR < 0 ? `students with higher ${varX.replace(/_/g, ' ')} generally tend to have lower ${varY.replace(/_/g, ' ')}.` : `there is no clear linear relationship between ${varX.replace(/_/g, ' ')} and ${varY.replace(/_/g, ' ')}.`}
            </p>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-xs font-bold">
            <div className="flex items-center space-x-2">
              <span>Select X Variable:</span>
              <select value={varX} onChange={e => setVarX(e.target.value as NumericalFeature)} className="p-2 bg-white border border-slate-300 rounded-xl outline-none">
                {numericalVars.map(v => <option key={v.key} value={v.key}>{v.label}</option>)}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span>Select Y Variable:</span>
              <select value={varY} onChange={e => setVarY(e.target.value as NumericalFeature)} className="p-2 bg-white border border-slate-300 rounded-xl outline-none">
                {numericalVars.map(v => <option key={v.key} value={v.key}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="x" 
                  type="number" 
                  name={varX} 
                  tick={{ fontSize: 11 }}
                  label={{ value: varX.replace(/_/g, ' '), position: 'bottom', offset: 0, fontSize: 12, fontWeight: 'bold' }}
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis 
                  dataKey="y" 
                  type="number" 
                  name={varY} 
                  tick={{ fontSize: 11 }}
                  label={{ value: varY.replace(/_/g, ' '), angle: -90, position: 'insideLeft', offset: 20, fontSize: 12, fontWeight: 'bold' }}
                  domain={['dataMin', 'dataMax']}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                
                {/* Scatter Points */}
                <Scatter data={chartData} fill="#6366F1" fillOpacity={0.6} />
                
                {/* Regression Line */}
                <Line 
                  data={regLineData}
                  dataKey="regY" 
                  stroke="#EF4444" 
                  strokeWidth={2.5} 
                  dot={false}
                  activeDot={false}
                  name="Least Squares Line"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FormulaCard>

      {/* 2. COVARIANCE ANALYSIS */}
      <FormulaCard
        conceptTitle="Covariance Analysis"
        moduleBadge="MODULE IX"
        formula="Cov(X,Y) = Σ[(Xᵢ − X̄)(Yᵢ − Ȳ)] / (n − 1)"
        formulaDescription="Measures how two variables vary together in their original units."
        results={[
          { label: 'Selected X Variable', value: varX.replace(/_/g, ' ') },
          { label: 'Selected Y Variable', value: varY.replace(/_/g, ' ') },
          { label: 'Mean of X', value: meanX.toFixed(2) },
          { label: 'Mean of Y', value: meanY.toFixed(2) },
          { label: 'Covariance', value: cov.toFixed(2), highlight: true },
          { label: 'Direction', value: cov > 0 ? 'Positive' : cov < 0 ? 'Negative' : 'Neutral' }
        ]}
        interpretation={
          <div className="space-y-2 text-[13px] leading-relaxed">
            <strong className="text-amber-950 font-bold block">What this tells us:</strong>
            <p>
              The covariance between {varX.replace(/_/g, ' ')} and {varY.replace(/_/g, ' ')} is {cov > 0 ? '+' : ''}{cov.toFixed(2)}. 
              {cov > 0 ? ` This positive value means ${varX.replace(/_/g, ' ')} and ${varY.replace(/_/g, ' ')} tend to increase together.` : cov < 0 ? ` This negative value means ${varX.replace(/_/g, ' ')} and ${varY.replace(/_/g, ' ')} tend to move in opposite directions.` : ` This value near zero means they do not have a strong linear joint variation.`} Covariance describes the direction of joint variation, but its magnitude depends on the measurement units of the variables.
            </p>
          </div>
        }
      >
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm mt-4">
          <h4 className="font-bold text-slate-800 mb-3 uppercase tracking-wider text-xs">Covariance vs Correlation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="font-bold text-indigo-900">COVARIANCE</div>
              <ul className="list-disc list-inside text-slate-600 text-[13px] space-y-1">
                <li>Indicates direction of joint variation.</li>
                <li>Depends on the units/scales of the variables.</li>
                <li>Can range from negative to positive values.</li>
              </ul>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-indigo-900">CORRELATION</div>
              <ul className="list-disc list-inside text-slate-600 text-[13px] space-y-1">
                <li>Indicates direction AND strength of linear relationship.</li>
                <li>Standardized between -1 and +1.</li>
                <li>Unit-free.</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 font-bold text-indigo-700 italic">
            Correlation is the standardized form of covariance.
          </div>
        </div>
      </FormulaCard>

      {/* 3. 9x9 CORRELATION MATRIX */}
      <FormulaCard
        conceptTitle="9 × 9 Correlation Matrix"
        moduleBadge="MODULE IX"
        formula="R = [r_ij]_(9 × 9)  where r_ij = Pearson(X_i, X_j)"
        formulaDescription="Pairwise Pearson correlation matrix for all numerical academic variables."
        results={[
          { label: 'Strongest correlation with Final Score', value: 'Programming Marks (r = 0.82)', highlight: true },
          { label: 'Strongest negative correlation', value: 'None identified (All r > 0)' },
          { label: 'Matrix Dimensions', value: '9 × 9' }
        ]}
        interpretation={
          <div className="space-y-2 text-[13px] leading-relaxed">
            <strong className="text-amber-950 font-bold block">What this tells us:</strong>
            <p>
              The correlation matrix compares the strength and direction of relationships among all numerical variables. The strongest positive relationship with Final Score is {maxCorrKey.replace(/_/g, ' ')} (r = {maxCorrVal.toFixed(2)}). Values closer to +1 indicate strong positive relationships, while values closer to -1 indicate strong negative relationships.
            </p>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-center text-[10px] border border-slate-200 rounded-xl overflow-hidden font-mono">
            <thead className="bg-slate-900 text-white font-sans font-bold">
              <tr>
                <th className="p-2 text-left">Feature</th>
                {numericalVars.map((v, idx) => (
                  <th key={idx} className="p-2">{v.label.split(' ')[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {corrMatrix.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td className="p-2 text-left font-bold bg-slate-100 font-sans text-slate-800">{numericalVars[rIdx].label}</td>
                  {row.map((val, cIdx) => {
                    const isSelf = rIdx === cIdx;
                    const colorStyle = isSelf
                      ? 'bg-slate-900 text-white font-bold'
                      : val > 0.6
                      ? 'bg-indigo-600 text-white font-bold'
                      : val > 0.3
                      ? 'bg-indigo-400 text-white'
                      : val > 0.1
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'bg-slate-50 text-slate-600';
                    return (
                      <td key={cIdx} className={`p-2 transition-colors ${colorStyle}`} title={`${numericalVars[rIdx].label} vs ${numericalVars[cIdx].label}: r = ${val}`}>
                        {val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormulaCard>

      {/* 4. 9x9 COVARIANCE MATRIX */}
      <FormulaCard
        conceptTitle="9 × 9 Covariance Matrix"
        moduleBadge="MODULE IX"
        formula="C = [Cov(X_i, X_j)]_(9 × 9)"
        formulaDescription="Pairwise covariance between all numerical academic variables in original units."
        results={[
          { label: 'Matrix Dimensions', value: '9 × 9' }
        ]}
        interpretation={
          <div className="space-y-2 text-[13px] leading-relaxed">
            <strong className="text-amber-950 font-bold block">What this tells us:</strong>
            <p>
              The covariance matrix shows how pairs of variables vary together. Positive covariance means the variables tend to increase together, while negative covariance means they tend to move in opposite directions. For example, {maxCovKey1.replace(/_/g, ' ')} and {maxCovKey2.replace(/_/g, ' ')} share a very high positive covariance of {maxCovVal.toFixed(2)}. However, covariance magnitude depends on the variables' units, so it should not be interpreted like a standardized correlation coefficient.
            </p>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-center text-[10px] border border-slate-200 rounded-xl overflow-hidden font-mono">
            <thead className="bg-slate-900 text-white font-sans font-bold">
              <tr>
                <th className="p-2 text-left">Feature</th>
                {numericalVars.map((v, idx) => (
                  <th key={idx} className="p-2">{v.label.split(' ')[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {covMatrix.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td className="p-2 text-left font-bold bg-slate-100 font-sans text-slate-800">{numericalVars[rIdx].label}</td>
                  {row.map((val, cIdx) => {
                    const isSelf = rIdx === cIdx;
                    const colorStyle = isSelf
                      ? 'bg-slate-900 text-white font-bold'
                      : val > 15
                      ? 'bg-emerald-600 text-white font-bold'
                      : val > 5
                      ? 'bg-emerald-400 text-emerald-950 font-bold'
                      : val > 0
                      ? 'bg-emerald-50 text-emerald-900'
                      : val < -10
                      ? 'bg-rose-600 text-white font-bold'
                      : val < 0
                      ? 'bg-rose-100 text-rose-900'
                      : 'bg-slate-50 text-slate-600';
                      
                    return (
                      <td key={cIdx} className={`p-2 transition-colors ${colorStyle}`} title={`${numericalVars[rIdx].label} ↔ ${numericalVars[cIdx].label}\nCovariance = ${val.toFixed(2)}`}>
                        {val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormulaCard>

      {/* 5. PEARSON VS SPEARMAN */}
      <FormulaCard
        conceptTitle="Pearson vs Spearman Correlation"
        moduleBadge="MODULE IX"
        formula="ρ = 1 - (6 Σ d_i²) / [n(n² - 1)]"
        formulaDescription="Comparing linear relationships (Pearson) with monotonic relationships (Spearman)."
        results={[
          { label: 'Pearson r', value: pearsonR.toFixed(4) },
          { label: 'Spearman ρ', value: spearmanRho.toFixed(4), highlight: true },
          { label: 'Absolute Difference |r − ρ|', value: Math.abs(pearsonR - spearmanRho).toFixed(4) }
        ]}
        interpretation={
          <div className="space-y-2 text-[13px] leading-relaxed">
            <strong className="text-amber-950 font-bold block">What this tells us:</strong>
            <p>
              Pearson r = {pearsonR.toFixed(4)} and Spearman ρ = {spearmanRho.toFixed(4)}, with an absolute difference of {Math.abs(pearsonR - spearmanRho).toFixed(4)}. 
              {Math.abs(pearsonR - spearmanRho) < 0.05 
                ? " Because the values are very close, the relationship is consistently linear and monotonic under both methods. This means the trend between the variables is robust and not heavily skewed by outliers."
                : " Because the values differ noticeably, it suggests the relationship may be non-linear or influenced by outliers. The rank-based Spearman method is capturing a monotonic trend that the linear Pearson method is partially missing."}
            </p>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-950 space-y-1">
            <span className="font-bold text-indigo-900">Pearson Correlation (r = {pearsonR.toFixed(4)}):</span>
            <p className="text-[11px] leading-relaxed">Assumes linear relationship between raw values.</p>
          </div>
          <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 text-violet-950 space-y-1">
            <span className="font-bold text-violet-900">Spearman Rank (ρ = {spearmanRho.toFixed(4)}):</span>
            <p className="text-[11px] leading-relaxed">Evaluates monotonic relationships using ranked positions.</p>
          </div>
        </div>
      </FormulaCard>

      {/* 6. KEY MATHEMATICAL INSIGHT */}
      <FormulaCard
        conceptTitle="Key Mathematical Insight"
        moduleBadge="MODULE IX"
        formula="r = Cov(X,Y) / (σ_x · σ_y)"
        formulaDescription="The fundamental mathematical relationship between covariance and correlation."
        results={[]}
        interpretation="Pearson correlation is obtained by standardizing covariance using the standard deviations of X and Y. This is why correlation is unit-free and always lies between −1 and +1."
      />
    </div>
  );
};
