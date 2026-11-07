import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Ingredient } from '@/types/ingredient';

interface IngredientDeleteDialogProps {
  isOpen: boolean;
  ingredient: Ingredient | null;
  onClose: () => void;
  onConfirm: (ingredient: Ingredient) => void;
  isDeleting?: boolean;
}

export const IngredientDeleteDialog: React.FC<IngredientDeleteDialogProps> = ({
  isOpen,
  ingredient,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  const { t } = useTranslation();

  if (!isOpen || !ingredient) return null;

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
              {t.ingredients.deleteConfirmTitle}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {t.ingredients.deleteConfirmDesc}
            </p>

            {/* Target Ingredient Info Card */}
            <div className="mt-4 rounded-xl border border-border/70 bg-muted/40 p-3">
              <div className="text-xs font-semibold text-foreground truncate">
                {ingredient.ingre_name}
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                <span>{ingredient.ingre_code}</span>
                {ingredient.sku && (
                  <>
                    <span>•</span>
                    <span>SKU: {ingredient.sku}</span>
                  </>
                )}
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
            className="px-4 py-2 rounded-xl border border-border/80 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all disabled:opacity-50 cursor-pointer"
          >
            {t.ingredients.btnCancel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(ingredient)}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {isDeleting
                ? t.ingredients.btnDeleting
                : t.ingredients.btnDelete}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
