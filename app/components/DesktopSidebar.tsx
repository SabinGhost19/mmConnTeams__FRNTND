import React from "react";
import { SidebarProps } from "../hooks/useSideBar";
import { Squares2X2Icon } from "@heroicons/react/24/outline";

type DesktopSidebarProps = Pick<
  SidebarProps,
  "menuItems" | "activeTab" | "setActiveTab"
>;

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  menuItems,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="fixed left-0 top-0 h-screen w-20 bg-gray-900 flex flex-col items-center py-6 shadow-xl">
      <div className="mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
          T
        </div>
      </div>

      <nav className="space-y-4 w-full">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`
              w-full flex flex-col items-center justify-center
              py-3 transition-all duration-300
              ${
                activeTab === item.key
                  ? "text-blue-500 bg-gray-800"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }
            `}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto mb-6">
        <button className="text-gray-400 hover:text-white transition-colors">
          <Squares2X2Icon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
