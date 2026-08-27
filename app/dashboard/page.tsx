import { getEvents } from "@/features/actions/events";
import { getAllRegistrations } from "@/features/actions/registrations";
import GroupedRegistrationsDashboard from "@/components/dashboard/grouped-registrations-dashboard";

export const metadata = {
  title: "Registrations by Date | JY Pala Admin",
};

export default async function DashboardPage() {
  const [events, registrations] = await Promise.all([
    getEvents(),
    getAllRegistrations(),
  ]);

  return (
    <GroupedRegistrationsDashboard
      initialRegistrations={registrations}
      events={events}
    />
  );
}
