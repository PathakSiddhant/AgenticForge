"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useState, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Theme state manage karne ke liye
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Initial load pe check karega
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white flex h-screen overflow-hidden transition-colors duration-300`}>
        
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-[#0f0f0f] border-r border-slate-200 dark:border-white/5 flex-col hidden md:flex transition-colors duration-300">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xl text-white shadow-lg">
              A
            </div>
            <h1 className="text-xl font-bold tracking-tight">AgenticForge</h1>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <span className="text-lg">🌟</span> Discover Agents
            </Link>

            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Categories</p>
            </div>
            
            {/* NAYA TAB: Developer Sandbox */}
            <Link href="/sandbox" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="text-lg">🛠️</span> Developer Sandbox
            </Link>

            <Link href="/finance" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="text-lg">📈</span> Finance & Trading
            </Link>
            <Link href="/hr" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="text-lg">🤝</span> Human Resources
            </Link>
            <Link href="/education" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="text-lg">🎓</span> Education & Research
            </Link>

            {/* NAYA TAB: Sales & Marketing */}
            <Link href="/sales" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="text-lg">💸</span> Sales & Marketing
            </Link>
          </nav>

          <div className="p-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">SP</div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Siddhant Pathak</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Developer</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-16 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-8 bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
            <div className="w-full max-w-md relative">
              <input 
                type="text" 
                placeholder="Search for an agent..." 
                className="w-full bg-slate-100 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-full px-4 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            
            <div className="flex items-center gap-4">
              {/* Theme Toggle Button */}
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
          
          <div className="flex-1 overflow-y-auto p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}