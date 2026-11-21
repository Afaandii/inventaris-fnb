import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { userService } from "@/services/userService";
import { roleService } from "@/services/roleService";
import { outletService } from "@/services/outletService";
import { initialRoles } from "@/data/mockRoles";
import { initialOutlets } from "@/data/mockOutlets";
import { UserFormSkeleton } from "@/components/users/UserSkeleton";
import { UserServer502 } from "@/components/users/UserServer502";
import type { User, UserFormData, StatusUser } from "@/types/user";
import type { Role } from "@/types/role";
import type { Outlet } from "@/types/outlet";

interface UserFormPageProps {
  mode: "create" | "edit";
  userId?: number;
  onNavigate?: (path: string) => void;
  onSuccess?: (message: string) => void;
}

export const UserFormPage: React.FC<UserFormPageProps> = ({
  mode,
  userId,
  onNavigate,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveUserId = userId ?? (id ? Number(id) : undefined);
  const isEdit = mode === "edit";

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  // Dropdown options
  const [rolesList, setRolesList] = useState<Role[]>(initialRoles);
  const [outletsList, setOutletsList] = useState<Outlet[]>(initialOutlets);

  // Form Fields State
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [roleId, setRoleId] = useState<number>(rolesList[0]?.id_role || 1);
  const [outletId, setOutletId] = useState<number>(outletsList[0]?.id_outlet || 1);
  const [status, setStatus] = useState<StatusUser>("active");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [avatar, setAvatar] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Load existing user data if edit, plus options with real backend loading & 502 check
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsServerDown(false);

    try {
      let editItem: User | null = null;
      let isLiveCheck = true;

      // Load roles and outlets options in parallel
      const [rolesRes, outletsRes] = await Promise.all([
        roleService.getAll().catch(() => ({ data: initialRoles, isLive: false })),
        outletService.getAll().catch(() => ({ data: initialOutlets, isLive: false })),
      ]);

      if (rolesRes.data && rolesRes.data.length > 0) {
        setRolesList(rolesRes.data);
      }
      if (outletsRes.data && outletsRes.data.length > 0) {
        setOutletsList(outletsRes.data);
      }

      if (isEdit && effectiveUserId) {
        const itemRes = await userService.getById(effectiveUserId);
        editItem = itemRes.data;
        isLiveCheck = itemRes.isLive;
      } else {
        const isLive = await userService.checkBackend();
        if (!isLive) {
          isLiveCheck = false;
        }
      }

      // Check if backend returned valid live response
      if (!isLiveCheck || (isEdit && !editItem)) {
        setIsServerDown(true);
        return;
      }

      // Populate form if in edit mode
      if (isEdit && editItem) {
        setName(editItem.name);
        setUsername(editItem.username);
        setEmail(editItem.email);
        setPhoneNumber(editItem.phone_number || "");
        setRoleId(editItem.role_id);
        setOutletId(editItem.outlet_id);
        setStatus(editItem.status);
        setIsActive(editItem.is_active);
        setAvatar(editItem.avatar || "");
      }
    } catch {
      setIsServerDown(true);
    } finally {
      setIsLoading(false);
    }
  }, [isEdit, effectiveUserId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t.users.validationNameRequired;
    } else if (name.trim().length < 4) {
      newErrors.name = t.users.validationNameMin;
    }

    if (!username.trim()) {
      newErrors.username = t.users.validationUsernameRequired;
    } else if (username.trim().length < 4) {
      newErrors.username = t.users.validationUsernameMin;
    }

    if (!email.trim()) {
      newErrors.email = t.users.validationEmailRequired;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = t.users.validationEmailInvalid;
      }
    }

    if (!isEdit && !password.trim()) {
      newErrors.password = t.users.validationPasswordRequired;
    } else if (password.trim() && password.trim().length < 8) {
      newErrors.password = t.users.validationPasswordMin;
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = t.users.validationPhoneRequired;
    }

    if (!roleId) {
      newErrors.roleId = t.users.validationRoleRequired;
    }

    if (!outletId) {
      newErrors.outletId = t.users.validationOutletRequired;
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

    const formData: UserFormData = {
      role_id: Number(roleId),
      outlet_id: Number(outletId),
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password: password.trim() || undefined,
      phone_number: phoneNumber.trim(),
      avatar: avatar.trim() || undefined,
      status: status,
      is_active: isActive,
    };

    try {
      if (isEdit && effectiveUserId) {
        const res = await userService.update(effectiveUserId, formData);
        if (!res.isLive) {
          setIsServerDown(true);
          return;
        }
        if (onSuccess) {
          onSuccess(t.users.toastUpdateSuccess);
        } else {
          handleNavigate("/master/users");
        }
      } else {
        const res = await userService.create(formData);
        if (!res.isLive) {
          setIsServerDown(true);
          return;
        }
        if (onSuccess) {
          onSuccess(t.users.toastCreateSuccess);
        } else {
          handleNavigate("/master/users");
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t.users.errorServerGeneric;
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Show full-screen 502 Bad Gateway if server is unreachable
  if (isServerDown) {
    return <UserServer502 onRetry={loadData} />;
  }

  // 2. Show Skeleton while loading (~3 seconds)
  if (isLoading) {
    return <UserFormSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          onClick={() => handleNavigate("/master/users")}
          className="hover:text-foreground cursor-pointer transition-colors"
        >
          {t.users.title}
        </span>
        <span>/</span>
        <span className="text-foreground font-medium">
          {isEdit ? t.users.editUser : t.users.addUser}
        </span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? t.users.editUser : t.users.addUser}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isEdit
              ? t.users.editSubtitle.replace(
                  "{id}",
                  String(effectiveUserId || ""),
                )
              : t.users.createSubtitle}
          </p>
        </div>

        {/* Back Button with text 'Kembali' / 'Back' */}
        <button
          type="button"
          onClick={() => handleNavigate("/master/users")}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-6 py-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span>{t.users.btnBack}</span>
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
          {/* Field 1: Nama Lengkap Pengguna (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.users.labelName} *
            </label>
            <input
              type="text"
              value={name}
              maxLength={120}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.name}
              </p>
            )}
          </div>

          {/* Field 2: Nama Pengguna (Username) (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.users.labelUsername} *
            </label>
            <input
              type="text"
              value={username}
              maxLength={80}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) {
                  setErrors((prev) => ({ ...prev, username: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-2 transition-all ${
                errors.username
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            />
            {errors.username && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.username}
              </p>
            )}
          </div>

          {/* Field 3: Alamat Email (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.users.labelEmail} *
            </label>
            <input
              type="email"
              value={email}
              maxLength={100}
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

          {/* Field 4: Kata Sandi / Password (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.users.labelPassword} {isEdit ? "" : "*"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                maxLength={80}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
                className={`w-full h-10 pl-3.5 pr-10 rounded-xl border bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? "border-destructive focus:ring-destructive/30"
                    : "border-border/70 focus:ring-ring/40 hover:border-border"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.password}
              </p>
            )}
          </div>

          {/* Field 5: Nomor Telepon Seluler (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.users.labelPhone} *
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
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-2 transition-all ${
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

          {/* Field 6: Peran Pengguna / Role (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.users.labelRole} *
            </label>
            <select
              value={roleId}
              onChange={(e) => {
                setRoleId(Number(e.target.value));
                if (errors.roleId) {
                  setErrors((prev) => ({ ...prev, roleId: "" }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border bg-background text-foreground text-xs focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                errors.roleId
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border/70 focus:ring-ring/40 hover:border-border"
              }`}
            >
              {rolesList.map((r) => (
                <option key={r.id_role} value={r.id_role}>
                  {r.display_name} ({r.role_name})
                </option>
              ))}
            </select>
            {errors.roleId && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.roleId}
              </p>
            )}
          </div>

          {/* Field 7: Cabang Outlet Penempatan (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.users.labelOutlet} *
            </label>
            <select
              value={outletId}
              onChange={(e) => {
                setOutletId(Number(e.target.value));
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

          {/* Field 8: Status Akun (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.users.labelStatus} *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusUser)}
              className="w-full h-10 px-3.5 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring/40 hover:border-border transition-all cursor-pointer"
            >
              <option value="active">{t.users.statusActive}</option>
              <option value="inactive">{t.users.statusInactive}</option>
              <option value="suspended">{t.users.statusSuspended}</option>
              <option value="banned">{t.users.statusBanned}</option>
            </select>
          </div>

          {/* Field 9: Status Keaktifan Sistem (12 cols) */}
          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t.users.labelIsActive} *
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
                <span>{t.users.statusActive}</span>
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
                <span>{t.users.statusInactive}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons: strictly "Batal" and "Simpan" */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={() => handleNavigate("/master/users")}
            disabled={isSubmitting}
            className="px-10 py-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all disabled:opacity-50 cursor-pointer"
          >
            {t.users.btnCancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? t.users.btnSaving : t.users.btnSave}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserFormPage;
