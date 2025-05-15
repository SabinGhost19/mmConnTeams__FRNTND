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
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // fet user data directly from localStorage
      const userData = getUserData();
      const userRoles = userData?.roles || [];

      console.log("User roles:", userRoles);
      console.log("Excluded roles:", excludedRoles);
      console.log("Allow if has role:", allowIfHasRole);

      const hasAllowedRole = allowIfHasRole.some((role) =>
        userRoles.includes(role)
      );

      if (hasAllowedRole) {
        console.log("User has allowed role, giving access");
        setHasAccess(true);
        return;
      }

      // otherwise check if user has any of the excluded roles
      const hasExcludedRole = excludedRoles.some((role) =>
        userRoles.includes(role)
      );

      setHasAccess(!hasExcludedRole);

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

  return hasAccess ? <>{children}</> : null;
}
