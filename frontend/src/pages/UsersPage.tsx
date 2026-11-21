import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  UserCheck,
  UserX,
  Shield,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { initialUsers } from "@/data/mockUsers";
import { initialRoles } from "@/data/mockRoles";
import { initialOutlets } from "@/data/mockOutlets";
import { userService } from "@/services/userService";
import { roleService } from "@/services/roleService";
import { outletService } from "@/services/outletService";
import { UserTable } from "@/components/users/UserTable";
import { UserDeleteDialog } from "@/components/users/UserDeleteDialog";
import {
  UserFilterModal,
  type UserFilterCriteria,
} from "@/components/users/UserFilterModal";
import { UserFormPage } from "@/pages/users/UserFormPage";
import { UserDetailPage } from "@/pages/users/UserDetailPage";
import { UserTableSkeleton } from "@/components/users/UserSkeleton";
import { UserServer502 } from "@/components/users/UserServer502";
import type { User } from "@/types/user";
import type { Role } from "@/types/role";
import type { Outlet } from "@/types/outlet";

interface UsersPageProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({
  currentPath = "/master/users",
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
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [outlets, setOutlets] = useState<Outlet[]>(initialOutlets);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter criteria state
  const [filterCriteria, setFilterCriteria] = useState<UserFilterCriteria>({
    dateFrom: "",
    dateTo: "",
    roleId: "all",
    outletId: "all",
    status: "all",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Fetch users, roles, and outlets dynamically with real backend loading & 502 detection
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setIsServerDown(false);

    try {
      const [usersRes, rolesRes, outletsRes] = await Promise.all([
        userService.getAll(),
        roleService.getAll().catch(() => ({ data: initialRoles, isLive: false })),
        outletService.getAll().catch(() => ({ data: initialOutlets, isLive: false })),
      ]);

      if (!usersRes.isLive) {
        setIsServerDown(true);
        return;
      }

      if (rolesRes.data) setRoles(rolesRes.data);
      if (outletsRes.data) setOutlets(outletsRes.data);

      // Map relation names if missing from backend
      const mapped = usersRes.data.map((u) => {
        const r = rolesRes.data?.find((role) => role.id_role === u.role_id);
        const o = outletsRes.data?.find((out) => out.id_outlet === u.outlet_id);
        return {
          ...u,
          role_name: u.role_name || r?.role_name,
          display_role_name: u.display_role_name || r?.display_name,
          outlet_name: u.outlet_name || o?.outlet_name,
        };
      });

      setUsers(mapped);
    } catch {
      setIsServerDown(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [loadUsers]);

  // Filtered users based on criteria
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
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

      // Role filter
      if (filterCriteria.roleId !== "all" && u.role_id !== filterCriteria.roleId) {
        return false;
      }

      // Outlet filter
      if (
        filterCriteria.outletId !== "all" &&
        u.outlet_id !== filterCriteria.outletId
      ) {
        return false;
      }

      // Status filter
      if (filterCriteria.status !== "all" && u.status !== filterCriteria.status) {
        return false;
      }

      return true;
    });
  }, [users, filterCriteria]);

  // Metric stats
  const stats = useMemo(() => {
    const total = users.length;
    const activeCount = users.filter(
      (u) => u.status === "active" && u.is_active !== false,
    ).length;
    const suspendedCount = users.filter(
      (u) => u.status === "suspended" || u.status === "banned",
    ).length;
    const rolesCount = roles.length;

    return {
      total,
      active: activeCount,
      suspended: suspendedCount,
      roles: rolesCount,
    };
  }, [users, roles]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterCriteria.dateFrom) count++;
    if (filterCriteria.dateTo) count++;
    if (filterCriteria.roleId !== "all") count++;
    if (filterCriteria.outletId !== "all") count++;
    if (filterCriteria.status !== "all") count++;
    return count;
  }, [filterCriteria]);

  // Delete Action Handler
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);

    try {
      const res = await userService.delete(deletingUser.id_user);
      if (!res.isLive) {
        setIsServerDown(true);
        setIsDeleteOpen(false);
        return;
      }
      setUsers((prev) =>
        prev.filter((item) => item.id_user !== deletingUser.id_user),
      );
      showToast(t.users.toastDeleteSuccess);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : t.users.errorServerGeneric;
      showToast(msg);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeletingUser(null);
    }
  };

  // 1. Subroute Delegation: Create, Edit, Detail
  if (currentPath.startsWith("/master/users/create")) {
    return (
      <UserFormPage
        mode="create"
        onNavigate={handleNavigate}
        onSuccess={(msg) => {
          showToast(msg);
          handleNavigate("/master/users");
          loadUsers();
        }}
      />
    );
  }

  if (currentPath.startsWith("/master/users/edit")) {
    return (
      <UserFormPage
        mode="edit"
        onNavigate={handleNavigate}
        onSuccess={(msg) => {
          showToast(msg);
          handleNavigate("/master/users");
          loadUsers();
        }}
      />
    );
  }

  if (currentPath.startsWith("/master/users/detail")) {
    return <UserDetailPage onNavigate={handleNavigate} />;
  }

  // 2. Full-Screen 502 Bad Gateway fallback if server is down / timeout
  if (isServerDown) {
    return <UserServer502 onRetry={loadUsers} />;
  }

  // 3. Show 3-Second Skeleton Loading while fetching
  if (isLoading) {
    return <UserTableSkeleton />;
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
              {t.users.title}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t.users.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            {t.users.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadUsers}
            title="Refresh Data"
            className="w-10 h-10 rounded-xl border border-border/70 bg-card hover:bg-muted text-foreground flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <RefreshCw
              className={`w-4 h-4 text-muted-foreground ${
                isLoading ? "animate-spin" : ""
              }`}
            />
          </button>

          {/* Add User Button */}
          <button
            type="button"
            onClick={() => handleNavigate("/master/users/create")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.users.addUser}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.users.totalUsers}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.total}
          </div>
        </div>

        {/* Active Users */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.users.activeUsers}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.active}
          </div>
        </div>

        {/* Suspended / Banned Users */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.users.suspendedUsers}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.suspended}
          </div>
        </div>

        {/* Registered Roles */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.users.registeredRoles}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.roles}
          </div>
        </div>
      </div>

      {/* Main User Table Component (Matching Ingredient Structure & Layout) */}
      <UserTable
        users={filteredUsers}
        onDetail={(user) =>
          handleNavigate(`/master/users/detail/${user.id_user}`)
        }
        onEdit={(user) =>
          handleNavigate(`/master/users/edit/${user.id_user}`)
        }
        onDelete={(user) => {
          setDeletingUser(user);
          setIsDeleteOpen(true);
        }}
        onOpenFilter={() => setIsFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Multi-Criteria Filter Modal */}
      <UserFilterModal
        isOpen={isFilterModalOpen}
        criteria={filterCriteria}
        roles={roles}
        outlets={outlets}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(criteria) => setFilterCriteria(criteria)}
        onReset={() =>
          setFilterCriteria({
            dateFrom: "",
            dateTo: "",
            roleId: "all",
            outletId: "all",
            status: "all",
          })
        }
      />

      {/* Delete Confirmation Modal */}
      <UserDeleteDialog
        isOpen={isDeleteOpen}
        user={deletingUser}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default UsersPage;
