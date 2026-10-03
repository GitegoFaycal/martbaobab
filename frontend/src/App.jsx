import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";
import RoleRoute from "./components/auth/RoleRoute";
import AuthLayout from "./components/layout/AuthLayout";
import Header from "./components/Header";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import HomePage from "./pages/HomePage";
import PlaceholderPage from "./pages/PlaceholderPage";
import ProfilePage from "./pages/profile/ProfilePage";
import SellerDashboardPage from "./pages/seller/SellerDashboardPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

function MainLayout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />

      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route
          path="/profile"
          element={
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          }
        />

        <Route
          path="/orders"
          element={
            <MainLayout>
              <PlaceholderPage />
            </MainLayout>
          }
        />
      </Route>

      <Route element={<RoleRoute allowedRoles={["SELLER", "ADMIN"]} />}>
        <Route
          path="/seller"
          element={
            <MainLayout>
              <SellerDashboardPage />
            </MainLayout>
          }
        />
      </Route>

      <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
        <Route
          path="/admin"
          element={
            <MainLayout>
              <AdminDashboardPage />
            </MainLayout>
          }
        />
      </Route>

      <Route
        path="/unauthorized"
        element={
          <MainLayout>
            <UnauthorizedPage />
          </MainLayout>
        }
      />

      <Route
        path="/:page"
        element={
          <MainLayout>
            <PlaceholderPage />
          </MainLayout>
        }
      />
    </Routes>
  );
}