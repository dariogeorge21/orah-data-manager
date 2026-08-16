import { getEventById } from "@/features/actions/events";
import { getRegistrationsByEvent } from "@/features/actions/registrations";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, CalendarDays, Users } from "lucide-react";
import { format } from "date-fns";
import RegistrationsClient from "@/components/dashboard/registrations-client";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/dashboard/back-link";

export default async function EventRegistrationsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const [event, registrations] = await Promise.all([
    getEventById(eventId),
    getRegistrationsByEvent(eventId),
  ]);

  if (!event) {
    notFound();
  }
  
  const isAccepting = event.status === "ACCEPTING";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <BackLink href="/dashboard" label="Back to Overview" />
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge 
                variant="secondary" 
                className={
                  isAccepting 
                    ? "bg-emerald-50 text-emerald-600 border-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm" 
                    : "bg-gray-50 text-gray-500 border-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm"
                }
              >
                {event.status}
              </Badge>
              {event.event_date && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                  <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                  {format(new Date(event.event_date), "MMMM d, yyyy")}
                </div>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 tracking-tight leading-tight">
              {event.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pt-2">
              {event.location && (
                <div className="flex items-center gap-3 bg-gray-50/50 px-5 py-3 rounded-2xl border border-gray-100/50">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100/80">
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="font-medium text-gray-700">{event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-3 bg-gray-50/50 px-5 py-3 rounded-2xl border border-gray-100/50">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100/80">
                  <Users className="w-4 h-4 text-gray-400" />
                </div>
                <span className="font-medium text-gray-700">
                  <strong className="text-gray-900 text-lg mr-1.5">{registrations.length}</strong> 
                  Registrations
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2">
        <RegistrationsClient eventId={eventId} initialData={registrations} />
      </div>
    </div>
  );
}
