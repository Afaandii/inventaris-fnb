import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Plus,
  Layers,
  UtensilsCrossed,
  Boxes,
  ChefHat,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { initialCategories } from "@/data/mockCategories";
import { categoryService } from "@/services/categoryService";
import { CategoryTable } from "@/components/categories/CategoryTable";
import { CategoryFormModal } from "@/components/categories/CategoryFormModal";
import { CategoryDetailModal } from "@/components/categories/CategoryDetailModal";
import { CategoryDeleteDialog } from "@/components/categories/CategoryDeleteDialog";
import {
  CategoryFilterModal,
  type CategoryFilterCriteria,
} from "@/components/categories/CategoryFilterModal";
import type { Category, CategoryFormData } from "@/types/category";

export const CategoriesPage: React.FC = () => {
  const { t } = useTranslation();

  // State categories data from backend
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  // const [isLoading, setIsLoading] = useState(false);
  const [isLiveBackend, setIsLiveBackend] = useState(false);

  // Filter criteria state
  const [filterCriteria, setFilterCriteria] = useState<CategoryFilterCriteria>({
    dateFrom: "",
    dateTo: "",
    status: "all",
    type: "all",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailCategory, setDetailCategory] = useState<Category | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch categories dynamically from Golang backend
  const loadCategories = useCallback(async () => {
    // setIsLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data);
      setIsLiveBackend(res.isLive);
    } catch {
      setIsLiveBackend(false);
    } finally {
      // setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterCriteria.dateFrom) count++;
    if (filterCriteria.dateTo) count++;
    if (filterCriteria.status !== "all") count++;
    if (filterCriteria.type !== "all") count++;
    return count;
  }, [filterCriteria]);

  // Stat counters (computed from full categories list)
  const stats = useMemo(() => {
    const total = categories.length;
    const ingredient = categories.filter((c) => c.type === "ingredient").length;
    const menu = categories.filter((c) => c.type === "menu").length;
    const product = categories.filter((c) => c.type === "product").length;
    const active = categories.filter((c) => c.status === "active").length;

    return { total, ingredient, menu, product, active };
  }, [categories]);

  // Filtered categories according to criteria
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // Filter by Status
      if (
        filterCriteria.status !== "all" &&
        cat.status !== filterCriteria.status
      ) {
        return false;
      }

      // Filter by Type
      if (filterCriteria.type !== "all" && cat.type !== filterCriteria.type) {
        return false;
      }

      // Filter by Date From
      if (filterCriteria.dateFrom) {
        const catDate = new Date(cat.created_at).getTime();
        const fromDate = new Date(filterCriteria.dateFrom).getTime();
        if (catDate < fromDate) return false;
      }

      // Filter by Date To
      if (filterCriteria.dateTo) {
        const catDate = new Date(cat.created_at).getTime();
        const toDate = new Date(`${filterCriteria.dateTo}T23:59:59Z`).getTime();
        if (catDate > toDate) return false;
      }

      return true;
    });
  }, [categories, filterCriteria]);

  // Modal Handlers
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (category: Category) => {
    setDetailCategory(category);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteOpen(true);
  };

  // Submit create or edit
  const handleFormSubmit = async (
    formData: CategoryFormData,
    id_category?: number,
  ) => {
    const now = new Date().toISOString();

    if (id_category) {
      // Edit existing
      try {
        if (isLiveBackend) {
          const updated = await categoryService.update(id_category, formData);
          setCategories((prev) =>
            prev.map((c) => (c.id_category === id_category ? updated : c)),
          );
        } else {
          setCategories((prev) =>
            prev.map((c) =>
              c.id_category === id_category
                ? {
                    ...c,
                    ...formData,
                    updated_at: now,
                  }
                : c,
            ),
          );
        }
        showToast(t.categories.toastUpdateSuccess);
      } catch {
        showToast("Gagal memperbarui kategori di backend");
      }
    } else {
      // Create new
      try {
        if (isLiveBackend) {
          const created = await categoryService.create(formData);
          setCategories((prev) => [created, ...prev]);
        } else {
          const nextId =
            categories.length > 0
              ? Math.max(...categories.map((c) => c.id_category)) + 1
              : 1;

          const newCategory: Category = {
            id_category: nextId,
            ...formData,
            created_at: now,
            updated_at: now,
          };
          setCategories((prev) => [newCategory, ...prev]);
        }
        showToast(t.categories.toastCreateSuccess);
      } catch {
        showToast("Gagal menambahkan kategori ke backend");
      }
    }

    setIsFormOpen(false);
    setEditingCategory(null);
  };

  // Delete category
  const handleDeleteConfirm = async (category: Category) => {
    try {
      if (isLiveBackend) {
        await categoryService.delete(category.id_category);
      }
      setCategories((prev) =>
        prev.filter((c) => c.id_category !== category.id_category),
      );
      showToast(t.categories.toastDeleteSuccess);
    } catch {
      showToast("Gagal menghapus kategori");
    } finally {
      setIsDeleteOpen(false);
      setDeletingCategory(null);
    }
  };

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
          {t.categories.title}
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {t.categories.title}
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t.categories.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Add Category button */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>{t.categories.addCategory}</span>
          </button>
        </div>
      </div>

      {/* Metrics / KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Categories */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">
              {t.categories.totalCategories}
            </span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground tracking-tight">
              {stats.total}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {stats.active} {t.categories.statusActive.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Bahan Baku */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">
              {t.categories.ingredientCount}
            </span>
            <Boxes className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground tracking-tight">
              {stats.ingredient}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {((stats.ingredient / (stats.total || 1)) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Menu Sajian */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">
              {t.categories.menuCount}
            </span>
            <UtensilsCrossed className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground tracking-tight">
              {stats.menu}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {((stats.menu / (stats.total || 1)) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Produk / Packaging */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">
              {t.categories.productCount}
            </span>
            <ChefHat className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground tracking-tight">
              {stats.product}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {((stats.product / (stats.total || 1)) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main DataTable Section with side-by-side search and filter button */}
      <CategoryTable
        categories={filteredCategories}
        allCategories={categories}
        onDetail={handleOpenDetail}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onOpenFilter={() => setIsFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Filter Modal */}
      <CategoryFilterModal
        isOpen={isFilterModalOpen}
        initialCriteria={filterCriteria}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(newCriteria) => setFilterCriteria(newCriteria)}
        onReset={() =>
          setFilterCriteria({
            dateFrom: "",
            dateTo: "",
            status: "all",
            type: "all",
          })
        }
      />

      {/* Create / Edit Form Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        initialData={editingCategory}
        categoriesList={categories}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Category Detail Modal */}
      <CategoryDetailModal
        isOpen={isDetailOpen}
        category={detailCategory}
        parentName={
          detailCategory?.parent_id
            ? categories.find((c) => c.id_category === detailCategory.parent_id)
                ?.category_name
            : undefined
        }
        onClose={() => {
          setIsDetailOpen(false);
          setDetailCategory(null);
        }}
        onEdit={(cat) => {
          setIsDetailOpen(false);
          handleOpenEdit(cat);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <CategoryDeleteDialog
        isOpen={isDeleteOpen}
        category={deletingCategory}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingCategory(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
