// Path: web-app/src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isIndustryOpen, setIsIndustryOpen] = useState(false); 
  const { user, isLoaded } = useUser();

  if (pathname === "/" || pathname.startsWith("/sign-")) return null;

  const coreLinks = [
    { href: "/dashboard", icon: "🌟", label: "Discover Agents" },
    { href: "/sandbox", icon: "🛠️", label: "Developer Sandbox" },
  ];

  const industryLinks = [
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
    <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white dark:bg-[#0f0f0f] border-r border-slate-200 dark:border-white/5 flex flex-col hidden md:flex transition-all duration-300 ease-in-out relative z-50 shrink-0`}>
      
      {/* Collapse Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-full w-6 h-6 flex items-center justify-center text-[10px] text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-sm z-[60] transition-transform hover:scale-110 cursor-pointer"
      >
        {isCollapsed ? "❯" : "❮"}
      </button>

      {/* 🌟 1. LOGO FIX: Logo ka size bada (w-14 h-14) kiya aur text thoda chota (text-xl) */}
      <div className={`h-24 flex items-center gap-3 overflow-hidden shrink-0 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
        <div className="shrink-0 relative w-14 h-14 flex items-center justify-center">
          <Image 
            src="/logo.png" 
            alt="AgenticForge Logo" 
            fill 
            className="object-contain drop-shadow-lg" 
          />
        </div>
        <h1 className={`text-xl font-extrabold tracking-tight whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
          AgenticForge
        </h1>
      </div>
      
      {/* 🌟 2. NAVIGATION FIX: overflow-hidden yahan lagaya, taaki poora sidebar scroll na ho */}
      <nav className="flex-1 flex flex-col p-4 overflow-hidden">
        
        {/* Core Links (Fixed Area) */}
        <div className="shrink-0 space-y-1">
          {coreLinks.map((link, index) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link 
                key={index}
                href={link.href!} 
                title={link.label}
                className={`group flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <span className="text-xl shrink-0 drop-shadow-sm">{link.icon}</span>
                <span className={`flex-1 truncate text-[15px] transition-all duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Divider line (Fixed) */}
        <div className={`shrink-0 my-3 border-t border-slate-100 dark:border-white/5 ${isCollapsed ? 'mx-2' : 'mx-3'}`}></div>

        {/* 🌟 3. INDEPENDENT SCROLL AREA: Flex-1 lagaya taaki sirf iske andar scroll ho */}
        <div className={`flex flex-col ${isIndustryOpen ? 'flex-1 min-h-0' : 'shrink-0'}`}>
          <button 
            onClick={() => setIsIndustryOpen(!isIndustryOpen)}
            title="Industry Micro-Agents"
            className={`shrink-0 w-full group flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white ${isCollapsed ? 'justify-center' : ''} ${isIndustryOpen && !isCollapsed ? 'bg-slate-50 dark:bg-white/5' : ''}`}
          >
            <span className="text-xl shrink-0 drop-shadow-sm transition-transform duration-300">📁</span>
            <span className={`flex-1 text-left truncate text-[15px] transition-all duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
              Industry Micro-Agents
            </span>
            {!isCollapsed && (
              <span className={`text-xs opacity-50 transition-transform duration-300 ${isIndustryOpen ? 'rotate-180' : ''}`}>▼</span>
            )}
          </button>

          {/* Sirf ye andar wala div ab scroll hoga! */}
          <div className={`flex flex-col transition-all duration-300 ease-in-out ${isIndustryOpen ? 'flex-1 min-h-0 mt-1 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1 pb-4">
              {industryLinks.map((link, index) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link 
                    key={index}
                    href={link.href!} 
                    title={link.label}
                    className={`group flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-200 ${isCollapsed ? 'justify-center' : 'pl-11'} ${isActive ? 'bg-blue-50/50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    <span className={`text-lg shrink-0 drop-shadow-sm transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{link.icon}</span>
                    <span className={`flex-1 truncate text-sm transition-all duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

      </nav>

      {/* Profile Section (Fixed at bottom) */}
      <div className="shrink-0 p-4 border-t border-slate-100 dark:border-white/5 overflow-hidden">
        <div className={`flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 transition-all duration-300 ${isCollapsed ? 'justify-center py-2 px-0' : 'px-3 py-2 hover:shadow-sm'}`}>
          <div className="shrink-0 flex items-center justify-center">
             <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8 rounded-full shadow-sm" } }} />
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