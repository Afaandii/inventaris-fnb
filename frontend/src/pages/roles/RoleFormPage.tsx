import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { roleService } from "@/services/roleService";
import { RoleFormSkeleton } from "@/components/roles/RoleSkeleton";
import { RoleServer502 } from "@/components/roles/RoleServer502";
import type { Role, RoleFormData } from "@/types/role";

interface RoleFormPageProps {
  mode: "create" | "edit";
  roleId?: number;
  onNavigate?: (path: string) => void;
  onSuccess?: (message: string) => void;
}

export const RoleFormPage: React.FC<RoleFormPageProps> = ({
  mode,
  roleId,
  onNavigate,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveRoleId = roleId ?? (id ? Number(id) : undefined);
  const isEdit = mode === "edit";

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  // Form Fields State
  const [roleName, setRoleName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Load existing role data if edit with 3-second skeleton & 502 check
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsServerDown(false);
    const startTime = Date.now();

    try {
      let editItem: Role | null = null;
      let editLive = true;

      if (isEdit && effectiveRoleId) {
        const itemRes = await roleService.getById(effectiveRoleId);
        editItem = itemRes.data;
        editLive = itemRes.isLive;
      } else {
        const isLive = await roleService.checkBackend();
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
        setRoleName(editItem.role_name);
        setDisplayName(editItem.display_name);
        setDescription(editItem.description || "");
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
  }, [isEdit, effectiveRoleId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!roleName.trim()) {
      newErrors.roleName = t.roles.validationRoleNameRequired;
    } else if (roleName.trim().length < 3) {
      newErrors.roleName = t.roles.validationRoleNameMin;
    }

    if (!displayName.trim()) {
      newErrors.displayName = t.roles.validationDisplayNameRequired;
    } else if (displayName.trim().length < 3) {
      newErrors.displayName = t.roles.validationDisplayNameMin;
    }

    if (description.trim() && description.trim().length < 3) {
      newErrors.description = t.roles.validationDescMin;
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

    const formData: RoleFormData = {
      role_name: roleName.trim().toLowerCase(),
      display_name: displayName.trim(),
      description: description.trim(),
    };

    try {
      if (isEdit && effectiveRoleId) {
        const res = await roleService.update(effectiveRoleId, formData);
        if (!res.isLive) {
          setIsServerDown(true);
          return;
        }
        if (onSuccess) {
          onSuccess(t.roles.toastUpdateSuccess);
        } else {
          handleNavigate("/master/roles");
        }
      } else {
        const res = await roleService.create(formData);
        if (!res.isLive) {
          setIsServerDown(true);
          return;
        }
        if (onSuccess) {
          onSuccess(t.roles.toastCreateSuccess);
        } else {
          handleNavigate("/master/roles");
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t.roles.errorServerGeneric;
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Show full-screen 502 Bad Gateway if server is unreachable
  if (isServerDown) {
    return <RoleServer502 onRetry={loadData} />;
  }

  // 2. Show Skeleton while loading (~3 seconds)
  if (isLoading) {
    return <RoleFormSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          onClick={() => handleNavigate("/master/roles")}
          className="hover:text-foreground cursor-pointer transition-colors"
        >
          {t.roles.title}
        </span>
        <span>/</span>
        <span className="text-foreground font-medium">
          {isEdit ? t.roles.editRole : t.roles.addRole}
        </span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? t.roles.editRole : t.roles.addRole}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isEdit
              ? t.roles.editSubtitle.replace(
                  "{id}",
                  String(effectiveRoleId || ""),
                )
              : t.roles.createSubtitle}
          </p>
        </div>

        {/* Back Button with text 'Kembali' / 'Back' */}
        <button
          type="button"
          onClick={() => handleNavigate("/master/roles")}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-6 py-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span>{t.roles.btnBack}</span>
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
          {/* Field 1: Identifier Peran Sistem / role_name (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.roles.labelRoleName} *
            </label>
            <input
              type="text"
              value={roleName}
              maxLength={80}
              onChange={(e) => {
                setRoleName(e.target.value);
                if (errors.roleName) {
                  setErrors((prev) => ({ ...prev, roleName: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-2 transition-all ${
                errors.roleName
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.roleName && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.roleName}
              </p>
            )}
          </div>

          {/* Field 2: Nama Tampilan Peran / display_name (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.roles.labelDisplayName} *
            </label>
            <input
              type="text"
              value={displayName}
              maxLength={120}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (errors.displayName) {
                  setErrors((prev) => ({ ...prev, displayName: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all ${
                errors.displayName
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.displayName && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.displayName}
              </p>
            )}
          </div>

          {/* Field 3: Deskripsi Wewenang & Tanggung Jawab / description (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.roles.labelDescription}
            </label>
            <textarea
              rows={4}
              value={description}
              maxLength={500}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: "" }));
                }
              }}
              className={`w-full p-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all resize-y ${
                errors.description
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons: strictly "Batal" and "Simpan" */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={() => handleNavigate("/master/roles")}
            disabled={isSubmitting}
            className="px-10 py-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all disabled:opacity-50 cursor-pointer"
          >
            {t.roles.btnCancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? t.roles.btnSaving : t.roles.btnSave}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleFormPage;
