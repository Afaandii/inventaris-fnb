import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { ingredientService } from "@/services/ingredientService";
import { categoryService } from "@/services/categoryService";
import type {
  IngredientFormData,
  Unit,
  Supplier,
} from "@/types/ingredient";
import type { Category } from "@/types/category";
import $ from "jquery";

interface IngredientFormPageProps {
  mode: "create" | "edit";
  ingredientId?: number;
  onNavigate?: (path: string) => void;
  onSuccess?: (message: string) => void;
}

export const IngredientFormPage: React.FC<IngredientFormPageProps> = ({
  mode,
  ingredientId,
  onNavigate,
  onSuccess,
}) => {
  const { t, currentLanguage } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveIngredientId = ingredientId ?? (id ? Number(id) : undefined);
  const isEdit = mode === "edit";

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  // Form Fields State
  const [ingreName, setIngreName] = useState("");
  const [ingreCode, setIngreCode] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [minStok, setMinStok] = useState<number>(0);
  const [maxStok, setMaxStok] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [averageCost, setAverageCost] = useState<number>(0);
  const [isPerishable, setIsPerishable] = useState<boolean>(false);
  const [shelfLifeDay, setShelfLifeDay] = useState<number>(0);
  const [statusIngredient, setStatusIngredient] = useState<string>("raw");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Reference data state
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [unitsList, setUnitsList] = useState<Unit[]>([]);
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Select2 DOM references
  const categorySelectRef = useRef<HTMLSelectElement | null>(null);
  const unitSelectRef = useRef<HTMLSelectElement | null>(null);
  const supplierSelectRef = useRef<HTMLSelectElement | null>(null);
  const statusIngredientSelectRef = useRef<HTMLSelectElement | null>(null);

  // Helper to obtain global jQuery instance
  const getJQuery = () => {
    if (typeof window !== "undefined") {
      const win = window as unknown as { jQuery?: typeof $; $?: typeof $ };
      return win.jQuery || win.$ || $;
    }
    return $;
  };

  // Initialize Select2 dropdowns
  useEffect(() => {
    if (isLoading) return;

    let destroyed = false;

    const initSelects = () => {
      const jq = getJQuery();
      if (!jq || !jq.fn || !jq.fn.select2) {
        return false;
      }

      // 1. Category Select2
      if (categorySelectRef.current && !destroyed) {
        const $cat = jq(categorySelectRef.current);
        if ($cat.data("select2")) {
          $cat.select2("destroy");
        }
        $cat.select2({
          width: "100%",
          placeholder: t.ingredients.categoryPlaceholder,
          allowClear: true,
          minimumResultsForSearch: 0,
        });

        $cat.off("change.ing_sync").on("change.ing_sync", () => {
          const val = $cat.val();
          setCategoryId(
            val === "" || val === null || val === undefined ? null : Number(val),
          );
        });
      }

      // 2. Unit Select2
      if (unitSelectRef.current && !destroyed) {
        const $unit = jq(unitSelectRef.current);
        if ($unit.data("select2")) {
          $unit.select2("destroy");
        }
        $unit.select2({
          width: "100%",
          placeholder: t.ingredients.unitPlaceholder,
          allowClear: true,
          minimumResultsForSearch: 0,
        });

        $unit.off("change.ing_sync").on("change.ing_sync", () => {
          const val = $unit.val();
          setUnitId(
            val === "" || val === null || val === undefined ? null : Number(val),
          );
        });
      }

      // 3. Supplier Select2
      if (supplierSelectRef.current && !destroyed) {
        const $sup = jq(supplierSelectRef.current);
        if ($sup.data("select2")) {
          $sup.select2("destroy");
        }
        $sup.select2({
          width: "100%",
          placeholder: t.ingredients.supplierPlaceholder,
          allowClear: true,
          minimumResultsForSearch: 0,
        });

        $sup.off("change.ing_sync").on("change.ing_sync", () => {
          const val = $sup.val();
          setSupplierId(
            val === "" || val === null || val === undefined ? null : Number(val),
          );
        });
      }

      // 4. Status Ingredient Select2
      if (statusIngredientSelectRef.current && !destroyed) {
        const $stat = jq(statusIngredientSelectRef.current);
        if ($stat.data("select2")) {
          $stat.select2("destroy");
        }
        $stat.select2({
          width: "100%",
          placeholder: t.ingredients.statusIngredientPlaceholder,
          minimumResultsForSearch: 0,
        });

        $stat.off("change.ing_sync").on("change.ing_sync", () => {
          const val = $stat.val();
          if (val) {
            setStatusIngredient(String(val));
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

    const catEl = categorySelectRef.current;
    const unitEl = unitSelectRef.current;
    const supEl = supplierSelectRef.current;
    const statEl = statusIngredientSelectRef.current;

    return () => {
      destroyed = true;
      const jq = getJQuery();
      if (jq && jq.fn && jq.fn.select2) {
        if (catEl && jq(catEl).data("select2")) jq(catEl).select2("destroy");
        if (unitEl && jq(unitEl).data("select2")) jq(unitEl).select2("destroy");
        if (supEl && jq(supEl).data("select2")) jq(supEl).select2("destroy");
        if (statEl && jq(statEl).data("select2")) jq(statEl).select2("destroy");
      }
    };
  }, [
    isLoading,
    categoriesList,
    unitsList,
    suppliersList,
    currentLanguage,
    t.ingredients.categoryPlaceholder,
    t.ingredients.unitPlaceholder,
    t.ingredients.supplierPlaceholder,
    t.ingredients.statusIngredientPlaceholder,
  ]);

  // Synchronize categoryId state to Select2
  useEffect(() => {
    if (isLoading || !categorySelectRef.current) return;
    const jq = getJQuery();
    if (!jq || !jq.fn || !jq.fn.select2) return;
    const $cat = jq(categorySelectRef.current);
    if ($cat.data("select2")) {
      const currentVal = $cat.val();
      const targetVal = categoryId === null ? "" : String(categoryId);
      if (currentVal !== targetVal) {
        $cat.val(targetVal).trigger("change.select2");
      }
    }
  }, [categoryId, isLoading]);

  // Synchronize unitId state to Select2
  useEffect(() => {
    if (isLoading || !unitSelectRef.current) return;
    const jq = getJQuery();
    if (!jq || !jq.fn || !jq.fn.select2) return;
    const $unit = jq(unitSelectRef.current);
    if ($unit.data("select2")) {
      const currentVal = $unit.val();
      const targetVal = unitId === null ? "" : String(unitId);
      if (currentVal !== targetVal) {
        $unit.val(targetVal).trigger("change.select2");
      }
    }
  }, [unitId, isLoading]);

  // Synchronize supplierId state to Select2
  useEffect(() => {
    if (isLoading || !supplierSelectRef.current) return;
    const jq = getJQuery();
    if (!jq || !jq.fn || !jq.fn.select2) return;
    const $sup = jq(supplierSelectRef.current);
    if ($sup.data("select2")) {
      const currentVal = $sup.val();
      const targetVal = supplierId === null ? "" : String(supplierId);
      if (currentVal !== targetVal) {
        $sup.val(targetVal).trigger("change.select2");
      }
    }
  }, [supplierId, isLoading]);

  // Synchronize statusIngredient state to Select2
  useEffect(() => {
    if (isLoading || !statusIngredientSelectRef.current) return;
    const jq = getJQuery();
    if (!jq || !jq.fn || !jq.fn.select2) return;
    const $stat = jq(statusIngredientSelectRef.current);
    if ($stat.data("select2")) {
      const currentVal = $stat.val();
      if (currentVal !== statusIngredient) {
        $stat.val(statusIngredient).trigger("change.select2");
      }
    }
  }, [statusIngredient, isLoading]);

  // Load initial dropdown options & existing ingredient data if edit
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [catRes, unitRes, supRes] = await Promise.all([
          categoryService.getAll(),
          ingredientService.getUnits(),
          ingredientService.getSuppliers(),
        ]);

        if (!isMounted) return;
        setCategoriesList(catRes.data);
        setUnitsList(unitRes);
        setSuppliersList(supRes);

        if (isEdit && effectiveIngredientId) {
          const item = await ingredientService.getById(effectiveIngredientId);
          if (item && isMounted) {
            setIngreName(item.ingre_name);
            setIngreCode(item.ingre_code);
            setCategoryId(item.category_id);
            setUnitId(item.unit_id);
            setSupplierId(item.supplier_id ?? null);
            setSku(item.sku || "");
            setBarcode(item.barcode || "");
            setMinStok(item.min_stok);
            setMaxStok(item.max_stok);
            setCostPrice(item.cost_price);
            setAverageCost(item.average_cost);
            setIsPerishable(item.is_perishable);
            setShelfLifeDay(item.shelf_life_day);
            setStatusIngredient(item.status_ingredient || "raw");
            setIsActive(item.is_active);
          }
        }
      } catch {
        if (isMounted) {
          setServerError(t.ingredients.errorServerGeneric);
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
  }, [isEdit, effectiveIngredientId, t.ingredients.errorServerGeneric]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!ingreName.trim()) {
      newErrors.ingreName = t.ingredients.validationNameRequired;
    } else if (ingreName.trim().length < 3) {
      newErrors.ingreName = t.ingredients.validationNameMin;
    }

    if (!categoryId) {
      newErrors.categoryId = t.ingredients.validationCategoryRequired;
    }

    if (!unitId) {
      newErrors.unitId = t.ingredients.validationUnitRequired;
    }

    if (minStok < 0) {
      newErrors.minStok = t.ingredients.validationMinStockRequired;
    }

    if (maxStok > 0 && maxStok < minStok) {
      newErrors.maxStok = t.ingredients.validationMaxStockRequired;
    }

    if (costPrice < 0) {
      newErrors.costPrice = t.ingredients.validationCostRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    const formData: IngredientFormData = {
      category_id: categoryId!,
      unit_id: unitId!,
      supplier_id: supplierId,
      ingre_name: ingreName.trim(),
      sku: sku.trim(),
      barcode: barcode.trim(),
      min_stok: Number(minStok) || 0,
      max_stok: Number(maxStok) || 0,
      cost_price: Number(costPrice) || 0,
      average_cost: Number(averageCost) || 0,
      is_perishable: isPerishable,
      shelf_life_day: Number(shelfLifeDay) || 0,
      status_ingredient: statusIngredient,
      is_active: isActive,
    };

    try {
      if (isEdit && effectiveIngredientId) {
        await ingredientService.update(effectiveIngredientId, formData);
        if (onSuccess) {
          onSuccess(t.ingredients.toastUpdateSuccess);
        }
      } else {
        await ingredientService.create(formData);
        if (onSuccess) {
          onSuccess(t.ingredients.toastCreateSuccess);
        }
      }
      handleNavigate("/master/ingredients");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : t.ingredients.errorSaveGeneric;
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-xs text-muted-foreground">
        <p>{t.ingredients.loadingForm}</p>
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
          {isEdit ? t.ingredients.editIngredient : t.ingredients.addIngredient}
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-border/60 pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? t.ingredients.editIngredient : t.ingredients.addIngredient}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isEdit
              ? t.ingredients.editSubtitle.replace(
                  "{id}",
                  String(effectiveIngredientId ?? ""),
                )
              : t.ingredients.createSubtitle}
          </p>
        </div>

        {/* Back Button with Arrow Left */}
        <button
          type="button"
          onClick={() => handleNavigate("/master/ingredients")}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-6 py-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span>{t.ingredients.btnBack}</span>
        </button>
      </div>

      {/* Server Error Message */}
      {serverError && (
        <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
          {serverError}
        </div>
      )}

      {/* Main Form Container */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xs space-y-6"
      >
        {/* Field 1: Nama Bahan Baku (12 Columns / Full Width) */}
        <div className="space-y-1.5 w-full">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">
              {t.ingredients.labelIngredientName} *
            </label>
            <span className="text-[10px] text-muted-foreground">
              {ingreName.length}/120
            </span>
          </div>
          <input
            type="text"
            value={ingreName}
            onChange={(e) => {
              setIngreName(e.target.value);
              if (errors.ingreName) {
                setErrors((prev) => ({ ...prev, ingreName: "" }));
              }
            }}
            placeholder={t.ingredients.formNamePlaceholder}
            maxLength={120}
            className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all ${
              errors.ingreName
                ? "border-destructive focus:ring-destructive/30"
                : "border-border/70 hover:border-border"
            }`}
          />
          {errors.ingreName && (
            <p className="text-[11px] text-destructive font-medium">
              {errors.ingreName}
            </p>
          )}
        </div>

        {/* Field 2: Kode Bahan Baku (12 Columns / Full Width Readonly Input) */}
        <div className="space-y-1.5 w-full">
          <label className="text-xs font-semibold text-foreground">
            {t.ingredients.labelCode}
          </label>
          <input
            type="text"
            readOnly
            value={ingreCode || (isEdit ? "" : "Otomatis oleh sistem")}
            className="w-full h-10 px-3.5 rounded-xl border border-border/70 bg-muted/40 text-muted-foreground text-xs font-mono cursor-not-allowed outline-none select-none"
          />
          <p className="text-[11px] text-muted-foreground">
            {t.ingredients.codeHelp}
          </p>
        </div>

        {/* Field 3: Kategori Bahan (12 Columns / Full Width with Select2) */}
        <div className="space-y-1.5 w-full">
          <label className="text-xs font-semibold text-foreground">
            {t.ingredients.labelCategory} *
          </label>
          <select
            ref={categorySelectRef}
            value={categoryId ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setCategoryId(val === "" ? null : Number(val));
              if (errors.categoryId) {
                setErrors((prev) => ({ ...prev, categoryId: "" }));
              }
            }}
            className="w-full"
          >
            <option value="">{t.ingredients.categoryPlaceholder}</option>
            {categoriesList.map((cat) => (
              <option key={cat.id_category} value={cat.id_category}>
                {cat.category_name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-[11px] text-destructive font-medium">
              {errors.categoryId}
            </p>
          )}
        </div>

        {/* Field 4: Satuan Ukuran / Unit (12 Columns / Full Width with Select2) */}
        <div className="space-y-1.5 w-full">
          <label className="text-xs font-semibold text-foreground">
            {t.ingredients.labelUnit} *
          </label>
          <select
            ref={unitSelectRef}
            value={unitId ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setUnitId(val === "" ? null : Number(val));
              if (errors.unitId) {
                setErrors((prev) => ({ ...prev, unitId: "" }));
              }
            }}
            className="w-full"
          >
            <option value="">{t.ingredients.unitPlaceholder}</option>
            {unitsList.map((unit) => (
              <option key={unit.id_unit} value={unit.id_unit}>
                {unit.unit_name} ({unit.unit_code})
              </option>
            ))}
          </select>
          {errors.unitId && (
            <p className="text-[11px] text-destructive font-medium">
              {errors.unitId}
            </p>
          )}
        </div>

        {/* Field 5: Pemasok Utama / Supplier (12 Columns / Full Width with Select2) */}
        <div className="space-y-1.5 w-full">
          <label className="text-xs font-semibold text-foreground">
            {t.ingredients.labelSupplier}
          </label>
          <select
            ref={supplierSelectRef}
            value={supplierId ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setSupplierId(val === "" ? null : Number(val));
            }}
            className="w-full"
          >
            <option value="">{t.ingredients.supplierPlaceholder}</option>
            {suppliersList.map((sup) => (
              <option key={sup.id_supplier} value={sup.id_supplier}>
                {sup.supplier_name}
              </option>
            ))}
          </select>
        </div>

        {/* Field 6 & 7: SKU & Barcode (2 Columns on sm+, 1 Column on Mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.ingredients.labelSku}
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder={t.ingredients.formSkuPlaceholder}
              maxLength={60}
              className="w-full h-10 px-3.5 rounded-xl border border-border/70 bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all hover:border-border"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.ingredients.labelBarcode}
            </label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder={t.ingredients.formBarcodePlaceholder}
              maxLength={80}
              className="w-full h-10 px-3.5 rounded-xl border border-border/70 bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all hover:border-border"
            />
          </div>
        </div>

        {/* Field 8 & 9: Batas Stok Minimum & Maksimum */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.ingredients.labelMinStock}
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={minStok}
              onChange={(e) => setMinStok(parseFloat(e.target.value) || 0)}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all ${
                errors.minStok
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 hover:border-border"
              }`}
            />
            {errors.minStok && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.minStok}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.ingredients.labelMaxStock}
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={maxStok}
              onChange={(e) => setMaxStok(parseFloat(e.target.value) || 0)}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all ${
                errors.maxStok
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 hover:border-border"
              }`}
            />
            {errors.maxStok && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.maxStok}
              </p>
            )}
          </div>
        </div>

        {/* Field 10 & 11: Harga Beli & Biaya Rata-Rata (COGS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.ingredients.labelCostPrice}
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={costPrice}
              onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all ${
                errors.costPrice
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 hover:border-border"
              }`}
            />
            {errors.costPrice && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.costPrice}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.ingredients.labelAverageCost}
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={averageCost}
              onChange={(e) => setAverageCost(parseFloat(e.target.value) || 0)}
              className="w-full h-10 px-3.5 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all hover:border-border"
            />
          </div>
        </div>

        {/* Field 12 & 13: Perishable Flag & Shelf Life Days */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.ingredients.labelIsPerishable}
            </label>
            <div className="grid grid-cols-2 gap-2 h-10 p-1 rounded-xl border border-border/70 bg-muted/30 w-full">
              <button
                type="button"
                onClick={() => setIsPerishable(false)}
                className={`flex items-center justify-center rounded-lg text-xs transition-all ${
                  !isPerishable
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                {t.ingredients.perishableNo}
              </button>
              <button
                type="button"
                onClick={() => setIsPerishable(true)}
                className={`flex items-center justify-center rounded-lg text-xs transition-all ${
                  isPerishable
                    ? "bg-card text-amber-600 dark:text-amber-400 font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                {t.ingredients.perishableYes}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t.ingredients.perishableHelp}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.ingredients.labelShelfLife}
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={shelfLifeDay}
              onChange={(e) => setShelfLifeDay(parseInt(e.target.value, 10) || 0)}
              className="w-full h-10 px-3.5 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all hover:border-border"
            />
          </div>
        </div>

        {/* Field 14: Klasifikasi Bahan Baku (12 Columns with Select2) */}
        <div className="space-y-1.5 w-full">
          <label className="text-xs font-semibold text-foreground">
            {t.ingredients.labelStatusIngredient}
          </label>
          <select
            ref={statusIngredientSelectRef}
            value={statusIngredient}
            onChange={(e) => setStatusIngredient(e.target.value)}
            className="w-full"
          >
            <option value="raw">{t.ingredients.rawOption}</option>
            <option value="semi_finished">
              {t.ingredients.semiFinishedOption}
            </option>
            <option value="finished">{t.ingredients.finishedOption}</option>
          </select>
        </div>

        {/* Field 15: Status Operasional (12 Columns / Full Width, below Deskripsi) */}
        <div className="space-y-1.5 w-full">
          <label className="text-xs font-semibold text-foreground">
            {t.ingredients.labelStatus} *
          </label>
          <div className="grid grid-cols-2 gap-2 h-10 p-1 rounded-xl border border-border/70 bg-muted/30 w-full">
            <button
              type="button"
              onClick={() => setIsActive(true)}
              className={`flex items-center justify-center rounded-lg text-xs transition-all ${
                isActive
                  ? "bg-card text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              {t.ingredients.statusActive}
            </button>
            <button
              type="button"
              onClick={() => setIsActive(false)}
              className={`flex items-center justify-center rounded-lg text-xs transition-all ${
                !isActive
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              {t.ingredients.statusInactive}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {t.ingredients.statusHelp}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-border/60">
          <button
            type="button"
            onClick={() => handleNavigate("/master/ingredients")}
            disabled={isSubmitting}
            className="px-10 py-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all disabled:opacity-50 cursor-pointer"
          >
            {t.ingredients.btnCancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? t.ingredients.btnSaving
              : isEdit
                ? t.ingredients.btnUpdate
                : t.ingredients.btnSave}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IngredientFormPage;
