import React, { useState } from 'react';
import { Printer, X, Eye, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import { TestBlueprint } from '../types';

interface PrintPaperModalProps {
  test: TestBlueprint;
  onClose: () => void;
}

export const PrintPaperModal: React.FC<PrintPaperModalProps> = ({ test, onClose }) => {
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/80 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col my-auto print:border-none print:shadow-none print:rounded-none">
        {/* Modal Controls Bar (Hidden during printing) */}
        <div className="bg-zinc-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-zinc-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-sm text-zinc-100">Printable Examination Paper & Answer Key</h3>
              <p className="text-xs text-zinc-400">Institutional offline test layout with security watermark</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showAnswerKey ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {showAnswerKey ? 'Showing Answer Key & Solutions' : 'View Faculty Solutions Sheet'}
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Examination Paper Canvas */}
        <div className="p-8 sm:p-12 relative print:p-4 overflow-y-auto max-h-[82vh] print:max-h-none text-zinc-900 font-serif">
          {/* Watermark */}
          {test.instituteBranding.watermarkText && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.035] select-none z-0 rotate-[-25deg]">
              <span className="text-6xl sm:text-8xl font-black uppercase tracking-widest text-zinc-950 text-center">
                {test.instituteBranding.watermarkText}
              </span>
            </div>
          )}

          {/* Test Paper Header */}
          <div className="border-b-2 border-zinc-900 pb-5 mb-6 relative z-10">
            <div className="text-center mb-3">
              <span className="text-[11px] font-sans font-extrabold uppercase tracking-widest text-zinc-600">
                OFFICIAL QUESTION BOOKLET
              </span>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950 mt-1">
                {test.instituteBranding.instituteName}
              </h1>
              <p className="text-xs text-zinc-600 font-sans tracking-wide mt-0.5">
                {test.instituteBranding.branch}
              </p>
            </div>

            <div className="bg-zinc-100 rounded-lg p-3 text-center border border-zinc-300 my-4 font-sans">
              <h2 className="text-base sm:text-lg font-bold text-zinc-900">{test.title}</h2>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-zinc-700 mt-1">
                <span>Target: <strong>{test.examType}</strong></span>
                <span>•</span>
                <span>Duration: <strong>{test.totalDurationMinutes} Minutes</strong></span>
                <span>•</span>
                <span>Max Marks: <strong>{test.totalMarks}</strong></span>
                <span>•</span>
                <span>Test Code: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-zinc-300">{test.instituteBranding.testCode}</strong></span>
              </div>
            </div>

            {/* Student Roll and Details Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans mt-3 border border-zinc-400 p-3 rounded">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-700">Candidate Name:</span>
                <span className="flex-1 border-b border-dotted border-zinc-400 h-4"></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-700">Roll Number:</span>
                <div className="flex gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-5 h-6 border border-zinc-400 rounded-xs"></div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-700">Batch Code:</span>
                <span className="flex-1 border-b border-dotted border-zinc-400 h-4"></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-700">Invigilator Sign:</span>
                <span className="flex-1 border-b border-dotted border-zinc-400 h-4"></span>
              </div>
            </div>

            {/* General Instructions */}
            <div className="mt-4 text-[11px] font-sans text-zinc-700 space-y-1 bg-zinc-50 p-3 rounded border border-zinc-200">
              <div className="font-bold text-zinc-900 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-800" />
                Important Instructions:
              </div>
              <ul className="list-decimal list-inside space-y-0.5 text-zinc-600">
                {test.instructions.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
                <li>Do not write rough work on the answer sheet; use the designated blank pages.</li>
                <li>Verify your paper has all printed questions in complete sequence.</li>
              </ul>
            </div>
          </div>

          {/* Test Sections & Questions */}
          <div className="space-y-8 relative z-10 font-sans">
            {test.sections.map((section, secIdx) => (
              <div key={section.id} className="space-y-5">
                {/* Section Title Banner */}
                <div className="border-y-2 border-zinc-800 py-2 bg-zinc-100 flex items-center justify-between px-3">
                  <span className="font-extrabold text-sm uppercase tracking-wider text-zinc-900">
                    Section {secIdx + 1}: {section.name} ({section.subject})
                  </span>
                  <span className="text-xs font-semibold text-zinc-700">
                    Marking Scheme: Correct +{section.markingScheme.correct}, Incorrect -{section.markingScheme.incorrect}
                  </span>
                </div>

                {/* Section Question Items */}
                <div className="space-y-6">
                  {section.questions.map((q, qIdx) => (
                    <div key={q.id} className="text-sm space-y-2 border-b border-zinc-200 pb-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-semibold text-zinc-900 leading-relaxed flex-1">
                          <span className="font-bold mr-2 text-zinc-950">Q.{qIdx + 1}</span>
                          <span className="whitespace-pre-line">{q.text}</span>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded shrink-0">
                          [{q.marks} Marks]
                        </span>
                      </div>

                      {/* Options for MCQ */}
                      {q.type === 'mcq' && q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pl-4 text-zinc-800">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full border border-zinc-400 font-mono text-xs flex items-center justify-center font-bold text-zinc-700 shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Numerical input placeholder in paper */}
                      {q.type === 'numerical' && (
                        <div className="mt-2 pl-4 flex items-center gap-3">
                          <span className="text-xs text-zinc-600 font-sans italic">
                            (Enter non-negative numerical/integer value in OMR / answer box)
                          </span>
                          <div className="w-24 h-7 border border-dashed border-zinc-400 rounded"></div>
                        </div>
                      )}

                      {/* Subjective answer area placeholder */}
                      {q.type === 'subjective' && (
                        <div className="mt-3 pl-4 border border-dashed border-zinc-300 rounded p-3 h-24 text-xs text-zinc-400 italic">
                          Candidate written response area...
                        </div>
                      )}

                      {/* Answer Key Reveal (If toggled by faculty) */}
                      {showAnswerKey && (
                        <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg text-xs space-y-1 font-sans">
                          <div className="flex items-center gap-2 font-bold text-indigo-900">
                            <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Correct Answer: {q.correctAnswer}</span>
                            <span className="text-zinc-500 font-normal">| Difficulty: {q.difficulty}</span>
                          </div>
                          <p className="text-zinc-700 leading-relaxed">
                            <strong>Step-by-Step Solution:</strong> {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Test Paper Footer */}
          <div className="mt-12 pt-4 border-t-2 border-zinc-900 text-center text-xs text-zinc-500 font-sans flex justify-between items-center">
            <span>{test.instituteBranding.testCode}</span>
            <span className="font-bold uppercase tracking-widest text-zinc-700">*** END OF EXAMINATION PAPER ***</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
