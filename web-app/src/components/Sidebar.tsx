// Path: web-app/src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isLoaded } = useUser();

  if (pathname === "/" || pathname.startsWith("/sign-")) return null;

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
    { href: "/travel", icon: "✈️", label: "Travel & Events" },
  ];

  return (
    // 1. Z-index ko badha kar z-50 kiya aur width strictly fixed rakhi (w-64)
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-[#0f0f0f] border-r border-slate-200 dark:border-white/5 flex-col hidden md:flex transition-all duration-300 ease-in-out relative z-50 shrink-0`}>
      
      {/* 2. BUTTON FIX: isko ekdum top-5 (center of header) pe rakha aur iska background main page jaisa (#0a0a0a) kar diya taaki ye ghusa hua na lage */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-full w-6 h-6 flex items-center justify-center text-[10px] text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-sm z-60 transition-transform hover:scale-110 cursor-pointer"
      >
        {isCollapsed ? "❯" : "❮"}
      </button>

      {/* 3. HEADER FIX: Iski height fix h-16 kardi taaki ye layout.tsx wale top header ke saath 100% align ho jaye! */}
      <div className={`h-16 flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xl text-white shadow-md shrink-0">
          A
        </div>
        <h1 className={`text-xl font-bold tracking-tight whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
          AgenticForge
        </h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar overflow-x-hidden">
        {navLinks.map((link, index) => {
          if (link.type === "divider") {
            return (
              <div key={index} className={`pt-4 pb-2 transition-all duration-300 ${isCollapsed ? 'px-0 text-center' : 'px-3'}`}>
                <p className={`text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-40' : 'opacity-100'}`}>
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
              title={link.label}
              // Active state aur padding ko thoda sleek and compact (py-2 px-3) kar diya
              className={`group flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <span className="text-lg shrink-0 drop-shadow-sm">{link.icon}</span>
              
              {/* 4. PERFECT TRUNCATE FIX: flex-1 lagane se ye ab strictly container tak stretch hoga aur extra text "..." ban jayega bina layout tode! */}
              <span className={`flex-1 truncate text-sm transition-all duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-slate-100 dark:border-white/5 overflow-hidden">
        <div className={`flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 transition-all duration-300 ${isCollapsed ? 'justify-center py-2 px-0' : 'px-3 py-2 hover:shadow-sm'}`}>
          <div className="shrink-0 flex items-center justify-center">
             <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-7 h-7 rounded-full shadow-sm" } }} />
          </div>
          <div className={`transition-all duration-300 whitespace-nowrap overflow-hidden flex flex-col justify-center ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
            {isLoaded && user && (
              <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">{user.fullName}</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}