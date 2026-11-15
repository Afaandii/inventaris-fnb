import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { supplierService } from "@/services/supplierService";
import { SupplierFormSkeleton } from "@/components/suppliers/SupplierSkeleton";
import { SupplierServer502 } from "@/components/suppliers/SupplierServer502";
import type {
  Supplier,
  SupplierFormData,
  StatusSupplier,
} from "@/types/supplier";

interface SupplierFormPageProps {
  mode: "create" | "edit";
  supplierId?: number;
  onNavigate?: (path: string) => void;
  onSuccess?: (message: string) => void;
}

export const SupplierFormPage: React.FC<SupplierFormPageProps> = ({
  mode,
  supplierId,
  onNavigate,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveSupplierId = supplierId ?? (id ? Number(id) : undefined);
  const isEdit = mode === "edit";

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  // Form Fields State
  const [supplierName, setSupplierName] = useState("");
  const [supplierCode, setSupplierCode] = useState("");
  const [npwp, setNpwp] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<StatusSupplier>("active");

  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Load existing supplier data if edit with 3-second skeleton & 502 check
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsServerDown(false);
    const startTime = Date.now();

    try {
      let editItem: Supplier | null = null;
      let editLive = true;

      if (isEdit && effectiveSupplierId) {
        const itemRes = await supplierService.getById(effectiveSupplierId);
        editItem = itemRes.data;
        editLive = itemRes.isLive;
      } else {
        const isLive = await supplierService.checkBackend();
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
        setSupplierName(editItem.supplier_name);
        setSupplierCode(editItem.supplier_code);
        setNpwp(editItem.npwp);
        setContactPerson(editItem.contact_person);
        setEmail(editItem.email);
        setBankAccount(editItem.bank_account);
        setCity(editItem.city);
        setAddress(editItem.address);
        setNotes(editItem.notes);
        setStatus(editItem.status_supplier);
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
  }, [isEdit, effectiveSupplierId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!supplierName.trim()) {
      newErrors.supplierName = t.suppliers.validationNameRequired;
    } else if (supplierName.trim().length < 3) {
      newErrors.supplierName = t.suppliers.validationNameMin;
    }

    if (!npwp.trim()) {
      newErrors.npwp = t.suppliers.validationNpwpRequired;
    } else if (npwp.trim().length < 3) {
      newErrors.npwp = t.suppliers.validationNpwpMin;
    }

    if (!contactPerson.trim()) {
      newErrors.contactPerson = t.suppliers.validationContactRequired;
    } else if (contactPerson.trim().length < 3) {
      newErrors.contactPerson = t.suppliers.validationContactMin;
    }

    if (!email.trim()) {
      newErrors.email = t.suppliers.validationEmailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = t.suppliers.validationEmailInvalid;
    }

    if (!bankAccount.trim()) {
      newErrors.bankAccount = t.suppliers.validationBankRequired;
    } else if (bankAccount.trim().length < 3) {
      newErrors.bankAccount = t.suppliers.validationBankMin;
    }

    if (!city.trim()) {
      newErrors.city = t.suppliers.validationCityRequired;
    }

    if (!address.trim()) {
      newErrors.address = t.suppliers.validationAddressRequired;
    }

    if (!notes.trim()) {
      newErrors.notes = t.suppliers.validationNotesRequired;
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

    const formData: SupplierFormData = {
      supplier_name: supplierName.trim(),
      npwp: npwp.trim(),
      contact_person: contactPerson.trim(),
      email: email.trim(),
      bank_account: bankAccount.trim(),
      city: city.trim(),
      address: address.trim(),
      notes: notes.trim(),
      status_supplier: status,
    };

    try {
      if (isEdit && effectiveSupplierId) {
        const res = await supplierService.update(effectiveSupplierId, formData);
        if (!res.isLive) {
          setIsServerDown(true);
          return;
        }
        if (onSuccess) {
          onSuccess(t.suppliers.toastUpdateSuccess);
        } else {
          handleNavigate("/master/suppliers");
        }
      } else {
        const res = await supplierService.create(formData);
        if (!res.isLive) {
          setIsServerDown(true);
          return;
        }
        if (onSuccess) {
          onSuccess(t.suppliers.toastCreateSuccess);
        } else {
          handleNavigate("/master/suppliers");
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t.suppliers.errorServerGeneric;
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Show full-screen 502 Bad Gateway if server is unreachable
  if (isServerDown) {
    return <SupplierServer502 onRetry={loadData} />;
  }

  // 2. Show Skeleton while loading (~3 seconds)
  if (isLoading) {
    return <SupplierFormSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          onClick={() => handleNavigate("/master/suppliers")}
          className="hover:text-foreground cursor-pointer transition-colors"
        >
          {t.suppliers.title}
        </span>
        <span>/</span>
        <span className="text-foreground font-medium">
          {isEdit ? t.suppliers.editSupplier : t.suppliers.addSupplier}
        </span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? t.suppliers.editSupplier : t.suppliers.addSupplier}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isEdit
              ? t.suppliers.editSubtitle.replace(
                  "{id}",
                  String(effectiveSupplierId || ""),
                )
              : t.suppliers.createSubtitle}
          </p>
        </div>

        {/* Back Button with text 'Kembali' / 'Back' */}
        <button
          type="button"
          onClick={() => handleNavigate("/master/suppliers")}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-6 py-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span>{t.suppliers.btnBack}</span>
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
          {/* Field 1: Nama Perusahaan / Pemasok (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.suppliers.labelSupplierName} *
            </label>
            <input
              type="text"
              value={supplierName}
              maxLength={120}
              onChange={(e) => {
                setSupplierName(e.target.value);
                if (errors.supplierName) {
                  setErrors((prev) => ({ ...prev, supplierName: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all ${
                errors.supplierName
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.supplierName && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.supplierName}
              </p>
            )}
          </div>

          {/* Field 2: Kode Pemasok (12 cols, readonly/generated) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.suppliers.labelCode}
            </label>
            <input
              type="text"
              readOnly
              value={supplierCode || (isEdit ? "" : "SPL-AUTO-GENERATED")}
              disabled
              className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/40 font-mono text-muted-foreground text-xs cursor-not-allowed select-none"
            />
          </div>

          {/* Field 3: NPWP Perusahaan (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.suppliers.labelNpwp} *
            </label>
            <input
              type="text"
              value={npwp}
              maxLength={16}
              onChange={(e) => {
                setNpwp(e.target.value);
                if (errors.npwp) {
                  setErrors((prev) => ({ ...prev, npwp: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-2 transition-all ${
                errors.npwp
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.npwp && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.npwp}
              </p>
            )}
          </div>

          {/* Field 4: Penanggung Jawab / PIC (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.suppliers.labelContactPerson} *
            </label>
            <input
              type="text"
              value={contactPerson}
              maxLength={20}
              onChange={(e) => {
                setContactPerson(e.target.value);
                if (errors.contactPerson) {
                  setErrors((prev) => ({ ...prev, contactPerson: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all ${
                errors.contactPerson
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.contactPerson && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.contactPerson}
              </p>
            )}
          </div>

          {/* Field 5: Email Resmi (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.suppliers.labelEmail} *
            </label>
            <input
              type="email"
              value={email}
              maxLength={125}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.email && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.email}
              </p>
            )}
          </div>

          {/* Field 6: Rekening Bank Pembayaran (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.suppliers.labelBankAccount} *
            </label>
            <input
              type="text"
              value={bankAccount}
              maxLength={100}
              onChange={(e) => {
                setBankAccount(e.target.value);
                if (errors.bankAccount) {
                  setErrors((prev) => ({ ...prev, bankAccount: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all ${
                errors.bankAccount
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.bankAccount && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.bankAccount}
              </p>
            )}
          </div>

          {/* Field 7: Kota Operasional (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.suppliers.labelCity} *
            </label>
            <input
              type="text"
              value={city}
              maxLength={120}
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

          {/* Field 8: Alamat Kantor / Gudang (12 cols, textarea) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.suppliers.labelAddress} *
            </label>
            <textarea
              rows={3}
              value={address}
              maxLength={500}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) {
                  setErrors((prev) => ({ ...prev, address: "" }));
                }
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all resize-none ${
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

          {/* Field 9: Catatan & Ketentuan Pembayaran (12 cols, textarea) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.suppliers.labelNotes} *
            </label>
            <textarea
              rows={3}
              value={notes}
              maxLength={500}
              onChange={(e) => {
                setNotes(e.target.value);
                if (errors.notes) {
                  setErrors((prev) => ({ ...prev, notes: "" }));
                }
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.notes
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.notes && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.notes}
              </p>
            )}
          </div>

          {/* Field 10: Status Operasional (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.suppliers.labelStatus} *
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border border-border/70 bg-muted/40">
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
                <span>{t.suppliers.statusActive}</span>
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
                <span>{t.suppliers.statusInactive}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons: strictly "Batal" and "Simpan" */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={() => handleNavigate("/master/suppliers")}
            disabled={isSubmitting}
            className="px-10 py-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all disabled:opacity-50 cursor-pointer"
          >
            {t.suppliers.btnCancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? t.suppliers.btnSaving : t.suppliers.btnSave}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierFormPage;
