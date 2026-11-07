import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { ingredientService } from "@/services/ingredientService";
import { categoryService } from "@/services/categoryService";
import type { Ingredient, Unit, Supplier } from "@/types/ingredient";
import type { Category } from "@/types/category";

interface IngredientDetailPageProps {
  ingredientId?: number;
  onNavigate?: (path: string) => void;
}

export const IngredientDetailPage: React.FC<IngredientDetailPageProps> = ({
  ingredientId,
  onNavigate,
}) => {
  const { t, currentLanguage } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveIngredientId = ingredientId ?? (id ? Number(id) : undefined);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [unitLabel, setUnitLabel] = useState<string>("");
  const [supplierName, setSupplierName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(Boolean(effectiveIngredientId));
  const [error, setError] = useState<string | null>(
    effectiveIngredientId ? null : t.ingredients.emptyTitle,
  );

  useEffect(() => {
    if (!effectiveIngredientId) return;
    let isMounted = true;

    const loadDetail = async () => {
      try {
        const [ingItem, catRes, unitRes, supRes] = await Promise.all([
          ingredientService.getById(effectiveIngredientId),
          categoryService.getAll(),
          ingredientService.getUnits(),
          ingredientService.getSuppliers(),
        ]);

        if (!ingItem) {
          if (isMounted) {
            setError(t.ingredients.emptyTitle);
          }
          return;
        }

        if (isMounted) {
          setIngredient(ingItem);

          // Find Category Name
          const cat = catRes.data.find(
            (c: Category) => c.id_category === ingItem.category_id,
          );
          setCategoryName(cat ? cat.category_name : `Category #${ingItem.category_id}`);

          // Find Unit Label
          const u = unitRes.find((un: Unit) => un.id_unit === ingItem.unit_id);
          setUnitLabel(u ? `${u.unit_name} (${u.unit_code})` : `Unit #${ingItem.unit_id}`);

          // Find Supplier Name
          if (ingItem.supplier_id) {
            const s = supRes.find(
              (sp: Supplier) => sp.id_supplier === ingItem.supplier_id,
            );
            setSupplierName(s ? s.supplier_name : `Supplier #${ingItem.supplier_id}`);
          } else {
            setSupplierName("—");
          }
        }
      } catch {
        if (isMounted) {
          setError(t.ingredients.errorServerGeneric);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [effectiveIngredientId, t.ingredients.emptyTitle, t.ingredients.errorServerGeneric]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getClassificationLabel = (status?: string) => {
    switch (status) {
      case "raw":
        return t.ingredients.rawOption;
      case "semi_finished":
        return t.ingredients.semiFinishedOption;
      case "finished":
        return t.ingredients.finishedOption;
      default:
        return status || "—";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-xs text-muted-foreground">
        <p>{t.ingredients.loadingDetail}</p>
      </div>
    );
  }

  if (error || !ingredient) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
          {error || t.ingredients.emptyTitle}
        </div>
        <button
          type="button"
          onClick={() => handleNavigate("/master/ingredients")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          <span>{t.common.back}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() => handleNavigate("/master/ingredients")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.common.masterData}
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => handleNavigate("/master/ingredients")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.ingredients.title}
        </button>
        <span>/</span>
        <span className="font-semibold text-foreground">
          {t.ingredients.detailTitle}
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {ingredient.ingre_name}
            </h1>
            <span
              className={`text-xs font-bold ${
                ingredient.is_active
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }`}
            >
              • {ingredient.is_active ? t.ingredients.statusActive : t.ingredients.statusInactive}
            </span>
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {t.ingredients.detailIdInfo
              .replace("{id}", String(ingredient.id_ingredient))
              .replace("{code}", ingredient.ingre_code)
              .replace("{sku}", ingredient.sku || "—")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              handleNavigate(`/master/ingredients/edit/${ingredient.id_ingredient}`)
            }
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            {t.ingredients.editIngredient}
          </button>
          <button
            type="button"
            onClick={() => handleNavigate("/master/ingredients")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span>{t.ingredients.btnBack}</span>
          </button>
        </div>
      </div>

      {/* Main Detail Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Informasi Utama & Identifikasi */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
            {t.ingredients.sectionMainInfo}
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.ingredients.labelIngredientName}
              </span>
              <span className="font-semibold text-foreground text-sm">
                {ingredient.ingre_name}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.ingredients.labelCode}
              </span>
              <span className="font-mono text-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/50 inline-block mt-0.5">
                {ingredient.ingre_code}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-muted-foreground block">
                  {t.ingredients.labelSku}
                </span>
                <span className="font-mono text-foreground">
                  {ingredient.sku || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">
                  {t.ingredients.labelBarcode}
                </span>
                <span className="font-mono text-foreground">
                  {ingredient.barcode || "—"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.ingredients.labelStatus}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold mt-0.5 ${
                  ingredient.is_active
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {ingredient.is_active
                  ? t.ingredients.statusActive
                  : t.ingredients.statusInactive}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Klasifikasi & Rekanan */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
            {t.ingredients.sectionRelations}
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.ingredients.labelCategory}
              </span>
              <span className="font-medium text-foreground">
                {categoryName}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.ingredients.labelUnit}
              </span>
              <span className="font-medium text-foreground">
                {unitLabel}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.ingredients.labelSupplier}
              </span>
              <span className="font-medium text-foreground">
                {supplierName}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.ingredients.labelStatusIngredient}
              </span>
              <span className="font-semibold text-foreground">
                {getClassificationLabel(ingredient.status_ingredient)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Manajemen Stok & Biaya */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
            {t.ingredients.sectionStockCost}
          </h2>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-muted-foreground block">
                  {t.ingredients.labelMinStock}
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {ingredient.min_stok}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">
                  {t.ingredients.labelMaxStock}
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {ingredient.max_stok}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-muted-foreground block">
                  {t.ingredients.labelCostPrice}
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {formatCurrency(ingredient.cost_price)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">
                  {t.ingredients.labelAverageCost}
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {formatCurrency(ingredient.average_cost)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Karakteristik & Ketahanan */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
            {t.ingredients.sectionPerishability}
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.ingredients.labelIsPerishable}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold mt-0.5 ${
                  ingredient.is_perishable
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {ingredient.is_perishable
                  ? t.ingredients.perishableYes
                  : t.ingredients.perishableNo}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.ingredients.labelShelfLife}
              </span>
              <span className="font-semibold text-foreground text-sm">
                {ingredient.shelf_life_day} {currentLanguage === "id" ? "Hari" : "Days"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Riwayat Waktu Data (Full width on 2 columns) */}
        <div className="md:col-span-2 rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
            {t.ingredients.sectionTimestamps}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.categories.colCreatedAt}
              </span>
              <span className="font-medium text-foreground">
                {formatDate(ingredient.created_at)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block">
                {t.categories.colUpdatedAt}
              </span>
              <span className="font-medium text-foreground">
                {formatDate(ingredient.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientDetailPage;
