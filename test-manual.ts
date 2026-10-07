import { 
  calculateMean, calculateMedian, calculateStdDev,
  calculatePearsonCorrelation, calculateCovariance, calculateCorrelationMatrix,
  fitMultipleLinearRegression
} from './src/utils/mathEngine.ts';

const students = [
  {
    "id": "S001",
    "selected": false,
    "Attendance_Percentage": "56",
    "Study_Hours_Per_Day": "15",
    "Previous_Semester_Score": "53",
    "Mathematics_Marks": "56",
    "Physics_Marks": "85",
    "Chemistry_Marks": "96",
    "English_Marks": "74",
    "Programming_Marks": "52",
    "Final_Score": "95"
  },
  {
    "id": "S002",
    "selected": false,
    "Attendance_Percentage": "52",
    "Study_Hours_Per_Day": "3",
    "Previous_Semester_Score": "52",
    "Mathematics_Marks": "24",
    "Physics_Marks": "24",
    "Chemistry_Marks": "63",
    "English_Marks": "42",
    "Programming_Marks": "74",
    "Final_Score": "74"
  },
  {
    "id": "S003",
    "selected": false,
    "Attendance_Percentage": "52",
    "Study_Hours_Per_Day": "23",
    "Previous_Semester_Score": "42",
    "Mathematics_Marks": "74",
    "Physics_Marks": "56",
    "Chemistry_Marks": "45",
    "English_Marks": "63",
    "Programming_Marks": "74",
    "Final_Score": "85"
  }
];

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
  // singleStudentPred skipped because globalModel isn't mocked

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

  let correlations: any[] = [];
  let covariances: any[] = [];
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
    const matrix = calculateCorrelationMatrix(parsedData as any, varsForMatrix as any[]);
    
    corrMatrix = matrix.map((row, i) => {
      return row.map((val, j) => ({
        x: limits[varsForMatrix[j] as keyof typeof limits].label,
        y: limits[varsForMatrix[i] as keyof typeof limits].label,
        val: Number.isFinite(val) ? parseFloat(val.toFixed(2)) : 0
      }));
    });
  }

  if (hasFinalScores && parsedData.length > requiredKeys.length + 1) {
     multipleModel = fitMultipleLinearRegression(parsedData as any);
  }

  console.log("SUCCESS!");
} catch (err) {
  console.error("Runtime error during manual analysis:", err);
}
