import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'button' | 'segmented' | 'menu';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
  variant = 'button'
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
            theme === 'light'
              ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
          title="Light Mode"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          {showLabel && <span>Light</span>}
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
            theme === 'dark'
              ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
          title="Dark Mode"
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          {showLabel && <span>Dark</span>}
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
            theme === 'system'
              ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
          title="System Preference"
        >
          <Monitor className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          {showLabel && <span>System</span>}
        </button>
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={toggleTheme}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        title={`Current: ${resolvedTheme === 'dark' ? 'Dark' : 'Light'} Mode (Right-click or hold for options)`}
        aria-label="Toggle light/dark theme"
        className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white/90 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all shadow-2xs group focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-indigo-400 transition-transform group-hover:-rotate-12 duration-200" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform group-hover:rotate-45 duration-200" />
        )}
      </button>

      {/* Tiny trigger for menu */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-[9px] flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors shadow-2xs"
        title="Select theme preference"
        aria-label="Select theme options"
      >
        ▾
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 py-1 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
            Theme
          </div>

          <button
            type="button"
            onClick={() => {
              setTheme('light');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors ${
              theme === 'light' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </div>
            {theme === 'light' && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors ${
              theme === 'dark' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dark</span>
            </div>
            {theme === 'dark' && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme('system');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors ${
              theme === 'system' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5 text-zinc-400" />
              <span>System</span>
            </div>
            {theme === 'system' && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
