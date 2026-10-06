import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './components/pages/HomePage';
import { DatasetPage } from './components/pages/DatasetPage';
import { StatisticsPage } from './components/pages/StatisticsPage';
import { ProbabilityPage } from './components/pages/ProbabilityPage';
import { RandomVariablesPage } from './components/pages/RandomVariablesPage';
import { DiscreteDistributionsPage } from './components/pages/DiscreteDistributionsPage';
import { ContinuousDistributionsPage } from './components/pages/ContinuousDistributionsPage';
import { SamplingPage } from './components/pages/SamplingPage';
import { HypothesisTestingPage } from './components/pages/HypothesisTestingPage';
import { CorrelationPage } from './components/pages/CorrelationPage';
import { RegressionPage } from './components/pages/RegressionPage';
import { PredictionPage } from './components/pages/PredictionPage';
import { ManualAnalysisPage } from './components/pages/ManualAnalysisPage';
import { ActualVsPredictedPage } from './components/pages/ActualVsPredictedPage';
import { SubjectAnalysisPage } from './components/pages/SubjectAnalysisPage';
import { MathematicalReportPage } from './components/pages/MathematicalReportPage';

const AppContent: React.FC = () => {
  const { activePage, loading, error } = useData();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'dataset':
        return <DatasetPage />;
      case 'statistics':
        return <StatisticsPage />;
      case 'probability':
        return <ProbabilityPage />;
      case 'random-variables':
        return <RandomVariablesPage />;
      case 'probability-distributions':
        return <DiscreteDistributionsPage />;
      case 'continuous-distributions':
        return <ContinuousDistributionsPage />;
      case 'sampling':
        return <SamplingPage />;
      case 'hypothesis-testing':
        return <HypothesisTestingPage />;
      case 'correlation':
        return <CorrelationPage />;
      case 'regression':
        return <RegressionPage />;
      case 'prediction':
        return <PredictionPage />;
      case 'manual-analysis':
        return <ManualAnalysisPage />;
      case 'actual-vs-predicted':
        return <ActualVsPredictedPage />;
      case 'subject-analysis':
        return <SubjectAnalysisPage />;
      case 'mathematical-report':
        // Trigger HMR
        return <MathematicalReportPage />;
      default:
        return <HomePage />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-lg font-bold">Loading Academic Dataset...</h2>
        <p className="text-xs text-slate-400">Parsing student_performance.csv (1000 records)</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 space-y-4">
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-mono max-w-md text-center">
          Failed to load dataset: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;
