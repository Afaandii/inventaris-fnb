import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import type { ThemeMode } from '@/redux/slices/themeSlice';

export const ThemeToggle: React.FC = () => {
  const { mode, changeTheme } = useTheme();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    {
      mode: 'light',
      label: t.theme.light,
      icon: <Sun className="w-4 h-4 text-amber-500" />,
    },
    {
      mode: 'dark',
      label: t.theme.dark,
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
    },
    {
      mode: 'system',
      label: t.theme.system,
      icon: <Monitor className="w-4 h-4 text-slate-400" />,
    },
  ];

  const currentIcon =
    mode === 'dark' ? (
      <Moon className="w-4 h-4 text-indigo-400 transition-transform duration-300 hover:rotate-12" />
    ) : mode === 'light' ? (
      <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 hover:rotate-45" />
    ) : (
      <Monitor className="w-4 h-4 text-muted-foreground transition-transform duration-300" />
    );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t.theme.theme}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-border/70 bg-card hover:bg-accent text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring/40"
      >
        {currentIcon}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-38 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            {t.theme.theme}
          </div>
          {options.map((item) => {
            const isSelected = mode === item.mode;
            return (
              <button
                key={item.mode}
                type="button"
                onClick={() => {
                  changeTheme(item.mode);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md mx-auto transition-colors ${
                  isSelected
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
