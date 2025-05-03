"use client";
import React from "react";
import { DesktopSidebar } from "../components/DesktopSidebar";
import { MobileSidebarWrapper } from "../components/MobileSidebarWrapper";
import { useSidebar } from "../hooks/useSideBar";
import ProductLandingPage from "../services/presentation/ProductLandingPage";
import ProtectedRoute from "../components/ProtectedRoutes";
import RoleExclusionGuard from "../components/RoleExclusionGuard";
import { ROLE, ROLES } from "../types/models_types/roles";

const DashboardPage: React.FC = () => {
  const sidebarProps = useSidebar();
  const { isMobile } = sidebarProps;

  return (
    <ProtectedRoute>
      <RoleExclusionGuard
        excludedRoles={[ROLE.ADMIN]}
        redirectTo="/admin"
        allowIfHasRole={[ROLE.STUDENT]}
      >
        <div className="flex flex-col sm:flex-row min-h-screen relative">
          {/* Mobile sidebar always rendered but controlled by sidebarOpen state */}
          {isMobile && (
            <MobileSidebarWrapper
              menuItems={sidebarProps.menuItems}
              activeTab={sidebarProps.activeTab}
              setActiveTab={sidebarProps.setActiveTab}
              sidebarOpen={sidebarProps.sidebarOpen}
              setSidebarOpen={sidebarProps.setSidebarOpen}
              navigateTo={sidebarProps.navigateTo}
            />
          )}

          {/* Desktop sidebar for larger screens */}
          {!isMobile && (
            <DesktopSidebar
              menuItems={sidebarProps.menuItems}
              activeTab={sidebarProps.activeTab}
              setActiveTab={sidebarProps.setActiveTab}
              navigateTo={sidebarProps.navigateTo}
            />
          )}

          {/* Main content */}
          <main
            className={`flex-1 w-full transition-all duration-300 ${
              !isMobile ? "sm:ml-20" : ""
            }`}
          >
            <ProductLandingPage />
          </main>
        </div>
      </RoleExclusionGuard>
    </ProtectedRoute>
  );
};

export default DashboardPage;
