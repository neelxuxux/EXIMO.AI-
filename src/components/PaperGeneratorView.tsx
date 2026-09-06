import React, { useState } from 'react';
import {
  FileText,
  Plus,
  PlayCircle,
  Printer,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Trash2,
  Settings,
  ChevronRight,
  Clock,
  Award,
  Users
} from 'lucide-react';
import { TestBlueprint, Question, Batch, ExamType, Subject, SectionBlueprint } from '../types';
import { PrintPaperModal } from './PrintPaperModal';

interface PaperGeneratorViewProps {
  testPapers: TestBlueprint[];
  batches: Batch[];
  questionBank: Question[];
  onSavePaper: (paper: TestBlueprint) => void;
  onLaunchCbt: (paper: TestBlueprint) => void;
}

export const PaperGeneratorView: React.FC<PaperGeneratorViewProps> = ({
  testPapers,
  batches,
  questionBank,
  onSavePaper,
  onLaunchCbt,
}) => {
  const [selectedPaperForPrint, setSelectedPaperForPrint] = useState<TestBlueprint | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // New Paper Blueprint Form
  const [title, setTitle] = useState<string>('JEE Main 2026 - All India Speed & Accuracy Mock #05');
  const [examType, setExamType] = useState<ExamType>('JEE Main');
  const [durationMinutes, setDurationMinutes] = useState<number>(180);
  const [targetBatchId, setTargetBatchId] = useState<string>(batches[0]?.id || '');
  const [testCode, setTestCode] = useState<string>('EXM-JEE-2026-M05');
  const [watermark, setWatermark] = useState<string>('APEX ACADEMY CONFIDENTIAL');

  // Draft Sections
  const [sections, setSections] = useState<SectionBlueprint[]>([
    {
      id: 'sec_phy',
      name: 'Physics',
      subject: 'Physics',
      totalQuestions: 2,
      markingScheme: { correct: 4, incorrect: 1, unattempted: 0 },
      questions: questionBank.filter((q) => q.subject === 'Physics').slice(0, 2),
    },
    {
      id: 'sec_chem',
      name: 'Chemistry',
      subject: 'Chemistry',
      totalQuestions: 2,
      markingScheme: { correct: 4, incorrect: 1, unattempted: 0 },
      questions: questionBank.filter((q) => q.subject === 'Chemistry').slice(0, 2),
    },
    {
      id: 'sec_math',
      name: 'Mathematics',
      subject: 'Mathematics',
      totalQuestions: 2,
      markingScheme: { correct: 4, incorrect: 1, unattempted: 0 },
      questions: questionBank.filter((q) => q.subject === 'Mathematics').slice(0, 2),
    },
  ]);

  // Add question from bank to a section
  const handleAddQuestionToSection = (sectionId: string, q: Question) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          if (sec.questions.some((item) => item.id === q.id)) return sec;
          return {
            ...sec,
            questions: [...sec.questions, q],
            totalQuestions: sec.questions.length + 1,
          };
        }
        return sec;
      })
    );
  };

  // Remove question from section
  const handleRemoveQuestionFromSection = (sectionId: string, qId: string) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            questions: sec.questions.filter((item) => item.id !== qId),
            totalQuestions: Math.max(0, sec.questions.length - 1),
          };
        }
        return sec;
      })
    );
  };

  // Auto fill section from available question bank
  const handleAutoFillSection = (sectionId: string, subject: Subject) => {
    const available = questionBank.filter((q) => q.subject === subject);
    if (available.length > 0) {
      setSections((prev) =>
        prev.map((sec) => {
          if (sec.id === sectionId) {
            return {
              ...sec,
              questions: available.slice(0, 4),
              totalQuestions: Math.min(4, available.length),
            };
          }
          return sec;
        })
      );
    }
  };

  // Calculate total marks
  const calculatedTotalMarks = sections.reduce(
    (acc, sec) => acc + sec.questions.reduce((qAcc, q) => qAcc + q.marks, 0),
    0
  );

  // Save Paper
  const handleSaveBlueprint = () => {
    const newPaper: TestBlueprint = {
      id: 'test_' + Date.now(),
      title,
      examType,
      targetBatchIds: [targetBatchId],
      totalDurationMinutes: durationMinutes,
      totalMarks: calculatedTotalMarks || 300,
      cutoffPercentage: 45,
      status: 'Live',
      createdDate: new Date().toISOString().split('T')[0],
      instructions: [
        `Total duration of examination is ${durationMinutes} minutes.`,
        'Candidates must adhere strictly to examination code of conduct.',
        'Each question carries positive marks for correct response and negative deduction for incorrect response.',
        'Submit the test only after reviewing all attempted responses in the palette.',
      ],
      sections,
      instituteBranding: {
        instituteName: 'APEX ACADEMY OF COMPETITIVE SCIENCES',
        branch: 'Central Campus, Kota (Rajasthan)',
        watermarkText: watermark,
        testCode,
      },
    };

    onSavePaper(newPaper);
    setIsCreatingNew(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">
              Test Blueprint & Paper Studio
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Construct sectioned test blueprints, schedule exams for batches, and export watermarked printable papers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isCreatingNew && (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" /> Create New Test Blueprint
            </button>
          )}
        </div>
      </div>

      {/* Blueprint Creator Drawer / Form */}
      {isCreatingNew && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900">New Examination Blueprint Setup</h2>
              <p className="text-xs text-zinc-500">Configure parameters, section structure, and marking schemes</p>
            </div>
            <button
              onClick={() => setIsCreatingNew(false)}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-800"
            >
              Cancel
            </button>
          </div>

          {/* Core Configuration Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-bold text-zinc-700 mb-1">Test Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-medium text-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Target Examination:</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamType)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-semibold text-zinc-800 focus:outline-hidden"
              >
                <option value="JEE Main">JEE Main</option>
                <option value="JEE Advanced">JEE Advanced</option>
                <option value="NEET-UG">NEET-UG</option>
                <option value="CAT (IIM)">CAT (IIM)</option>
                <option value="CBSE Class 12">CBSE Class 12</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Assign to Batch:</label>
              <select
                value={targetBatchId}
                onChange={(e) => setTargetBatchId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-semibold text-zinc-800 focus:outline-hidden"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.studentCount} students)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Duration (Minutes):</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-medium text-zinc-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Paper Test Code:</label>
              <input
                type="text"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-mono font-medium text-zinc-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Sectional Builder */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Exam Sections & Questions ({sections.length} Sections, Total Calculated Marks: {calculatedTotalMarks})
              </h3>
            </div>

            <div className="space-y-4">
              {sections.map((sec) => (
                <div key={sec.id} className="bg-zinc-50 rounded-xl border border-zinc-200 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-zinc-900">{sec.name}</span>
                      <span className="text-zinc-500 font-medium">({sec.questions.length} questions included)</span>
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono text-[10px]">
                        Marking: +{sec.markingScheme.correct} / -{sec.markingScheme.incorrect}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAutoFillSection(sec.id, sec.subject)}
                      className="px-2.5 py-1 bg-white hover:bg-zinc-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Auto-Fill from Bank
                    </button>
                  </div>

                  {/* Included Questions in section */}
                  <div className="space-y-2">
                    {sec.questions.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="bg-white p-3 rounded-lg border border-zinc-200 text-xs flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex-1 truncate">
                          <span className="font-bold mr-2 text-zinc-900">Q.{qIdx + 1}</span>
                          <span className="font-medium text-zinc-800">{q.text}</span>
                          <span className="ml-2 text-[10px] text-zinc-500">[{q.topic} • {q.difficulty}]</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-[11px] text-zinc-500">+{q.marks}m</span>
                          <button
                            onClick={() => handleRemoveQuestionFromSection(sec.id, q.id)}
                            className="text-zinc-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Finalize Action */}
          <div className="border-t border-zinc-200 pt-4 flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium">
              Ready to deploy. All sections verified with authentic scoring matrices.
            </span>
            <button
              onClick={handleSaveBlueprint}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              Commit & Publish Examination Blueprint
            </button>
          </div>
        </div>
      )}

      {/* Existing Institute Test Papers Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900">
            Active Institute Test Papers ({testPapers.length})
          </h2>
          <span className="text-xs text-zinc-500">Available for Online CBT & Offline Print Execution</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testPapers.map((paper) => {
            const totalQ = paper.sections.reduce((acc, s) => acc + s.questions.length, 0);

            return (
              <div
                key={paper.id}
                className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-300 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {paper.examType}
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        paper.status === 'Live'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : paper.status === 'Scheduled'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {paper.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-zinc-900 leading-snug">{paper.title}</h3>

                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{paper.totalDurationMinutes} mins</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{paper.totalMarks} Marks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{paper.sections.length} Sections ({totalQ} Qs)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{paper.targetBatchIds.length} Batches</span>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="border-t border-zinc-100 pt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedPaperForPrint(paper)}
                    className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-zinc-600" /> Print Paper
                  </button>

                  <button
                    onClick={() => onLaunchCbt(paper)}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                  >
                    <PlayCircle className="w-3.5 h-3.5" /> Start CBT
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Print Modal */}
      {selectedPaperForPrint && (
        <PrintPaperModal
          test={selectedPaperForPrint}
          onClose={() => setSelectedPaperForPrint(null)}
        />
      )}
    </div>
  );
};
