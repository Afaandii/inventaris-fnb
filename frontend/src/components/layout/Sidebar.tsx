import React, { useState, useEffect } from "react";
import { ChevronDown, Flame, X } from "lucide-react";
import {
  navigationData,
  type MenuItem,
  type SubMenuItem,
} from "@/data/navigation";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
  activePath?: string;
  onNavigate?: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  activePath = "/dashboard",
  onNavigate,
}) => {
  // Prevent background page from scrolling when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [mobileOpen]);

  // Keep track of expanded submenus in expanded mode
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    master: false,
    inventory: false,
    product: false,
  });

  const toggleSubmenu = (menuId: string) => {
    if (collapsed) {
      // Auto expand sidebar if collapsed when opening a dropdown
      setCollapsed(false);
      setExpandedMenus((prev) => ({ ...prev, [menuId]: true }));
      return;
    }

    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleItemClick = (
    path: string,
    hasSubItems: boolean,
    menuId: string,
  ) => {
    if (hasSubItems) {
      toggleSubmenu(menuId);
    } else {
      setMobileOpen(false);
      if (onNavigate) {
        onNavigate(path);
      }
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity touch-none"
          onClick={() => setMobileOpen(false)}
          onTouchMove={(e) => e.preventDefault()}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border/70 bg-card/98 backdrop-blur-md transition-all duration-300 ease-in-out overscroll-contain touch-pan-y ${
          collapsed ? "w-16" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-3 border-b border-border/60 shrink-0">
          <div
            className={`flex items-center gap-2.5 overflow-hidden ${collapsed ? "mx-auto" : ""}`}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 shadow-md shadow-orange-500/20 text-white shrink-0">
              <Flame className="w-5 h-5 fill-white/20" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold tracking-tight text-foreground truncate">
                  RESTO VIBE
                </span>
                <span className="text-[10px] font-medium text-muted-foreground truncate">
                  FnB Inventory OS
                </span>
              </div>
            )}
          </div>

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
        <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y px-2 py-3 space-y-4 scrollbar-hover">
          {navigationData.map((group) => {
            return (
              <div key={group.groupName} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {group.groupName}
                  </div>
                )}

                {collapsed && (
                  <div className="my-1.5 border-t border-border/40 w-6 mx-auto" />
                )}

                {group.items.map((item: MenuItem) => {
                  const Icon = item.icon;
                  const hasSubItems = Boolean(
                    item.items && item.items.length > 0,
                  );
                  const isExpanded = Boolean(expandedMenus[item.id]);

                  // Check if this item or any of its sub-items is active
                  const isItemActive =
                    activePath === item.path ||
                    (item.items?.some(
                      (sub: SubMenuItem) => activePath === sub.path,
                    ) ??
                      false);

                  // Collapsed mode: Compact square icon button (Shadcn Admin style)
                  if (collapsed) {
                    return (
                      <div key={item.id} className="flex justify-center py-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleItemClick(item.path, hasSubItems, item.id)
                          }
                          title={item.title}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                            isItemActive
                              ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  }

                  // Expanded mode: Standard full-width navigation item
                  return (
                    <div key={item.id} className="space-y-1">
                      {/* Parent Menu Item */}
                      <button
                        type="button"
                        onClick={() =>
                          handleItemClick(item.path, hasSubItems, item.id)
                        }
                        className={`w-full group flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                          isItemActive && !hasSubItems
                            ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                            : isItemActive && hasSubItems
                              ? "bg-accent/70 text-foreground font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-transform ${
                              isItemActive
                                ? "text-accent-foreground"
                                : "text-muted-foreground group-hover:text-foreground"
                            }`}
                          />
                          <span className="truncate tracking-tight">
                            {item.title}
                          </span>
                        </div>

                        {hasSubItems && (
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>

                      {/* Dropdown Sub-menu Items (Shadcn Accordion style) */}
                      {hasSubItems && isExpanded && (
                        <div className="pl-6 pr-1 py-1 space-y-0.5 relative before:absolute before:left-4 before:top-1 before:bottom-1 before:w-px before:bg-border/70">
                          {item.items?.map((sub: SubMenuItem) => {
                            const isSubActive = activePath === sub.path;

                            return (
                              <a
                                key={sub.id}
                                href={sub.path}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setMobileOpen(false);
                                  if (onNavigate) {
                                    onNavigate(sub.path);
                                  }
                                }}
                                className={`block px-2.5 py-1.5 rounded-md text-xs transition-colors truncate ${
                                  isSubActive
                                    ? "bg-accent text-accent-foreground font-semibold shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                }`}
                              >
                                {sub.title}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User / Branch Footer */}
        <div className="p-2 border-t border-border/60 shrink-0">
          <div
            className={`flex items-center gap-2.5 p-1.5 rounded-lg bg-muted/40 border border-border/40 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-[11px] shadow-inner">
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
                  Resto Vibe HQ
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
