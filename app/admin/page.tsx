"use client";
import AdminLandingPage from "../services/admin/AdminLandingPage";
import { api } from "@/app/lib/api";
import { ROLE } from "../types/models_types/roles";
import ProtectedRoute from "../components/ProtectedRoutes";
import RoleBasedGuard from "../components/RoleBasedGuard";

const AdminPage = () => {
  return (
    <ProtectedRoute>
      <RoleBasedGuard allowedRoles={[ROLE.ADMIN]} redirectTo="/dashboard">
        <AdminLandingPage />
      </RoleBasedGuard>
    </ProtectedRoute>
  );
};

export default AdminPage;
