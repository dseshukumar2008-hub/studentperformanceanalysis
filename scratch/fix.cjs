const fs = require('fs');

const p = 'C:/Users/HP/Downloads/seshu project/seshu project/src/components/pages/ManualAnalysisPage.tsx';
let txt = fs.readFileSync(p, 'utf8');

const target = `      let stats = null;
      if (hasFinalScores && parsedData.length >= 2) {
        stats = {
          total: finalScores.length,
          mean: calculateMean(finalScores),
          median: calculateMedian(finalScores),
          std: calculateStdDev(finalScores, true),
          max: Math.max(...finalScores),
          min: Math.min(...finalScores)
        };
      }`;

const rep = `      let stats = null;
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

if (txt.includes(target)) {
    fs.writeFileSync(p, txt.replace(target, rep));
    console.log("Replaced successfully!");
} else {
    // try line by line matching
    const idx = txt.indexOf('let stats = null;');
    if (idx !== -1) {
       console.log("Found start, but exact string mismatch.");
       // Let's replace manually
       const p1 = txt.substring(0, idx);
       const endIdx = txt.indexOf('}', txt.indexOf('Math.min(...finalScores)')) + 1;
       const p2 = txt.substring(endIdx);
       fs.writeFileSync(p, p1 + rep + p2);
       console.log("Replaced via fallback!");
    } else {
       console.log("Could not find target.");
    }
}
