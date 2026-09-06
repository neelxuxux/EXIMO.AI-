import React from 'react';
import {
  BrainCircuit,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Building2,
  PlayCircle,
  PlusCircle,
  BarChart3,
  FileText,
  Smartphone,
  GitCompare,
  ScanLine
} from 'lucide-react';
import { UserRole, InstituteSettings } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: InstituteSettings;
  setSettings: React.Dispatch<React.SetStateAction<InstituteSettings>>;
  onLaunchDemoCbt: () => void;
  onCreatePaperQuick: () => void;
  hasApiKey?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  setSettings,
  onLaunchDemoCbt,
  onCreatePaperQuick,
  hasApiKey = true,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
      {/* Top utility institute bar - symmetrical with max-w-7xl alignment */}
      <div className="bg-zinc-950 text-zinc-300 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 min-h-[40px]">
          {/* Symmetrical Left: Institute & Campus Identification */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-200 font-semibold tracking-wide text-xs leading-none shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{settings.instituteName}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 text-xs leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80"></span>
              <span>{settings.branch} Campus</span>
            </div>

            <div className="hidden md:inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 font-mono text-[11px] leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>CBT Engine v3.4 Active</span>
            </div>
          </div>

          {/* Symmetrical Right: Role View & Connected Status */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-xs hidden sm:inline leading-none font-medium">Role:</span>
              <div className="inline-flex items-center bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800 text-[11px] leading-none">
                {(['admin', 'faculty', 'student'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setSettings((s) => ({ ...s, currentRole: role }));
                      if (role === 'student') {
                        setActiveTab('dashboard');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all leading-none ${
                      settings.currentRole === role
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {role === 'student' ? 'Student Portal' : role}
                  </button>
                ))}
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-[11px] leading-none shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-zinc-300">
                {hasApiKey ? 'Gemini 2.5 Connected' : 'Eximo AI'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main SaaS navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white leading-snug">
                  Eximo<span className="text-indigo-600 dark:text-indigo-400">.ai</span>
                </span>
                <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider leading-none">
                  Institute OS
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal mt-0.5">Assessment Infrastructure</p>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {(settings.currentRole === 'student'
              ? [
                  { id: 'dashboard', label: 'Student Dashboard', icon: BarChart3 },
                  { id: 'cbt_engine', label: 'CBT Exam Simulator', icon: PlayCircle },
                  { id: 'analytics', label: 'Diagnostic & Remedial', icon: GraduationCap },
                ]
              : [
                  { id: 'dashboard', label: 'Overview', icon: BarChart3 },
                  { id: 'question_studio', label: 'AI Question Studio', icon: Sparkles },
                  { id: 'paper_generator', label: 'Paper Blueprint', icon: FileText },
                  { id: 'cbt_engine', label: 'CBT Simulator', icon: PlayCircle },
                  { id: 'evaluation', label: 'Evaluation & Rubrics', icon: ShieldCheck },
                  { id: 'analytics', label: 'Student Analytics', icon: GraduationCap },
                  { id: 'batches', label: 'Batches & Roster', icon: UserCheck },
                  { id: 'parent_reports', label: 'Parent Reports', icon: Smartphone },
                  { id: 'benchmarking', label: 'Branch Benchmark', icon: GitCompare },
                  { id: 'omr_scanner', label: 'OMR Scanner', icon: ScanLine },
                ]
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-9 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold leading-none transition-all ${
                    isActive
                      ? 'bg-zinc-900 dark:bg-indigo-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Action CTAs & Theme Switcher - Symmetrical heights (h-9) */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            <button
              onClick={onLaunchDemoCbt}
              className="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-500/25 transition-all"
              title="Experience actual student NTA/CAT CBT testing screen"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{settings.currentRole === 'student' ? 'Launch' : 'Launch CBT'}</span> Exam
            </button>

            {settings.currentRole !== 'student' && (
              <button
                onClick={onCreatePaperQuick}
                className="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all shadow-2xs"
              >
                <PlusCircle className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span className="hidden sm:inline">New</span> Paper
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="lg:hidden flex overflow-x-auto py-2 border-t border-zinc-100 dark:border-zinc-800 gap-1.5 scrollbar-none">
          {(settings.currentRole === 'student'
            ? [
                { id: 'dashboard', label: 'Student Dashboard' },
                { id: 'cbt_engine', label: 'CBT Simulator' },
                { id: 'analytics', label: 'Diagnostic' },
              ]
            : [
                { id: 'dashboard', label: 'Overview' },
                { id: 'question_studio', label: 'AI Questions' },
                { id: 'paper_generator', label: 'Blueprint' },
                { id: 'cbt_engine', label: 'CBT Simulator' },
                { id: 'evaluation', label: 'AI Evaluation' },
                { id: 'analytics', label: 'Remedial' },
                { id: 'batches', label: 'Batches' },
                { id: 'parent_reports', label: 'Parent Reports' },
                { id: 'benchmarking', label: 'Branch Benchmark' },
                { id: 'omr_scanner', label: 'OMR Scanner' },
              ]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-zinc-900 dark:bg-indigo-600 text-white'
                  : 'text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
