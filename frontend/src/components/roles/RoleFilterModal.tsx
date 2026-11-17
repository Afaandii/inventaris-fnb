import React, { useState, useEffect } from 'react';
import { X, Filter, RotateCcw, Check, Calendar, Shield } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export interface RoleFilterCriteria {
  dateFrom: string;
  dateTo: string;
  category: 'all' | 'managerial' | 'operational';
}

interface RoleFilterModalProps {
  isOpen: boolean;
  initialCriteria?: RoleFilterCriteria;
  criteria?: RoleFilterCriteria;
  onClose: () => void;
  onApply: (criteria: RoleFilterCriteria) => void;
  onReset: () => void;
}

const defaultCriteria: RoleFilterCriteria = {
  dateFrom: '',
  dateTo: '',
  category: 'all',
};

export const RoleFilterModal: React.FC<RoleFilterModalProps> = ({
  isOpen,
  initialCriteria,
  criteria,
  onClose,
  onApply,
  onReset,
}) => {
  const { t } = useTranslation();
  const activeCriteria = initialCriteria || criteria || defaultCriteria;

  const [dateFrom, setDateFrom] = useState(activeCriteria.dateFrom || '');
  const [dateTo, setDateTo] = useState(activeCriteria.dateTo || '');
  const [category, setCategory] = useState<'all' | 'managerial' | 'operational'>(
    activeCriteria.category ?? 'all',
  );

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDateFrom(activeCriteria.dateFrom || '');
      setDateTo(activeCriteria.dateTo || '');
      setCategory(activeCriteria.category ?? 'all');
    }
  }, [isOpen, activeCriteria]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      dateFrom,
      dateTo,
      category,
    });
    onClose();
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setCategory('all');
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-popover text-popover-foreground p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Filter Data Peran
              </h3>
              <p className="text-xs text-muted-foreground">
                Saring data peran berdasarkan tanggal dan kategori akses
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* Section 1: Date Range */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Rentang Tanggal Pembuatan</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-[10px] text-muted-foreground">Dari Tanggal:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Sampai Tanggal:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Category */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Kategori Hak Akses</span>
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as 'all' | 'managerial' | 'operational')
              }
              className="w-full h-9 px-3 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              <option value="managerial">Manajerial (Superadmin, Admin, Manager)</option>
              <option value="operational">Operasional (Kasir, Chef, Barista, Staf)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
            >
              {t.roles.btnCancel}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Terapkan Filter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleFilterModal;
