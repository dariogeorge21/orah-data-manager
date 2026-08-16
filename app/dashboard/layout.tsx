"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogOut, LayoutDashboard, CalendarDays } from "lucide-react";
import { signOut } from "@/features/actions/auth";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error(error);
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

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
            onClick={() => setShowLogoutModal(true)}
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
            onClick={() => setShowLogoutModal(true)}
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

      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent className="rounded-[32px] border-gray-100 shadow-2xl p-8 sm:max-w-[400px]">
          <DialogHeader className="space-y-3">
            <div className="mx-auto w-14 h-14 bg-red-50 rounded-[20px] flex items-center justify-center mb-2 shadow-sm border border-red-100">
              <LogOut className="w-6 h-6 text-red-500" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center tracking-tight text-gray-900">
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500 font-medium pt-2 text-base">
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              type="button" 
              disabled={isLoggingOut} 
              onClick={() => setShowLogoutModal(false)}
              className="h-12 rounded-xl font-semibold border-gray-200 hover:bg-gray-50 flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout} 
              disabled={isLoggingOut} 
              className="h-12 rounded-xl font-semibold shadow-md bg-red-600 hover:bg-red-700 text-white flex-1"
            >
              {isLoggingOut ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Logging out...
                </span>
              ) : (
                "Logout"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
