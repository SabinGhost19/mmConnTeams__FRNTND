"use client";

import TeamsChat from "../services/new_chat/LandingPage";
import ProtectedRoute from "../components/ProtectedRoutes";
import RoleExclusionGuard from "../components/RoleExclusionGuard";
import { ROLE } from "../types/models_types/roles";

const TeamsChatPage = () => {
  return (
    <ProtectedRoute>
      <RoleExclusionGuard
        excludedRoles={[ROLE.ADMIN]}
        redirectTo="/admin"
        allowIfHasRole={[ROLE.STUDENT]}
      >
        <TeamsChat />
      </RoleExclusionGuard>
    </ProtectedRoute>
  );
};

export default TeamsChatPage;
