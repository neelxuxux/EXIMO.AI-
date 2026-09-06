import React, { useState, useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Users,
  GraduationCap,
  UserCheck,
  Wrench,
  Sparkles,
  Filter,
  Search,
  ArrowUpRight,
  RefreshCw,
  Plus,
  BookOpen,
  Send,
  X,
  MapPin,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { CampusBranch, AdminIssue } from '../types';

interface AdminOverviewViewProps {
  branches: CampusBranch[];
  issues: AdminIssue[];
  onResolveIssue: (issueId: string, actionName: string) => void;
  onAddIssue: (issue: AdminIssue) => void;
  onSwitchCenterScope: (branch: CampusBranch) => void;
  onOpenTestCreator: () => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  branches,
  issues,
  onResolveIssue,
  onAddIssue,
  onSwitchCenterScope,
  onOpenTestCreator,
}) => {
  // Filters & State
  const [centerFilter, setCenterFilter] = useState<'all' | 'doing_good' | 'doing_not_good'>('all');
  const [issueLevelFilter, setIssueLevelFilter] = useState<'all' | 'faculty' | 'student' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<CampusBranch | null>(null);
  const [resolvingIssueId, setResolvingIssueId] = useState<string | null>(null);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // New Issue Modal State
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [newIssueForm, setNewIssueForm] = useState({
    centerId: branches[0]?.id || '',
    level: 'faculty' as 'faculty' | 'student',
    severity: 'critical' as 'critical' | 'warning' | 'moderate',
    title: '',
    description: '',
    affectedCount: 1,
    suggestedFix: '',
    action1: 'Notify Center Head with 24h SLA',
    action2: 'Deploy Central Resource Pool',
  });

  // AI Network Diagnosis State
  const [isAiAuditing, setIsAiAuditing] = useState(false);
  const [aiAuditReport, setAiAuditReport] = useState<string | null>(null);

  // Calculated Stats
  const totalCenters = branches.length;
  const goodCenters = useMemo(() => branches.filter((b) => b.status === 'doing_good'), [branches]);
  const notGoodCenters = useMemo(() => branches.filter((b) => b.status === 'doing_not_good'), [branches]);
  const totalStudents = useMemo(() => branches.reduce((acc, b) => acc + b.totalStudents, 0), [branches]);
  const totalFaculty = useMemo(() => branches.reduce((acc, b) => acc + b.facultyCount, 0), [branches]);
  const networkAvgScore = useMemo(
    () => Math.round(branches.reduce((acc, b) => acc + b.overallAvgScore, 0) / (branches.length || 1)),
    [branches]
  );
  const networkAvgAttendance = useMemo(
    () => (branches.reduce((acc, b) => acc + b.attendanceRate, 0) / (branches.length || 1)).toFixed(1),
    [branches]
  );

  const openIssues = useMemo(() => issues.filter((i) => i.status === 'open'), [issues]);
  const resolvedIssues = useMemo(() => issues.filter((i) => i.status === 'resolved'), [issues]);

  const facultyIssues = useMemo(() => openIssues.filter((i) => i.level === 'faculty'), [openIssues]);
  const studentIssues = useMemo(() => openIssues.filter((i) => i.level === 'student'), [openIssues]);

  // Filtered Centers
  const filteredCenters = useMemo(() => {
    return branches.filter((branch) => {
      const matchesSearch =
        branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.centerHead.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (centerFilter === 'doing_good') return branch.status === 'doing_good';
      if (centerFilter === 'doing_not_good') return branch.status === 'doing_not_good';
      return true;
    });
  }, [branches, centerFilter, searchQuery]);

  // Filtered Issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (issueLevelFilter === 'faculty') return issue.level === 'faculty';
      if (issueLevelFilter === 'student') return issue.level === 'student';
      if (issueLevelFilter === 'critical') return issue.severity === 'critical';
      return true;
    });
  }, [issues, issueLevelFilter]);

  // Handle Quick Fix
  const handleTriggerFix = (issue: AdminIssue, actionName: string) => {
    onResolveIssue(issue.id, actionName);
    setActionSuccessToast(`Fixed: "${actionName}" executed successfully for ${issue.centerName}`);
    setTimeout(() => setActionSuccessToast(null), 5000);
    setResolvingIssueId(null);
  };

  // Handle Create Issue
  const handleCreateNewIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueForm.title.trim()) return;

    const center = branches.find((b) => b.id === newIssueForm.centerId) || branches[0];
    const created: AdminIssue = {
      id: `issue_${Date.now()}`,
      centerId: center.id,
      centerName: center.name,
      level: newIssueForm.level,
      severity: newIssueForm.severity,
      title: newIssueForm.title,
      description: newIssueForm.description || 'Reported via Enterprise Admin Console.',
      affectedCount: Number(newIssueForm.affectedCount) || 1,
      reportedDate: new Date().toISOString().split('T')[0],
      status: 'open',
      suggestedFix: newIssueForm.suggestedFix || 'Review academic logs and reassign resources.',
      availableActions: [newIssueForm.action1, newIssueForm.action2, 'Direct Center Lead Intervention'],
    };

    onAddIssue(created);
    setIsNewIssueModalOpen(false);
    setActionSuccessToast(`New ${created.level} incident logged for ${center.name}. Ready for admin action.`);
    setTimeout(() => setActionSuccessToast(null), 5000);
    setNewIssueForm({
      centerId: branches[0]?.id || '',
      level: 'faculty',
      severity: 'critical',
      title: '',
      description: '',
      affectedCount: 1,
      suggestedFix: '',
      action1: 'Notify Center Head with 24h SLA',
      action2: 'Deploy Central Resource Pool',
    });
  };

  // Run AI Network Diagnosis
  const handleRunAiNetworkAudit = () => {
    setIsAiAuditing(true);
    setTimeout(() => {
      setIsAiAuditing(false);
      setAiAuditReport(
        `Executive Audit Analysis: ${goodCenters.length} centers (Kota, Hyderabad, Delhi, Pune, Bengaluru, Mumbai) maintain high health (>84%) driven by regular weekly CBT tests and under 48h rubric turnaround. Conversely, ${notGoodCenters.length} centers (Patna, Lucknow, Kolkata, Jaipur) require intervention: 1) Patna & Lucknow suffer from faculty bottleneck (evaluation backlog & organic chemistry vacancy); 2) Kolkata & Jaipur suffer from student-level disengagement (physics accuracy <36% and -18% attendance). Recommendation: Dispatch Kota faculty masterclasses to Lucknow/Patna, and push automated AI diagnostic remedial packages to Kolkata/Jaipur.`
      );
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {actionSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{actionSuccessToast}</span>
          <button onClick={() => setActionSuccessToast(null)} className="text-zinc-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header: Enterprise Multi-Center Network */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30 leading-none">
            <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Multi-Center Enterprise Network • 10 Coaching Centers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Central Executive Administration
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Real-time oversight across all 10 coaching centers. Monitor performing vs at-risk branches, diagnose academic bottlenecks, and intervene directly to resolve faculty and student level issues.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setIsNewIssueModalOpen(true)}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer leading-none"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Log Center Issue</span>
          </button>
          <button
            onClick={handleRunAiNetworkAudit}
            disabled={isAiAuditing}
            className="h-10 px-4 bg-white/10 hover:bg-white/15 text-zinc-100 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/10 transition-all cursor-pointer leading-none"
          >
            <Sparkles className={`w-4 h-4 text-indigo-400 shrink-0 ${isAiAuditing ? 'animate-spin' : ''}`} />
            <span>{isAiAuditing ? 'Auditing 10 Centers...' : 'AI Network Health Audit'}</span>
          </button>
        </div>
      </div>

      {/* AI Network Audit Result Banner */}
      {aiAuditReport && (
        <div className="bg-indigo-950/40 border border-indigo-800/80 rounded-2xl p-5 text-indigo-200 text-xs leading-relaxed relative flex items-start gap-3.5 shadow-sm">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="font-bold text-indigo-100 flex items-center gap-2 text-sm">
              <span>Gemini AI 10-Center Diagnostic Synthesis</span>
              <span className="text-[10px] bg-indigo-900/80 text-indigo-300 px-2 py-0.5 rounded font-mono">Real-time</span>
            </div>
            <p className="text-zinc-300">{aiAuditReport}</p>
          </div>
          <button
            onClick={() => setAiAuditReport(null)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Performance Bar: Doing Good vs Doing Not Good */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Network Centers */}
        <div className="bg-card p-5 rounded-2xl border border-border-primary shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-muted-text uppercase tracking-wider leading-none">
              Total Centers
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-black text-foreground tracking-tight leading-tight">
              {totalCenters}
            </div>
          </div>
          <div className="pt-2 border-t border-border-primary/60 text-[11px] text-muted-text leading-snug">
            {totalStudents.toLocaleString()} Students • {totalFaculty} Faculty
          </div>
        </div>

        {/* Centers Doing Good */}
        <div className="bg-card p-5 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-2xs flex flex-col justify-between transition-colors bg-emerald-50/20 dark:bg-emerald-950/10">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider leading-none">
              Doing Good
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-tight">
              {goodCenters.length}
            </div>
          </div>
          <div className="pt-2 border-t border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium leading-snug">
            {Math.round((goodCenters.length / totalCenters) * 100)}% of network on target
          </div>
        </div>

        {/* Centers Doing Not Good */}
        <div className="bg-card p-5 rounded-2xl border border-rose-500/30 dark:border-rose-500/20 shadow-2xs flex flex-col justify-between transition-colors bg-rose-50/20 dark:bg-rose-950/10">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider leading-none">
              Needs Attention
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight leading-tight">
              {notGoodCenters.length}
            </div>
          </div>
          <div className="pt-2 border-t border-rose-500/20 text-[11px] text-rose-700 dark:text-rose-300 font-medium leading-snug">
            4 centers with active lag/bottlenecks
          </div>
        </div>

        {/* Open Faculty Level Issues */}
        <div className="bg-card p-5 rounded-2xl border border-border-primary shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-muted-text uppercase tracking-wider leading-none">
              Faculty Issues
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-black text-foreground tracking-tight leading-tight">
              {facultyIssues.length}
            </div>
          </div>
          <div className="pt-2 border-t border-border-primary/60 text-[11px] text-muted-text leading-snug">
            Evaluations, syllabus & faculty vacancies
          </div>
        </div>

        {/* Open Student Level Issues */}
        <div className="bg-card p-5 rounded-2xl border border-border-primary shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-muted-text uppercase tracking-wider leading-none">
              Student Issues
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-black text-foreground tracking-tight leading-tight">
              {studentIssues.length}
            </div>
          </div>
          <div className="pt-2 border-t border-border-primary/60 text-[11px] text-muted-text leading-snug">
            Score dips, attendance, doubts & CBT flags
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: COACHING CENTERS PERFORMANCE DIRECTORY (10 CENTERS) */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Coaching Centers Network Directory ({branches.length} Total)</span>
            </h2>
            <p className="text-xs text-muted-text mt-0.5">
              Comparative assessment health across all regional campuses: identify top performers vs centers requiring central intervention.
            </p>
          </div>

          {/* Filter Chips & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search city, center head..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 pr-3 bg-card border border-border-primary rounded-lg text-xs text-foreground placeholder-muted-text focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all w-44 sm:w-56"
              />
            </div>

            <div className="inline-flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-border-primary text-xs">
              <button
                onClick={() => setCenterFilter('all')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  centerFilter === 'all'
                    ? 'bg-card text-foreground font-semibold shadow-xs'
                    : 'text-muted-text hover:text-foreground'
                }`}
              >
                All (10)
              </button>
              <button
                onClick={() => setCenterFilter('doing_good')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  centerFilter === 'doing_good'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-muted-text hover:text-foreground'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Doing Good ({goodCenters.length})</span>
              </button>
              <button
                onClick={() => setCenterFilter('doing_not_good')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  centerFilter === 'doing_not_good'
                    ? 'bg-rose-600 text-white font-semibold shadow-xs'
                    : 'text-muted-text hover:text-foreground'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Needs Attention ({notGoodCenters.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Centers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCenters.map((branch) => {
            const isGood = branch.status === 'doing_good';
            const centerIssues = issues.filter((i) => i.centerId === branch.id && i.status === 'open');

            return (
              <div
                key={branch.id}
                className={`bg-card rounded-2xl border transition-all hover:shadow-md p-5 flex flex-col justify-between relative overflow-hidden ${
                  isGood
                    ? 'border-emerald-500/30 hover:border-emerald-500/60 dark:border-emerald-500/20'
                    : 'border-rose-500/40 hover:border-rose-500/70 dark:border-rose-500/30 bg-rose-50/10 dark:bg-rose-950/10'
                }`}
              >
                {/* Header Row */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-border-primary">
                          {branch.code}
                        </span>
                        <span className="text-xs text-muted-text flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          {branch.city}, {branch.state}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground tracking-tight mt-1">
                        {branch.name}
                      </h3>
                      <p className="text-[11px] text-muted-text mt-0.5 line-clamp-1">
                        Head: {branch.centerHead}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isGood ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Doing Good</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[11px] font-bold border border-rose-300 dark:border-rose-800 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          <span>Needs Attention</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Reason Callout */}
                  <div
                    className={`text-[11px] p-2.5 rounded-xl border mt-3 mb-4 leading-relaxed ${
                      isGood
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300'
                        : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 font-medium'
                    }`}
                  >
                    <strong>{isGood ? 'Performance Note:' : 'Alert Cause:'}</strong> {branch.statusReason}
                  </div>

                  {/* Key Center Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-border-primary/70">
                    <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                      <span className="text-[10px] text-muted-text block uppercase font-bold">Avg Score</span>
                      <span className="text-sm font-black text-foreground">{branch.overallAvgScore}</span>
                      <span className="text-[10px] text-muted-text block">/ 300</span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                      <span className="text-[10px] text-muted-text block uppercase font-bold">Cutoff Rate</span>
                      <span className={`text-sm font-black ${isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {branch.cutoffClearanceRate}%
                      </span>
                      <span className="text-[10px] text-muted-text block">Students</span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                      <span className="text-[10px] text-muted-text block uppercase font-bold">Syllabus</span>
                      <span className="text-sm font-black text-foreground">{branch.syllabusCompletion}%</span>
                      <span className="text-[10px] text-muted-text block">Completed</span>
                    </div>
                  </div>

                  {/* Operational Details */}
                  <div className="flex items-center justify-between text-xs text-muted-text pt-3">
                    <span>
                      <strong className="text-foreground">{branch.totalStudents}</strong> Students • <strong className="text-foreground">{branch.facultyCount}</strong> Faculty
                    </span>
                    <span>
                      Attendance: <strong className="text-foreground">{branch.attendanceRate}%</strong>
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 mt-3 border-t border-border-primary/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedCenter(branch)}
                    className="h-8 px-3 rounded-lg border border-border-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <span>Inspect Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSwitchCenterScope(branch)}
                    className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                    title="Switch active console context to this campus"
                  >
                    <span>Manage Center</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: FACULTY & STUDENT LEVEL PROBLEM SOLVER HUB */}
      {/* ======================================================== */}
      <div className="space-y-4 pt-4 border-t border-border-primary">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full text-xs font-bold border border-rose-500/20 mb-1">
              <Wrench className="w-3.5 h-3.5" />
              <span>Executive Problem Solver</span>
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Faculty-Level & Student-Level Problem Resolution
            </h2>
            <p className="text-xs text-muted-text mt-0.5">
              If any problem arises in the faculty level or the student level, the admin can fix it directly from this console.
            </p>
          </div>

          {/* Level Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-border-primary text-xs">
              <button
                onClick={() => setIssueLevelFilter('all')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  issueLevelFilter === 'all'
                    ? 'bg-card text-foreground font-semibold shadow-xs'
                    : 'text-muted-text hover:text-foreground'
                }`}
              >
                All Issues ({issues.length})
              </button>
              <button
                onClick={() => setIssueLevelFilter('faculty')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  issueLevelFilter === 'faculty'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-muted-text hover:text-foreground'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Faculty Level ({facultyIssues.length})</span>
              </button>
              <button
                onClick={() => setIssueLevelFilter('student')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  issueLevelFilter === 'student'
                    ? 'bg-amber-600 text-white font-semibold shadow-xs'
                    : 'text-muted-text hover:text-foreground'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Level ({studentIssues.length})</span>
              </button>
              <button
                onClick={() => setIssueLevelFilter('critical')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  issueLevelFilter === 'critical'
                    ? 'bg-rose-600 text-white font-semibold shadow-xs'
                    : 'text-muted-text hover:text-foreground'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Critical Only</span>
              </button>
            </div>
          </div>
        </div>

        {/* Problems Table / Action Cards */}
        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border-primary p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-foreground">No active issues under this category</p>
              <p className="text-xs text-muted-text">All coaching centers are running smoothly in this tier.</p>
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const isFaculty = issue.level === 'faculty';
              const isOpen = issue.status === 'open';

              return (
                <div
                  key={issue.id}
                  className={`bg-card rounded-2xl border p-5 transition-all ${
                    isOpen
                      ? issue.severity === 'critical'
                        ? 'border-rose-500/40 dark:border-rose-500/30 shadow-xs'
                        : 'border-amber-500/40 dark:border-amber-500/30'
                      : 'border-border-primary opacity-80 bg-zinc-50/50 dark:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Problem Description & Details */}
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Level Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border leading-none ${
                            isFaculty
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {isFaculty ? <UserCheck className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                          <span>{isFaculty ? 'Faculty Level Problem' : 'Student Level Problem'}</span>
                        </span>

                        {/* Center Badge */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-border-primary leading-none">
                          <Building2 className="w-3 h-3 text-zinc-500" />
                          <span>{issue.centerName}</span>
                        </span>

                        {/* Severity Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider leading-none ${
                            issue.severity === 'critical'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {issue.severity}
                        </span>

                        {/* Status */}
                        {isOpen ? (
                          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                            Action Required
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Resolved ({issue.actionTaken})
                          </span>
                        )}

                        <span className="text-[11px] text-muted-text">
                          Reported: {issue.reportedDate} • Impact: <strong>{issue.affectedCount}</strong> {isFaculty ? 'staff/batch' : 'students'}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-bold text-foreground">{issue.title}</h3>
                        <p className="text-xs text-muted-text leading-relaxed mt-0.5">{issue.description}</p>
                      </div>

                      {/* AI Suggested Fix */}
                      <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-border-primary text-xs flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-foreground">Recommended Admin Fix: </span>
                          <span className="text-muted-text">{issue.suggestedFix}</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Action Buttons (Fix Problem Now) */}
                    <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2 min-w-[220px]">
                      {isOpen ? (
                        <>
                          <span className="text-[11px] font-bold text-muted-text uppercase tracking-wider">
                            Execute Admin Fix:
                          </span>
                          {issue.availableActions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleTriggerFix(issue, action)}
                              className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer shadow-xs ${
                                idx === 0
                                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground border border-border-primary'
                              }`}
                            >
                              <span className="truncate">{action}</span>
                              <Wrench className="w-3.5 h-3.5 shrink-0" />
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
                          <div className="font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Resolution Executed
                          </div>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                            Action: {issue.actionTaken}
                          </p>
                          <button
                            onClick={() => onResolveIssue(issue.id, 'Reopened for inspection')}
                            className="mt-2 text-[11px] font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline block"
                          >
                            Re-open Investigation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: LOG NEW CENTER ISSUE / ESCALATION */}
      {/* ======================================================== */}
      {isNewIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border-primary max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border-primary pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Log Center Problem / Incident</h3>
                  <p className="text-xs text-muted-text">Directly assign faculty or student issues for admin resolution</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewIssueModalOpen(false)}
                className="text-muted-text hover:text-foreground p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewIssue} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">Target Coaching Center</label>
                <select
                  value={newIssueForm.centerId}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, centerId: e.target.value })}
                  className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-800 border border-border-primary rounded-lg text-foreground font-medium"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city}) — {b.status === 'doing_good' ? 'Doing Good' : 'Needs Attention'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Problem Level</label>
                  <select
                    value={newIssueForm.level}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, level: e.target.value as 'faculty' | 'student' })}
                    className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-800 border border-border-primary rounded-lg text-foreground font-medium"
                  >
                    <option value="faculty">Faculty Level (Vacancies, Grading, Syllabus)</option>
                    <option value="student">Student Level (Score Dip, Attendance, Doubts)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Severity</label>
                  <select
                    value={newIssueForm.severity}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, severity: e.target.value as 'critical' | 'warning' | 'moderate' })}
                    className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-800 border border-border-primary rounded-lg text-foreground font-medium"
                  >
                    <option value="critical">Critical (Immediate SLA)</option>
                    <option value="warning">Warning (Requires Monitoring)</option>
                    <option value="moderate">Moderate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Incident Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 20 students failing negative cutoff in Chemistry"
                  value={newIssueForm.title}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, title: e.target.value })}
                  className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-800 border border-border-primary rounded-lg text-foreground"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Incident Description & Context</label>
                <textarea
                  rows={2}
                  placeholder="Provide details of batch, student group, or faculty bottleneck..."
                  value={newIssueForm.description}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, description: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-border-primary rounded-lg text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Affected Count (People/Batches)</label>
                  <input
                    type="number"
                    min="1"
                    value={newIssueForm.affectedCount}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, affectedCount: parseInt(e.target.value) || 1 })}
                    className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-800 border border-border-primary rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">Suggested Admin Fix</label>
                  <input
                    type="text"
                    placeholder="e.g. Trigger AI remedial worksheets"
                    value={newIssueForm.suggestedFix}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, suggestedFix: e.target.value })}
                    className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-800 border border-border-primary rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border-primary flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewIssueModalOpen(false)}
                  className="h-9 px-4 rounded-lg border border-border-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Save & Publish to Console
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DRAWER / MODAL: CENTER DEEP DIVE INSPECTION */}
      {/* ======================================================== */}
      {selectedCenter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border-primary max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border-primary pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-border-primary">
                    {selectedCenter.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedCenter.status === 'doing_good'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {selectedCenter.status === 'doing_good' ? 'Doing Good (Healthy)' : 'Doing Not Good (Needs Attention)'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-foreground">{selectedCenter.name}</h2>
                <p className="text-xs text-muted-text mt-0.5">
                  {selectedCenter.city}, {selectedCenter.state} • Center Head: <strong>{selectedCenter.centerHead}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedCenter(null)}
                className="text-muted-text hover:text-foreground p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subject Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Subject Performance Averages (Score / 100)
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-border-primary">
                  <span className="text-xs text-muted-text block font-semibold">Physics</span>
                  <span className="text-xl font-black text-foreground">
                    {selectedCenter.subjectAverages.physics}%
                  </span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-border-primary">
                  <span className="text-xs text-muted-text block font-semibold">Chemistry</span>
                  <span className="text-xl font-black text-foreground">
                    {selectedCenter.subjectAverages.chemistry}%
                  </span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-border-primary">
                  <span className="text-xs text-muted-text block font-semibold">Mathematics</span>
                  <span className="text-xl font-black text-foreground">
                    {selectedCenter.subjectAverages.mathematics}%
                  </span>
                </div>
              </div>
            </div>

            {/* Student Score Distribution */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Student Cohort Distribution
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300">
                  <span className="block font-bold">{selectedCenter.scoreDistribution.topTier}%</span>
                  <span className="text-[10px] text-muted-text">Top Tier (&gt;80%)</span>
                </div>
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300">
                  <span className="block font-bold">{selectedCenter.scoreDistribution.proficient}%</span>
                  <span className="text-[10px] text-muted-text">Proficient (60-80%)</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300">
                  <span className="block font-bold">{selectedCenter.scoreDistribution.average}%</span>
                  <span className="text-[10px] text-muted-text">Average (40-60%)</span>
                </div>
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300">
                  <span className="block font-bold">{selectedCenter.scoreDistribution.needSupport}%</span>
                  <span className="text-[10px] text-muted-text">Needs Support (&lt;40%)</span>
                </div>
              </div>
            </div>

            {/* Operational Metrics */}
            <div className="grid grid-cols-3 gap-3 py-2 text-xs border-y border-border-primary">
              <div>
                <span className="text-muted-text block">Faculty Health:</span>
                <span className="font-bold text-foreground">{selectedCenter.facultyHealthScore}%</span>
              </div>
              <div>
                <span className="text-muted-text block">Student Satisfaction:</span>
                <span className="font-bold text-foreground">{selectedCenter.studentSatisfaction}%</span>
              </div>
              <div>
                <span className="text-muted-text block">Syllabus Completion:</span>
                <span className="font-bold text-foreground">{selectedCenter.syllabusCompletion}%</span>
              </div>
            </div>

            {/* Active Problems for this Center */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Logged Problems for {selectedCenter.name}
              </h4>
              {issues.filter((i) => i.centerId === selectedCenter.id).length === 0 ? (
                <p className="text-xs text-muted-text italic">No logged issues for this center.</p>
              ) : (
                <div className="space-y-2">
                  {issues
                    .filter((i) => i.centerId === selectedCenter.id)
                    .map((issue) => (
                      <div key={issue.id} className="p-3 rounded-xl border border-border-primary text-xs flex items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                              {issue.level}
                            </span>
                            <span>{issue.title}</span>
                          </div>
                          <p className="text-[11px] text-muted-text mt-0.5">{issue.description}</p>
                        </div>
                        {issue.status === 'open' ? (
                          <button
                            onClick={() => handleTriggerFix(issue, issue.availableActions[0])}
                            className="h-7 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shrink-0"
                          >
                            Fix Now
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-600">Resolved</span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-border-primary flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedCenter(null)}
                className="h-9 px-4 rounded-lg border border-border-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold"
              >
                Close
              </button>

              <button
                onClick={() => {
                  onSwitchCenterScope(selectedCenter);
                  setSelectedCenter(null);
                }}
                className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <span>Switch to {selectedCenter.name} Console</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
