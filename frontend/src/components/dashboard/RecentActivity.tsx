import React from 'react';
import { History, ShoppingBag, Truck, ChefHat, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface ActivityItem {
  id: string;
  type: 'sale' | 'purchase' | 'production' | 'adjustment';
  title: string;
  titleEn: string;
  details: string;
  time: string;
  timeEn: string;
  user: string;
}

const activities: ActivityItem[] = [
  {
    id: 'ACT-01',
    type: 'sale',
    title: 'Penjualan POS #ORD-1082',
    titleEn: 'POS Sale #ORD-1082',
    details: '3x Sirloin Steak, 2x Matcha Latte (Rp 485.000)',
    time: '12 menit lalu',
    timeEn: '12 mins ago',
    user: 'Kasir 01',
  },
  {
    id: 'ACT-02',
    type: 'purchase',
    title: 'Penerimaan PO #PO-2024-89',
    titleEn: 'PO Received #PO-2024-89',
    details: 'Fresh Milk 20 Liter & Keju 10 kg dari PT Dairy Farm',
    time: '45 menit lalu',
    timeEn: '45 mins ago',
    user: 'Gudang Utama',
  },
  {
    id: 'ACT-03',
    type: 'production',
    title: 'Batch Produksi Saus Kitchen',
    titleEn: 'Kitchen Batch Cooking',
    details: 'Batch #2 Demi-Glace Sauce selesai (15 Liter)',
    time: '2 jam lalu',
    timeEn: '2 hrs ago',
    user: 'Chef Juna',
  },
  {
    id: 'ACT-04',
    type: 'adjustment',
    title: 'Penyesuaian Stok (Waste)',
    titleEn: 'Stock Waste Adjustment',
    details: 'Telur Ayam 0.5 kg rusak saat persiapan pagi',
    time: '4 jam lalu',
    timeEn: '4 hrs ago',
    user: 'Kitchen Staff',
  },
];

export const RecentActivity: React.FC = () => {
  const { t, currentLanguage } = useTranslation();

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'sale':
        return <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'purchase':
        return <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'production':
        return <ChefHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'adjustment':
        return <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
    }
  };

  const getIconBg = (type: ActivityItem['type']) => {
    switch (type) {
      case 'sale':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'purchase':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'production':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'adjustment':
        return 'bg-rose-500/10 border-rose-500/20';
    }
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 md:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              {t.dashboard.recentActivityTitle}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t.dashboard.recentActivitySubtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-border/70">
        {activities.map((item) => (
          <div key={item.id} className="relative group">
            {/* Timeline icon node */}
            <div
              className={`absolute -left-6 top-0.5 flex items-center justify-center w-5 h-5 rounded-full border bg-card ${getIconBg(
                item.type
              )} shadow-2xs`}
            >
              <div className="scale-75">{getIcon(item.type)}</div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-semibold text-foreground">
                {currentLanguage === 'id' ? item.title : item.titleEn}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {currentLanguage === 'id' ? item.time : item.timeEn}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-0.5">{item.details}</p>

            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-medium text-muted-foreground/80 bg-muted/60 px-1.5 py-0.5 rounded">
                Oleh: {item.user}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
