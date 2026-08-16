import { getRegistrationById } from "@/features/actions/registrations";
import { getEventById } from "@/features/actions/events";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import RegistrationForm from "@/components/dashboard/registration-form";
import { BackLink } from "@/components/dashboard/back-link";

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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <BackLink href={`/dashboard/events/${eventId}`} label={`Back to ${event.name}`} />
        
        <h1 className="text-4xl font-heading font-bold text-gray-900 tracking-tight leading-tight mb-2">
          Manage Registration
        </h1>
        <p className="text-base text-gray-500 font-medium">
          View and edit details for <strong className="text-gray-900">{registration.name}</strong>
        </p>
      </div>

      <RegistrationForm eventId={eventId} registration={registration} />
    </div>
  );
}
