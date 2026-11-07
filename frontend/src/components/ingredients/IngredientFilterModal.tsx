import React, { useState, useEffect } from 'react';
import { X, Filter, RotateCcw, Check, Calendar, Layers, Scale, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Category } from '@/types/category';
import type { Unit } from '@/types/ingredient';

export interface IngredientFilterCriteria {
  dateFrom: string;
  dateTo: string;
  categoryId: number | 'all';
  unitId: number | 'all';
  perishable: 'all' | 'yes' | 'no';
  status: 'all' | 'active' | 'inactive';
}

interface IngredientFilterModalProps {
  isOpen: boolean;
  initialCriteria?: IngredientFilterCriteria;
  criteria?: IngredientFilterCriteria;
  categories: Category[];
  units: Unit[];
  onClose: () => void;
  onApply: (criteria: IngredientFilterCriteria) => void;
  onReset: () => void;
}

const defaultCriteria: IngredientFilterCriteria = {
  dateFrom: '',
  dateTo: '',
  categoryId: 'all',
  unitId: 'all',
  perishable: 'all',
  status: 'all',
};

export const IngredientFilterModal: React.FC<IngredientFilterModalProps> = ({
  isOpen,
  initialCriteria,
  criteria,
  categories,
  units,
  onClose,
  onApply,
  onReset,
}) => {
  const { t } = useTranslation();
  const activeCriteria = initialCriteria || criteria || defaultCriteria;

  const [dateFrom, setDateFrom] = useState(activeCriteria.dateFrom || '');
  const [dateTo, setDateTo] = useState(activeCriteria.dateTo || '');
  const [categoryId, setCategoryId] = useState<number | 'all'>(activeCriteria.categoryId ?? 'all');
  const [unitId, setUnitId] = useState<number | 'all'>(activeCriteria.unitId ?? 'all');
  const [perishable, setPerishable] = useState<'all' | 'yes' | 'no'>(activeCriteria.perishable ?? 'all');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>(activeCriteria.status ?? 'all');

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDateFrom(activeCriteria.dateFrom || '');
      setDateTo(activeCriteria.dateTo || '');
      setCategoryId(activeCriteria.categoryId ?? 'all');
      setUnitId(activeCriteria.unitId ?? 'all');
      setPerishable(activeCriteria.perishable ?? 'all');
      setStatus(activeCriteria.status ?? 'all');
    }
  }, [isOpen, activeCriteria]);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({
      dateFrom,
      dateTo,
      categoryId,
      unitId,
      perishable,
      status,
    });
    onClose();
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setCategoryId('all');
    setUnitId('all');
    setPerishable('all');
    setStatus('all');
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
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-popover text-popover-foreground shadow-2xl animate-in zoom-in-95 fade-in duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Filter Data Bahan Baku
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Saring data berdasarkan tanggal, kategori, unit, dan status
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Form Body */}
        <form onSubmit={handleApply} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Rentang Tanggal */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Rentang Tanggal Input</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-muted-foreground block mb-1">Dari Tanggal</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block mb-1">Sampai Tanggal</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
            </div>
          </div>

          {/* Kategori Bahan (Dynamic from backend) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Kategori Bahan Baku</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                const val = e.target.value;
                setCategoryId(val === 'all' ? 'all' : Number(val));
              }}
              className="w-full h-9 px-3 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 cursor-pointer"
            >
              <option value="all">{t.ingredients.filterAll}</option>
              {categories.map((c) => (
                <option key={c.id_category} value={c.id_category}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Satuan Unit */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Scale className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Satuan Ukuran (Unit)</span>
            </label>
            <select
              value={unitId}
              onChange={(e) => {
                const val = e.target.value;
                setUnitId(val === 'all' ? 'all' : Number(val));
              }}
              className="w-full h-9 px-3 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 cursor-pointer"
            >
              <option value="all">{t.ingredients.filterAllUnits}</option>
              {units.map((u) => (
                <option key={u.id_unit} value={u.id_unit}>
                  {u.unit_name} ({u.short_name})
                </option>
              ))}
            </select>
          </div>

          {/* Karakteristik Ketahanan (Perishable) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Ketahanan Bahan (Perishability)</span>
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl border border-border/70 bg-muted/30">
              <button
                type="button"
                onClick={() => setPerishable('all')}
                className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                  perishable === 'all'
                    ? 'bg-card text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.ingredients.filterAllPerishable}
              </button>
              <button
                type="button"
                onClick={() => setPerishable('yes')}
                className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                  perishable === 'yes'
                    ? 'bg-card text-rose-500 font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.ingredients.perishableYes}
              </button>
              <button
                type="button"
                onClick={() => setPerishable('no')}
                className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                  perishable === 'no'
                    ? 'bg-card text-emerald-500 font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.ingredients.perishableNo}
              </button>
            </div>
          </div>

          {/* Status Operasional */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              <span>Status Operasional</span>
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl border border-border/70 bg-muted/30">
              <button
                type="button"
                onClick={() => setStatus('all')}
                className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                  status === 'all'
                    ? 'bg-card text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.ingredients.filterAllStatus}
              </button>
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                  status === 'active'
                    ? 'bg-card text-emerald-500 font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.ingredients.statusActive}
              </button>
              <button
                type="button"
                onClick={() => setStatus('inactive')}
                className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                  status === 'inactive'
                    ? 'bg-card text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.ingredients.statusInactive}
              </button>
            </div>
          </div>

          {/* Footer Modal Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border/70 mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
              >
                {t.ingredients.btnCancel}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all cursor-pointer"
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
