const fs = require('fs');

const pagePath = 'c:/Users/HP/Downloads/seshu project/seshu project/src/components/pages/HypothesisTestingPage.tsx';
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Update Imports
content = content.replace('runOneSampleMeanTest,', 'runOneSampleZTest,');

// 2. Add Population Std Dev State
content = content.replace(
  'const [hypothesizedMean, setHypothesizedMean] = useState<number>(65);',
  `const [hypothesizedMean, setHypothesizedMean] = useState<number>(65);\n  const [popStdDev, setPopStdDev] = useState<number>(15);`
);

// 3. Update Function Call
content = content.replace(
  'const meanTestRes = runOneSampleMeanTest(values, hypothesizedMean, alpha);',
  'const meanTestRes = runOneSampleZTest(values, hypothesizedMean, alpha, popStdDev);'
);

// 4. Update Titles and formulas
content = content.replace(
  'conceptTitle="One-Sample Hypothesis Test for Mean (Module VII)"',
  'conceptTitle="One-Sample Z-Test for Mean (Module VIII)"'
);

content = content.replace(
  'formula="t = (x̄ - μ₀) / (s / √n)  or  Z = (x̄ - μ₀) / (σ / √n)"',
  'formula="Z = (x̄ - μ₀) / (σ / √n)"'
);

content = content.replace(
  'formulaDescription="Testing whether the population mean score equals hypothesized value μ₀."',
  'formulaDescription="Testing whether the population mean score equals hypothesized value μ₀ using Z-test."'
);

// 5. Update Labels inside FormulaCard results
content = content.replace(
  "{ label: 'Test Statistic (Z/t)', value: meanTestRes.testStatistic, highlight: true },",
  "{ label: 'Z Test Statistic', value: meanTestRes.testStatistic, highlight: true },"
);
content = content.replace(
  "{ label: 'Sample Mean (x̄)', value: meanTestRes.sampleMean, highlight: true },",
  "{ label: 'Sample Mean (x̄)', value: meanTestRes.sampleMean, highlight: true },\n          { label: 'Population Std Dev (σ)', value: popStdDev },"
);

// 6. Add UI input for popStdDev
const uiInputStr = `            <div className="space-y-1">
              <span>Hypothesized Mean μ₀ ({hypothesizedMean}):</span>
              <input
                type="range"
                min="40"
                max="85"
                value={hypothesizedMean}
                onChange={e => setHypothesizedMean(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>`;
            
const newUiInputStr = `            <div className="space-y-1">
              <span>Hypothesized Mean μ₀ ({hypothesizedMean}):</span>
              <input
                type="range"
                min="40"
                max="85"
                value={hypothesizedMean}
                onChange={e => setHypothesizedMean(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
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
content = content.replace(uiInputStr, newUiInputStr);

// 7. Graph Labels: t to z
content = content.replace("value: 't value'", "value: 'Z value'");
content = content.replace("val => `t = ${val}`", "val => `Z = ${val}`");
content = content.replace("value: `−t critical`", "value: `-Zcritical`");
content = content.replace("value: `+t critical`", "value: `+Zcritical`");
content = content.replace("t &lt; -{meanTestRes.criticalValue} or t &gt; +{meanTestRes.criticalValue}", "Z &lt; -{meanTestRes.criticalValue} or Z &gt; +{meanTestRes.criticalValue}");
content = content.replace("t-distribution approximation", "Standard Normal Z Distribution");

fs.writeFileSync(pagePath, content);
console.log('Updated HypothesisTestingPage.tsx successfully');
