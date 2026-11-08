import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { CategoryFormPage } from "@/pages/categories/CategoryFormPage";
import { CategoryDetailPage } from "@/pages/categories/CategoryDetailPage";
import { IngredientsPage } from "@/pages/IngredientsPage";
import { IngredientFormPage } from "@/pages/ingredients/IngredientFormPage";
import { IngredientDetailPage } from "@/pages/ingredients/IngredientDetailPage";
import { OutletsPage } from "@/pages/OutletsPage";
import { OutletFormPage } from "@/pages/outlets/OutletFormPage";
import { OutletDetailPage } from "@/pages/outlets/OutletDetailPage";
import { useTheme } from "@/hooks/useTheme";

// Route Definitions
const MASTER_ROUTES = [
  // Categories Management Routes
  {
    path: "/master/categories",
    element: (navigate: (path: string) => void) => (
      <CategoriesPage onNavigate={navigate} />
    ),
  },
  {
    path: "/master/categories/create",
    element: (navigate: (path: string) => void) => (
      <CategoryFormPage mode="create" onNavigate={navigate} />
    ),
  },
  {
    path: "/master/categories/edit/:id",
    element: (navigate: (path: string) => void) => (
      <CategoryFormPage mode="edit" onNavigate={navigate} />
    ),
  },
  {
    path: "/master/categories/detail/:id",
    element: (navigate: (path: string) => void) => (
      <CategoryDetailPage onNavigate={navigate} />
    ),
  },
  // Ingredients Management Routes
  {
    path: "/master/ingredients",
    element: (navigate: (path: string) => void) => (
      <IngredientsPage onNavigate={navigate} />
    ),
  },
  {
    path: "/master/ingredients/create",
    element: (navigate: (path: string) => void) => (
      <IngredientFormPage mode="create" onNavigate={navigate} />
    ),
  },
  {
    path: "/master/ingredients/edit/:id",
    element: (navigate: (path: string) => void) => (
      <IngredientFormPage mode="edit" onNavigate={navigate} />
    ),
  },
  {
    path: "/master/ingredients/detail/:id",
    element: (navigate: (path: string) => void) => (
      <IngredientDetailPage onNavigate={navigate} />
    ),
  },
  // Outlets Management Routes
  {
    path: "/master/outlets",
    element: (navigate: (path: string) => void) => (
      <OutletsPage onNavigate={navigate} />
    ),
  },
  {
    path: "/master/outlets/create",
    element: (navigate: (path: string) => void) => (
      <OutletFormPage mode="create" onNavigate={navigate} />
    ),
  },
  {
    path: "/master/outlets/edit/:id",
    element: (navigate: (path: string) => void) => (
      <OutletFormPage mode="edit" onNavigate={navigate} />
    ),
  },
  {
    path: "/master/outlets/detail/:id",
    element: (navigate: (path: string) => void) => (
      <OutletDetailPage onNavigate={navigate} />
    ),
  },
];

// App Content
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AdminLayout
      currentPath={location.pathname}
      onNavigate={(path) => navigate(path)}
    >
      <Routes>
        {/* Default Redirect */}
        <Route
          path="/"
          element={<Navigate to="/master/categories" replace />}
        />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Master Data */}
        {MASTER_ROUTES.map(({ path, element }) => (
          <Route key={path} path={path} element={element(navigate)} />
        ))}
        <Route
          path="*"
          element={<Navigate to="/master/categories" replace />}
        />
        {/* Master data End */}
      </Routes>
    </AdminLayout>
  );
}

// App Root
export function App() {
  useTheme();

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
