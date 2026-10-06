import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useData } from '../../context/DataContext';
import { FormulaCard } from '../common/FormulaCard';
import {
  fitSimpleLinearRegression,
  fitMultipleLinearRegression,
  fitPolynomialRegression
} from '../../utils/mathEngine';
import type { NumericalFeature } from '../../types';

export const RegressionPage: React.FC = () => {
  const { data } = useData();

  const [simplePredictor, setSimplePredictor] = useState<NumericalFeature>('Study_Hours_Per_Day');
  const [polyDegree, setPolyDegree] = useState<number>(2);

  const xVals = data.map(s => s[simplePredictor] as number);
  const yVals = data.map(s => s.Final_Score);

  const simpleRes = fitSimpleLinearRegression(xVals, yVals);
  const multipleRes = fitMultipleLinearRegression(data);
  const polyRes = fitPolynomialRegression(xVals, yVals, polyDegree);

  // Scatter data with fitted linear trendline
  const scatterData = data.slice(0, 200).map(s => {
    const x = s[simplePredictor] as number;
    const yPred = (simpleRes.intercept || 0) + (simpleRes.coefficients?.slope || 0) * x;
    return {
      x,
      y: s.Final_Score,
      yPred: parseFloat(yPred.toFixed(1))
    };
  }).sort((a, b) => a.x - b.x);

  // Feature Importance data for Multiple Linear Regression
  const featureImportance = Object.entries(multipleRes.coefficients || {}).map(([feat, coeff]) => ({
    feature: feat.replace('_Marks', '').replace('_Percentage', '').replace('_Per_Day', '').replace('_', ' '),
    coefficient: coeff
  })).sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));

  // Comparison table models
  const models = [
    { name: 'Simple Linear (Study Hours)', r2: simpleRes.r2, mae: simpleRes.mae, rmse: simpleRes.rmse },
    { name: 'Polynomial Deg 2 (Study Hours)', r2: fitPolynomialRegression(xVals, yVals, 2).r2, mae: fitPolynomialRegression(xVals, yVals, 2).mae, rmse: fitPolynomialRegression(xVals, yVals, 2).rmse },
    { name: 'Polynomial Deg 3 (Study Hours)', r2: fitPolynomialRegression(xVals, yVals, 3).r2, mae: fitPolynomialRegression(xVals, yVals, 3).mae, rmse: fitPolynomialRegression(xVals, yVals, 3).rmse },
    { name: 'Multiple Linear (All 8 Features)', r2: multipleRes.r2, mae: multipleRes.mae, rmse: multipleRes.rmse, isBest: true }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* SIMPLE LINEAR REGRESSION */}
      <FormulaCard
        conceptTitle="Simple Linear Regression"
        moduleBadge="MODULE X"
        formula="ŷ = β₀ + β₁x  where β₁ = Cov(X, Y) / Var(X) , β₀ = ȳ - β₁x̄"
        formulaDescription="Fits a straight line predicting Final_Score from a single independent feature."
        results={[
          { label: 'Regression Equation', value: simpleRes.equation, highlight: true },
          { label: 'R² (Coeff of Determination)', value: simpleRes.r2, highlight: true },
          { label: 'Mean Absolute Error (MAE)', value: simpleRes.mae },
          { label: 'Root Mean Sq Error (RMSE)', value: simpleRes.rmse }
        ]}
        interpretation={
          <div className="space-y-3 text-[13px] leading-relaxed">
            <div>
              <strong className="text-amber-950 font-bold block mb-1">Regression Equation:</strong>
              <span className="font-mono text-amber-900 bg-amber-100/50 px-2 py-0.5 rounded border border-amber-200/50">ŷ = {simpleRes.equation}</span>
            </div>
            <div>
              <strong className="text-amber-950 font-bold block mb-1">Interpretation:</strong>
              For every additional 1 unit of {simplePredictor.replace(/_/g, ' ')}, the predicted Final Score {(simpleRes.coefficients?.slope || 0) >= 0 ? 'increases' : 'decreases'} by approximately {Math.abs(simpleRes.coefficients?.slope || 0).toFixed(2)} marks, according to this linear regression model.
            </div>
            <div>
              The R² value of {simpleRes.r2} means that approximately {(simpleRes.r2 * 100).toFixed(2)}% of the variation in Final Score is explained by {simplePredictor.replace(/_/g, ' ')} in this model. The remaining {((1 - simpleRes.r2) * 100).toFixed(2)}% represents variation not explained by {simplePredictor.replace(/_/g, ' ')} alone and may be associated with other academic and individual factors.
            </div>
            <div>
              The MAE of {simpleRes.mae} indicates that the model's predictions differ from the actual Final Scores by approximately {simpleRes.mae} marks on average. The RMSE of {simpleRes.rmse} indicates the typical prediction error while giving greater weight to larger errors.
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span>Select Predictor Feature X:</span>
            <select
              value={simplePredictor}
              onChange={e => setSimplePredictor(e.target.value as NumericalFeature)}
              className="p-2 bg-white border border-slate-300 rounded-xl"
            >
              <option value="Study_Hours_Per_Day">Study Hours Per Day</option>
              <option value="Attendance_Percentage">Attendance Percentage</option>
              <option value="Previous_Semester_Score">Previous Semester Score</option>
              <option value="Mathematics_Marks">Mathematics Marks</option>
              <option value="Programming_Marks">Programming Marks</option>
            </select>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="x" type="number" name={simplePredictor} tick={{ fontSize: 10 }} />
                <YAxis dataKey="y" type="number" name="Final Score" tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                <Scatter name="Students" data={scatterData} fill="#4F46E5" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FormulaCard>

      {/* MULTIPLE LINEAR REGRESSION */}
      <FormulaCard
        conceptTitle="Multiple Linear Regression (All 8 Academic Predictors)"
        moduleBadge="MODULE X"
        formula="y = Xβ + ε  ⟹  β = (X^T X)^-1 X^T y"
        formulaDescription="Ordinary Least Squares (OLS) regression matrix fit using all academic features."
        results={[
          { label: 'Multiple R²', value: multipleRes.r2, highlight: true },
          { label: 'Adjusted R²', value: multipleRes.adjustedR2 ?? 0, highlight: true },
          { label: 'MAE', value: multipleRes.mae },
          { label: 'RMSE', value: multipleRes.rmse, highlight: true }
        ]}
        interpretation={`Multiple Linear Regression achieves R² = ${multipleRes.r2} (Adjusted R² = ${multipleRes.adjustedR2}), reducing RMSE to ${multipleRes.rmse}. All 8 academic features collectively explain ${(multipleRes.r2 * 100).toFixed(1)}% of score variation.`}
      >
        <div className="space-y-6">
          <div className="text-xs font-bold text-slate-500 uppercase">Regression Feature Coefficients (Importance Weight):</div>
          
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} margin={{ top: 10, right: 10, left: -10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="feature" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="coefficient" fill="#7C3AED" radius={[6, 6, 0, 0]} name="Beta Weight (β)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold uppercase text-slate-600">
                <tr>
                  <th className="px-3 py-2">Feature Name</th>
                  <th className="px-3 py-2">Beta Coefficient (β)</th>
                  <th className="px-3 py-2">Feature Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="bg-slate-50">
                  <td className="px-3 py-2 font-bold text-slate-900">Intercept (β₀)</td>
                  <td className="px-3 py-2 font-mono font-bold text-indigo-600">{multipleRes.intercept}</td>
                  <td className="px-3 py-2 text-slate-500">Baseline Constant Score</td>
                </tr>
                {featureImportance.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-bold text-slate-800">{item.feature}</td>
                    <td className="px-3 py-2 font-mono text-indigo-700 font-bold">+{item.coefficient}</td>
                    <td className="px-3 py-2 text-slate-600">+{item.coefficient} pts per unit increase</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FormulaCard>

      {/* POLYNOMIAL REGRESSION */}
      <FormulaCard
        conceptTitle="Polynomial Regression (Nonlinear Curves)"
        moduleBadge="MODULE X"
        formula="ŷ = β₀ + β₁x + β₂x² + ... + β_d x^d"
        formulaDescription="Fitting non-linear curves to capture non-linear academic returns."
        results={[
          { label: 'Polynomial Degree', value: `Degree ${polyDegree}`, highlight: true },
          { label: 'Polynomial R²', value: polyRes.r2, highlight: true },
          { label: 'Polynomial MAE', value: polyRes.mae },
          { label: 'Polynomial RMSE', value: polyRes.rmse }
        ]}
        interpretation={`Fitting a degree ${polyDegree} polynomial curve yields R² = ${polyRes.r2}. Polynomial terms model subtle non-linear academic returns.`}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span>Select Polynomial Degree:</span>
            {[2, 3, 4].map(deg => (
              <button
                key={deg}
                onClick={() => setPolyDegree(deg)}
                className={`px-3 py-1 rounded-xl font-bold transition ${polyDegree === deg ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-700'}`}
              >
                Degree {deg}
              </button>
            ))}
          </div>

          <div className="p-3 bg-slate-900 text-indigo-300 font-mono text-xs rounded-xl overflow-x-auto">
            Equation: {polyRes.equation}
          </div>
        </div>
      </FormulaCard>

      {/* MODEL COMPARISON TABLE */}
      <FormulaCard
        conceptTitle="Comprehensive Regression Model Comparison Table"
        moduleBadge="MODULE X"
        formula="Best Model ⟹ Maximize R² , Minimize MAE & RMSE"
        formulaDescription="Comparative performance benchmarking across all tested regression models."
        results={[
          { label: 'Best Performing Model', value: 'Multiple Linear Regression', highlight: true },
          { label: 'Highest R²', value: multipleRes.r2, highlight: true },
          { label: 'Lowest RMSE', value: multipleRes.rmse, highlight: true }
        ]}
        interpretation="Multiple Linear Regression outperforms single-variable models by capturing complementary contributions from study hours, attendance, and all subject marks."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-900 text-white font-bold uppercase">
              <tr>
                <th className="px-4 py-3">Regression Model Name</th>
                <th className="px-4 py-3">R² Score</th>
                <th className="px-4 py-3">MAE</th>
                <th className="px-4 py-3">RMSE</th>
                <th className="px-4 py-3">Evaluation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {models.map((m, idx) => (
                <tr key={idx} className={m.isBest ? 'bg-indigo-50/80 font-bold' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3 font-bold text-slate-900">{m.name}</td>
                  <td className="px-4 py-3 font-mono text-indigo-700 font-bold">{m.r2}</td>
                  <td className="px-4 py-3 font-mono">{m.mae}</td>
                  <td className="px-4 py-3 font-mono">{m.rmse}</td>
                  <td className="px-4 py-3">
                    {m.isBest ? (
                      <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px] uppercase shadow-sm">
                        Best Model ★
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Baseline</span>
                    )}
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
