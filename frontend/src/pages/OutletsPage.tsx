import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Store,
  ClockAlert,
  ShieldCheck,
  Building2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { initialOutlets } from "@/data/mockOutlets";
import { outletService } from "@/services/outletService";
import { OutletTable } from "@/components/outlets/OutletTable";
import { OutletDeleteDialog } from "@/components/outlets/OutletDeleteDialog";
import {
  OutletFilterModal,
  type OutletFilterCriteria,
} from "@/components/outlets/OutletFilterModal";
import { OutletFormPage } from "@/pages/outlets/OutletFormPage";
import { OutletDetailPage } from "@/pages/outlets/OutletDetailPage";
import { OutletTableSkeleton } from "@/components/outlets/OutletSkeleton";
import { OutletServer502 } from "@/components/outlets/OutletServer502";
import type { Outlet } from "@/types/outlet";

interface OutletsPageProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const OutletsPage: React.FC<OutletsPageProps> = ({
  currentPath = "/master/outlets",
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
  const [outlets, setOutlets] = useState<Outlet[]>(initialOutlets);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter criteria state
  const [filterCriteria, setFilterCriteria] = useState<OutletFilterCriteria>({
    dateFrom: "",
    dateTo: "",
    city: "all",
    status: "all",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingOutlet, setDeletingOutlet] = useState<Outlet | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Fetch outlets dynamically from Golang backend with 3-second skeleton & 502 detection
  const loadOutlets = useCallback(async () => {
    setIsLoading(true);
    setIsServerDown(false);
    const startTime = Date.now();

    try {
      const res = await outletService.getAll();

      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }

      if (!res.isLive) {
        setIsServerDown(true);
      } else {
        setOutlets(res.data);
        setIsServerDown(false);
      }
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
    let isMounted = true;
    if (isMounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadOutlets();
    }
    return () => {
      isMounted = false;
    };
  }, [loadOutlets]);

  // Available unique cities for filtering
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    outlets.forEach((o) => {
      if (o.city) set.add(o.city);
    });
    return Array.from(set).sort();
  }, [outlets]);

  // Compute active filters count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterCriteria.dateFrom) count++;
    if (filterCriteria.dateTo) count++;
    if (filterCriteria.city !== "all") count++;
    if (filterCriteria.status !== "all") count++;
    return count;
  }, [filterCriteria]);

  // Filtered outlets based on criteria
  const filteredOutlets = useMemo(() => {
    return outlets.filter((item) => {
      if (
        filterCriteria.status !== "all" &&
        item.status_outlet !== filterCriteria.status
      ) {
        return false;
      }

      if (filterCriteria.city !== "all" && item.city !== filterCriteria.city) {
        return false;
      }

      if (filterCriteria.dateFrom && item.created_at) {
        const itemDate = new Date(item.created_at).setHours(0, 0, 0, 0);
        const fromDate = new Date(filterCriteria.dateFrom).setHours(0, 0, 0, 0);
        if (itemDate < fromDate) return false;
      }

      if (filterCriteria.dateTo && item.created_at) {
        const itemDate = new Date(item.created_at).setHours(23, 59, 59, 999);
        const toDate = new Date(filterCriteria.dateTo).setHours(23, 59, 59, 999);
        if (itemDate > toDate) return false;
      }

      return true;
    });
  }, [outlets, filterCriteria]);

  // Metrics summary
  const totalCount = outlets.length;
  const activeCount = outlets.filter((o) => o.status_outlet === "active").length;
  const renovationCount = outlets.filter(
    (o) => o.status_outlet === "renovation",
  ).length;
  const uniqueCitiesCount = availableCities.length;

  // Handlers for table actions
  const handleDetail = useCallback(
    (outlet: Outlet) => {
      handleNavigate(`/master/outlets/detail/${outlet.id_outlet}`);
    },
    [handleNavigate],
  );

  const handleEdit = useCallback(
    (outlet: Outlet) => {
      handleNavigate(`/master/outlets/edit/${outlet.id_outlet}`);
    },
    [handleNavigate],
  );

  const handleDeleteClick = useCallback((outlet: Outlet) => {
    setDeletingOutlet(outlet);
    setIsDeleteOpen(true);
  }, []);

  const handleConfirmDelete = async (outlet: Outlet) => {
    setIsDeleting(true);
    try {
      const res = await outletService.delete(outlet.id_outlet);
      if (!res.isLive) {
        setIsServerDown(true);
        return;
      }
      setIsDeleteOpen(false);
      setDeletingOutlet(null);
      showToast(t.outlets.toastDeleteSuccess);
      loadOutlets();
    } catch {
      showToast(t.outlets.toastErrorNetwork);
    } finally {
      setIsDeleting(false);
    }
  };

  // Subroute Delegation Check
  if (currentPath === "/master/outlets/create") {
    return (
      <OutletFormPage
        mode="create"
        onNavigate={handleNavigate}
        onSuccess={showToast}
      />
    );
  }

  const editMatch = currentPath.match(/^\/master\/outlets\/edit\/(\d+)$/);
  if (editMatch) {
    return (
      <OutletFormPage
        mode="edit"
        outletId={Number(editMatch[1])}
        onNavigate={handleNavigate}
        onSuccess={showToast}
      />
    );
  }

  const detailMatch = currentPath.match(/^\/master\/outlets\/detail\/(\d+)$/);
  if (detailMatch) {
    return (
      <OutletDetailPage
        outletId={Number(detailMatch[1])}
        onNavigate={handleNavigate}
      />
    );
  }

  // Full Screen 502 Bad Gateway if server is unreachable
  if (isServerDown) {
    return <OutletServer502 onRetry={loadOutlets} />;
  }

  // 3-second Skeleton loader
  if (isLoading) {
    return <OutletTableSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Feedback */}
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
        <span className="font-semibold text-foreground">{t.outlets.title}</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t.outlets.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t.outlets.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadOutlets}
            title="Refresh Data"
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-border/70 bg-card hover:bg-muted text-foreground transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground hover:rotate-180 transition-transform duration-300" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/master/outlets/create")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.outlets.addOutlet}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (4 Cards Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Outlets */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.outlets.totalOutlets}</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {totalCount}
          </p>
        </div>

        {/* Card 2: Outlet Aktif */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.outlets.activeOutlets}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {activeCount}
          </p>
        </div>

        {/* Card 3: Dalam Renovasi */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.outlets.renovationOutlets}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <ClockAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {renovationCount}
          </p>
        </div>

        {/* Card 4: Kota Terjangkau */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.outlets.citiesCovered}</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {uniqueCitiesCount}
          </p>
        </div>
      </div>

      {/* Main Outlet DataTable */}
      <OutletTable
        outlets={filteredOutlets}
        onDetail={handleDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onOpenFilter={() => setIsFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Filter Modal Dialog */}
      <OutletFilterModal
        isOpen={isFilterModalOpen}
        criteria={filterCriteria}
        availableCities={availableCities}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(crit) => {
          setFilterCriteria(crit);
          setIsFilterModalOpen(false);
        }}
        onReset={() => {
          setFilterCriteria({
            dateFrom: "",
            dateTo: "",
            city: "all",
            status: "all",
          });
          setIsFilterModalOpen(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <OutletDeleteDialog
        isOpen={isDeleteOpen}
        outlet={deletingOutlet}
        isDeleting={isDeleting}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingOutlet(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default OutletsPage;
