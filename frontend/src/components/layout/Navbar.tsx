import React, { useState, useEffect } from 'react';
import { Search, PanelLeft, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { ProfileDropdown } from '@/components/common/ProfileDropdown';
import { SearchCommandModal } from '@/components/common/SearchCommandModal';
import { useTranslation } from '@/hooks/useTranslation';

interface NavbarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  setMobileOpen: (value: boolean) => void;
  onNavigate?: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  collapsed,
  setCollapsed,
  setMobileOpen,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global keyboard shortcut for Command Palette (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-3 sm:px-4 md:px-8 border-b border-border/70 bg-background/80 backdrop-blur-md transition-all duration-300 max-w-full overflow-hidden">
        {/* Left side: Sidebar Toggle & Global Search */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0 max-w-md mr-2">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex lg:hidden items-center justify-center w-9 h-9 rounded-lg border border-border/70 bg-card text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Desktop Sidebar Toggle icon (Shadcn style: PanelLeft) */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg border border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title={collapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Mobile Compact Search Button (Icon only) */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex sm:hidden items-center justify-center w-9 h-9 rounded-lg border border-border/70 bg-card text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Cari Halaman"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Tablet & Desktop Search Trigger Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex relative items-center w-full max-w-sm h-9 pl-9 pr-12 rounded-lg border border-border/70 bg-card/60 hover:bg-card focus:bg-card text-xs text-muted-foreground transition-all text-left group"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="truncate">{t.common.searchPlaceholder}</span>
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border/60 bg-muted/60 text-[10px] font-mono text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right side: Language, Theme, Profile Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Switcher */}
          <LanguageToggle />

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Profile Dropdown with Profile, Settings, Sign Out (Shadcn style) */}
          <div className="pl-1 sm:pl-2 border-l border-border/60">
            <ProfileDropdown
              userName="Chef Renatta"
              userEmail="renatta@restovibe.com"
              role="Head of Inventory"
            />
          </div>
        </div>
      </header>

      {/* Global Command Palette Search Modal */}
      <SearchCommandModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};
