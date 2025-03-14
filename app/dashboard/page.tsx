"use client";
import React from "react";
import { DesktopSidebar } from "../components/DesktopSidebar";
import { MobileSidebar } from "../components/MobileSidebar";
import { useSidebar } from "../hooks/useSideBar";

const Sidebar: React.FC = () => {
  const sidebarProps = useSidebar();

  return sidebarProps.isMobile ? (
    <MobileSidebar {...sidebarProps} />
  ) : (
    <DesktopSidebar {...sidebarProps} />
  );
};

export default Sidebar;
