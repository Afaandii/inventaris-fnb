import React, { useState, useEffect } from 'react';
import { X, Filter, RotateCcw, Check, Calendar, Building2, MapPin, Layers } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { TypeWirehouse, StatusWirehouse, WirehouseOutlet } from '@/types/wirehouse';

export interface WirehouseFilterCriteria {
  dateFrom: string;
  dateTo: string;
  outletId: number | 'all';
  city: string | 'all';
  type: TypeWirehouse | 'all';
  status: StatusWirehouse | 'all';
}

interface WirehouseFilterModalProps {
  isOpen: boolean;
  initialCriteria?: WirehouseFilterCriteria;
  criteria?: WirehouseFilterCriteria;
  availableOutlets: WirehouseOutlet[];
  availableCities: string[];
  onClose: () => void;
  onApply: (criteria: WirehouseFilterCriteria) => void;
  onReset: () => void;
}

const defaultCriteria: WirehouseFilterCriteria = {
  dateFrom: '',
  dateTo: '',
  outletId: 'all',
  city: 'all',
  type: 'all',
  status: 'all',
};

export const WirehouseFilterModal: React.FC<WirehouseFilterModalProps> = ({
  isOpen,
  initialCriteria,
  criteria,
  availableOutlets,
  availableCities,
  onClose,
  onApply,
  onReset,
}) => {
  const { t } = useTranslation();
  const activeCriteria = initialCriteria || criteria || defaultCriteria;

  const [dateFrom, setDateFrom] = useState(activeCriteria.dateFrom || '');
  const [dateTo, setDateTo] = useState(activeCriteria.dateTo || '');
  const [outletId, setOutletId] = useState<number | 'all'>(activeCriteria.outletId ?? 'all');
  const [city, setCity] = useState<string | 'all'>(activeCriteria.city ?? 'all');
  const [type, setType] = useState<TypeWirehouse | 'all'>(activeCriteria.type ?? 'all');
  const [status, setStatus] = useState<StatusWirehouse | 'all'>(activeCriteria.status ?? 'all');

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDateFrom(activeCriteria.dateFrom || '');
      setDateTo(activeCriteria.dateTo || '');
      setOutletId(activeCriteria.outletId ?? 'all');
      setCity(activeCriteria.city ?? 'all');
      setType(activeCriteria.type ?? 'all');
      setStatus(activeCriteria.status ?? 'all');
    }
  }, [isOpen, activeCriteria]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      dateFrom,
      dateTo,
      outletId,
      city,
      type,
      status,
    });
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setOutletId('all');
    setCity('all');
    setType('all');
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

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-popover text-popover-foreground p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Filter Data Gudang
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Saring data gudang berdasarkan kriteria tertentu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Date Range Filter */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Rentang Tanggal Pembuatan</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-border/70 bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all font-mono"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-border/70 bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all font-mono"
              />
            </div>
          </div>

          {/* Outlet Filter */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{t.wirehouses.labelOutlet}</span>
            </label>
            <select
              value={outletId}
              onChange={(e) =>
                setOutletId(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full h-9 px-3 rounded-xl border border-border/70 bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all cursor-pointer"
            >
              <option value="all">{t.wirehouses.filterAllOutlets}</option>
              {availableOutlets.map((o) => (
                <option key={o.id_outlet} value={o.id_outlet}>
                  {o.outlet_name} ({o.outlet_code})
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{t.wirehouses.labelCity}</span>
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-border/70 bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all cursor-pointer"
            >
              <option value="all">{t.wirehouses.filterAllCities}</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{t.wirehouses.labelType}</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TypeWirehouse | 'all')}
              className="w-full h-9 px-3 rounded-xl border border-border/70 bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all cursor-pointer"
            >
              <option value="all">{t.wirehouses.filterAllTypes}</option>
              <option value="main">{t.wirehouses.typeMain}</option>
              <option value="kitchen">{t.wirehouses.typeKitchen}</option>
              <option value="bar">{t.wirehouses.typeBar}</option>
              <option value="storage">{t.wirehouses.typeStorage}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.wirehouses.labelStatus}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusWirehouse | 'all')}
              className="w-full h-9 px-3 rounded-xl border border-border/70 bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all cursor-pointer"
            >
              <option value="all">{t.wirehouses.filterAllStatus}</option>
              <option value="active">{t.wirehouses.statusActive}</option>
              <option value="inactive">{t.wirehouses.statusInactive}</option>
              <option value="maintenance">{t.wirehouses.statusMaintenance}</option>
              <option value="closed">{t.wirehouses.statusClosed}</option>
            </select>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/70">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer"
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
              {t.wirehouses.btnCancel}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Terapkan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WirehouseFilterModal;
