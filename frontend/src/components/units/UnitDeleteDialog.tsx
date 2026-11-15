import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Unit } from '@/types/unit';

interface UnitDeleteDialogProps {
  isOpen: boolean;
  unit: Unit | null;
  onClose: () => void;
  onConfirm: (unit: Unit) => void;
  isDeleting?: boolean;
}

export const UnitDeleteDialog: React.FC<UnitDeleteDialogProps> = ({
  isOpen,
  unit,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  const { t } = useTranslation();

  if (!isOpen || !unit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-border/80 bg-popover text-popover-foreground p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground">
              {t.units.deleteConfirmTitle}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {t.units.deleteConfirmMessage
                .replace('{name}', unit.unit_name)
                .replace('{code}', unit.unit_code)}
            </p>

            {/* Target Unit Info Card */}
            <div className="mt-4 rounded-xl border border-border/70 bg-muted/40 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kode:</span>
                <span className="font-mono font-medium text-foreground">
                  {unit.unit_code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Simbol:</span>
                <span className="font-mono font-bold text-foreground">
                  {unit.short_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipe:</span>
                <span className="font-medium capitalize text-foreground">
                  {unit.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors disabled:opacity-50 cursor-pointer"
          >
            {t.units.btnCancel}
          </button>

          <button
            type="button"
            onClick={() => onConfirm(unit)}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {isDeleting ? t.units.btnSaving : t.units.deleteUnit}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitDeleteDialog;
