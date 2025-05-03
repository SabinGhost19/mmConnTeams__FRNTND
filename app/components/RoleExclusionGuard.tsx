"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/auth-context";
import { getUserData } from "../lib/auth-utils";
import { ROLE } from "../types/models_types/roles";

interface RoleExclusionGuardProps {
  children: React.ReactNode;
  excludedRoles: string[];
  redirectTo?: string;
  allowIfHasRole?: string[];
}

export default function RoleExclusionGuard({
  children,
  excludedRoles,
  redirectTo = "/admin",
  allowIfHasRole = [ROLE.STUDENT],
}: RoleExclusionGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // Get user data directly from localStorage
      const userData = getUserData();
      const userRoles = userData?.roles || [];

      console.log("User roles:", userRoles);
      console.log("Excluded roles:", excludedRoles);
      console.log("Allow if has role:", allowIfHasRole);

      // First check if user has any of the allowIfHasRole roles
      const hasAllowedRole = allowIfHasRole.some((role) =>
        userRoles.includes(role)
      );

      // If user has an explicitly allowed role, give access regardless of excluded roles
      if (hasAllowedRole) {
        console.log("User has allowed role, giving access");
        setHasAccess(true);
        return;
      }

      // Otherwise check if user has any of the excluded roles
      const hasExcludedRole = excludedRoles.some((role) =>
        userRoles.includes(role)
      );

      setHasAccess(!hasExcludedRole);

      // If user has excluded role (and no allowed role), redirect
      if (hasExcludedRole) {
        console.log("User has excluded role, redirecting");
        router.push(redirectTo);
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    router,
    excludedRoles,
    redirectTo,
    allowIfHasRole,
  ]);

  if (isLoading || hasAccess === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Only render children if user doesn't have excluded roles
  return hasAccess ? <>{children}</> : null;
}
