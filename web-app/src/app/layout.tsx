import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { AppEntrance } from "@/components/app-entrance";
import Sidebar from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Topbar } from "@/components/topbar";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AgenticForge",
  description:
    "A platform of specialized AI agents for Finance, HR, Sales, Support, and more - plus LeadForge and MediForge, two complete enterprise workflow products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <body className="flex h-dvh overflow-hidden font-sans antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <Sidebar />
            <div className="flex h-full min-w-0 flex-1 flex-col">
              <Topbar />
              <main className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
                {children}
              </main>
            </div>
            <Toaster
              position="bottom-right"
              toastOptions={{
                className:
                  "!bg-surface-raised !border !border-border !text-ink !shadow-lg",
              }}
            />
            <AppEntrance />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
