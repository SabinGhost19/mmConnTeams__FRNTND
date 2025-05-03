"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  route: string;
}

export interface SidebarProps {
  isMobile: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  menuItems: MenuItem[];
  navigateTo: (route: string) => void;
}

export function useSidebar(): SidebarProps {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const menuItems: MenuItem[] = [
    {
      key: "dashboard",
      name: "Dashboard",
      icon: Squares2X2Icon,
      route: "/dashboard",
    },
    {
      key: "chat",
      name: "Messages",
      icon: ChatBubbleLeftRightIcon,
      route: "/chat",
    },
    { key: "team", name: "Team", icon: UserGroupIcon, route: "/teams" },
    {
      key: "calendar",
      name: "Calendar",
      icon: CalendarDaysIcon,
      route: "/calendar",
    },
    { key: "files", name: "Files", icon: FolderIcon, route: "/files" },
  ];

  useEffect(() => {
    const currentItem = menuItems.find(
      (item) => pathname === item.route || pathname.startsWith(item.route + "/")
    );
    if (currentItem) {
      setActiveTab(currentItem.key);
    } else if (pathname === "/") {
      setActiveTab("dashboard");
    }
  }, [pathname]);

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

  const navigateTo = (route: string) => {
    router.push(route);
  };

  return {
    isMobile,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    menuItems,
    navigateTo,
  };
}
