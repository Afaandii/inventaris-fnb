import React, { useState, useEffect } from 'react';
import { X, Filter, RotateCcw, Check, Calendar, Layers, Tag } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { CategoryType, CategoryStatus } from '@/types/category';

export interface CategoryFilterCriteria {
  dateFrom: string;
  dateTo: string;
  status: CategoryStatus | 'all';
  type: CategoryType | 'all';
}

interface CategoryFilterModalProps {
  isOpen: boolean;
  initialCriteria: CategoryFilterCriteria;
  onClose: () => void;
  onApply: (criteria: CategoryFilterCriteria) => void;
  onReset: () => void;
}

export const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({
  isOpen,
  initialCriteria,
  onClose,
  onApply,
  onReset,
}) => {
  const { t } = useTranslation();

  const [dateFrom, setDateFrom] = useState(initialCriteria.dateFrom);
  const [dateTo, setDateTo] = useState(initialCriteria.dateTo);
  const [status, setStatus] = useState<CategoryStatus | 'all'>(initialCriteria.status);
  const [type, setType] = useState<CategoryType | 'all'>(initialCriteria.type);

  useEffect(() => {
    if (isOpen) {
      setDateFrom(initialCriteria.dateFrom);
      setDateTo(initialCriteria.dateTo);
      setStatus(initialCriteria.status);
      setType(initialCriteria.type);
    }
  }, [isOpen, initialCriteria]);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({
      dateFrom,
      dateTo,
      status,
      type,
    });
    onClose();
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setStatus('all');
    setType('all');
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-border/80 bg-popover text-popover-foreground shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Filter Kategori
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Saring data berdasarkan tanggal, status, dan tipe
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Form Body */}
        <form onSubmit={handleApply} className="p-5 space-y-4">
          {/* Date Range Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Rentang Tanggal Dibuat</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-muted-foreground block mb-1">
                  Dari Tanggal
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl border border-border/70 bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all"
                />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block mb-1">
                  Sampai Tanggal
                </span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl border border-border/70 bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Status Kategori</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setStatus('all')}
                className={`py-2 px-2 rounded-xl text-xs font-medium transition-all text-center ${
                  status === 'all'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'border border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.categories.filterAllStatus}
              </button>
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={`py-2 px-2 rounded-xl text-xs font-medium transition-all text-center ${
                  status === 'active'
                    ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                    : 'border border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.categories.statusActive}
              </button>
              <button
                type="button"
                onClick={() => setStatus('inactive')}
                className={`py-2 px-2 rounded-xl text-xs font-medium transition-all text-center ${
                  status === 'inactive'
                    ? 'bg-muted-foreground text-background font-semibold shadow-2xs'
                    : 'border border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.categories.statusInactive}
              </button>
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Tipe Kategori</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('all')}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all text-left flex items-center justify-between ${
                  type === 'all'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'border border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{t.categories.filterAll}</span>
                {type === 'all' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setType('ingredient')}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all text-left flex items-center justify-between ${
                  type === 'ingredient'
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'border border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{t.categories.typeIngredient}</span>
                {type === 'ingredient' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setType('menu')}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all text-left flex items-center justify-between ${
                  type === 'menu'
                    ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                    : 'border border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{t.categories.typeMenu}</span>
                {type === 'menu' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setType('product')}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all text-left flex items-center justify-between ${
                  type === 'product'
                    ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                    : 'border border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{t.categories.typeProduct}</span>
                {type === 'product' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium rounded-xl border border-border/70 bg-card hover:bg-accent text-foreground transition-colors"
              >
                {t.categories.btnCancel}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Terapkan Filter</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
