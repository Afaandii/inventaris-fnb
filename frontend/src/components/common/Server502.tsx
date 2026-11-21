import React from "react";
import { RefreshCw } from "lucide-react";

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
}) => {
  const handleReload = () => {
    if (onRetry) {
      onRetry();
    }
    window.location.reload();
  };

  return (
    <div className="relative w-full max-w-3xl lg:max-w-5xl mx-auto h-[calc(100vh-8rem)] max-h-[460px] min-h-[320px] rounded-2xl border border-border/70 bg-[#4D9DE0] overflow-hidden shadow-xl flex items-center justify-center animate-in fade-in duration-200">
      {/* 502 Bad Gateway Image seamlessly filling card without distortion or cropping */}
      <img
        src="/assets/badgateway-502.png"
        alt="502 Bad Gateway"
        className="w-full h-full object-contain select-none"
      />

      {/* Action Button: Coba Hubungkan Kembali (Integrated directly on background) */}
      <div className="absolute bottom-2 sm:bottom-2 left-1/2 -translate-x-1/2 z-20">
        <button
          type="button"
          onClick={handleReload}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-white text-slate-900 hover:bg-white/95 text-xs sm:text-sm font-semibold shadow-xl transition-all active:scale-[0.98] cursor-pointer hover:shadow-cyan-950/20 border border-slate-200/40 disabled:opacity-50 whitespace-nowrap"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-slate-800 ${isRetrying ? "animate-spin" : ""}`}
          />
          <span>Muat Ulang</span>
        </button>
      </div>
    </div>
  );
};

export default Server502;
