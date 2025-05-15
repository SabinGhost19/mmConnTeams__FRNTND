"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/auth-context";
import { getUserData } from "../lib/auth-utils";

interface RoleBasedGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function RoleBasedGuard({
  children,
  allowedRoles,
  redirectTo = "/dashboard",
}: RoleBasedGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      // if not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // get user data directly from localStorage
      const userData = getUserData();
      const userRoles = userData?.roles || [];

      // check if user has any of the allowed roles
      const hasAllowedRole = allowedRoles.some((role) =>
        userRoles.includes(role)
      );

      setHasPermission(hasAllowedRole);

      // if aAuthenticated but doesnt have allowed roles redirect to specified route
      if (!hasAllowedRole) {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, router, allowedRoles, redirectTo]);

  if (isLoading || hasPermission === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // oonly render children if user has permission
  return hasPermission ? <>{children}</> : null;
}
