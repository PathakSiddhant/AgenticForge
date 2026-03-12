// Path: web-app/src/app/layout.tsx
"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const isLandingPage = pathname === "/";

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white flex h-screen overflow-hidden transition-colors duration-300`}>
        
        {/* Naya Component-based Sidebar */}
        <Sidebar />

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          
          {/* Header sirf tab dikhega jab hum Landing Page pe NAHI honge */}
          {!isLandingPage && (
            <header className="h-16 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-8 bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
              <div className="w-full max-w-md relative">
                <input 
                  type="text" 
                  placeholder="Search for an agent..." 
                  className="w-full bg-slate-100 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-full px-4 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
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
          
          <div className={`flex-1 overflow-y-auto ${!isLandingPage ? 'p-8' : ''}`}>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}