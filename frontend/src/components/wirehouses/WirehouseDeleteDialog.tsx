import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Wirehouse } from '@/types/wirehouse';

interface WirehouseDeleteDialogProps {
  isOpen: boolean;
  wirehouse: Wirehouse | null;
  onClose: () => void;
  onConfirm: (wirehouse: Wirehouse) => void;
  isDeleting?: boolean;
}

export const WirehouseDeleteDialog: React.FC<WirehouseDeleteDialogProps> = ({
  isOpen,
  wirehouse,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  const { t } = useTranslation();

  if (!isOpen || !wirehouse) return null;

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
              {t.wirehouses.deleteConfirmTitle}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {t.wirehouses.deleteConfirmMessage
                .replace('{name}', wirehouse.wirehouse_name)
                .replace('{code}', wirehouse.wirehouse_code)}
            </p>

            {/* Target Wirehouse Info Card */}
            <div className="mt-4 rounded-xl border border-border/70 bg-muted/40 p-3">
              <span className="font-semibold text-xs text-foreground block truncate">
                {wirehouse.wirehouse_name}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[11px] text-muted-foreground">
                  {wirehouse.wirehouse_code}
                </span>
                <span className="text-muted-foreground text-[10px]">•</span>
                <span className="text-[11px] text-foreground/80 font-medium truncate">
                  {wirehouse.city}
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
            className="px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all disabled:opacity-50 cursor-pointer"
          >
            {t.wirehouses.btnCancel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(wirehouse)}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {isDeleting ? t.wirehouses.btnSaving : t.wirehouses.deleteWirehouse}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WirehouseDeleteDialog;
