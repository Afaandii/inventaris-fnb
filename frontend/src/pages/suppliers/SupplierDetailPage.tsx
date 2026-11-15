import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Pencil, Building2, CreditCard, User, Mail, MapPin, Calendar, Copy, Check } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { supplierService } from "@/services/supplierService";
import { SupplierDetailSkeleton } from "@/components/suppliers/SupplierSkeleton";
import { SupplierServer502 } from "@/components/suppliers/SupplierServer502";
import type { Supplier, StatusSupplier } from "@/types/supplier";

interface SupplierDetailPageProps {
  supplierId?: number;
  onNavigate?: (path: string) => void;
}

export const SupplierDetailPage: React.FC<SupplierDetailPageProps> = ({
  supplierId,
  onNavigate,
}) => {
  const { t, currentLanguage } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveSupplierId = supplierId ?? (id ? Number(id) : undefined);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error] = useState<string | null>(
    effectiveSupplierId ? null : t.suppliers.emptyTitle,
  );

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const loadDetail = useCallback(async () => {
    if (!effectiveSupplierId) return;
    setIsLoading(true);
    setIsServerDown(false);
    const startTime = Date.now();

    try {
      const res = await supplierService.getById(effectiveSupplierId);

      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }

      if (!res.isLive || !res.data) {
        setIsServerDown(true);
        return;
      }

      setSupplier(res.data);
    } catch {
      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }
      setIsServerDown(true);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveSupplierId]);

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

  const renderStatusBadge = (status?: StatusSupplier) => {
    if (status === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t.suppliers.statusActive}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
        <span>{t.suppliers.statusInactive}</span>
      </span>
    );
  };

  if (isLoading) {
    return <SupplierDetailSkeleton />;
  }

  if (isServerDown) {
    return <SupplierServer502 onRetry={loadDetail} />;
  }

  if (error || !supplier) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
          {error || t.suppliers.emptyTitle}
        </div>
        <button
          type="button"
          onClick={() => handleNavigate("/master/suppliers")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          <span>{t.suppliers.btnBack}</span>
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
          onClick={() => handleNavigate("/master/suppliers")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.common.masterData}
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => handleNavigate("/master/suppliers")}
          className="hover:text-foreground transition-colors cursor-pointer"
        >
          {t.suppliers.title}
        </button>
        <span>/</span>
        <span className="font-semibold text-foreground">
          {t.suppliers.detailTitle}
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {supplier.supplier_name}
            </h1>
            <div>{renderStatusBadge(supplier.status_supplier)}</div>
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {t.suppliers.detailIdInfo
              .replace("{id}", String(supplier.id_supplier))
              .replace("{code}", supplier.supplier_code)
              .replace("{city}", supplier.city)}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              handleNavigate(`/master/suppliers/edit/${supplier.id_supplier}`)
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{t.suppliers.btnEditData}</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/master/suppliers")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            <span>{t.suppliers.btnBack}</span>
          </button>
        </div>
      </div>

      {/* Grid of 5 Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Identitas Dasar Rekanan */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Building2 className="w-4 h-4 text-primary" />
            <h2>{t.suppliers.cardBasicInfo}</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.suppliers.labelSupplierName}
              </span>
              <span className="font-semibold text-foreground text-sm">
                {supplier.supplier_name}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.suppliers.labelCode}
              </span>
              <span className="font-mono font-medium text-foreground bg-muted/50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                {supplier.supplier_code}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.suppliers.labelStatus}
              </span>
              <div className="mt-1">{renderStatusBadge(supplier.status_supplier)}</div>
            </div>
          </div>
        </div>

        {/* Card 2: Pajak & Informasi Perbankan */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <CreditCard className="w-4 h-4 text-primary" />
            <h2>{t.suppliers.cardTaxBank}</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.suppliers.labelNpwp}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-semibold text-foreground bg-muted/50 px-2 py-1 rounded-md">
                  {supplier.npwp}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(supplier.npwp, "npwp")}
                  title="Salin NPWP"
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {copiedField === "npwp" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
            <div className="pt-2 border-t border-border/40">
              <span className="text-muted-foreground block text-[11px]">
                {t.suppliers.labelBankAccount}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-medium text-foreground">
                  {supplier.bank_account}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(supplier.bank_account, "bank")}
                  title="Salin Rekening"
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {copiedField === "bank" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Kontak & Penanggung Jawab */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <User className="w-4 h-4 text-primary" />
            <h2>{t.suppliers.cardContact}</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.suppliers.labelContactPerson}
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>{supplier.contact_person}</span>
              </span>
            </div>
            <div className="pt-2 border-t border-border/40">
              <span className="text-muted-foreground block text-[11px]">
                {t.suppliers.labelEmail}
              </span>
              <a
                href={`mailto:${supplier.email}`}
                className="font-medium text-primary hover:underline flex items-center gap-1.5 mt-0.5"
              >
                <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>{supplier.email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Card 4: Alamat & Wilayah Operasional */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <h2>{t.suppliers.cardLocation}</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.suppliers.labelCity}
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>{supplier.city}</span>
              </span>
            </div>
            <div className="pt-2 border-t border-border/40">
              <span className="text-muted-foreground block text-[11px]">
                {t.suppliers.labelAddress}
              </span>
              <p className="text-foreground leading-relaxed mt-0.5">
                {supplier.address}
              </p>
            </div>
          </div>
        </div>

        {/* Card 5: Catatan Ketentuan & Waktu Sistem (Full Width) */}
        <div className="col-span-1 md:col-span-2 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <h2>{t.suppliers.cardNotesTimestamps}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t.suppliers.labelNotes}
              </span>
              <p className="text-foreground leading-relaxed italic bg-muted/30 p-3 rounded-xl border border-border/40 mt-1">
                {supplier.notes || "—"}
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground block text-[11px]">
                  Dibuat Pada:
                </span>
                <span className="font-mono text-foreground">
                  {formatDate(supplier.created_at)}
                </span>
              </div>
              <div className="pt-2 border-t border-border/40">
                <span className="text-muted-foreground block text-[11px]">
                  Pembaruan Terakhir:
                </span>
                <span className="font-mono text-foreground">
                  {formatDate(supplier.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailPage;
