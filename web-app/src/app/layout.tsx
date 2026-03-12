// Path: web-app/src/app/layout.tsx
"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { ALL_AGENTS } from "@/lib/agents"; // 🌟 NAYA DYNAMIC IMPORT

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const isLandingPage = pathname === "/";
  const isAuthPage = pathname.startsWith("/sign-");
  const hideLayoutElements = isLandingPage || isAuthPage;

  // 🌟 DYNAMIC SEARCH LOGIC
  const filteredAgents = ALL_AGENTS.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    agent.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white flex h-screen overflow-hidden transition-colors duration-300`}>
          
          <Sidebar />

          <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
            
            {/* FLOATING BUTTONS FOR LANDING PAGE */}
            {hideLayoutElements && (
              <div className="absolute top-6 right-8 flex items-center gap-4 z-50">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-full bg-slate-200/50 dark:bg-white/10 hover:bg-slate-300/50 dark:hover:bg-white/20 transition-colors text-xl backdrop-blur-md border border-slate-300/50 dark:border-white/10"
                  title="Toggle Theme"
                >
                  {isDarkMode ? "☀️" : "🌙"}
                </button>
                {isLandingPage && (
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5">
                    Deploy Custom
                  </button>
                )}
              </div>
            )}

            {/* DASHBOARD HEADER & SMART SEARCH */}
            {!hideLayoutElements && (
              <header className="h-16 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-8 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 shrink-0 z-40">
                
                <div className="w-full max-w-md relative">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search agents by name or category..." 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      className="w-full bg-slate-100 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                  </div>

                  {showDropdown && searchQuery.trim() !== "" && (
                    <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                      {filteredAgents.length > 0 ? (
                        <ul className="max-h-64 overflow-y-auto custom-scrollbar">
                          {filteredAgents.map((agent, index) => (
                            <li key={index}>
                              <button
                                onClick={() => {
                                  router.push(agent.href);
                                  setSearchQuery("");
                                  setShowDropdown(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 flex flex-col transition-colors border-b border-slate-100 dark:border-white/5 last:border-0"
                              >
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{agent.name}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{agent.category}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center font-medium">
                          No agents found matching &quot;{searchQuery}&quot;
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-xl"
                    title="Toggle Theme"
                  >
                    {isDarkMode ? "☀️" : "🌙"}
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                    Deploy Custom
                  </button>
                </div>
              </header>
            )}
            
            <div className={`flex-1 overflow-y-auto ${!hideLayoutElements ? 'p-8' : ''}`}>
              {children}
            </div>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}