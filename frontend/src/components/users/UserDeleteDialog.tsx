import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { User } from "@/types/user";

interface UserDeleteDialogProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: (user: User) => void;
  isDeleting?: boolean;
}

export const UserDeleteDialog: React.FC<UserDeleteDialogProps> = ({
  isOpen,
  user,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  const { t } = useTranslation();

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-border/80 bg-popover text-popover-foreground p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground">
              {t.users.deleteConfirmTitle}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {t.users.deleteConfirmMessage
                .replace("{name}", user.name)
                .replace("{username}", user.username)}
            </p>

            {/* Target User Info Card */}
            <div className="mt-4 rounded-xl border border-border/70 bg-muted/40 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">ID Pengguna:</span>
                <span className="font-mono font-semibold text-foreground">
                  #{user.id_user}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Nama:</span>
                <span className="font-medium text-foreground">{user.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Peran:</span>
                <span className="font-mono text-foreground font-semibold">
                  {user.role_name || user.display_role_name || `Role #${user.role_id}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer disabled:opacity-50"
          >
            {t.users.btnCancel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(user)}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Menghapus..." : t.users.deleteUser}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDeleteDialog;
