// src/components/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiSearch } from "react-icons/fi";
import profilePlaceholder from "../assets/icons/profile-placeholder.png";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-white dark:bg-neutral-800 shadow-lg dark:shadow-neutral-900/50 rounded-b-2xl py-2 sm:py-3 px-3 sm:px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex flex-1 items-center mx-2 sm:mx-4 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-full px-3 sm:px-4 py-2 shadow-sm dark:shadow-none">
        <FiSearch className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
        <input
          type="text"
          placeholder="Search IEP Pal"
          className="ml-3 flex-1 bg-transparent placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-neutral-100 focus:outline-none"
        />
      </div>
      <div className="flex items-center space-x-6">
        <button
          className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-all duration-300"
          title="Notifications"
        >
          <FiBell className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        </button>
        <button
          onClick={() => {
            // Account menu action
          }}
          className="w-10 h-10 rounded-full overflow-hidden"
          title="Profile"
        >
          <img src={profilePlaceholder} alt="Profile" className="w-full h-full object-cover" />
        </button>
      </div>
    </header>
  );
}
