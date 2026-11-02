import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, FolderTree, Tag, Check, Layers } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Category, CategoryFormData, CategoryType, CategoryStatus } from '@/types/category';

interface CategoryFormModalProps {
  isOpen: boolean;
  initialData?: Category | null;
  categoriesList: Category[];
  onClose: () => void;
  onSubmit: (formData: CategoryFormData, id_category?: number) => void;
  isSubmitting?: boolean;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  initialData,
  categoriesList,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const isEdit = Boolean(initialData);

  const [categoryName, setCategoryName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [type, setType] = useState<CategoryType>('ingredient');
  const [status, setStatus] = useState<CategoryStatus>('active');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper to generate slug from name
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.category_name);
      setSlug(initialData.slug);
      setParentId(initialData.parent_id);
      setType(initialData.type);
      setStatus(initialData.status);
      setDescription(initialData.description || '');
      setErrors({});
    } else {
      setCategoryName('');
      setSlug('');
      setParentId(null);
      setType('ingredient');
      setStatus('active');
      setDescription('');
      setErrors({});
    }
  }, [initialData, isOpen]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCategoryName(value);
    setSlug(generateSlug(value));
    if (errors.categoryName) {
      setErrors((prev) => ({ ...prev, categoryName: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!categoryName.trim()) {
      newErrors.categoryName = t.categories.validationRequired;
    } else if (categoryName.trim().length < 3) {
      newErrors.categoryName = t.categories.validationMinLength;
    }

    if (description.length > 500) {
      newErrors.description = 'Maksimal 500 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: CategoryFormData = {
      category_name: categoryName.trim(),
      slug: slug.trim() || generateSlug(categoryName),
      parent_id: parentId,
      type,
      status,
      description: description.trim(),
    };

    onSubmit(data, initialData?.id_category);
  };

  if (!isOpen) return null;

  // Filter available parents (cannot choose self in edit mode)
  const availableParents = categoriesList.filter((cat) => {
    if (isEdit && cat.id_category === initialData?.id_category) {
      return false;
    }
    return cat.parent_id === null; // only root categories as parents for neat hierarchy
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl my-8 rounded-2xl border border-border/80 bg-popover text-popover-foreground shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {isEdit ? t.categories.editCategory : t.categories.addCategory}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {isEdit
                  ? `Mengubah kategori: #${initialData?.id_category}`
                  : 'Buat kategori baru untuk bahan baku, produk, atau menu'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Category Name & Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>{t.categories.colName} *</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                {categoryName.length}/180
              </span>
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={handleNameChange}
              maxLength={180}
              placeholder={t.categories.formNamePlaceholder}
              className={`w-full h-10 px-3 rounded-xl border bg-card text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all ${
                errors.categoryName
                  ? 'border-destructive focus:ring-destructive/30'
                  : 'border-border/70 hover:border-border'
              }`}
            />
            {errors.categoryName && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.categoryName}
              </p>
            )}

            {/* Slug Preview */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-muted-foreground font-mono">
                Slug:
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted/80 text-muted-foreground border border-border/50 truncate max-w-full">
                /{slug || 'nama-kategori'}
              </span>
            </div>
          </div>

          {/* Parent Category & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Parent Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{t.categories.colParent}</span>
              </label>
              <select
                value={parentId ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setParentId(val === '' ? null : Number(val));
                }}
                className="w-full h-10 px-3 rounded-xl border border-border/70 bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all"
              >
                <option value="">{t.categories.rootCategory}</option>
                {availableParents.map((parent) => (
                  <option key={parent.id_category} value={parent.id_category}>
                    📁 {parent.category_name} ({parent.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{t.categories.colStatus}</span>
              </label>
              <div className="grid grid-cols-2 gap-2 h-10 p-1 rounded-xl border border-border/70 bg-muted/30">
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-all ${
                    status === 'active'
                      ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {t.categories.statusActive}
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('inactive')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-all ${
                    status === 'inactive'
                      ? 'bg-card text-muted-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                  {t.categories.statusInactive}
                </button>
              </div>
            </div>
          </div>

          {/* Category Type (Segmented Cards) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{t.categories.colType} *</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Ingredient */}
              <button
                type="button"
                onClick={() => setType('ingredient')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  type === 'ingredient'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-950 dark:text-indigo-200 shadow-xs'
                    : 'border-border/70 bg-card hover:bg-muted/40 text-foreground'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{t.categories.typeIngredient}</span>
                  {type === 'ingredient' && (
                    <Check className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
                  Bahan mentah dapur
                </p>
              </button>

              {/* Menu */}
              <button
                type="button"
                onClick={() => setType('menu')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  type === 'menu'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 shadow-xs'
                    : 'border-border/70 bg-card hover:bg-muted/40 text-foreground'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{t.categories.typeMenu}</span>
                  {type === 'menu' && (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
                  Makanan & minuman
                </p>
              </button>

              {/* Product */}
              <button
                type="button"
                onClick={() => setType('product')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  type === 'product'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-200 shadow-xs'
                    : 'border-border/70 bg-card hover:bg-muted/40 text-foreground'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{t.categories.typeProduct}</span>
                  {type === 'product' && (
                    <Check className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
                  Kemasan & barang jadi
                </p>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>{t.categories.colDescription}</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                {description.length}/500
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder={t.categories.formDescPlaceholder}
              className="w-full px-3 py-2 rounded-xl border border-border/70 bg-card text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-border/70 bg-card hover:bg-accent text-foreground transition-colors disabled:opacity-50"
            >
              {t.categories.btnCancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? t.categories.btnSaving
                  : isEdit
                    ? t.categories.btnUpdate
                    : t.categories.btnSave}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
