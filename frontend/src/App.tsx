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
import { useTheme } from "@/hooks/useTheme";

// Route Definitions
const MASTER_ROUTES = [
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
