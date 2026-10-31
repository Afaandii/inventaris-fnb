import React from 'react';
import { PackagePlus, FilePlus2, ShoppingBag, FileSpreadsheet, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export const QuickActions: React.FC = () => {
  const { t } = useTranslation();

  const actions = [
    {
      title: t.dashboard.actionNewStock,
      desc: 'Update stok bahan baku baru',
      icon: PackagePlus,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      href: '/inventory/in',
    },
    {
      title: t.dashboard.actionNewPO,
      desc: 'Pesan ke supplier rekanan',
      icon: FilePlus2,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      href: '/purchasing/new',
    },
    {
      title: t.dashboard.actionNewSale,
      desc: 'Buka terminal POS & Kasir',
      icon: ShoppingBag,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      href: '/sales/pos',
    },
    {
      title: t.dashboard.actionReport,
      desc: 'Rekapitulasi omset & margin',
      icon: FileSpreadsheet,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      href: '/reports/daily',
    },
  ];

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 md:p-6 shadow-xs">
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {t.dashboard.quickActionTitle}
        </h3>
        <p className="text-xs text-muted-foreground">{t.dashboard.quickActionDesc}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <a
              key={idx}
              href={act.href}
              onClick={(e) => e.preventDefault()}
              className="group flex flex-col justify-between p-3 sm:p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-lg border ${act.color} transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-foreground transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              <div>
                <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                  {act.title}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  {act.desc}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
