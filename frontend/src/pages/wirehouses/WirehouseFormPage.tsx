import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { wirehouseService } from "@/services/wirehouseService";
import { outletService } from "@/services/outletService";
import { WirehouseFormSkeleton } from "@/components/wirehouses/WirehouseSkeleton";
import { WirehouseServer502 } from "@/components/wirehouses/WirehouseServer502";
import type {
  Wirehouse,
  WirehouseFormData,
  TypeWirehouse,
  StatusWirehouse,
  ManagerUser,
  WirehouseOutlet,
} from "@/types/wirehouse";

interface WirehouseFormPageProps {
  mode: "create" | "edit";
  wirehouseId?: number;
  onNavigate?: (path: string) => void;
  onSuccess?: (message: string) => void;
}

export const WirehouseFormPage: React.FC<WirehouseFormPageProps> = ({
  mode,
  wirehouseId,
  onNavigate,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveWirehouseId = wirehouseId ?? (id ? Number(id) : undefined);
  const isEdit = mode === "edit";

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  // Form Fields State
  const [wirehouseName, setWirehouseName] = useState("");
  const [wirehouseCode, setWirehouseCode] = useState("");
  const [outletId, setOutletId] = useState<number | "">("");
  const [managerId, setManagerId] = useState<number | "">("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [type, setType] = useState<TypeWirehouse>("storage");
  const [status, setStatus] = useState<StatusWirehouse>("active");

  // Options State
  const [outletsList, setOutletsList] = useState<WirehouseOutlet[]>([]);
  const [managersList, setManagersList] = useState<ManagerUser[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Load existing wirehouse data if edit with 3-second skeleton & 502 check
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsServerDown(false);
    const startTime = Date.now();

    try {
      const [outletsRes, managersRes] = await Promise.all([
        outletService.getAll(),
        wirehouseService.getManagers(),
      ]);

      let editItem: Wirehouse | null = null;
      let editLive = true;

      if (isEdit && effectiveWirehouseId) {
        const itemRes = await wirehouseService.getById(effectiveWirehouseId);
        editItem = itemRes.data;
        editLive = itemRes.isLive;
      } else {
        const isLive = await wirehouseService.checkBackend();
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

      setOutletsList(outletsRes.data);
      setManagersList(managersRes.data);

      if (isEdit && editItem) {
        setWirehouseName(editItem.wirehouse_name);
        setWirehouseCode(editItem.wirehouse_code);
        setOutletId(editItem.outlet_id);
        setManagerId(editItem.manager_id || "");
        setCity(editItem.city);
        setAddress(editItem.address);
        setPhoneNumber(editItem.phone_number || "");
        setType(editItem.type || "storage");
        setStatus(editItem.status || "active");
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
  }, [isEdit, effectiveWirehouseId]);

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

    if (!wirehouseName.trim()) {
      newErrors.wirehouseName = t.wirehouses.validationNameRequired;
    } else if (wirehouseName.trim().length < 3) {
      newErrors.wirehouseName = t.wirehouses.validationNameMin;
    } else if (wirehouseName.trim().length > 180) {
      newErrors.wirehouseName = "Nama gudang maksimal 180 karakter";
    }

    if (!outletId) {
      newErrors.outletId = t.wirehouses.validationOutletRequired;
    }

    if (!managerId) {
      newErrors.managerId = t.wirehouses.validationManagerRequired;
    }

    if (!city.trim()) {
      newErrors.city = t.wirehouses.validationCityRequired;
    } else if (city.trim().length > 80) {
      newErrors.city = "Kota maksimal 80 karakter";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = t.wirehouses.validationPhoneRequired;
    } else if (phoneNumber.trim().length > 20) {
      newErrors.phoneNumber = "Nomor telepon maksimal 20 karakter";
    }

    if (!address.trim()) {
      newErrors.address = t.wirehouses.validationAddressRequired;
    } else if (address.trim().length > 120) {
      newErrors.address = "Alamat fisik maksimal 120 karakter";
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

    const formData: WirehouseFormData = {
      outlet_id: Number(outletId),
      manager_id: Number(managerId),
      wirehouse_name: wirehouseName.trim(),
      city: city.trim(),
      address: address.trim(),
      phone_number: phoneNumber.trim(),
      type,
      status,
    };

    try {
      if (isEdit && effectiveWirehouseId) {
        const res = await wirehouseService.update(effectiveWirehouseId, formData);
        if (!res.isLive) {
          setIsServerDown(true);
          return;
        }
        if (onSuccess) {
          onSuccess(t.wirehouses.toastUpdateSuccess);
        }
      } else {
        const res = await wirehouseService.create(formData);
        if (!res.isLive) {
          setIsServerDown(true);
          return;
        }
        if (onSuccess) {
          onSuccess(t.wirehouses.toastCreateSuccess);
        }
      }
      handleNavigate("/master/warehouses");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : t.wirehouses.toastErrorNetwork;
      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <WirehouseFormSkeleton />;
  }

  if (isServerDown) {
    return <WirehouseServer502 onRetry={loadData} />;
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
          {isEdit ? t.wirehouses.editWirehouse : t.wirehouses.addWirehouse}
        </span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? t.wirehouses.editWirehouse : t.wirehouses.addWirehouse}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isEdit
              ? t.wirehouses.editSubtitle.replace(
                  "{id}",
                  String(effectiveWirehouseId || ""),
                )
              : t.wirehouses.createSubtitle}
          </p>
        </div>

        {/* Back Button with text 'Kembali' / 'Back' */}
        <button
          type="button"
          onClick={() => handleNavigate("/master/warehouses")}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-6 py-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span>{t.wirehouses.btnBack}</span>
        </button>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
          {serverError}
        </div>
      )}

      {/* Form Card (12 Columns, No Placeholders, No Explanation Paragraphs) */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-6 space-y-6"
      >
        <div className="grid grid-cols-12 gap-5">
          {/* Field 1: Nama Gudang (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.wirehouses.labelWirehouseName} *
            </label>
            <input
              type="text"
              value={wirehouseName}
              maxLength={180}
              onChange={(e) => {
                setWirehouseName(e.target.value);
                if (errors.wirehouseName) {
                  setErrors((prev) => ({ ...prev, wirehouseName: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all ${
                errors.wirehouseName
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.wirehouseName && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.wirehouseName}
              </p>
            )}
          </div>

          {/* Field 2: Kode Gudang (12 cols, readonly/generated) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.wirehouses.labelCode}
            </label>
            <input
              type="text"
              readOnly
              value={wirehouseCode || (isEdit ? "" : "WRH-AUTO-GENERATED")}
              disabled
              className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/40 font-mono text-muted-foreground text-xs cursor-not-allowed select-none"
            />
          </div>

          {/* Field 3: Cabang Outlet Terkait (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.wirehouses.labelOutlet} *
            </label>
            <select
              value={outletId}
              onChange={(e) => {
                setOutletId(e.target.value ? Number(e.target.value) : "");
                if (errors.outletId) {
                  setErrors((prev) => ({ ...prev, outletId: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                errors.outletId
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            >
              <option value="">{t.wirehouses.filterAllOutlets}</option>
              {outletsList.map((o) => (
                <option key={o.id_outlet} value={o.id_outlet}>
                  {o.outlet_name} ({o.outlet_code})
                </option>
              ))}
            </select>
            {errors.outletId && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.outletId}
              </p>
            )}
          </div>

          {/* Field 4: Penanggung Jawab / Manager (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.wirehouses.labelManager} *
            </label>
            <select
              value={managerId}
              onChange={(e) => {
                setManagerId(e.target.value ? Number(e.target.value) : "");
                if (errors.managerId) {
                  setErrors((prev) => ({ ...prev, managerId: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                errors.managerId
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            >
              <option value="">Pilih Penanggung Jawab</option>
              {managersList.map((m) => (
                <option key={m.id_user} value={m.id_user}>
                  {m.name} ({m.username})
                </option>
              ))}
            </select>
            {errors.managerId && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.managerId}
              </p>
            )}
          </div>

          {/* Field 5: Kota (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.wirehouses.labelCity} *
            </label>
            <input
              type="text"
              value={city}
              maxLength={80}
              onChange={(e) => {
                setCity(e.target.value);
                if (errors.city) {
                  setErrors((prev) => ({ ...prev, city: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all ${
                errors.city
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.city && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.city}
              </p>
            )}
          </div>

          {/* Field 6: Nomor Telepon (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.wirehouses.labelPhone} *
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
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all font-mono ${
                errors.phoneNumber
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.phoneNumber && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Field 7: Alamat Fisik Lengkap (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.wirehouses.labelAddress} *
            </label>
            <textarea
              rows={3}
              value={address}
              maxLength={120}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) {
                  setErrors((prev) => ({ ...prev, address: "" }));
                }
              }}
              className={`w-full p-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.address
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.address && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.address}
              </p>
            )}
          </div>

          {/* Field 8: Tipe Fasilitas Gudang (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.wirehouses.labelType} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 rounded-xl border border-border/70 bg-muted/30">
              <button
                type="button"
                onClick={() => setType("main")}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs transition-all cursor-pointer ${
                  type === "main"
                    ? "bg-card text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>{t.wirehouses.typeMain}</span>
              </button>

              <button
                type="button"
                onClick={() => setType("kitchen")}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs transition-all cursor-pointer ${
                  type === "kitchen"
                    ? "bg-card text-amber-600 dark:text-amber-400 font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{t.wirehouses.typeKitchen}</span>
              </button>

              <button
                type="button"
                onClick={() => setType("bar")}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs transition-all cursor-pointer ${
                  type === "bar"
                    ? "bg-card text-purple-600 dark:text-purple-400 font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>{t.wirehouses.typeBar}</span>
              </button>

              <button
                type="button"
                onClick={() => setType("storage")}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs transition-all cursor-pointer ${
                  type === "storage"
                    ? "bg-card text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{t.wirehouses.typeStorage}</span>
              </button>
            </div>
          </div>

          {/* Field 9: Status Operasional (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.wirehouses.labelStatus} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 rounded-xl border border-border/70 bg-muted/30">
              <button
                type="button"
                onClick={() => setStatus("active")}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs transition-all cursor-pointer ${
                  status === "active"
                    ? "bg-card text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{t.wirehouses.statusActive}</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("inactive")}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs transition-all cursor-pointer ${
                  status === "inactive"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                <span>{t.wirehouses.statusInactive}</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("maintenance")}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs transition-all cursor-pointer ${
                  status === "maintenance"
                    ? "bg-card text-amber-600 dark:text-amber-400 font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{t.wirehouses.statusMaintenance}</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("closed")}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs transition-all cursor-pointer ${
                  status === "closed"
                    ? "bg-card text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>{t.wirehouses.statusClosed}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons: strictly "Batal" and "Simpan" */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={() => handleNavigate("/master/warehouses")}
            disabled={isSubmitting}
            className="px-10 py-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all disabled:opacity-50 cursor-pointer"
          >
            {t.wirehouses.btnCancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? t.wirehouses.btnSaving : t.wirehouses.btnSave}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WirehouseFormPage;
