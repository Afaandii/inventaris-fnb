import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Scale,
  ShieldCheck,
  Ban,
  Layers,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { initialUnits } from "@/data/mockUnits";
import { unitService } from "@/services/unitService";
import { UnitTable } from "@/components/units/UnitTable";
import { UnitDeleteDialog } from "@/components/units/UnitDeleteDialog";
import {
  UnitFilterModal,
  type UnitFilterCriteria,
} from "@/components/units/UnitFilterModal";
import { UnitFormPage } from "@/pages/units/UnitFormPage";
import { UnitDetailPage } from "@/pages/units/UnitDetailPage";
import { UnitTableSkeleton } from "@/components/units/UnitSkeleton";
import { UnitServer502 } from "@/components/units/UnitServer502";
import type { Unit } from "@/types/unit";

interface UnitsPageProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const UnitsPage: React.FC<UnitsPageProps> = ({
  currentPath = "/master/units",
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
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter criteria state
  const [filterCriteria, setFilterCriteria] = useState<UnitFilterCriteria>({
    dateFrom: "",
    dateTo: "",
    type: "all",
    status: "all",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Fetch units dynamically from Golang backend with 3-second skeleton & 502 detection
  const loadUnits = useCallback(async () => {
    setIsLoading(true);
    setIsServerDown(false);
    const startTime = Date.now();

    try {
      const res = await unitService.getAll();

      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }

      if (!res.isLive) {
        setIsServerDown(true);
        return;
      }

      setUnits(res.data);
    } catch {
      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }
      setIsServerDown(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUnits();
  }, [loadUnits]);

  // Filtered units based on criteria
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      // Date from filter
      if (filterCriteria.dateFrom && u.created_at) {
        const itemDate = new Date(u.created_at).setHours(0, 0, 0, 0);
        const fromDate = new Date(filterCriteria.dateFrom).setHours(0, 0, 0, 0);
        if (itemDate < fromDate) return false;
      }

      // Date to filter
      if (filterCriteria.dateTo && u.created_at) {
        const itemDate = new Date(u.created_at).setHours(23, 59, 59, 999);
        const toDate = new Date(filterCriteria.dateTo).setHours(23, 59, 59, 999);
        if (itemDate > toDate) return false;
      }

      // Type filter
      if (filterCriteria.type !== "all" && u.type !== filterCriteria.type) {
        return false;
      }

      // Status filter
      if (filterCriteria.status !== "all") {
        const isActiveFilter = filterCriteria.status === "active";
        if (u.is_active !== isActiveFilter) {
          return false;
        }
      }

      return true;
    });
  }, [units, filterCriteria]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterCriteria.dateFrom) count++;
    if (filterCriteria.dateTo) count++;
    if (filterCriteria.type !== "all") count++;
    if (filterCriteria.status !== "all") count++;
    return count;
  }, [filterCriteria]);

  // Stat metrics computation
  const stats = useMemo(() => {
    const total = units.length;
    const active = units.filter((u) => u.is_active !== false).length;
    const inactive = units.filter((u) => u.is_active === false).length;
    const typesCount = new Set(units.map((u) => u.type).filter(Boolean)).size;

    return { total, active, inactive, typesCount };
  }, [units]);

  // Delete Action
  const handleDeleteConfirm = async (item: Unit) => {
    setIsDeleting(true);
    try {
      const res = await unitService.delete(item.id_unit);
      if (!res.isLive) {
        setIsServerDown(true);
        setIsDeleteOpen(false);
        return;
      }

      setUnits((prev) => prev.filter((u) => u.id_unit !== item.id_unit));
      setIsDeleteOpen(false);
      setDeletingUnit(null);
      showToast(t.units.toastDeleteSuccess);
    } catch {
      showToast(t.units.toastErrorNetwork);
    } finally {
      setIsDeleting(false);
    }
  };

  // Check sub-routes if rendered directly
  if (currentPath === "/master/units/create") {
    return (
      <UnitFormPage
        mode="create"
        onNavigate={handleNavigate}
        onSuccess={(msg) => {
          showToast(msg);
          handleNavigate("/master/units");
        }}
      />
    );
  }

  if (currentPath.startsWith("/master/units/edit/")) {
    const editId = Number(currentPath.split("/").pop());
    return (
      <UnitFormPage
        mode="edit"
        unitId={editId}
        onNavigate={handleNavigate}
        onSuccess={(msg) => {
          showToast(msg);
          handleNavigate("/master/units");
        }}
      />
    );
  }

  if (currentPath.startsWith("/master/units/detail/")) {
    const detailId = Number(currentPath.split("/").pop());
    return (
      <UnitDetailPage
        unitId={detailId}
        onNavigate={handleNavigate}
      />
    );
  }

  // 1. Show full-screen 502 Bad Gateway if server is unreachable
  if (isServerDown) {
    return <UnitServer502 onRetry={loadUnits} />;
  }

  // 2. Show Skeleton while loading (~3 seconds)
  if (isLoading) {
    return <UnitTableSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-foreground text-background shadow-2xl animate-in slide-in-from-bottom-3 duration-200 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{t.common.masterData}</span>
        <span>/</span>
        <span className="font-semibold text-foreground">{t.units.title}</span>
      </div>

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t.units.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t.units.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadUnits}
            title="Refresh Data"
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-border/70 bg-card hover:bg-muted text-foreground transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                isLoading ? "animate-spin text-primary" : "hover:rotate-180"
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/master/units/create")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.units.addUnit}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards (Matching Outlets/Categories Layout) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Units */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.units.totalUnits}</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {stats.total}
          </p>
        </div>

        {/* Card 2: Satuan Aktif */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.units.activeUnits}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {stats.active}
          </p>
        </div>

        {/* Card 3: Satuan Nonaktif */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.units.inactiveUnits}</span>
            <div className="p-2 rounded-xl bg-muted text-muted-foreground">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {stats.inactive}
          </p>
        </div>

        {/* Card 4: Tipe Pengukuran */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.units.totalTypes}</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {stats.typesCount}
          </p>
        </div>
      </div>

      {/* Main Table Component */}
      <UnitTable
        units={filteredUnits}
        onDetail={(item) =>
          handleNavigate(`/master/units/detail/${item.id_unit}`)
        }
        onEdit={(item) =>
          handleNavigate(`/master/units/edit/${item.id_unit}`)
        }
        onDelete={(item) => {
          setDeletingUnit(item);
          setIsDeleteOpen(true);
        }}
        onOpenFilter={() => setIsFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Filter Modal */}
      <UnitFilterModal
        isOpen={isFilterModalOpen}
        criteria={filterCriteria}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(crit) => setFilterCriteria(crit)}
        onReset={() =>
          setFilterCriteria({
            dateFrom: "",
            dateTo: "",
            type: "all",
            status: "all",
          })
        }
      />

      {/* Delete Confirmation Dialog */}
      <UnitDeleteDialog
        isOpen={isDeleteOpen}
        unit={deletingUnit}
        isDeleting={isDeleting}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingUnit(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default UnitsPage;
