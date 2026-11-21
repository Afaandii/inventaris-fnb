import React, { useState, useEffect } from "react";
import { X, Filter, RotateCcw, Check, Calendar, Shield, Store, UserCheck } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { Role } from "@/types/role";
import type { Outlet } from "@/types/outlet";
import type { StatusUser } from "@/types/user";

export interface UserFilterCriteria {
  dateFrom: string;
  dateTo: string;
  roleId: number | "all";
  outletId: number | "all";
  status: StatusUser | "all";
}

interface UserFilterModalProps {
  isOpen: boolean;
  criteria?: UserFilterCriteria;
  roles?: Role[];
  outlets?: Outlet[];
  onClose: () => void;
  onApply: (criteria: UserFilterCriteria) => void;
  onReset: () => void;
}

const defaultCriteria: UserFilterCriteria = {
  dateFrom: "",
  dateTo: "",
  roleId: "all",
  outletId: "all",
  status: "all",
};

export const UserFilterModal: React.FC<UserFilterModalProps> = ({
  isOpen,
  criteria,
  roles = [],
  outlets = [],
  onClose,
  onApply,
  onReset,
}) => {
  const { t } = useTranslation();
  const activeCriteria = criteria || defaultCriteria;

  const [dateFrom, setDateFrom] = useState(activeCriteria.dateFrom || "");
  const [dateTo, setDateTo] = useState(activeCriteria.dateTo || "");
  const [roleId, setRoleId] = useState<number | "all">(activeCriteria.roleId ?? "all");
  const [outletId, setOutletId] = useState<number | "all">(activeCriteria.outletId ?? "all");
  const [status, setStatus] = useState<StatusUser | "all">(activeCriteria.status ?? "all");

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDateFrom(activeCriteria.dateFrom || "");
      setDateTo(activeCriteria.dateTo || "");
      setRoleId(activeCriteria.roleId ?? "all");
      setOutletId(activeCriteria.outletId ?? "all");
      setStatus(activeCriteria.status ?? "all");
    }
  }, [isOpen, activeCriteria]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      dateFrom,
      dateTo,
      roleId,
      outletId,
      status,
    });
    onClose();
  };

  const handleReset = () => {
    setDateFrom("");
    setDateTo("");
    setRoleId("all");
    setOutletId("all");
    setStatus("all");
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-popover text-popover-foreground p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Filter Data Pengguna
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Saring data pengguna berdasarkan kriteria spesifik
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Filter Status Akun */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Status Akun</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusUser | "all")}
              className="w-full h-10 px-3 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">{t.users.statusActive}</option>
              <option value="inactive">{t.users.statusInactive}</option>
              <option value="suspended">{t.users.statusSuspended}</option>
              <option value="banned">{t.users.statusBanned}</option>
            </select>
          </div>

          {/* Filter Peran Sistem */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Peran Sistem</span>
            </label>
            <select
              value={roleId}
              onChange={(e) =>
                setRoleId(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
              className="w-full h-10 px-3 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 cursor-pointer"
            >
              <option value="all">Semua Peran</option>
              {roles.map((r) => (
                <option key={r.id_role} value={r.id_role}>
                  {r.display_name} ({r.role_name})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Cabang Outlet */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Cabang Outlet</span>
            </label>
            <select
              value={outletId}
              onChange={(e) =>
                setOutletId(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
              className="w-full h-10 px-3 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 cursor-pointer"
            >
              <option value="all">Semua Cabang Outlet</option>
              {outlets.map((o) => (
                <option key={o.id_outlet} value={o.id_outlet}>
                  {o.outlet_name} ({o.outlet_code})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tanggal Dibuat */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Tanggal Pendaftaran</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Reset Filter</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
            >
              {t.users.btnCancel}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Terapkan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFilterModal;
