import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { outletService } from "@/services/outletService";
import { OutletDetailSkeleton } from "@/components/outlets/OutletSkeleton";
import { OutletServer502 } from "@/components/outlets/OutletServer502";
import type { Outlet, StatusOutlet } from "@/types/outlet";

interface OutletDetailPageProps {
  outletId?: number;
  onNavigate?: (path: string) => void;
}

export const OutletDetailPage: React.FC<OutletDetailPageProps> = ({
  outletId,
  onNavigate,
}) => {
  const { t, currentLanguage } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveOutletId = outletId ?? (id ? Number(id) : undefined);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [error] = useState<string | null>(
    effectiveOutletId ? null : t.outlets.emptyTitle,
  );

  const loadDetail = useCallback(async () => {
    if (!effectiveOutletId) return;
    setIsLoading(true);
    setIsServerDown(false);
    const startTime = Date.now();

    try {
      const res = await outletService.getById(effectiveOutletId);

      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }

      if (!res.isLive || !res.data) {
        setIsServerDown(true);
        return;
      }

      setOutlet(res.data);
    } catch {
      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }
      setIsServerDown(true);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveOutletId]);

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

  const renderStatusBadge = (status: StatusOutlet) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{t.outlets.statusActive}</span>
          </span>
        );
      case "renovation":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{t.outlets.statusRenovation}</span>
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{t.outlets.statusClosed}</span>
          </span>
        );
      case "inactive":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <span>{t.outlets.statusInactive}</span>
          </span>
        );
    }
  };

  if (isLoading) {
    return <OutletDetailSkeleton />;
  }

  if (isServerDown) {
    return <OutletServer502 onRetry={loadDetail} />;
  }

  if (error || !outlet) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
          {error || t.outlets.emptyTitle}
        </div>
        <button
          type="button"
          onClick={() => handleNavigate("/master/outlets")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          <span>{t.outlets.btnBack}</span>
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
          onClick={() => handleNavigate("/master/outlets")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.common.masterData}
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => handleNavigate("/master/outlets")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.outlets.title}
        </button>
        <span>/</span>
        <span className="font-semibold text-foreground">
          {t.outlets.detailTitle}
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {outlet.outlet_name}
            </h1>
            <div>{renderStatusBadge(outlet.status_outlet)}</div>
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {t.outlets.detailIdInfo
              .replace("{id}", String(outlet.id_outlet))
              .replace("{code}", outlet.outlet_code)
              .replace("{city}", outlet.city)}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              handleNavigate(`/master/outlets/edit/${outlet.id_outlet}`)
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{t.outlets.editOutlet}</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/master/outlets")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            <span>{t.outlets.btnBack}</span>
          </button>
        </div>
      </div>

      {/* Grid of 5 Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Identifikasi Dasar Cabang */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.outlets.cardBasicInfo}
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.outlets.labelOutletName}
              </span>
              <span className="font-semibold text-foreground text-sm">
                {outlet.outlet_name}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.outlets.labelCode}
              </span>
              <span className="font-mono font-medium text-foreground bg-muted/50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                {outlet.outlet_code}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.outlets.labelStatus}
              </span>
              <div className="mt-1">{renderStatusBadge(outlet.status_outlet)}</div>
            </div>
          </div>
        </div>

        {/* Card 2: Lokasi & Kontak */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.outlets.cardLocationContact}
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.outlets.labelCity}
              </span>
              <span className="font-semibold text-foreground">
                {outlet.city}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.outlets.labelPhone}
              </span>
              <span className="font-mono font-semibold text-foreground">
                {outlet.phone_number || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.outlets.labelAddress}
              </span>
              <span className="text-foreground leading-relaxed block mt-0.5">
                {outlet.address}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Jam Operasional Cabang */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.outlets.cardOperatingHours}
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.outlets.labelOpeningHours}
              </span>
              <span className="font-mono text-base font-bold text-foreground block mt-0.5">
                {outlet.opening_hours}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.outlets.labelClosingHours}
              </span>
              <span className="font-mono text-base font-bold text-foreground block mt-0.5">
                {outlet.closing_hours}
              </span>
            </div>
            <div className="col-span-2 pt-2 border-t border-border/50">
              <span className="text-muted-foreground block text-[11px]">
                {t.outlets.labelHours}
              </span>
              <span className="font-medium text-foreground block mt-0.5">
                {outlet.opening_hours} WIB s/d {outlet.closing_hours} WIB
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Status Operasional & Kebijakan Bisnis */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.outlets.cardStatusOperational}
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.outlets.colStatus}
              </span>
              <div className="mt-1">{renderStatusBadge(outlet.status_outlet)}</div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed pt-2 border-t border-border/50">
              {t.outlets.statusHelp}
            </p>
          </div>
        </div>

        {/* Card 5: Catatan Waktu Sistem */}
        <div className="col-span-1 md:col-span-2 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.outlets.cardTimestamps}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.common.date} Dibuat
              </span>
              <span className="font-medium text-foreground block mt-0.5">
                {formatDate(outlet.created_at)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.common.date} Terakhir Diperbarui
              </span>
              <span className="font-medium text-foreground block mt-0.5">
                {formatDate(outlet.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutletDetailPage;
