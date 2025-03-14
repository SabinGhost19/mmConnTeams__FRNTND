"use client";
import { useState, useEffect } from "react";
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  FolderIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

export interface MenuItem {
  key: string;
  name: string;
  icon: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & {
      title?: string;
      titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
}

export interface SidebarProps {
  isMobile: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  menuItems: MenuItem[];
}

export function useSidebar(): SidebarProps {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const menuItems: MenuItem[] = [
    { key: "dashboard", name: "Dashboard", icon: Squares2X2Icon },
    { key: "chat", name: "Messages", icon: ChatBubbleLeftRightIcon },
    { key: "team", name: "Team", icon: UserGroupIcon },
    { key: "calendar", name: "Calendar", icon: CalendarDaysIcon },
    { key: "files", name: "Files", icon: FolderIcon },
  ];

  useEffect(() => {
    const checkIsMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return {
    isMobile,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    menuItems,
  };
}
