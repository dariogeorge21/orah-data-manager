"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogOut, LayoutDashboard, CalendarDays } from "lucide-react";
import { signOut } from "@/features/actions/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex-shrink-0 hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative z-10">
        <div className="h-24 flex items-center px-8 border-b border-gray-50/50">
          <h2 className="font-heading text-xl font-bold text-gray-900 tracking-tight">JY Pala Admin</h2>
        </div>
        
        <nav className="flex-1 px-5 py-8 space-y-2">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300",
              pathname === "/dashboard" 
                ? "bg-gray-900 text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </Link>
          
          <div className="pt-6 pb-2">
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Management
            </p>
          </div>
          
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300",
              pathname.startsWith("/dashboard/events") 
                ? "bg-gray-900 text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <CalendarDays className="w-5 h-5" />
            Events
          </Link>
        </nav>
        
        <div className="p-5 border-t border-gray-50/50">
          <button 
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 md:hidden sticky top-0 z-20">
          <h2 className="font-heading text-xl font-bold text-gray-900 tracking-tight">JY Pala Admin</h2>
          <button 
            onClick={() => signOut()}
            className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
