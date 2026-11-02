import React from 'react';
import { X, Edit2, Calendar, FolderTree, Tag, Info, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Category } from '@/types/category';

interface CategoryDetailModalProps {
  isOpen: boolean;
  category: Category | null;
  parentName?: string;
  onClose: () => void;
  onEdit: (category: Category) => void;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  isOpen,
  category,
  parentName,
  onClose,
  onEdit,
}) => {
  const { t, currentLanguage } = useTranslation();

  if (!isOpen || !category) return null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat(currentLanguage === 'id' ? 'id-ID' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const getTypeBadge = (type: Category['type']) => {
    switch (type) {
      case 'ingredient':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {t.categories.typeIngredient}
          </span>
        );
      case 'menu':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t.categories.typeMenu}
          </span>
        );
      case 'product':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {t.categories.typeProduct}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-popover text-popover-foreground shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {t.categories.detailCategory}
              </h3>
              <p className="text-[11px] font-mono text-muted-foreground">
                ID: #{category.id_category}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Main Title & Status */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {category.category_name}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                  /{category.slug}
                </span>
              </div>
            </div>
            <div>
              {category.status === 'active' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t.categories.statusActive}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
                  <XCircle className="w-3.5 h-3.5" />
                  {t.categories.statusInactive}
                </span>
              )}
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-border/70 bg-card/60">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Tag className="w-3.5 h-3.5" />
                <span>{t.categories.colType}</span>
              </div>
              <div className="mt-2">{getTypeBadge(category.type)}</div>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-card/60">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <FolderTree className="w-3.5 h-3.5" />
                <span>{t.categories.colParent}</span>
              </div>
              <div className="mt-2 text-xs font-semibold text-foreground truncate">
                {parentName || t.categories.rootCategory}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 space-y-1.5">
            <div className="text-[11px] font-medium text-muted-foreground">
              {t.categories.colDescription}
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed">
              {category.description || '— Tidak ada deskripsi —'}
            </p>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {t.categories.colCreatedAt}: {formatDate(category.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:justify-end">
              <span>
                {t.categories.colUpdatedAt}: {formatDate(category.updated_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/70 bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-border/70 bg-card hover:bg-accent text-foreground transition-colors"
          >
            {t.categories.btnClose}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(category);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{t.categories.editCategory}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
