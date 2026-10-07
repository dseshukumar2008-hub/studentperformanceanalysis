import { jStat } from 'jstat';
import type { StudentData, SummaryStats, FrequencyBin, StemAndLeafItem, BoxPlotStats, ProbabilityResult, DiscreteDistributionItem, RegressionMetrics, HypothesisTestResult, ProportionTestResult, TwoProportionTestResult } from '../types';

// ==========================================
// 1. MODULE I: BASIC STATISTICS & SUMMARY
// ==========================================

export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / values.length;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function calculateMode(values: number[]): number[] {
  if (values.length === 0) return [];
  const freqMap = new Map<number, number>();
  let maxFreq = 0;
  values.forEach(v => {
    const val = Math.round(v * 10) / 10;
    const count = (freqMap.get(val) || 0) + 1;
    freqMap.set(val, count);
    if (count > maxFreq) maxFreq = count;
  });

  const modes: number[] = [];
  freqMap.forEach((count, key) => {
    if (count === maxFreq && maxFreq > 1) {
      modes.push(key);
    }
  });
  return modes.sort((a, b) => a - b).slice(0, 3);
}

export function calculateVariance(values: number[], isSample: boolean = true): number {
  if (values.length <= 1) return 0;
  const mean = calculateMean(values);
  const sumSq = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  return sumSq / (values.length - (isSample ? 1 : 0));
}

export function calculateStdDev(values: number[], isSample: boolean = true): number {
  return Math.sqrt(calculateVariance(values, isSample));
}

export function calculateQuartiles(values: number[]): { q1: number; q3: number; iqr: number } {
  if (values.length === 0) return { q1: 0, q3: 0, iqr: 0 };
}
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = calculateMedian(sorted.slice(0, Math.floor(sorted.length / 2)));
  const q3 = calculateMedian(sorted.slice(Math.ceil(sorted.length / 2)));
  return { q1, q3, iqr: q3 - q1 };
}

export function calculateSkewness(values: number[]): number {
  const n = values.length;
  if (n < 3) return 0;
  const mean = calculateMean(values);
  const std = calculateStdDev(values, true);
  if (std === 0) return 0;
  
  const m3 = values.reduce((acc, v) => acc + Math.pow((v - mean) / std, 3), 0);
  return (n / ((n - 1) * (n - 2))) * m3;
}

export function calculateKurtosis(values: number[]): { kurtosis: number; excessKurtosis: number } {
  const n = values.length;
  if (n < 4) return { kurtosis: 0, excessKurtosis: 0 };
  const mean = calculateMean(values);
  const std = calculateStdDev(values, true);
  if (std === 0) return { kurtosis: 0, excessKurtosis: 0 };
  
  const m4 = values.reduce((acc, v) => acc + Math.pow((v - mean) / std, 4), 0);
  // Sample excess kurtosis formula (Fisher-Pearson)
  const excessKurtosis = ((n * (n + 1) * m4) / ((n - 1) * (n - 2) * (n - 3))) - ((3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3)));
  const kurtosis = excessKurtosis + 3;
  
  return { kurtosis, excessKurtosis };
}

export function calculateSummaryStats(values: number[]): SummaryStats {
  if (values.length === 0) {
    return {
      count: 0, mean: 0, median: 0, mode: [], variance: 0, stdDev: 0,
      range: 0, min: 0, max: 0, q1: 0, q3: 0, iqr: 0, skewness: 0, kurtosis: 0, excessKurtosis: 0
    };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = calculateMean(values);
  const median = calculateMedian(values);
  const mode = calculateMode(values);
  const variance = calculateVariance(values, true);
  const stdDev = calculateStdDev(values, true);
  const { q1, q3, iqr } = calculateQuartiles(values);
  const skewness = calculateSkewness(values);
  const { kurtosis, excessKurtosis } = calculateKurtosis(values);

  return {
    count: values.length,
    mean: parseFloat(mean.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    mode: mode.length ? mode : [parseFloat(mean.toFixed(2))],
    variance: parseFloat(variance.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2)),
    range: parseFloat((max - min).toFixed(2)),
    min: parseFloat(min.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    q1: parseFloat(q1.toFixed(2)),
    q3: parseFloat(q3.toFixed(2)),
    iqr: parseFloat(iqr.toFixed(2)),
    skewness: parseFloat(skewness.toFixed(2)),
    kurtosis: parseFloat(kurtosis.toFixed(2)),
    excessKurtosis: parseFloat(excessKurtosis.toFixed(2))
  };
}

export function generateFrequencyTable(values: number[], binCount: number = 8): FrequencyBin[] {
  if (values.length === 0) return [];
  const min = Math.floor(Math.min(...values));
  const max = Math.ceil(Math.max(...values));
  const binWidth = Math.max(1, (max - min) / binCount);

  const bins: FrequencyBin[] = [];
  let cumulativeCount = 0;

  for (let i = 0; i < binCount; i++) {
    const binMin = parseFloat((min + i * binWidth).toFixed(1));
    const binMax = parseFloat((i === binCount - 1 ? max : min + (i + 1) * binWidth).toFixed(1));

    const count = values.filter(v => (i === binCount - 1 ? v >= binMin && v <= binMax : v >= binMin && v < binMax)).length;
    cumulativeCount += count;

    bins.push({
      interval: `${binMin} - ${binMax}`,
      min: binMin,
      max: binMax,
      frequency: count,
      relativeFrequency: parseFloat((count / values.length).toFixed(4)),
      cumulativeFrequency: cumulativeCount,
      cumulativeRelativeFrequency: parseFloat((cumulativeCount / values.length).toFixed(4))
    });
  }
  return bins;
}

export function generateStemAndLeaf(values: number[]): StemAndLeafItem[] {
  const map = new Map<number, number[]>();
  values.forEach(v => {
    const rounded = Math.round(v);
    const stem = Math.floor(rounded / 10);
    const leaf = rounded % 10;
    if (!map.has(stem)) map.set(stem, []);
    map.get(stem)!.push(leaf);
  });

  const stems = Array.from(map.keys()).sort((a, b) => a - b);
  return stems.map(stem => ({
    stem,
    leaves: map.get(stem)!.sort((a, b) => a - b)
  }));
}

export function calculateBoxPlotStats(values: number[], variableName: string): BoxPlotStats {
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = calculateMedian(sorted);
  const { q1, q3, iqr } = calculateQuartiles(sorted);

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers = sorted.filter(v => v < lowerBound || v > upperBound);
  const validValues = sorted.filter(v => v >= lowerBound && v <= upperBound);
  
  const lowerWhisker = validValues.length > 0 ? validValues[0] : min;
  const upperWhisker = validValues.length > 0 ? validValues[validValues.length - 1] : max;

  return {
    variable: variableName,
    min: parseFloat(min.toFixed(2)),
    q1: parseFloat(q1.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    q3: parseFloat(q3.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    iqr: parseFloat(iqr.toFixed(2)),
    lowerWhisker: parseFloat(lowerWhisker.toFixed(2)),
    upperWhisker: parseFloat(upperWhisker.toFixed(2)),
    outliers: outliers.map(o => parseFloat(o.toFixed(2)))
  };
}

export function calculateChebyshevBound(values: number[], k: number): {
  theoreticalBound: number;
  actualPercentage: number;
  lowerBound: number;
  upperBound: number;
  countWithin: number;
  total: number;
} {
  const mean = calculateMean(values);
  const std = calculateStdDev(values, true);

  const lowerBound = parseFloat((mean - k * std).toFixed(2));
  const upperBound = parseFloat((mean + k * std).toFixed(2));

  const countWithin = values.filter(v => v >= lowerBound && v <= upperBound).length;
  const actualPercentage = parseFloat(((countWithin / values.length) * 100).toFixed(2));
  const theoreticalBound = k > 1 ? parseFloat(((1 - 1 / (k * k)) * 100).toFixed(2)) : 0;

  return {
    theoreticalBound,
    actualPercentage,
    lowerBound,
    upperBound,
    countWithin,
    total: values.length
  };
}

// ==========================================
// 2. MODULE II: PROBABILITY LAB & BAYES
// ==========================================

export function calculateProbabilityEvents(
  data: StudentData[],
  condA: (s: StudentData) => boolean,
  condB: (s: StudentData) => boolean
): ProbabilityResult {
  const total = data.length;
  if (total === 0) {
    return { pA: 0, pB: 0, pAandB: 0, pAorB: 0, pAgivenB: 0, pBgivenA: 0, countA: 0, countB: 0, countAandB: 0, countTotal: 0, isIndependent: false, productPA_PB: 0, difference: 0 };
  }

  let countA = 0;
  let countB = 0;
  let countAandB = 0;

  data.forEach(s => {
    const isA = condA(s);
    const isB = condB(s);
    if (isA) countA++;
    if (isB) countB++;
    if (isA && isB) countAandB++;
  });

  const pA = countA / total;
  const pB = countB / total;
  const pAandB = countAandB / total;
  const pAorB = (countA + countB - countAandB) / total;

  const pAgivenB = countB > 0 ? countAandB / countB : 0;
  const pBgivenA = countA > 0 ? countAandB / countA : 0;

  const productPA_PB = pA * pB;
  const difference = Math.abs(pAandB - productPA_PB);
  const isIndependent = difference < 0.03; // Dynamic empirical threshold

  return {
    pA: parseFloat(pA.toFixed(4)),
    pB: parseFloat(pB.toFixed(4)),
    pAandB: parseFloat(pAandB.toFixed(4)),
    pAorB: parseFloat(pAorB.toFixed(4)),
    pAgivenB: parseFloat(pAgivenB.toFixed(4)),
    pBgivenA: parseFloat(pBgivenA.toFixed(4)),
    countA,
    countB,
    countAandB,
    countTotal: total,
    isIndependent,
    productPA_PB: parseFloat(productPA_PB.toFixed(4)),
    difference: parseFloat(difference.toFixed(4))
  };
}

export function calculateBayesTheorem(priorA: number, likelihoodB_A: number, likelihoodB_notA: number) {
  const priorNotA = 1 - priorA;
  const evidenceB = likelihoodB_A * priorA + likelihoodB_notA * priorNotA;
  const posteriorA_B = evidenceB > 0 ? (likelihoodB_A * priorA) / evidenceB : 0;

  return {
    priorA: parseFloat(priorA.toFixed(4)),
    priorNotA: parseFloat(priorNotA.toFixed(4)),
    likelihoodB_A: parseFloat(likelihoodB_A.toFixed(4)),
    likelihoodB_notA: parseFloat(likelihoodB_notA.toFixed(4)),
    evidenceB: parseFloat(evidenceB.toFixed(4)),
    posteriorA_B: parseFloat(posteriorA_B.toFixed(4))
  };
}

// ==========================================
// 3. MODULE III & IV: RANDOM VARIABLES & DISCRETE DISTRIBUTIONS
// ==========================================

export function calculateDiscreteRandomVariable(values: number[]): {
  items: DiscreteDistributionItem[];
  expectedValue: number;
  variance: number;
  stdDev: number;
} {
  const categories = [
    { label: '0–49 (Fail/Low)', min: 0, max: 49.9, val: 45 },
    { label: '50–59 (Average)', min: 50, max: 59.9, val: 55 },
    { label: '60–69 (Good)', min: 60, max: 69.9, val: 65 },
    { label: '70–79 (Very Good)', min: 70, max: 79.9, val: 75 },
    { label: '80–89 (Excellent)', min: 80, max: 89.9, val: 85 },
    { label: '90–100 (Outstanding)', min: 90, max: 100, val: 95 }
  ];

  const total = values.length;
  const freqCounts = categories.map(cat => ({
    ...cat,
    frequency: values.filter(v => v >= cat.min && v <= cat.max).length
  }));

  const itemData = freqCounts.map(c => {
    const px = total > 0 ? c.frequency / total : 0;
    const xPx = c.val * px;
    return {
      category: c.label,
      x: c.val,
      frequency: c.frequency,
      px: parseFloat(px.toFixed(4)),
      xPx: parseFloat(xPx.toFixed(2)),
      xMinusMeanSquaredPx: 0 // Will compute after EV
    };
  });

  const expectedValue = itemData.reduce((sum, item) => sum + item.x * item.px, 0);

  let variance = 0;
  const items = itemData.map(item => {
    const sqDiffPx = Math.pow(item.x - expectedValue, 2) * item.px;
    variance += sqDiffPx;
    return {
      ...item,
      xMinusMeanSquaredPx: parseFloat(sqDiffPx.toFixed(2))
    };
  });

  return {
    items,
    expectedValue: parseFloat(expectedValue.toFixed(2)),
    variance: parseFloat(variance.toFixed(2)),
    stdDev: parseFloat(Math.sqrt(variance).toFixed(2))
  };
}

// Combinations nCr helper
export function nCr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  if (r > n / 2) r = n - r;

  let res = 1;
  for (let i = 1; i <= r; i++) {
    res = (res * (n - i + 1)) / i;
  }
  return res;
}

export function calculateBinomialDistribution(n: number, p: number): {
  data: { k: number; probability: number; cumulative: number }[];
  mean: number;
  variance: number;
  stdDev: number;
} {
  const data: { k: number; probability: number; cumulative: number }[] = [];
  let cumulative = 0;

  for (let k = 0; k <= n; k++) {
    const prob = nCr(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    cumulative += prob;
    data.push({
      k,
      probability: parseFloat(prob.toFixed(6)),
      cumulative: parseFloat(cumulative.toFixed(6))
    });
  }

  const mean = n * p;
  const variance = n * p * (1 - p);
  const stdDev = Math.sqrt(variance);

  return {
    data,
    mean: parseFloat(mean.toFixed(2)),
    variance: parseFloat(variance.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2))
  };
}

export function calculatePoissonDistribution(lambda: number, maxK: number = 20): {
  data: { k: number; probability: number; cumulative: number }[];
  mean: number;
  variance: number;
  stdDev: number;
} {
  const data: { k: number; probability: number; cumulative: number }[] = [];
  let cumulative = 0;
  let factorial = 1;

  for (let k = 0; k <= maxK; k++) {
    if (k > 0) factorial *= k;
    const prob = (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial;
    cumulative += prob;
    data.push({
      k,
      probability: parseFloat(prob.toFixed(6)),
      cumulative: parseFloat(cumulative.toFixed(6))
    });
  }

  return {
    data,
    mean: parseFloat(lambda.toFixed(2)),
    variance: parseFloat(lambda.toFixed(2)),
    stdDev: parseFloat(Math.sqrt(lambda).toFixed(2))
  };
}

// ==========================================
// 4. MODULE V: CONTINUOUS DISTRIBUTIONS
// ==========================================

export function normalPDF(x: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
}

// Standard Normal CDF Approximation (Abramowitz & Stegun)
export function standardNormalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) p = 1 - p;
  return p;
}

export function calculateNormalDistributionChart(mean: number, stdDev: number, highlightX?: number): {
  curve: { x: number; pdf: number; isHighlighted: boolean }[];
  zScore: number;
  pLess: number;
  pGreater: number;
} {
  const minX = mean - 4 * stdDev;
  const maxX = mean + 4 * stdDev;
  const step = (maxX - minX) / 100;
  const curve = [];

  for (let x = minX; x <= maxX; x += step) {
    curve.push({
      x: parseFloat(x.toFixed(2)),
      pdf: parseFloat(normalPDF(x, mean, stdDev).toFixed(6)),
      isHighlighted: highlightX !== undefined ? x <= highlightX : false
    });
  }

  const targetX = highlightX !== undefined ? highlightX : mean;
  const zScore = stdDev > 0 ? (targetX - mean) / stdDev : 0;
  const pLess = standardNormalCDF(zScore);
  const pGreater = 1 - pLess;

  return {
    curve,
    zScore: parseFloat(zScore.toFixed(3)),
    pLess: parseFloat(pLess.toFixed(4)),
    pGreater: parseFloat(pGreater.toFixed(4))
  };
}

export function generateContinuousDistributionsData(type: 'uniform' | 'exponential' | 'gamma' | 'beta', params: Record<string, number>) {
  const points = [];
  
  if (type === 'uniform') {
    const a = params.a || 0;
    const b = params.b || 100;
    const height = 1 / (b - a);
    for (let x = a - 10; x <= b + 10; x += (b - a + 20) / 100) {
      const pdf = (x >= a && x <= b) ? height : 0;
      points.push({ x: parseFloat(x.toFixed(2)), pdf: parseFloat(pdf.toFixed(4)) });
    }
  } else if (type === 'exponential') {
    const lambda = params.lambda || 0.1;
    for (let x = 0; x <= 50; x += 0.5) {
      const pdf = lambda * Math.exp(-lambda * x);
      points.push({ x: parseFloat(x.toFixed(2)), pdf: parseFloat(pdf.toFixed(4)) });
    }
  } else if (type === 'gamma') {
    const k = params.k || 2;
    const theta = params.theta || 2;
    // Gamma PDF placeholder plot
    for (let x = 0.1; x <= 30; x += 0.3) {
      const pdf = (Math.pow(x, k - 1) * Math.exp(-x / theta)) / (Math.pow(theta, k) * (k === 1 ? 1 : k === 2 ? 1 : 2));
      points.push({ x: parseFloat(x.toFixed(2)), pdf: parseFloat(pdf.toFixed(4)) });
    }
  } else if (type === 'beta') {
    const alpha = params.alpha || 2;
    const beta = params.beta || 5;
    for (let x = 0.01; x <= 0.99; x += 0.01) {
      const pdf = Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1) * 12; // Scaled approximation
      points.push({ x: parseFloat(x.toFixed(2)), pdf: parseFloat(pdf.toFixed(4)) });
    }
  }
  return points;
}

// ==========================================
// 5. MODULE VI: SAMPLING & ESTIMATION
// ==========================================

export function performSampling(data: StudentData[], method: 'random' | 'systematic' | 'stratified', sampleSize: number): StudentData[] {
  if (sampleSize >= data.length) return [...data];

  if (method === 'random') {
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, sampleSize);
  } else if (method === 'systematic') {
    const k = Math.floor(data.length / sampleSize);
    const start = Math.floor(Math.random() * k);
    const sample: StudentData[] = [];
    for (let i = start; i < data.length && sample.length < sampleSize; i += k) {
      sample.push(data[i]);
    }
    return sample;
  } else {
    // Stratified by Final Score Grade
    const high = data.filter(s => s.Final_Score >= 75);
    const mid = data.filter(s => s.Final_Score >= 55 && s.Final_Score < 75);
    const low = data.filter(s => s.Final_Score < 55);

    const rHigh = Math.round((high.length / data.length) * sampleSize);
    const rMid = Math.round((mid.length / data.length) * sampleSize);
    const rLow = sampleSize - rHigh - rMid;

    const sampleHigh = [...high].sort(() => 0.5 - Math.random()).slice(0, rHigh);
    const sampleMid = [...mid].sort(() => 0.5 - Math.random()).slice(0, rMid);
    const sampleLow = [...low].sort(() => 0.5 - Math.random()).slice(0, rLow);

    return [...sampleHigh, ...sampleMid, ...sampleLow];
  }
}

export function simulateCLT(data: StudentData[], sampleSize: number, numSamples: number = 300): {
  sampleMeans: number[];
  meanOfMeans: number;
  stdErrTheoretical: number;
  stdErrEmpirical: number;
  histogram: { bin: string; count: number }[];
} {
  const scores = data.map(s => s.Final_Score);
  const popStd = calculateStdDev(scores, false);

  const sampleMeans: number[] = [];
  for (let i = 0; i < numSamples; i++) {
    const sample = performSampling(data, 'random', sampleSize);
    const m = calculateMean(sample.map(s => s.Final_Score));
    sampleMeans.push(parseFloat(m.toFixed(2)));
  }

  const meanOfMeans = parseFloat(calculateMean(sampleMeans).toFixed(2));
  const stdErrEmpirical = parseFloat(calculateStdDev(sampleMeans, true).toFixed(2));
  const stdErrTheoretical = parseFloat((popStd / Math.sqrt(sampleSize)).toFixed(2));

  // Generate histogram for sampling distribution
  const freq = generateFrequencyTable(sampleMeans, 10);
  const histogram = freq.map(f => ({ bin: f.interval, count: f.frequency }));

  return {
    sampleMeans,
    meanOfMeans,
    stdErrTheoretical,
    stdErrEmpirical,
    histogram
  };
}

export function calculateConfidenceInterval(sample: number[], confidenceLevel: 0.90 | 0.95 | 0.99): {
  sampleMean: number;
  marginOfError: number;
  lowerBound: number;
  upperBound: number;
  stdError: number;
  zValue: number;
} {
  const n = sample.length;
  const mean = calculateMean(sample);
  const std = calculateStdDev(sample, true);
  const stdError = std / Math.sqrt(n);

  const zMap = { 0.90: 1.645, 0.95: 1.96, 0.99: 2.576 };
  const zValue = zMap[confidenceLevel];
  const marginOfError = zValue * stdError;

  return {
    sampleMean: parseFloat(mean.toFixed(2)),
    marginOfError: parseFloat(marginOfError.toFixed(2)),
    lowerBound: parseFloat((mean - marginOfError).toFixed(2)),
    upperBound: parseFloat((mean + marginOfError).toFixed(2)),
    stdError: parseFloat(stdError.toFixed(3)),
    zValue
  };
}

// ==========================================
// 6. MODULE VII & VIII: HYPOTHESIS TESTING
// ==========================================

export function runOneSampleTTest(
  values: number[],
  hypothesizedMean: number,
  alpha: 0.01 | 0.05 | 0.10
): HypothesisTestResult {
  const n = values.length;
  const mean = calculateMean(values);
  const std = calculateStdDev(values, true); // SAMPLE standard deviation
  const se = std / Math.sqrt(n);

  const testStatistic = (mean - hypothesizedMean) / se;
  const df = n - 1;

  // Two-tailed critical value using t-distribution
  const criticalValue = Math.abs(jStat.studentt.inv(alpha / 2, df));

  // Two-tailed p-value using t-distribution
  const pValue = jStat.studentt.cdf(-Math.abs(testStatistic), df) * 2;
  const rejectNull = Math.abs(testStatistic) > criticalValue;

  return {
    nullHypothesis: `H₀: μ = ${hypothesizedMean}`,
    alternativeHypothesis: `H₁: μ ≠ ${hypothesizedMean}`,
    sampleMean: parseFloat(mean.toFixed(2)),
    sampleStdDev: parseFloat(std.toFixed(2)),
    sampleSize: n,
    degreesOfFreedom: df,
    testStatistic: parseFloat(testStatistic.toFixed(3)),
    pValue: parseFloat(pValue.toFixed(4)),
    criticalValue: parseFloat(criticalValue.toFixed(3)),
    alpha,
    rejectNull,
    decision: rejectNull ? 'Reject H₀' : 'Fail to Reject H₀',
    interpretation: rejectNull
      ? `Statistically significant difference at α = ${alpha}. The true mean is not equal to ${hypothesizedMean}.`
      : `Insufficient evidence to reject H₀ at α = ${alpha}. The mean is consistent with ${hypothesizedMean}.`
  };
}

export function runOneProportionTest(
  data: StudentData[],
  condition: (s: StudentData) => boolean,
  p0: number,
  alpha: 0.01 | 0.05 | 0.10
): ProportionTestResult {
  const n = data.length;
  const countSuccess = data.filter(condition).length;
  const sampleProp = countSuccess / n;

  const se = Math.sqrt((p0 * (1 - p0)) / n);
  const zStat = (sampleProp - p0) / se;

  const critMap = { 0.01: 2.576, 0.05: 1.96, 0.10: 1.645 };
  const criticalValue = critMap[alpha];

  const pValue = 2 * (1 - standardNormalCDF(Math.abs(zStat)));
  const rejectNull = Math.abs(zStat) > criticalValue;

  return {
    nullHypothesis: `H₀: p = ${p0}`,
    alternativeHypothesis: `H₁: p ≠ ${p0}`,
    sampleProportion: parseFloat(sampleProp.toFixed(4)),
    hypothesizedProportion: p0,
    sampleSize: n,
    zStatistic: parseFloat(zStat.toFixed(3)),
    pValue: parseFloat(pValue.toFixed(4)),
    criticalValue,
    alpha,
    rejectNull,
    decision: rejectNull ? 'Reject H₀' : 'Fail to Reject H₀',
    interpretation: rejectNull
      ? `Significant evidence that the population proportion differs from ${p0} (p = ${sampleProp.toFixed(2)}).`
      : `No significant evidence that the proportion differs from ${p0}.`
  };
}

export function runTwoProportionTest(
  group1: StudentData[],
  group2: StudentData[],
  condition: (s: StudentData) => boolean,
  alpha: 0.01 | 0.05 | 0.10
): TwoProportionTestResult {
  const n1 = group1.length;
  const n2 = group2.length;
  const x1 = group1.filter(condition).length;
  const x2 = group2.filter(condition).length;

  const p1 = x1 / n1;
  const p2 = x2 / n2;

  const pooledP = (x1 + x2) / (n1 + n2);
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));

  const zStat = se > 0 ? (p1 - p2) / se : 0;
  const critMap = { 0.01: 2.576, 0.05: 1.96, 0.10: 1.645 };
  const criticalValue = critMap[alpha];

  const pValue = 2 * (1 - standardNormalCDF(Math.abs(zStat)));
  const rejectNull = Math.abs(zStat) > criticalValue;

  return {
    p1: parseFloat(p1.toFixed(4)),
    n1,
    p2: parseFloat(p2.toFixed(4)),
    n2,
    pooledP: parseFloat(pooledP.toFixed(4)),
    zStatistic: parseFloat(zStat.toFixed(3)),
    pValue: parseFloat(pValue.toFixed(4)),
    criticalValue,
    alpha,
    rejectNull,
    decision: rejectNull ? 'Reject H₀ (Proportions Differ)' : 'Fail to Reject H₀'
  };
}

// ==========================================
// 7. MODULE IX: CORRELATION & MATRIX
// ==========================================

export function calculateCovariance(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length <= 1) return 0;
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);

  let sum = 0;
  for (let i = 0; i < x.length; i++) {
    sum += (x[i] - meanX) * (y[i] - meanY);
  }
  return sum / (x.length - 1);
}

export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const stdX = calculateStdDev(x, true);
  const stdY = calculateStdDev(y, true);
  if (stdX === 0 || stdY === 0) return 0;
  const cov = calculateCovariance(x, y);
  return parseFloat((cov / (stdX * stdY)).toFixed(4));
}

export function calculateSpearmanCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n <= 1) return 0;

  const getRanks = (arr: number[]) => {
    const sorted = arr.map((val, idx) => ({ val, idx })).sort((a, b) => a.val - b.val);
    const ranks = new Array(n);
    sorted.forEach((item, rank) => {
      ranks[item.idx] = rank + 1;
    });
    return ranks;
  };

  const rankX = getRanks(x);
  const rankY = getRanks(y);

  let sumD2 = 0;
  for (let i = 0; i < n; i++) {
    const d = rankX[i] - rankY[i];
    sumD2 += d * d;
  }

  const rho = 1 - (6 * sumD2) / (n * (n * n - 1));
  return parseFloat(rho.toFixed(4));
}

export function calculateCorrelationMatrix(data: StudentData[], features: (keyof Omit<StudentData, 'Student_ID'>)[]): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i < features.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < features.length; j++) {
      const valsI = data.map(s => s[features[i]] as number);
      const valsJ = data.map(s => s[features[j]] as number);
      row.push(calculatePearsonCorrelation(valsI, valsJ));
    }
    matrix.push(row);
  }
  return matrix;
}

// ==========================================
// 8. MODULE X & PREDICTION: REGRESSION ENGINE
// ==========================================

export function fitSimpleLinearRegression(x: number[], y: number[]): RegressionMetrics {
  const n = x.length;
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - meanX) * (y[i] - meanY);
    den += Math.pow(x[i] - meanX, 2);
  }

  const slope = den !== 0 ? num / den : 0;
  const intercept = meanY - slope * meanX;

  let ssTot = 0;
  let ssRes = 0;
  let absErrorSum = 0;

  for (let i = 0; i < n; i++) {
    const predY = intercept + slope * x[i];
    ssTot += Math.pow(y[i] - meanY, 2);
    ssRes += Math.pow(y[i] - predY, 2);
    absErrorSum += Math.abs(y[i] - predY);
  }

  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 0;
  const mae = absErrorSum / n;
  const rmse = Math.sqrt(ssRes / n);

  return {
    r2: parseFloat(r2.toFixed(4)),
    mae: parseFloat(mae.toFixed(2)),
    rmse: parseFloat(rmse.toFixed(2)),
    equation: `y = ${intercept.toFixed(2)} + ${slope.toFixed(2)}x`,
    intercept: parseFloat(intercept.toFixed(4)),
    coefficients: { slope: parseFloat(slope.toFixed(4)) }
  };
}

// Matrix Gauss-Jordan Elimination solver for Multiple Linear Regression
export function fitMultipleLinearRegression(data: StudentData[]): RegressionMetrics {
  const features: (keyof Omit<StudentData, 'Student_ID' | 'Final_Score'>)[] = [
    'Attendance_Percentage',
    'Study_Hours_Per_Day',
    'Previous_Semester_Score',
    'Mathematics_Marks',
    'Physics_Marks',
    'Chemistry_Marks',
    'English_Marks',
    'Programming_Marks'
  ];

  const n = data.length;
  const p = features.length;

  // X matrix (with 1s column for intercept) and y vector
  const X: number[][] = data.map(s => [1, ...features.map(f => s[f] as number)]);
  const y: number[] = data.map(s => s.Final_Score);

  // X^T * X
  const XtX: number[][] = Array(p + 1).fill(0).map(() => Array(p + 1).fill(0));
  for (let i = 0; i <= p; i++) {
    for (let j = 0; j <= p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += X[k][i] * X[k][j];
      }
      XtX[i][j] = sum;
    }
  }

  // X^T * y
  const Xty: number[] = Array(p + 1).fill(0);
  for (let i = 0; i <= p; i++) {
    let sum = 0;
    for (let k = 0; k < n; k++) {
      sum += X[k][i] * y[k];
    }
    Xty[i] = sum;
  }

  // Solve (X^T X) b = X^T y via Gauss-Jordan
  const A = XtX.map((row, i) => [...row, Xty[i]]);
  const size = p + 1;

  for (let i = 0; i < size; i++) {
    let maxRow = i;
    for (let k = i + 1; k < size; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    }
    const temp = A[i];
    A[i] = A[maxRow];
    A[maxRow] = temp;

    const pivot = A[i][i];
    if (Math.abs(pivot) > 1e-10) {
      for (let j = i; j <= size; j++) A[i][j] /= pivot;
      for (let k = 0; k < size; k++) {
        if (k !== i) {
          const factor = A[k][i];
          for (let j = i; j <= size; j++) {
            A[k][j] -= factor * A[i][j];
          }
        }
      }
    }
  }

  const beta = A.map(row => row[size]);
  const intercept = beta[0];
  const coeffMap: Record<string, number> = {};
  features.forEach((f, idx) => {
    coeffMap[f] = parseFloat(beta[idx + 1].toFixed(4));
  });

  // Performance metrics
  const meanY = calculateMean(y);
  let ssTot = 0;
  let ssRes = 0;
  let absErrSum = 0;

  data.forEach((s, idx) => {
    let pred = intercept;
    features.forEach((f, fIdx) => {
      pred += beta[fIdx + 1] * (s[f] as number);
    });
    ssTot += Math.pow(y[idx] - meanY, 2);
    ssRes += Math.pow(y[idx] - pred, 2);
    absErrSum += Math.abs(y[idx] - pred);
  });

  const r2 = 1 - ssRes / ssTot;
  const adjR2 = 1 - ((1 - r2) * (n - 1)) / (n - p - 1);
  const mae = absErrSum / n;
  const rmse = Math.sqrt(ssRes / n);

  return {
    r2: parseFloat(r2.toFixed(4)),
    adjustedR2: parseFloat(adjR2.toFixed(4)),
    mae: parseFloat(mae.toFixed(2)),
    rmse: parseFloat(rmse.toFixed(2)),
    equation: `Final Score = ${intercept.toFixed(2)} + ${features.map((f, i) => `${beta[i+1].toFixed(2)}×${f.split('_')[0]}`).join(' + ')}`,
    intercept: parseFloat(intercept.toFixed(2)),
    coefficients: coeffMap
  };
}

export function fitPolynomialRegression(x: number[], y: number[], degree: number): RegressionMetrics {
  const n = x.length;
  // Fit polynomial of degree d using matrix least squares
  const X: number[][] = x.map(val => {
    const row = [1];
    for (let d = 1; d <= degree; d++) {
      row.push(Math.pow(val, d));
    }
    return row;
  });

  const size = degree + 1;
  const XtX: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
  const Xty: number[] = Array(size).fill(0);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) sum += X[k][i] * X[k][j];
      XtX[i][j] = sum;
    }
    let sumY = 0;
    for (let k = 0; k < n; k++) sumY += X[k][i] * y[k];
    Xty[i] = sumY;
  }

  // Gauss-Jordan
  const A = XtX.map((row, i) => [...row, Xty[i]]);
  for (let i = 0; i < size; i++) {
    let maxRow = i;
    for (let k = i + 1; k < size; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    }
    const temp = A[i]; A[i] = A[maxRow]; A[maxRow] = temp;
    const pivot = A[i][i];
    if (Math.abs(pivot) > 1e-10) {
      for (let j = i; j <= size; j++) A[i][j] /= pivot;
      for (let k = 0; k < size; k++) {
        if (k !== i) {
          const factor = A[k][i];
          for (let j = i; j <= size; j++) A[k][j] -= factor * A[i][j];
        }
      }
    }
  }

  const beta = A.map(row => row[size]);

  const meanY = calculateMean(y);
  let ssTot = 0, ssRes = 0, absErrSum = 0;

  for (let i = 0; i < n; i++) {
    let pred = 0;
    for (let d = 0; d <= degree; d++) pred += beta[d] * Math.pow(x[i], d);
    ssTot += Math.pow(y[i] - meanY, 2);
    ssRes += Math.pow(y[i] - pred, 2);
    absErrSum += Math.abs(y[i] - pred);
  }

  const r2 = 1 - ssRes / ssTot;
  const mae = absErrSum / n;
  const rmse = Math.sqrt(ssRes / n);

  return {
    r2: parseFloat(r2.toFixed(4)),
    mae: parseFloat(mae.toFixed(2)),
    rmse: parseFloat(rmse.toFixed(2)),
    equation: `y = ${beta.map((b, d) => (d === 0 ? b.toFixed(2) : `${b >= 0 ? '+' : ''}${b.toFixed(3)}x${d > 1 ? `^${d}` : ''}`)).join(' ')}`,
    coefficients: { intercept: beta[0], ...Object.fromEntries(beta.slice(1).map((b, i) => [`x^${i+1}`, b])) }
  };
}

export function predictStudentScore(
  inputs: Record<string, number>,
  model: RegressionMetrics
): {
  predictedScore: number;
  category: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  featureContributions: { feature: string; impact: number }[];
} {
  const { intercept = 35.0, coefficients = {} } = model;
  
  let score = intercept;
  const contributions: { feature: string; impact: number }[] = [];

  Object.entries(coefficients).forEach(([feat, coeff]) => {
    const val = inputs[feat] || 0;
    const impact = coeff * val;
    score += impact;
    contributions.push({ feature: feat, impact: parseFloat(impact.toFixed(2)) });
  });

  const finalScore = Math.min(100, Math.max(0, parseFloat(score.toFixed(1))));

  let category: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement' = 'Needs Improvement';
  if (finalScore >= 85) category = 'Excellent';
  else if (finalScore >= 70) category = 'Good';
  else if (finalScore >= 50) category = 'Average';

  return {
    predictedScore: finalScore,
    category,
    featureContributions: contributions.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
  };
}
