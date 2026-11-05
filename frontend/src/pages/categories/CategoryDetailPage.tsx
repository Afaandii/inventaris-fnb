import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";

interface CategoryDetailPageProps {
  categoryId?: number;
  onNavigate?: (path: string) => void;
}

export const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({
  categoryId,
  onNavigate,
}) => {
  const { t, currentLanguage } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveCategoryId = categoryId ?? (id ? Number(id) : undefined);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const [category, setCategory] = useState<Category | null>(null);
  const [parentName, setParentName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(Boolean(effectiveCategoryId));
  const [error, setError] = useState<string | null>(
    effectiveCategoryId ? null : t.categories.detailNotFound,
  );

  useEffect(() => {
    if (!effectiveCategoryId) return;
    let isMounted = true;

    const loadCategory = async () => {
      try {
        const { data: allCats } = await categoryService.getAll();
        const found = allCats.find((c) => c.id_category === effectiveCategoryId);

        if (found) {
          if (isMounted) {
            setCategory(found);
            if (found.parent_id) {
              const p = allCats.find((c) => c.id_category === found.parent_id);
              if (p) setParentName(p.category_name);
              else setParentName(t.categories.parentRootOption);
            } else {
              setParentName(t.categories.parentRootOption);
            }
          }
        } else {
          const single = await categoryService.getById(effectiveCategoryId);
          if (single && isMounted) {
            setCategory(single);
            if (single.parent_id) {
              const p = allCats.find((c) => c.id_category === single.parent_id);
              if (p) setParentName(p.category_name);
              else setParentName(t.categories.parentRootOption);
            } else {
              setParentName(t.categories.parentRootOption);
            }
          } else if (isMounted) {
            setError(t.categories.detailNotFound);
          }
        }
      } catch {
        if (isMounted) {
          setError(t.categories.detailLoadError);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCategory();

    return () => {
      isMounted = false;
    };
  }, [effectiveCategoryId, t.categories.detailNotFound, t.categories.detailLoadError, t.categories.parentRootOption]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—";
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat(
        currentLanguage === "id" ? "id-ID" : "en-US",
        {
          dateStyle: "full",
          timeStyle: "medium",
        },
      ).format(date);
    } catch {
      return isoString;
    }
  };

  const getTypeText = (type?: Category["type"]) => {
    switch (type) {
      case "ingredient":
        return t.categories.typeIngredient;
      case "menu":
        return t.categories.typeMenu;
      case "product":
        return t.categories.typeProduct;
      default:
        return "—";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-xs text-muted-foreground">
        <p>{t.categories.loadingDetail}</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
          {error || t.categories.detailNotFound}
        </div>
        <button
          type="button"
          onClick={() => handleNavigate("/master/categories")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          <span>{t.categories.btnBack}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation (Text-Only) */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() => handleNavigate("/master/categories")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.common.masterData}
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => handleNavigate("/master/categories")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.categories.title}
        </button>
        <span>/</span>
        <span className="font-semibold text-foreground">
          {t.categories.detailTitle}
        </span>
      </div>

      {/* Page Header (Text-Only) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {category.category_name}
            </h1>
            <span
              className={`text-xs font-bold ${
                category.status === "active"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }`}
            >
              • {category.status === "active" ? t.categories.statusActive : t.categories.statusInactive}
            </span>
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {t.categories.detailIdInfo
              .replace("{id}", String(category.id_category))
              .replace("{slug}", category.slug)}
          </p>
        </div>

        {/* Text Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              handleNavigate(`/master/categories/edit/${category.id_category}`)
            }
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            {t.categories.btnEditData}
          </button>
          <button
            type="button"
            onClick={() => handleNavigate("/master/categories")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span>{t.categories.btnBack}</span>
          </button>
        </div>
      </div>

      {/* Main Detail Cards Grid (2 Columns on Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Informasi Utama */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
            {t.categories.sectionMainInfo}
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.categories.labelCategoryName}
              </span>
              <span className="font-semibold text-foreground text-sm">
                {category.category_name}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.categories.colSlug}
              </span>
              <span className="font-mono text-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/50 inline-block mt-0.5">
                /{category.slug}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.categories.colSystemId}
              </span>
              <span className="font-mono text-foreground font-semibold">
                {category.id_category}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Klasifikasi & Relasi */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
            {t.categories.sectionClassification}
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.categories.labelType}
              </span>
              <span className="font-semibold text-foreground">
                {getTypeText(category.type)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.categories.labelParent}
              </span>
              <span className="font-semibold text-foreground">
                {parentName}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.categories.colOperationalStatus}
              </span>
              <span
                className={`font-semibold ${
                  category.status === "active"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                }`}
              >
                {category.status === "active"
                  ? t.categories.statusActive
                  : t.categories.statusInactive}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Deskripsi Kategori (Full width on md) */}
        <div className="md:col-span-2 rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-3 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
            {t.categories.sectionDescription}
          </h2>

          <p className="text-xs text-foreground/90 leading-relaxed">
            {category.description || t.categories.noDescription}
          </p>
        </div>

        {/* Card 4: Riwayat Tanggal (Full width on md) */}
        <div className="md:col-span-2 rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-3 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
            {t.categories.sectionTimestamps}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.categories.colCreatedAt}
              </span>
              <span className="text-foreground font-medium">
                {formatDate(category.created_at)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.categories.colUpdatedAt}
              </span>
              <span className="text-foreground font-medium">
                {formatDate(category.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
