import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { wirehouseService } from "@/services/wirehouseService";
import { WirehouseDetailSkeleton } from "@/components/wirehouses/WirehouseSkeleton";
import { WirehouseServer502 } from "@/components/wirehouses/WirehouseServer502";
import type { Wirehouse, TypeWirehouse, StatusWirehouse } from "@/types/wirehouse";

interface WirehouseDetailPageProps {
  wirehouseId?: number;
  onNavigate?: (path: string) => void;
}

export const WirehouseDetailPage: React.FC<WirehouseDetailPageProps> = ({
  wirehouseId,
  onNavigate,
}) => {
  const { t, currentLanguage } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveWirehouseId = wirehouseId ?? (id ? Number(id) : undefined);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const [wirehouse, setWirehouse] = useState<Wirehouse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [error] = useState<string | null>(
    effectiveWirehouseId ? null : t.wirehouses.emptyTitle,
  );

  const loadDetail = useCallback(async () => {
    if (!effectiveWirehouseId) return;
    setIsLoading(true);
    setIsServerDown(false);
    const startTime = Date.now();

    try {
      const res = await wirehouseService.getById(effectiveWirehouseId);

      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }

      if (!res.isLive || !res.data) {
        setIsServerDown(true);
        return;
      }

      setWirehouse(res.data);
    } catch {
      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }
      setIsServerDown(true);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveWirehouseId]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadDetail();
    }
    return () => {
      isMounted = false;
    };
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

  const renderTypeBadge = (type?: TypeWirehouse) => {
    switch (type) {
      case "main":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>{t.wirehouses.typeMain}</span>
          </span>
        );
      case "kitchen":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{t.wirehouses.typeKitchen}</span>
          </span>
        );
      case "bar":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>{t.wirehouses.typeBar}</span>
          </span>
        );
      case "storage":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{t.wirehouses.typeStorage}</span>
          </span>
        );
    }
  };

  const renderStatusBadge = (status?: StatusWirehouse) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{t.wirehouses.statusActive}</span>
          </span>
        );
      case "maintenance":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{t.wirehouses.statusMaintenance}</span>
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{t.wirehouses.statusClosed}</span>
          </span>
        );
      case "inactive":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <span>{t.wirehouses.statusInactive}</span>
          </span>
        );
    }
  };

  if (isLoading) {
    return <WirehouseDetailSkeleton />;
  }

  if (isServerDown) {
    return <WirehouseServer502 onRetry={loadDetail} />;
  }

  if (error || !wirehouse) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
          {error || t.wirehouses.emptyTitle}
        </div>
        <button
          type="button"
          onClick={() => handleNavigate("/master/warehouses")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          <span>{t.wirehouses.btnBack}</span>
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
          onClick={() => handleNavigate("/master/warehouses")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.common.masterData}
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => handleNavigate("/master/warehouses")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.wirehouses.title}
        </button>
        <span>/</span>
        <span className="font-semibold text-foreground">
          {t.wirehouses.detailTitle}
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {wirehouse.wirehouse_name}
            </h1>
            <div>{renderStatusBadge(wirehouse.status)}</div>
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {t.wirehouses.detailIdInfo
              .replace("{id}", String(wirehouse.id_wirehouse))
              .replace("{code}", wirehouse.wirehouse_code)
              .replace("{city}", wirehouse.city)}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              handleNavigate(`/master/warehouses/edit/${wirehouse.id_wirehouse}`)
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{t.wirehouses.btnEditData}</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/master/warehouses")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            <span>{t.wirehouses.btnBack}</span>
          </button>
        </div>
      </div>

      {/* Grid of 5 Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Identifikasi Dasar Gudang */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.wirehouses.cardBasicInfo}
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.wirehouses.labelWirehouseName}
              </span>
              <span className="font-semibold text-foreground text-sm">
                {wirehouse.wirehouse_name}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.wirehouses.labelCode}
              </span>
              <span className="font-mono font-medium text-foreground bg-muted/50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                {wirehouse.wirehouse_code}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.wirehouses.labelStatus}
              </span>
              <div className="mt-1">{renderStatusBadge(wirehouse.status)}</div>
            </div>
          </div>
        </div>

        {/* Card 2: Relasi Outlet & Penanggung Jawab */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.wirehouses.cardOutletManager}
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.wirehouses.labelOutlet}
              </span>
              <span className="font-semibold text-foreground">
                {wirehouse.Outlet?.outlet_name || `Outlet #${wirehouse.outlet_id}`}
              </span>
              {wirehouse.Outlet?.outlet_code && (
                <span className="font-mono text-[10px] text-muted-foreground block mt-0.5">
                  Kode: {wirehouse.Outlet.outlet_code}
                </span>
              )}
            </div>
            <div className="pt-2 border-t border-border/40">
              <span className="text-muted-foreground block text-[11px]">
                {t.wirehouses.labelManager}
              </span>
              <span className="font-semibold text-foreground">
                {wirehouse.User?.name || "—"}
              </span>
              {wirehouse.User?.email && (
                <span className="text-muted-foreground text-[11px] block mt-0.5">
                  {wirehouse.User.email}
                </span>
              )}
              {wirehouse.User?.phone_number && (
                <span className="font-mono text-muted-foreground text-[11px] block">
                  {wirehouse.User.phone_number}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Lokasi & Kontak Fisik */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.wirehouses.cardLocationContact}
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.wirehouses.labelCity}
              </span>
              <span className="font-semibold text-foreground">
                {wirehouse.city}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.wirehouses.labelPhone}
              </span>
              <span className="font-mono font-semibold text-foreground">
                {wirehouse.phone_number || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.wirehouses.labelAddress}
              </span>
              <span className="text-foreground leading-relaxed block mt-0.5">
                {wirehouse.address}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Klasifikasi Tipe & Kebijakan Fasilitas */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.wirehouses.cardStatusType}
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.wirehouses.labelType}
              </span>
              <div className="mt-1">{renderTypeBadge(wirehouse.type)}</div>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.wirehouses.colStatus}
              </span>
              <div className="mt-1">{renderStatusBadge(wirehouse.status)}</div>
            </div>
          </div>
        </div>

        {/* Card 5: Catatan Waktu Sistem */}
        <div className="col-span-1 md:col-span-2 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.wirehouses.cardTimestamps}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.common.date} Dibuat
              </span>
              <span className="font-medium text-foreground block mt-0.5">
                {formatDate(wirehouse.created_at)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.common.date} Terakhir Diperbarui
              </span>
              <span className="font-medium text-foreground block mt-0.5">
                {formatDate(wirehouse.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WirehouseDetailPage;
