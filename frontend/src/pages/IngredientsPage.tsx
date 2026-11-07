import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Boxes,
  ClockAlert,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { initialIngredients } from "@/data/mockIngredients";
import { initialCategories } from "@/data/mockCategories";
import { ingredientService } from "@/services/ingredientService";
import { categoryService } from "@/services/categoryService";
import { IngredientTable } from "@/components/ingredients/IngredientTable";
import { IngredientDeleteDialog } from "@/components/ingredients/IngredientDeleteDialog";
import {
  IngredientFilterModal,
  type IngredientFilterCriteria,
} from "@/components/ingredients/IngredientFilterModal";
import { IngredientFormPage } from "@/pages/ingredients/IngredientFormPage";
import { IngredientDetailPage } from "@/pages/ingredients/IngredientDetailPage";
import type { Ingredient, Unit } from "@/types/ingredient";
import type { Category } from "@/types/category";

interface IngredientsPageProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const IngredientsPage: React.FC<IngredientsPageProps> = ({
  currentPath = "/master/ingredients",
  onNavigate,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (path: string) => {
      if (onNavigate) {
        onNavigate(path);
      } else {
        navigate(path);
      }
    },
    [onNavigate, navigate],
  );

  // Data states
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveBackend, setIsLiveBackend] = useState(false);

  // Filter criteria state
  const [filterCriteria, setFilterCriteria] = useState<IngredientFilterCriteria>({
    dateFrom: "",
    dateTo: "",
    categoryId: "all",
    unitId: "all",
    perishable: "all",
    status: "all",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(
    null,
  );

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Fetch ingredients dynamically from Golang backend
  const loadIngredients = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ingRes, catRes, unitRes] = await Promise.all([
        ingredientService.getAll(),
        categoryService.getAll(),
        ingredientService.getUnits(),
      ]);
      setIngredients(ingRes.data);
      setIsLiveBackend(ingRes.isLive);
      if (catRes.data && catRes.data.length > 0) {
        setCategories(catRes.data);
      }
      if (unitRes && unitRes.length > 0) {
        setUnits(unitRes);
      }
    } catch {
      setIsLiveBackend(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const [ingRes, catRes, unitRes] = await Promise.all([
          ingredientService.getAll(),
          categoryService.getAll(),
          ingredientService.getUnits(),
        ]);
        if (isMounted) {
          setIngredients(ingRes.data);
          setIsLiveBackend(ingRes.isLive);
          if (catRes.data && catRes.data.length > 0) {
            setCategories(catRes.data);
          }
          if (unitRes && unitRes.length > 0) {
            setUnits(unitRes);
          }
        }
      } catch {
        if (isMounted) {
          setIsLiveBackend(false);
        }
      }
    };
    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Route sub-page detection
  const isCreateRoute = currentPath === "/master/ingredients/create";
  const isEditRoute = currentPath.startsWith("/master/ingredients/edit/");
  const isDetailRoute = currentPath.startsWith("/master/ingredients/detail/");

  // Count active filters (ALWAYS CALLED - NEVER SKIPPED)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterCriteria.dateFrom) count++;
    if (filterCriteria.dateTo) count++;
    if (filterCriteria.categoryId !== "all") count++;
    if (filterCriteria.unitId !== "all") count++;
    if (filterCriteria.perishable !== "all") count++;
    if (filterCriteria.status !== "all") count++;
    return count;
  }, [filterCriteria]);

  // Stat counters (ALWAYS CALLED - NEVER SKIPPED)
  const stats = useMemo(() => {
    const total = ingredients.length;
    const perishable = ingredients.filter((item) => item.is_perishable).length;
    const safeStock = ingredients.filter((item) => item.is_active).length;
    const uniqueSuppliers = new Set(
      ingredients.map((item) => item.supplier_id).filter(Boolean),
    ).size;

    return { total, perishable, safeStock, suppliers: uniqueSuppliers };
  }, [ingredients]);

  // Filtered ingredients according to criteria (ALWAYS CALLED - NEVER SKIPPED)
  const filteredIngredients = useMemo(() => {
    return ingredients.filter((item) => {
      // Filter by Category
      if (
        filterCriteria.categoryId !== "all" &&
        item.category_id !== filterCriteria.categoryId
      ) {
        return false;
      }

      // Filter by Unit
      if (
        filterCriteria.unitId !== "all" &&
        item.unit_id !== filterCriteria.unitId
      ) {
        return false;
      }

      // Filter by Perishability
      if (filterCriteria.perishable !== "all") {
        const isPerish = filterCriteria.perishable === "yes";
        if (item.is_perishable !== isPerish) return false;
      }

      // Filter by Status
      if (filterCriteria.status !== "all") {
        const isActive = filterCriteria.status === "active";
        if (item.is_active !== isActive) return false;
      }

      // Filter by Date From
      if (filterCriteria.dateFrom) {
        const itemDate = new Date(item.created_at).getTime();
        const fromDate = new Date(filterCriteria.dateFrom).getTime();
        if (itemDate < fromDate) return false;
      }

      // Filter by Date To
      if (filterCriteria.dateTo) {
        const itemDate = new Date(item.created_at).getTime();
        const toDate = new Date(`${filterCriteria.dateTo}T23:59:59Z`).getTime();
        if (itemDate > toDate) return false;
      }

      return true;
    });
  }, [ingredients, filterCriteria]);

  // Delete ingredient handler
  const handleDeleteConfirm = useCallback(
    async (ingredient: Ingredient) => {
      try {
        if (isLiveBackend) {
          await ingredientService.delete(ingredient.id_ingredient);
        }
        setIngredients((prev) =>
          prev.filter((i) => i.id_ingredient !== ingredient.id_ingredient),
        );
        showToast(t.ingredients.toastDeleteSuccess);
      } catch {
        showToast("Gagal menghapus bahan baku");
      } finally {
        setIsDeleteOpen(false);
        setDeletingIngredient(null);
      }
    },
    [isLiveBackend, showToast, t.ingredients.toastDeleteSuccess],
  );

  // CONDITIONAL SUB-PAGE RETURNS (Placed strictly AFTER all hooks)
  if (isCreateRoute) {
    return (
      <IngredientFormPage
        mode="create"
        onNavigate={handleNavigate}
        onSuccess={(msg) => {
          showToast(msg);
          loadIngredients();
        }}
      />
    );
  }

  if (isEditRoute) {
    const editId = Number(currentPath.split("/edit/")[1]);
    return (
      <IngredientFormPage
        mode="edit"
        ingredientId={editId}
        onNavigate={handleNavigate}
        onSuccess={(msg) => {
          showToast(msg);
          loadIngredients();
        }}
      />
    );
  }

  if (isDetailRoute) {
    const detailId = Number(currentPath.split("/detail/")[1]);
    return (
      <IngredientDetailPage
        ingredientId={detailId}
        onNavigate={handleNavigate}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border/80 bg-popover text-foreground shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Navigation Pathway */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="hover:text-foreground transition-colors cursor-pointer">
          {t.common.masterData}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
        <span className="font-semibold text-foreground">
          {t.ingredients.title}
        </span>
      </div>

      {/* Page Header (Clean: Text only, without icon/badges) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t.ingredients.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t.ingredients.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadIngredients}
            disabled={isLoading}
            title={t.common.refresh}
            className="p-2.5 rounded-xl border border-border/80 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin text-primary" : ""}`}
            />
          </button>

          <button
            onClick={() => handleNavigate("/master/ingredients/create")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t.ingredients.addIngredient}</span>
          </button>
        </div>
      </div>

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Ingredients */}
        <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              {t.ingredients.totalIngredients}
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.total}
          </div>
        </div>

        {/* Perishable Ingredients */}
        <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              {t.ingredients.perishableCount}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <ClockAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.perishable}
          </div>
        </div>

        {/* Active Ingredients */}
        <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              {t.ingredients.safeStockCount}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.safeStock}
          </div>
        </div>

        {/* Connected Suppliers */}
        <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              {t.ingredients.totalSuppliers}
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.suppliers}
          </div>
        </div>
      </div>

      {/* Main Ingredient Table Component */}
      <IngredientTable
        ingredients={filteredIngredients}
        categories={categories}
        units={units}
        isLoading={isLoading}
        activeFilterCount={activeFilterCount}
        onOpenFilter={() => setIsFilterModalOpen(true)}
        onDetail={(ing) =>
          handleNavigate(`/master/ingredients/detail/${ing.id_ingredient}`)
        }
        onEdit={(ing) =>
          handleNavigate(`/master/ingredients/edit/${ing.id_ingredient}`)
        }
        onDelete={(ing) => {
          setDeletingIngredient(ing);
          setIsDeleteOpen(true);
        }}
      />

      {/* Advanced Filter Modal */}
      <IngredientFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        initialCriteria={filterCriteria}
        criteria={filterCriteria}
        categories={categories}
        units={units}
        onApply={(newCriteria) => {
          setFilterCriteria(newCriteria);
          setIsFilterModalOpen(false);
        }}
        onReset={() => {
          setFilterCriteria({
            dateFrom: "",
            dateTo: "",
            categoryId: "all",
            unitId: "all",
            perishable: "all",
            status: "all",
          });
          setIsFilterModalOpen(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <IngredientDeleteDialog
        isOpen={isDeleteOpen}
        ingredient={deletingIngredient}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingIngredient(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default IngredientsPage;
