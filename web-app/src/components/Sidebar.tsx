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
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(true); 
  const [isIndustryOpen, setIsIndustryOpen] = useState(false); 
  const { user, isLoaded } = useUser();

  if (pathname === "/" || pathname.startsWith("/sign-")) return null;

  const coreLinks = [
    { href: "/dashboard", icon: "🌟", label: "Discover Agents" },
    { href: "/sandbox", icon: "🛠️", label: "Developer Sandbox" },
  ];

  const workflowLinks = [
    { href: "/workflows/mediforge", icon: "🏥", label: "MediForge Receptionist" },
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
    <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-slate-50/50 dark:bg-[#0a0a0a] border-r border-slate-200/80 dark:border-white/5 flex flex-col hidden md:flex transition-all duration-300 ease-in-out relative z-50 shrink-0`}>
      
      {/* Collapse Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-full w-6 h-6 flex items-center justify-center text-[10px] text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm z-[60] transition-transform hover:scale-110 cursor-pointer"
      >
        {isCollapsed ? "❯" : "❮"}
      </button>

      {/* LOGO AREA */}
      <div className={`h-24 flex items-center gap-3 overflow-hidden shrink-0 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
        <div className="shrink-0 relative w-15 h-15 flex items-center justify-center">
          <Image src="/logo.png" alt="AgenticForge Logo" fill className="object-contain drop-shadow-sm" />
        </div>
        <h1 className={`text-[20px] font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
          AgenticForge
        </h1>
      </div>
      
      {/* NAVIGATION AREA - Added Custom Scrollbar CSS here */}
      <nav className="flex-1 flex flex-col px-4 pb-4 overflow-hidden">
        
        {/* Core Links */}
        <div className="shrink-0 space-y-1">
          {coreLinks.map((link, index) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link key={index} href={link.href!} className={`group flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-white dark:bg-[#1a1a1a] text-blue-600 dark:text-blue-400 font-bold shadow-sm border border-slate-200/50 dark:border-white/5' : 'text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>
                <span className="text-xl shrink-0 opacity-90">{link.icon}</span>
                <span className={`flex-1 truncate text-[14px] transition-all duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className={`shrink-0 my-4 border-t border-slate-200/60 dark:border-white/5 ${isCollapsed ? 'mx-2' : 'mx-4'}`}></div>

        {/* SCROLLABLE AREA WITH SLEEK CUSTOM SCROLLBAR */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 transition-colors">
          
          {/* 🌟 VIP SECTION: Enterprise Workflows (Cleaned up backgrounds) */}
          <div className="flex flex-col">
            <button onClick={() => setIsWorkflowOpen(!isWorkflowOpen)} className={`w-full group flex items-center justify-between py-2 px-2 rounded-lg transition-all duration-200 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm shrink-0">👑</span>
                <span className={`text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Enterprise Workflows</span>
              </div>
              {!isCollapsed && <span className={`text-[10px] transition-transform duration-300 ${isWorkflowOpen ? 'rotate-180' : ''}`}>▼</span>}
            </button>
            
            <div className={`flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isWorkflowOpen ? 'mt-1 opacity-100 max-h-[500px]' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-1">
                {workflowLinks.map((link, index) => {
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <Link key={index} href={link.href!} className={`group flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-200 ${isCollapsed ? 'justify-center' : 'ml-2'} ${isActive ? 'bg-white dark:bg-[#1a1a1a] text-amber-600 dark:text-amber-500 font-bold shadow-sm border border-slate-200/50 dark:border-white/5' : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>
                      <span className="text-lg shrink-0 opacity-90">{link.icon}</span>
                      <span className={`flex-1 truncate text-[14px] transition-all duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Industry Micro-Agents Section (Cleaned up backgrounds) */}
          <div className="flex flex-col pb-4">
            <button onClick={() => setIsIndustryOpen(!isIndustryOpen)} className={`w-full group flex items-center justify-between py-2 px-2 rounded-lg transition-all duration-200 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm shrink-0 grayscale opacity-60">📁</span>
                <span className={`text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Industry Micro-Agents</span>
              </div>
              {!isCollapsed && <span className={`text-[10px] transition-transform duration-300 ${isIndustryOpen ? 'rotate-180' : ''}`}>▼</span>}
            </button>
            
            <div className={`flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isIndustryOpen ? 'mt-1 opacity-100 max-h-[800px]' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-1">
                {industryLinks.map((link, index) => {
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <Link key={index} href={link.href!} className={`group flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-200 ${isCollapsed ? 'justify-center' : 'ml-2'} ${isActive ? 'bg-white dark:bg-[#1a1a1a] text-blue-600 dark:text-blue-400 font-bold shadow-sm border border-slate-200/50 dark:border-white/5' : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>
                      <span className={`text-lg shrink-0 transition-opacity ${isActive ? 'opacity-100 grayscale-0' : 'opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100'}`}>{link.icon}</span>
                      <span className={`flex-1 truncate text-[14px] transition-all duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </nav>

      {/* Profile Section */}
      <div className="shrink-0 p-4 border-t border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
        <div className={`flex items-center gap-3 rounded-xl transition-all duration-300 ${isCollapsed ? 'justify-center py-2 px-0' : 'px-2 py-2 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
          <div className="shrink-0 flex items-center justify-center">
             <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8 rounded-full shadow-sm" } }} />
          </div>
          <div className={`transition-all duration-300 whitespace-nowrap overflow-hidden flex flex-col justify-center ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
            {isLoaded && user && <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate">{user.fullName}</p>}
          </div>
        </div>
      </div>
    </aside>
  );
}