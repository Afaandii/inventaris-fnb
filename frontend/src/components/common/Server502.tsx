import React from "react";
import { ServerCrash, WifiOff, RefreshCw } from "lucide-react";

export interface Server502Props {
  onRetry?: () => void;
  onBack?: () => void;
  isRetrying?: boolean;
  title?: string;
  description?: string;
}

export const Server502: React.FC<Server502Props> = ({
  onRetry,
  isRetrying = false,
  title = "Bad Gateway",
  description = "Server backend Golang tidak memberikan respons atau koneksi terputus. Pastikan layanan backend aktif dan coba hubungkan kembali.",
}) => {
  return (
    <div className="w-full min-h-[480px] sm:min-h-[540px] rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs flex flex-col items-center justify-center p-6 sm:p-12 text-center animate-in fade-in duration-200">
      {/* Vector Illustration */}
      <div className="relative mb-6">
        <div className="absolute -inset-2 bg-gradient-to-r from-destructive/20 via-rose-500/10 to-amber-500/20 rounded-full blur-xl opacity-75" />
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-card border border-border/80 shadow-lg flex items-center justify-center text-destructive">
          <ServerCrash className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5]" />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-destructive text-destructive-foreground border-2 border-card flex items-center justify-center shadow-md">
            <WifiOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono font-bold uppercase tracking-wider mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-ping" />
        <span>Error 502</span>
      </div>

      {/* Headline */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h2>

      {/* Description */}
      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mt-2 leading-relaxed">
        {description}
      </p>

      {/* Retry Action Button */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer mt-6 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`}
          />
          <span>Coba Hubungkan Kembali</span>
        </button>
      )}
    </div>
  );
};

export default Server502;
