import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Pencil, Shield, FileText, Calendar } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { roleService } from "@/services/roleService";
import { RoleDetailSkeleton } from "@/components/roles/RoleSkeleton";
import { RoleServer502 } from "@/components/roles/RoleServer502";
import type { Role } from "@/types/role";

interface RoleDetailPageProps {
  roleId?: number;
  onNavigate?: (path: string) => void;
}

export const RoleDetailPage: React.FC<RoleDetailPageProps> = ({
  roleId,
  onNavigate,
}) => {
  const { t, currentLanguage } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveRoleId = roleId ?? (id ? Number(id) : undefined);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [error] = useState<string | null>(
    effectiveRoleId ? null : t.roles.emptyTitle,
  );

  const loadDetail = useCallback(async () => {
    if (!effectiveRoleId) return;
    setIsLoading(true);
    setIsServerDown(false);
    const startTime = Date.now();

    try {
      const res = await roleService.getById(effectiveRoleId);

      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }

      if (!res.isLive || !res.data) {
        setIsServerDown(true);
        return;
      }

      setRole(res.data);
    } catch {
      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }
      setIsServerDown(true);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveRoleId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDetail();
  }, [loadDetail]);

  const formatDate = (isoString?: string) => {
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

  if (isLoading) {
    return <RoleDetailSkeleton />;
  }

  if (isServerDown) {
    return <RoleServer502 onRetry={loadDetail} />;
  }

  if (error || !role) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
          {error || t.roles.emptyTitle}
        </div>
        <button
          type="button"
          onClick={() => handleNavigate("/master/roles")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          <span>{t.roles.btnBack}</span>
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
          onClick={() => handleNavigate("/master/roles")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.common.masterData}
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => handleNavigate("/master/roles")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.roles.title}
        </button>
        <span>/</span>
        <span className="font-semibold text-foreground">
          {t.roles.detailTitle}
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {role.display_name}
            </h1>
            <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-muted text-foreground font-semibold border border-border/70">
              {role.role_name}
            </span>
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {t.roles.detailIdInfo
              .replace("{id}", String(role.id_role))
              .replace("{code}", role.role_name)
              .replace("{name}", role.display_name)}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              handleNavigate(`/master/roles/edit/${role.id_role}`)
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{t.roles.btnEditData}</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/master/roles")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            <span>{t.roles.btnBack}</span>
          </button>
        </div>
      </div>

      {/* Grid of Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Identitas Peran Sistem */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <h2>{t.roles.cardBasicInfo}</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.roles.labelDisplayName}
              </span>
              <span className="font-semibold text-foreground text-sm">
                {role.display_name}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.roles.labelRoleName}
              </span>
              <span className="font-mono font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-border/60">
                {role.role_name}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                ID Peran
              </span>
              <span className="font-mono text-muted-foreground">
                #{role.id_role}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Riwayat Waktu Sistem */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <h2>{t.roles.cardTimestamps}</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.roles.colCreatedAt}
              </span>
              <span className="text-foreground font-medium">
                {formatDate(role.created_at)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Terakhir Diperbarui
              </span>
              <span className="text-foreground font-medium">
                {formatDate(role.updated_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Lingkup Tugas & Deskripsi Wewenang (Full Width 2 cols on md+) */}
        <div className="md:col-span-2 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <FileText className="w-4 h-4 text-primary" />
            <h2>{t.roles.cardDescription}</h2>
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/30 p-3.5 rounded-xl border border-border/50">
            {role.description || "— Tidak ada deskripsi wewenang tambahan —"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleDetailPage;
