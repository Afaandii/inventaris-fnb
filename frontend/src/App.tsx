import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { useTheme } from '@/hooks/useTheme';

export function App() {
  // Initialize theme synchronization (light, dark, system listener)
  useTheme();

  return (
    <AdminLayout>
      <DashboardPage />
    </AdminLayout>
  );
}

export default App;
