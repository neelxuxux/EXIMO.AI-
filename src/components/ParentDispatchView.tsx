import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  FileText,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Users,
  Smartphone,
  Calendar,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Phone,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Percent
} from 'lucide-react';
import { Student, Batch, TestAttemptResult, InstituteSettings } from '../types';

interface ParentDispatchViewProps {
  students: Student[];
  batches: Batch[];
  attemptResults: TestAttemptResult[];
  settings: InstituteSettings;
}

export const ParentDispatchView: React.FC<ParentDispatchViewProps> = ({
  students,
  batches,
  attemptResults,
  settings,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'std_01');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
  const [tone, setTone] = useState<'encouraging_motivating' | 'firm_action' | 'strategic_focus'>('encouraging_motivating');
  const [isGeneratingAiNote, setIsGeneratingAiNote] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Bulk batch dispatch state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [bulkDispatchProgress, setBulkDispatchProgress] = useState<number>(0);
  const [isBulkSending, setIsBulkSending] = useState<boolean>(false);
  const [bulkSentCount, setBulkSentCount] = useState<number>(0);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const studentBatch = batches.find((b) => b.id === currentStudent?.batchId);
  const studentAttempts = attemptResults.filter(
    (a) => a.studentId === currentStudent?.id || a.studentName === currentStudent?.name
  );

  // Editable fields
  const [guardianPhone, setGuardianPhone] = useState<string>(currentStudent?.guardianPhone || '+91 98290 44120');
  const [guardianName, setGuardianName] = useState<string>(currentStudent?.guardianName || 'Dr. Vikram Sharma');
  const [teacherNote, setTeacherNote] = useState<string>(
    currentStudent?.recentTeacherFeedback ||
      `Dear ${currentStudent?.guardianName || 'Parent'},\n\nAarav has maintained consistent academic diligence throughout this testing cycle, securing Rank #${currentStudent?.rankInBatch} in the batch with an overall accuracy of 89%.\n\nAttendance in classroom lectures and doubt-resolution clinics stands at ${currentStudent?.attendanceRate}%. To maximize score gains in upcoming tests, Aarav is advised to dedicate additional practice time to Rotational Dynamics and 2-variable equilibrium equations.\n\nWarm regards,\nLead Faculty Council\n${settings.instituteName}`
  );

  // Update fields when selected student changes
  const handleSelectStudent = (stdId: string) => {
    setSelectedStudentId(stdId);
    const std = students.find((s) => s.id === stdId);
    if (std) {
      setGuardianName(std.guardianName || `Parent of ${std.name}`);
      setGuardianPhone(std.guardianPhone || '+91 98000 12345');
      setTeacherNote(
        std.recentTeacherFeedback
          ? `Dear ${std.guardianName || 'Parent'},\n\n${std.name} has maintained a stellar ${std.attendanceRate}% classroom attendance and currently holds Rank #${std.rankInBatch} in ${std.batchName}.\n\n${std.recentTeacherFeedback}\n\nOur faculty team will be hosting individual doubt mentoring this Saturday.\n\nWarm regards,\nAcademic Directorate\n${settings.instituteName}`
          : `Dear ${std.guardianName || 'Parent'},\n\nWe are sharing ${std.name}'s performance report. Average score: ${std.avgScore}, Attendance: ${std.attendanceRate}%. Focus areas: ${std.weakTopics.join(', ')}.\n\nWarm regards,\n${settings.instituteName}`
      );
      setDispatchStatus(null);
    }
  };

  // AI Note Generator Handler
  const handleGenerateAiNote = async () => {
    if (!currentStudent) return;
    setIsGeneratingAiNote(true);
    setDispatchStatus(null);
    try {
      const res = await fetch('/api/ai/generate-parent-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: currentStudent.name,
          guardianName: guardianName,
          rollNumber: currentStudent.rollNumber,
          targetExam: currentStudent.targetExam,
          avgScore: currentStudent.avgScore,
          maxScore: 300,
          rankInBatch: currentStudent.rankInBatch,
          totalStudents: studentBatch?.studentCount || 30,
          attendanceRate: currentStudent.attendanceRate,
          strongTopics: currentStudent.strongTopics,
          weakTopics: currentStudent.weakTopics,
          tone: tone,
        }),
      });
      const data = await res.json();
      if (data.note) {
        setTeacherNote(data.note);
      }
    } catch (err) {
      console.error('Failed to generate AI note:', err);
    } finally {
      setIsGeneratingAiNote(false);
    }
  };

  // Prepare formatted WhatsApp message
  const whatsappMessageText = `*${settings.instituteName.toUpperCase()}* 🎓
*Official Student Performance & Attendance Report*

👤 *Candidate:* ${currentStudent?.name}
🆔 *Roll No:* ${currentStudent?.rollNumber}
📚 *Target Exam:* ${currentStudent?.targetExam} (${currentStudent?.batchName})
📍 *Branch:* ${currentStudent?.branchName || settings.branch}

📊 *KEY ACADEMIC METRICS:*
• *Classroom Attendance:* ${currentStudent?.attendanceRate}% (Regular)
• *Cumulative Avg Score:* ${currentStudent?.avgScore} / 300
• *Batch Standing:* Rank #${currentStudent?.rankInBatch} in Batch
• *Total Mocks Logged:* ${currentStudent?.totalTestsAttempted} assessments

🌟 *Key Conceptual Strengths:*
${currentStudent?.strongTopics.map((t) => `  ✓ ${t}`).join('\n')}

⚠️ *High-Yield Revision Priorities:*
${currentStudent?.weakTopics.map((t) => `  ! ${t}`).join('\n')}

📝 *DIRECTOR & TEACHER FEEDBACK:*
"${teacherNote.trim()}"

🔗 *Interactive Digital Scorecard & Analysis:*
https://eximo.ai/report/${currentStudent?.rollNumber.toLowerCase()}

_Generated via Eximo.ai Academic Engine on behalf of ${settings.instituteName}._`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(whatsappMessageText);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = guardianPhone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(whatsappMessageText);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
    setDispatchStatus('WhatsApp chat launched successfully! Message queued for dispatch.');
  };

  const handleSimulateSms = () => {
    setDispatchStatus(`SMS dispatched to ${guardianPhone} via Apex Institute SMS Gateway (DLR ID: #SMS-8921-OK).`);
  };

  // Bulk Dispatch Handler
  const handleStartBulkDispatch = () => {
    setIsBulkSending(true);
    setBulkDispatchProgress(0);
    setBulkSentCount(0);

    const filtered = selectedBatchId === 'all'
      ? students
      : students.filter((s) => s.batchId === selectedBatchId);

    const total = filtered.length;
    let step = 0;

    const interval = setInterval(() => {
      step += 1;
      setBulkSentCount(step);
      setBulkDispatchProgress(Math.round((step / total) * 100));

      if (step >= total) {
        clearInterval(interval);
        setIsBulkSending(false);
      }
    }, 450);
  };

  const filteredStudents = selectedBatchId === 'all'
    ? students
    : students.filter((s) => s.batchId === selectedBatchId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              Parent Communication CRM
            </span>
            <span className="text-zinc-400">•</span>
            <span className="text-xs text-zinc-500 font-medium">WhatsApp API Gateway & Print Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mt-1">
            Parent Progress Report & WhatsApp Dispatch
          </h1>
          <p className="text-sm text-zinc-600 mt-1 max-w-3xl">
            Generate verifiable student progress cards featuring classroom attendance, test accuracy trajectories,
            and AI-synthesized teacher notes ready for instantaneous parent WhatsApp dispatch or PDF printing.
          </p>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            Batch Broadcast ({filteredStudents.length} Parents)
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold transition-all shadow-2xs"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            Print Report Card
          </button>
        </div>
      </div>

      {/* Student & Batch Selector Bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Batch Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Select Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Batches ({students.length} students)</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.studentCount} students)
                </option>
              ))}
            </select>
          </div>

          {/* Student Selector */}
          <div className="space-y-1 flex-1 min-w-[220px]">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => handleSelectStudent(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {filteredStudents.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.name} • Roll: {std.rollNumber} • Rank #{std.rankInBatch} ({std.batchName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Candidate Quick Badge */}
        {currentStudent && (
          <div className="flex items-center gap-3 pl-4 border-l border-zinc-100 shrink-0">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm border border-indigo-200">
              {currentStudent.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-zinc-900 leading-tight">{currentStudent.name}</h4>
              <p className="text-[11px] text-zinc-500">
                Guardian: <strong>{currentStudent.guardianName || 'Parent'}</strong> ({currentStudent.guardianPhone || '+91 98...'})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Left = Progress Report Card & Diagnostics, Right = WhatsApp / SMS Dispatch Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Comprehensive Progress Card (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Progress Card Container */}
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-7 space-y-6">
            {/* Report Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-zinc-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {currentStudent?.targetExam} Official Progress Card
                  </span>
                  <span className="text-[11px] text-zinc-400">Term II Assessment Cycle</span>
                </div>
                <h3 className="text-xl font-black text-zinc-900 mt-1">{currentStudent?.name}</h3>
                <p className="text-xs text-zinc-500">
                  Roll: <span className="font-mono font-bold text-zinc-800">{currentStudent?.rollNumber}</span> • {currentStudent?.batchName}
                </p>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-xs text-zinc-400">Campus Branch</span>
                <p className="text-xs font-bold text-zinc-800">{currentStudent?.branchName || settings.branch}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-0.5">
                  <UserCheck className="w-3 h-3" /> Enrolled & Active
                </span>
              </div>
            </div>

            {/* 4 Core Pillars KPI Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Attendance</span>
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="text-xl font-black text-zinc-900">{currentStudent?.attendanceRate}%</div>
                <span className="text-[10px] text-emerald-600 font-semibold">Exemplary Regularity</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Avg Score</span>
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-xl font-black text-zinc-900">{currentStudent?.avgScore} <span className="text-xs text-zinc-400 font-normal">/300</span></div>
                <span className="text-[10px] text-indigo-600 font-semibold">{Math.round(((currentStudent?.avgScore || 0) / 300) * 100)}% overall</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Batch Rank</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl font-black text-indigo-600 font-mono">#{currentStudent?.rankInBatch}</div>
                <span className="text-[10px] text-zinc-500 font-semibold">Out of {studentBatch?.studentCount || 30} students</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">CBT Mocks</span>
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="text-xl font-black text-zinc-900">{currentStudent?.totalTestsAttempted}</div>
                <span className="text-[10px] text-zinc-500 font-semibold">Logged Attempts</span>
              </div>
            </div>

            {/* Subject-Wise Mastery Progress */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center justify-between">
                <span>Subject-Wise Performance & Accuracy</span>
                <span className="text-[10px] font-normal text-zinc-400">Benchmarked vs All-India Cutoff</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-zinc-700">Physics (Mechanics & Electrodynamics)</span>
                    <span className="font-mono text-indigo-600">82% Mastery (68/80 avg)</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-zinc-700">Chemistry (Organic Mechanisms & Physical)</span>
                    <span className="font-mono text-emerald-600">88% Mastery (72/80 avg)</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-zinc-700">Mathematics (Calculus & Coordinate Geometry)</span>
                    <span className="font-mono text-amber-600">68% Mastery (54/80 avg)</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Focus Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Verified Strengths
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentStudent?.strongTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white text-emerald-800 rounded-lg text-[11px] font-semibold border border-emerald-200/60 shadow-2xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Focus Topics for Improvement
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentStudent?.weakTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white text-amber-800 rounded-lg text-[11px] font-semibold border border-amber-200/60 shadow-2xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Teacher & Director Feedback Note Section */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI-Synthesized Faculty Feedback Note
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Personalized observation generated from attendance logs and test accuracy patterns
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="text-[11px] font-semibold bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-700"
                  >
                    <option value="encouraging_motivating">Encouraging & Motivating</option>
                    <option value="firm_action">Action-Oriented & Strict</option>
                    <option value="strategic_focus">Exam Strategy & Rank Focus</option>
                  </select>

                  <button
                    onClick={handleGenerateAiNote}
                    disabled={isGeneratingAiNote}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAiNote ? 'animate-spin' : ''}`} />
                    {isGeneratingAiNote ? 'Synthesizing...' : 'Regenerate'}
                  </button>
                </div>
              </div>

              <textarea
                value={teacherNote}
                onChange={(e) => setTeacherNote(e.target.value)}
                rows={5}
                className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-800 leading-relaxed focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Write or edit personalized teacher notes..."
              />
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Notes are editable before sending to parents</span>
                <span>{teacherNote.length} characters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: WhatsApp & Multi-Channel Dispatch Center (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dispatch Settings Box */}
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                Parent Dispatch Gateway
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Send structured academic report card directly to guardian contact
              </p>
            </div>

            {/* Recipient Details */}
            <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                  Guardian Name
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Guardian WhatsApp / Mobile Number</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Verified Line</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Message Preview Bubble */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  WhatsApp Message Preview
                </span>
                <button
                  onClick={handleCopyText}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copiedSuccess ? 'Copied to Clipboard!' : 'Copy Text'}
                </button>
              </div>

              {/* Chat Bubble Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-zinc-800 font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto space-y-2 shadow-inner">
                <div className="whitespace-pre-wrap font-sans text-xs text-zinc-800">
                  <div className="font-bold text-emerald-950">{settings.instituteName} 🎓</div>
                  <div className="text-[11px] text-zinc-600 mb-1">Official Student Performance Report</div>
                  <div className="border-t border-emerald-200/60 my-1"></div>
                  <div><strong>Candidate:</strong> {currentStudent?.name} ({currentStudent?.rollNumber})</div>
                  <div><strong>Batch:</strong> {currentStudent?.batchName}</div>
                  <div><strong>Classroom Attendance:</strong> {currentStudent?.attendanceRate}%</div>
                  <div><strong>Avg Test Score:</strong> {currentStudent?.avgScore} / 300 (Rank #{currentStudent?.rankInBatch})</div>
                  <div className="my-1.5 bg-white/80 p-2.5 rounded-xl border border-emerald-200 text-xs italic text-zinc-700">
                    "{teacherNote.substring(0, 160)}..."
                  </div>
                  <div className="text-indigo-700 font-medium text-[11px]">
                    👉 View full verified scorecard: https://eximo.ai/report/{currentStudent?.rollNumber.toLowerCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Dispatch Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleOpenWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all"
              >
                <Send className="w-4 h-4" />
                Dispatch via WhatsApp Now
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSimulateSms}
                  className="py-2.5 px-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                  Send SMS (160c)
                </button>

                <button
                  onClick={() => setShowPrintModal(true)}
                  className="py-2.5 px-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-zinc-500" />
                  Print Report Card
                </button>
              </div>
            </div>

            {/* Notification alert message if dispatched */}
            {dispatchStatus && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>{dispatchStatus}</p>
              </div>
            )}
          </div>

          {/* Quick FAQ / Compliance Banner */}
          <div className="p-4 rounded-2xl bg-zinc-100/80 border border-zinc-200/80 text-zinc-600 text-xs space-y-1.5">
            <div className="font-bold text-zinc-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              TRAI DLT & WhatsApp Business API Compliant
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              All messages are dispatched using your institute's verified WhatsApp sender identity with registered
              educational service templates. Parents can reply directly to initiate faculty consultation calls.
            </p>
          </div>
        </div>
      </div>

      {/* Modal 1: Formal Printable Report Card Preview */}
      {showPrintModal && currentStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-200">
            {/* Institute Formal Header */}
            <div className="text-center border-b-2 border-zinc-900 pb-4 space-y-1">
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                Academic Progress & Continuous Assessment Card
              </div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{settings.instituteName}</h2>
              <p className="text-xs text-zinc-500">{settings.branch} • Affiliated with AI Assessment Framework</p>
            </div>

            {/* Student Info Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Candidate Name</span>
                <p className="font-extrabold text-zinc-900">{currentStudent.name}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Roll Number</span>
                <p className="font-extrabold font-mono text-zinc-900">{currentStudent.rollNumber}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Enrolled Batch</span>
                <p className="font-extrabold text-zinc-900">{currentStudent.batchName}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Target Exam</span>
                <p className="font-extrabold text-indigo-600">{currentStudent.targetExam}</p>
              </div>
            </div>

            {/* Grades & Standing */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Performance Audit</h4>
              <table className="w-full text-xs text-left border border-zinc-200 rounded-xl overflow-hidden">
                <thead className="bg-zinc-100 text-zinc-700 font-bold">
                  <tr>
                    <th className="p-2.5 border-b">Parameter</th>
                    <th className="p-2.5 border-b">Observed Value</th>
                    <th className="p-2.5 border-b">Batch Standing</th>
                    <th className="p-2.5 border-b">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  <tr>
                    <td className="p-2.5 font-medium">Classroom Attendance</td>
                    <td className="p-2.5 font-bold font-mono">{currentStudent.attendanceRate}%</td>
                    <td className="p-2.5">Top 5% in Batch</td>
                    <td className="p-2.5 text-emerald-600 font-bold">Excellent</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Cumulative Test Score</td>
                    <td className="p-2.5 font-bold font-mono">{currentStudent.avgScore} / 300</td>
                    <td className="p-2.5">Rank #{currentStudent.rankInBatch}</td>
                    <td className="p-2.5 text-indigo-600 font-bold">Proficient</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Completed Full Mocks</td>
                    <td className="p-2.5 font-bold font-mono">{currentStudent.totalTestsAttempted} Tests</td>
                    <td className="p-2.5">100% Compliance</td>
                    <td className="p-2.5 text-emerald-600 font-bold">Completed</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Teacher Notes Block */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
              <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">
                Academic Director & Lead Faculty Endorsement
              </span>
              <p className="text-xs text-zinc-700 leading-relaxed">{teacherNote}</p>
            </div>

            {/* Signature Block */}
            <div className="pt-4 flex items-center justify-between border-t border-zinc-200 text-xs text-zinc-500">
              <div className="space-y-6">
                <div className="h-6 border-b border-zinc-300 w-36"></div>
                <span>Class Teacher Signature</span>
              </div>
              <div className="space-y-6 text-center">
                <div className="h-6 border-b border-zinc-300 w-36"></div>
                <span>Center Head Seal</span>
              </div>
              <div className="space-y-6 text-right">
                <div className="h-6 border-b border-zinc-300 w-36"></div>
                <span>Parent / Guardian Signature</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-50"
              >
                Close Preview
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                Trigger Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Bulk Batch WhatsApp Broadcast */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-6 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Bulk Parent WhatsApp Broadcast
                </h3>
                <p className="text-xs text-zinc-500">
                  Send personalized reports to all parents in {selectedBatchId === 'all' ? 'All Batches' : studentBatch?.name}
                </p>
              </div>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                {filteredStudents.length} Recipients
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-2">
              <div className="font-bold text-zinc-800">Dispatch Queue Overview:</div>
              <ul className="text-zinc-600 space-y-1 pl-4 list-disc text-[11px]">
                <li>Generates personalized attendance and score summaries for each student.</li>
                <li>Includes unique verifiable scorecard link for each guardian.</li>
                <li>Operates at safe throttling of 2 messages/sec to prevent spam rate limits.</li>
              </ul>
            </div>

            {/* Live Progress Bar */}
            {isBulkSending && (
              <div className="space-y-2 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <div className="flex justify-between text-xs font-bold text-emerald-950">
                  <span>Dispatching WhatsApp Messages...</span>
                  <span>{bulkSentCount} of {filteredStudents.length} Sent ({bulkDispatchProgress}%)</span>
                </div>
                <div className="w-full h-3 bg-emerald-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${bulkDispatchProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Completion state */}
            {!isBulkSending && bulkSentCount > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-100/60 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong>Broadcast Completed!</strong> All {bulkSentCount} parent progress reports have been
                  dispatched via WhatsApp API.
                </div>
              </div>
            )}

            {/* Recipient Roster Preview */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-zinc-100">
              {filteredStudents.map((std, i) => (
                <div key={std.id} className="flex items-center justify-between text-xs py-1.5">
                  <div>
                    <span className="font-semibold text-zinc-800">{std.name}</span>
                    <span className="text-[10px] text-zinc-400 ml-1.5">({std.guardianName || 'Guardian'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-zinc-500">{std.guardianPhone || '+91 98...'}</span>
                    {bulkSentCount > i ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Delivered ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-zinc-400">Ready</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setIsBulkModalOpen(false)}
                disabled={isBulkSending}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-50 disabled:opacity-50"
              >
                Close
              </button>
              <button
                onClick={handleStartBulkDispatch}
                disabled={isBulkSending}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isBulkSending ? 'Broadcasting...' : `Broadcast to ${filteredStudents.length} Guardians`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
