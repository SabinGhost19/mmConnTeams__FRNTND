"use client";

import { useEffect } from "react";
import { MobileSidebar } from "./MobileSidebar";
import { SidebarProps } from "../hooks/useSideBar";

type MobileSidebarWrapperProps = Pick<
  SidebarProps,
  | "menuItems"
  | "activeTab"
  | "setActiveTab"
  | "sidebarOpen"
  | "setSidebarOpen"
  | "navigateTo"
>;

export const MobileSidebarWrapper: React.FC<MobileSidebarWrapperProps> = (
  props
) => {
  useEffect(() => {
    document.body.classList.add("has-mobile-sidebar");

    return () => {
      document.body.classList.remove("has-mobile-sidebar");
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 z-[100]">
      <MobileSidebar {...props} />
    </div>
  );
};
