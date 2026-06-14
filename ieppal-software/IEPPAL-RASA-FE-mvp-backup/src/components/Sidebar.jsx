import React, { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FiBookOpen,
  FiSettings,
  FiLogOut,
  FiUsers,
  FiUser,
  FiSun,
  FiMoon,
  FiHome,
} from "react-icons/fi";
import IeppalLogo from "../assets/icons/ieppal-logo.svg?react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../apiClient";
import { useTheme } from "../context/ThemeContext";

const bottomItems = [
  { name: "Strategy Library", icon: <FiBookOpen className="w-6 h-6" />, path: "/strategy-library" },
  { name: "Settings", icon: <FiSettings className="w-6 h-6" />, path: "/settings" },
];

const Label = ({ children }) => (
  <span className="ml-3 text-base font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    {children}
  </span>
);

function SidebarAnimatedLogo({ onHoverRef }) {
  const eyeLRef = useRef(null);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const cooldownRef = useRef(0);

  useEffect(() => {
    const timeouts = [];
    const t = (fn, ms) => { const id = setTimeout(fn, ms); timeouts.push(id); return id; };

    function spawnStar() {
      const container = containerRef.current;
      if (!container) return;
      const star = document.createElement("div");
      star.style.cssText = "position:absolute;left:38%;top:28%;pointer-events:none;z-index:60;width:8px;height:8px;background:#fbbf24;clip-path:polygon(50% 0%,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0% 50%,38% 38%);animation:sidebar-twinkle 0.8s ease-in-out forwards;filter:drop-shadow(0 0 2px rgba(251,191,36,0.6))";
      container.appendChild(star);
      setTimeout(() => star.remove(), 800);
    }

    function doWink() {
      if (!eyeLRef.current || Date.now() < cooldownRef.current) return;
      cooldownRef.current = Date.now() + 800;
      spawnStar();
      eyeLRef.current.style.transform = "scaleY(0.05)";
      t(() => { if (eyeLRef.current) eyeLRef.current.style.transform = "scaleY(1)"; }, 250);
    }

    function doTilt() {
      const svg = svgRef.current;
      if (!svg || Date.now() < cooldownRef.current) return;
      cooldownRef.current = Date.now() + 800;
      const angle = Math.random() < 0.5 ? -8 : 8;
      svg.style.transition = "transform 0.5s ease-in-out";
      svg.style.transform = `rotate(${angle}deg)`;
      t(() => { if (svg) { svg.style.transform = ""; } }, 500);
    }

    // Expose wink for hover trigger
    if (onHoverRef) onHoverRef.current = doTilt;

    function scheduleAction() {
      const actions = [doWink, doWink, doTilt];
      actions[Math.floor(Math.random() * actions.length)]();
      t(scheduleAction, 4000 + Math.random() * 6000);
    }
    t(scheduleAction, 3000 + Math.random() * 3000);

    return () => timeouts.forEach(clearTimeout);
  }, [onHoverRef]);

  return (
    <>
      <style>{`@keyframes sidebar-twinkle { 0%{opacity:0;transform:translate(-50%,-50%) scale(0)} 15%{opacity:1;transform:translate(-50%,-50%) scale(1.1)} 40%{opacity:1;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(-50%,-50%) scale(0)} }`}</style>
      <div ref={containerRef} className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden">
        <div className="absolute inset-[3px] rounded-full bg-white" />
        <svg ref={svgRef} viewBox="0 0 500 500" className="w-10 h-10 relative" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0,500) scale(0.1,-0.1)" fill="#000000" stroke="none">
            <path d="M2155 4859 c-257 -37 -457 -100 -710 -224 -817 -398 -1326 -1217 -1326 -2134 0 -390 76 -717 247 -1060 378 -763 1098 -1245 1969 -1320 235 -20 567 17 831 93 401 116 747 325 1044 632 377 389 592 847 661 1407 17 143 7 479 -20 630 -63 354 -180 654 -364 930 -296 442 -677 743 -1178 930 -136 51 -260 82 -451 111 -210 33 -497 35 -703 5z m525 -510 c725 -66 1349 -563 1580 -1256 195 -586 94 -1218 -271 -1706 -108 -144 -300 -327 -446 -424 -218 -146 -427 -234 -692 -290 -116 -26 -143 -28 -351 -27 -205 0 -236 3 -351 27 -416 88 -769 286 -1029 579 -328 370 -496 833 -477 1318 11 266 69 503 181 737 262 545 790 939 1377 1027 186 28 301 32 479 15z" />
            <g ref={eyeLRef} style={{ transformBox: 'fill-box', transformOrigin: 'center', transition: 'transform 0.1s linear' }}>
              <path d="M2182 3594 c-182 -90 -218 -331 -72 -473 110 -107 290 -106 399 1 59 59 83 110 89 189 6 90 -16 154 -76 218 -64 68 -117 91 -213 91 -61 0 -85 -5 -127 -26z" />
            </g>
            <path d="M3394 3596 c-60 -28 -116 -82 -144 -140 -31 -65 -28 -185 6 -254 28 -56 73 -100 137 -134 64 -34 184 -32 253 4 58 31 108 83 135 142 27 59 26 185 -1 242 -50 102 -149 164 -265 164 -53 0 -83 -6 -121 -24z" />
            <path d="M2265 2626 c-95 -44 -146 -127 -146 -238 0 -104 41 -167 154 -242 341 -225 792 -258 1151 -86 91 44 221 126 248 156 58 68 79 162 53 250 -22 76 -96 153 -168 173 -77 22 -158 10 -226 -34 -157 -101 -289 -141 -439 -132 -133 8 -237 44 -347 120 -28 18 -65 39 -84 45 -56 20 -140 15 -196 -12z" />
          </g>
        </svg>
      </div>
    </>
  );
}

export default function Sidebar() {
  const [classrooms, setClassrooms] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const logoHoverRef = useRef(null);

  const isStudent = user?.role === 'STUDENT';

  useEffect(() => {
    if (isAuthenticated && !isStudent) {
      apiClient.getClassrooms()
        .then(setClassrooms)
        .catch(() => {});
    }
  }, [isAuthenticated, isStudent, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const homePath = isStudent ? '/my-profile' : '/classrooms';
  const isClassroomsActive = location.pathname === '/classrooms';

  const itemClasses = (isActive) =>
    `flex items-center h-12 rounded-lg transition-colors duration-200 px-5 ${
      isActive ? "bg-white/30 text-white" : "text-white/70 hover:text-white hover:bg-white/20"
    }`;

  const themeToggle = (
    <button
      onClick={toggleTheme}
      className="flex items-center h-12 w-full rounded-lg transition-colors duration-200 px-5 text-white/70 hover:text-white hover:bg-white/20"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    >
      {theme === 'dark' ? (
        <FiSun className="w-6 h-6 flex-shrink-0" />
      ) : (
        <FiMoon className="w-6 h-6 flex-shrink-0" />
      )}
      <Label>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</Label>
    </button>
  );

  // Student sidebar — simplified
  if (isStudent) {
    return (
      <aside className="group w-16 hover:w-56 transition-[width] duration-300 ease-in-out bg-gradient-to-b from-pink-500 to-orange-500 h-screen sticky top-0 flex flex-col overflow-hidden">
        <button onClick={() => navigate('/my-profile')} onMouseEnter={() => logoHoverRef.current?.()} className="flex items-center h-16 mt-5 px-3 cursor-pointer">
          <SidebarAnimatedLogo onHoverRef={logoHoverRef} />
          <span className="ml-3 text-[2.5rem] leading-none font-serif tracking-tight text-white -mt-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
            IEP Pal
          </span>
        </button>

        <div className="mt-2">
          <NavLink
            to="/my-profile"
            className={({ isActive }) => itemClasses(isActive)}
            aria-label="My Profile"
            title="My Profile"
          >
            {() => (
              <>
                <FiUser className="w-6 h-6 flex-shrink-0" />
                <Label>My Profile</Label>
              </>
            )}
          </NavLink>
        </div>

        <nav className="space-y-1 mt-1">
          <NavLink
            to="/settings"
            className={({ isActive }) => itemClasses(isActive)}
            aria-label="Settings"
            title="Settings"
          >
            {() => (
              <>
                <FiSettings className="w-6 h-6 flex-shrink-0" />
                <Label>Settings</Label>
              </>
            )}
          </NavLink>
        </nav>

        <div className="mt-auto pb-4 space-y-1">
          {themeToggle}
          <button
            onClick={handleLogout}
            className="flex items-center h-12 w-full rounded-lg transition-colors duration-200 px-5 text-white/70 hover:text-white hover:bg-white/20"
            aria-label="Sign Out"
            title="Sign Out"
          >
            <FiLogOut className="w-6 h-6 flex-shrink-0" />
            <Label>Sign Out</Label>
          </button>
        </div>
      </aside>
    );
  }

  // Teacher sidebar — original
  return (
    <aside
      className="group w-16 hover:w-56 transition-[width] duration-300 ease-in-out bg-gradient-to-b from-pink-500 to-orange-500 h-screen sticky top-0 flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <button onClick={() => navigate(homePath)} className="flex items-center h-16 mt-5 px-3 cursor-pointer">
        <div onMouseEnter={() => logoHoverRef.current?.()}><SidebarAnimatedLogo onHoverRef={logoHoverRef} /></div>
        <span className="ml-3 text-[2.5rem] leading-none font-serif tracking-tight text-white -mt-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:tracking-normal">
          IEP Pal
        </span>
      </button>

      {/* Classrooms */}
      <div className="mt-2">
        <NavLink
          to="/classrooms"
          className={() => itemClasses(isClassroomsActive)}
          aria-label="Classrooms"
          title="Classrooms"
        >
          {() => (
            <>
              <FiHome className="w-6 h-6 flex-shrink-0" strokeWidth={1.5} />
              <Label>Classrooms</Label>
            </>
          )}
        </NavLink>

        {/* Classroom sub-items */}
        {classrooms.length > 0 && (
          <div className="overflow-hidden max-h-0 opacity-0 group-hover:opacity-100 group-hover-sub-expand transition-all duration-300 ease-in-out"
            style={{ '--sub-max-h': `${classrooms.length * 2.5}rem` }}
          >
            <div className="ml-8 mr-2 mt-1 space-y-0.5">
              {classrooms.map((classroom) => {
                const classroomPath = `/classroom/${encodeURIComponent(classroom.name)}`;
                const isActive = decodeURIComponent(location.pathname) === `/classroom/${classroom.name}`;

                return (
                  <button
                    key={classroom.id}
                    onClick={() => navigate(classroomPath)}
                    className={`flex items-center w-full h-9 rounded-md transition-colors duration-200 px-3 ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/15"
                    }`}
                    title={classroom.name}
                  >
                    <FiUsers className="w-4 h-4 flex-shrink-0" />
                    <span className="ml-3 text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {classroom.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Other nav items */}
      <nav className="space-y-1 mt-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => itemClasses(isActive)}
            aria-label={item.name}
            title={item.name}
          >
            {() => (
              <>
                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                  {item.icon}
                </div>
                <Label>{item.name}</Label>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle + Sign Out */}
      <div className="mt-auto pb-4 space-y-1">
        {themeToggle}
        <button
          onClick={handleLogout}
          className="flex items-center h-12 w-full rounded-lg transition-colors duration-200 px-5 text-white/70 hover:text-white hover:bg-white/20"
          aria-label="Sign Out"
          title="Sign Out"
        >
          <FiLogOut className="w-6 h-6 flex-shrink-0" />
          <Label>Sign Out</Label>
        </button>
      </div>
    </aside>
  );
}
