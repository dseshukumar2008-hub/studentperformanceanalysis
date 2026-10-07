const fs = require('fs');

const pagePath = 'c:/Users/HP/Downloads/seshu project/seshu project/src/components/pages/HypothesisTestingPage.tsx';
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Add jStat import
if (!content.includes('import { jStat }')) {
  content = "import { jStat } from 'jstat';\n" + content;
}

// 2. Update mathEngine import
content = content.replace('runOneSampleZTest,', 'runOneSampleTTest,');

// 3. Remove popStdDev state
content = content.replace(/\s*const \[popStdDev, setPopStdDev\] = useState<number>\(15\);/, '');

// 4. Update function call
content = content.replace(
  'const meanTestRes = runOneSampleZTest(values, hypothesizedMean, alpha, popStdDev);',
  'const meanTestRes = runOneSampleTTest(values, hypothesizedMean, alpha);'
);

// 5. Update distCurveData using jStat and rename z to t
const oldCurve = `  const distCurveData = useMemo(() => {
    const curve = [];
    const maxZ = 4;
    const minZ = -4;
    const step = (maxZ - minZ) / 100;
    const cv = meanTestRes.criticalValue;

    for (let z = minZ; z <= maxZ; z += step) {
      const density = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * Math.pow(z, 2));
      let rejectionLeft = 0;
      let nonRejection = 0;
      let rejectionRight = 0;

      if (z <= -cv) rejectionLeft = density;
      else if (z >= cv) rejectionRight = density;
      else nonRejection = density;

      curve.push({
        z: parseFloat(z.toFixed(2)),
        density: parseFloat(density.toFixed(4)),
        rejectionLeft: rejectionLeft ? parseFloat(density.toFixed(4)) : null,
        nonRejection: nonRejection ? parseFloat(density.toFixed(4)) : null,
        rejectionRight: rejectionRight ? parseFloat(density.toFixed(4)) : null,
      });
    }
    return curve;
  }, [meanTestRes.criticalValue]);`;

const newCurve = `  const distCurveData = useMemo(() => {
    const curve = [];
    const maxT = 4;
    const minT = -4;
    const step = (maxT - minT) / 100;
    const cv = meanTestRes.criticalValue;
    const df = values.length - 1;

    for (let t = minT; t <= maxT; t += step) {
      const density = jStat.studentt.pdf(t, df);
      let rejectionLeft = 0;
      let nonRejection = 0;
      let rejectionRight = 0;

      if (t <= -cv) rejectionLeft = density;
      else if (t >= cv) rejectionRight = density;
      else nonRejection = density;

      curve.push({
        t: parseFloat(t.toFixed(2)),
        density: parseFloat(density.toFixed(4)),
        rejectionLeft: rejectionLeft ? parseFloat(density.toFixed(4)) : null,
        nonRejection: nonRejection ? parseFloat(density.toFixed(4)) : null,
        rejectionRight: rejectionRight ? parseFloat(density.toFixed(4)) : null,
      });
    }
    return curve;
  }, [meanTestRes.criticalValue, values.length]);`;

content = content.replace(oldCurve, newCurve);

// 6. Update FormulaCard Concept Title and Formula
content = content.replace(
  'conceptTitle="One-Sample Z-Test for Mean (Module VIII)"',
  'conceptTitle="One-Sample Hypothesis Test for Mean (Module VIII)"'
);
content = content.replace(
  'formula="Z = (x̄ - μ₀) / (σ / √n)"',
  'formula="t = (x̄ - μ₀) / (s / √n)"'
);
content = content.replace(
  'formulaDescription="Testing whether the population mean score equals hypothesized value μ₀ using Z-test."',
  'formulaDescription="Testing whether the population mean score equals hypothesized value μ₀ using the t-test."'
);

// 7. Update FormulaCard Results Array
const oldResultsStr = `        results={[
          { label: 'Null Hypothesis', value: meanTestRes.nullHypothesis },
          { label: 'Alternative H₁', value: meanTestRes.alternativeHypothesis },
          { label: 'Sample Mean (x̄)', value: meanTestRes.sampleMean, highlight: true },
          { label: 'Population Std Dev (σ)', value: popStdDev },
          { label: 'Z Test Statistic', value: meanTestRes.testStatistic, highlight: true },
          { label: 'p-Value', value: meanTestRes.pValue, highlight: true },
          { label: 'Critical Value (Z_crit)', value: \`±\${meanTestRes.criticalValue}\` },
          { label: 'Decision', value: meanTestRes.decision, highlight: true }
        ]}`;

const newResultsStr = `        results={[
          { label: 'Null Hypothesis', value: meanTestRes.nullHypothesis },
          { label: 'Alternative H₁', value: meanTestRes.alternativeHypothesis },
          { label: 'Sample Mean (x̄)', value: meanTestRes.sampleMean, highlight: true },
          { label: 'Sample Std Dev (s)', value: meanTestRes.sampleStdDev },
          { label: 'Degrees of Freedom', value: meanTestRes.degreesOfFreedom || (values.length - 1) },
          { label: 't Test Statistic', value: meanTestRes.testStatistic, highlight: true },
          { label: 'p-Value', value: meanTestRes.pValue, highlight: true },
          { label: 't Critical Value', value: \`±\${meanTestRes.criticalValue}\` },
          { label: 'Decision', value: meanTestRes.decision, highlight: true }
        ]}`;

content = content.replace(oldResultsStr, newResultsStr);

// 8. Remove Population Std Dev UI
const popStdDevUI = `            <div className="space-y-1 sm:col-span-2">
              <span>Population Standard Deviation σ ({popStdDev}):</span>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={popStdDev}
                onChange={e => setPopStdDev(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>`;
content = content.replace(popStdDevUI, '');


// 9. Update Graph text
content = content.replace(
  'Standardized academic visualization of hypothesis testing (Standard Normal Z Distribution).',
  'Standardized academic visualization of hypothesis testing (t-distribution).'
);

// 10. Graph XAxis dataKey
content = content.replace('dataKey="z"', 'dataKey="t"');

// 11. Graph Label "Z value"
content = content.replace("value: 'Z value'", "value: 't value'");

// 12. ReferenceLine labels
content = content.replace("value: `-Zcritical`", "value: `-t Critical`");
content = content.replace("value: `+Zcritical`", "value: `+t Critical`");

// 13. Rejection logic text
content = content.replace('Z &lt; -{meanTestRes.criticalValue} or Z &gt; +{meanTestRes.criticalValue}', 't &lt; -{meanTestRes.criticalValue} or t &gt; +{meanTestRes.criticalValue}');

fs.writeFileSync(pagePath, content);
console.log('HypothesisTestingPage.tsx updated successfully');
