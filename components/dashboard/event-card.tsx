"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { Calendar, Users, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  event: any; // We'll type this properly later or just use any for now
}

export function EventCard({ event }: EventCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  // Reset loading state if the user navigates back to this page
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const regCount = event.registrations?.[0]?.count || 0;
  const isAccepting = event.status === "ACCEPTING";

  return (
    <Card className="flex flex-col overflow-hidden bg-white hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-500 border border-gray-100 group rounded-[24px]">
      <CardHeader className="pt-8 px-8 pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Badge
              variant="secondary"
              className={
                isAccepting
                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 border-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm"
              }
            >
              {event.status}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {event.event_date ? format(new Date(event.event_date), "MMM d, yyyy") : "TBD"}
              </span>
            </div>
          </div>
          <h3 className="font-heading font-semibold text-2xl tracking-tight text-gray-900 line-clamp-2 leading-tight group-hover:text-black transition-colors">
            {event.name}
          </h3>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-8 py-2 space-y-6">
        <div className="flex items-start gap-3 text-sm text-gray-500">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <span className="line-clamp-2 font-medium leading-relaxed">{event.location || "No location set"}</span>
        </div>

        <div className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-100/50 group-hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm border border-gray-100/80">
              <Users className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-600">Registrations</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              {regCount}
            </span>
            {event.max_capacity ? (
              <span className="text-sm font-medium text-gray-400">/ {event.max_capacity}</span>
            ) : null}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-8 pb-8 pt-4">
        <Link
          href={`/dashboard/events/${event.id}`}
          onClick={() => setIsLoading(true)}
          className={`w-full flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium rounded-2xl transition-all duration-300 ${isLoading
              ? "bg-gray-900 text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] pointer-events-none"
              : "text-gray-900 bg-transparent border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white"
            }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Loading...
            </span>
          ) : (
            <>
              View Details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Link>
      </CardFooter>
    </Card>
  );
}
