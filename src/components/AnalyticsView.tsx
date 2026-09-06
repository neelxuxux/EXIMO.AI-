import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  CheckCircle2,
  Calendar,
  RotateCw,
  Award,
  BookOpen,
  ArrowUpRight,
  Printer
} from 'lucide-react';
import { Student, Batch, RemedialPlan } from '../types';

interface AnalyticsViewProps {
  students: Student[];
  batches: Batch[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ students, batches }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [remedialPlan, setRemedialPlan] = useState<RemedialPlan | null>(null);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Call AI Remedial Plan API
  const handleGenerateRemedialPlan = async () => {
    setIsGeneratingPlan(true);

    try {
      const response = await fetch('/api/ai/generate-remedial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: currentStudent.name,
          examTarget: currentStudent.targetExam,
          weakTopics: currentStudent.weakTopics,
          strongTopics: currentStudent.strongTopics,
          averageScore: Math.round((currentStudent.avgScore / 300) * 100),
          accuracy: 82,
        }),
      });

      const data = await response.json();
      if (data.success && data.plan) {
        setRemedialPlan(data.plan);
      }
    } catch (err) {
      console.error('Remedial generation error:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Mock Topic Leak Data for Institute
  const topicBreakdown = [
    { topic: 'Kinematics & Work Energy', accuracy: 88, status: 'Mastered', count: 124 },
    { topic: 'Electromagnetism & Induction', accuracy: 82, status: 'Strong', count: 96 },
    { topic: 'Coordinate Geometry & Vectors', accuracy: 76, status: 'Moderate', count: 110 },
    { topic: 'Thermodynamics & Kinetic Theory', accuracy: 64, status: 'Moderate', count: 85 },
    { topic: 'Rotational Mechanics & Inertia', accuracy: 41, status: 'Critical Gap', count: 102 },
    { topic: 'Ionic & Chemical Equilibrium', accuracy: 46, status: 'Critical Gap', count: 78 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">
              Student Analytics & AI Remedial Engine
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Clinical diagnostic insights, speed-accuracy matrices, and AI personalized recovery roadmaps
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 font-semibold">Select Student Profile:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setRemedialPlan(null);
              }}
              className="px-3 py-1.5 bg-white border border-zinc-300 rounded-lg font-bold text-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {students.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.name} ({std.rollNumber})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* High-Level Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Candidate Rank</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-zinc-900">#{currentStudent.rankInBatch}</span>
            <span className="text-xs text-zinc-500 font-medium">in {currentStudent.batchName}</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Top 5th Percentile
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Mock Average</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600">{currentStudent.avgScore}</span>
            <span className="text-xs text-zinc-500 font-medium">/ 300 Marks</span>
          </div>
          <span className="text-[11px] text-zinc-500 block pt-1">Across {currentStudent.totalTestsAttempted} official mocks</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Attendance & Discipline</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{currentStudent.attendanceRate}%</span>
            <span className="text-xs text-zinc-500 font-medium">Test Attendance</span>
          </div>
          <span className="text-[11px] text-emerald-700 block pt-1">Excellent regular attendance</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Negative Mark Leakage</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">-12m</span>
            <span className="text-xs text-zinc-500 font-medium">Avg. Lost per Test</span>
          </div>
          <span className="text-[11px] text-amber-700 block pt-1">3 avoidable negative guesses</span>
        </div>
      </div>

      {/* Speed vs Accuracy Quadrant & Topic Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: Speed vs Accuracy Matrix */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Speed vs. Accuracy Behavior Matrix
              </h3>
              <p className="text-xs text-zinc-500">Categorizes question attempts by cognitive pace</p>
            </div>
            <span className="text-[11px] font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">
              Avg Pace: 92s / Q
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
              <span className="text-xs font-bold text-emerald-900 block">Fast & Accurate (Mastery)</span>
              <span className="text-2xl font-black text-emerald-700">64%</span>
              <p className="text-[11px] text-emerald-800 leading-tight">
                Kinematics, Vector 3D, and Organic Chemistry solved under 60 seconds with 94% accuracy.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-1">
              <span className="text-xs font-bold text-blue-900 block">Slow & Accurate (Time Trap)</span>
              <span className="text-2xl font-black text-blue-700">18%</span>
              <p className="text-[11px] text-blue-800 leading-tight">
                Definite Integration & Multi-loop circuits. Correct but drains {'>'}3.5 mins per problem.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1">
              <span className="text-xs font-bold text-amber-900 block">Fast & Careless (Gambles)</span>
              <span className="text-2xl font-black text-amber-700">11%</span>
              <p className="text-[11px] text-amber-800 leading-tight">
                Rushed sign errors and unit oversights in Electrostatics under time pressure.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-1">
              <span className="text-xs font-bold text-rose-900 block">Slow & Flawed (Concept Gaps)</span>
              <span className="text-2xl font-black text-rose-700">7%</span>
              <p className="text-[11px] text-rose-800 leading-tight">
                Rotational Dynamics & Equilibrium. High time spent resulting in zero or negative marks.
              </p>
            </div>
          </div>

          {/* Student Topics Pills */}
          <div className="border-t border-zinc-100 pt-3 flex flex-wrap gap-4 text-xs">
            <div>
              <span className="font-bold text-emerald-800 block mb-1">Stronghold Topics:</span>
              <div className="flex flex-wrap gap-1.5">
                {currentStudent.strongTopics.map((t, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-bold text-rose-800 block mb-1">Critical Leaks (Requires Remedial):</span>
              <div className="flex flex-wrap gap-1.5">
                {currentStudent.weakTopics.map((t, i) => (
                  <span key={i} className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Topic Accuracy Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Curriculum Topic Accuracy & Risk Index
              </h3>
              <p className="text-xs text-zinc-500">Cohort accuracy across tested syllabus topics</p>
            </div>
            <span className="text-xs text-zinc-400">Tested Questions: 595</span>
          </div>

          <div className="space-y-3 pt-1">
            {topicBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-800">{item.topic}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        item.status === 'Critical Gap'
                          ? 'bg-rose-100 text-rose-700'
                          : item.status === 'Moderate'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="font-mono font-bold text-zinc-900 w-10 text-right">
                      {item.accuracy}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.accuracy < 50
                        ? 'bg-rose-500'
                        : item.accuracy < 75
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${item.accuracy}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs flex items-center gap-2 text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Faculty Alert:</strong> 2 Topics have dropped below 50% cohort threshold. Immediate remedial sessions advised.
            </span>
          </div>
        </div>
      </div>

      {/* AI Personalized Remedial Study & Strategy Plan Engine */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                Personalized Intervention
              </span>
              <h2 className="text-base font-extrabold text-zinc-900">
                AI 7-Day Remedial Diagnostic & Recovery Roadmap
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Custom-synthesized by Gemini AI based on {currentStudent.name}'s exact cognitive error patterns
            </p>
          </div>

          <button
            onClick={handleGenerateRemedialPlan}
            disabled={isGeneratingPlan}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isGeneratingPlan ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" /> Synthesizing Strategy Plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {remedialPlan ? 'Re-Generate AI Plan' : 'Generate AI Recovery Plan'}
              </>
            )}
          </button>
        </div>

        {!remedialPlan && !isGeneratingPlan && (
          <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-zinc-200 flex items-center justify-center mx-auto text-indigo-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-zinc-800">
              Generate Tailored 7-Day Recovery Plan for {currentStudent.name}
            </h3>
            <p className="text-xs text-zinc-500 max-w-lg mx-auto">
              Our AI engine analyzes time-per-question telemetry, weak chapter error rates, and negative marking patterns to construct a personalized day-by-day practice prescription.
            </p>
          </div>
        )}

        {isGeneratingPlan && (
          <div className="p-8 text-center space-y-3 animate-pulse bg-indigo-50/40 rounded-2xl border border-indigo-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
              <RotateCw className="w-5 h-5 animate-spin" />
            </div>
            <div className="font-bold text-sm text-zinc-900">
              Eximo AI is synthesizing customized recovery roadmap...
            </div>
            <p className="text-xs text-zinc-500">
              Calculating optimal question practice density, exam selection strategy, and fallacy prevention notes.
            </p>
          </div>
        )}

        {/* Display Generated Plan */}
        {remedialPlan && (
          <div className="space-y-6">
            {/* Cognitive Diagnosis & Exam Strategy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 space-y-2">
                <span className="font-bold text-indigo-950 uppercase tracking-wider text-[10px] block">
                  Cognitive & Conceptual Diagnosis
                </span>
                <p className="text-zinc-800 leading-relaxed font-medium">
                  {remedialPlan.diagnosticSummary}
                </p>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2">
                <span className="font-bold text-emerald-950 uppercase tracking-wider text-[10px] block">
                  Recommended Question Selection Strategy
                </span>
                <p className="text-zinc-800 leading-relaxed font-medium">
                  {remedialPlan.recommendedExamStrategy}
                </p>
              </div>
            </div>

            {/* Day by Day Plan Schedule */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Day-by-Day Targeted Practice Schedule
                </h4>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Target: {remedialPlan.expectedScoreJump}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {remedialPlan.weeklyPlan.map((step, sIdx) => (
                  <div key={sIdx} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                      <span className="font-extrabold text-indigo-700">{step.day}</span>
                      <span className="bg-white border border-zinc-200 px-2 py-0.5 rounded font-semibold text-zinc-800">
                        {step.focus}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div>
                        <strong className="text-zinc-900">Action Plan:</strong>
                        <p className="text-zinc-700 leading-relaxed">{step.action}</p>
                      </div>

                      <div className="bg-white p-2 rounded border border-zinc-200">
                        <strong className="text-indigo-900">Practice Goal:</strong>{' '}
                        <span className="text-zinc-700">{step.practiceTarget}</span>
                      </div>

                      <div className="text-rose-800 bg-rose-50 p-2 rounded border border-rose-200">
                        <strong>Watch out for:</strong> {step.keyTrapToAvoid}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
