import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AdminOverviewView } from './components/AdminOverviewView';
import { QuestionStudioView } from './components/QuestionStudioView';
import { PaperGeneratorView } from './components/PaperGeneratorView';
import { CbtExamView } from './components/CbtExamView';
import { EvaluationView } from './components/EvaluationView';
import { AnalyticsView } from './components/AnalyticsView';
import { BatchesView } from './components/BatchesView';
import { StudentDashboardView } from './components/StudentDashboardView';
import { ParentDispatchView } from './components/ParentDispatchView';
import { BranchBenchmarkingView } from './components/BranchBenchmarkingView';
import { OmrScannerView } from './components/OmrScannerView';
import {
  INITIAL_QUESTIONS,
  INITIAL_BATCHES,
  INITIAL_STUDENTS,
  INITIAL_TESTS,
  INITIAL_ATTEMPT_RESULTS,
  INITIAL_BRANCHES,
  INITIAL_ADMIN_ISSUES
} from './mockData';
import {
  Question,
  TestBlueprint,
  Batch,
  Student,
  TestAttemptResult,
  InstituteSettings,
  CampusBranch,
  AdminIssue
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Core Institute State
  const [settings, setSettings] = useState<InstituteSettings>({
    instituteName: 'Apex Academy of Competitive Sciences',
    branch: 'Kota Flagship Campus (Rajasthan)',
    tagline: 'Premier Institute for IIT-JEE, NEET & CAT Preparation',
    themeColor: '#4f46e5',
    watermarkingEnabled: true,
    currentRole: 'admin',
    currentStudentId: 'std_01',
  });

  const [questionBank, setQuestionBank] = useState<Question[]>(() => {
    const saved = localStorage.getItem('eximo_questions');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_QUESTIONS;
  });

  const [testPapers, setTestPapers] = useState<TestBlueprint[]>(() => {
    const saved = localStorage.getItem('eximo_tests');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_TESTS;
  });

  const [batches, setBatches] = useState<Batch[]>(() => {
    const saved = localStorage.getItem('eximo_batches');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_BATCHES;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('eximo_students');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_STUDENTS;
  });

  const [attemptResults, setAttemptResults] = useState<TestAttemptResult[]>(() => {
    const saved = localStorage.getItem('eximo_attempts');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_ATTEMPT_RESULTS;
  });

  const [branches, setBranches] = useState<CampusBranch[]>(() => {
    const saved = localStorage.getItem('eximo_branches');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_BRANCHES;
  });

  const [adminIssues, setAdminIssues] = useState<AdminIssue[]>(() => {
    const saved = localStorage.getItem('eximo_admin_issues');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_ADMIN_ISSUES;
  });

  // Active Paper in CBT Simulator
  const [activeCbtPaper, setActiveCbtPaper] = useState<TestBlueprint>(testPapers[0] || INITIAL_TESTS[0]);

  // Persist state to local storage
  useEffect(() => {
    localStorage.setItem('eximo_questions', JSON.stringify(questionBank));
  }, [questionBank]);

  useEffect(() => {
    localStorage.setItem('eximo_tests', JSON.stringify(testPapers));
  }, [testPapers]);

  useEffect(() => {
    localStorage.setItem('eximo_batches', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('eximo_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('eximo_attempts', JSON.stringify(attemptResults));
  }, [attemptResults]);

  useEffect(() => {
    localStorage.setItem('eximo_branches', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('eximo_admin_issues', JSON.stringify(adminIssues));
  }, [adminIssues]);

  // Check health endpoint for API key status
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(Boolean(data.hasApiKey));
      })
      .catch(() => {
        setHasApiKey(false);
      });
  }, []);

  // Handlers
  const handleAddQuestion = (newQ: Question) => {
    setQuestionBank((prev) => [newQ, ...prev]);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestionBank((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSavePaper = (paper: TestBlueprint) => {
    setTestPapers((prev) => [paper, ...prev]);
  };

  const handleLaunchCbt = (paper: TestBlueprint) => {
    setActiveCbtPaper(paper);
    setActiveTab('cbt_engine');
  };

  const handleAddBatch = (batch: Batch) => {
    setBatches((prev) => [...prev, batch]);
  };

  const handleAddStudent = (student: Student) => {
    setStudents((prev) => [student, ...prev]);
    // update batch count
    setBatches((prev) =>
      prev.map((b) => (b.id === student.batchId ? { ...b, studentCount: b.studentCount + 1 } : b))
    );
  };

  const handleAttemptCompleted = (result: TestAttemptResult) => {
    setAttemptResults((prev) => [result, ...prev]);
  };

  const handleSelectStudentForAnalytics = (studentId: string) => {
    setActiveTab('analytics');
  };

  // Resolve Faculty or Student Issue
  const handleResolveIssue = (issueId: string, actionName: string) => {
    setAdminIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          const isReopen = issue.status === 'resolved';
          return {
            ...issue,
            status: isReopen ? 'open' : 'resolved',
            actionTaken: isReopen ? undefined : actionName,
            resolvedAt: isReopen ? undefined : new Date().toISOString().split('T')[0],
          };
        }
        return issue;
      })
    );

    // Update target center health score and open issues count
    const targetIssue = adminIssues.find((i) => i.id === issueId);
    if (targetIssue) {
      setBranches((prev) =>
        prev.map((b) => {
          if (b.id === targetIssue.centerId) {
            const isReopen = targetIssue.status === 'resolved';
            const newIssueCount = isReopen
              ? (b.openIssuesCount || 0) + 1
              : Math.max(0, (b.openIssuesCount || 1) - 1);
            const scoreDelta = isReopen ? -5 : 6;
            const newHealth = Math.min(98, Math.max(45, (b.healthScore || 60) + scoreDelta));
            const newStatus = newIssueCount === 0 && newHealth >= 70 ? 'doing_good' : b.status;
            return {
              ...b,
              openIssuesCount: newIssueCount,
              healthScore: newHealth,
              status: newStatus,
              statusReason: !isReopen && newIssueCount === 0
                ? 'Admin resolution applied. Academic health normalized.'
                : b.statusReason,
            };
          }
          return b;
        })
      );
    }
  };

  // Add New Center Issue
  const handleAddAdminIssue = (newIssue: AdminIssue) => {
    setAdminIssues((prev) => [newIssue, ...prev]);
    setBranches((prev) =>
      prev.map((b) => {
        if (b.id === newIssue.centerId) {
          return {
            ...b,
            openIssuesCount: (b.openIssuesCount || 0) + 1,
            healthScore: Math.max(40, (b.healthScore || 60) - 4),
          };
        }
        return b;
      })
    );
  };

  // Switch Admin Scope to a specific campus
  const handleSwitchCenterScope = (branch: CampusBranch) => {
    setSettings((s) => ({
      ...s,
      branch: `${branch.name} (${branch.city})`,
    }));
  };

  const currentStudent = students.find((s) => s.id === settings.currentStudentId) || students[0];

  // If user is inside CBT test view, render the dedicated CBT test console
  if (activeTab === 'cbt_engine') {
    return (
      <CbtExamView
        test={activeCbtPaper}
        candidateName={currentStudent.name}
        rollNumber={currentStudent.rollNumber}
        onExit={() => setActiveTab('dashboard')}
        onAttemptCompleted={handleAttemptCompleted}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        setSettings={setSettings}
        onLaunchDemoCbt={() => handleLaunchCbt(testPapers[0])}
        onCreatePaperQuick={() => setActiveTab('paper_generator')}
        hasApiKey={hasApiKey}
      />

      {/* Main Tab Views */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          settings.currentRole === 'student' ? (
            <StudentDashboardView
              student={currentStudent}
              students={students}
              onSelectStudent={(stdId) => setSettings((s) => ({ ...s, currentStudentId: stdId }))}
              testPapers={testPapers}
              attemptResults={attemptResults}
              batches={batches}
              onLaunchCbt={handleLaunchCbt}
              onNavigate={setActiveTab}
            />
          ) : settings.currentRole === 'admin' ? (
            <AdminOverviewView
              branches={branches}
              issues={adminIssues}
              onResolveIssue={handleResolveIssue}
              onAddIssue={handleAddAdminIssue}
              onSwitchCenterScope={handleSwitchCenterScope}
              onOpenTestCreator={() => setActiveTab('paper_generator')}
            />
          ) : (
            <DashboardView
              batches={batches}
              testPapers={testPapers}
              questionBank={questionBank}
              students={students}
              recentAttempts={attemptResults}
              onNavigate={setActiveTab}
              onLaunchCbt={handleLaunchCbt}
            />
          )
        )}

        {activeTab === 'question_studio' && (
          <QuestionStudioView
            questionBank={questionBank}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onAddToActivePaper={(q) => {
              setActiveTab('paper_generator');
            }}
          />
        )}

        {activeTab === 'paper_generator' && (
          <PaperGeneratorView
            testPapers={testPapers}
            batches={batches}
            questionBank={questionBank}
            onSavePaper={handleSavePaper}
            onLaunchCbt={handleLaunchCbt}
          />
        )}

        {activeTab === 'evaluation' && (
          <EvaluationView
            attemptResults={attemptResults}
            testPapers={testPapers}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            students={students}
            batches={batches}
          />
        )}

        {activeTab === 'batches' && (
          <BatchesView
            batches={batches}
            students={students}
            onAddBatch={handleAddBatch}
            onAddStudent={handleAddStudent}
            onSelectStudentForAnalytics={handleSelectStudentForAnalytics}
          />
        )}

        {activeTab === 'parent_reports' && (
          <ParentDispatchView
            students={students}
            batches={batches}
            attemptResults={attemptResults}
            settings={settings}
          />
        )}

        {activeTab === 'benchmarking' && (
          <BranchBenchmarkingView
            testPapers={testPapers}
            batches={batches}
            branches={branches}
          />
        )}

        {activeTab === 'omr_scanner' && (
          <OmrScannerView
            testPapers={testPapers}
            students={students}
            onIngestAttempt={handleAttemptCompleted}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="bg-card border-t border-border-primary py-6 px-4 text-center text-xs text-muted-text mt-auto transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong className="text-foreground">Eximo.ai</strong> — AI Assessment Infrastructure Platform for Coaching Institutes & Schools
          </span>
          <span className="font-mono text-[11px] text-dim-text">
            Powered by Gemini AI • Enterprise Grade NTA/CAT CBT Engine v3.4
          </span>
        </div>
      </footer>
    </div>
  );
}
