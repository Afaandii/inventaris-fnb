import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface ProfileDropdownProps {
  userName?: string;
  userEmail?: string;
  role?: string;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  userName = 'Chef Renatta',
  userEmail = 'renatta@restovibe.com',
  role = 'Head of Inventory',
}) => {
  const { currentLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="User Profile Menu"
        className="flex items-center gap-2 p-1 rounded-xl border border-border/60 hover:bg-muted/70 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-ring/40"
      >
        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="hidden md:flex flex-col pr-1">
          <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[120px]">
            {userName}
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight truncate max-w-[120px]">
            {role}
          </span>
        </div>
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/80 bg-popover/98 text-popover-foreground shadow-2xl backdrop-blur-md p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="px-3 py-2">
            <p className="text-xs font-bold text-foreground leading-none">{userName}</p>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">{userEmail}</p>
          </div>

          <div className="h-px bg-border/60 my-1 -mx-1" />

          {/* Profile Menu Item */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              // Profile action placeholder
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{currentLanguage === 'id' ? 'Profil Saya' : 'Profile'}</span>
            </div>
            <kbd className="text-[10px] font-mono text-muted-foreground/80">⇧⌘P</kbd>
          </button>

          {/* Settings Menu Item */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              // Settings action placeholder
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{currentLanguage === 'id' ? 'Pengaturan' : 'Settings'}</span>
            </div>
            <kbd className="text-[10px] font-mono text-muted-foreground/80">⌘S</kbd>
          </button>

          <div className="h-px bg-border/60 my-1 -mx-1" />

          {/* Logout Menu Item */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              // Logout action placeholder
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'id' ? 'Keluar' : 'Sign out'}</span>
            </div>
            <kbd className="text-[10px] font-mono text-rose-500/80">⇧⌘Q</kbd>
          </button>
        </div>
      )}
    </div>
  );
};
