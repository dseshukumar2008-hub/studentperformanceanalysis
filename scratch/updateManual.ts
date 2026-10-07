import fs from 'fs';

const path = 'c:/Users/HP/Downloads/seshu project/seshu project/src/components/pages/ManualAnalysisPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// I will just use write_to_file to replace the entire file, it's easier and safer than regex replaces for a huge chunk.
