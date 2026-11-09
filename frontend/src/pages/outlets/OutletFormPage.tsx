import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { outletService } from "@/services/outletService";
import { OutletFormSkeleton } from "@/components/outlets/OutletSkeleton";
import { OutletServer502 } from "@/components/outlets/OutletServer502";
import { TimePicker } from "@/components/ui/time-picker";
import type { Outlet, OutletFormData, StatusOutlet } from "@/types/outlet";

interface OutletFormPageProps {
  mode: "create" | "edit";
  outletId?: number;
  onNavigate?: (path: string) => void;
  onSuccess?: (message: string) => void;
}

export const OutletFormPage: React.FC<OutletFormPageProps> = ({
  mode,
  outletId,
  onNavigate,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveOutletId = outletId ?? (id ? Number(id) : undefined);
  const isEdit = mode === "edit";

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  // Form Fields State
  const [outletName, setOutletName] = useState("");
  const [outletCode, setOutletCode] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [openingHours, setOpeningHours] = useState("08:00");
  const [closingHours, setClosingHours] = useState("22:00");
  const [statusOutlet, setStatusOutlet] = useState<StatusOutlet>("active");

  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Load existing outlet data if edit with 3-second skeleton & 502 check
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsServerDown(false);
    const startTime = Date.now();

    try {
      let editItem: Outlet | null = null;
      let editLive = true;

      if (isEdit && effectiveOutletId) {
        const itemRes = await outletService.getById(effectiveOutletId);
        editItem = itemRes.data;
        editLive = itemRes.isLive;
      } else {
        // For create mode, verify backend is reachable
        const isLive = await outletService.checkBackend();
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

      if (isEdit && editItem) {
        setOutletName(editItem.outlet_name);
        setOutletCode(editItem.outlet_code);
        setCity(editItem.city);
        setAddress(editItem.address);
        setPhoneNumber(editItem.phone_number);
        setOpeningHours(editItem.opening_hours || "08:00");
        setClosingHours(editItem.closing_hours || "22:00");
        setStatusOutlet(editItem.status_outlet || "active");
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
  }, [isEdit, effectiveOutletId]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
    }
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  // Form validation
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!outletName.trim()) {
      newErrors.outletName = t.outlets.validationNameRequired;
    } else if (outletName.trim().length < 3) {
      newErrors.outletName = t.outlets.validationNameMin;
    } else if (outletName.trim().length > 125) {
      newErrors.outletName = "Nama outlet maksimal 125 karakter";
    }

    if (!city.trim()) {
      newErrors.city = t.outlets.validationCityRequired;
    } else if (city.trim().length > 60) {
      newErrors.city = "Nama kota maksimal 60 karakter";
    }

    if (!address.trim()) {
      newErrors.address = t.outlets.validationAddressRequired;
    } else if (address.trim().length > 150) {
      newErrors.address = "Alamat maksimal 150 karakter";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = t.outlets.validationPhoneRequired;
    } else if (!/^[0-9+\s\-()]+$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = t.outlets.validationPhoneFormat;
    } else if (phoneNumber.trim().length > 20) {
      newErrors.phoneNumber = "Nomor telepon maksimal 20 karakter";
    }

    if (!openingHours.trim()) {
      newErrors.openingHours = t.outlets.validationOpeningRequired;
    }

    if (!closingHours.trim()) {
      newErrors.closingHours = t.outlets.validationClosingRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    const formData: OutletFormData = {
      outlet_name: outletName.trim(),
      city: city.trim(),
      address: address.trim(),
      phone_number: phoneNumber.trim(),
      opening_hours: openingHours.trim(),
      closing_hours: closingHours.trim(),
      status_outlet: statusOutlet,
    };

    try {
      if (isEdit && effectiveOutletId) {
        const res = await outletService.update(effectiveOutletId, formData);
        if (!res.isLive) {
          setIsServerDown(true);
          return;
        }
        if (onSuccess) {
          onSuccess(t.outlets.toastUpdateSuccess);
        }
      } else {
        const res = await outletService.create(formData);
        if (!res.isLive) {
          setIsServerDown(true);
          return;
        }
        if (onSuccess) {
          onSuccess(t.outlets.toastCreateSuccess);
        }
      }
      handleNavigate("/master/outlets");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : t.outlets.toastErrorNetwork;
      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <OutletFormSkeleton />;
  }

  if (isServerDown) {
    return <OutletServer502 onRetry={loadData} />;
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
          {isEdit ? t.outlets.editOutlet : t.outlets.addOutlet}
        </span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? t.outlets.editOutlet : t.outlets.addOutlet}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isEdit
              ? t.outlets.editSubtitle.replace(
                  "{id}",
                  String(effectiveOutletId || ""),
                )
              : t.outlets.createSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleNavigate("/master/outlets")}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-6 py-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span>{t.outlets.btnBack}</span>
        </button>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
          {serverError}
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-6 space-y-6"
      >
        <div className="grid grid-cols-12 gap-5">
          {/* Field 1: Nama Outlet Cabang (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.outlets.labelOutletName} *
            </label>
            <input
              type="text"
              value={outletName}
              maxLength={125}
              onChange={(e) => {
                setOutletName(e.target.value);
                if (errors.outletName) {
                  setErrors((prev) => ({ ...prev, outletName: "" }));
                }
              }}
              placeholder={t.outlets.formNamePlaceholder}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all ${
                errors.outletName
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.outletName && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.outletName}
              </p>
            )}
          </div>

          {/* Field 2: Kode Outlet (12 cols, readonly/generated) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.outlets.labelCode}
            </label>
            <input
              type="text"
              readOnly
              value={outletCode || (isEdit ? "" : "OTL-AUTO-GENERATED")}
              disabled
              placeholder="OTL-AUTO-GENERATED"
              className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/40 font-mono text-muted-foreground text-xs cursor-not-allowed select-none"
            />
            <p className="text-[11px] text-muted-foreground">
              {t.outlets.codeHelp}
            </p>
          </div>

          {/* Field 3: Kota (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.outlets.labelCity} *
            </label>
            <input
              type="text"
              value={city}
              maxLength={60}
              onChange={(e) => {
                setCity(e.target.value);
                if (errors.city) {
                  setErrors((prev) => ({ ...prev, city: "" }));
                }
              }}
              placeholder={t.outlets.formCityPlaceholder}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all ${
                errors.city
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.city ? (
              <p className="text-[11px] text-destructive font-medium">
                {errors.city}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                {t.outlets.cityHelp}
              </p>
            )}
          </div>

          {/* Field 4: Nomor Telepon (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.outlets.labelPhone} *
            </label>
            <input
              type="text"
              value={phoneNumber}
              maxLength={20}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (errors.phoneNumber) {
                  setErrors((prev) => ({ ...prev, phoneNumber: "" }));
                }
              }}
              placeholder={t.outlets.formPhonePlaceholder}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all font-mono ${
                errors.phoneNumber
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.phoneNumber ? (
              <p className="text-[11px] text-destructive font-medium">
                {errors.phoneNumber}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                {t.outlets.phoneHelp}
              </p>
            )}
          </div>

          {/* Field 5: Alamat Fisik Lengkap (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.outlets.labelAddress} *
            </label>
            <textarea
              rows={3}
              value={address}
              maxLength={150}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) {
                  setErrors((prev) => ({ ...prev, address: "" }));
                }
              }}
              placeholder={t.outlets.formAddressPlaceholder}
              className={`w-full p-3.5 rounded-xl border bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.address
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.address ? (
              <p className="text-[11px] text-destructive font-medium">
                {errors.address}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                {t.outlets.addressHelp}
              </p>
            )}
          </div>

          {/* Field 6: Jam Buka (6 cols sm / 12 cols mobile) */}
          <div className="col-span-12 sm:col-span-6 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.outlets.labelOpeningHours} *
            </label>
            <TimePicker
              value={openingHours}
              onChange={(val) => {
                setOpeningHours(val);
                if (errors.openingHours) {
                  setErrors((prev) => ({ ...prev, openingHours: "" }));
                }
              }}
              hasError={!!errors.openingHours}
            />
            {errors.openingHours && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.openingHours}
              </p>
            )}
          </div>

          {/* Field 7: Jam Tutup (6 cols sm / 12 cols mobile) */}
          <div className="col-span-12 sm:col-span-6 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.outlets.labelClosingHours} *
            </label>
            <TimePicker
              value={closingHours}
              onChange={(val) => {
                setClosingHours(val);
                if (errors.closingHours) {
                  setErrors((prev) => ({ ...prev, closingHours: "" }));
                }
              }}
              hasError={!!errors.closingHours}
            />
            {errors.closingHours && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.closingHours}
              </p>
            )}
          </div>

          {/* Field 8: Status Operasional Cabang (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.outlets.labelStatus} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 rounded-xl border border-border/70 bg-muted/30">
              <button
                type="button"
                onClick={() => setStatusOutlet("active")}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs transition-all cursor-pointer ${
                  statusOutlet === "active"
                    ? "bg-card text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{t.outlets.statusActive}</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusOutlet("inactive")}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs transition-all cursor-pointer ${
                  statusOutlet === "inactive"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                <span>{t.outlets.statusInactive}</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusOutlet("renovation")}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs transition-all cursor-pointer ${
                  statusOutlet === "renovation"
                    ? "bg-card text-amber-600 dark:text-amber-400 font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{t.outlets.statusRenovation}</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusOutlet("closed")}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs transition-all cursor-pointer ${
                  statusOutlet === "closed"
                    ? "bg-card text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>{t.outlets.statusClosed}</span>
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t.outlets.statusHelp}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={() => handleNavigate("/master/outlets")}
            disabled={isSubmitting}
            className="px-10 py-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all disabled:opacity-50 cursor-pointer"
          >
            {t.outlets.btnCancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? t.outlets.btnSaving
              : isEdit
                ? t.outlets.btnUpdate
                : t.outlets.btnSave}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OutletFormPage;
