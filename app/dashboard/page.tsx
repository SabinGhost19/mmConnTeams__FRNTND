"use client";
import React from "react";
import { DesktopSidebar } from "../components/DesktopSidebar";
import { MobileSidebar } from "../components/MobileSidebar";
import { useSidebar } from "../hooks/useSideBar";
import ProductLandingPage from "../services/presentation/ProductLandingPage";

const Sidebar: React.FC = () => {
  const sidebarProps = useSidebar();

  return (
    <div className="flex flex-col sm:flex-row min-h-screen">
      {sidebarProps.isMobile ? (
        <>
          <MobileSidebar {...sidebarProps} />
          <main className="flex-1 w-full sm:ml-20">
            <ProductLandingPage />
          </main>
        </>
      ) : (
        <>
          <DesktopSidebar {...sidebarProps} />
          <main className="flex-1 w-full sm:ml-20">
            <ProductLandingPage />
          </main>
        </>
      )}
    </div>
  );
};

export default Sidebar;
