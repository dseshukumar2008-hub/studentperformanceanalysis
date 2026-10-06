import React, { useRef } from 'react';
import { Menu, Upload, RotateCcw, Search, CheckCircle, Database } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  home: { title: 'Academic Performance & Prediction', subtitle: 'A Mathematical & Statistical Analysis of Student Performance' },
  dataset: { title: 'Student Dataset Management', subtitle: '1000 Student Records • 10 Academic Features' },
  statistics: { title: 'Module I: Introduction to Statistics', subtitle: 'Descriptive Statistics, Ogive, Chebyshev & Skewness' },
  probability: { title: 'Module II: Introduction to Probability', subtitle: 'Event Probabilities, Conditional Probability & Bayes Theorem' },
  'random-variables': { title: 'Module III: Random Variables', subtitle: 'Discrete PMF, Expectation E[X] & Continuous Density' },
  'probability-distributions': { title: 'Module IV: Discrete Probability Distributions', subtitle: 'Binomial & Poisson Simulation Models' },
  'continuous-distributions': { title: 'Module V: Continuous Probability Distributions', subtitle: 'Normal, Uniform, Exponential, Gamma & Beta Distributions' },
  sampling: { title: 'Module VI: Sampling & Estimation', subtitle: 'Sampling Techniques, Central Limit Theorem & Confidence Intervals' },
  'hypothesis-testing': { title: 'Modules VII & VIII: Hypothesis Testing', subtitle: 'Mean & Proportion Z/t-Tests, p-values & Significance Levels' },
  correlation: { title: 'Module IX: Correlation Analysis', subtitle: 'Pearson r, Spearman ρ & 9x9 Correlation Heatmap Matrix' },
  regression: { title: 'Module X: Regression Analysis', subtitle: 'Simple, Multiple Linear, Polynomial & Model Comparison' },
  prediction: { title: 'Interactive Score Predictor', subtitle: 'Regression Engine Student Final Score Forecast' },
  'actual-vs-predicted': { title: 'Actual vs Predicted Evaluation', subtitle: 'Model Verification, Residual Analysis & Errors (MAE/RMSE)' },
  'subject-analysis': { title: 'Subject Performance Breakdown', subtitle: 'Mathematics, Physics, Chemistry, English & Programming Analysis' },
  'mathematical-report': { title: 'Academic Syllabus Report', subtitle: 'Full 10-Module Comprehensive Academic Presentation' },
};

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { activePage, data, uploadDataset, resetDataset, searchTerm, setSearchTerm } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pageInfo = pageTitles[activePage] || { title: 'Academic Analytics', subtitle: 'Probability & Statistics Project' };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadDataset(e.target.files[0]);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile toggle & title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {pageInfo.title}
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block font-medium">{pageInfo.subtitle}</p>
          </div>
        </div>

        {/* Right Side: Quick search, CSV Upload & Reset controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {activePage === 'dataset' && (
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Student ID..."
                className="pl-9 pr-4 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
          )}

          {/* Dataset Status Badge */}
          <div className="hidden xl:flex items-center space-x-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 font-semibold">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>{data.length} Records</span>
            <span className="text-indigo-300">•</span>
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> 0 Missing
            </span>
          </div>

          {/* Action buttons */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
            title="Upload custom student_performance.csv"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Upload CSV</span>
          </button>

          <button
            onClick={resetDataset}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium border border-slate-200 transition"
            title="Reset to default 1000 student dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
