// Path: web-app/src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Landing page pe sidebar hide karna hai
  if (pathname === "/") return null;

  const navLinks = [
    { href: "/dashboard", icon: "🌟", label: "Discover Agents" },
    { type: "divider", label: "Categories" },
    { href: "/sandbox", icon: "🛠️", label: "Developer Sandbox" },
    { href: "/finance", icon: "📈", label: "Finance & Trading" },
    { href: "/hr", icon: "🤝", label: "Human Resources" },
    { href: "/education", icon: "🎓", label: "Education & Research" },
    { href: "/sales", icon: "💸", label: "Sales & Marketing" },
    { href: "/support", icon: "🎧", label: "Customer Support" },
    { href: "/logistics", icon: "📦", label: "Logistics & Supply Chain" },
    { href: "/media", icon: "🎬", label: "Media & Content" },
  ];

  return (
    <aside 
      className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-[#0f0f0f] border-r border-slate-200 dark:border-white/5 flex-col hidden md:flex transition-all duration-300 relative`}
    >
      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm z-10 hover:bg-slate-50 dark:hover:bg-[#222]"
      >
        {isCollapsed ? "❯" : "❮"}
      </button>

      {/* Header / Logo */}
      <div className={`p-6 flex items-center gap-3 ${isCollapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shrink-0">
          A
        </div>
        {!isCollapsed && <h1 className="text-xl font-bold tracking-tight truncate">AgenticForge</h1>}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {navLinks.map((link, index) => {
          if (link.type === "divider") {
            return (
              <div key={index} className={`pt-4 pb-2 ${isCollapsed ? 'px-0 text-center' : 'px-4'}`}>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
                  {isCollapsed ? "—" : link.label}
                </p>
              </div>
            );
          }

          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          
          return (
            <Link 
              key={index}
              href={link.href!} 
              className={`flex items-center gap-3 py-2.5 rounded-xl transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${isActive ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
              title={isCollapsed ? link.label : ""}
            >
              <span className="text-lg shrink-0">{link.icon}</span>
              {!isCollapsed && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Profile Section (Temporary, will replace with Clerk later) */}
      <div className="p-4 border-t border-slate-100 dark:border-white/5">
        <div className={`flex items-center gap-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 ${isCollapsed ? 'justify-center py-3 px-0' : 'px-4 py-3'}`}>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">SP</div>
          {!isCollapsed && (
            <div className="truncate">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Siddhant Pathak</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Developer</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}