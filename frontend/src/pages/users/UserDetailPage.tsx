import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Pencil,
  Shield,
  Store,
  Mail,
  Phone,
  Clock,
  User as UserIcon,
  Calendar,
  Lock,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { userService } from "@/services/userService";
import { roleService } from "@/services/roleService";
import { outletService } from "@/services/outletService";
import { initialRoles } from "@/data/mockRoles";
import { initialOutlets } from "@/data/mockOutlets";
import { UserDetailSkeleton } from "@/components/users/UserSkeleton";
import { UserServer502 } from "@/components/users/UserServer502";
import type { User, StatusUser } from "@/types/user";

interface UserDetailPageProps {
  userId?: number;
  onNavigate?: (path: string) => void;
}

export const UserDetailPage: React.FC<UserDetailPageProps> = ({
  userId,
  onNavigate,
}) => {
  const { t, currentLanguage } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveUserId = userId ?? (id ? Number(id) : undefined);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const [user, setUser] = useState<User | null>(null);
  const [roleName, setRoleName] = useState<string>("");
  const [outletName, setOutletName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [error] = useState<string | null>(
    effectiveUserId ? null : t.users.emptyTitle,
  );

  const loadDetail = useCallback(async () => {
    if (!effectiveUserId) return;
    setIsLoading(true);
    setIsServerDown(false);

    try {
      const [userRes, rolesRes, outletsRes] = await Promise.all([
        userService.getById(effectiveUserId),
        roleService.getAll().catch(() => ({ data: initialRoles, isLive: false })),
        outletService.getAll().catch(() => ({ data: initialOutlets, isLive: false })),
      ]);

      if (!userRes.isLive || !userRes.data) {
        setIsServerDown(true);
        return;
      }

      const fetchedUser = userRes.data;
      setUser(fetchedUser);

      // Match Role and Outlet names
      const matchedRole = rolesRes.data?.find((r) => r.id_role === fetchedUser.role_id);
      if (matchedRole) {
        setRoleName(matchedRole.display_name || matchedRole.role_name);
      } else {
        setRoleName(`Role #${fetchedUser.role_id}`);
      }

      const matchedOutlet = outletsRes.data?.find((o) => o.id_outlet === fetchedUser.outlet_id);
      if (matchedOutlet) {
        setOutletName(matchedOutlet.outlet_name);
      } else {
        setOutletName(`Outlet #${fetchedUser.outlet_id}`);
      }
    } catch {
      setIsServerDown(true);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUserId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDetail();
  }, [loadDetail]);

  const formatDate = (isoString?: string | null) => {
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

  const renderStatusBadge = (status?: StatusUser, isActive?: boolean) => {
    if (isActive === false && status === "inactive") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
          <span>{t.users.statusInactive}</span>
        </span>
      );
    }

    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t.users.statusActive}</span>
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{t.users.statusSuspended}</span>
          </span>
        );
      case "banned":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{t.users.statusBanned}</span>
          </span>
        );
      case "inactive":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <span>{t.users.statusInactive}</span>
          </span>
        );
    }
  };

  if (isLoading) {
    return <UserDetailSkeleton />;
  }

  if (isServerDown) {
    return <UserServer502 onRetry={loadDetail} />;
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
          {error || t.users.emptyTitle}
        </div>
        <button
          type="button"
          onClick={() => handleNavigate("/master/users")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          <span>{t.users.btnBack}</span>
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
          onClick={() => handleNavigate("/master/users")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.common.masterData}
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => handleNavigate("/master/users")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.users.title}
        </button>
        <span>/</span>
        <span className="font-semibold text-foreground">
          {t.users.detailTitle}
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <UserIcon className="w-7 h-7 text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {user.name}
              </h1>
              {renderStatusBadge(user.status, user.is_active)}
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              {t.users.detailIdInfo
                .replace("{id}", String(user.id_user))
                .replace("{username}", user.username)
                .replace("{role}", roleName)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleNavigate(`/master/users/edit/${user.id_user}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{t.users.btnEditData}</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/master/users")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            <span>{t.users.btnBack}</span>
          </button>
        </div>
      </div>

      {/* Grid of Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Identitas Profil Pengguna */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <UserIcon className="w-4 h-4 text-primary" />
            <h2>{t.users.cardBasicInfo}</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.users.labelName}
              </span>
              <span className="font-semibold text-foreground text-sm">
                {user.name}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.users.labelUsername}
              </span>
              <span className="font-mono font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-border/60">
                @{user.username}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                ID Sistem
              </span>
              <span className="font-mono text-muted-foreground">
                #{user.id_user}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Informasi Kontak & Komunikasi */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Mail className="w-4 h-4 text-primary" />
            <h2>{t.users.cardContact}</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.users.labelEmail}
              </span>
              <span className="font-semibold text-foreground">
                {user.email}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.users.labelPhone}
              </span>
              <span className="font-mono text-foreground font-medium flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                {user.phone_number || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Wewenang & Penempatan Cabang */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <h2>{t.users.cardRoleOutlet}</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.users.labelRole}
              </span>
              <span className="font-mono font-semibold text-foreground px-2 py-0.5 rounded-md bg-muted border border-border/70 inline-block mt-0.5">
                {roleName}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.users.labelOutlet}
              </span>
              <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                <Store className="w-3.5 h-3.5 text-muted-foreground" />
                {outletName}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Status & Keamanan Akun */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Lock className="w-4 h-4 text-primary" />
            <h2>{t.users.cardSecurity}</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.users.labelStatus}
              </span>
              <div className="mt-1">
                {renderStatusBadge(user.status, user.is_active)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.users.colLastLogin}
              </span>
              <span className="font-mono text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(user.last_login)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Catatan Waktu Sistem (Full width) */}
        <div className="md:col-span-2 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <h2>{t.users.cardTimestamps}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.users.colCreatedAt}
              </span>
              <span className="text-foreground font-medium">
                {formatDate(user.created_at)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Terakhir Diperbarui
              </span>
              <span className="text-foreground font-medium">
                {formatDate(user.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
