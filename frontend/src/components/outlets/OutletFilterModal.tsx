import React, { useState, useEffect } from 'react';
import { X, Filter, RotateCcw, Check, Calendar, MapPin, Building2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { StatusOutlet } from '@/types/outlet';

export interface OutletFilterCriteria {
  dateFrom: string;
  dateTo: string;
  city: string | 'all';
  status: StatusOutlet | 'all';
}

interface OutletFilterModalProps {
  isOpen: boolean;
  initialCriteria?: OutletFilterCriteria;
  criteria?: OutletFilterCriteria;
  availableCities: string[];
  onClose: () => void;
  onApply: (criteria: OutletFilterCriteria) => void;
  onReset: () => void;
}

const defaultCriteria: OutletFilterCriteria = {
  dateFrom: '',
  dateTo: '',
  city: 'all',
  status: 'all',
};

export const OutletFilterModal: React.FC<OutletFilterModalProps> = ({
  isOpen,
  initialCriteria,
  criteria,
  availableCities,
  onClose,
  onApply,
  onReset,
}) => {
  const { t } = useTranslation();
  const activeCriteria = initialCriteria || criteria || defaultCriteria;

  const [dateFrom, setDateFrom] = useState(activeCriteria.dateFrom || '');
  const [dateTo, setDateTo] = useState(activeCriteria.dateTo || '');
  const [city, setCity] = useState<string | 'all'>(activeCriteria.city ?? 'all');
  const [status, setStatus] = useState<StatusOutlet | 'all'>(activeCriteria.status ?? 'all');

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDateFrom(activeCriteria.dateFrom || '');
      setDateTo(activeCriteria.dateTo || '');
      setCity(activeCriteria.city ?? 'all');
      setStatus(activeCriteria.status ?? 'all');
    }
  }, [isOpen, activeCriteria]);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({
      dateFrom,
      dateTo,
      city,
      status,
    });
    onClose();
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setCity('all');
    setStatus('all');
    onReset();
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
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Filter Data Outlet
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Saring data outlet berdasarkan kriteria berikut
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-4 pt-4">
          {/* Date Range Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Rentang Tanggal Pembuatan</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 px-3 rounded-xl border border-border/70 bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 px-3 rounded-xl border border-border/70 bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          </div>

          {/* City Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Kota / Wilayah</span>
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-border/70 bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 cursor-pointer"
            >
              <option value="all">{t.outlets.filterAllCities}</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Outlet Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Status Operasional</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'all', label: t.outlets.filterAllStatus },
                { val: 'active', label: t.outlets.statusActive },
                { val: 'renovation', label: t.outlets.statusRenovation },
                { val: 'inactive', label: t.outlets.statusInactive },
                { val: 'closed', label: t.outlets.statusClosed },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setStatus(opt.val as StatusOutlet | 'all')}
                  className={`h-9 px-3 rounded-xl border text-xs font-medium transition-all text-left truncate cursor-pointer ${
                    status === opt.val
                      ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-2xs'
                      : 'border-border/70 bg-card hover:bg-muted text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Terapkan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OutletFilterModal;
