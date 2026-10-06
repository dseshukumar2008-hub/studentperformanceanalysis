import React, { useState } from 'react';
import { Search, Download, ArrowUpDown, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { calculateSummaryStats } from '../../utils/mathEngine';
import type { StudentData } from '../../types';

export const DatasetPage: React.FC = () => {
  const { data, searchTerm, setSearchTerm } = useData();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<keyof StudentData>('Student_ID');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const pageSize = 15;

  const handleSort = (field: keyof StudentData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filtered = data.filter(s =>
    s.Student_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.Final_Score.toString().includes(searchTerm)
  );

  const sortedData = [...filtered].sort((a, b) => {
    let valA = a[sortField] as string | number;
    let valB = b[sortField] as string | number;
    if (typeof valA === 'string') {
      return sortDirection === 'asc'
        ? (valA as string).localeCompare(valB as string)
        : (valB as string).localeCompare(valA as string);
    }
    return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns: { key: keyof StudentData; label: string }[] = [
    { key: 'Student_ID', label: 'Student ID' },
    { key: 'Attendance_Percentage', label: 'Attendance %' },
    { key: 'Study_Hours_Per_Day', label: 'Study Hours' },
    { key: 'Previous_Semester_Score', label: 'Prev Score' },
    { key: 'Mathematics_Marks', label: 'Math Marks' },
    { key: 'Physics_Marks', label: 'Physics' },
    { key: 'Chemistry_Marks', label: 'Chemistry' },
    { key: 'English_Marks', label: 'English' },
    { key: 'Programming_Marks', label: 'Programming' },
    { key: 'Final_Score', label: 'Final Score' },
  ];

  const exportCSV = () => {
    if (data.length === 0) return;
    const header = columns.map(c => c.label).join(',');
    const rows = data.map(s => columns.map(c => s[c.key]).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'student_performance_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER & SUMMARY BAR */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Actual Student Dataset (student_performance.csv)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Displaying {sortedData.length} records • 10 columns • 0 missing values • Target: Final_Score
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filter Student ID..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* COLUMN QUICK SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {columns.filter(c => c.key !== 'Student_ID').map((col, idx) => {
          const vals = data.map(s => s[col.key] as number);
          const stats = calculateSummaryStats(vals);
          return (
            <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-slate-500 truncate">{col.label}</div>
              <div className="text-base font-extrabold text-slate-900">μ = {stats.mean}</div>
              <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                <span>Min: {stats.min}</span>
                <span>Max: {stats.max}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DATA GRID TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-500">
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition select-none"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{col.label}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/80 transition font-medium">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600">{row.Student_ID}</td>
                    <td className="px-4 py-3">{row.Attendance_Percentage}%</td>
                    <td className="px-4 py-3 font-mono">{row.Study_Hours_Per_Day} hrs</td>
                    <td className="px-4 py-3">{row.Previous_Semester_Score}</td>
                    <td className="px-4 py-3">{row.Mathematics_Marks}</td>
                    <td className="px-4 py-3">{row.Physics_Marks}</td>
                    <td className="px-4 py-3">{row.Chemistry_Marks}</td>
                    <td className="px-4 py-3">{row.English_Marks}</td>
                    <td className="px-4 py-3">{row.Programming_Marks}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 bg-indigo-50/40">{row.Final_Score}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400 font-medium">
                    No matching student records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({sortedData.length} records)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-700 px-2">{currentPage}</span>
            <button
              onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
