const fs = require('fs');

const mathPath = 'c:/Users/HP/Downloads/seshu project/seshu project/src/utils/mathEngine.ts';
let mathContent = fs.readFileSync(mathPath, 'utf8');

// 1. Import jStat
if (!mathContent.includes('import { jStat }')) {
  mathContent = "import { jStat } from 'jstat';\n" + mathContent;
}

// 2. Replace runOneSampleZTest with runOneSampleTTest
const zTestRegex = /export function runOneSampleZTest\([\s\S]*?decision: rejectNull \? 'Reject H₀' : 'Fail to Reject H₀',[\s\S]*?interpretation: rejectNull[\s\S]*?\};/m;

const newTTest = `export function runOneSampleTTest(
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
    nullHypothesis: \`H₀: μ = \${hypothesizedMean}\`,
    alternativeHypothesis: \`H₁: μ ≠ \${hypothesizedMean}\`,
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
      ? \`Statistically significant difference at α = \${alpha}. The true mean is not equal to \${hypothesizedMean}.\`
      : \`Insufficient evidence to reject H₀ at α = \${alpha}. The mean is consistent with \${hypothesizedMean}.\`
  };`;

mathContent = mathContent.replace(zTestRegex, newTTest);

// Also need to fix the closing brace for the function
if (!mathContent.includes('export function runOneProportionTest')) {
    // Wait, the regex captures up to the `};` of the return statement, so we need to add the closing brace `}`
}
mathContent = mathContent.replace('};', '};\n}');

// Better regex replacement:
let idx1 = mathContent.indexOf('export function runOneSampleZTest');
if (idx1 !== -1) {
    let endStr = '};';
    let idx2 = mathContent.indexOf(endStr, idx1 + 500);
    let idx3 = mathContent.indexOf('}', idx2 + 1);
    
    let replacement = `export function runOneSampleTTest(
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
    nullHypothesis: \`H₀: μ = \${hypothesizedMean}\`,
    alternativeHypothesis: \`H₁: μ ≠ \${hypothesizedMean}\`,
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
      ? \`Statistically significant difference at α = \${alpha}. The true mean is not equal to \${hypothesizedMean}.\`
      : \`Insufficient evidence to reject H₀ at α = \${alpha}. The mean is consistent with \${hypothesizedMean}.\`
  };
}`;
    
    mathContent = mathContent.substring(0, idx1) + replacement + mathContent.substring(idx3 + 1);
}

fs.writeFileSync(mathPath, mathContent);
console.log('mathEngine.ts updated');
