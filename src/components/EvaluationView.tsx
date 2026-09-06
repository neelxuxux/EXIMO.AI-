import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Clock,
  User,
  RotateCw,
  Sliders,
  Award,
  ChevronRight,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { TestAttemptResult, TestBlueprint } from '../types';

interface EvaluationViewProps {
  attemptResults: TestAttemptResult[];
  testPapers: TestBlueprint[];
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({ attemptResults, testPapers }) => {
  const [selectedAttemptId, setSelectedAttemptId] = useState<string>(attemptResults[1]?.id || attemptResults[0]?.id || '');
  const [isEvaluatingAi, setIsEvaluatingAi] = useState<boolean>(false);
  const [customTeacherScore, setCustomTeacherScore] = useState<number>(4.5);
  const [evaluatedResultState, setEvaluatedResultState] = useState<any>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);

  // Active attempt
  const activeAttempt = attemptResults.find((a) => a.id === selectedAttemptId) || attemptResults[0];

  // For subjective sample question
  const sampleQuestion = {
    title: "CBSE Class 12 Wave Optics: Huygens' Principle & Double Slit Derivation",
    questionText: "State Huygens' Principle. Using it, derive the condition for constructive and destructive interference in Young's Double Slit Experiment, and derive the expression for fringe width β = λD/d.",
    modelAnswer: "Huygens Principle: Every point on a primary wavefront serves as a secondary source of spherical wavelets. Path difference Δx = S2P - S1P = d*sin(θ) ≈ y*d/D for small angles. Constructive condition: Δx = n*λ => y_n = n*λ*D/d. Fringe width β = y_{n+1} - y_n = λ*D/d.",
    maxMarks: 5,
    rubric: "1 Mark for accurate statement of Huygens wavelets; 2 Marks for geometric path difference derivation; 1 Mark for constructive/destructive conditions; 1 Mark for fringe width expression."
  };

  const sampleStudentAnswer = activeAttempt?.answers['q_subj_01']?.userAnswer ||
    "According to Huygens Principle, each point on a primary wavefront acts as a new source of secondary wavelets. The envelope of these secondary spherical wavelets gives the new wavefront. For Young double slit, let S1 and S2 be separated by distance d. The path difference for ray reaching point P at distance y is delta_x = S2P - S1P = d sin theta = y*d / D. For constructive interference delta_x = n*lambda, so y_n = n*lambda*D / d. Fringe width beta = y_{n+1} - y_n = lambda*D / d.";

  // Call AI Evaluator API
  const handleRunAiEvaluation = async () => {
    setIsEvaluatingAi(true);
    setFeedbackSuccess(false);

    try {
      const response = await fetch('/api/ai/evaluate-subjective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: sampleQuestion.questionText,
          modelAnswer: sampleQuestion.modelAnswer,
          studentAnswer: sampleStudentAnswer,
          maxMarks: sampleQuestion.maxMarks,
          rubric: sampleQuestion.rubric,
        }),
      });

      const data = await response.json();
      if (data.success && data.evaluation) {
        setEvaluatedResultState(data.evaluation);
        setCustomTeacherScore(data.evaluation.awardedMarks);
      }
    } catch (err) {
      console.error('Failed to run AI evaluation:', err);
    } finally {
      setIsEvaluatingAi(false);
    }
  };

  const handlePublishGrade = () => {
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">
              AI Evaluation & Rubrics Studio
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Automated objective scoring combined with semantic AI rubric grading for subjective exams & derivations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Auto-Scoring Active</span>
          </div>
        </div>
      </div>

      {feedbackSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Evaluation verified and published! Student scorecard and feedback report have been updated.</span>
        </div>
      )}

      {/* Grid: Submissions Queue on Left / Active Grading Studio on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 4 Cols: Test Submissions Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-900">Submissions Queue</h2>
            <span className="text-[11px] text-zinc-500 font-semibold">{attemptResults.length} Submissions</span>
          </div>

          <div className="space-y-2.5">
            {attemptResults.map((att) => {
              const isSelected = att.id === selectedAttemptId;
              return (
                <div
                  key={att.id}
                  onClick={() => {
                    setSelectedAttemptId(att.id);
                    setEvaluatedResultState(null);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-zinc-900">{att.studentName}</span>
                      <span className="text-[11px] text-zinc-500 block">{att.batchName}</span>
                    </div>
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {att.totalMarksAwarded} / {att.maxMarks}m
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-600 font-medium mt-2 line-clamp-1">
                    {att.testTitle}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2">
                    <span>Accuracy: {att.accuracy}%</span>
                    <span>{att.submittedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: AI Subjective Grader Workbench */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Subjective Paper Review
                </span>
                <h3 className="font-bold text-base text-zinc-900">{activeAttempt?.studentName}</h3>
                <span className="text-xs text-zinc-500 font-mono">({activeAttempt?.batchName})</span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{sampleQuestion.title}</p>
            </div>

            <button
              onClick={handleRunAiEvaluation}
              disabled={isEvaluatingAi}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isEvaluatingAi ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" /> Evaluating Rubric...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> AI Evaluate with Rubric
                </>
              )}
            </button>
          </div>

          {/* Side-by-Side: Question & Model Answer vs Student Response */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Question & Model Answer */}
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
              <div>
                <span className="font-bold text-zinc-900 uppercase tracking-wider text-[10px] block text-indigo-700 mb-1">
                  Question & Expected Standard (Max {sampleQuestion.maxMarks} Marks)
                </span>
                <p className="text-zinc-800 font-medium leading-relaxed">{sampleQuestion.questionText}</p>
              </div>

              <div className="border-t border-zinc-200 pt-2">
                <span className="font-bold text-zinc-700 block mb-1">Evaluation Rubric & Key Points:</span>
                <p className="text-zinc-600 leading-relaxed italic">{sampleQuestion.rubric}</p>
              </div>
            </div>

            {/* Student's Actual Handwritten / Typed Submission */}
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <span className="font-bold text-zinc-900 uppercase tracking-wider text-[10px] block text-emerald-700">
                Candidate's Submitted Answer
              </span>
              <div className="p-3 bg-white rounded-lg border border-zinc-200 text-zinc-800 leading-relaxed font-sans text-xs min-h-[140px]">
                {sampleStudentAnswer}
              </div>
              <span className="text-[10px] text-zinc-400 block text-right">
                Length: {sampleStudentAnswer.split(' ').length} words • Formatted derivation
              </span>
            </div>
          </div>

          {/* AI Evaluation Diagnostic Card */}
          {(evaluatedResultState || activeAttempt?.answers['q_subj_01']?.aiEvaluation) && (
            <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-sm text-indigo-950">AI Rubric Evaluation Breakdown</span>
                  <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                    {evaluatedResultState?.conceptUnderstanding ||
                      activeAttempt?.answers['q_subj_01']?.aiEvaluation?.conceptUnderstanding}{' '}
                    Grasp
                  </span>
                </div>

                {/* Score & Teacher Override Slider */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-700">Teacher Override:</span>
                    <input
                      type="range"
                      min={0}
                      max={sampleQuestion.maxMarks}
                      step={0.5}
                      value={customTeacherScore}
                      onChange={(e) => setCustomTeacherScore(parseFloat(e.target.value))}
                      className="w-24 accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <span className="text-base font-black text-indigo-700 bg-white px-3 py-1 rounded-lg border border-indigo-200 font-mono">
                    {customTeacherScore} / {sampleQuestion.maxMarks}
                  </span>
                </div>
              </div>

              {/* Constructive Pedagogical Feedback */}
              <div className="text-xs space-y-2">
                <p className="text-zinc-800 leading-relaxed">
                  <strong>Evaluator Summary:</strong>{' '}
                  {evaluatedResultState?.aiFeedback ||
                    activeAttempt?.answers['q_subj_01']?.aiEvaluation?.aiFeedback}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {/* Strengths */}
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Strengths Verified
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-zinc-700">
                      {(
                        evaluatedResultState?.strengths ||
                        activeAttempt?.answers['q_subj_01']?.aiEvaluation?.strengths || [
                          'Accurate statement of secondary wavelets',
                          'Correct trigonometric path difference geometry',
                        ]
                      ).map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Missed Points / Gaps */}
                  <div className="bg-white p-3 rounded-lg border border-amber-200 text-xs">
                    <span className="font-bold text-amber-800 flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Areas for Refinement
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-zinc-700">
                      {(
                        evaluatedResultState?.missedPoints ||
                        activeAttempt?.answers['q_subj_01']?.aiEvaluation?.missedPoints || [
                          'Explicitly sketch ray diagrams for board examinations',
                        ]
                      ).map((m: string, i: number) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Improvement tip */}
                {(evaluatedResultState?.improvementTip ||
                  activeAttempt?.answers['q_subj_01']?.aiEvaluation?.improvementTip) && (
                  <div className="p-2.5 bg-indigo-100/50 rounded-lg text-[11px] text-indigo-900">
                    <strong>Faculty Tip:</strong>{' '}
                    {evaluatedResultState?.improvementTip ||
                      activeAttempt?.answers['q_subj_01']?.aiEvaluation?.improvementTip}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="border-t border-zinc-200 pt-4 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              Verified evaluations automatically update batch percentiles and student performance dashboards.
            </span>
            <button
              onClick={handlePublishGrade}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Confirm & Publish Final Grade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
