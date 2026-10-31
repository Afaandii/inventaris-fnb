import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { SupportedLanguage } from '@/locales';

export const LanguageToggle: React.FC = () => {
  const { currentLanguage, changeLanguage, t } = useTranslation();
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

  const languages: { code: SupportedLanguage; label: string; flag: string }[] = [
    { code: 'id', label: t.language.id, flag: '🇮🇩' },
    { code: 'en', label: t.language.en, flag: '🇬🇧' },
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t.language.language}
        className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-border/70 bg-card hover:bg-accent text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring/40 text-xs font-medium"
      >
        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="uppercase font-semibold tracking-wider">{currentLanguage}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            {t.language.language}
          </div>
          {languages.map((item) => {
            const isSelected = currentLanguage === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  changeLanguage(item.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md mx-auto transition-colors ${
                  isSelected
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.flag}</span>
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
