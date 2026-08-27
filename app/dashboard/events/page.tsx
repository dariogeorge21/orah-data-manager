import { getEvents } from "@/features/actions/events";
import { redirect } from "next/navigation";

export default async function EventsIndexPage() {
  const events = await getEvents();
  if (events && events.length > 0) {
    redirect(`/dashboard/events/${events[0].id}`);
  }
  redirect("/dashboard");
}
