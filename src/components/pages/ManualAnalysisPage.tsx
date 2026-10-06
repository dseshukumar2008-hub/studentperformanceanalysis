import React, { useState, useMemo } from 'react';
import { Activity, Trash2, Plus, Sparkles, CheckSquare, Square, Calculator } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, LabelList, Cell, ReferenceLine, Legend
} from 'recharts';
import { FormulaCard } from '../common/FormulaCard';
import {
  calculateMean, calculateMedian, calculateStdDev,
  calculatePearsonCorrelation, calculateCovariance, calculateCorrelationMatrix,
  fitSimpleLinearRegression, fitMultipleLinearRegression, predictStudentScore
} from '../../utils/mathEngine';
import { useData } from '../../context/DataContext';

interface ManualStudent {
  id: string;
  selected: boolean;
  Attendance_Percentage: string;
  Study_Hours_Per_Day: string;
  Previous_Semester_Score: string;
  Mathematics_Marks: string;
  Physics_Marks: string;
  Chemistry_Marks: string;
  English_Marks: string;
  Programming_Marks: string;
  Final_Score: string;
}

const initialStudent = (id: string): ManualStudent => ({
  id, selected: false,
  Attendance_Percentage: '', Study_Hours_Per_Day: '', Previous_Semester_Score: '',
  Mathematics_Marks: '', Physics_Marks: '', Chemistry_Marks: '', English_Marks: '',
  Programming_Marks: '', Final_Score: ''
});

const limits = {
  Attendance_Percentage: { min: 0, max: 100, label: 'Attendance', desc: '0-100%' },
  Study_Hours_Per_Day: { min: 0, max: 24, label: 'Study Hrs', desc: '0-24' },
  Previous_Semester_Score: { min: 0, max: 100, label: 'Prev Score', desc: '0-100' },
  Mathematics_Marks: { min: 0, max: 100, label: 'Math', desc: '0-100' },
  Physics_Marks: { min: 0, max: 100, label: 'Physics', desc: '0-100' },
  Chemistry_Marks: { min: 0, max: 100, label: 'Chemistry', desc: '0-100' },
  English_Marks: { min: 0, max: 100, label: 'English', desc: '0-100' },
  Programming_Marks: { min: 0, max: 100, label: 'Programming', desc: '0-100' },
  Final_Score: { min: 0, max: 100, label: 'Final Score', desc: '0-100 (Opt)' }
};

const keys = Object.keys(limits) as Array<keyof typeof limits>;
const requiredKeys = keys.filter(k => k !== 'Final_Score');

export const ManualAnalysisPage: React.FC = () => {
  const [students, setStudents] = useState<ManualStudent[]>([initialStudent('S001')]);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  
  // New Student Prediction State
  const [newStudent, setNewStudent] = useState<Record<string, string>>({
    Attendance_Percentage: '', Study_Hours_Per_Day: '', Previous_Semester_Score: '',
    Mathematics_Marks: '', Physics_Marks: '', Chemistry_Marks: '', English_Marks: '', Programming_Marks: ''
  });
  const [newPrediction, setNewPrediction] = useState<any | null>(null);

  const { data } = useData();
  const globalModel = useMemo(() => {
    if (!data || data.length === 0) return null;
    return fitMultipleLinearRegression(data as any);
  }, [data]);

  const handleUpdateStudent = (index: number, field: keyof ManualStudent, value: string) => {
    const updated = [...students];
    updated[index] = { ...updated[index], [field]: value };
    setStudents(updated);
    setAnalysisResult(null); // Clear analysis if data changes
  };

  const handleAddStudent = () => {
    const nextId = `S${String(students.length + 1).padStart(3, '0')}`;
    setStudents([...students, initialStudent(nextId)]);
  };

  const handleDeleteSelected = () => {
    setStudents(students.filter(s => !s.selected));
    setAnalysisResult(null);
  };

  const handleClearAll = () => {
    setStudents([initialStudent('S001')]);
    setAnalysisResult(null);
  };

  const toggleSelectAll = (checked: boolean) => {
    setStudents(students.map(s => ({ ...s, selected: checked })));
  };

  const validateValue = (key: keyof typeof limits, valStr: string, isRequired: boolean) => {
    if (!valStr.trim()) return isRequired ? false : true;
    const val = parseFloat(valStr);
    if (isNaN(val) || !Number.isFinite(val)) return false;
    const { min, max } = limits[key];
    return val >= min && val <= max;
  };

  const isRowValid = (s: ManualStudent) => {
    if (!s.id.trim()) return false;
    for (const key of requiredKeys) {
      if (!validateValue(key, s[key], true)) return false;
    }
    if (s.Final_Score.trim() && !validateValue('Final_Score', s.Final_Score, false)) return false;
    return true;
  };

  const validateAllRows = () => {
    const uniqueIds = new Set();
    for (const s of students) {
      if (!s.id.trim() || uniqueIds.has(s.id)) return false;
      uniqueIds.add(s.id);
      if (!isRowValid(s)) return false;
    }
    return true;
  };

  const allValid = validateAllRows();
  const validRecordsCount = students.filter(s => isRowValid(s) && !students.some(os => os !== s && os.id === s.id)).length;

  const handleAnalyze = () => {
    if (!allValid || validRecordsCount < 1) return;

    try {
      // Parse data safely
      const parsedData = students.map(s => {
        const data: any = { id: s.id };
        keys.forEach(k => {
          if (s[k].trim()) data[k] = Number(s[k]);
        });
        return data;
      });

      const finalScores = parsedData.filter(d => d.Final_Score !== undefined).map(d => d.Final_Score);
      const hasFinalScores = finalScores.length === parsedData.length && finalScores.length > 0;

      let singleStudentPred = null;
      if (parsedData.length === 1) {
         singleStudentPred = predictStudentScore(parsedData[0], globalModel);
      }

      let stats = null;
      if (hasFinalScores && parsedData.length >= 2) {
        stats = {
          total: finalScores.length,
          mean: calculateMean(finalScores),
          median: calculateMedian(finalScores),
          std: calculateStdDev(finalScores, true),
          max: Math.max(...finalScores),
          min: Math.min(...finalScores)
        };
      }

      const subjects = ['Mathematics_Marks', 'Physics_Marks', 'Chemistry_Marks', 'English_Marks', 'Programming_Marks'];
      let subjectStats = null;
      if (parsedData.length >= 2) {
        subjectStats = subjects.map(sub => {
          const vals = parsedData.map(d => d[sub]);
          return { subject: sub.split('_')[0], mean: calculateMean(vals) };
        }).sort((a, b) => b.mean - a.mean);
      }

      let correlations = [];
      let covariances = [];
      let multipleModel: any | null = null;
      let corrMatrix: any[] = [];

      if (hasFinalScores && parsedData.length >= 3) {
        correlations = requiredKeys.map(k => {
          const vals = parsedData.map(d => d[k]);
          const corr = calculatePearsonCorrelation(vals, finalScores);
          return { key: k, label: limits[k].label, corr: Number.isFinite(corr) ? corr : 0 };
        }).sort((a, b) => Math.abs(b.corr) - Math.abs(a.corr));

        covariances = requiredKeys.map(k => {
          const vals = parsedData.map(d => d[k]);
          const cov = calculateCovariance(vals, finalScores);
          return { key: k, label: limits[k].label, cov: Number.isFinite(cov) ? cov : 0 };
        }).sort((a, b) => b.cov - a.cov);
        
        const varsForMatrix = [...requiredKeys, 'Final_Score'];
        const matrixVals = varsForMatrix.map(k => parsedData.map(d => d[k]));
        const matrix = calculateCorrelationMatrix(matrixVals);
        
        corrMatrix = matrix.map((row, i) => {
          return row.map((val, j) => ({
            x: limits[varsForMatrix[j] as keyof typeof limits].label,
            y: limits[varsForMatrix[i] as keyof typeof limits].label,
            val: Number.isFinite(val) ? parseFloat(val.toFixed(2)) : 0
          }));
        });
      }

      if (hasFinalScores && parsedData.length > requiredKeys.length + 1) {
         multipleModel = fitMultipleLinearRegression(parsedData);
      }

      setAnalysisResult({
        parsedData,
        hasFinalScores,
        stats,
        subjectStats,
        correlations,
        covariances,
        multipleModel,
        corrMatrix,
        singleStudentPred,
        isSingle: parsedData.length === 1
      });
    } catch (err) {
      console.error("Runtime error during manual analysis:", err);
      setAnalysisResult({ error: "Unable to analyze the entered data. Please check that all required values are valid and within the allowed ranges." });
    }
  };

  const handlePredictNew = () => {
    if (!analysisResult?.multipleModel) return;
    for (const key of requiredKeys) {
      if (!validateValue(key, newStudent[key], true)) return;
    }
    const parsed: any = {};
    requiredKeys.forEach(k => { parsed[k] = parseFloat(newStudent[k]); });
    setNewPrediction(predictStudentScore(parsed, analysisResult.multipleModel));
  };

  const formatName = (name: any) => {
    if (!name || typeof name !== 'string') return '';
    return name.replace('_Marks', '').replace(/_/g, ' ');
  };

  const isAllSelected = students.length > 0 && students.every(s => s.selected);

  return (
    <div className="space-y-10 pb-16">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white border border-indigo-800/40 shadow-xl">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Manual Student Analysis</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Manual Student Dataset</h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Enter academic data for multiple students. Each row represents one student. The entered records will be used exclusively for statistical analysis, correlation, covariance, regression and prediction on this page.
          </p>
        </div>
      </div>

      {/* DATA ENTRY LIMITS */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900 shadow-sm">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          Data Entry Limits
        </h3>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-medium">
          <li>• Attendance: 0–100%</li>
          <li>• Study Hours: 0–24 hours/day</li>
          <li>• Subject Marks: 0–100</li>
          <li>• Previous Semester Score: 0–100</li>
          <li>• Final Score: 0–100</li>
        </ul>
      </div>

      {/* MANUAL DATASET BUILDER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm overflow-hidden flex flex-col space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-slate-900">Manual Student Dataset</h3>
          <div className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
            Manual Records: {students.length}
          </div>
        </div>
        
        {/* TABLE */}
        <div className="overflow-x-auto pb-4 custom-scrollbar rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 w-10 text-center sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                  <button onClick={() => toggleSelectAll(!isAllSelected)} className="text-slate-400 hover:text-indigo-600">
                    {isAllSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="p-3 text-xs font-bold text-slate-700 min-w-[100px] border-r border-slate-200">Student ID</th>
                {keys.map(k => (
                  <th key={k} className="p-3 text-xs font-bold text-slate-700 min-w-[120px] border-r border-slate-200">
                    {limits[k].label}
                    <div className="text-[9px] text-slate-400 font-normal mt-0.5">{limits[k].desc}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => {
                const isIdDup = students.some((s, idx) => s.id === student.id && idx !== i);
                return (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-2 text-center sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200">
                      <button onClick={() => handleUpdateStudent(i, 'selected', (!student.selected) as any)} className={student.selected ? "text-indigo-600" : "text-slate-300 hover:text-indigo-400"}>
                        {student.selected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="p-2 border-r border-slate-100 relative group">
                      <input type="text" value={student.id} onChange={e => handleUpdateStudent(i, 'id', e.target.value)}
                        className={`w-full p-2 bg-slate-50 border rounded text-xs font-semibold outline-none focus:border-indigo-500 ${!student.id.trim() || isIdDup ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200'}`} />
                      {(!student.id.trim() || isIdDup) && <div className="absolute top-full left-0 mt-1 z-50 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg">Student ID must be unique and not empty.</div>}
                    </td>
                    {keys.map(k => {
                      const isReq = k !== 'Final_Score';
                      const isValid = validateValue(k, student[k], isReq);
                      return (
                        <td key={k} className="p-2 border-r border-slate-100 relative group">
                          <input type="text" value={student[k]} onChange={e => handleUpdateStudent(i, k, e.target.value)}
                            className={`w-full p-2 bg-slate-50 border rounded text-xs font-semibold outline-none focus:border-indigo-500 ${!isValid ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200'}`} />
                          {!isValid && <div className="absolute top-full left-0 mt-1 z-50 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg">{limits[k].label} must be between {limits[k].min} and {limits[k].max}.</div>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handleAddStudent} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors">
              <Plus className="w-4 h-4" /> Add Student
            </button>
            <button onClick={handleDeleteSelected} disabled={!students.some(s => s.selected)} className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50 disabled:pointer-events-none rounded-lg text-xs font-bold transition-colors">
              <Trash2 className="w-4 h-4" /> Delete Selected
            </button>
            <button onClick={handleClearAll} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors">
              Clear All
            </button>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {!allValid && <span className="text-[11px] text-red-500 font-bold hidden sm:block">Please fix invalid cells (highlighted in red)</span>}
            <button 
              onClick={handleAnalyze} 
              disabled={!allValid || validRecordsCount < 1}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 rounded-xl text-sm font-bold shadow-sm transition-all"
            >
              <Calculator className="w-4 h-4" />
              Analyze Manual Dataset
            </button>
          </div>
        </div>
      </div>

      {/* ANALYSIS RESULTS */}
      {analysisResult && (
        <div className="space-y-10 animate-fade-in">
          <div className="flex items-center justify-center pt-4">
            <div className="px-6 py-2 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-800 text-xs font-bold shadow-sm flex items-center gap-2 uppercase tracking-wide">
              <Activity className="w-4 h-4 text-indigo-600" />
              Analysis Source: Manual Dataset
            </div>
          </div>

          {analysisResult.error ? (
            <div className="bg-rose-50 rounded-2xl p-6 border border-rose-200 shadow-sm">
              <h3 className="text-lg font-bold text-rose-900 mb-2">Analysis Error</h3>
              <p className="text-sm text-rose-700">{analysisResult.error}</p>
            </div>
          ) : analysisResult.isSingle ? (
            /* SINGLE STUDENT ANALYSIS */
            <div className="space-y-6">
              <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col space-y-4">
                <h3 className="text-lg font-bold text-indigo-950 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Individual Student Prediction
                </h3>
                <p className="text-sm text-indigo-800">
                  Using the global dataset's regression model to predict the Final Score for this individual manually entered student.
                </p>
                <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center shadow-inner">
                  <span className="font-bold text-sm text-indigo-300">Predicted Final Score:</span>
                  <span className="text-3xl font-extrabold">{analysisResult.singleStudentPred.predictedScore} <span className="text-sm font-normal text-slate-400">/ 100</span></span>
                </div>
                <div className="p-4 bg-white border border-indigo-100 rounded-xl">
                  <span className="font-bold text-sm text-slate-500">Performance Category: </span>
                  <span className="font-bold text-lg text-indigo-600 ml-2">{analysisResult.singleStudentPred.category}</span>
                </div>
              </div>
              
              <FormulaCard
                conceptTitle="Feature Contribution"
                moduleBadge="EXPLAINABILITY"
                formula="Contribution = β_j · X_student"
                formulaDescription="Estimated impact of each entered academic factor on the final prediction."
                results={[
                  { label: 'Top Contributor', value: formatName(analysisResult.singleStudentPred.featureContributions[0]?.feature || ''), highlight: true }
                ]}
                interpretation="Important: Do not interpret contribution as causation."
              >
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={analysisResult.singleStudentPred.featureContributions} margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#F1F5F9" />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="feature" tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} tickFormatter={formatName} width={100} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} formatter={(val: number) => [`+${val} pts`, 'Contribution']} labelFormatter={formatName} />
                      <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={16}>
                        <LabelList dataKey="impact" position="right" formatter={(val: number) => `+${val}`} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#4F46E5' }} />
                        {analysisResult.singleStudentPred.featureContributions.map((_: any, idx: number) => (
                          <Cell key={idx} fill={idx === 0 ? '#4F46E5' : '#94A3B8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </FormulaCard>

              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-amber-800 text-sm font-semibold text-center mt-6">
                Additional student records are required for Descriptive Statistics, Correlation, Covariance, and Manual Regression modeling. Please add more rows to the manual dataset.
              </div>
            </div>
          ) : (
            /* MULTIPLE STUDENTS ANALYSIS */
            <>
              {/* 1. DESCRIPTIVE STATISTICS */}
              {analysisResult.stats ? (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-900">Descriptive Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { label: 'Total Students', value: analysisResult.stats.total },
                      { label: 'Mean Final Score', value: analysisResult.stats.mean.toFixed(2) },
                      { label: 'Median Final Score', value: analysisResult.stats.median.toFixed(2) },
                      { label: 'Standard Deviation', value: analysisResult.stats.std.toFixed(2) },
                      { label: 'Highest Final Score', value: analysisResult.stats.max },
                      { label: 'Lowest Final Score', value: analysisResult.stats.min }
                    ].map(stat => (
                      <div key={stat.label} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center shadow-sm">
                        <div className="text-xl font-extrabold text-slate-800">{stat.value}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                 <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-amber-800 text-sm font-semibold text-center">
                   Descriptive statistics for Final Score are unavailable because Actual Final Score was not provided for all students.
                 </div>
              )}

              {/* 2. SUBJECT PERFORMANCE */}
              {analysisResult.subjectStats && (
                <FormulaCard
                  conceptTitle="Subject Performance"
                  moduleBadge="STATISTICS"
                  formula="Subject Averages"
                  formulaDescription="Average scores across the manually entered students."
                  results={[
                    { label: 'Highest Average', value: analysisResult.subjectStats[0].subject, highlight: true },
                    { label: 'Lowest Average', value: analysisResult.subjectStats[analysisResult.subjectStats.length-1].subject }
                  ]}
                  interpretation={`${analysisResult.subjectStats[0].subject} has the highest average score among the manually entered students.`}
                >
                  <div className="h-64 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysisResult.subjectStats} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="subject" type="category" width={90} tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} formatter={(val: number) => [`${val.toFixed(1)}`, 'Mean']} />
                        <Bar dataKey="mean" fill="#6366F1" barSize={20} radius={[0, 4, 4, 0]}>
                          <LabelList dataKey="mean" position="right" formatter={(v: number) => v.toFixed(1)} style={{ fontSize: '11px', fill: '#4F46E5', fontWeight: 'bold' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </FormulaCard>
              )}

              {analysisResult.correlations.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 3. CORRELATION ANALYSIS */}
                  <FormulaCard
                    conceptTitle="Correlation Analysis"
                    moduleBadge="CORRELATION"
                    formula="Correlation with Final Score"
                    formulaDescription="Pearson correlation between each factor and Final Score."
                    results={[
                      { label: 'Strongest Relationship', value: analysisResult.correlations[0]?.label || 'N/A', highlight: true }
                    ]}
                    interpretation={`${analysisResult.correlations[0]?.label || 'None'} has the strongest ${analysisResult.correlations[0]?.corr > 0 ? 'positive' : 'negative'} correlation with Final Score in the manually entered dataset.`}
                  >
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analysisResult.correlations} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                          <XAxis type="number" domain={[-1, 1]} tick={{ fontSize: 10 }} />
                          <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} />
                          <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px' }} formatter={(val: number) => [val.toFixed(3), 'r']} />
                          <Bar dataKey="corr" fill="#8B5CF6" barSize={14} radius={[0, 4, 4, 0]}>
                            <LabelList dataKey="corr" position="right" formatter={(v: number) => v.toFixed(2)} style={{ fontSize: '10px', fill: '#7C3AED', fontWeight: 'bold' }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </FormulaCard>

                  {/* 4. COVARIANCE ANALYSIS */}
                  <FormulaCard
                    conceptTitle="Covariance Analysis"
                    moduleBadge="COVARIANCE"
                    formula="Covariance with Final Score"
                    formulaDescription="Direction of joint variation with Final Score."
                    results={[
                      { label: 'Largest Covariance', value: analysisResult.covariances[0]?.label || 'N/A', highlight: true }
                    ]}
                    interpretation={`Positive covariance means variables tend to increase together. Negative means one increases while the other decreases.`}
                  >
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analysisResult.covariances} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} />
                          <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px' }} formatter={(val: number) => [val.toFixed(2), 'Covariance']} />
                          <Bar dataKey="cov" fill="#F43F5E" barSize={14} radius={[0, 4, 4, 0]}>
                            <LabelList dataKey="cov" position="right" formatter={(v: number) => v.toFixed(1)} style={{ fontSize: '10px', fill: '#E11D48', fontWeight: 'bold' }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </FormulaCard>
                </div>
              ) : (
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-amber-800 text-sm font-semibold text-center">
                  Additional student records (at least 3) are required for Correlation and Covariance Analysis.
                </div>
              )}

              {/* 5. CORRELATION HEATMAP */}
              {analysisResult.corrMatrix && analysisResult.corrMatrix.length > 0 && (
                <FormulaCard
                  conceptTitle="Correlation Heatmap"
                  moduleBadge="CORRELATION"
                  formula="Manual Dataset Matrix"
                  formulaDescription="Pairwise Pearson correlation coefficients among all variables."
                  results={[]}
                  interpretation="The heatmap shows the strength and direction of linear relationships between all pairs of academic factors in your manual dataset."
                >
                  <div className="w-full overflow-x-auto pb-4">
                    <div className="min-w-[600px] h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 100 }}>
                          <XAxis type="category" dataKey="x" interval={0} tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }} />
                          <YAxis type="category" dataKey="y" interval={0} tick={{ fontSize: 10 }} />
                          <ZAxis type="number" dataKey="val" range={[200, 200]} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                            formatter={(val: number, name: string, props: any) => [`r = ${props.payload.val.toFixed(3)}`, `${props.payload.y} vs ${props.payload.x}`]} 
                            contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                          />
                          <Scatter data={analysisResult.corrMatrix.flat()}>
                            {analysisResult.corrMatrix.flat().map((entry: any, index: number) => {
                              const val = entry.val;
                              // Color scale: -1 (red) to 0 (white) to 1 (blue)
                              const color = val > 0 
                                ? `rgba(79, 70, 229, ${Math.max(0.1, val)})` 
                                : `rgba(225, 29, 72, ${Math.max(0.1, Math.abs(val))})`;
                              return <Cell key={`cell-${index}`} fill={color} />;
                            })}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </FormulaCard>
              )}

              {/* 6. REGRESSION ANALYSIS */}
              {analysisResult.multipleModel ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormulaCard
                    conceptTitle="Multiple Linear Regression"
                    moduleBadge="REGRESSION"
                    formula="Final Score Prediction Model"
                    formulaDescription="Using all academic variables to predict Final Score."
                    results={[
                      { label: 'R²', value: analysisResult.multipleModel.r2.toFixed(4), highlight: true },
                      { label: 'Adj R²', value: analysisResult.multipleModel.adjustedR2?.toFixed(4) || 'N/A' },
                      { label: 'RMSE', value: analysisResult.multipleModel.rmse.toFixed(2) }
                    ]}
                    interpretation={`The model explains ${(analysisResult.multipleModel.r2 * 100).toFixed(1)}% of the variation in Final Score in this manual dataset.`}
                  >
                    <div className="h-full flex flex-col justify-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Regression Equation</div>
                      <div className="text-sm font-mono text-indigo-900 bg-white p-4 rounded-lg border border-indigo-100 shadow-sm overflow-x-auto whitespace-nowrap">
                        {analysisResult.multipleModel.equation}
                      </div>
                    </div>
                  </FormulaCard>

                  {/* 7. ACTUAL VS PREDICTED */}
                  <FormulaCard
                    conceptTitle="Actual vs Predicted"
                    moduleBadge="PREDICTION ERROR"
                    formula="y vs ŷ"
                    formulaDescription="Comparing the true Final Score with the model's prediction."
                    results={[]}
                    interpretation="Points closer to the y = x line indicate more accurate predictions."
                  >
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis type="number" dataKey="actual" name="Actual" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                          <YAxis type="number" dataKey="predicted" name="Predicted" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          <ReferenceLine x={0} y={0} />
                          <Scatter name="Students" data={analysisResult.parsedData.map((d: any) => {
                            const pred = predictStudentScore(d, analysisResult.multipleModel);
                            return { actual: d.Final_Score, predicted: pred.predictedScore };
                          })} fill="#6366F1" />
                          <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke="#94A3B8" strokeDasharray="5 5" name="y = x" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </FormulaCard>
                </div>
              ) : (
                analysisResult.hasFinalScores && (
                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-amber-800 text-sm font-semibold text-center">
                    Multiple linear regression cannot be calculated because the manual dataset is too small relative to the number of predictor variables. Add more students to enable regression analysis.
                  </div>
                )
              )}

              {/* 8. NEW STUDENT PREDICTION */}
              {analysisResult.multipleModel && (
                <div className="bg-gradient-to-r from-slate-800 to-indigo-900 rounded-2xl p-8 border border-slate-700 shadow-xl text-white">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    Predict a New Student's Final Score
                  </h3>
                  <p className="text-sm text-slate-300 mb-6">
                    Use the regression model built specifically from your manual dataset to predict performance for a new student profile.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {requiredKeys.map(k => {
                      const isValid = validateValue(k, newStudent[k], true);
                      return (
                        <div key={k} className="space-y-1 relative group">
                          <label className="text-[11px] font-bold text-slate-300">{limits[k].label}</label>
                          <input type="text" value={newStudent[k]} onChange={e => setNewStudent({...newStudent, [k]: e.target.value})}
                            className={`w-full p-2.5 bg-slate-900/50 border rounded-xl text-sm font-semibold outline-none text-white ${!isValid ? 'border-rose-400' : 'border-slate-600 focus:border-indigo-400'}`} 
                            placeholder={limits[k].desc}
                          />
                          {!isValid && <div className="absolute top-full left-0 mt-1 z-50 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg border border-rose-500">{limits[k].label} must be between {limits[k].min} and {limits[k].max}.</div>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <button 
                      onClick={handlePredictNew}
                      className="w-full md:w-auto px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold shadow-lg transition-colors"
                    >
                      Predict Final Score
                    </button>
                    
                    {newPrediction && (
                      <div className="flex-1 flex gap-4 w-full bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                        <div>
                          <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">Predicted Score</div>
                          <div className="text-3xl font-extrabold text-indigo-300">{newPrediction.predictedScore} <span className="text-sm font-normal text-slate-500">/ 100</span></div>
                        </div>
                        <div className="pl-4 border-l border-slate-700">
                          <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">Performance Category</div>
                          <div className={`text-lg font-bold ${
                            newPrediction.category === 'Excellent' || newPrediction.category === 'Outstanding' ? 'text-emerald-400' :
                            newPrediction.category === 'Good' ? 'text-indigo-400' :
                            newPrediction.category === 'Average' ? 'text-amber-400' : 'text-rose-400'
                          }`}>{newPrediction.category}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 9. FINAL INTERPRETATION */}
              {analysisResult.hasFinalScores && analysisResult.stats && analysisResult.correlations.length > 0 && (
                <div className="bg-indigo-50 rounded-2xl p-6 md:p-8 text-sm text-indigo-900 border border-indigo-100 shadow-sm leading-relaxed space-y-4">
                  <h3 className="text-lg font-bold text-indigo-950 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" /> Manual Dataset Final Interpretation
                  </h3>
                  <p>
                    The manually entered dataset contains <strong>{analysisResult.stats.total} students</strong> with an average Final Score of <strong>{analysisResult.stats.mean.toFixed(1)}</strong>. 
                    Among the variables analyzed, <strong>{analysisResult.correlations[0]?.label || 'None'}</strong> shows the strongest correlation with Final Score (r = <strong>{analysisResult.correlations[0]?.corr?.toFixed(2) || '0'}</strong>).
                  </p>
                  <p>
                    The covariance analysis indicates that higher {analysisResult.correlations[0]?.label || 'scores'} tend to occur with {analysisResult.covariances[0]?.cov > 0 ? 'higher' : 'lower'} Final Scores in this specific dataset.
                  </p>
                  {analysisResult.multipleModel && (
                    <p>
                      The multiple linear regression model built from these manual records explains approximately <strong>{(analysisResult.multipleModel.r2 * 100).toFixed(1)}%</strong> of the variation in Final Score, with an RMSE of <strong>{analysisResult.multipleModel.rmse.toFixed(1)} marks</strong>.
                    </p>
                  )}
                  <p className="font-semibold text-base pt-2 border-t border-indigo-200/60">
                    Overall, the analysis confirms that the relationships mathematically modeled in this manual subset {analysisResult.multipleModel && analysisResult.multipleModel.r2 > 0.5 ? 'demonstrate strong predictive patterns' : 'show moderate or weak predictive patterns'}, highlighting the specific trends you entered.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
