import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";
import RoleRoute from "./components/auth/RoleRoute";
import Footer from "./components/Footer";
import Header from "./components/Header";
import AuthLayout from "./components/layout/AuthLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import ApplicationsPage from "./pages/jobs/ApplicationsPage";
import HiringPage from "./pages/jobs/HiringPage";
import JobDetailPage from "./pages/jobs/JobDetailPage";
import JobFormPage from "./pages/jobs/JobFormPage";
import JobsPage from "./pages/jobs/JobsPage";
import ListingDetailPage from "./pages/marketplace/ListingDetailPage";
import ListingsPage from "./pages/marketplace/ListingsPage";
import ShopPage from "./pages/marketplace/ShopPage";
import ShopsPage from "./pages/marketplace/ShopsPage";
import NotFoundPage from "./pages/NotFoundPage";
import PeoplePage from "./pages/people/PeoplePage";
import PersonPage from "./pages/people/PersonPage";
import ChangePasswordPage from "./pages/profile/ChangePasswordPage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import ProfilePage from "./pages/profile/ProfilePage";
import ListingFormPage from "./pages/seller/ListingFormPage";
import SellerDashboardPage from "./pages/seller/SellerDashboardPage";
import ShopFormPage from "./pages/seller/ShopFormPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

function MainLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

const page = (element) => <MainLayout>{element}</MainLayout>;

export default function App() {
  return (
    <Routes>
      {/* Public marketplace, people and jobs */}
      <Route path="/" element={page(<HomePage />)} />
      <Route path="/shop" element={page(<ListingsPage mode="shop" />)} />
      <Route path="/second-hand" element={page(<ListingsPage mode="second-hand" />)} />
      <Route path="/services" element={page(<ListingsPage mode="services" />)} />
      <Route path="/listings/:slug" element={page(<ListingDetailPage />)} />
      <Route path="/shops" element={page(<ShopsPage />)} />
      <Route path="/shops/:slug" element={page(<ShopPage />)} />
      <Route path="/people" element={page(<PeoplePage />)} />
      <Route path="/people/:id" element={page(<PersonPage />)} />
      <Route path="/jobs" element={page(<JobsPage />)} />
      <Route path="/jobs/:slug" element={page(<JobDetailPage />)} />
      <Route path="/unauthorized" element={page(<UnauthorizedPage />)} />

      {/* Authentication */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* Any logged-in user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/jobs/new" element={page(<JobFormPage />)} />
        <Route path="/jobs/:id/edit" element={page(<JobFormPage />)} />
        <Route path="/hiring" element={page(<HiringPage />)} />
        <Route path="/hiring/:id" element={page(<HiringPage />)} />
        <Route path="/applications" element={page(<ApplicationsPage />)} />
        <Route path="/profile" element={page(<ProfilePage />)} />
        <Route path="/profile/edit" element={page(<EditProfilePage />)} />
        <Route path="/profile/change-password" element={page(<ChangePasswordPage />)} />
      </Route>

      {/* Sellers */}
      <Route element={<RoleRoute allowedRoles={["SELLER", "ADMIN"]} />}>
        <Route path="/seller" element={page(<SellerDashboardPage />)} />
        <Route path="/seller/shop" element={page(<ShopFormPage />)} />
        <Route path="/seller/listings/new" element={page(<ListingFormPage />)} />
        <Route path="/seller/listings/:id/edit" element={page(<ListingFormPage />)} />
      </Route>

      {/* Administrators */}
      <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={page(<AdminDashboardPage />)} />
      </Route>

      <Route path="*" element={page(<NotFoundPage />)} />
    </Routes>
  );
}
