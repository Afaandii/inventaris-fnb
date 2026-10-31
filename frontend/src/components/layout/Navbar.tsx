import React from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  Store,
} from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { useTranslation } from '@/hooks/useTranslation';

interface NavbarProps {
  collapsed: boolean;
  setMobileOpen: (value: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ collapsed, setMobileOpen }) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-3 sm:px-4 md:px-8 border-b border-border/70 bg-background/80 backdrop-blur-md transition-all duration-300">
      {/* Left side: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex lg:hidden items-center justify-center w-9 h-9 rounded-lg border border-border/70 bg-card text-muted-foreground hover:text-foreground"
          aria-label="Buka menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Minimalist Search Bar */}
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t.common.searchPlaceholder}
            className="w-full h-9 pl-9 pr-12 rounded-lg border border-border/70 bg-card/60 hover:bg-card focus:bg-card text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border/60 bg-muted/60 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side: Quick Status, Notifications, Language, Theme, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
        {/* Branch / Outlet indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/60 bg-muted/30 text-[11px] font-medium text-muted-foreground">
          <Store className="w-3.5 h-3.5 text-amber-500" />
          <span>Resto Vibe Grand Mall</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
        </div>

        {/* Notifications */}
        <button
          type="button"
          title={t.common.notifications}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-border/70 bg-card hover:bg-accent text-foreground transition-colors duration-200"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
        </button>

        {/* Language Switcher */}
        <LanguageToggle />

        {/* Theme Switcher */}
        <ThemeToggle />

        {/* Profile Avatar Minimalist */}
        <div className="flex items-center gap-2 pl-2 border-l border-border/60">
          <button
            type="button"
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted/70 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-semibold leading-tight text-foreground">
                Chef Renatta
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                Head of Inventory
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
