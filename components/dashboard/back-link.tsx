"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  href: string;
  label: string;
}

export function BackLink({ href, label }: BackLinkProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  // Reset loading state if the user navigates back to this page
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return (
    <Link 
      href={href} 
      onClick={() => setIsLoading(true)}
      className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors mb-8 group"
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
        isLoading 
          ? "bg-gray-900 border-gray-900 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] text-white" 
          : "bg-gray-50 border-gray-100 group-hover:bg-white group-hover:shadow-sm text-gray-900"
      }`}>
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        ) : (
          <ArrowLeft className="w-4 h-4" />
        )}
      </div>
      <span className={isLoading ? "text-gray-900" : ""}>{isLoading ? "Loading..." : label}</span>
    </Link>
  );
}
