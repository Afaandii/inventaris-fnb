import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Truck,
  ShieldCheck,
  Ban,
  MapPin,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { initialSuppliers } from "@/data/mockSuppliers";
import { supplierService } from "@/services/supplierService";
import { SupplierTable } from "@/components/suppliers/SupplierTable";
import { SupplierDeleteDialog } from "@/components/suppliers/SupplierDeleteDialog";
import {
  SupplierFilterModal,
  type SupplierFilterCriteria,
} from "@/components/suppliers/SupplierFilterModal";
import { SupplierFormPage } from "@/pages/suppliers/SupplierFormPage";
import { SupplierDetailPage } from "@/pages/suppliers/SupplierDetailPage";
import { SupplierTableSkeleton } from "@/components/suppliers/SupplierSkeleton";
import { SupplierServer502 } from "@/components/suppliers/SupplierServer502";
import type { Supplier } from "@/types/supplier";

interface SuppliersPageProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const SuppliersPage: React.FC<SuppliersPageProps> = ({
  currentPath = "/master/suppliers",
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
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter criteria state
  const [filterCriteria, setFilterCriteria] = useState<SupplierFilterCriteria>({
    dateFrom: "",
    dateTo: "",
    city: "all",
    status: "all",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Fetch suppliers dynamically from Golang backend with real backend loading & 502 detection
  const loadSuppliers = useCallback(async () => {
    setIsLoading(true);
    setIsServerDown(false);

    try {
      const res = await supplierService.getAll();

      if (!res.isLive) {
        setIsServerDown(true);
        return;
      }

      setSuppliers(res.data);
    } catch {
      setIsServerDown(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSuppliers();
  }, [loadSuppliers]);

  // Available unique cities for filter modal
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    suppliers.forEach((s) => {
      if (s.city) set.add(s.city);
    });
    return Array.from(set).sort();
  }, [suppliers]);

  // Filtered suppliers based on criteria
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      // Date from filter
      if (filterCriteria.dateFrom) {
        const itemDate = new Date(s.created_at).setHours(0, 0, 0, 0);
        const fromDate = new Date(filterCriteria.dateFrom).setHours(0, 0, 0, 0);
        if (itemDate < fromDate) return false;
      }

      // Date to filter
      if (filterCriteria.dateTo) {
        const itemDate = new Date(s.created_at).setHours(23, 59, 59, 999);
        const toDate = new Date(filterCriteria.dateTo).setHours(23, 59, 59, 999);
        if (itemDate > toDate) return false;
      }

      // City filter
      if (filterCriteria.city !== "all" && s.city !== filterCriteria.city) {
        return false;
      }

      // Status filter
      if (filterCriteria.status !== "all" && s.status_supplier !== filterCriteria.status) {
        return false;
      }

      return true;
    });
  }, [suppliers, filterCriteria]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterCriteria.dateFrom) count++;
    if (filterCriteria.dateTo) count++;
    if (filterCriteria.city !== "all") count++;
    if (filterCriteria.status !== "all") count++;
    return count;
  }, [filterCriteria]);

  // Stat metrics computation
  const stats = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter((s) => s.status_supplier === "active").length;
    const inactive = suppliers.filter((s) => s.status_supplier === "inactive").length;
    const citiesCount = new Set(suppliers.map((s) => s.city).filter(Boolean)).size;

    return { total, active, inactive, citiesCount };
  }, [suppliers]);

  // Delete Action
  const handleDeleteConfirm = async (item: Supplier) => {
    setIsDeleting(true);
    try {
      const res = await supplierService.delete(item.id_supplier);
      if (!res.isLive) {
        setIsServerDown(true);
        setIsDeleteOpen(false);
        return;
      }

      setSuppliers((prev) => prev.filter((s) => s.id_supplier !== item.id_supplier));
      setIsDeleteOpen(false);
      setDeletingSupplier(null);
      showToast(t.suppliers.toastDeleteSuccess);
    } catch {
      showToast(t.suppliers.toastErrorNetwork);
    } finally {
      setIsDeleting(false);
    }
  };

  // Check sub-routes if rendered directly
  if (currentPath === "/master/suppliers/create") {
    return (
      <SupplierFormPage
        mode="create"
        onNavigate={handleNavigate}
        onSuccess={(msg) => {
          showToast(msg);
          handleNavigate("/master/suppliers");
        }}
      />
    );
  }

  if (currentPath.startsWith("/master/suppliers/edit/")) {
    const editId = Number(currentPath.split("/").pop());
    return (
      <SupplierFormPage
        mode="edit"
        supplierId={editId}
        onNavigate={handleNavigate}
        onSuccess={(msg) => {
          showToast(msg);
          handleNavigate("/master/suppliers");
        }}
      />
    );
  }

  if (currentPath.startsWith("/master/suppliers/detail/")) {
    const detailId = Number(currentPath.split("/").pop());
    return (
      <SupplierDetailPage
        supplierId={detailId}
        onNavigate={handleNavigate}
      />
    );
  }

  // 1. Show full-screen 502 Bad Gateway if server is unreachable
  if (isServerDown) {
    return <SupplierServer502 onRetry={loadSuppliers} />;
  }

  // 2. Show Skeleton while loading (~3 seconds)
  if (isLoading) {
    return <SupplierTableSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500 text-white shadow-xl animate-in slide-in-from-top-2 duration-200 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{t.common.masterData}</span>
        <span>/</span>
        <span className="font-semibold text-foreground">{t.suppliers.title}</span>
      </div>

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t.suppliers.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t.suppliers.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadSuppliers}
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
            onClick={() => handleNavigate("/master/suppliers/create")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.suppliers.addSupplier}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Pemasok */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.suppliers.totalSuppliers}</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {stats.total}
          </p>
        </div>

        {/* Card 2: Pemasok Aktif */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.suppliers.activeSuppliers}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {stats.active}
          </p>
        </div>

        {/* Card 3: Pemasok Nonaktif */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.suppliers.inactiveSuppliers}</span>
            <div className="p-2 rounded-xl bg-muted text-muted-foreground">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {stats.inactive}
          </p>
        </div>

        {/* Card 4: Kota Terjangkau */}
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-1 transition-all hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t.suppliers.citiesCovered}</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {stats.citiesCount}
          </p>
        </div>
      </div>

      {/* Main Table Component */}
      <SupplierTable
        suppliers={filteredSuppliers}
        onDetail={(item) =>
          handleNavigate(`/master/suppliers/detail/${item.id_supplier}`)
        }
        onEdit={(item) =>
          handleNavigate(`/master/suppliers/edit/${item.id_supplier}`)
        }
        onDelete={(item) => {
          setDeletingSupplier(item);
          setIsDeleteOpen(true);
        }}
        onOpenFilter={() => setIsFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Filter Modal */}
      <SupplierFilterModal
        isOpen={isFilterModalOpen}
        criteria={filterCriteria}
        availableCities={availableCities}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(crit) => setFilterCriteria(crit)}
        onReset={() =>
          setFilterCriteria({
            dateFrom: "",
            dateTo: "",
            city: "all",
            status: "all",
          })
        }
      />

      {/* Delete Confirmation Dialog */}
      <SupplierDeleteDialog
        isOpen={isDeleteOpen}
        supplier={deletingSupplier}
        isDeleting={isDeleting}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingSupplier(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default SuppliersPage;
