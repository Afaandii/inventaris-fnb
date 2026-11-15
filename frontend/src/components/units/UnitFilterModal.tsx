import React, { useState, useEffect } from 'react';
import { X, Filter, RotateCcw, Check, Calendar, Layers, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { TypeUnit, StatusUnit } from '@/types/unit';

export interface UnitFilterCriteria {
  dateFrom: string;
  dateTo: string;
  type: TypeUnit | 'all';
  status: StatusUnit | 'all';
}

interface UnitFilterModalProps {
  isOpen: boolean;
  initialCriteria?: UnitFilterCriteria;
  criteria?: UnitFilterCriteria;
  onClose: () => void;
  onApply: (criteria: UnitFilterCriteria) => void;
  onReset: () => void;
}

const defaultCriteria: UnitFilterCriteria = {
  dateFrom: '',
  dateTo: '',
  type: 'all',
  status: 'all',
};

export const UnitFilterModal: React.FC<UnitFilterModalProps> = ({
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
  const [type, setType] = useState<TypeUnit | 'all'>(activeCriteria.type ?? 'all');
  const [status, setStatus] = useState<StatusUnit | 'all'>(activeCriteria.status ?? 'all');

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDateFrom(activeCriteria.dateFrom || '');
      setDateTo(activeCriteria.dateTo || '');
      setType(activeCriteria.type ?? 'all');
      setStatus(activeCriteria.status ?? 'all');
    }
  }, [isOpen, activeCriteria]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      dateFrom,
      dateTo,
      type,
      status,
    });
    onClose();
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setType('all');
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
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-popover text-popover-foreground p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Filter Data Satuan
              </h3>
              <p className="text-xs text-muted-foreground">
                Saring data berdasarkan tanggal, tipe pengukuran, dan status
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

          {/* Section 2: Type */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Tipe Pengukuran</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TypeUnit | 'all')}
              className="w-full h-9 px-3 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 cursor-pointer"
            >
              <option value="all">{t.units.filterAllTypes}</option>
              <option value="weight">{t.units.typeWeight}</option>
              <option value="volume">{t.units.typeVolume}</option>
              <option value="count">{t.units.typeCount}</option>
              <option value="package">{t.units.typePackage}</option>
            </select>
          </div>

          {/* Section 3: Status */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Status Operasional</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusUnit | 'all')}
              className="w-full h-9 px-3 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 cursor-pointer"
            >
              <option value="all">{t.units.filterAllStatus}</option>
              <option value="active">{t.units.statusActive}</option>
              <option value="inactive">{t.units.statusInactive}</option>
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
              {t.units.btnCancel}
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

export default UnitFilterModal;
