import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  FileText,
  Award,
  ChevronRight,
  BookOpen,
  Calendar,
  Target,
  BarChart2,
  Percent,
  X,
  ArrowUpRight,
  HelpCircle,
  Eye,
  Check,
  RotateCcw,
  Zap,
  UserCheck
} from 'lucide-react';
import { Student, TestBlueprint, TestAttemptResult, Batch, RemedialPlan, QuestionAttemptState } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface TrendTooltipPayload {
  name: string;
  value: number | string;
  payload: {
    label: string;
    name: string;
    fullTitle: string;
    date: string;
    score: number;
    accuracy: number;
    percentile?: number;
    marks?: number;
    maxMarks?: number;
  };
}

const CustomTrendTooltip = ({ active, payload }: { active?: boolean; payload?: TrendTooltipPayload[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-950 text-white p-3 rounded-xl border border-zinc-800 shadow-xl text-xs space-y-1.5 max-w-[240px]">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-1.5">
          <span className="font-extrabold text-indigo-400">{data.label}</span>
          <span className="text-[10px] text-zinc-400">{data.date}</span>
        </div>
        <p className="font-semibold text-zinc-200 text-[11px] line-clamp-2 leading-tight">
          {data.fullTitle}
        </p>
        <div className="pt-1 space-y-1">
          <div className="flex justify-between items-center text-zinc-300">
            <span>Score:</span>
            <strong className="text-white font-mono text-sm">{data.score}%</strong>
          </div>
          {data.marks !== undefined && data.maxMarks !== undefined && (
            <div className="flex justify-between items-center text-[10px] text-zinc-400">
              <span>Marks:</span>
              <span className="font-mono text-zinc-300">{data.marks} / {data.maxMarks}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-[10px] text-zinc-400">
            <span>Accuracy:</span>
            <span className="font-mono text-emerald-400 font-semibold">{data.accuracy}%</span>
          </div>
          {data.percentile && (
            <div className="flex justify-between items-center text-[10px] text-zinc-400">
              <span>Percentile:</span>
              <span className="font-mono text-indigo-300">{data.percentile}%ile</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

interface StudentDashboardViewProps {
  student: Student;
  students: Student[];
  onSelectStudent: (studentId: string) => void;
  testPapers: TestBlueprint[];
  attemptResults: TestAttemptResult[];
  batches: Batch[];
  onLaunchCbt: (paper: TestBlueprint) => void;
  onNavigate: (tabId: string) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  student,
  students,
  onSelectStudent,
  testPapers,
  attemptResults,
  batches,
  onLaunchCbt,
  onNavigate,
}) => {
  // Active modal/drawer states
  const [selectedAttemptForReview, setSelectedAttemptForReview] = useState<TestAttemptResult | null>(null);
  const [selectedTestForInstructions, setSelectedTestForInstructions] = useState<TestBlueprint | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [remedialPlan, setRemedialPlan] = useState<RemedialPlan | null>(null);
  const [showRemedialModal, setShowRemedialModal] = useState<boolean>(false);
  const [testFilter, setTestFilter] = useState<'all' | 'assigned' | 'live'>('all');

  // Filter student's attempts
  const studentAttempts = attemptResults.filter(
    (att) => att.studentId === student.id || att.studentName.toLowerCase() === student.name.toLowerCase()
  );

  // If this student has no specific attempts in mock data, fallback to show available attempts
  const displayAttempts = studentAttempts.length > 0 ? studentAttempts : attemptResults.slice(0, 2);

  // Calculate personal performance metrics
  const totalAttemptsCount = displayAttempts.length || student.totalTestsAttempted || 1;
  const avgPercentage = displayAttempts.length > 0
    ? Math.round(displayAttempts.reduce((acc, a) => acc + a.percentage, 0) / displayAttempts.length)
    : Math.round((student.avgScore / 300) * 100);

  const avgAccuracy = displayAttempts.length > 0
    ? Math.round(displayAttempts.reduce((acc, a) => acc + a.accuracy, 0) / displayAttempts.length)
    : 85;

  const latestAttempt = displayAttempts[0];
  const bestPercentile = displayAttempts.length > 0
    ? Math.max(...displayAttempts.map((a) => a.percentile))
    : 98.6;

  const totalTimeSpentMinutes = Math.round(
    displayAttempts.reduce((acc, a) => acc + (a.timeTakenSeconds || 0), 0) / 60
  );

  // Filter upcoming tests
  const relevantTests = testPapers.filter((t) => {
    if (testFilter === 'live') return t.status === 'Live';
    if (testFilter === 'assigned') return t.targetBatchIds.includes(student.batchId);
    return true;
  });

  // Calculate sectional mastery from attempts
  const sectionalMastery: Record<string, { scored: number; total: number; accuracy: number; count: number }> = {};
  displayAttempts.forEach((att) => {
    if (att.sectionScores) {
      (Object.entries(att.sectionScores) as [string, { scored: number; total: number; accuracy: number }][]).forEach(([section, data]) => {
        if (!sectionalMastery[section]) {
          sectionalMastery[section] = { scored: 0, total: 0, accuracy: 0, count: 0 };
        }
        sectionalMastery[section].scored += data.scored;
        sectionalMastery[section].total += data.total;
        sectionalMastery[section].accuracy += data.accuracy;
        sectionalMastery[section].count += 1;
      });
    }
  });

  // Fallback sectional data if empty
  const defaultSections = [
    { name: 'Physics', accuracy: 88, mastery: 'Strong (Rank #2 in Batch)' },
    { name: 'Chemistry', accuracy: 85, mastery: 'Solid Concept Grasp' },
    { name: 'Mathematics', accuracy: 64, mastery: 'Needs Timed Practice' },
  ];

  // Prepare last 5 test attempts for Recharts score trend visualization
  const basePercentage = Math.round((student.avgScore / 300) * 100) || 75;
  const historicalBaseline = [
    {
      name: 'Diagnostic Mock #01',
      fullTitle: `${student.targetExam} Diagnostic Benchmark Assessment`,
      date: 'Feb 10',
      score: Math.max(48, basePercentage - 14),
      accuracy: Math.max(52, avgAccuracy - 12),
      percentile: 91.4,
      marks: Math.round((Math.max(48, basePercentage - 14) / 100) * 300),
      maxMarks: 300,
    },
    {
      name: 'Drill Mock #02',
      fullTitle: `${student.targetExam} Concept Drill: Mechanics & Physical Chem`,
      date: 'Feb 17',
      score: Math.max(54, basePercentage - 9),
      accuracy: Math.max(58, avgAccuracy - 8),
      percentile: 93.8,
      marks: Math.round((Math.max(54, basePercentage - 9) / 100) * 300),
      maxMarks: 300,
    },
    {
      name: 'Speed Mock #03',
      fullTitle: `${student.targetExam} Sectional Speed Test #03 (Timed)`,
      date: 'Feb 24',
      score: Math.max(58, basePercentage - 3),
      accuracy: Math.max(62, avgAccuracy - 4),
      percentile: 95.5,
      marks: Math.round((Math.max(58, basePercentage - 3) / 100) * 300),
      maxMarks: 300,
    },
  ];

  // Map real attempts in chronological order (oldest to newest)
  const realAttemptPoints = [...displayAttempts].reverse().map((att, idx) => ({
    name: att.testTitle.length > 22 ? att.testTitle.substring(0, 20) + '...' : att.testTitle,
    fullTitle: att.testTitle,
    date: att.submittedAt.split(' ')[0] || `Test ${idx + 1}`,
    score: Math.round(att.percentage),
    accuracy: Math.round(att.accuracy),
    percentile: att.percentile,
    marks: att.totalMarksAwarded,
    maxMarks: att.maxMarks,
  }));

  // Combine baseline + real attempts and select the last 5
  const combinedAttemptsList = [...historicalBaseline, ...realAttemptPoints];
  const last5AttemptsData = combinedAttemptsList.slice(-5).map((item, index) => ({
    ...item,
    label: `Attempt ${index + 1}`,
  }));

  const firstAttemptScore = last5AttemptsData[0]?.score || 0;
  const latestAttemptScore = last5AttemptsData[last5AttemptsData.length - 1]?.score || 0;
  const scoreTrendDiff = latestAttemptScore - firstAttemptScore;
  const peakScoreIn5 = Math.max(...last5AttemptsData.map((d) => d.score));

  // AI Remedial generation handler
  const handleGenerateStudentRemedial = async () => {
    setIsGeneratingPlan(true);
    setShowRemedialModal(true);

    try {
      const response = await fetch('/api/ai/generate-remedial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          examTarget: student.targetExam,
          weakTopics: student.weakTopics,
          strongTopics: student.strongTopics,
          averageScore: avgPercentage,
          accuracy: avgAccuracy,
        }),
      });

      const data = await response.json();
      if (data.success && data.plan) {
        setRemedialPlan(data.plan);
      }
    } catch (err) {
      console.error('Failed to generate student remedial plan:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome Header & Profile Card */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-zinc-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-indigo-600/30 shrink-0">
              {student.name.split(' ').map((n) => n[0]).join('')}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {student.name}
                </h1>
                <span className="bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full text-xs font-bold border border-indigo-500/30">
                  {student.targetExam} Aspirant
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Candidate
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                <span>Roll: <strong className="text-zinc-200 font-mono">{student.rollNumber}</strong></span>
                <span>•</span>
                <span>Batch: <strong className="text-zinc-200">{student.batchName}</strong></span>
                <span>•</span>
                <span>Attendance: <strong className="text-emerald-400 font-semibold">{student.attendanceRate}%</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Student Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-700 text-xs">
              <span className="text-zinc-400 hidden sm:inline">Switch Student:</span>
              <select
                aria-label="Switch Student Profile"
                value={student.id}
                onChange={(e) => onSelectStudent(e.target.value)}
                className="bg-transparent text-zinc-100 font-semibold focus:outline-none cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="bg-zinc-900 text-white">
                    {s.name} ({s.targetExam})
                  </option>
                ))}
              </select>
            </div>

            <button
              id="generate-remedial-btn"
              onClick={handleGenerateStudentRemedial}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              AI Study Plan
            </button>
          </div>
        </div>

        {/* Quick Diagnostic Ribbon */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-zinc-400 block text-[11px] font-medium">Batch Standing</span>
            <div className="text-lg font-bold text-zinc-100 mt-0.5">
              Rank #{student.rankInBatch} <span className="text-zinc-400 font-normal text-[11px]">(Top 5%)</span>
            </div>
          </div>

          <div>
            <span className="text-zinc-400 block text-[11px] font-medium">Average Test Score</span>
            <div className="text-lg font-bold text-zinc-100 mt-0.5">
              {student.avgScore} <span className="text-zinc-400 font-normal text-[11px]">/ 300 Marks</span>
            </div>
          </div>

          <div>
            <span className="text-zinc-400 block text-[11px] font-medium">Best Percentile</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {bestPercentile} %ile
            </div>
          </div>

          <div>
            <span className="text-zinc-400 block text-[11px] font-medium">Mock Tests Logged</span>
            <div className="text-lg font-bold text-zinc-100 mt-0.5">
              {student.totalTestsAttempted} Tests <span className="text-zinc-400 font-normal text-[11px]">({totalTimeSpentMinutes}m in CBT)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary 4 Performance Trend Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Overall Accuracy</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-zinc-900">{avgAccuracy}%</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4.2% higher than batch median</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Average Marks %</span>
            <Percent className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-zinc-900">{avgPercentage}%</div>
          <span className="text-[11px] text-zinc-500 block">
            Across full-syllabus mock papers
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Completed Tests</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-zinc-900">{displayAttempts.length}</div>
          <span className="text-[11px] text-zinc-500 block">
            Official NTA/CAT evaluations
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Exam Readiness</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-indigo-600">Tier 1</div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            Projected: Top 0.5% All-India
          </span>
        </div>
      </div>

      {/* Performance Trends & Topic Mastery Dual Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Performance Trend Trajectory & Sectional Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Trajectory Card */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-zinc-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Personal Performance Trends & Score Trajectory
                </h2>
                <p className="text-xs text-zinc-500">
                  Tracking your accuracy, percentile, and negative mark avoidance across recent exams
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 w-fit">
                Batch: {student.batchName}
              </span>
            </div>

            {/* Recharts Score Progression Line Chart */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                      Test Score Trend (Last 5 Attempts)
                    </h3>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                      Recharts Line View
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Visualizing percentage score (%) progress over time across recent mock attempts
                  </p>
                </div>

                {/* Score Trend Summary Badges */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs bg-white px-3 py-1.5 rounded-lg border border-zinc-200 shadow-2xs">
                    <span className="text-zinc-500 text-[11px]">Net Progress:</span>
                    <span
                      className={`font-extrabold font-mono ${
                        scoreTrendDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {scoreTrendDiff >= 0 ? `+${scoreTrendDiff}%` : `${scoreTrendDiff}%`}
                    </span>
                    {scoreTrendDiff >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    )}
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-xs bg-white px-3 py-1.5 rounded-lg border border-zinc-200 shadow-2xs">
                    <span className="text-zinc-500 text-[11px]">Peak Score:</span>
                    <span className="font-extrabold font-mono text-indigo-600">{peakScoreIn5}%</span>
                  </div>
                </div>
              </div>

              {/* Responsive Container for Recharts LineChart */}
              <div className="w-full h-60 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last5AttemptsData} margin={{ top: 10, right: 16, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip content={<CustomTrendTooltip />} />
                    <ReferenceLine
                      y={75}
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Batch Avg (75%)',
                        fill: '#64748b',
                        fontSize: 10,
                        position: 'insideTopRight',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Score (%)"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#4f46e5', stroke: '#c7d2fe', strokeWidth: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      name="Accuracy (%)"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: '#10b981', stroke: '#ffffff', strokeWidth: 1.5 }}
                      activeDot={{ r: 5, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Legend & Guidance Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200/60 text-[11px] text-zinc-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                    <span className="font-semibold text-zinc-700">Test Score (%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-emerald-500 inline-block"></span>
                    <span className="font-semibold text-zinc-700">Accuracy Rate (%)</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span className="w-3 border-t border-dashed border-zinc-400 inline-block"></span>
                    <span>Batch Avg Benchmark (75%)</span>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400">Hover over points to view marks and detailed score breakdowns</span>
              </div>
            </div>

            {/* Test progression cards */}
            <div className="space-y-3">
              {displayAttempts.map((att, idx) => {
                const isLatest = idx === 0;
                return (
                  <div
                    key={att.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isLatest ? 'bg-indigo-50/40 border-indigo-200 shadow-xs' : 'bg-zinc-50/70 border-zinc-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-900">{att.testTitle}</span>
                          {isLatest && (
                            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            {att.submittedAt}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            {Math.round(att.timeTakenSeconds / 60)} mins taken
                          </span>
                        </div>
                      </div>

                      {/* Score metrics */}
                      <div className="flex items-center gap-4 sm:justify-end">
                        <div className="text-right">
                          <div className="text-base font-extrabold text-zinc-900">
                            {att.totalMarksAwarded} <span className="text-zinc-400 text-xs font-normal">/ {att.maxMarks}</span>
                          </div>
                          <span className="text-[11px] font-bold text-indigo-600">{att.percentage}% score</span>
                        </div>

                        <div className="text-right pl-3 border-l border-zinc-200">
                          <div className="text-base font-extrabold text-emerald-600">
                            {att.percentile}%ile
                          </div>
                          <span className="text-[11px] font-medium text-zinc-500">Rank #{att.rank}/{att.totalParticipants}</span>
                        </div>

                        <button
                          onClick={() => setSelectedAttemptForReview(att)}
                          className="px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-lg border border-zinc-200 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Review</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] text-zinc-500 mb-1">
                        <span>Accuracy: <strong>{att.accuracy}%</strong></span>
                        <span>Marks: <strong>{att.totalMarksAwarded}/{att.maxMarks}</strong> ({att.percentage}%)</span>
                      </div>
                      <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, att.percentage)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sectional Mastery Breakdown */}
            <div className="pt-4 border-t border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                Subject & Sectional Accuracy Distribution
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.keys(sectionalMastery).length > 0
                  ? Object.entries(sectionalMastery).map(([sectionName, data]) => {
                      const acc = Math.round(data.accuracy / (data.count || 1));
                      return (
                        <div key={sectionName} className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-zinc-800">{sectionName}</span>
                            <span className="text-xs font-extrabold text-indigo-600">{acc}%</span>
                          </div>
                          <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                acc >= 80 ? 'bg-emerald-500' : acc >= 60 ? 'bg-indigo-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${acc}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] text-zinc-500 block">
                            Total scored: {data.scored} / {data.total}
                          </span>
                        </div>
                      );
                    })
                  : defaultSections.map((sec) => (
                      <div key={sec.name} className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-zinc-800">{sec.name}</span>
                          <span className="text-xs font-extrabold text-indigo-600">{sec.accuracy}%</span>
                        </div>
                        <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              sec.accuracy >= 80 ? 'bg-emerald-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${sec.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-zinc-500 block">{sec.mastery}</span>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Cognitive Diagnostics & AI Recommendations */}
        <div className="space-y-6">
          {/* Topic Mastery Radar */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Cognitive Diagnostics
              </h2>
              <p className="text-xs text-zinc-500">
                AI analysis of your test responses and error patterns
              </p>
            </div>

            {/* Strengths */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Mastered Strong Topics
              </span>
              <div className="flex flex-wrap gap-1.5">
                {student.strongTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Critical Gaps / Revision Priority */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Revision Priorities (Mark-Leaks)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {student.weakTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="text-xs bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200 font-medium flex items-center gap-1"
                  >
                    <span>{topic}</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1 rounded font-bold">Focus</span>
                  </span>
                ))}
              </div>
            </div>

            {/* AI Action Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-zinc-900 text-white space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Eximo Neural Academic Advisor</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Your accuracy in <strong>{student.weakTopics[0] || 'Rotational Dynamics'}</strong> indicates calculation rush in step derivations. Resolving this will yield an estimated <strong>+16 to +20 marks</strong>.
              </p>
              <button
                id="generate-remedial-sidebar-btn"
                onClick={handleGenerateStudentRemedial}
                className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                Generate 7-Day Recovery Roadmap
              </button>
            </div>
          </div>

          {/* Quick Study Checklist */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Recommended Daily Drills
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-800 block">PYQ Sprint: {student.weakTopics[0]}</strong>
                  <span className="text-zinc-500">20 Level-2 questions with negative marking timer</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-800 block">Full NTA Mock Test Simulator</strong>
                  <span className="text-zinc-500">Scheduled for Saturday 10:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming & Assigned Tests Section */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Upcoming & Live Assessments
            </h2>
            <p className="text-xs text-zinc-500">
              Assigned tests and scheduled institute mock exams for your batch
            </p>
          </div>

          {/* Filters */}
          <div className="inline-flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs">
            <button
              onClick={() => setTestFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                testFilter === 'all' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              All Tests ({testPapers.length})
            </button>
            <button
              onClick={() => setTestFilter('assigned')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                testFilter === 'assigned' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              My Batch Tests
            </button>
            <button
              onClick={() => setTestFilter('live')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                testFilter === 'live' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Now ({testPapers.filter((t) => t.status === 'Live').length})
            </button>
          </div>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {relevantTests.map((test) => {
            const isLive = test.status === 'Live';
            const isBatchAssigned = test.targetBatchIds.includes(student.batchId);

            return (
              <div
                key={test.id}
                className="flex flex-col justify-between p-5 rounded-2xl border border-zinc-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                      {test.examType}
                    </span>

                    {isLive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        Live in CBT
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {test.status}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {test.title}
                  </h3>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 py-2 border-y border-zinc-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{test.totalDurationMinutes} Mins</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{test.totalMarks} Marks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{test.sections.length} Sections</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Cutoff: {test.cutoffPercentage}%</span>
                    </div>
                  </div>

                  {/* Sections list */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Sections:</span>
                    <div className="flex flex-wrap gap-1">
                      {test.sections.map((sec) => (
                        <span key={sec.id} className="text-[11px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-medium">
                          {sec.name} ({sec.questions.length} Q)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action CTA */}
                <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedTestForInstructions(test)}
                    className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 underline underline-offset-2 cursor-pointer"
                  >
                    Instructions
                  </button>

                  <button
                    id={`launch-cbt-${test.id}`}
                    onClick={() => onLaunchCbt(test)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                      isLive
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                    }`}
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>{isLive ? 'Launch Exam' : 'Practice Test'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary of Recent Test Attempts Section */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Summary of Recent Test Attempts
            </h2>
            <p className="text-xs text-zinc-500">
              Detailed performance history, percentile standings, and faculty/AI evaluation scores
            </p>
          </div>
          <span className="text-xs font-bold text-zinc-500">
            {displayAttempts.length} Completed Attempts Logged
          </span>
        </div>

        {/* Attempts Table/Cards */}
        <div className="space-y-4">
          {displayAttempts.map((attempt) => (
            <div
              key={attempt.id}
              className="p-5 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-indigo-200 uppercase tracking-wider">
                    {attempt.batchName}
                  </span>
                  <span className="text-xs text-zinc-400">ID: {attempt.id}</span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {attempt.submittedAt}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-zinc-900">
                  {attempt.testTitle}
                </h3>

                {/* Section breakdown tags */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {attempt.sectionScores &&
                    (Object.entries(attempt.sectionScores) as [string, { scored: number; total: number; accuracy: number }][]).map(([sec, val]) => (
                      <span
                        key={sec}
                        className="bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-md text-[11px] font-medium"
                      >
                        {sec}: <strong className="text-zinc-900">{val.scored}/{val.total}</strong> ({val.accuracy}% acc)
                      </span>
                    ))}
                </div>
              </div>

              {/* Right Statistics Box */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-5 shrink-0">
                <div className="text-center px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-200 min-w-[90px]">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Score</span>
                  <div className="text-base font-black text-zinc-900">
                    {attempt.totalMarksAwarded} <span className="text-zinc-400 text-xs font-normal">/ {attempt.maxMarks}</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-indigo-600">{attempt.percentage}%</span>
                </div>

                <div className="text-center px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-200 min-w-[90px]">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Accuracy</span>
                  <div className="text-base font-black text-emerald-600">
                    {attempt.accuracy}%
                  </div>
                  <span className="text-[10px] text-zinc-500">Correct Ratio</span>
                </div>

                <div className="text-center px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-200 min-w-[90px]">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Percentile</span>
                  <div className="text-base font-black text-indigo-700">
                    {attempt.percentile}%ile
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500">Rank #{attempt.rank}</span>
                </div>

                <button
                  id={`review-attempt-${attempt.id}`}
                  onClick={() => setSelectedAttemptForReview(attempt)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>View Analysis</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attempt Review Modal Drawer */}
      {selectedAttemptForReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Exam Analysis & Scorecard</span>
                <h3 className="text-xl font-extrabold text-zinc-900 mt-1">
                  {selectedAttemptForReview.testTitle}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Candidate: {selectedAttemptForReview.studentName} • Submitted on {selectedAttemptForReview.submittedAt}
                </p>
              </div>
              <button
                onClick={() => setSelectedAttemptForReview(null)}
                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scorecard KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Marks Awarded</span>
                <div className="text-2xl font-black text-zinc-900 mt-1">
                  {selectedAttemptForReview.totalMarksAwarded} <span className="text-xs font-normal text-zinc-400">/ {selectedAttemptForReview.maxMarks}</span>
                </div>
                <span className="text-xs font-extrabold text-indigo-600">{selectedAttemptForReview.percentage}%</span>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Accuracy</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {selectedAttemptForReview.accuracy}%
                </div>
                <span className="text-xs text-zinc-500">Correct answers</span>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">All-India Percentile</span>
                <div className="text-2xl font-black text-indigo-700 mt-1">
                  {selectedAttemptForReview.percentile} %ile
                </div>
                <span className="text-xs font-bold text-zinc-500">Rank #{selectedAttemptForReview.rank} in batch</span>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Time Invested</span>
                <div className="text-2xl font-black text-zinc-900 mt-1">
                  {Math.round(selectedAttemptForReview.timeTakenSeconds / 60)} <span className="text-xs font-normal text-zinc-400">Mins</span>
                </div>
                <span className="text-xs text-zinc-500">CBT clock</span>
              </div>
            </div>

            {/* Sectional Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Section-wise Score Distribution
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedAttemptForReview.sectionScores &&
                  (Object.entries(selectedAttemptForReview.sectionScores) as [string, { scored: number; total: number; accuracy: number }][]).map(([sec, val]) => (
                    <div key={sec} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-zinc-900">{sec}</span>
                        <span className="text-xs font-extrabold text-indigo-600">{val.accuracy}% acc</span>
                      </div>
                      <div className="text-xs text-zinc-600">
                        Scored: <strong>{val.scored}</strong> / {val.total} marks
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* AI Feedback if present */}
            {(Object.values(selectedAttemptForReview.answers) as QuestionAttemptState[]).some((a) => a.aiEvaluation) && (
              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI Rubric Diagnostic & Evaluator Feedback
                </div>
                {(Object.values(selectedAttemptForReview.answers) as QuestionAttemptState[])
                  .filter((a) => a.aiEvaluation)
                  .map((a, i) => (
                    <div key={i} className="text-xs text-zinc-700 space-y-1 bg-white p-3 rounded-xl border border-indigo-100">
                      <div className="font-semibold text-zinc-900">
                        {a.aiEvaluation?.conceptUnderstanding} Concept Understanding ({a.aiEvaluation?.awardedMarks} Marks)
                      </div>
                      <p className="text-zinc-600 leading-relaxed">{a.aiEvaluation?.aiFeedback}</p>
                      {a.aiEvaluation?.improvementTip && (
                        <div className="text-indigo-700 font-medium text-[11px] pt-1 border-t border-zinc-100">
                          <strong>Improvement Advice:</strong> {a.aiEvaluation.improvementTip}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
              <button
                onClick={() => setSelectedAttemptForReview(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Instructions Modal */}
      {selectedTestForInstructions && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-zinc-200 p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between border-b border-zinc-200 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{selectedTestForInstructions.examType} Guidelines</span>
                <h3 className="text-lg font-extrabold text-zinc-900 mt-1">
                  {selectedTestForInstructions.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTestForInstructions(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-600">
              <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">Exam Instructions:</h4>
              <ul className="space-y-2 list-disc list-inside">
                {selectedTestForInstructions.instructions.map((inst, i) => (
                  <li key={i} className="leading-relaxed">{inst}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] font-bold uppercase">Duration</span>
                <strong className="text-zinc-900">{selectedTestForInstructions.totalDurationMinutes} Minutes</strong>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] font-bold uppercase">Total Marks</span>
                <strong className="text-zinc-900">{selectedTestForInstructions.totalMarks} Marks</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
              <button
                onClick={() => setSelectedTestForInstructions(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const test = selectedTestForInstructions;
                  setSelectedTestForInstructions(null);
                  onLaunchCbt(test);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Start CBT Test Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Remedial Plan Modal */}
      {showRemedialModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Personalized AI Recovery Plan
                </span>
                <h3 className="text-xl font-extrabold text-zinc-900 mt-1">
                  7-Day Score Elevation Roadmap for {student.name}
                </h3>
              </div>
              <button
                onClick={() => setShowRemedialModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isGeneratingPlan ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-zinc-900">Synthesizing Diagnostic Data...</h4>
                  <p className="text-xs text-zinc-500">Analyzing error patterns, time-per-question velocity, and syllabus leak points.</p>
                </div>
              </div>
            ) : remedialPlan ? (
              <div className="space-y-6">
                {/* Diagnostic Summary */}
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs space-y-2">
                  <strong className="text-indigo-900 font-bold block">Academic Diagnosis:</strong>
                  <p className="text-zinc-700 leading-relaxed">{remedialPlan.diagnosticSummary}</p>
                  <div className="pt-2 border-t border-indigo-100 font-semibold text-indigo-800">
                    Expected Jump: <span className="text-emerald-700 font-bold">{remedialPlan.expectedScoreJump}</span>
                  </div>
                </div>

                {/* Exam Strategy */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                  <strong className="text-zinc-900 font-bold block">Tactical Exam Strategy:</strong>
                  <p className="text-zinc-600 leading-relaxed">{remedialPlan.recommendedExamStrategy}</p>
                </div>

                {/* Weekly Plan */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    7-Day Action Calendar
                  </h4>
                  <div className="space-y-2.5">
                    {remedialPlan.weeklyPlan.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-zinc-200 bg-white space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {item.day}: {item.focus}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-medium">{item.practiceTarget}</span>
                        </div>
                        <p className="text-xs text-zinc-700">{item.action}</p>
                        <div className="text-[11px] text-amber-700 font-medium">
                          <strong>Trap to Avoid:</strong> {item.keyTrapToAvoid}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-zinc-500">
                Failed to generate roadmap. Please try again.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
              <button
                onClick={() => setShowRemedialModal(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
