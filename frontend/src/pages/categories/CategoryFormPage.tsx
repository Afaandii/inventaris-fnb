import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { categoryService } from '@/services/categoryService';
import type { Category, CategoryFormData, CategoryType, CategoryStatus } from '@/types/category';
import $ from 'jquery';
import select2Init from 'select2';
import 'select2/dist/css/select2.min.css';

// Ensure jQuery and Select2 are safely registered in browser window
if (typeof window !== 'undefined') {
  (window as unknown as { $: typeof $; jQuery: typeof $ }).$ = $;
  (window as unknown as { $: typeof $; jQuery: typeof $ }).jQuery = $;
  if (typeof select2Init === 'function') {
    (select2Init as unknown as (root: Window, jq: typeof $) => void)(window, $);
  }
}

interface CategoryFormPageProps {
  mode: 'create' | 'edit';
  categoryId?: number;
  onNavigate: (path: string) => void;
  onSuccess?: (message: string) => void;
}

export const CategoryFormPage: React.FC<CategoryFormPageProps> = ({
  mode,
  categoryId,
  onNavigate,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const isEdit = mode === 'edit';

  const [categoryName, setCategoryName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [type, setType] = useState<CategoryType>('ingredient');
  const [status, setStatus] = useState<CategoryStatus>('active');
  const [description, setDescription] = useState('');

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const typeSelectRef = useRef<HTMLSelectElement | null>(null);

  // Helper auto slug generator
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Initialize Select2 on Tipe Kategori
  useEffect(() => {
    if (!typeSelectRef.current) return;
    const $select = $(typeSelectRef.current);

    $select.select2({
      width: '100%',
      minimumResultsForSearch: Infinity,
    });

    $select.on('change', () => {
      const val = $select.val() as CategoryType;
      if (val && (val === 'ingredient' || val === 'menu' || val === 'product')) {
        setType(val);
      }
    });

    return () => {
      if ($select.data('select2')) {
        $select.select2('destroy');
      }
    };
  }, []);

  // Synchronize Select2 value when type state changes
  useEffect(() => {
    if (typeSelectRef.current) {
      const $select = $(typeSelectRef.current);
      if ($select.val() !== type) {
        $select.val(type).trigger('change.select2');
      }
    }
  }, [type]);

  // Load existing categories for parent dropdown and existing category data if edit
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const { data } = await categoryService.getAll();
        if (!isMounted) return;
        setCategoriesList(data);

        if (isEdit && categoryId) {
          const cat = data.find((c) => c.id_category === categoryId);
          if (cat) {
            setCategoryName(cat.category_name);
            setSlug(cat.slug);
            setParentId(cat.parent_id);
            setType(cat.type);
            setStatus(cat.status);
            setDescription(cat.description || '');
          } else {
            // Try fetching single category from backend
            const single = await categoryService.getById(categoryId);
            if (single && isMounted) {
              setCategoryName(single.category_name);
              setSlug(single.slug);
              setParentId(single.parent_id);
              setType(single.type);
              setStatus(single.status);
              setDescription(single.description || '');
            }
          }
        }
      } catch {
        if (isMounted) {
          setServerError('Gagal memuat data dari server.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isEdit, categoryId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCategoryName(val);
    setSlug(generateSlug(val));
    if (errors.categoryName) {
      setErrors((prev) => ({ ...prev, categoryName: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!categoryName.trim()) {
      newErrors.categoryName = 'Nama kategori wajib diisi';
    } else if (categoryName.trim().length < 3) {
      newErrors.categoryName = 'Nama kategori minimal 3 karakter';
    }

    if (description.length > 500) {
      newErrors.description = 'Deskripsi maksimal 500 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    const formData: CategoryFormData = {
      category_name: categoryName.trim(),
      slug: slug.trim() || generateSlug(categoryName),
      parent_id: parentId,
      type,
      status,
      description: description.trim(),
    };

    try {
      if (isEdit && categoryId) {
        await categoryService.update(categoryId, formData);
        if (onSuccess) {
          onSuccess(t.categories.toastUpdateSuccess);
        }
      } else {
        await categoryService.create(formData);
        if (onSuccess) {
          onSuccess(t.categories.toastCreateSuccess);
        }
      }
      onNavigate('/master/categories');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Available parent options: root categories and not self in edit mode
  const parentOptions = useMemo(() => {
    return categoriesList.filter((cat) => {
      if (isEdit && cat.id_category === categoryId) {
        return false;
      }
      return cat.parent_id === null;
    });
  }, [categoriesList, isEdit, categoryId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-xs text-muted-foreground">
        <p>Memuat data formulir...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation (Text-Only) */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() => onNavigate('/master/categories')}
          className="hover:text-foreground transition-colors"
        >
          {t.common.masterData}
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => onNavigate('/master/categories')}
          className="hover:text-foreground transition-colors"
        >
          {t.categories.title}
        </button>
        <span>/</span>
        <span className="font-semibold text-foreground">
          {isEdit ? t.categories.editCategory : t.categories.addCategory}
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? t.categories.editCategory : t.categories.addCategory}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isEdit
              ? `Perbarui rincian kategori #${categoryId} di bawah ini.`
              : 'Isi formulir di bawah ini untuk menambahkan kategori baru ke sistem inventaris.'}
          </p>
        </div>

        {/* Back Button with Arrow Left */}
        <button
          type="button"
          onClick={() => onNavigate('/master/categories')}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all group"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span>Kembali</span>
        </button>
      </div>

      {/* Server Error Message */}
      {serverError && (
        <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
          {serverError}
        </div>
      )}

      {/* Main Form Container (Card Minimalist) */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xs space-y-6"
      >
        {/* Field 1: Nama Kategori */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">
              Nama Kategori *
            </label>
            <span className="text-[10px] text-muted-foreground">
              {categoryName.length}/180
            </span>
          </div>
          <input
            type="text"
            value={categoryName}
            onChange={handleNameChange}
            maxLength={180}
            placeholder={t.categories.formNamePlaceholder}
            className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all ${
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
        </div>

        {/* Field 2: Slug (Readonly Input with Label "Slug") */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Slug
          </label>
          <input
            type="text"
            readOnly
            value={slug}
            placeholder="slug-kategori"
            className="w-full h-10 px-3.5 rounded-xl border border-border/70 bg-muted/40 text-muted-foreground text-xs font-mono cursor-not-allowed outline-none select-none"
          />
          <p className="text-[10px] text-muted-foreground">
            Dihasilkan secara otomatis dari nama kategori untuk pengalamatan URL.
          </p>
        </div>

        {/* Field 3 & 4: Kategori Induk & Tipe Kategori (2 Columns on Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Kategori Induk */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Kategori Induk
            </label>
            <select
              value={parentId ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setParentId(val === '' ? null : Number(val));
              }}
              className="w-full h-10 px-3.5 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all cursor-pointer"
            >
              <option value="">Root (Kategori Utama / Tanpa Induk)</option>
              {parentOptions.map((parent) => (
                <option key={parent.id_category} value={parent.id_category}>
                  {parent.category_name} ({parent.type})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground">
              Pilih kategori induk jika kategori ini merupakan sub-kategori.
            </p>
          </div>

          {/* Tipe Kategori (Select2 Dropdown) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Tipe Kategori *
            </label>
            <select
              ref={typeSelectRef}
              defaultValue={type}
              className="w-full"
            >
              <option value="ingredient">{t.categories.typeIngredient} — Bahan Baku / Mentah</option>
              <option value="menu">{t.categories.typeMenu} — Hidangan Menu Makanan / Minuman</option>
              <option value="product">{t.categories.typeProduct} — Kemasan, Barang Jadi & Merchandise</option>
            </select>
            <p className="text-[10px] text-muted-foreground">
              Pilih jenis klasifikasi untuk kategori inventaris ini.
            </p>
          </div>
        </div>

        {/* Field 5: Deskripsi Kategori */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">
              Deskripsi Kategori
            </label>
            <span className="text-[10px] text-muted-foreground">
              {description.length}/500
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder={t.categories.formDescPlaceholder}
            className="w-full p-3 rounded-xl border border-border/70 bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none transition-all"
          />
        </div>

        {/* Field 6: Status Kategori (12 columns / Full Width, below Deskripsi) */}
        <div className="space-y-1.5 w-full">
          <label className="text-xs font-semibold text-foreground">
            Status Kategori *
          </label>
          <div className="grid grid-cols-2 gap-2 h-10 p-1 rounded-xl border border-border/70 bg-muted/30 w-full">
            <button
              type="button"
              onClick={() => setStatus('active')}
              className={`flex items-center justify-center rounded-lg text-xs transition-all ${
                status === 'active'
                  ? 'bg-card text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              Aktif
            </button>
            <button
              type="button"
              onClick={() => setStatus('inactive')}
              className={`flex items-center justify-center rounded-lg text-xs transition-all ${
                status === 'inactive'
                  ? 'bg-card text-foreground font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              Nonaktif
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Kategori nonaktif tidak akan muncul di opsi penginputan transaksi.
          </p>
        </div>

        {/* Action Buttons (Left unchanged as requested) */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={() => onNavigate('/master/categories')}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting
              ? 'Menyimpan...'
              : isEdit
                ? 'Simpan Perubahan'
                : 'Simpan Kategori'}
          </button>
        </div>
      </form>
    </div>
  );
};
