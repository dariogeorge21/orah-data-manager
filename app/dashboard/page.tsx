import { getEvents } from "@/features/actions/events";
import { EventCard } from "@/components/dashboard/event-card";
import { Users, CalendarDays, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Dashboard Overview | Orah Admin",
};

export default async function DashboardPage() {
  const events = await getEvents();
  
  const totalEvents = events.length;
  const activeEvents = events.filter((e: any) => e.status === "ACCEPTING").length;
  const totalRegistrations = events.reduce((acc: number, event: any) => {
    return acc + (event.registrations?.[0]?.count || 0);
  }, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">Overview</h1>
        <p className="text-gray-500 mt-1">Manage your events and registrations</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalEvents}</div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Events</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeEvents}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalRegistrations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Events Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Recent Events</h2>
        
        {events.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-gray-200 rounded-xl">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No events found</h3>
            <p className="text-gray-500">Create an event in the database to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
