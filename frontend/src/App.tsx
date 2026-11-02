import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { useTheme } from "@/hooks/useTheme";

export function App() {
  useTheme();

  const [currentPath, setCurrentPath] = useState("/master/categories");

  return (
    <AdminLayout currentPath={currentPath} onNavigate={setCurrentPath}>
      {currentPath === "/master/categories" ? (
        <CategoriesPage />
      ) : (
        <DashboardPage />
      )}
    </AdminLayout>
  );
}

export default App;
