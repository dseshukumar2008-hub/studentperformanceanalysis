import * as fs from 'fs';

const filePath = 'C:/Users/HP/Downloads/seshu project/seshu project/src/components/pages/ManualAnalysisPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add PieChart to imports
content = content.replace('ScatterChart, Scatter, ZAxis, LabelList, Cell, ReferenceLine, Legend', 'ScatterChart, Scatter, ZAxis, LabelList, Cell, ReferenceLine, Legend, PieChart, Pie, Sector, ResponsiveContainer as RC, LineChart, Line');
content = content.replace("fitMultipleLinearRegression, predictStudentScore", "fitMultipleLinearRegression, predictStudentScore, fitSimpleLinearRegression");

// 2. Add new stats logic in handleAnalyze
const statsRegex = /let stats = null;[\s\S]*?min: Math\.min\(\.\.\.finalScores\)\n\s*\};\n\s*\}/;
const newStats = `let stats = null;
      let performanceDist: any = null;
      let averageAttendance = 0;
      let averageStudy = 0;
      if (hasFinalScores && parsedData.length >= 2) {
        stats = {
          total: finalScores.length,
          mean: calculateMean(finalScores),
          median: calculateMedian(finalScores),
          std: calculateStdDev(finalScores, true),
          max: Math.max(...finalScores),
          min: Math.min(...finalScores)
        };
        
        let exc = 0, good = 0, avg = 0, poor = 0;
        finalScores.forEach(s => {
          if (s >= 80) exc++;
          else if (s >= 70) good++;
          else if (s >= 50) avg++;
          else poor++;
        });
        performanceDist = [
          { name: 'Excellent', count: exc, fill: '#10B981' },
          { name: 'Good', count: good, fill: '#3B82F6' },
          { name: 'Average', count: avg, fill: '#F59E0B' },
          { name: 'Needs Improvement', count: poor, fill: '#EF4444' }
        ];
        
        const atts = parsedData.map(d => d.Attendance_Percentage);
        const stds = parsedData.map(d => d.Study_Hours_Per_Day);
        averageAttendance = calculateMean(atts);
        averageStudy = calculateMean(stds);
      }`;
content = content.replace(statsRegex, newStats);

// 3. Add simpleModel to handleAnalyze
const multipleModelRegex = /let multipleModel: any \| null = null;/;
const newMultipleModel = `let multipleModel: any | null = null;
      let simpleModel: any | null = null;`;
content = content.replace(multipleModelRegex, newMultipleModel);

const fitMultipleRegex = /if \(hasFinalScores && parsedData\.length > requiredKeys\.length \+ 1\) \{\s*multipleModel = fitMultipleLinearRegression\(parsedData\);\s*\}/;
const newFitMultiple = `if (hasFinalScores && parsedData.length >= 3 && correlations.length > 0) {
        const topVar = correlations[0].key;
        const xVals = parsedData.map(d => d[topVar]);
        simpleModel = fitSimpleLinearRegression(xVals, finalScores);
        simpleModel.feature = topVar;
        simpleModel.label = correlations[0].label;
      }
      if (hasFinalScores && parsedData.length > requiredKeys.length + 1) {
         multipleModel = fitMultipleLinearRegression(parsedData);
      }`;
content = content.replace(fitMultipleRegex, newFitMultiple);

// 4. Update setAnalysisResult payload
const setAnalysisResultRegex = /setAnalysisResult\(\{\s*parsedData,\s*hasFinalScores,\s*stats,\s*subjectStats,\s*correlations,\s*covariances,\s*multipleModel,\s*corrMatrix,\s*singleStudentPred,\s*isSingle: parsedData\.length === 1\s*\}\);/;
const newSetAnalysisResult = `setAnalysisResult({
        parsedData,
        hasFinalScores,
        stats,
        performanceDist,
        averageAttendance,
        averageStudy,
        subjectStats,
        correlations,
        covariances,
        simpleModel,
        multipleModel,
        corrMatrix,
        singleStudentPred,
        isSingle: parsedData.length === 1
      });`;
content = content.replace(setAnalysisResultRegex, newSetAnalysisResult);


// Now we rewrite the JSX below `/* MULTIPLE STUDENTS ANALYSIS */`
const multipleAnalysisStart = '/* MULTIPLE STUDENTS ANALYSIS */';
const newAnalysisJsx = `/* MULTIPLE STUDENTS ANALYSIS */
            <>
              {/* 1. MANUAL DATASET OVERVIEW */}
              {analysisResult.stats ? (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-900">Manual Dataset Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Students Analyzed', value: analysisResult.stats.total },
                      { label: 'Average Final Score', value: analysisResult.stats.mean.toFixed(2) },
                      { label: 'Median Final Score', value: analysisResult.stats.median.toFixed(2) },
                      { label: 'Standard Deviation', value: analysisResult.stats.std.toFixed(2) },
                      { label: 'Highest Final Score', value: analysisResult.stats.max },
                      { label: 'Lowest Final Score', value: analysisResult.stats.min },
                      { label: 'Average Attendance', value: analysisResult.averageAttendance.toFixed(1) + '%' },
                      { label: 'Average Study Hours', value: analysisResult.averageStudy.toFixed(1) + 'h' }
                    ].map(stat => (
                      <div key={stat.label} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center shadow-sm">
                        <div className="text-xl font-extrabold text-slate-800">{stat.value}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-sm text-indigo-900 mt-4">
                    <span className="font-bold mr-1">Interpretation:</span>
                    The manually entered students have an average Final Score of {analysisResult.stats.mean.toFixed(2)}. This provides a quick overview of the academic performance of the selected sample.
                  </div>
                </div>
              ) : (
                 <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-amber-800 text-sm font-semibold text-center">
                   Descriptive statistics for Final Score are unavailable because Actual Final Score was not provided for all students.
                 </div>
              )}

              {/* 2. PERFORMANCE DISTRIBUTION */}
              {analysisResult.performanceDist && (
                <FormulaCard
                  conceptTitle="Performance Distribution"
                  moduleBadge="DISTRIBUTION"
                  formula="Categorical Bins"
                  formulaDescription="Distribution of Final Scores into standard academic categories."
                  results={[]}
                  interpretation={\`\${analysisResult.performanceDist[0].count} students fall into the Excellent category, while \${analysisResult.performanceDist.slice(1).reduce((a:any,b:any)=>a+b.count,0)} students are in the Good/Average/Needs Improvement categories.\`}
                >
                  <div className="h-64 w-full">
                    <RC width="100%" height="100%">
                      <PieChart>
                        <Pie data={analysisResult.performanceDist.filter((d:any)=>d.count>0)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={60} label={({name, percent}) => \`\${name} (\${(percent*100).toFixed(0)}%)\`}>
                          {analysisResult.performanceDist.filter((d:any)=>d.count>0).map((entry:any, index:number) => (
                            <Cell key={\`cell-\${index}\`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      </PieChart>
                    </RC>
                  </div>
                </FormulaCard>
              )}

              {/* 3. SUBJECT PERFORMANCE */}
              {analysisResult.subjectStats && (
                <FormulaCard
                  conceptTitle="Subject Performance"
                  moduleBadge="STATISTICS"
                  formula="Subject Averages"
                  formulaDescription="Average scores across the manually entered students."
                  results={[
                    { label: 'Highest Average', value: analysisResult.subjectStats[0].subject, highlight: true },
                    { label: 'Lowest Average', value: analysisResult.subjectStats[analysisResult.subjectStats.length-1].subject },
                    { label: 'Difference', value: (analysisResult.subjectStats[0].mean - analysisResult.subjectStats[analysisResult.subjectStats.length-1].mean).toFixed(1) + ' marks' }
                  ]}
                  interpretation={\`\${analysisResult.subjectStats[0].subject} has the highest average performance among the manually entered students, while \${analysisResult.subjectStats[analysisResult.subjectStats.length-1].subject} has the lowest average.\`}
                >
                  <div className="h-64 w-full pt-4">
                    <RC width="100%" height="100%">
                      <BarChart data={analysisResult.subjectStats} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="subject" type="category" width={90} tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} formatter={(val: number) => [\`\${val.toFixed(1)}\`, 'Mean']} />
                        <Bar dataKey="mean" fill="#6366F1" barSize={20} radius={[0, 4, 4, 0]}>
                          <LabelList dataKey="mean" position="right" formatter={(v: number) => v.toFixed(1)} style={{ fontSize: '11px', fill: '#4F46E5', fontWeight: 'bold' }} />
                        </Bar>
                      </BarChart>
                    </RC>
                  </div>
                </FormulaCard>
              )}

              {analysisResult.correlations.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 4. CORRELATION ANALYSIS */}
                  <FormulaCard
                    conceptTitle="Correlation Analysis"
                    moduleBadge="CORRELATION"
                    formula="Pearson r"
                    formulaDescription="Strongest academic factor relationship with Final Score."
                    results={[
                      { label: 'Pearson r', value: analysisResult.correlations[0].corr.toFixed(3), highlight: true },
                      { label: 'Direction', value: analysisResult.correlations[0].corr > 0 ? 'Positive' : 'Negative' },
                      { label: 'Strength', value: Math.abs(analysisResult.correlations[0].corr) >= 0.8 ? 'Very Strong' : Math.abs(analysisResult.correlations[0].corr) >= 0.6 ? 'Strong' : Math.abs(analysisResult.correlations[0].corr) >= 0.4 ? 'Moderate' : Math.abs(analysisResult.correlations[0].corr) >= 0.2 ? 'Weak' : 'Very Weak' }
                    ]}
                    interpretation={\`Pearson correlation r = \${analysisResult.correlations[0].corr.toFixed(2)} indicates a \${Math.abs(analysisResult.correlations[0].corr) >= 0.6 ? 'strong' : Math.abs(analysisResult.correlations[0].corr) >= 0.4 ? 'moderate' : 'weak'} \${analysisResult.correlations[0].corr > 0 ? 'positive' : 'negative'} relationship between \${analysisResult.correlations[0].label} and Final Score. In this manually entered sample, students with higher \${analysisResult.correlations[0].label} generally tend to have \${analysisResult.correlations[0].corr > 0 ? 'higher' : 'lower'} Final Scores.\`}
                  >
                    <div className="h-64 w-full">
                      <RC width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis type="number" dataKey="x" name={analysisResult.correlations[0].label} domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                          <YAxis type="number" dataKey="y" name="Final Score" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          <Scatter name="Students" data={analysisResult.parsedData.map((d: any) => ({ x: d[analysisResult.correlations[0].key], y: d.Final_Score }))} fill="#8B5CF6" />
                        </ScatterChart>
                      </RC>
                    </div>
                  </FormulaCard>

                  {/* 5. COVARIANCE ANALYSIS */}
                  <FormulaCard
                    conceptTitle="Covariance Analysis"
                    moduleBadge="COVARIANCE"
                    formula="Cov(X, Y)"
                    formulaDescription="Direction of joint variation with Final Score."
                    results={[
                      { label: 'Selected Variable', value: analysisResult.covariances[0].label, highlight: true },
                      { label: 'Covariance', value: analysisResult.covariances[0].cov.toFixed(2) },
                      { label: 'Direction', value: analysisResult.covariances[0].cov > 0 ? 'Positive' : analysisResult.covariances[0].cov < 0 ? 'Negative' : 'Near-zero' }
                    ]}
                    interpretation={\`The covariance between \${analysisResult.covariances[0].label} and Final Score is \${analysisResult.covariances[0].cov.toFixed(2)}, indicating a \${analysisResult.covariances[0].cov > 0 ? 'positive' : analysisResult.covariances[0].cov < 0 ? 'negative' : 'weak'} tendency for the variables to vary together. \${analysisResult.covariances[0].cov > 0 ? 'Both variables tend to increase together.' : analysisResult.covariances[0].cov < 0 ? 'One variable tends to increase while the other decreases.' : 'Little linear co-variation is observed.'}\`}
                  >
                    <div className="h-64 w-full">
                      <RC width="100%" height="100%">
                        <BarChart data={analysisResult.covariances.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} />
                          <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px' }} formatter={(val: number) => [val.toFixed(2), 'Covariance']} />
                          <Bar dataKey="cov" fill="#F43F5E" barSize={14} radius={[0, 4, 4, 0]}>
                            <LabelList dataKey="cov" position="right" formatter={(v: number) => v.toFixed(1)} style={{ fontSize: '10px', fill: '#E11D48', fontWeight: 'bold' }} />
                          </Bar>
                        </BarChart>
                      </RC>
                    </div>
                  </FormulaCard>
                </div>
              ) : (
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-amber-800 text-sm font-semibold text-center">
                  Additional student records (at least 3) are required for Correlation and Covariance Analysis.
                </div>
              )}

              {/* 6. CORRELATION HEATMAP */}
              {analysisResult.corrMatrix && analysisResult.corrMatrix.length > 0 && (
                <FormulaCard
                  conceptTitle="Correlation Heatmap"
                  moduleBadge="CORRELATION"
                  formula="Manual Dataset Matrix"
                  formulaDescription="Pairwise Pearson correlation coefficients among all variables."
                  results={[]}
                  interpretation="The heatmap shows the strength and direction of pairwise linear relationships among the academic variables in the manually entered dataset."
                >
                  <div className="w-full overflow-x-auto pb-4">
                    {analysisResult.stats.total < 10 && (
                      <div className="mb-4 bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-200 text-sm font-bold flex items-center gap-2">
                        <span>Small sample warning: Correlation values based on a very small number of students should be interpreted cautiously.</span>
                      </div>
                    )}
                    <div className="text-xs font-bold text-slate-500 mb-2">
                      Strongest Relationship: {analysisResult.correlations[0]?.label} ↔ Final Score, r = {analysisResult.correlations[0]?.corr.toFixed(2)}
                    </div>
                    <div className="min-w-[600px] h-[400px]">
                      <RC width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 100 }}>
                          <XAxis type="category" dataKey="x" interval={0} tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }} />
                          <YAxis type="category" dataKey="y" interval={0} tick={{ fontSize: 10 }} />
                          <ZAxis type="number" dataKey="val" range={[200, 200]} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                            formatter={(val: number, name: string, props: any) => [\`r = \${props.payload.val.toFixed(3)}\`, \`\${props.payload.y} vs \${props.payload.x}\`]} 
                            contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                          />
                          <Scatter data={analysisResult.corrMatrix.flat()}>
                            {analysisResult.corrMatrix.flat().map((entry: any, index: number) => {
                              const val = entry.val;
                              // Color scale: -1 (red) to 0 (white) to 1 (blue)
                              const color = val > 0 
                                ? \`rgba(79, 70, 229, \${Math.max(0.1, val)})\` 
                                : \`rgba(225, 29, 72, \${Math.max(0.1, Math.abs(val))})\`;
                              return <Cell key={\`cell-\${index}\`} fill={color} />;
                            })}
                          </Scatter>
                        </ScatterChart>
                      </RC>
                    </div>
                  </div>
                </FormulaCard>
              )}

              {/* 7. REGRESSION & PREDICTION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analysisResult.simpleModel ? (
                  <FormulaCard
                    conceptTitle="Simple Linear Regression"
                    moduleBadge="REGRESSION"
                    formula="y = β₀ + β₁x"
                    formulaDescription="Predicts Final Score using the strongest correlated factor."
                    results={[
                      { label: 'Equation', value: analysisResult.simpleModel.equation, highlight: true },
                      { label: 'R²', value: analysisResult.simpleModel.r2.toFixed(4) },
                      { label: 'RMSE', value: analysisResult.simpleModel.rmse.toFixed(2) }
                    ]}
                    interpretation={\`The simple regression model explains \${(analysisResult.simpleModel.r2 * 100).toFixed(1)}% of the variation in Final Score using \${analysisResult.simpleModel.label}.\`}
                  >
                    <div className="h-64 w-full">
                      <RC width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis type="number" dataKey="x" name={analysisResult.simpleModel.label} domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                          <YAxis type="number" dataKey="y" name="Final Score" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          <Scatter name="Actual" data={analysisResult.parsedData.map((d: any) => ({ x: d[analysisResult.simpleModel.feature], y: d.Final_Score }))} fill="#6366F1" />
                          <LineChart data={analysisResult.parsedData.map((d: any) => ({
                            x: d[analysisResult.simpleModel.feature], 
                            yPred: analysisResult.simpleModel.intercept + analysisResult.simpleModel.coefficients.slope * d[analysisResult.simpleModel.feature]
                          })).sort((a:any, b:any) => a.x - b.x)}>
                            <Line dataKey="yPred" stroke="#F43F5E" strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} />
                          </LineChart>
                        </ScatterChart>
                      </RC>
                    </div>
                  </FormulaCard>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col justify-center text-center">
                    <div className="text-slate-900 font-bold mb-2">Regression unavailable</div>
                    <div className="text-slate-600 text-sm">Why?<br/>The current manual dataset contains only {analysisResult.stats?.total || 0} students, which is insufficient for a reliable multiple regression model with the selected predictor variables.</div>
                    <div className="text-indigo-600 font-bold mt-4 text-sm">Add more student records to enable regression and prediction.</div>
                  </div>
                )}

                {/* 8. ACTUAL VS PREDICTED */}
                {analysisResult.simpleModel ? (
                  <FormulaCard
                    conceptTitle="Actual vs Predicted"
                    moduleBadge="PREDICTION ERROR"
                    formula="y vs ŷ"
                    formulaDescription="Comparing the true Final Score with the simple model's prediction."
                    results={[]}
                    interpretation="Points closer to the y = x line indicate more accurate predictions."
                  >
                    <div className="h-64 w-full">
                      <RC width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis type="number" dataKey="actual" name="Actual" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                          <YAxis type="number" dataKey="predicted" name="Predicted" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} 
                            formatter={(val:number, name:string, props:any) => {
                              if (name === 'Actual') return [\`\${val}\`, name];
                              if (name === 'Predicted') return [\`\${val.toFixed(1)} (Error: \${(val - props.payload.actual).toFixed(1)})\`, name];
                              return [val, name];
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          <ReferenceLine x={0} y={0} />
                          <Scatter name="Students" data={analysisResult.parsedData.map((d: any) => {
                            const pred = analysisResult.simpleModel.intercept + analysisResult.simpleModel.coefficients.slope * d[analysisResult.simpleModel.feature];
                            return { actual: d.Final_Score, predicted: pred };
                          })} fill="#10B981" />
                          <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke="#94A3B8" strokeDasharray="5 5" name="y = x" />
                        </ScatterChart>
                      </RC>
                    </div>
                  </FormulaCard>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col justify-center text-center">
                    <div className="text-slate-600 font-bold mb-2">Actual vs Predicted unavailable</div>
                    <div className="text-slate-500 text-sm">Actual Final Score was not provided for enough students, so prediction accuracy cannot be evaluated.</div>
                  </div>
                )}
              </div>

              {/* 9. OVERALL MANUAL DATASET INSIGHT */}
              {analysisResult.hasFinalScores && analysisResult.stats && analysisResult.correlations.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 shadow-xl text-white mt-8 border border-indigo-500/30">
                  <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-indigo-400" /> Overall Interpretation
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div>
                      <div className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">Students Analyzed</div>
                      <div className="text-3xl font-extrabold text-white">{analysisResult.stats.total}</div>
                    </div>
                    <div>
                      <div className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">Average Final Score</div>
                      <div className="text-3xl font-extrabold text-white">{analysisResult.stats.mean.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">Best Subject</div>
                      <div className="text-xl font-bold text-white leading-tight">{analysisResult.subjectStats[0].subject}</div>
                    </div>
                    <div>
                      <div className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">Strongest Factor</div>
                      <div className="text-xl font-bold text-emerald-400 leading-tight">{analysisResult.correlations[0].label} <span className="text-sm font-normal opacity-80">(r={analysisResult.correlations[0].corr.toFixed(2)})</span></div>
                    </div>
                  </div>

                  <div className="p-5 bg-indigo-950/50 rounded-2xl border border-indigo-500/20">
                    <div className="text-sm leading-relaxed text-indigo-100">
                      <span className="font-bold text-white mr-2">Overall:</span>
                      The manually entered sample shows a strong dependency on <span className="text-emerald-400 font-bold">{analysisResult.correlations[0].label}</span>. 
                      Covariance direction is <span className="font-bold text-white">{analysisResult.covariances[0].cov > 0 ? 'Positive' : 'Negative'}</span>. 
                      Regression Status: <span className="font-bold text-white">{analysisResult.multipleModel ? 'Available' : 'Not available because sample size is insufficient'}</span>.
                    </div>
                  </div>
                </div>
              )}

              {/* 10. LIMITATIONS */}
              <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 text-xs leading-relaxed">
                <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase">Limitations</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {analysisResult.stats?.total < 30 && <li><strong className="text-rose-600">Small sample size:</strong> May produce unstable statistical estimates.</li>}
                  <li>Correlation does not imply causation.</li>
                  <li>Covariance depends on the measurement scale of the entered data.</li>
                  <li>Regression requires sufficient observations relative to predictor variables.</li>
                  <li>Manual results describe only the entered students and should not be generalized to the entire dataset.</li>
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
`;

const startIndex = content.indexOf(multipleAnalysisStart);
content = content.substring(0, startIndex) + newAnalysisJsx;

fs.writeFileSync('C:/Users/HP/Downloads/seshu project/seshu project/scratch/updateManualResult.tsx', content);
