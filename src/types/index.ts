export interface StudentData {
  Student_ID: string;
  Attendance_Percentage: number;
  Study_Hours_Per_Day: number;
  Previous_Semester_Score: number;
  Mathematics_Marks: number;
  Physics_Marks: number;
  Chemistry_Marks: number;
  English_Marks: number;
  Programming_Marks: number;
  Final_Score: number;
}

export type NumericalFeature = keyof Omit<StudentData, 'Student_ID'>;

export interface SummaryStats {
  count: number;
  mean: number;
  median: number;
  mode: number[];
  variance: number;
  stdDev: number;
  range: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
  excessKurtosis: number;
}

export interface FrequencyBin {
  interval: string;
  min: number;
  max: number;
  frequency: number;
  relativeFrequency: number;
  cumulativeFrequency: number;
  cumulativeRelativeFrequency: number;
}

export interface StemAndLeafItem {
  stem: number;
  leaves: number[];
}

export interface BoxPlotStats {
  variable: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  iqr: number;
  lowerWhisker: number;
  upperWhisker: number;
  outliers: number[];
}

export interface ProbabilityResult {
  pA: number;
  pB: number;
  pAandB: number;
  pAorB: number;
  pAgivenB: number;
  pBgivenA: number;
  countA: number;
  countB: number;
  countAandB: number;
  countTotal: number;
  isIndependent: boolean;
  productPA_PB: number;
  difference: number;
}

export interface DiscreteDistributionItem {
  category: string;
  x: number;
  frequency: number;
  px: number;
  xPx: number;
  xMinusMeanSquaredPx: number;
}

export interface RegressionMetrics {
  r2: number;
  adjustedR2?: number;
  mae: number;
  rmse: number;
  equation: string;
  coefficients?: Record<string, number>;
  intercept?: number;
}

export interface HypothesisTestResult {
  nullHypothesis: string;
  alternativeHypothesis: string;
  sampleMean: number;
  sampleStdDev: number;
  sampleSize: number;
  degreesOfFreedom?: number;
  testStatistic: number;
  pValue: number;
  criticalValue: number;
  alpha: number;
  rejectNull: boolean;
  decision: string;
  interpretation: string;
}

export interface ProportionTestResult {
  nullHypothesis: string;
  alternativeHypothesis: string;
  sampleProportion: number;
  hypothesizedProportion: number;
  sampleSize: number;
  zStatistic: number;
  pValue: number;
  criticalValue: number;
  alpha: number;
  rejectNull: boolean;
  decision: string;
  interpretation: string;
}

export interface TwoProportionTestResult {
  p1: number;
  n1: number;
  p2: number;
  n2: number;
  pooledP: number;
  zStatistic: number;
  pValue: number;
  criticalValue: number;
  alpha: number;
  rejectNull: boolean;
  decision: string;
}

export type PageId =
  | 'home'
  | 'dataset'
  | 'statistics'
  | 'probability'
  | 'random-variables'
  | 'probability-distributions'
  | 'continuous-distributions'
  | 'sampling'
  | 'hypothesis-testing'
  | 'correlation'
  | 'regression'
  | 'prediction'
  | 'actual-vs-predicted'
  | 'subject-analysis'
  | 'mathematical-report';
