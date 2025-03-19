"use client";
import React from "react";
import { DesktopSidebar } from "../components/DesktopSidebar";
import { MobileSidebar } from "../components/MobileSidebar";
import { useSidebar } from "../hooks/useSideBar";
import ProductLandingPage from "../services/presentation/ProductLandingPage";

const Sidebar: React.FC = () => {
  const sidebarProps = useSidebar();

  return sidebarProps.isMobile ? (
    <>
      <MobileSidebar {...sidebarProps} />
      <ProductLandingPage />
    </>
  ) : (
    <>
      <DesktopSidebar {...sidebarProps} />
      <ProductLandingPage />
    </>
  );
};

export default Sidebar;
