import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Pencil, Scale, Layers, CheckCircle2, Calendar } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { unitService } from "@/services/unitService";
import { UnitDetailSkeleton } from "@/components/units/UnitSkeleton";
import { UnitServer502 } from "@/components/units/UnitServer502";
import type { Unit, TypeUnit } from "@/types/unit";

interface UnitDetailPageProps {
  unitId?: number;
  onNavigate?: (path: string) => void;
}

export const UnitDetailPage: React.FC<UnitDetailPageProps> = ({
  unitId,
  onNavigate,
}) => {
  const { t, currentLanguage } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveUnitId = unitId ?? (id ? Number(id) : undefined);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const [unit, setUnit] = useState<Unit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [error] = useState<string | null>(
    effectiveUnitId ? null : t.units.emptyTitle,
  );

  const loadDetail = useCallback(async () => {
    if (!effectiveUnitId) return;
    setIsLoading(true);
    setIsServerDown(false);
    const startTime = Date.now();

    try {
      const res = await unitService.getById(effectiveUnitId);

      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }

      if (!res.isLive || !res.data) {
        setIsServerDown(true);
        return;
      }

      setUnit(res.data);
    } catch {
      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }
      setIsServerDown(true);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUnitId]);

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

  const renderTypeBadge = (type?: TypeUnit) => {
    switch (type) {
      case "weight":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>{t.units.typeWeight}</span>
          </span>
        );
      case "volume":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>{t.units.typeVolume}</span>
          </span>
        );
      case "count":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{t.units.typeCount}</span>
          </span>
        );
      case "package":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{t.units.typePackage}</span>
          </span>
        );
    }
  };

  const renderStatusBadge = (isActive?: boolean) => {
    if (isActive !== false) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t.units.statusActive}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
        <span>{t.units.statusInactive}</span>
      </span>
    );
  };

  if (isLoading) {
    return <UnitDetailSkeleton />;
  }

  if (isServerDown) {
    return <UnitServer502 onRetry={loadDetail} />;
  }

  if (error || !unit) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
          {error || t.units.emptyTitle}
        </div>
        <button
          type="button"
          onClick={() => handleNavigate("/master/units")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          <span>{t.units.btnBack}</span>
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
          onClick={() => handleNavigate("/master/units")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.common.masterData}
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => handleNavigate("/master/units")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.units.title}
        </button>
        <span>/</span>
        <span className="font-semibold text-foreground">
          {t.units.detailTitle}
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {unit.unit_name}
            </h1>
            <div>{renderStatusBadge(unit.is_active)}</div>
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {t.units.detailIdInfo
              .replace("{id}", String(unit.id_unit))
              .replace("{code}", unit.unit_code)
              .replace("{symbol}", unit.short_name)}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              handleNavigate(`/master/units/edit/${unit.id_unit}`)
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{t.units.btnEditData}</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/master/units")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            <span>{t.units.btnBack}</span>
          </button>
        </div>
      </div>

      {/* Grid of 4 Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Identitas Satuan */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Scale className="w-4 h-4 text-primary" />
            <h2>{t.units.cardBasicInfo}</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.units.labelUnitName}
              </span>
              <span className="font-semibold text-foreground text-sm">
                {unit.unit_name}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.units.labelCode}
              </span>
              <span className="font-mono font-medium text-foreground bg-muted/50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                {unit.unit_code}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.units.labelShortName}
              </span>
              <span className="font-mono font-bold text-foreground bg-muted/60 px-2.5 py-1 rounded-md inline-block mt-0.5">
                {unit.short_name}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Klasifikasi Pengukuran */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Layers className="w-4 h-4 text-primary" />
            <h2>{t.units.cardMeasurement}</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.units.labelType}
              </span>
              <div className="mt-1">{renderTypeBadge(unit.type)}</div>
            </div>
            <div className="pt-2 border-t border-border/40">
              <span className="text-muted-foreground block text-[11px]">
                Penggunaan Sistem
              </span>
              <p className="text-muted-foreground leading-relaxed mt-0.5">
                Satuan ini digunakan sebagai standar konversi pengukuran pada inventaris bahan baku, resep, dan produksi.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Status Keaktifan */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <h2>{t.units.cardStatus}</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.units.labelStatus}
              </span>
              <div className="mt-1">{renderStatusBadge(unit.is_active)}</div>
            </div>
            <div className="pt-2 border-t border-border/40">
              <span className="text-muted-foreground block text-[11px]">
                Visibilitas Formulir
              </span>
              <p className="text-muted-foreground leading-relaxed mt-0.5">
                {unit.is_active
                  ? "Satuan aktif dan tersedia untuk dipilih pada modul Bahan Baku, Resep, dan Pesanan Pembelian."
                  : "Satuan dinonaktifkan sementara dan disembunyikan dari pilihan formulir baru."}
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Riwayat Waktu Sistem */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <h2>{t.units.cardTimestamps}</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Dibuat Pada:
              </span>
              <span className="font-mono text-foreground">
                {formatDate(unit.created_at)}
              </span>
            </div>
            <div className="pt-2 border-t border-border/40">
              <span className="text-muted-foreground block text-[11px]">
                Pembaruan Terakhir:
              </span>
              <span className="font-mono text-foreground">
                {formatDate(unit.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitDetailPage;
