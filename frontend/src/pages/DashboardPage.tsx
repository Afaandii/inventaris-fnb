import React, { useState } from 'react';
import {
  DollarSign,
  AlertTriangle,
  Utensils,
  Truck,
  Calendar,
  Filter,
  Download,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { SalesTrendChart } from '@/components/dashboard/SalesTrendChart';
import { LowStockWidget } from '@/components/dashboard/LowStockWidget';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useTranslation } from '@/hooks/useTranslation';

export const DashboardPage: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const formattedDate = new Intl.DateTimeFormat(
    currentLanguage === 'id' ? 'id-ID' : 'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  ).format(new Date());

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {t.dashboard.welcome}, Chef Renatta 👋
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" /> {t.common.online}
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {t.dashboard.subtitle}
          </p>
        </div>

        {/* Date & Period Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/70 bg-card text-xs text-muted-foreground font-medium">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="capitalize">{formattedDate}</span>
          </div>

          <div className="flex items-center p-0.5 rounded-xl bg-muted/50 border border-border/50">
            <button
              type="button"
              onClick={() => setSelectedPeriod('today')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedPeriod === 'today'
                  ? 'bg-card text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.common.today}
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('week')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedPeriod === 'week'
                  ? 'bg-card text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.common.thisWeek}
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('month')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedPeriod === 'month'
                  ? 'bg-card text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.common.thisMonth}
            </button>
          </div>

          <button
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/70 bg-card hover:bg-accent text-xs font-medium text-foreground transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{t.common.export}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.dashboard.todaySales}
          value="Rp 14.850.000"
          description={t.dashboard.todaySalesDesc}
          change="+14.2%"
          isPositive={true}
          icon={DollarSign}
          variant="success"
        />

        <StatCard
          title={t.dashboard.criticalStock}
          value="4 Bahan"
          description={t.dashboard.criticalStockDesc}
          change="Urgent"
          isPositive={false}
          icon={AlertTriangle}
          variant="danger"
        />

        <StatCard
          title={t.dashboard.activeOrders}
          value="32 Pesanan"
          description={t.dashboard.activeOrdersDesc}
          change="+8 meja"
          isPositive={true}
          icon={Utensils}
          variant="warning"
        />

        <StatCard
          title={t.dashboard.monthlyExpense}
          value="Rp 38.400.000"
          description={t.dashboard.monthlyExpenseDesc}
          change="-4.5%"
          isPositive={true}
          icon={Truck}
          variant="default"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <QuickActions />

      {/* Middle Section: Chart & Low Stock alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8">
          <SalesTrendChart />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <LowStockWidget />
        </div>
      </div>

      {/* Bottom Section: Recent Activity & Stock Health Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <RecentActivity />
        </div>

        {/* Stock Health & Summary Widget */}
        <div className="lg:col-span-4 rounded-2xl border border-border/70 bg-card p-5 md:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    {currentLanguage === 'id' ? 'Kesehatan Inventaris' : 'Inventory Health'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {currentLanguage === 'id' ? 'Total 124 Bahan Baku Terdaftar' : 'Total 124 Registered Ingredients'}
                  </p>
                </div>
              </div>
            </div>

            {/* Health status breakdown bars */}
            <div className="space-y-3 mt-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">
                    {currentLanguage === 'id' ? 'Stok Aman (> 50%)' : 'Safe Stock (> 50%)'}
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    108 Bahan (87%)
                  </span>
                </div>
                <div className="w-full bg-border/60 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '87%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">
                    {currentLanguage === 'id' ? 'Stok Menipis (20% - 50%)' : 'Low Stock (20% - 50%)'}
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    12 Bahan (10%)
                  </span>
                </div>
                <div className="w-full bg-border/60 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '10%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">
                    {currentLanguage === 'id' ? 'Stok Kritis / Habis (< 20%)' : 'Critical / Out (< 20%)'}
                  </span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    4 Bahan (3%)
                  </span>
                </div>
                <div className="w-full bg-border/60 rounded-full h-2 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '3%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 mt-6">
            <span className="text-xs font-medium text-foreground block">
              💡 {currentLanguage === 'id' ? 'Rekomendasi Otomatis' : 'Auto Recommendation'}
            </span>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              {currentLanguage === 'id'
                ? 'Segera proses PO untuk Daging Sirloin & Fresh Milk sebelum jam operasional malam dimulai.'
                : 'Process PO immediately for Sirloin & Fresh Milk before dinner operational shift starts.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
