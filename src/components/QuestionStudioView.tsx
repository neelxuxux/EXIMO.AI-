import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  Plus,
  BookOpen,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  FileCheck,
  ChevronDown,
  RotateCw,
  Copy,
  BrainCircuit
} from 'lucide-react';
import { Question, ExamType, Subject, QuestionType, DifficultyLevel, BloomsLevel } from '../types';

interface QuestionStudioViewProps {
  questionBank: Question[];
  onAddQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onAddToActivePaper?: (q: Question) => void;
}

export const QuestionStudioView: React.FC<QuestionStudioViewProps> = ({
  questionBank,
  onAddQuestion,
  onDeleteQuestion,
  onAddToActivePaper,
}) => {
  // Generation Form State
  const [examType, setExamType] = useState<ExamType>('JEE Main');
  const [subject, setSubject] = useState<Subject>('Physics');
  const [topic, setTopic] = useState<string>('Electromagnetism');
  const [subTopic, setSubTopic] = useState<string>("Faraday's & Lenz Law");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [questionType, setQuestionType] = useState<QuestionType>('mcq');
  const [bloomsLevel, setBloomsLevel] = useState<BloomsLevel>('Application' as BloomsLevel);
  const [count, setCount] = useState<number>(2);
  const [syllabusNotes, setSyllabusNotes] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPreview, setGeneratedPreview] = useState<Question[]>([]);
  const [genError, setGenError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Bank Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('All');

  // Subjects based on exam type
  const getSubjectsForExam = (exam: ExamType): Subject[] => {
    switch (exam) {
      case 'JEE Main':
      case 'JEE Advanced':
        return ['Physics', 'Chemistry', 'Mathematics'];
      case 'NEET-UG':
        return ['Physics', 'Chemistry', 'Biology'];
      case 'CAT (IIM)':
        return ['Quantitative Aptitude', 'Data Interpretation & LR', 'Verbal Ability & RC'];
      case 'CBSE Class 12':
        return ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
      default:
        return ['Physics', 'Chemistry', 'Mathematics'];
    }
  };

  const handleExamChange = (newExam: ExamType) => {
    setExamType(newExam);
    const validSubjects = getSubjectsForExam(newExam);
    if (!validSubjects.includes(subject)) {
      setSubject(validSubjects[0]);
    }
  };

  // Generate Questions via backend Gemini route
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenError(null);
    setSaveSuccessMsg(null);

    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType,
          subject,
          topic,
          subTopic,
          difficulty,
          questionType: questionType === 'mcq' ? 'MCQ Single' : questionType === 'numerical' ? 'Numerical' : 'Short Answer',
          count,
          bloomsLevel,
          syllabusNotes,
        }),
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.questions)) {
        const formattedQuestions: Question[] = data.questions.map((q: any) => ({
          id: q.id || 'ai_' + Math.random().toString(36).substring(2, 9),
          examType,
          subject,
          topic: q.topic || topic,
          subTopic: q.subTopic || subTopic,
          type: q.type || questionType,
          text: q.text,
          options: q.options || [],
          correctAnswer: q.correctAnswer || (q.options ? q.options[0] : 'N/A'),
          correctOptionIndex: q.correctOptionIndex ?? 0,
          explanation: q.explanation || 'Step by step derivation provided by Eximo AI.',
          difficulty: q.difficulty || difficulty,
          marks: q.marks || (examType === 'CAT (IIM)' ? 3 : 4),
          negativeMarks: q.negativeMarks ?? (examType === 'CAT (IIM)' ? 1 : 1),
          bloomsLevel: q.bloomsLevel || bloomsLevel,
          estimatedTimeSeconds: q.estimatedTimeSeconds || 90,
          source: 'AI Generated',
        }));
        setGeneratedPreview(formattedQuestions);
      } else {
        setGenError('Unable to generate questions. Please try again or refine prompt.');
      }
    } catch (err: any) {
      console.error(err);
      setGenError(err.message || 'Error communicating with AI engine.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save question to institute bank
  const handleSaveToBank = (q: Question) => {
    onAddQuestion(q);
    setSaveSuccessMsg(`Saved "${q.topic}" question to institute Question Bank!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Save all generated questions
  const handleSaveAllToBank = () => {
    generatedPreview.forEach((q) => onAddQuestion(q));
    setSaveSuccessMsg(`Added ${generatedPreview.length} questions to Institute Repository!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Filtered Bank List
  const filteredBank = questionBank.filter((q) => {
    const matchesSearch =
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.subTopic && q.subTopic.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = selectedSubjectFilter === 'All' || q.subject === selectedSubjectFilter;
    const matchesDifficulty = selectedDifficultyFilter === 'All' || q.difficulty === selectedDifficultyFilter;

    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Studio Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">AI Question Studio & Bank</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Author authentic competitive questions aligned with syllabus, Bloom’s taxonomy, and marking schemes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700">
            Repository Size: <strong className="text-indigo-600 font-bold">{questionBank.length}</strong> Questions
          </div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Grid: Generator on Left / Recent or Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 5 Cols: AI Generator Blueprint Console */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
              Syllabus & Blueprint Parameters
            </span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
              Gemini Powered
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Target Exam */}
            <div>
              <label className="block font-bold text-zinc-700 mb-1">Target Examination:</label>
              <select
                value={examType}
                onChange={(e) => handleExamChange(e.target.value as ExamType)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-semibold text-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="JEE Main">JEE Main (NTA Standard)</option>
                <option value="JEE Advanced">JEE Advanced (IIT Multi-Concept)</option>
                <option value="NEET-UG">NEET-UG (Medical NCERT)</option>
                <option value="CAT (IIM)">CAT (IIM Aptitude & Logic)</option>
                <option value="CBSE Class 12">CBSE Class 12 Board</option>
              </select>
            </div>

            {/* Subject & Difficulty */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Subject:</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as Subject)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-semibold text-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {getSubjectsForExam(examType).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Difficulty:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-semibold text-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="Easy">Easy (Formula Direct)</option>
                  <option value="Medium">Medium (Standard PYQ)</option>
                  <option value="Hard">Hard (Multi-step)</option>
                  <option value="Olympiad">Olympiad / Advanced</option>
                </select>
              </div>
            </div>

            {/* Topic & Subtopic */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Chapter / Topic:</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Electromagnetism"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-medium text-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Sub-topic:</label>
                <input
                  type="text"
                  value={subTopic}
                  onChange={(e) => setSubTopic(e.target.value)}
                  placeholder="e.g. Mutual Inductance"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-medium text-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Question Type & Taxonomy */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Question Type:</label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-semibold text-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="mcq">MCQ (Single Correct)</option>
                  <option value="numerical">Numerical / Integer</option>
                  <option value="assertion_reason">Assertion - Reason</option>
                  <option value="subjective">Descriptive / Subjective</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Bloom's Taxonomy:</label>
                <select
                  value={bloomsLevel}
                  onChange={(e) => setBloomsLevel(e.target.value as BloomsLevel)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-semibold text-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="Remember">Remember (Recall)</option>
                  <option value="Understand">Understand (Concept)</option>
                  <option value="Apply">Apply (Problem Solving)</option>
                  <option value="Analyze">Analyze (Multi-variable)</option>
                  <option value="Evaluate">Evaluate (Critical)</option>
                </select>
              </div>
            </div>

            {/* Custom Notes / Specific instructions */}
            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Custom Constraints & Syllabus Focus (Optional):
              </label>
              <textarea
                rows={3}
                value={syllabusNotes}
                onChange={(e) => setSyllabusNotes(e.target.value)}
                placeholder="e.g. 'Incorporate time-varying magnetic field B(t) = a*t^2 with resistive dissipation' or 'Include real-world application trick'"
                className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-medium text-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Count Selector */}
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-zinc-700">Questions to Generate:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                      count === n
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Generating Rigorous Question via AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate {count} {difficulty} Questions
                </>
              )}
            </button>

            {genError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{genError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right 7 Cols: Generated Questions Staging & Instant Review */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                {generatedPreview.length > 0 ? 'AI Generated Staging Sandbox' : 'AI Live Preview'}
              </h2>
              <p className="text-xs text-zinc-500">
                Review questions, verify answer keys & LaTeX formatting before committing to bank
              </p>
            </div>

            {generatedPreview.length > 0 && (
              <button
                onClick={handleSaveAllToBank}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Add All ({generatedPreview.length}) to Bank
              </button>
            )}
          </div>

          {generatedPreview.length === 0 && !isGenerating && (
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-zinc-200 flex items-center justify-center mx-auto text-indigo-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-zinc-800">No Generated Questions in Staging</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Configure your subject, topic, and Bloom's difficulty level on the left console, then click Generate to create fresh questions with full solutions.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="bg-white rounded-2xl border border-indigo-100 p-8 shadow-xs text-center space-y-4 animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600">
                <BrainCircuit className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900">Eximo Neural Engine is synthesizing questions...</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Synthesizing question text, calculating distractors, validating option consistency, and generating step-by-step solution derivations.
                </p>
              </div>
            </div>
          )}

          {/* Render Generated Cards */}
          <div className="space-y-4">
            {generatedPreview.map((q, idx) => (
              <div key={q.id || idx} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                      Generated #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                      {q.subject} • {q.topic}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      +{q.marks}/-{q.negativeMarks}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveToBank(q)}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Save to Bank
                    </button>
                    {onAddToActivePaper && (
                      <button
                        onClick={() => onAddToActivePaper(q)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200"
                      >
                        Add to Paper
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-zinc-900 leading-relaxed">{q.text}</p>

                {/* Options */}
                {q.type === 'mcq' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctOptionIndex || opt === q.correctAnswer;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-lg border flex items-center gap-2 ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-[10px] shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                          {isCorrect && (
                            <span className="ml-auto text-[10px] font-bold text-emerald-700 uppercase">Correct</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Numerical representation */}
                {q.type === 'numerical' && (
                  <div className="text-xs bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 flex items-center gap-2">
                    <span className="font-bold text-zinc-700">Correct Value:</span>
                    <span className="font-mono font-black text-indigo-600">{q.correctAnswer}</span>
                  </div>
                )}

                {/* Pedagogical Explanation */}
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs space-y-1">
                  <span className="font-bold text-zinc-800">Pedagogical Derivation / Solution:</span>
                  <p className="text-zinc-600 leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Institute Question Bank Repository Table & Explorer */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Institute Question Repository ({filteredBank.length})
            </h2>
            <p className="text-xs text-zinc-500">
              Verified question bank searchable by subject, difficulty, and keywords
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search topic or formula..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg font-medium text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-52"
              />
            </div>

            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg font-semibold text-zinc-700 focus:outline-hidden"
            >
              <option value="All">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Biology">Biology</option>
              <option value="Quantitative Aptitude">Quantitative Aptitude</option>
            </select>

            <select
              value={selectedDifficultyFilter}
              onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg font-semibold text-zinc-700 focus:outline-hidden"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Question Bank Items */}
        <div className="divide-y divide-zinc-200">
          {filteredBank.map((q, idx) => (
            <div key={q.id} className="py-4 space-y-2 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                    #{idx + 1}
                  </span>
                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {q.subject}
                  </span>
                  <span className="font-medium text-zinc-700">{q.topic}</span>
                  <span className="text-zinc-400">•</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                      q.difficulty === 'Easy'
                        ? 'bg-emerald-50 text-emerald-700'
                        : q.difficulty === 'Medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                  <span className="text-zinc-500 font-mono">({q.examType})</span>
                </div>

                <div className="flex items-center gap-2">
                  {onAddToActivePaper && (
                    <button
                      onClick={() => onAddToActivePaper(q)}
                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-xs font-semibold border border-indigo-200 transition-all"
                    >
                      + Add to Paper
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteQuestion(q.id)}
                    className="p-1 text-zinc-400 hover:text-rose-600 transition-all rounded hover:bg-rose-50"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="font-medium text-zinc-900 text-sm">{q.text}</p>

              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-zinc-600 pl-2">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-1.5">
                      <span className="font-bold text-zinc-500">
                        {String.fromCharCode(65 + oIdx)}.
                      </span>
                      <span className={oIdx === q.correctOptionIndex ? 'font-bold text-emerald-700' : ''}>
                        {opt}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-zinc-500 text-[11px] pt-1">
                <span>Correct: <strong className="text-emerald-700">{q.correctAnswer}</strong></span>
                <span>•</span>
                <span>Marks: +{q.marks} / -{q.negativeMarks}</span>
                <span>•</span>
                <span>Est. Time: {q.estimatedTimeSeconds}s</span>
                <span>•</span>
                <span>Source: {q.source || 'Institute Repository'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
