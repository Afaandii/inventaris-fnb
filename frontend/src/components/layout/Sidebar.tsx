import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Database,
  UtensilsCrossed,
  ChefHat,
  Truck,
  ReceiptText,
  CalendarCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  AlertCircle,
  X,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
  activePath?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  activePath = '/dashboard',
}) => {
  const { t } = useTranslation();

  const menuItems = [
    {
      id: 'dashboard',
      label: t.common.dashboard,
      icon: LayoutDashboard,
      path: '/dashboard',
      badge: null,
    },
    {
      id: 'inventory',
      label: t.common.inventory,
      icon: Boxes,
      path: '/inventory',
      badge: { text: '3 Kritis', variant: 'destructive' as const },
    },
    {
      id: 'masterData',
      label: t.common.masterData,
      icon: Database,
      path: '/master-data',
      badge: null,
    },
    {
      id: 'products',
      label: t.common.products,
      icon: UtensilsCrossed,
      path: '/products',
      badge: null,
    },
    {
      id: 'production',
      label: t.common.production,
      icon: ChefHat,
      path: '/production',
      badge: null,
    },
    {
      id: 'purchasing',
      label: t.common.purchasing,
      icon: Truck,
      path: '/purchasing',
      badge: null,
    },
    {
      id: 'sales',
      label: t.common.sales,
      icon: ReceiptText,
      path: '/sales',
      badge: null,
    },
    {
      id: 'reservations',
      label: t.common.reservations,
      icon: CalendarCheck,
      path: '/reservations',
      badge: null,
    },
    {
      id: 'reports',
      label: t.common.reports,
      icon: BarChart3,
      path: '/reports',
      badge: null,
    },
    {
      id: 'settings',
      label: t.common.settings,
      icon: Settings,
      path: '/settings',
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border/70 bg-card/95 backdrop-blur-md transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 shadow-md shadow-orange-500/20 text-white shrink-0">
              <Flame className="w-5 h-5 fill-white/20" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold tracking-tight text-foreground truncate">
                  RESTO VIBE
                </span>
                <span className="text-[11px] font-medium text-muted-foreground truncate">
                  FnB Inventory OS
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={collapsed ? 'Perluas Menu' : 'Perkecil Menu'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Mobile close toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex lg:hidden items-center justify-center w-8 h-8 rounded-lg border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-muted">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Operasional FnB
            </div>
          )}

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.path;

            return (
              <a
                key={item.id}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  // Router / state transition placeholder
                  setMobileOpen(false);
                }}
                title={collapsed ? item.label : undefined}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/80'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />

                {!collapsed && (
                  <span className="truncate flex-1 tracking-tight">{item.label}</span>
                )}

                {!collapsed && item.badge && (
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.badge.variant === 'destructive'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {item.badge.text}
                  </span>
                )}

                {/* Collapsed active dot indicator */}
                {collapsed && isActive && (
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                )}
              </a>
            );
          })}
        </div>

        {/* User / Branch Footer */}
        <div className="p-3 border-t border-border/60">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-muted/40 border border-border/40 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                AD
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>

            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-foreground truncate">
                  Admin Kitchen
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {t.common.branch}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
