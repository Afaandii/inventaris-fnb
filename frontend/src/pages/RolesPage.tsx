import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Shield,
  KeyRound,
  Users,
  Layers,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { initialRoles } from "@/data/mockRoles";
import { roleService } from "@/services/roleService";
import { RoleTable } from "@/components/roles/RoleTable";
import { RoleDeleteDialog } from "@/components/roles/RoleDeleteDialog";
import {
  RoleFilterModal,
  type RoleFilterCriteria,
} from "@/components/roles/RoleFilterModal";
import { RoleFormPage } from "@/pages/roles/RoleFormPage";
import { RoleDetailPage } from "@/pages/roles/RoleDetailPage";
import { RoleTableSkeleton } from "@/components/roles/RoleSkeleton";
import { RoleServer502 } from "@/components/roles/RoleServer502";
import type { Role } from "@/types/role";

interface RolesPageProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const RolesPage: React.FC<RolesPageProps> = ({
  currentPath = "/master/roles",
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
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter criteria state
  const [filterCriteria, setFilterCriteria] = useState<RoleFilterCriteria>({
    dateFrom: "",
    dateTo: "",
    category: "all",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Fetch roles dynamically from Golang backend with 3-second skeleton & 502 detection
  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    setIsServerDown(false);
    const startTime = Date.now();

    try {
      const res = await roleService.getAll();

      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }

      if (!res.isLive) {
        setIsServerDown(true);
        return;
      }

      setRoles(res.data);
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
    loadRoles();
  }, [loadRoles]);

  // Filtered roles based on criteria
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      // Date from filter
      if (filterCriteria.dateFrom && r.created_at) {
        const itemDate = new Date(r.created_at).setHours(0, 0, 0, 0);
        const fromDate = new Date(filterCriteria.dateFrom).setHours(0, 0, 0, 0);
        if (itemDate < fromDate) return false;
      }

      // Date to filter
      if (filterCriteria.dateTo && r.created_at) {
        const itemDate = new Date(r.created_at).setHours(23, 59, 59, 999);
        const toDate = new Date(filterCriteria.dateTo).setHours(23, 59, 59, 999);
        if (itemDate > toDate) return false;
      }

      // Category filter (managerial vs operational)
      if (filterCriteria.category !== "all") {
        const managerialKeys = ["superadmin", "admin", "manager"];
        const isManagerial = managerialKeys.some((k) =>
          r.role_name.toLowerCase().includes(k),
        );
        if (filterCriteria.category === "managerial" && !isManagerial) {
          return false;
        }
        if (filterCriteria.category === "operational" && isManagerial) {
          return false;
        }
      }

      return true;
    });
  }, [roles, filterCriteria]);

  // Metric stats
  const stats = useMemo(() => {
    const total = roles.length;
    const managerialKeys = ["superadmin", "admin", "manager"];
    const managerialCount = roles.filter((r) =>
      managerialKeys.some((k) => r.role_name.toLowerCase().includes(k)),
    ).length;
    const operationalCount = total - managerialCount;

    return {
      total,
      managerial: managerialCount,
      operational: operationalCount,
      categories: 2,
    };
  }, [roles]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterCriteria.dateFrom) count++;
    if (filterCriteria.dateTo) count++;
    if (filterCriteria.category !== "all") count++;
    return count;
  }, [filterCriteria]);

  // Delete Action Handler
  const handleDeleteConfirm = async () => {
    if (!deletingRole) return;
    setIsDeleting(true);

    try {
      const res = await roleService.delete(deletingRole.id_role);
      if (!res.isLive) {
        setIsServerDown(true);
        setIsDeleteOpen(false);
        return;
      }
      setRoles((prev) =>
        prev.filter((item) => item.id_role !== deletingRole.id_role),
      );
      showToast(t.roles.toastDeleteSuccess);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : t.roles.errorServerGeneric;
      showToast(msg);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeletingRole(null);
    }
  };

  // 1. Subroute Delegation: Create, Edit, Detail
  if (currentPath.startsWith("/master/roles/create")) {
    return (
      <RoleFormPage
        mode="create"
        onNavigate={handleNavigate}
        onSuccess={(msg) => {
          showToast(msg);
          handleNavigate("/master/roles");
          loadRoles();
        }}
      />
    );
  }

  if (currentPath.startsWith("/master/roles/edit")) {
    return (
      <RoleFormPage
        mode="edit"
        onNavigate={handleNavigate}
        onSuccess={(msg) => {
          showToast(msg);
          handleNavigate("/master/roles");
          loadRoles();
        }}
      />
    );
  }

  if (currentPath.startsWith("/master/roles/detail")) {
    return <RoleDetailPage onNavigate={handleNavigate} />;
  }

  // 2. Full-Screen 502 Bad Gateway fallback if server is down / timeout
  if (isServerDown) {
    return <RoleServer502 onRetry={loadRoles} />;
  }

  // 3. Show 3-Second Skeleton Loading while fetching
  if (isLoading) {
    return <RoleTableSkeleton />;
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border shadow-xl backdrop-blur-md animate-in slide-in-from-top-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-medium text-foreground">{toastMessage}</p>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>{t.common.masterData}</span>
            <span>/</span>
            <span className="font-semibold text-foreground">
              {t.roles.title}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t.roles.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            {t.roles.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadRoles}
            title="Refresh Data"
            className="w-10 h-10 rounded-xl border border-border/70 bg-card hover:bg-muted text-foreground flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <RefreshCw
              className={`w-4 h-4 text-muted-foreground ${
                isLoading ? "animate-spin" : ""
              }`}
            />
          </button>

          {/* Add Role Button */}
          <button
            type="button"
            onClick={() => handleNavigate("/master/roles/create")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.roles.addRole}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Roles */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.roles.totalRoles}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.total}
          </div>
        </div>

        {/* Managerial Roles */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.roles.managerialRoles}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.managerial}
          </div>
        </div>

        {/* Operational Roles */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.roles.operationalRoles}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.operational}
          </div>
        </div>

        {/* Access Categories */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.roles.accessCategories}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.categories}
          </div>
        </div>
      </div>

      {/* Table Container (Unified with top toolbar, datatable slot rendering, and mobile accordion) */}
      <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-4 sm:p-5">
        <RoleTable
          roles={filteredRoles}
          onDetail={(role) =>
            handleNavigate(`/master/roles/detail/${role.id_role}`)
          }
          onEdit={(role) =>
            handleNavigate(`/master/roles/edit/${role.id_role}`)
          }
          onDelete={(role) => {
            setDeletingRole(role);
            setIsDeleteOpen(true);
          }}
          onOpenFilter={() => setIsFilterModalOpen(true)}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Multi-Criteria Filter Modal */}
      <RoleFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        criteria={filterCriteria}
        onApply={(criteria) => setFilterCriteria(criteria)}
        onReset={() =>
          setFilterCriteria({
            dateFrom: "",
            dateTo: "",
            category: "all",
          })
        }
      />

      {/* Delete Confirmation Modal */}
      <RoleDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingRole(null);
        }}
        onConfirm={handleDeleteConfirm}
        role={deletingRole}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default RolesPage;
