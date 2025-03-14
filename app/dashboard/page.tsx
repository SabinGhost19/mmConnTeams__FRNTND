"use client";
import React, { useState, useEffect } from "react";
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  FolderIcon,
  Squares2X2Icon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { key: "dashboard", name: "Dashboard", icon: Squares2X2Icon },
    { key: "chat", name: "Messages", icon: ChatBubbleLeftRightIcon },
    { key: "team", name: "Team", icon: UserGroupIcon },
    { key: "calendar", name: "Calendar", icon: CalendarDaysIcon },
    { key: "files", name: "Files", icon: FolderIcon },
  ];

  //check if is mobile
  useEffect(() => {
    const checkIsMobile = () => {
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

  return (
    <>
      {/* mb toggle btn */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed z-50 top-4 left-4 p-2 bg-gray-900 rounded-md text-white"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      )}

      {/* sidebar */}
      <div
        className={`
          transition-all duration-300 ease-in-out
          fixed z-40 top-0 left-0 h-screen bg-gray-900 shadow-xl
          flex flex-col items-center py-6
          ${
            isMobile
              ? sidebarOpen
                ? "w-64 translate-x-0"
                : "w-64 -translate-x-full"
              : "w-20 translate-x-0"
          }
        `}
      >
        <div className="mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
            T
          </div>
        </div>

        {/* desk nav */}
        {!isMobile && (
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
        )}

        {/* mob nav */}
        {isMobile && (
          <nav className="w-full px-2">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setSidebarOpen(false);
                }}
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
        )}

        <div className="mt-auto mb-6">
          <button className="text-gray-400 hover:text-white transition-colors p-2">
            <Squares2X2Icon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* auto close mob sidebar after select */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
