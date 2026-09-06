import React, { useState } from 'react';
import {
  Building2,
  GitCompare,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  BarChart2,
  PieChart,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Percent,
  Compass
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { CampusBranch, TestBlueprint, Batch } from '../types';
import { INITIAL_BRANCHES } from '../mockData';

interface BranchBenchmarkingViewProps {
  testPapers: TestBlueprint[];
  batches: Batch[];
  branches?: CampusBranch[];
}

export const BranchBenchmarkingView: React.FC<BranchBenchmarkingViewProps> = ({
  testPapers,
  batches,
  branches = INITIAL_BRANCHES,
}) => {
  const [selectedTestId, setSelectedTestId] = useState<string>(testPapers[0]?.id || 'all');
  const [comparisonMetric, setComparisonMetric] = useState<'overall' | 'cutoff' | 'subjects'>('overall');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || 'branch_kota');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const activeBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const selectedTest = testPapers.find((t) => t.id === selectedTestId);

  // Prepare Recharts data for Branch Average Scores vs Cutoff Benchmark
  const branchScoresComparisonData = branches.map((b) => ({
    name: b.name.replace(' Campus', '').replace(' Center', ''),
    fullName: b.name,
    avgScore: b.overallAvgScore,
    cutoffRate: b.cutoffClearanceRate,
    topScore: b.topScore,
    students: b.totalStudents,
    topPercentiles: b.topPercentileCount,
  }));

  // Prepare Recharts data for Subject-Wise Regional Parity
  const subjectParityData = branches.map((b) => ({
    name: b.name.split(' ')[0], // 'Kota', 'Delhi', 'Hyderabad', 'Bengaluru'
    Physics: b.subjectAverages.physics,
    Chemistry: b.subjectAverages.chemistry,
    Mathematics: b.subjectAverages.mathematics,
  }));

  // Prepare Radar Data for Kota vs Delhi vs Hyderabad vs Bengaluru across key dimensions
  const radarDimensionsData = [
    { dimension: 'Avg Score', Kota: 88, Delhi: 74, Hyderabad: 82, Bengaluru: 70 },
    { dimension: 'Cutoff %', Kota: 85, Delhi: 76, Hyderabad: 81, Bengaluru: 73 },
    { dimension: 'Attendance', Kota: 96, Delhi: 92, Hyderabad: 95, Bengaluru: 93 },
    { dimension: 'Top 1% Club', Kota: 92, Delhi: 78, Hyderabad: 88, Bengaluru: 72 },
    { dimension: 'Math Parity', Kota: 82, Delhi: 65, Hyderabad: 80, Bengaluru: 66 },
    { dimension: 'Chem Mastery', Kota: 94, Delhi: 84, Hyderabad: 90, Bengaluru: 80 },
  ];

  const handleExportCsv = () => {
    const csvRows = [
      ['Branch Name', 'Code', 'City', 'Center Head', 'Students', 'Avg Score (300)', 'Cutoff Clearance %', 'Top Score', 'Top 99%ile Count', 'Attendance %'],
      ...branches.map((b) => [
        `"${b.name}"`,
        b.code,
        b.city,
        `"${b.centerHead}"`,
        b.totalStudents,
        b.overallAvgScore,
        `${b.cutoffClearanceRate}%`,
        b.topScore,
        b.topPercentileCount,
        `${b.attendanceRate}%`,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Eximo_Cross_Branch_Benchmarking_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Multi-Campus Leadership Suite
            </span>
            <span className="text-zinc-400">•</span>
            <span className="text-xs text-zinc-500 font-medium">Standardized Assessment Normalization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mt-1">
            Cross-Batch & Branch Benchmarking
          </h1>
          <p className="text-sm text-zinc-600 mt-1 max-w-3xl">
            Compare student score distributions, subject parity indexes, and cutoff clearance ratios across 4 regional
            campuses and parallel batches tested on the same standardized paper.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            {downloadSuccess ? 'Exported CSV ✓' : 'Export Benchmark CSV'}
          </button>
        </div>
      </div>

      {/* Test Paper & Filter Selector Bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Benchmark Test Paper</label>
            <select
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Consolidated Cumulative Mock Index (All Tests)</option>
              {testPapers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.examType} • {t.totalMarks} Marks)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Metric Dimension</label>
            <div className="inline-flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs">
              <button
                onClick={() => setComparisonMetric('overall')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  comparisonMetric === 'overall' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Average & Cutoff
              </button>
              <button
                onClick={() => setComparisonMetric('subjects')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  comparisonMetric === 'subjects' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Subject Parity
              </button>
              <button
                onClick={() => setComparisonMetric('cutoff')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  comparisonMetric === 'cutoff' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Radar Profile
              </button>
            </div>
          </div>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-100 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Total Enrolled Candidates</span>
            <div className="text-lg font-black text-zinc-900">
              {branches.reduce((acc, b) => acc + b.totalStudents, 0)} Students
            </div>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-1 rounded-full border border-emerald-200">
            4 Campuses Active
          </span>
        </div>
      </div>

      {/* Regional Campus Standing Leaderboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {branches.map((b, idx) => {
          const isSelected = b.id === selectedBranchId;
          return (
            <div
              key={b.id}
              onClick={() => setSelectedBranchId(b.id)}
              className={`p-5 rounded-3xl cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white border-zinc-200/80 hover:border-zinc-300 shadow-xs'
              } space-y-3.5`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md">
                  Rank #{idx + 1}
                </span>
                <span className="text-[11px] font-mono font-bold text-zinc-400">{b.code}</span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-zinc-900 leading-snug">{b.name}</h3>
                <p className="text-xs text-zinc-500">{b.city}, {b.state}</p>
              </div>

              {/* Core metrics */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-100 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase">Avg Score</span>
                  <p className="font-black text-zinc-900 font-mono text-base">{b.overallAvgScore} <span className="text-[10px] font-normal text-zinc-400">/300</span></p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase">Cutoff Rate</span>
                  <p className="font-black text-emerald-600 font-mono text-base">{b.cutoffClearanceRate}%</p>
                </div>
              </div>

              {/* Footer tag */}
              <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-500">
                <span>{b.totalStudents} Candidates</span>
                <span className="font-semibold text-indigo-600 flex items-center gap-0.5">
                  Top: {b.topScore} pts <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Analytical Section: Visual Charts & Comparison Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Recharts Visualizations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  {comparisonMetric === 'overall' && 'Normalized Campus Score & Cutoff Clearance'}
                  {comparisonMetric === 'subjects' && 'Subject Mastery Parity across Campuses (%)'}
                  {comparisonMetric === 'cutoff' && 'Multi-Dimensional Excellence Radar'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Standardized metrics computed from the same test question blueprint
                </p>
              </div>

              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
                NTA Standardized Scale
              </span>
            </div>

            {/* Visual Charts Container */}
            <div className="w-full h-80 pt-2">
              {comparisonMetric === 'overall' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchScoresComparisonData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 300]} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="avgScore" name="Campus Avg Score (/300)" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="cutoffRate" name="Cutoff Clearance Rate (%)" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {comparisonMetric === 'subjects' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectParityData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Physics" name="Physics Mastery (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Chemistry" name="Chemistry Mastery (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Mathematics" name="Mathematics Mastery (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {comparisonMetric === 'cutoff' && (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={105} data={radarDimensionsData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="dimension" stroke="#64748b" fontSize={11} />
                    <PolarRadiusAxis domain={[0, 100]} stroke="#cbd5e1" fontSize={10} />
                    <Radar name="Kota Campus" dataKey="Kota" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} />
                    <Radar name="Delhi Center" dataKey="Delhi" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                    <Radar name="Hyderabad" dataKey="Hyderabad" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Diagnostic Insight Callout */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-950">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Cross-Campus Academic Disparity Diagnosis
              </div>
              <p className="text-xs text-indigo-900 leading-relaxed">
                <strong>Mathematics Parity Gap Detected:</strong> Delhi South Extension (57% math avg) and Bengaluru (55% math avg)
                trail Kota Flagship (66% math avg) by 9-11 percentage points on Calculus and Kings Property integrals.
                Recommend sharing Kota's advanced weekly problem sheets across all regional center faculties.
              </p>
            </div>
          </div>

          {/* Batch vs Batch Detailed Table */}
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center justify-between">
              <span>Batch-Level Performance Matrix</span>
              <span className="text-[11px] font-normal text-zinc-500">Across All Active Batches</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-100 text-zinc-700 font-bold border-b border-zinc-200">
                  <tr>
                    <th className="p-3">Batch Name</th>
                    <th className="p-3">Target Exam</th>
                    <th className="p-3">Faculty Lead</th>
                    <th className="p-3">Students</th>
                    <th className="p-3">Avg Accuracy</th>
                    <th className="p-3">Avg Score</th>
                    <th className="p-3">Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {batches.map((batch, idx) => (
                    <tr key={batch.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="p-3 font-bold text-zinc-900">{batch.name}</td>
                      <td className="p-3">
                        <span className="bg-zinc-100 text-zinc-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {batch.targetExam}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-600">{batch.facultyLead}</td>
                      <td className="p-3 font-mono font-medium">{batch.studentCount}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">{batch.avgAccuracy}%</td>
                      <td className="p-3 font-mono font-bold text-zinc-900">{batch.averageScore} pts</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          idx === 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          Tier {idx + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Campus Deep Dive & Center Head Action (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Deep Dive Card */}
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Campus Deep-Dive
                </span>
                <h3 className="text-lg font-black text-zinc-900 leading-tight mt-0.5">{activeBranch.name}</h3>
                <p className="text-xs text-zinc-500">Center Code: {activeBranch.code} • {activeBranch.city}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center border border-indigo-100">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            {/* Leadership & Faculty Info */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Center Head & Academic Lead</span>
              <p className="font-extrabold text-zinc-900 text-sm">{activeBranch.centerHead}</p>
              <div className="flex items-center gap-2 text-zinc-500 text-[11px] pt-1">
                <span>{activeBranch.activeBatches} Parallel Batches</span>
                <span>•</span>
                <span>{activeBranch.attendanceRate}% Attendance Rate</span>
              </div>
            </div>

            {/* Student Score Distribution Quartiles */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center justify-between">
                <span>Score Distribution Quartiles</span>
                <span className="text-[10px] font-normal text-zinc-400">Total: {activeBranch.totalStudents} candidates</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-emerald-700">Top Tier (&gt;80% Score)</span>
                    <span className="font-mono text-zinc-800">{activeBranch.scoreDistribution.topTier}% ({Math.round(activeBranch.totalStudents * (activeBranch.scoreDistribution.topTier / 100))} students)</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeBranch.scoreDistribution.topTier}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-indigo-700">Proficient (60% - 80%)</span>
                    <span className="font-mono text-zinc-800">{activeBranch.scoreDistribution.proficient}% ({Math.round(activeBranch.totalStudents * (activeBranch.scoreDistribution.proficient / 100))} students)</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${activeBranch.scoreDistribution.proficient}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-amber-700">Average Range (40% - 60%)</span>
                    <span className="font-mono text-zinc-800">{activeBranch.scoreDistribution.average}% ({Math.round(activeBranch.totalStudents * (activeBranch.scoreDistribution.average / 100))} students)</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${activeBranch.scoreDistribution.average}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-rose-700">Need Academic Support (&lt;40%)</span>
                    <span className="font-mono text-zinc-800">{activeBranch.scoreDistribution.needSupport}% ({Math.round(activeBranch.totalStudents * (activeBranch.scoreDistribution.needSupport / 100))} students)</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${activeBranch.scoreDistribution.needSupport}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Breakdown Cards */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Physics</span>
                <p className="text-base font-black text-indigo-600 font-mono">{activeBranch.subjectAverages.physics}%</p>
                <span className="text-[9px] text-zinc-400 block">Avg Accuracy</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Chemistry</span>
                <p className="text-base font-black text-emerald-600 font-mono">{activeBranch.subjectAverages.chemistry}%</p>
                <span className="text-[9px] text-zinc-400 block">Avg Accuracy</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Maths</span>
                <p className="text-base font-black text-amber-600 font-mono">{activeBranch.subjectAverages.mathematics}%</p>
                <span className="text-[9px] text-zinc-400 block">Avg Accuracy</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => alert(`Academic remediation directive dispatched to ${activeBranch.centerHead} for ${activeBranch.name}. Synchronized test papers and faculty briefing notes queued.`)}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Dispatch Regional Remediation Directive
              </button>

              <button
                onClick={handleExportCsv}
                className="w-full py-2.5 px-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                Download Full Campus Analytical Dossier
              </button>
            </div>
          </div>

          {/* Academic Director Memo */}
          <div className="p-4 rounded-2xl bg-zinc-100/80 border border-zinc-200 text-zinc-700 text-xs space-y-1.5">
            <div className="font-bold text-zinc-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Standardized Anti-Inflation Policy
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              All multi-campus test papers are locked under common difficulty seeds and timed CBT schedules. Answer
              keys are encrypted until the national test submission window closes across all branches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
