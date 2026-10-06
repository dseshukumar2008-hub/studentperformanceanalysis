import React, { useState } from 'react';
import { BrainCircuit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useData } from '../../context/DataContext';
import { FormulaCard } from '../common/FormulaCard';
import { fitMultipleLinearRegression, predictStudentScore } from '../../utils/mathEngine';

export const PredictionPage: React.FC = () => {
  const { data } = useData();
  const multipleModel = fitMultipleLinearRegression(data);

  const [inputs, setInputs] = useState<Record<string, number>>({
    Attendance_Percentage: 88,
    Study_Hours_Per_Day: 6.5,
    Previous_Semester_Score: 78,
    Mathematics_Marks: 82,
    Physics_Marks: 75,
    Chemistry_Marks: 76,
    English_Marks: 80,
    Programming_Marks: 85
  });

  const [prediction, setPrediction] = useState(predictStudentScore(inputs, multipleModel));

  const handleInputChange = (field: string, val: number) => {
    const updated = { ...inputs, [field]: val };
    setInputs(updated);
  };

  const handlePredict = () => {
    const res = predictStudentScore(inputs, multipleModel);
    setPrediction(res);
  };

  const categoryStyles = {
    Excellent: 'bg-emerald-500 text-white shadow-emerald-500/30',
    Good: 'bg-indigo-600 text-white shadow-indigo-600/30',
    Average: 'bg-amber-500 text-white shadow-amber-500/30',
    'Needs Improvement': 'bg-rose-500 text-white shadow-rose-500/30'
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white border border-indigo-800/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            <span>AI & Multiple Regression Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Student Final Score Predictor</h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Input student attendance, daily study hours, previous GPA, and subject scores to forecast the predicted Final_Score using OLS matrix regression.
          </p>
        </div>

        <div className="p-6 bg-slate-900/90 rounded-2xl border border-indigo-500/30 text-center min-w-[220px] shadow-2xl backdrop-blur-md">
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">Forecasted Final Score</span>
          <div className="text-4xl font-extrabold text-white mt-1">
            {prediction.predictedScore} <span className="text-sm text-slate-400">/ 100</span>
          </div>
          <div className="mt-2 inline-block">
            <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg ${categoryStyles[prediction.category as keyof typeof categoryStyles] || 'bg-slate-500 text-white shadow-slate-500/30'}`}>
              {prediction.category}
            </span>
          </div>
        </div>
      </div>

      {/* INPUT SLIDERS FORM */}
      <FormulaCard
        conceptTitle="Interactive Academic Input Parameters"
        moduleBadge="PREDICTOR"
        formula="ŷ = β₀ + β₁·Att + β₂·Study + β₃·Prev + Σ β_j·Subject_j"
        formulaDescription="Adjust feature values to compute dynamic predictions in real time."
        results={[
          { label: 'Predicted Score', value: `${prediction.predictedScore} / 100`, highlight: true },
          { label: 'Performance Rank', value: prediction.category, highlight: true }
        ]}
        interpretation={`Dynamic regression evaluation predicts a Final_Score of ${prediction.predictedScore}, placing the student in the ${prediction.category} academic tier.`}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
            <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
              <div className="flex justify-between">
                <span>Attendance %:</span>
                <span className="font-mono text-indigo-700 font-bold">{inputs.Attendance_Percentage}%</span>
              </div>
              <input type="range" min="50" max="100" value={inputs.Attendance_Percentage} onChange={e => handleInputChange('Attendance_Percentage', Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
              <div className="flex justify-between">
                <span>Study Hours / Day:</span>
                <span className="font-mono text-indigo-700 font-bold">{inputs.Study_Hours_Per_Day} hrs</span>
              </div>
              <input type="range" min="1" max="10" step="0.5" value={inputs.Study_Hours_Per_Day} onChange={e => handleInputChange('Study_Hours_Per_Day', Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
              <div className="flex justify-between">
                <span>Previous Score:</span>
                <span className="font-mono text-indigo-700 font-bold">{inputs.Previous_Semester_Score}</span>
              </div>
              <input type="range" min="40" max="100" value={inputs.Previous_Semester_Score} onChange={e => handleInputChange('Previous_Semester_Score', Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
              <div className="flex justify-between">
                <span>Mathematics Marks:</span>
                <span className="font-mono text-indigo-700 font-bold">{inputs.Mathematics_Marks}</span>
              </div>
              <input type="range" min="30" max="100" value={inputs.Mathematics_Marks} onChange={e => handleInputChange('Mathematics_Marks', Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
              <div className="flex justify-between">
                <span>Physics Marks:</span>
                <span className="font-mono text-indigo-700 font-bold">{inputs.Physics_Marks}</span>
              </div>
              <input type="range" min="30" max="100" value={inputs.Physics_Marks} onChange={e => handleInputChange('Physics_Marks', Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
              <div className="flex justify-between">
                <span>Chemistry Marks:</span>
                <span className="font-mono text-indigo-700 font-bold">{inputs.Chemistry_Marks}</span>
              </div>
              <input type="range" min="30" max="100" value={inputs.Chemistry_Marks} onChange={e => handleInputChange('Chemistry_Marks', Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
              <div className="flex justify-between">
                <span>English Marks:</span>
                <span className="font-mono text-indigo-700 font-bold">{inputs.English_Marks}</span>
              </div>
              <input type="range" min="30" max="100" value={inputs.English_Marks} onChange={e => handleInputChange('English_Marks', Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
              <div className="flex justify-between">
                <span>Programming Marks:</span>
                <span className="font-mono text-indigo-700 font-bold">{inputs.Programming_Marks}</span>
              </div>
              <input type="range" min="30" max="100" value={inputs.Programming_Marks} onChange={e => handleInputChange('Programming_Marks', Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handlePredict}
              className="flex items-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition transform hover:scale-[1.02]"
            >
              <BrainCircuit className="w-5 h-5" />
              <span>Predict Final Score</span>
            </button>
          </div>
        </div>
      </FormulaCard>

      {/* FEATURE CONTRIBUTION BREAKDOWN */}
      <FormulaCard
        conceptTitle="Feature Contribution & Impact Breakdown"
        moduleBadge="EXPLAINABILITY"
        formula="Impact_j = β_j · X_j"
        formulaDescription="Breakdown of individual point contributions added by each input feature."
        results={[
          { label: 'Highest Contributor', value: `${prediction.featureContributions[0]?.feature || ''} (+${prediction.featureContributions[0]?.impact || 0} pts)`, highlight: true }
        ]}
        interpretation={(() => {
          const score = prediction.predictedScore;
          let perfLevel = 'Needs Improvement';
          if (score >= 90) perfLevel = 'Outstanding';
          else if (score >= 80) perfLevel = 'Excellent';
          else if (score >= 70) perfLevel = 'Good';
          else if (score >= 60) perfLevel = 'Average';
          else if (score >= 50) perfLevel = 'Below Average';
          
          const sortedContribs = [...prediction.featureContributions].sort((a, b) => b.impact - a.impact);
          const top1 = sortedContribs[0] || { feature: '', impact: 0 };
          const top2 = sortedContribs[1] || { feature: '', impact: 0 };
          const lowest = sortedContribs[sortedContribs.length - 1] || { feature: '', impact: 0 };

          const formatName = (name: string) => name.replace('_Marks', '').replace(/_/g, ' ');

          return (
            <div className="space-y-4 text-[13px] leading-relaxed mt-2">
              <h4 className="font-bold text-amber-950 uppercase tracking-wider text-xs border-b border-amber-900/10 pb-1">Final Prediction Interpretation</h4>
              
              <div className="space-y-1">
                <strong className="text-amber-950 block">Predicted Score:</strong>
                <div className="text-amber-900">{score} / 100</div>
              </div>

              <div className="space-y-1">
                <strong className="text-amber-950 block">Performance Level:</strong>
                <div className="text-amber-900 font-bold">{perfLevel}</div>
              </div>

              <div className="space-y-1">
                <strong className="text-amber-950 block">Academic Interpretation:</strong>
                <div className="text-amber-900">
                  The prediction is based on the student's attendance, study hours, previous academic performance, and subject-wise marks. The current profile shows particularly strong performance in {formatName(top1.feature)} and {formatName(top2.feature)}, which contributes positively to the predicted outcome.
                </div>
              </div>

              <div className="space-y-1">
                <strong className="text-amber-950 block">Key Contributing Factors:</strong>
                <ul className="list-disc pl-4 text-amber-900 space-y-0.5">
                  {sortedContribs.slice(0, 3).map((fc, idx) => (
                    <li key={idx}>
                      {formatName(fc.feature)}: +{fc.impact}
                    </li>
                  ))}
                </ul>
                <div className="text-amber-900 pt-1">
                  {formatName(lowest.feature)} has the smallest estimated contribution among the displayed features (+{lowest.impact} points).
                </div>
              </div>

              <div className="space-y-1">
                <strong className="text-amber-950 block">Final Conclusion:</strong>
                <div className="text-amber-900 space-y-2">
                  <p>Overall, the model forecasts an {perfLevel} academic performance for this student. The prediction is supported by the student's combined academic profile, with {formatName(top1.feature)} and {formatName(top2.feature)} providing the largest estimated contributions to the predicted score.</p>
                  <p className="italic text-amber-950/80 text-xs">These feature contributions describe the model's estimated contribution to the prediction and should not be interpreted as proof of direct causation. The prediction should be interpreted as a model-based estimate rather than a guaranteed final result.</p>
                </div>
              </div>
            </div>
          );
        })()}
      >
        <div className="space-y-8">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-800">Feature Contribution to Final Score</h4>
            <p className="text-xs text-slate-500">Comparison of the estimated score contribution from each input feature.</p>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={prediction.featureContributions}
                  margin={{ top: 10, right: 50, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={true} vertical={true} />
                  <XAxis type="number" tick={{ fontSize: 10 }} hide />
                  <YAxis 
                    type="category" 
                    dataKey="feature" 
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} 
                    tickFormatter={(val) => val.replace('_Marks', '').replace('_', ' ')} 
                    width={110} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: '#F8FAFC'}} 
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }} 
                    formatter={(val: number) => [`+${val} pts`, 'Contribution']} 
                    labelFormatter={(val: string) => val.replace('_Marks', '').replace('_', ' ')} 
                  />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={20}>
                    <LabelList 
                      dataKey="impact" 
                      position="right" 
                      formatter={(val: number) => `+${val}`} 
                      style={{ fontSize: '11px', fontWeight: 'bold', fill: '#4F46E5' }} 
                    />
                    {prediction.featureContributions.map((_, idx) => (
                      <Cell key={idx} fill={idx === 0 ? '#4F46E5' : '#818CF8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prediction.featureContributions.map((fc, idx) => (
              <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800">{fc.feature.replace('_Marks', '').replace('_', ' ')}</span>
                <span className="font-mono text-emerald-600 font-bold">+{fc.impact} pts</span>
              </div>
            ))}
          </div>
        </div>
      </FormulaCard>
    </div>
  );
};
