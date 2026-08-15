import { getRegistrationById } from "@/features/actions/registrations";
import { getEventById } from "@/features/actions/events";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RegistrationForm from "@/components/dashboard/registration-form";

export default async function RegistrationPage({
  params,
}: {
  params: Promise<{ eventId: string; regId: string }>;
}) {
  const { eventId, regId } = await params;

  const [event, registration] = await Promise.all([
    getEventById(eventId),
    getRegistrationById(regId),
  ]);

  if (!event || !registration) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div>
        <Link 
          href={`/dashboard/events/${eventId}`} 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {event.name} Registrations
        </Link>
        
        <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">
          Manage Registration
        </h1>
        <p className="text-gray-500 mt-1">
          View and edit registration details for {registration.name}
        </p>
      </div>

      <RegistrationForm eventId={eventId} registration={registration} />
    </div>
  );
}
