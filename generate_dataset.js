import fs from 'fs';
import path from 'path';

// Seeded random helper for reproducible realistic data
function pseudoRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function randomNormal(mean, stdDev, seedRef) {
  let u1 = pseudoRandom(seedRef.val++);
  let u2 = pseudoRandom(seedRef.val++);
  let z0 = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

const seedRef = { val: 42 };
const students = [];

for (let i = 1; i <= 1000; i++) {
  const studentId = `STU-${1000 + i}`;
  
  // Base academic potential factor (latent variable)
  const basePotential = Math.min(100, Math.max(30, randomNormal(68, 12, seedRef)));
  
  // Study hours: correlated with potential
  const studyHours = Math.min(10.0, Math.max(1.0, parseFloat((basePotential / 12 + randomNormal(1.5, 0.8, seedRef)).toFixed(1))));
  
  // Attendance: correlated with potential and study hours
  const attendance = Math.min(100.0, Math.max(50.0, parseFloat((basePotential * 0.6 + studyHours * 2.5 + randomNormal(12, 5, seedRef)).toFixed(1))));
  
  // Previous Semester Score
  const prevScore = Math.min(100.0, Math.max(40.0, parseFloat((basePotential * 0.85 + randomNormal(5, 6, seedRef)).toFixed(1))));
  
  // Subject Marks (correlated with base potential & individual aptitude variations)
  const math = Math.min(100.0, Math.max(30.0, parseFloat((basePotential * 0.88 + randomNormal(4, 7, seedRef)).toFixed(1))));
  const physics = Math.min(100.0, Math.max(30.0, parseFloat((math * 0.7 + basePotential * 0.25 + randomNormal(2, 6, seedRef)).toFixed(1))));
  const chemistry = Math.min(100.0, Math.max(30.0, parseFloat((physics * 0.5 + basePotential * 0.45 + randomNormal(3, 6, seedRef)).toFixed(1))));
  const english = Math.min(100.0, Math.max(30.0, parseFloat((basePotential * 0.75 + randomNormal(10, 8, seedRef)).toFixed(1))));
  const programming = Math.min(100.0, Math.max(30.0, parseFloat((math * 0.6 + studyHours * 2.0 + basePotential * 0.25 + randomNormal(3, 7, seedRef)).toFixed(1))));
  
  // Final Score: realistic weighted combination of subjects, study hours, attendance & previous score
  let rawFinal = (
    0.20 * math +
    0.15 * physics +
    0.15 * chemistry +
    0.10 * english +
    0.20 * programming +
    0.08 * prevScore +
    1.2 * studyHours +
    0.08 * attendance +
    randomNormal(0, 2.5, seedRef)
  );
  
  const finalScore = Math.min(99.5, Math.max(35.0, parseFloat(rawFinal.toFixed(1))));
  
  students.push({
    Student_ID: studentId,
    Attendance_Percentage: attendance,
    Study_Hours_Per_Day: studyHours,
    Previous_Semester_Score: prevScore,
    Mathematics_Marks: math,
    Physics_Marks: physics,
    Chemistry_Marks: chemistry,
    English_Marks: english,
    Programming_Marks: programming,
    Final_Score: finalScore
  });
}

const header = Object.keys(students[0]).join(',');
const csvContent = [header, ...students.map(row => Object.values(row).join(','))].join('\n');

// Write CSV to multiple target directories
const paths = [
  path.join(process.cwd(), 'student_performance.csv'),
  path.join(process.cwd(), 'public', 'student_performance.csv'),
  path.join(process.cwd(), 'src', 'data', 'student_performance.csv')
];

paths.forEach(p => {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(p, csvContent, 'utf8');
  console.log(`Generated dataset saved to ${p}`);
});
