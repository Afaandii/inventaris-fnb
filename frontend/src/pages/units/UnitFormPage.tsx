import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { unitService } from "@/services/unitService";
import { UnitFormSkeleton } from "@/components/units/UnitSkeleton";
import { UnitServer502 } from "@/components/units/UnitServer502";
import type { Unit, UnitFormData, TypeUnit } from "@/types/unit";

interface UnitFormPageProps {
  mode: "create" | "edit";
  unitId?: number;
  onNavigate?: (path: string) => void;
  onSuccess?: (message: string) => void;
}

export const UnitFormPage: React.FC<UnitFormPageProps> = ({
  mode,
  unitId,
  onNavigate,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveUnitId = unitId ?? (id ? Number(id) : undefined);
  const isEdit = mode === "edit";

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  // Form Fields State
  const [unitName, setUnitName] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [shortName, setShortName] = useState("");
  const [type, setType] = useState<TypeUnit>("weight");
  const [isActive, setIsActive] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Load existing unit data if edit with 3-second skeleton & 502 check
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsServerDown(false);
    const startTime = Date.now();

    try {
      let editItem: Unit | null = null;
      let editLive = true;

      if (isEdit && effectiveUnitId) {
        const itemRes = await unitService.getById(effectiveUnitId);
        editItem = itemRes.data;
        editLive = itemRes.isLive;
      } else {
        const isLive = await unitService.checkBackend();
        if (!isLive) {
          editLive = false;
        }
      }

      // Maintain skeleton loading for ~3 seconds
      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }

      // Check if backend returned valid live response
      if (!editLive || (isEdit && !editItem)) {
        setIsServerDown(true);
        return;
      }

      // Populate form if in edit mode
      if (isEdit && editItem) {
        setUnitName(editItem.unit_name);
        setUnitCode(editItem.unit_code);
        setShortName(editItem.short_name);
        setType(editItem.type);
        setIsActive(editItem.is_active);
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
  }, [isEdit, effectiveUnitId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!unitName.trim()) {
      newErrors.unitName = t.units.validationNameRequired;
    } else if (unitName.trim().length < 3) {
      newErrors.unitName = t.units.validationNameMin;
    }

    if (!shortName.trim()) {
      newErrors.shortName = t.units.validationShortNameRequired;
    } else if (shortName.trim().length < 1) {
      newErrors.shortName = t.units.validationShortNameMin;
    }

    if (!type) {
      newErrors.type = t.units.validationTypeRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerError(null);

    const formData: UnitFormData = {
      unit_name: unitName.trim(),
      short_name: shortName.trim(),
      type: type,
      is_active: isActive,
    };

    try {
      if (isEdit && effectiveUnitId) {
        const res = await unitService.update(effectiveUnitId, formData);
        if (!res.isLive) {
          setIsServerDown(true);
          return;
        }
        if (onSuccess) {
          onSuccess(t.units.toastUpdateSuccess);
        } else {
          handleNavigate("/master/units");
        }
      } else {
        const res = await unitService.create(formData);
        if (!res.isLive) {
          setIsServerDown(true);
          return;
        }
        if (onSuccess) {
          onSuccess(t.units.toastCreateSuccess);
        } else {
          handleNavigate("/master/units");
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t.units.errorServerGeneric;
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Show full-screen 502 Bad Gateway if server is unreachable
  if (isServerDown) {
    return <UnitServer502 onRetry={loadData} />;
  }

  // 2. Show Skeleton while loading (~3 seconds)
  if (isLoading) {
    return <UnitFormSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          onClick={() => handleNavigate("/master/units")}
          className="hover:text-foreground cursor-pointer transition-colors"
        >
          {t.units.title}
        </span>
        <span>/</span>
        <span className="text-foreground font-medium">
          {isEdit ? t.units.editUnit : t.units.addUnit}
        </span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? t.units.editUnit : t.units.addUnit}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isEdit
              ? t.units.editSubtitle.replace(
                  "{id}",
                  String(effectiveUnitId || ""),
                )
              : t.units.createSubtitle}
          </p>
        </div>

        {/* Back Button with text 'Kembali' / 'Back' */}
        <button
          type="button"
          onClick={() => handleNavigate("/master/units")}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-6 py-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span>{t.units.btnBack}</span>
        </button>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
          {serverError}
        </div>
      )}

      {/* Form Container (All fields col-span-12, strictly NO placeholder and NO explanation paragraph) */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-6 space-y-6"
      >
        <div className="grid grid-cols-12 gap-5">
          {/* Field 1: Nama Satuan Lengkap (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.units.labelUnitName} *
            </label>
            <input
              type="text"
              value={unitName}
              maxLength={120}
              onChange={(e) => {
                setUnitName(e.target.value);
                if (errors.unitName) {
                  setErrors((prev) => ({ ...prev, unitName: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all ${
                errors.unitName
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.unitName && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.unitName}
              </p>
            )}
          </div>

          {/* Field 2: Kode Satuan (12 cols, readonly/generated) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.units.labelCode}
            </label>
            <input
              type="text"
              readOnly
              value={unitCode || (isEdit ? "" : "UNT-AUTO-GENERATED")}
              disabled
              className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/40 font-mono text-muted-foreground text-xs cursor-not-allowed select-none"
            />
          </div>

          {/* Field 3: Simbol / Singkatan Resmi (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.units.labelShortName} *
            </label>
            <input
              type="text"
              value={shortName}
              maxLength={20}
              onChange={(e) => {
                setShortName(e.target.value);
                if (errors.shortName) {
                  setErrors((prev) => ({ ...prev, shortName: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-2 transition-all ${
                errors.shortName
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.shortName && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.shortName}
              </p>
            )}
          </div>

          {/* Field 4: Tipe Pengukuran Satuan (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.units.labelType} *
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as TypeUnit);
                if (errors.type) {
                  setErrors((prev) => ({ ...prev, type: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                errors.type
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            >
              <option value="weight">{t.units.typeWeight}</option>
              <option value="volume">{t.units.typeVolume}</option>
              <option value="count">{t.units.typeCount}</option>
              <option value="package">{t.units.typePackage}</option>
            </select>
            {errors.type && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.type}
              </p>
            )}
          </div>

          {/* Field 5: Status Operasional (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.units.labelStatus} *
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border border-border/70 bg-muted/40">
              <button
                type="button"
                onClick={() => setIsActive(true)}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-card text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{t.units.statusActive}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsActive(false)}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs transition-all cursor-pointer ${
                  !isActive
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                <span>{t.units.statusInactive}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons: strictly "Batal" and "Simpan" */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={() => handleNavigate("/master/units")}
            disabled={isSubmitting}
            className="px-10 py-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all disabled:opacity-50 cursor-pointer"
          >
            {t.units.btnCancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? t.units.btnSaving : t.units.btnSave}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UnitFormPage;
