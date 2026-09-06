import React, { useState, useRef } from 'react';
import {
  ScanLine,
  Upload,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Database,
  RefreshCw,
  Eye,
  Sliders,
  ShieldCheck,
  Printer,
  ChevronRight,
  HelpCircle,
  Percent,
  Award
} from 'lucide-react';
import {
  TestBlueprint,
  Student,
  TestAttemptResult,
  OmrScanResult,
  OmrDetectedQuestion
} from '../types';
import { SAMPLE_OMR_SCANS } from '../mockData';

interface OmrScannerViewProps {
  testPapers: TestBlueprint[];
  students: Student[];
  onIngestAttempt: (result: TestAttemptResult) => void;
  onNavigateToStudentDashboard?: (studentId: string) => void;
}

export const OmrScannerView: React.FC<OmrScannerViewProps> = ({
  testPapers,
  students,
  onIngestAttempt,
  onNavigateToStudentDashboard,
}) => {
  const [selectedScanPreset, setSelectedScanPreset] = useState<number>(0);
  const [currentScan, setCurrentScan] = useState<OmrScanResult>(SAMPLE_OMR_SCANS[0]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [ingestedSuccess, setIngestedSuccess] = useState<boolean>(false);
  const [manualReviewModalQuestion, setManualReviewModalQuestion] = useState<OmrDetectedQuestion | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Switch preset scan
  const handleSelectPreset = (index: number) => {
    setSelectedScanPreset(index);
    setCurrentScan(SAMPLE_OMR_SCANS[index]);
    setIngestedSuccess(false);
    setUploadedFileName(null);
  };

  // Run Optical & AI Ambiguity Scan Animation
  const handleTriggerOpticalScan = () => {
    setIsScanning(true);
    setIngestedSuccess(false);

    setTimeout(() => {
      setIsScanning(false);
    }, 1800);
  };

  // Handle file upload simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      // load sample 2 as an uploaded realistic scan
      setCurrentScan(SAMPLE_OMR_SCANS[1]);
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
      }, 1600);
    }
  };

  // Ingest into Student Analytics Pipeline
  const handleIngestIntoPipeline = () => {
    // Find matching student
    const matchedStudent = students.find(
      (s) => s.rollNumber === currentScan.studentRollNumber
    ) || students[0];

    // Build standard TestAttemptResult
    const answersRecord: TestAttemptResult['answers'] = {};
    currentScan.questions.forEach((q) => {
      answersRecord[`q_${q.questionNumber}`] = {
        questionId: `q_${q.questionNumber}`,
        userAnswer: q.markedOption,
        status: q.status === 'blank' ? 'not_answered' : 'answered',
        timeSpentSeconds: 90,
        isCorrect: q.isCorrect,
        marksAwarded: q.marksAwarded,
      };
    });

    const newResult: TestAttemptResult = {
      id: 'omr_ingest_' + Date.now(),
      testId: 'test_jee_all_india_01',
      testTitle: currentScan.testTitle,
      studentId: matchedStudent.id,
      studentName: matchedStudent.name,
      batchName: matchedStudent.batchName,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      totalMarksAwarded: currentScan.totalMarksAwarded,
      maxMarks: currentScan.maxMarks,
      percentage: currentScan.percentage,
      accuracy: Math.round((currentScan.correctCount / Math.max(1, currentScan.attemptedCount)) * 100),
      timeTakenSeconds: 7200,
      percentile: currentScan.percentage >= 70 ? 94.5 : 72.8,
      rank: currentScan.percentage >= 70 ? 3 : 18,
      totalParticipants: 45,
      answers: answersRecord,
      sectionScores: {
        Physics: {
          scored: Math.round(currentScan.totalMarksAwarded * 0.4),
          total: Math.round(currentScan.maxMarks * 0.4),
          accuracy: Math.round((currentScan.correctCount / Math.max(1, currentScan.attemptedCount)) * 100),
        },
        Chemistry: {
          scored: Math.round(currentScan.totalMarksAwarded * 0.6),
          total: Math.round(currentScan.maxMarks * 0.6),
          accuracy: Math.round((currentScan.correctCount / Math.max(1, currentScan.attemptedCount)) * 100),
        },
      },
    };

    onIngestAttempt(newResult);
    setIngestedSuccess(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ScanLine className="w-3 h-3" />
              Hybrid Offline Evaluation Engine
            </span>
            <span className="text-zinc-400">•</span>
            <span className="text-xs text-zinc-500 font-medium">OMR Optical Scanner & Gemini Ambiguity Auditor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mt-1">
            OMR Sheet Scanner & Digital Pipeline Simulator
          </h1>
          <p className="text-sm text-zinc-600 mt-1 max-w-3xl">
            Digitize physical classroom pen-and-paper bubble sheets into the central analytics database. Detects double-marking,
            faint fills, and calculates marks with instant sync to student dashboards and parent reports.
          </p>
        </div>

        {/* Top Scan Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold transition-all shadow-2xs"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            Upload Scanned OMR
          </button>

          <button
            onClick={handleTriggerOpticalScan}
            disabled={isScanning}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Optical Audit Running...' : 'Rescan Sheet'}
          </button>
        </div>
      </div>

      {/* Preset Sheet Selector & Sheet Stats Bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Realistic OMR Presets:</span>
          {SAMPLE_OMR_SCANS.map((scan, idx) => (
            <button
              key={scan.scanId}
              onClick={() => handleSelectPreset(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedScanPreset === idx && !uploadedFileName
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {idx === 0 && 'Sample 1: High Scorer (Aarav Sharma)'}
              {idx === 1 && 'Sample 2: Ambiguous Double-Marked (Rohan Deshmukh)'}
            </button>
          ))}

          {uploadedFileName && (
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-200">
              Uploaded: {uploadedFileName}
            </span>
          )}
        </div>

        {/* Optical Confidence Badge */}
        <div className="flex items-center gap-2 pl-4 border-l border-zinc-100 shrink-0">
          <span className="text-xs text-zinc-500">Optical Recognition Accuracy:</span>
          <span className="font-mono text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {currentScan.confidenceScore}% Confidence
          </span>
        </div>
      </div>

      {/* Main Grid: Left = Visual Physical OMR Sheet Canvas, Right = Digitized Audit & Pipeline Ingestion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visual OMR Sheet Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-zinc-300 shadow-md p-6 sm:p-7 relative overflow-hidden">
            {/* Optical Scanner Laser Line Animation */}
            {isScanning && (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_#ef4444] z-20 animate-bounce transition-all duration-700"></div>
            )}

            {/* OMR Sheet Real Header */}
            <div className="border-b-2 border-zinc-800 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-black rounded-xs flex items-center justify-center text-white font-black text-[10px]">
                    ■
                  </div>
                  <span className="font-mono text-[11px] font-bold tracking-widest text-zinc-700">
                    OMR RESPONSE SHEET • NTA FORM C-4
                  </span>
                </div>
                {/* Barcode representation */}
                <div className="flex items-center gap-0.5 h-6">
                  {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7].map((w, i) => (
                    <div
                      key={i}
                      className="bg-zinc-800 h-full"
                      style={{ width: `${(w % 3) + 1.5}px` }}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-1 gap-2">
                <div>
                  <span className="text-zinc-500">Candidate Name:</span>{' '}
                  <strong className="text-zinc-900">{currentScan.studentName}</strong>
                </div>
                <div>
                  <span className="text-zinc-500">Roll No:</span>{' '}
                  <strong className="font-mono text-zinc-900">{currentScan.studentRollNumber}</strong>
                </div>
                <div>
                  <span className="text-zinc-500">Test Code:</span>{' '}
                  <strong className="font-mono text-indigo-600">{currentScan.testCode}</strong>
                </div>
              </div>
            </div>

            {/* Instructions Strip */}
            <div className="py-2.5 px-3 my-4 bg-zinc-50 rounded-xl border border-zinc-200 text-[11px] text-zinc-500 flex items-center justify-between">
              <span>● Use Blue/Black Ball Point Pen only</span>
              <span>● Darken complete circle</span>
              <span>● Do not fold or tear this sheet</span>
            </div>

            {/* 20 Question Interactive Bubble Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 pt-2">
              {currentScan.questions.map((q) => {
                const isDouble = q.markedOption === 'DOUBLE_MARKED';
                const isBlank = q.markedOption === 'BLANK';

                return (
                  <div
                    key={q.questionNumber}
                    onClick={() => setManualReviewModalQuestion(q)}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                      q.status === 'ambiguous'
                        ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400'
                        : q.status === 'correct'
                        ? 'bg-emerald-50/40 border-emerald-200/60 hover:bg-emerald-50'
                        : q.status === 'incorrect'
                        ? 'bg-rose-50/40 border-rose-200/60 hover:bg-rose-50'
                        : 'bg-zinc-50/60 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-right font-mono font-bold text-xs text-zinc-700">
                        {q.questionNumber}.
                      </span>

                      {/* Bubbles A, B, C, D */}
                      <div className="flex items-center gap-1.5">
                        {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                          const isMarked = q.markedOption === opt || (isDouble && (opt === 'B' || opt === 'C'));
                          const isKey = q.correctAnswer === opt;

                          return (
                            <div
                              key={opt}
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] border transition-all ${
                                isMarked
                                  ? q.status === 'correct'
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                    : q.status === 'ambiguous'
                                    ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                                    : 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                                  : isKey && !isMarked
                                  ? 'bg-white text-emerald-700 border-dashed border-2 border-emerald-400'
                                  : 'bg-white text-zinc-400 border-zinc-300'
                              }`}
                              title={isMarked ? `Marked Option ${opt}` : `Option ${opt}`}
                            >
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status Pill on right */}
                    <div className="flex items-center gap-1 text-[11px] font-mono">
                      {q.status === 'correct' && (
                        <span className="text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.5 rounded">
                          +4
                        </span>
                      )}
                      {q.status === 'incorrect' && (
                        <span className="text-rose-700 font-bold bg-rose-100/80 px-1.5 py-0.5 rounded">
                          -1
                        </span>
                      )}
                      {q.status === 'blank' && (
                        <span className="text-zinc-500 font-medium bg-zinc-100 px-1.5 py-0.5 rounded">
                          0
                        </span>
                      )}
                      {q.status === 'ambiguous' && (
                        <span className="text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> Flagged
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Optical Alignment Markers */}
            <div className="pt-6 mt-4 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-black inline-block"></span>
                <span>ANCHOR_TL_CALIBRATED</span>
              </div>
              <span>SCAN_RESOLUTION: 300_DPI_GRAYSCALE</span>
              <div className="flex items-center gap-1.5">
                <span>ANCHOR_BR_ALIGNED</span>
                <span className="w-3 h-3 bg-black inline-block"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Digitized Analytics & Pipeline Ingestion (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Audit Score Card */}
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider">
                  Automated Optical Evaluation
                </span>
                <span className="text-xs text-zinc-400 font-mono">{currentScan.scannedTimestamp}</span>
              </div>
              <h3 className="text-lg font-black text-zinc-900 mt-0.5">Scoring & Ambiguity Audit</h3>
              <p className="text-xs text-zinc-500">{currentScan.testTitle}</p>
            </div>

            {/* Core Score Block */}
            <div className="p-4 rounded-2xl bg-zinc-900 text-white flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Scored</span>
                <div className="text-3xl font-black font-mono text-emerald-400 mt-0.5">
                  {currentScan.totalMarksAwarded} <span className="text-sm font-normal text-zinc-400">/ {currentScan.maxMarks}</span>
                </div>
                <span className="text-xs text-zinc-300 font-medium">{currentScan.percentage.toFixed(1)}% Marks Scored</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Accuracy Rate</span>
                <div className="text-2xl font-black font-mono text-white mt-0.5">
                  {Math.round((currentScan.correctCount / Math.max(1, currentScan.attemptedCount)) * 100)}%
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold">Above Batch Median</span>
              </div>
            </div>

            {/* Breakdown Ribbon */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold uppercase text-emerald-700">Correct</span>
                <p className="font-mono font-black text-emerald-900 text-base">{currentScan.correctCount}</p>
                <span className="text-[9px] text-emerald-600 font-semibold">+4 Scheme</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] font-bold uppercase text-rose-700">Wrong</span>
                <p className="font-mono font-black text-rose-900 text-base">{currentScan.incorrectCount}</p>
                <span className="text-[9px] text-rose-600 font-semibold">-1 Negative</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-[10px] font-bold uppercase text-zinc-600">Blank</span>
                <p className="font-mono font-black text-zinc-800 text-base">{currentScan.blankCount}</p>
                <span className="text-[9px] text-zinc-400">0 Scheme</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-bold uppercase text-amber-700">Ambiguous</span>
                <p className="font-mono font-black text-amber-900 text-base">{currentScan.ambiguousCount}</p>
                <span className="text-[9px] text-amber-600 font-semibold">Double Mark</span>
              </div>
            </div>

            {/* Ambiguity Flag Alert Box (if present) */}
            {currentScan.ambiguousCount > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Ambiguity Warning on Question #3
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Both Bubble (B) and Bubble (C) received &gt;50% optical opacity.
                  Per NTA Rule 14, ambiguous marks receive 0 marks unless cleared by presiding faculty. Click row to inspect.
                </p>
              </div>
            )}

            {/* Primary Action Button: Ingest into Digital Analytics Pipeline */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleIngestIntoPipeline}
                disabled={ingestedSuccess}
                className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
                  ingestedSuccess
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                }`}
              >
                <Database className="w-4 h-4 text-emerald-400" />
                {ingestedSuccess
                  ? 'Successfully Ingested into Student Analytics ✓'
                  : 'Ingest into Central Student Analytics Pipeline'}
              </button>

              {ingestedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Data Synced!</strong> This offline pen-and-paper test result has been committed to{' '}
                    <strong>{currentScan.studentName}</strong>'s permanent digital dossier. It now appears in Student
                    Dashboard, Batch Benchmarks, and Parent WhatsApp reports.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Workflow Explanation Card */}
          <div className="p-5 rounded-3xl bg-zinc-100/80 border border-zinc-200 text-zinc-700 text-xs space-y-3">
            <h4 className="font-extrabold text-zinc-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Hybrid Exam Center Workflow
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-zinc-600">
              <li>Students take pen-and-paper Sunday mock tests on standard 75/180 bubble sheets.</li>
              <li>Center staff scan batches via any high-speed multi-feed flatbed or document scanner.</li>
              <li>Eximo's Computer Vision extracts marked bubbles with sub-pixel alignment calibration.</li>
              <li>Ambiguous marks are flagged for 1-click teacher validation.</li>
              <li>Instantly dispatches scores to parents via WhatsApp and updates rank rosters.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Modal: Manual Bubble Inspection & Discrepancy Resolution */}
      {manualReviewModalQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Optical Diagnostic Inspector
                </span>
                <h3 className="text-base font-black text-zinc-900 mt-0.5">
                  Question #{manualReviewModalQuestion.questionNumber} Inspection
                </h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                manualReviewModalQuestion.status === 'correct' ? 'bg-emerald-100 text-emerald-800' :
                manualReviewModalQuestion.status === 'ambiguous' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {manualReviewModalQuestion.status.toUpperCase()}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Detected Mark:</span>
                <strong className="font-mono text-zinc-900">{manualReviewModalQuestion.markedOption}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Official Answer Key:</span>
                <strong className="font-mono text-indigo-600">{manualReviewModalQuestion.correctAnswer}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Optical Opacity Confidence:</span>
                <strong className="font-mono text-emerald-600">{(manualReviewModalQuestion.confidence * 100).toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Marks Awarded:</span>
                <strong className="font-mono text-zinc-900">{manualReviewModalQuestion.marksAwarded}</strong>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              In case of physical eraser smudge or ambiguous double bubbles, presiding faculty can override the optical classification.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setManualReviewModalQuestion(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
