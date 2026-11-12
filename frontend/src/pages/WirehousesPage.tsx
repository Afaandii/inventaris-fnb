import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Warehouse,
  Wrench,
  ShieldCheck,
  Building2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { initialWirehouses } from "@/data/mockWirehouses";
import { wirehouseService } from "@/services/wirehouseService";
import { outletService } from "@/services/outletService";
import { WirehouseTable } from "@/components/wirehouses/WirehouseTable";
import { WirehouseDeleteDialog } from "@/components/wirehouses/WirehouseDeleteDialog";
import {
  WirehouseFilterModal,
  type WirehouseFilterCriteria,
} from "@/components/wirehouses/WirehouseFilterModal";
import { WirehouseFormPage } from "@/pages/wirehouses/WirehouseFormPage";
import { WirehouseDetailPage } from "@/pages/wirehouses/WirehouseDetailPage";
import { WirehouseTableSkeleton } from "@/components/wirehouses/WirehouseSkeleton";
import { WirehouseServer502 } from "@/components/wirehouses/WirehouseServer502";
import type { Wirehouse, WirehouseOutlet } from "@/types/wirehouse";

interface WirehousesPageProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const WirehousesPage: React.FC<WirehousesPageProps> = ({
  currentPath = "/master/warehouses",
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
  const [wirehouses, setWirehouses] = useState<Wirehouse[]>(initialWirehouses);
  const [availableOutlets, setAvailableOutlets] = useState<WirehouseOutlet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter criteria state
  const [filterCriteria, setFilterCriteria] = useState<WirehouseFilterCriteria>({
    dateFrom: "",
    dateTo: "",
    outletId: "all",
    city: "all",
    type: "all",
    status: "all",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingWirehouse, setDeletingWirehouse] = useState<Wirehouse | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Fetch wirehouses dynamically from Golang backend with 3-second skeleton & 502 detection
  const loadWirehouses = useCallback(async () => {
    setIsLoading(true);
    setIsServerDown(false);
    const startTime = Date.now();

    try {
      const [wireRes, outletsRes] = await Promise.all([
        wirehouseService.getAll(),
        outletService.getAll(),
      ]);

      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }

      if (!wireRes.isLive) {
        setIsServerDown(true);
      } else {
        setWirehouses(wireRes.data);
        setAvailableOutlets(outletsRes.data);
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
      loadWirehouses();
    }
    return () => {
      isMounted = false;
    };
  }, [loadWirehouses]);

  // Available unique cities for filtering
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    wirehouses.forEach((w) => {
      if (w.city) set.add(w.city);
    });
    return Array.from(set).sort();
  }, [wirehouses]);

  // Compute active filters count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterCriteria.dateFrom) count++;
    if (filterCriteria.dateTo) count++;
    if (filterCriteria.outletId !== "all") count++;
    if (filterCriteria.city !== "all") count++;
    if (filterCriteria.type !== "all") count++;
    if (filterCriteria.status !== "all") count++;
    return count;
  }, [filterCriteria]);

  // Filtered wirehouses based on criteria
  const filteredWirehouses = useMemo(() => {
    return wirehouses.filter((item) => {
      if (
        filterCriteria.status !== "all" &&
        item.status !== filterCriteria.status
      ) {
        return false;
      }

      if (
        filterCriteria.type !== "all" &&
        item.type !== filterCriteria.type
      ) {
        return false;
      }

      if (
        filterCriteria.outletId !== "all" &&
        item.outlet_id !== filterCriteria.outletId
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
  }, [wirehouses, filterCriteria]);

  // Metrics summary
  const totalCount = wirehouses.length;
  const activeCount = wirehouses.filter((w) => w.status === "active").length;
  const maintenanceCount = wirehouses.filter(
    (w) => w.status === "maintenance",
  ).length;
  const uniqueCitiesCount = availableCities.length;

  // Handlers for table actions
  const handleDetail = useCallback(
    (wirehouse: Wirehouse) => {
      handleNavigate(`/master/warehouses/detail/${wirehouse.id_wirehouse}`);
    },
    [handleNavigate],
  );

  const handleEdit = useCallback(
    (wirehouse: Wirehouse) => {
      handleNavigate(`/master/warehouses/edit/${wirehouse.id_wirehouse}`);
    },
    [handleNavigate],
  );

  const handleDeleteClick = useCallback((wirehouse: Wirehouse) => {
    setDeletingWirehouse(wirehouse);
    setIsDeleteOpen(true);
  }, []);

  const handleConfirmDelete = async (wirehouse: Wirehouse) => {
    setIsDeleting(true);
    try {
      const res = await wirehouseService.delete(wirehouse.id_wirehouse);
      if (!res.isLive) {
        setIsServerDown(true);
        return;
      }
      setIsDeleteOpen(false);
      setDeletingWirehouse(null);
      showToast(t.wirehouses.toastDeleteSuccess);
      loadWirehouses();
    } catch {
      showToast(t.wirehouses.toastErrorNetwork);
    } finally {
      setIsDeleting(false);
    }
  };

  // Subroute Delegation Check
  if (
    currentPath === "/master/warehouses/create" ||
    currentPath === "/master/wirehouses/create"
  ) {
    return (
      <WirehouseFormPage
        mode="create"
        onNavigate={handleNavigate}
        onSuccess={showToast}
      />
    );
  }

  const editMatch = currentPath.match(
    /^\/master\/(?:warehouses|wirehouses)\/edit\/(\d+)$/,
  );
  if (editMatch) {
    return (
      <WirehouseFormPage
        mode="edit"
        wirehouseId={Number(editMatch[1])}
        onNavigate={handleNavigate}
        onSuccess={showToast}
      />
    );
  }

  const detailMatch = currentPath.match(
    /^\/master\/(?:warehouses|wirehouses)\/detail\/(\d+)$/,
  );
  if (detailMatch) {
    return (
      <WirehouseDetailPage
        wirehouseId={Number(detailMatch[1])}
        onNavigate={handleNavigate}
      />
    );
  }

  // Full Screen 502 Bad Gateway if server is unreachable
  if (isServerDown) {
    return <WirehouseServer502 onRetry={loadWirehouses} />;
  }

  // 3-second Skeleton loader
  if (isLoading) {
    return <WirehouseTableSkeleton />;
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
        <span className="font-semibold text-foreground">
          {t.wirehouses.title}
        </span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t.wirehouses.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t.wirehouses.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadWirehouses}
            title="Refresh Data"
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-border/70 bg-card hover:bg-muted text-foreground transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground hover:rotate-180 transition-transform duration-300" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/master/warehouses/create")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.wirehouses.addWirehouse}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (4 Cards Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Gudang */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.wirehouses.totalWirehouses}</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {totalCount}
          </p>
        </div>

        {/* Card 2: Gudang Aktif */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.wirehouses.activeWirehouses}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {activeCount}
          </p>
        </div>

        {/* Card 3: Dalam Pemeliharaan */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.wirehouses.maintenanceWirehouses}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {maintenanceCount}
          </p>
        </div>

        {/* Card 4: Kota Terjangkau */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.wirehouses.citiesCovered}</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {uniqueCitiesCount}
          </p>
        </div>
      </div>

      {/* Main Wirehouse DataTable */}
      <WirehouseTable
        wirehouses={filteredWirehouses}
        onDetail={handleDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onOpenFilter={() => setIsFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Filter Modal Dialog */}
      <WirehouseFilterModal
        isOpen={isFilterModalOpen}
        criteria={filterCriteria}
        availableOutlets={availableOutlets}
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
            outletId: "all",
            city: "all",
            type: "all",
            status: "all",
          });
          setIsFilterModalOpen(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <WirehouseDeleteDialog
        isOpen={isDeleteOpen}
        wirehouse={deletingWirehouse}
        isDeleting={isDeleting}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingWirehouse(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default WirehousesPage;
