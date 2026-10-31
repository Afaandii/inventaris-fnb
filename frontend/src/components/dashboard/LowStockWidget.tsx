import React from 'react';
import { AlertTriangle, Plus, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface LowStockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  status: 'critical' | 'low' | 'out';
  daysLeft: number;
}

const mockLowStock: LowStockItem[] = [
  {
    id: 'ING-01',
    name: 'Daging Sapi Sirloin Aus',
    category: 'Daging & Unggas',
    currentStock: 2.5,
    minStock: 10,
    unit: 'kg',
    status: 'critical',
    daysLeft: 1,
  },
  {
    id: 'ING-02',
    name: 'Fresh Milk Pasteurisasi',
    category: 'Dairy & Bar',
    currentStock: 4,
    minStock: 20,
    unit: 'Liter',
    status: 'critical',
    daysLeft: 0,
  },
  {
    id: 'ING-03',
    name: 'Espresso House Blend',
    category: 'Biji Kopi',
    currentStock: 1.2,
    minStock: 5,
    unit: 'kg',
    status: 'low',
    daysLeft: 2,
  },
  {
    id: 'ING-04',
    name: 'Keju Mozzarella Grated',
    category: 'Dairy & Topping',
    currentStock: 3.8,
    minStock: 8,
    unit: 'kg',
    status: 'low',
    daysLeft: 3,
  },
];

export const LowStockWidget: React.FC = () => {
  const { t, currentLanguage } = useTranslation();

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 md:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {t.dashboard.lowStockTitle}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t.dashboard.lowStockSubtitle}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            {mockLowStock.length} Bahan
          </span>
        </div>

        {/* Items List */}
        <div className="space-y-3 mt-4">
          {mockLowStock.map((item) => {
            const percentage = Math.min(
              100,
              Math.round((item.currentStock / item.minStock) * 100)
            );
            const isCritical = item.status === 'critical';

            return (
              <div
                key={item.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {item.name}
                    </span>
                    <span
                      className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-medium uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isCritical
                        ? t.dashboard.statusCritical
                        : t.dashboard.statusLow}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {item.category} • Min. {item.minStock} {item.unit}
                  </span>

                  {/* Stock Level Bar */}
                  <div className="w-full bg-border/60 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCritical ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-foreground">
                      {item.currentStock} {item.unit}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {item.daysLeft === 0
                        ? currentLanguage === 'id'
                          ? 'Habis hari ini'
                          : 'Depletes today'
                        : `${item.daysLeft} ${currentLanguage === 'id' ? 'hari lagi' : 'days left'}`}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/70 bg-card hover:bg-primary hover:text-primary-foreground text-xs font-medium text-foreground transition-all duration-150 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.common.restock}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer link */}
      <div className="pt-4 mt-2 border-t border-border/60">
        <a
          href="/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline group"
        >
          <span>
            {currentLanguage === 'id'
              ? 'Kelola Seluruh Stok Inventaris'
              : 'Manage Full Inventory Stock'}
          </span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </div>
  );
};
