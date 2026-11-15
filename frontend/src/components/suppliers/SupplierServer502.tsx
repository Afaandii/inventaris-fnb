import React from 'react';

interface SupplierServer502Props {
  onRetry?: () => void;
  onBack?: () => void;
  isRetrying?: boolean;
}

export const SupplierServer502: React.FC<SupplierServer502Props> = ({
  onRetry,
}) => {
  return (
    <div
      onClick={onRetry}
      title="Klik di mana saja untuk memuat ulang"
      className="fixed inset-0 z-[99999] w-screen h-screen bg-black flex items-center justify-center cursor-pointer select-none overflow-hidden animate-in fade-in duration-200"
    >
      <img
        src="/assets/502-desktop.jpg"
        alt="502 Bad Gateway"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default SupplierServer502;
