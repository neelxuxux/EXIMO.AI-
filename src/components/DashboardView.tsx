import React from 'react';
import {
  BrainCircuit,
  Sparkles,
  PlayCircle,
  FileText,
  ShieldCheck,
  GraduationCap,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Award,
  BarChart2,
  Smartphone,
  GitCompare,
  ScanLine
} from 'lucide-react';
import { Batch, TestBlueprint, Question, Student, TestAttemptResult } from '../types';

interface DashboardViewProps {
  batches: Batch[];
  testPapers: TestBlueprint[];
  questionBank: Question[];
  students: Student[];
  recentAttempts: TestAttemptResult[];
  onNavigate: (tabId: string) => void;
  onLaunchCbt: (paper: TestBlueprint) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  batches,
  testPapers,
  questionBank,
  students,
  recentAttempts,
  onNavigate,
  onLaunchCbt,
}) => {
  const totalStudents = batches.reduce((acc, b) => acc + b.studentCount, 0);
  const liveTests = testPapers.filter((t) => t.status === 'Live');
  const avgInstituteAccuracy = Math.round(
    batches.reduce((acc, b) => acc + b.avgAccuracy, 0) / (batches.length || 1)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30 leading-none">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>AI Assessment Infrastructure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Apex Academy Assessment Console
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Create better assessments. Evaluate faster with AI rubrics. Diagnose every student's cognitive bottlenecks before the exam.
          </p>
        </div>

        {/* Action CTAs - Symmetrical buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onLaunchCbt(testPapers[0])}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer leading-none"
          >
            <PlayCircle className="w-4 h-4 shrink-0" />
            <span>Experience CBT Exam</span>
          </button>
          <button
            onClick={() => onNavigate('question_studio')}
            className="h-10 px-4 bg-white/10 hover:bg-white/15 text-zinc-100 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/10 transition-all cursor-pointer leading-none"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Generate Questions</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics - Symmetrical 4-column cards with balanced line spacing */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border-primary shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-muted-text uppercase tracking-wider leading-none">
              Active Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-black text-foreground tracking-tight leading-tight">
              {totalStudents}
            </div>
          </div>
          <div className="pt-2 border-t border-border-primary/60 text-[11px] text-muted-text leading-snug">
            Across {batches.length} coaching batches
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border-primary shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-muted-text uppercase tracking-wider leading-none">
              Active Papers
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-black text-foreground tracking-tight leading-tight">
              {testPapers.length}
            </div>
          </div>
          <div className="pt-2 border-t border-border-primary/60 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold leading-snug">
            {liveTests.length} Live in CBT simulator
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border-primary shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-muted-text uppercase tracking-wider leading-none">
              Question Bank
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-black text-foreground tracking-tight leading-tight">
              {questionBank.length}
            </div>
          </div>
          <div className="pt-2 border-t border-border-primary/60 text-[11px] text-muted-text leading-snug">
            JEE, NEET, CAT & CBSE verified
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border-primary shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-muted-text uppercase tracking-wider leading-none">
              Institute Accuracy
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-tight">
              {avgInstituteAccuracy}%
            </div>
          </div>
          <div className="pt-2 border-t border-border-primary/60 text-[11px] text-muted-text leading-snug">
            Cohort overall test average
          </div>
        </div>
      </div>

      {/* Critical Topic Weakness Alert Bar */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-rose-950">
              Diagnostic Leak Alert: Rotational Dynamics & Ionic Equilibrium
            </h4>
            <p className="text-[11px] text-rose-800 mt-0.5">
              Cohort accuracy dropped to 41% in JEE Pinnacle batch. 14 students lost {'>'}16 marks due to negative guessing.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('analytics')}
          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1.5"
        >
          <span>Run AI Remedial Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2-Column Grid: Live Exam Radar on Left / Workflow Launcher & Submissions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Live Exam Radar */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-zinc-900">Current & Upcoming Mock Examinations</h3>
              <p className="text-xs text-zinc-500">Scheduled test papers ready for online CBT or offline print</p>
            </div>
            <button
              onClick={() => onNavigate('paper_generator')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>All Papers</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {testPapers.map((paper) => (
              <div
                key={paper.id}
                className="p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-200">
                      {paper.examType}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        paper.status === 'Live'
                          ? 'bg-emerald-50 text-emerald-700 font-bold'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      ● {paper.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-zinc-900">{paper.title}</h4>

                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span>{paper.totalDurationMinutes} mins</span>
                    <span>•</span>
                    <span>{paper.totalMarks} Marks</span>
                    <span>•</span>
                    <span>{paper.sections.length} Sections</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onLaunchCbt(paper)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    Launch CBT
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Quick Workflow Launcher & Recent Submissions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Launchers */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-zinc-900">Institute Workflow Modules</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => onNavigate('question_studio')}
                className="p-3.5 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="font-bold text-zinc-900">AI Question Studio</div>
                <p className="text-[11px] text-zinc-500">Draft questions with Bloom's taxonomy</p>
              </button>

              <button
                onClick={() => onNavigate('paper_generator')}
                className="p-3.5 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="font-bold text-zinc-900">Paper Blueprint</div>
                <p className="text-[11px] text-zinc-500">Assemble & print watermarked PDFs</p>
              </button>

              <button
                onClick={() => onNavigate('evaluation')}
                className="p-3.5 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="font-bold text-zinc-900">AI Rubric Grading</div>
                <p className="text-[11px] text-zinc-500">Grade subjective papers in seconds</p>
              </button>

              <button
                onClick={() => onNavigate('analytics')}
                className="p-3.5 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="font-bold text-zinc-900">Remedial Plans</div>
                <p className="text-[11px] text-zinc-500">Personalized 7-day roadmaps</p>
              </button>

              <button
                onClick={() => onNavigate('parent_reports')}
                className="p-3.5 rounded-xl border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-left space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="font-bold text-zinc-900">Parent Reports</div>
                <p className="text-[11px] text-zinc-500">WhatsApp dispatch & print cards</p>
              </button>

              <button
                onClick={() => onNavigate('benchmarking')}
                className="p-3.5 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <GitCompare className="w-4 h-4" />
                </div>
                <div className="font-bold text-zinc-900">Branch Benchmark</div>
                <p className="text-[11px] text-zinc-500">Kota, Delhi, Hyderabad parity</p>
              </button>

              <button
                onClick={() => onNavigate('omr_scanner')}
                className="p-3.5 rounded-xl border border-zinc-200 hover:border-amber-300 hover:bg-amber-50/30 text-left space-y-1.5 transition-all group col-span-2 sm:col-span-1"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <ScanLine className="w-4 h-4" />
                </div>
                <div className="font-bold text-zinc-900">OMR Scanner</div>
                <p className="text-[11px] text-zinc-500">Hybrid offline bubble digitizer</p>
              </button>
            </div>
          </div>

          {/* Recent Submissions Feed */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-900">Recent Test Submissions</h3>
              <span className="text-[11px] text-zinc-500">Live Feed</span>
            </div>

            <div className="space-y-3">
              {recentAttempts.slice(0, 3).map((att) => (
                <div
                  key={att.id}
                  onClick={() => onNavigate('evaluation')}
                  className="p-3 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-white transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-zinc-900 block">{att.studentName}</span>
                    <span className="text-[11px] text-zinc-500 line-clamp-1">{att.testTitle}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {att.totalMarksAwarded} / {att.maxMarks}m
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">{att.accuracy}% acc</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
