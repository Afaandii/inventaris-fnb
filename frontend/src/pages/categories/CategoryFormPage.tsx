import React, { useState, useEffect, useMemo, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { categoryService } from "@/services/categoryService";
import type {
  Category,
  CategoryFormData,
  CategoryType,
  CategoryStatus,
} from "@/types/category";
import $ from "jquery";

interface CategoryFormPageProps {
  mode: "create" | "edit";
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
  const isEdit = mode === "edit";

  const [categoryName, setCategoryName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [type, setType] = useState<CategoryType>("ingredient");
  const [status, setStatus] = useState<CategoryStatus>("active");
  const [description, setDescription] = useState("");

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const parentSelectRef = useRef<HTMLSelectElement | null>(null);
  const typeSelectRef = useRef<HTMLSelectElement | null>(null);

  // Helper auto slug generator
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Helper to obtain global jQuery instance with Select2 attached
  const getJQuery = () => {
    if (typeof window !== "undefined") {
      const win = window as unknown as { jQuery?: typeof $; $?: typeof $ };
      return win.jQuery || win.$ || $;
    }
    return $;
  };

  // Initialize Select2 on both Kategori Induk and Tipe Kategori
  useEffect(() => {
    if (isLoading) return;

    let destroyed = false;

    const initSelects = () => {
      const jq = getJQuery();
      if (!jq || !jq.fn || !jq.fn.select2) {
        return false;
      }

      // 1. Kategori Induk Select2 (12-column full width with search input)
      if (parentSelectRef.current && !destroyed) {
        const $parent = jq(parentSelectRef.current);
        if ($parent.data("select2")) {
          $parent.select2("destroy");
        }
        $parent.select2({
          width: "100%",
          placeholder: "Pilih Kategori Induk",
          allowClear: true,
          minimumResultsForSearch: 0, // Always show the search input inside dropdown
        });

        $parent.off("change.cat_sync").on("change.cat_sync", () => {
          const val = $parent.val();
          setParentId(
            val === "" || val === null || val === undefined
              ? null
              : Number(val),
          );
        });
      }

      // 2. Tipe Kategori Select2 (12-column full width with search input)
      if (typeSelectRef.current && !destroyed) {
        const $type = jq(typeSelectRef.current);
        if ($type.data("select2")) {
          $type.select2("destroy");
        }
        $type.select2({
          width: "100%",
          placeholder: "Pilih Tipe Kategori",
          minimumResultsForSearch: 0, // Always show the search input inside dropdown
        });

        $type.off("change.cat_sync").on("change.cat_sync", () => {
          const val = $type.val() as CategoryType;
          if (
            val &&
            (val === "ingredient" || val === "menu" || val === "product")
          ) {
            setType(val);
          }
        });
      }

      return true;
    };

    if (!initSelects()) {
      const interval = setInterval(() => {
        if (initSelects()) {
          clearInterval(interval);
        }
      }, 50);
      return () => {
        destroyed = true;
        clearInterval(interval);
      };
    }

    const parentEl = parentSelectRef.current;
    const typeEl = typeSelectRef.current;

    return () => {
      destroyed = true;
      const jq = getJQuery();
      if (jq && jq.fn && jq.fn.select2) {
        if (parentEl && jq(parentEl).data("select2")) {
          jq(parentEl).select2("destroy");
        }
        if (typeEl && jq(typeEl).data("select2")) {
          jq(typeEl).select2("destroy");
        }
      }
    };
  }, [isLoading, categoriesList]);

  // Synchronize parentId state to Select2
  useEffect(() => {
    if (isLoading || !parentSelectRef.current) return;
    const jq = getJQuery();
    if (!jq || !jq.fn || !jq.fn.select2) return;
    const $parent = jq(parentSelectRef.current);
    if ($parent.data("select2")) {
      const currentVal = $parent.val();
      const targetVal = parentId === null ? "" : String(parentId);
      if (currentVal !== targetVal) {
        $parent.val(targetVal).trigger("change.select2");
      }
    }
  }, [parentId, isLoading]);

  // Synchronize type state to Select2
  useEffect(() => {
    if (isLoading || !typeSelectRef.current) return;
    const jq = getJQuery();
    if (!jq || !jq.fn || !jq.fn.select2) return;
    const $type = jq(typeSelectRef.current);
    if ($type.data("select2")) {
      const currentVal = $type.val();
      if (currentVal !== type) {
        $type.val(type).trigger("change.select2");
      }
    }
  }, [type, isLoading]);

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
            setDescription(cat.description || "");
          } else {
            // Try fetching single category from backend
            const single = await categoryService.getById(categoryId);
            if (single && isMounted) {
              setCategoryName(single.category_name);
              setSlug(single.slug);
              setParentId(single.parent_id);
              setType(single.type);
              setStatus(single.status);
              setDescription(single.description || "");
            }
          }
        }
      } catch {
        if (isMounted) {
          setServerError("Gagal memuat data dari server.");
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
      setErrors((prev) => ({ ...prev, categoryName: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!categoryName.trim()) {
      newErrors.categoryName = "Nama kategori wajib diisi";
    } else if (categoryName.trim().length < 3) {
      newErrors.categoryName = "Nama kategori minimal 3 karakter";
    }

    if (description.length > 500) {
      newErrors.description = "Deskripsi maksimal 500 karakter";
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
      onNavigate("/master/categories");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan data";
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
          onClick={() => onNavigate("/master/categories")}
          className="hover:text-foreground transition-colors"
        >
          {t.common.masterData}
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => onNavigate("/master/categories")}
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
              : "Isi formulir di bawah ini untuk menambahkan kategori baru ke sistem inventaris."}
          </p>
        </div>

        {/* Back Button with Arrow Left */}
        <button
          type="button"
          onClick={() => onNavigate("/master/categories")}
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
        {/* Field 1: Nama Kategori (12 Columns / Full Width) */}
        <div className="space-y-1.5 w-full">
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
            className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all ${
              errors.categoryName
                ? "border-destructive focus:ring-destructive/30"
                : "border-border/70 hover:border-border"
            }`}
          />
          {errors.categoryName && (
            <p className="text-[11px] text-destructive font-medium">
              {errors.categoryName}
            </p>
          )}
        </div>

        {/* Field 2: Slug (12 Columns / Full Width Readonly Input) */}
        <div className="space-y-1.5 w-full">
          <label className="text-xs font-semibold text-foreground">Slug</label>
          <input
            type="text"
            readOnly
            value={slug}
            placeholder="slug-kategori"
            className="w-full h-10 px-3.5 rounded-xl border border-border/70 bg-muted/40 text-muted-foreground text-xs font-mono cursor-not-allowed outline-none select-none"
          />
        </div>

        {/* Field 3: Kategori Induk (12 Columns / Full Width with Select2) */}
        <div className="space-y-1.5 w-full">
          <label className="text-xs font-semibold text-foreground">
            Kategori Induk
          </label>
          <select
            ref={parentSelectRef}
            value={parentId ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setParentId(val === "" ? null : Number(val));
            }}
            className="w-full"
          >
            <option value="">Root (Kategori Utama / Tanpa Induk)</option>
            {parentOptions.map((parent) => (
              <option key={parent.id_category} value={parent.id_category}>
                {parent.category_name} ({parent.type})
              </option>
            ))}
          </select>
        </div>

        {/* Field 4: Tipe Kategori (12 Columns / Full Width with Select2) */}
        <div className="space-y-1.5 w-full">
          <label className="text-xs font-semibold text-foreground">
            Tipe Kategori *
          </label>
          <select
            ref={typeSelectRef}
            value={type}
            onChange={(e) => {
              setType(e.target.value as CategoryType);
            }}
            className="w-full"
          >
            <option value="ingredient">
              {t.categories.typeIngredient} — Bahan Baku / Mentah
            </option>
            <option value="menu">
              {t.categories.typeMenu} — Hidangan Menu Makanan / Minuman
            </option>
            <option value="product">
              {t.categories.typeProduct} — Kemasan, Barang Jadi & Merchandise
            </option>
          </select>
        </div>

        {/* Field 5: Deskripsi Kategori (12 Columns / Full Width) */}
        <div className="space-y-1.5 w-full">
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
            rows={5}
            className="w-full p-3 rounded-xl border border-border/70 bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none transition-all"
          />
        </div>

        {/* Field 6: Status Kategori (12 Columns / Full Width, below Deskripsi) */}
        <div className="space-y-1.5 w-full">
          <label className="text-xs font-semibold text-foreground">
            Status Kategori *
          </label>
          <div className="grid grid-cols-2 gap-2 h-10 p-1 rounded-xl border border-border/70 bg-muted/30 w-full">
            <button
              type="button"
              onClick={() => setStatus("active")}
              className={`flex items-center justify-center rounded-lg text-xs transition-all ${
                status === "active"
                  ? "bg-card text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              Aktif
            </button>
            <button
              type="button"
              onClick={() => setStatus("inactive")}
              className={`flex items-center justify-center rounded-lg text-xs transition-all ${
                status === "inactive"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              Nonaktif
            </button>
          </div>
        </div>

        {/* Action Buttons (Left unchanged as requested) */}
        <div className="flex items-center justify-between gap-3 pt-4 border-border/60">
          <button
            type="button"
            onClick={() => onNavigate("/master/categories")}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all disabled:opacity-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? "Menyimpan..."
              : isEdit
                ? "Simpan Perubahan"
                : "Simpan Kategori"}
          </button>
        </div>
      </form>
    </div>
  );
};
