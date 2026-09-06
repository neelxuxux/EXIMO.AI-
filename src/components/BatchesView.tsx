import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Mail,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { Batch, Student, ExamType } from '../types';

interface BatchesViewProps {
  batches: Batch[];
  students: Student[];
  onAddBatch: (batch: Batch) => void;
  onAddStudent: (student: Student) => void;
  onSelectStudentForAnalytics: (studentId: string) => void;
}

export const BatchesView: React.FC<BatchesViewProps> = ({
  batches,
  students,
  onAddBatch,
  onAddStudent,
  onSelectStudentForAnalytics,
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
  const [isAddBatchOpen, setIsAddBatchOpen] = useState<boolean>(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false);
  const [searchStudent, setSearchStudent] = useState<string>('');

  // New Batch Form State
  const [newBatchName, setNewBatchName] = useState<string>('');
  const [newBatchExam, setNewBatchExam] = useState<ExamType>('JEE Main');
  const [newBatchYear, setNewBatchYear] = useState<string>('2026');
  const [newBatchLead, setNewBatchLead] = useState<string>('');
  const [newBatchTiming, setNewBatchTiming] = useState<string>('08:00 AM - 01:00 PM');

  // New Student Form State
  const [newStdName, setNewStdName] = useState<string>('');
  const [newStdEmail, setNewStdEmail] = useState<string>('');
  const [newStdRoll, setNewStdRoll] = useState<string>('EXM-2026-');

  const activeBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const batchStudents = students.filter((s) => s.batchId === activeBatch?.id || selectedBatchId === 'all');

  const filteredStudents = batchStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;

    const batch: Batch = {
      id: 'batch_' + Date.now(),
      name: newBatchName,
      targetExam: newBatchExam,
      targetYear: newBatchYear,
      studentCount: 0,
      facultyLead: newBatchLead || 'Senior Faculty',
      timing: newBatchTiming,
      activeTestCount: 1,
      avgAccuracy: 75,
      averageScore: 180,
    };

    onAddBatch(batch);
    setSelectedBatchId(batch.id);
    setIsAddBatchOpen(false);
    setNewBatchName('');
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStdName.trim()) return;

    const std: Student = {
      id: 'std_' + Date.now(),
      rollNumber: newStdRoll || `EXM-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: newStdName,
      email: newStdEmail || `${newStdName.toLowerCase().replace(' ', '.')}@apexacademy.edu`,
      batchId: activeBatch.id,
      batchName: activeBatch.name,
      targetExam: activeBatch.targetExam,
      attendanceRate: 95,
      totalTestsAttempted: 0,
      avgScore: 0,
      rankInBatch: batchStudents.length + 1,
      weakTopics: ['Foundational Concepts'],
      strongTopics: ['Orientation Completed'],
    };

    onAddStudent(std);
    setIsAddStudentOpen(false);
    setNewStdName('');
    setNewStdEmail('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">
              Batches & Student Roster Management
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Organize student cohorts, track aggregate batch progress, and inspect individual academic logs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddBatchOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <Plus className="w-4 h-4 text-zinc-500" /> New Batch
          </button>
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
          >
            <UserCheck className="w-4 h-4" /> Enroll Student
          </button>
        </div>
      </div>

      {/* Batch Cards Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {batches.map((batch) => {
          const isSelected = batch.id === selectedBatchId;
          return (
            <div
              key={batch.id}
              onClick={() => setSelectedBatchId(batch.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {batch.targetExam}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 font-semibold">
                    {batch.studentCount} Students
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-zinc-900 leading-snug">{batch.name}</h3>
                <p className="text-xs text-zinc-500">Lead: {batch.facultyLead}</p>
              </div>

              <div className="border-t border-zinc-100 pt-3 flex justify-between items-center text-xs">
                <span className="text-zinc-500">Accuracy: <strong>{batch.avgAccuracy}%</strong></span>
                <span className="text-indigo-600 font-bold font-mono">Avg {batch.averageScore}m</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Students Table for Selected Batch */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              {activeBatch?.name} — Student Roster ({filteredStudents.length})
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Scheduled Timing: {activeBatch?.timing} • Faculty Lead: {activeBatch?.facultyLead}
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by name or roll..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-56"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-bold border-b border-zinc-200">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Student & Roll No</th>
                <th className="py-3 px-4">Target Exam</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Tests Attempted</th>
                <th className="py-3 px-4">Avg Score</th>
                <th className="py-3 px-4">Identified Weak Areas</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-700">
              {filteredStudents.map((std) => (
                <tr key={std.id} className="hover:bg-zinc-50/80 transition-all">
                  <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">
                    #{std.rankInBatch}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-zinc-900">{std.name}</div>
                    <div className="text-[11px] font-mono text-zinc-400">{std.rollNumber}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-zinc-800">{std.targetExam}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700">{std.attendanceRate}%</td>
                  <td className="py-3.5 px-4 font-medium">{std.totalTestsAttempted} Mocks</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{std.avgScore}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {std.weakTopics.slice(0, 2).map((wt, i) => (
                        <span key={i} className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-rose-200">
                          {wt}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectStudentForAnalytics(std.id)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition-all inline-flex items-center gap-1"
                    >
                      <span>Analytics</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Batch */}
      {isAddBatchOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <h3 className="font-extrabold text-base text-zinc-900">Create New Institute Batch</h3>
            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Batch Name:</label>
                <input
                  type="text"
                  required
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="e.g. JEE Advanced 2026 - Apex Alpha"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Target Exam:</label>
                  <select
                    value={newBatchExam}
                    onChange={(e) => setNewBatchExam(e.target.value as ExamType)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden"
                  >
                    <option value="JEE Main">JEE Main</option>
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="NEET-UG">NEET-UG</option>
                    <option value="CAT (IIM)">CAT (IIM)</option>
                    <option value="CBSE Class 12">CBSE Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Year:</label>
                  <input
                    type="text"
                    value={newBatchYear}
                    onChange={(e) => setNewBatchYear(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Faculty Lead:</label>
                <input
                  type="text"
                  value={newBatchLead}
                  onChange={(e) => setNewBatchLead(e.target.value)}
                  placeholder="e.g. Prof. R. K. Agrawal"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Class Timings:</label>
                <input
                  type="text"
                  value={newBatchTiming}
                  onChange={(e) => setNewBatchTiming(e.target.value)}
                  placeholder="e.g. Mon-Fri 08:00 AM - 01:00 PM"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddBatchOpen(false)}
                  className="flex-1 py-2 bg-zinc-100 text-zinc-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enroll Student */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <h3 className="font-extrabold text-base text-zinc-900">Enroll Student into {activeBatch.name}</h3>
            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Student Full Name:</label>
                <input
                  type="text"
                  required
                  value={newStdName}
                  onChange={(e) => setNewStdName(e.target.value)}
                  placeholder="e.g. Siddharth Joshi"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Student Email:</label>
                <input
                  type="email"
                  value={newStdEmail}
                  onChange={(e) => setNewStdEmail(e.target.value)}
                  placeholder="siddharth.j@apexacademy.edu"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Roll Number:</label>
                <input
                  type="text"
                  value={newStdRoll}
                  onChange={(e) => setNewStdRoll(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-900 font-mono focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="flex-1 py-2 bg-zinc-100 text-zinc-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
