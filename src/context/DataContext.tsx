import React, { createContext, useContext, useState, useEffect } from 'react';
import Papa from 'papaparse';
import type { StudentData, PageId } from '../types';

interface DataContextType {
  data: StudentData[];
  loading: boolean;
  error: string | null;
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  uploadDataset: (file: File) => void;
  resetDataset: () => void;
  filteredData: StudentData[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<PageId>('home');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadDefaultDataset = () => {
    setLoading(true);
    setError(null);
    fetch('/student_performance.csv')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load dataset file');
        return res.text();
      })
      .then(csvText => {
        Papa.parse<StudentData>(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              const cleaned = results.data.map((row: any) => ({
                Student_ID: String(row.Student_ID || 'STU-000'),
                Attendance_Percentage: Number(row.Attendance_Percentage) || 0,
                Study_Hours_Per_Day: Number(row.Study_Hours_Per_Day) || 0,
                Previous_Semester_Score: Number(row.Previous_Semester_Score) || 0,
                Mathematics_Marks: Number(row.Mathematics_Marks) || 0,
                Physics_Marks: Number(row.Physics_Marks) || 0,
                Chemistry_Marks: Number(row.Chemistry_Marks) || 0,
                English_Marks: Number(row.English_Marks) || 0,
                Programming_Marks: Number(row.Programming_Marks) || 0,
                Final_Score: Number(row.Final_Score) || 0,
              }));
              setData(cleaned);
            }
            setLoading(false);
          },
          error: (err: any) => {
            setError(err.message);
            setLoading(false);
          }
        });
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDefaultDataset();
  }, []);

  const uploadDataset = (file: File) => {
    setLoading(true);
    setError(null);
    Papa.parse<StudentData>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const cleaned = results.data.map((row: any, idx: number) => ({
            Student_ID: String(row.Student_ID || `STU-${1000 + idx}`),
            Attendance_Percentage: Number(row.Attendance_Percentage) || 0,
            Study_Hours_Per_Day: Number(row.Study_Hours_Per_Day) || 0,
            Previous_Semester_Score: Number(row.Previous_Semester_Score) || 0,
            Mathematics_Marks: Number(row.Mathematics_Marks) || 0,
            Physics_Marks: Number(row.Physics_Marks) || 0,
            Chemistry_Marks: Number(row.Chemistry_Marks) || 0,
            English_Marks: Number(row.English_Marks) || 0,
            Programming_Marks: Number(row.Programming_Marks) || 0,
            Final_Score: Number(row.Final_Score) || 0,
          }));
          setData(cleaned);
        }
        setLoading(false);
      },
      error: (err: any) => {
        setError(err.message);
        setLoading(false);
      }
    });
  };

  const resetDataset = () => {
    loadDefaultDataset();
  };

  const filteredData = data.filter(item =>
    item.Student_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.Final_Score.toString().includes(searchTerm)
  );

  return (
    <DataContext.Provider
      value={{
        data,
        loading,
        error,
        activePage,
        setActivePage,
        uploadDataset,
        resetDataset,
        filteredData,
        searchTerm,
        setSearchTerm
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
