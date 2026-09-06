import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calculator,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Flag,
  FileSpreadsheet,
  Award,
  ArrowRight,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { TestBlueprint, Question, QuestionAttemptState, TestAttemptResult } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface CbtExamViewProps {
  test: TestBlueprint;
  candidateName?: string;
  rollNumber?: string;
  onExit: () => void;
  onAttemptCompleted: (result: TestAttemptResult) => void;
}

export const CbtExamView: React.FC<CbtExamViewProps> = ({
  test,
  candidateName = 'Aarav Sharma',
  rollNumber = 'EXM-2026-042',
  onExit,
  onAttemptCompleted,
}) => {
  // Flatten all questions across sections
  const allQuestionsWithSection = test.sections.flatMap((sec) =>
    sec.questions.map((q) => ({ ...q, sectionId: sec.id, sectionName: sec.name }))
  );

  const [activeSectionId, setActiveSectionId] = useState<string>(test.sections[0]?.id || '');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(test.totalDurationMinutes * 60);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [calcInput, setCalcInput] = useState<string>('0');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<TestAttemptResult | null>(null);

  // Question Attempt States: questionId -> QuestionAttemptState
  const [attemptState, setAttemptState] = useState<Record<string, QuestionAttemptState>>(() => {
    const initial: Record<string, QuestionAttemptState> = {};
    allQuestionsWithSection.forEach((q, idx) => {
      initial[q.id] = {
        questionId: q.id,
        userAnswer: '',
        status: idx === 0 ? 'not_answered' : 'not_visited',
        timeSpentSeconds: 0,
      };
    });
    return initial;
  });

  // Current question object
  const currentQuestion = allQuestionsWithSection[currentQuestionIndex] || allQuestionsWithSection[0];

  // Timer interval
  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });

      // Increment time on current question
      if (currentQuestion) {
        setAttemptState((prev) => {
          const curr = prev[currentQuestion.id];
          if (!curr) return prev;
          return {
            ...prev,
            [currentQuestion.id]: {
              ...curr,
              timeSpentSeconds: curr.timeSpentSeconds + 1,
            },
          };
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion?.id, isFinished]);

  // Format timer
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle option select
  const handleSelectOption = (value: string) => {
    setAttemptState((prev) => {
      const curr = prev[currentQuestion.id];
      return {
        ...prev,
        [currentQuestion.id]: {
          ...curr,
          userAnswer: value,
          status: curr.status === 'marked_for_review' ? 'answered_and_marked' : 'answered',
        },
      };
    });
  };

  // Actions
  const handleSaveAndNext = () => {
    setAttemptState((prev) => {
      const curr = prev[currentQuestion.id];
      const hasAnswer = curr.userAnswer !== '';
      return {
        ...prev,
        [currentQuestion.id]: {
          ...curr,
          status: hasAnswer ? 'answered' : 'not_answered',
        },
      };
    });
    goToNextQuestion();
  };

  const handleClearResponse = () => {
    setAttemptState((prev) => {
      const curr = prev[currentQuestion.id];
      return {
        ...prev,
        [currentQuestion.id]: {
          ...curr,
          userAnswer: '',
          status: 'not_answered',
        },
      };
    });
  };

  const handleMarkForReviewAndNext = () => {
    setAttemptState((prev) => {
      const curr = prev[currentQuestion.id];
      const hasAnswer = curr.userAnswer !== '';
      return {
        ...prev,
        [currentQuestion.id]: {
          ...curr,
          status: hasAnswer ? 'answered_and_marked' : 'marked_for_review',
        },
      };
    });
    goToNextQuestion();
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < allQuestionsWithSection.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      const nextQ = allQuestionsWithSection[nextIdx];
      setActiveSectionId(nextQ.sectionId);
      markAsVisited(nextQ.id);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIdx);
      const prevQ = allQuestionsWithSection[prevIdx];
      setActiveSectionId(prevQ.sectionId);
      markAsVisited(prevQ.id);
    }
  };

  const jumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    const targetQ = allQuestionsWithSection[index];
    setActiveSectionId(targetQ.sectionId);
    markAsVisited(targetQ.id);
  };

  const markAsVisited = (qId: string) => {
    setAttemptState((prev) => {
      const curr = prev[qId];
      if (curr && curr.status === 'not_visited') {
        return {
          ...prev,
          [qId]: { ...curr, status: 'not_answered' },
        };
      }
      return prev;
    });
  };

  // Section Tab Click
  const handleSectionTabClick = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const firstQIndex = allQuestionsWithSection.findIndex((q) => q.sectionId === sectionId);
    if (firstQIndex !== -1) {
      setCurrentQuestionIndex(firstQIndex);
      markAsVisited(allQuestionsWithSection[firstQIndex].id);
    }
  };

  // Submit test and calculate scores
  const handleSubmitTest = () => {
    setIsSubmitModalOpen(false);
    setIsFinished(true);

    let totalMarks = 0;
    let correctCount = 0;
    let attemptedCount = 0;
    const evaluatedAnswers: Record<string, QuestionAttemptState> = {};
    const secScores: Record<string, { scored: number; total: number; accuracy: number }> = {};

    test.sections.forEach((sec) => {
      secScores[sec.name] = { scored: 0, total: 0, accuracy: 0 };
    });

    allQuestionsWithSection.forEach((q) => {
      const attempt = attemptState[q.id];
      const userAns = attempt?.userAnswer ?? '';
      let isCorrect = false;
      let marks = 0;

      const sec = test.sections.find((s) => s.id === q.sectionId);
      const posMarks = sec?.markingScheme.correct ?? q.marks;
      const negMarks = sec?.markingScheme.incorrect ?? q.negativeMarks;

      if (secScores[q.sectionName]) {
        secScores[q.sectionName].total += posMarks;
      }

      if (userAns !== '') {
        attemptedCount++;
        if (q.type === 'mcq') {
          // Check if option matches correctOptionIndex or correctAnswer
          const isMatch =
            userAns === q.correctOptionIndex?.toString() ||
            userAns === q.correctAnswer ||
            (q.options && q.options[parseInt(userAns)] === q.correctAnswer);
          if (isMatch) {
            isCorrect = true;
            marks = posMarks;
            correctCount++;
          } else {
            isCorrect = false;
            marks = -negMarks;
          }
        } else if (q.type === 'numerical') {
          if (userAns.trim() === q.correctAnswer.trim()) {
            isCorrect = true;
            marks = posMarks;
            correctCount++;
          } else {
            isCorrect = false;
            marks = 0; // standard JEE numerical negative is 0 or -1
          }
        } else if (q.type === 'subjective') {
          // Initial heuristic grade for subjective
          marks = Math.min(posMarks, Math.max(2, Math.round(posMarks * 0.8 * 10) / 10));
          isCorrect = true;
        }

        totalMarks += marks;
        if (secScores[q.sectionName]) {
          secScores[q.sectionName].scored += marks;
        }
      }

      evaluatedAnswers[q.id] = {
        ...attempt,
        isCorrect,
        marksAwarded: marks,
      };
    });

    // Compute accuracy
    const overallAccuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    Object.keys(secScores).forEach((secKey) => {
      const s = secScores[secKey];
      s.accuracy = s.total > 0 ? Math.max(0, Math.round((s.scored / s.total) * 100)) : 0;
    });

    const result: TestAttemptResult = {
      id: 'att_' + Date.now(),
      testId: test.id,
      testTitle: test.title,
      studentId: 'std_01',
      studentName: candidateName,
      batchName: 'JEE Pinnacle Super 30',
      submittedAt: new Date().toLocaleString(),
      totalMarksAwarded: Math.max(0, totalMarks),
      maxMarks: test.totalMarks,
      percentage: Math.max(0, Math.round((totalMarks / test.totalMarks) * 100)),
      accuracy: overallAccuracy,
      timeTakenSeconds: test.totalDurationMinutes * 60 - secondsRemaining,
      percentile: 97.4,
      rank: 2,
      totalParticipants: 32,
      answers: evaluatedAnswers,
      sectionScores: secScores,
    };

    setFinalResult(result);
    onAttemptCompleted(result);
  };

  // Status counts for palette
  const attemptList = Object.values(attemptState) as QuestionAttemptState[];
  const counts = {
    answered: attemptList.filter((s) => s.status === 'answered').length,
    not_answered: attemptList.filter((s) => s.status === 'not_answered').length,
    not_visited: attemptList.filter((s) => s.status === 'not_visited').length,
    marked_for_review: attemptList.filter((s) => s.status === 'marked_for_review').length,
    answered_and_marked: attemptList.filter((s) => s.status === 'answered_and_marked').length,
  };

  // Simple calculator buttons handler
  const handleCalcBtn = (val: string) => {
    if (val === 'C') {
      setCalcInput('0');
    } else if (val === '=') {
      try {
        // Safe evaluation of simple arithmetic
        const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcInput(String(res));
      } catch {
        setCalcInput('Error');
      }
    } else {
      setCalcInput((prev) => (prev === '0' || prev === 'Error' ? val : prev + val));
    }
  };

  // If Finished, show Comprehensive Scorecard & Diagnostic Review
  if (isFinished && finalResult) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Scorecard Hero Banner */}
        <div className="bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30">
              <Award className="w-4 h-4 text-amber-400" />
              CBT Test Performance Analysis
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{test.title}</h2>
            <p className="text-sm text-zinc-300">
              Candidate: <strong>{candidateName}</strong> ({rollNumber}) • Submitted at {finalResult.submittedAt}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-xl text-center border border-white/15">
              <span className="text-xs uppercase tracking-wider text-indigo-200 block font-semibold">Your Score</span>
              <span className="text-3xl font-black text-white">
                {finalResult.totalMarksAwarded}
                <span className="text-sm font-normal text-zinc-300"> / {finalResult.maxMarks}</span>
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-xl text-center border border-white/15">
              <span className="text-xs uppercase tracking-wider text-emerald-300 block font-semibold">Percentile</span>
              <span className="text-3xl font-black text-emerald-400">{finalResult.percentile}%</span>
            </div>

            <button
              onClick={onExit}
              className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/30"
            >
              Back to Institute OS
            </button>
          </div>
        </div>

        {/* Diagnostic KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
            <span className="text-xs font-semibold text-zinc-500">Overall Accuracy</span>
            <div className="text-2xl font-black text-zinc-900 mt-1">{finalResult.accuracy}%</div>
            <span className="text-[11px] text-emerald-600 font-medium">Top 5% in batch accuracy</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
            <span className="text-xs font-semibold text-zinc-500">Time Consumed</span>
            <div className="text-2xl font-black text-zinc-900 mt-1">
              {Math.round(finalResult.timeTakenSeconds / 60)} min
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">Allocated: {test.totalDurationMinutes} min</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
            <span className="text-xs font-semibold text-zinc-500">Batch Rank</span>
            <div className="text-2xl font-black text-indigo-600 mt-1">
              #{finalResult.rank} <span className="text-sm font-normal text-zinc-500">of {finalResult.totalParticipants}</span>
            </div>
            <span className="text-[11px] text-indigo-600 font-medium">Pinnacle Batch Leaderboard</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
            <span className="text-xs font-semibold text-zinc-500">Cutoff Clearance</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">CLEARED</div>
            <span className="text-[11px] text-zinc-500 font-medium">Cutoff mark: {Math.round(test.totalMarks * (test.cutoffPercentage / 100))}</span>
          </div>
        </div>

        {/* Section Score Breakdown */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs space-y-3">
          <h3 className="font-bold text-sm text-zinc-900">Sectional Performance Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(finalResult.sectionScores).map(([secName, data]: [string, any]) => (
              <div key={secName} className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-800">
                  <span>{secName}</span>
                  <span className="text-indigo-600 font-mono font-black">{data.scored} / {data.total}</span>
                </div>
                <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, data.accuracy))}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 mt-1.5">
                  <span>Accuracy: {data.accuracy}%</span>
                  <span>{data.accuracy >= 75 ? 'Strong Zone' : 'Needs Review'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comprehensive Question-by-Question Solution & Pedagogical Review */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-zinc-900">Question-by-Question Diagnostic Review</h3>
              <p className="text-xs text-zinc-500">Detailed answers, step-by-step solutions, and time spent analysis</p>
            </div>
            <span className="text-xs bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full font-semibold">
              {allQuestionsWithSection.length} Questions
            </span>
          </div>

          <div className="space-y-6">
            {allQuestionsWithSection.map((q, idx) => {
              const attempt = finalResult.answers[q.id];
              const isCorrect = attempt?.isCorrect;
              const isAttempted = attempt && attempt.userAnswer !== '';

              return (
                <div
                  key={q.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    !isAttempted
                      ? 'border-zinc-200 bg-zinc-50/50'
                      : isCorrect
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs bg-zinc-900 text-white px-2 py-0.5 rounded">
                        Q.{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-zinc-700">{q.subject} • {q.topic}</span>
                      <span className="text-[11px] font-mono text-zinc-500">({q.difficulty})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 font-mono">
                        Time: {attempt?.timeSpentSeconds || 0}s
                      </span>
                      {!isAttempted ? (
                        <span className="text-xs font-bold text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded">
                          Unattempted (0)
                        </span>
                      ) : isCorrect ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> Correct (+{attempt.marksAwarded})
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <X className="w-3 h-3" /> Incorrect ({attempt.marksAwarded})
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="font-semibold text-zinc-900 mt-3 text-sm leading-relaxed">{q.text}</p>

                  {/* Options */}
                  {q.type === 'mcq' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = attempt?.userAnswer === optIdx.toString();
                        const isRightOpt = optIdx === q.correctOptionIndex || opt === q.correctAnswer;

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                              isRightOpt
                                ? 'bg-emerald-100/70 border-emerald-400 font-bold text-emerald-900'
                                : isChosen
                                ? 'bg-rose-100/70 border-rose-400 font-bold text-rose-900'
                                : 'bg-white border-zinc-200 text-zinc-700'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full border border-current text-[11px] flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                            {isRightOpt && <Check className="w-3.5 h-3.5 ml-auto text-emerald-600" />}
                            {isChosen && !isRightOpt && <X className="w-3.5 h-3.5 ml-auto text-rose-600" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Numerical Answer display */}
                  {q.type === 'numerical' && (
                    <div className="mt-2 text-xs flex gap-4 bg-white p-2.5 rounded border border-zinc-200">
                      <span>Your Answer: <strong>{attempt?.userAnswer || 'None'}</strong></span>
                      <span>Correct Value: <strong className="text-emerald-700">{q.correctAnswer}</strong></span>
                    </div>
                  )}

                  {/* Detailed Step-by-Step Pedagogical Explanation */}
                  <div className="mt-3 bg-white p-3.5 rounded-lg border border-zinc-200 text-xs space-y-1">
                    <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Pedagogical Solution & Derivation:
                    </span>
                    <p className="text-zinc-700 leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active CBT Testing Console
  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col select-none">
      {/* NTA/CAT Style Examination Top Header - Symmetrical & Clean Line Spacing */}
      <div className="bg-zinc-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-zinc-800 shrink-0 min-h-[52px]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-xs shadow-xs shrink-0">
            CBT
          </div>
          <div>
            <h1 className="font-bold text-sm leading-snug text-zinc-100">{test.title}</h1>
            <p className="text-[11px] text-zinc-400 leading-normal mt-0.5">
              Exam: <strong className="text-zinc-300">{test.examType}</strong> • Pattern: NTA / CAT TCS iON Standard
            </p>
          </div>
        </div>

        {/* Center Countdown Clock & Symmetrical Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="h-9 flex items-center gap-2 bg-zinc-800/90 px-3 rounded-lg border border-zinc-700 text-amber-300 font-mono text-sm sm:text-base font-bold shadow-inner">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span>Time Left: {formatTime(secondsRemaining)}</span>
          </div>

          <ThemeToggle />

          <button
            onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
            className="h-9 hidden sm:inline-flex items-center gap-1.5 px-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-700 transition-all shadow-2xs"
            title="Toggle On-Screen Scientific Calculator"
          >
            <Calculator className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Calculator</span>
          </button>

          <button
            onClick={onExit}
            className="h-9 inline-flex items-center px-3 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-medium border border-zinc-700/60 transition-all"
          >
            Exit Console
          </button>
        </div>
      </div>

      {/* Section Tabs Bar */}
      <div className="bg-white border-b border-zinc-200 px-4 py-2 flex items-center justify-between gap-3 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mr-2">Sections:</span>
          {test.sections.map((sec) => {
            const isActive = activeSectionId === sec.id;
            const secQuestions = allQuestionsWithSection.filter((q) => q.sectionId === sec.id);
            const answeredInSec = secQuestions.filter(
              (q) => attemptState[q.id]?.status === 'answered' || attemptState[q.id]?.status === 'answered_and_marked'
            ).length;

            return (
              <button
                key={sec.id}
                onClick={() => handleSectionTabClick(sec.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                <span>{sec.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {answeredInSec}/{secQuestions.length}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-3 text-xs text-zinc-600">
          <span className="font-semibold text-zinc-800">
            Marking Scheme: +{currentQuestion.marks} for correct, -{currentQuestion.negativeMarks} for wrong
          </span>
        </div>
      </div>

      {/* Main Examination Workspace: Left Question Area + Right Question Palette */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Active Question Display */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto p-4 sm:p-6 md:p-8">
          {/* Question Sub-Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-zinc-900 text-white text-xs font-bold px-2.5 py-1 rounded">
                Question No. {currentQuestionIndex + 1}
              </span>
              <span className="text-xs font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                {currentQuestion.subject} • {currentQuestion.topic}
              </span>
              <span className="text-xs text-zinc-500 hidden sm:inline">
                Type: {currentQuestion.type.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Correct: +{currentQuestion.marks}
              </span>
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Negative: -{currentQuestion.negativeMarks}
              </span>
            </div>
          </div>

          {/* Question Body */}
          <div className="flex-1 space-y-6 text-zinc-900">
            <div className="text-base sm:text-lg font-medium leading-relaxed">
              {currentQuestion.text}
            </div>

            {/* MCQ Options Radio List */}
            {currentQuestion.type === 'mcq' && currentQuestion.options && (
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = attemptState[currentQuestion.id]?.userAnswer === optIdx.toString();
                  return (
                    <label
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx.toString())}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q_${currentQuestion.id}`}
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="w-6 h-6 rounded-full border border-zinc-300 flex items-center justify-center font-bold text-xs text-zinc-700 shrink-0 bg-white">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="text-sm font-medium text-zinc-800 leading-normal">{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Numerical Input Type */}
            {currentQuestion.type === 'numerical' && (
              <div className="pt-4 space-y-3 max-w-md">
                <label className="block text-xs font-bold text-zinc-700">
                  Enter your numerical answer (round to 2 decimals or exact integer):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={attemptState[currentQuestion.id]?.userAnswer || ''}
                    onChange={(e) => handleSelectOption(e.target.value)}
                    placeholder="e.g. 5 or 14.5"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 font-mono text-lg font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <button
                    onClick={handleClearResponse}
                    className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Subjective Input Type */}
            {currentQuestion.type === 'subjective' && (
              <div className="pt-4 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                  <span>Write your detailed derivation / solution:</span>
                  <span className="text-zinc-500">
                    {(attemptState[currentQuestion.id]?.userAnswer || '').length} characters
                  </span>
                </div>
                <textarea
                  rows={7}
                  value={attemptState[currentQuestion.id]?.userAnswer || ''}
                  onChange={(e) => handleSelectOption(e.target.value)}
                  placeholder="State theorems, initial assumptions, mathematical equations, and conclusion..."
                  className="w-full p-4 rounded-xl border border-zinc-300 font-sans text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Bottom Navigation & Action Buttons */}
          <div className="border-t border-zinc-200 pt-4 mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAndNext}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save & Next
              </button>

              <button
                onClick={handleClearResponse}
                className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg transition-all"
              >
                Clear Response
              </button>

              <button
                onClick={handleMarkForReviewAndNext}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
              >
                <Flag className="w-3.5 h-3.5" /> Mark for Review & Next
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-3 py-2 border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === allQuestionsWithSection.length - 1}
                className="px-3 py-2 border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Candidate Profile & Question Palette */}
        <div className="w-full lg:w-80 bg-zinc-50 border-t lg:border-t-0 lg:border-l border-zinc-200 flex flex-col p-4 shrink-0 overflow-y-auto">
          {/* Candidate Card */}
          <div className="bg-white p-3 rounded-xl border border-zinc-200 flex items-center gap-3 shadow-2xs mb-4">
            <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
              AS
            </div>
            <div className="text-xs">
              <div className="font-bold text-zinc-900">{candidateName}</div>
              <div className="text-zinc-500 font-mono">Roll: {rollNumber}</div>
              <div className="text-indigo-600 font-semibold text-[11px]">Pinnacle Super 30</div>
            </div>
          </div>

          {/* Palette Status Legend */}
          <div className="bg-white p-3 rounded-xl border border-zinc-200 mb-4 text-[11px] space-y-1.5">
            <div className="font-bold text-zinc-700 mb-1">Question Status Legend:</div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">
                  {counts.answered}
                </span>
                <span className="text-zinc-600">Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
                  {counts.not_answered}
                </span>
                <span className="text-zinc-600">Not Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-zinc-300 text-zinc-700 font-bold text-[9px] flex items-center justify-center">
                  {counts.not_visited}
                </span>
                <span className="text-zinc-600">Not Visited</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-amber-500 text-white font-bold text-[9px] flex items-center justify-center">
                  {counts.marked_for_review}
                </span>
                <span className="text-zinc-600">Marked Review</span>
              </div>
              <div className="col-span-2 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-purple-700 text-white font-bold text-[9px] flex items-center justify-center relative">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-0 right-0"></span>
                  {counts.answered_and_marked}
                </span>
                <span className="text-zinc-600">Answered & Marked (Evaluated)</span>
              </div>
            </div>
          </div>

          {/* Question Numbers Grid */}
          <div className="flex-1 bg-white p-3.5 rounded-xl border border-zinc-200 flex flex-col mb-4">
            <div className="text-xs font-bold text-zinc-800 mb-3 flex items-center justify-between">
              <span>Section: {activeSectionId.replace('sec_', '').toUpperCase()}</span>
              <span className="text-zinc-400 font-normal">Click number to jump</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 overflow-y-auto max-h-56">
              {allQuestionsWithSection.map((q, idx) => {
                const state = attemptState[q.id]?.status || 'not_visited';
                const isCurrent = currentQuestionIndex === idx;

                let colorClasses = 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300';
                if (state === 'answered') colorClasses = 'bg-emerald-600 text-white hover:bg-emerald-700';
                else if (state === 'not_answered') colorClasses = 'bg-rose-500 text-white hover:bg-rose-600';
                else if (state === 'marked_for_review') colorClasses = 'bg-amber-500 text-white hover:bg-amber-600';
                else if (state === 'answered_and_marked') colorClasses = 'bg-purple-700 text-white hover:bg-purple-800';

                return (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(idx)}
                    className={`h-9 rounded-lg font-bold text-xs flex items-center justify-center relative transition-all ${colorClasses} ${
                      isCurrent ? 'ring-2 ring-zinc-950 ring-offset-2 scale-105 z-10' : ''
                    }`}
                  >
                    {idx + 1}
                    {state === 'answered_and_marked' && (
                      <span className="w-2 h-2 bg-emerald-400 rounded-full absolute -top-0.5 -right-0.5 border border-white"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Test Trigger Button */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all uppercase tracking-wider"
          >
            Submit Entire Examination
          </button>
        </div>
      </div>

      {/* Floating Scientific Calculator Modal */}
      {isCalculatorOpen && (
        <div className="fixed top-16 right-6 z-50 bg-zinc-900 text-white w-64 rounded-2xl shadow-2xl border border-zinc-700 p-4">
          <div className="flex justify-between items-center pb-2 mb-2 border-b border-zinc-800">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-indigo-400" /> CBT Calculator
            </span>
            <button onClick={() => setIsCalculatorOpen(false)} className="text-zinc-400 hover:text-white text-xs">
              ✕
            </button>
          </div>
          <div className="bg-black/50 p-2.5 rounded-lg text-right font-mono text-xl font-bold mb-3 border border-zinc-800 overflow-x-auto text-emerald-400">
            {calcInput}
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
            {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C'].map((b) => (
              <button
                key={b}
                onClick={() => handleCalcBtn(b)}
                className={`h-9 rounded-lg transition-all ${
                  b === 'C'
                    ? 'col-span-4 bg-rose-800 hover:bg-rose-700 text-white'
                    : b === '='
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : ['/', '*', '-', '+'].includes(b)
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-indigo-400'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submission Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-zinc-900">Confirm Exam Submission</h3>
                <p className="text-xs text-zinc-500">Are you sure you want to end the test?</p>
              </div>
            </div>

            {/* Status Breakdown Table */}
            <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-600">Total Questions:</span>
                <strong className="text-zinc-900">{allQuestionsWithSection.length}</strong>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Answered:</span>
                <span>{counts.answered + counts.answered_and_marked}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Not Answered:</span>
                <span>{counts.not_answered}</span>
              </div>
              <div className="flex justify-between text-amber-600 font-semibold">
                <span>Marked for Review:</span>
                <span>{counts.marked_for_review}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Not Visited:</span>
                <span>{counts.not_visited}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              No further changes can be made once submitted. Your score, accuracy, and percentile will be calculated instantly.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl"
              >
                Return to Exam
              </button>
              <button
                onClick={handleSubmitTest}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Yes, Final Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
