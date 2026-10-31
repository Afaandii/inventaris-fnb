import React from 'react';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string;
  description: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  change,
  isPositive = true,
  icon: Icon,
  variant = 'default',
}) => {
  const variantStyles = {
    default: {
      iconBg: 'bg-primary/10 text-primary border-primary/20',
      badge: 'bg-muted text-muted-foreground',
    },
    success: {
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    warning: {
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    danger: {
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-xs hover:shadow-md hover:border-border transition-all duration-200">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-medium text-muted-foreground tracking-tight">
          {title}
        </span>
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-xl border ${style.iconBg} transition-transform hover:scale-105`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-mono">
          {value}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {change && (
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-semibold ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change}
          </span>
        )}
        <span className="truncate">{description}</span>
      </div>
    </div>
  );
};
