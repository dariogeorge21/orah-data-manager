import { getEventById } from "@/features/actions/events";
import { getRegistrationsByEvent } from "@/features/actions/registrations";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, CalendarDays, Users } from "lucide-react";
import { format } from "date-fns";
import RegistrationsClient from "@/components/dashboard/registrations-client";
import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">
                {event.name}
              </h1>
              <Badge 
                variant="secondary" 
                className={
                  event.status === "ACCEPTING" 
                    ? "bg-green-50 text-green-700" 
                    : "bg-gray-100 text-gray-700"
                }
              >
                {event.status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {event.event_date && (
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  {format(new Date(event.event_date), "MMMM d, yyyy")}
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {event.location}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-400" />
                {registrations.length} Registrations
              </div>
            </div>
          </div>
        </div>
      </div>

      <RegistrationsClient eventId={eventId} initialData={registrations} />
    </div>
  );
}
