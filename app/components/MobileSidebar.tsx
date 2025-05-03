"use client";
import React from "react";
import {
  Bars3Icon,
  XMarkIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { SidebarProps } from "../hooks/useSideBar";

type MobileSidebarProps = Pick<
  SidebarProps,
  | "menuItems"
  | "activeTab"
  | "setActiveTab"
  | "sidebarOpen"
  | "setSidebarOpen"
  | "navigateTo"
>;

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  menuItems,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  navigateTo,
}) => {
  // Handle click on menu item
  const handleMenuItemClick = (key: string, route: string) => {
    setActiveTab(key);
    navigateTo(route);
    setSidebarOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed z-[150] top-4 left-4 p-2 bg-gray-900 rounded-md text-white shadow-xl flex items-center justify-center"
        aria-label="Toggle menu"
        style={{
          width: "40px",
          height: "40px",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        }}
      >
        {sidebarOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      <div
        className={`
          transition-all duration-300 ease-in-out
          fixed z-[140] top-0 left-0 h-screen w-64 bg-gray-900 shadow-xl
          flex flex-col items-center py-6
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
            T
          </div>
        </div>

        <nav className="w-full px-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleMenuItemClick(item.key, item.route)}
              className={`
                w-full flex items-center py-3 px-3 mb-2 rounded-lg
                transition-all duration-200 
                ${
                  activeTab === item.key
                    ? "text-blue-500 bg-gray-800"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }
              `}
            >
              <item.icon className="w-6 h-6 min-w-6" />
              <span className="text-sm ml-3 whitespace-nowrap">
                {item.name}
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-auto mb-6">
          <button className="text-gray-400 hover:text-white transition-colors p-2">
            <Squares2X2Icon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[130]"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};
