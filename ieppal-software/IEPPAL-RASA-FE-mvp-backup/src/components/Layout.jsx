import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen font-sans bg-[#f5f1eb] dark:bg-neutral-900 flex transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 pt-5 px-4 sm:px-6 lg:px-10 pb-6 lg:pb-10 overflow-auto">
        <div key={location.pathname} className="animate-[fadeIn_0.3s_ease-out]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
