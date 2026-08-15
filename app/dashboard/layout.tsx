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
    <div className="min-h-screen bg-gray-50/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-50">
          <h2 className="font-heading text-lg font-semibold text-gray-900 tracking-tight">Orah Admin</h2>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === "/dashboard" 
                ? "bg-gray-900 text-white" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </Link>
          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Management
            </p>
          </div>
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith("/dashboard/events") 
                ? "bg-gray-900 text-white" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <CalendarDays className="w-4 h-4" />
            Events
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-50">
          <form action={signOut}>
            <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:hidden">
          <h2 className="font-heading text-lg font-semibold text-gray-900">Orah Admin</h2>
          <form action={signOut}>
            <button className="text-gray-500 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </header>
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
