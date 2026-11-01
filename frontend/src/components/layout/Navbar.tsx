import React, { useState, useEffect } from 'react';
import { Search, PanelLeft } from 'lucide-react';
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
  const { t, currentLanguage } = useTranslation();
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
      <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-3 sm:px-4 md:px-8 border-b border-border/70 bg-background/80 backdrop-blur-md transition-all duration-300">
        {/* Left side: Sidebar Toggle & Global Search */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0 max-w-md mr-2">
          {/* Mobile sidebar toggle (PanelLeft icon like Shadcn Admin) */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex lg:hidden items-center justify-center w-9 h-9 rounded-lg border border-border/70 bg-card text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Buka menu navigasi"
          >
            <PanelLeft className="w-4 h-4" />
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

          {/* Search Trigger Button (Shadcn style: responsive & full width on all devices) */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-lg border border-border/70 bg-card/60 hover:bg-card text-xs text-muted-foreground transition-all text-left flex-1 min-w-0 max-w-sm"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-muted-foreground" />
            <span className="truncate sm:hidden">
              {currentLanguage === 'id' ? 'Cari...' : 'Search...'}
            </span>
            <span className="hidden sm:inline truncate">
              {t.common.searchPlaceholder}
            </span>
            <kbd className="ml-auto hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border/60 bg-muted/60 text-[10px] font-mono text-muted-foreground">
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
