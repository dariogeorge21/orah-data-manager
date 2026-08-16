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
    <div className="space-y-12 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-4xl font-heading font-bold text-gray-900 tracking-tight">Overview</h1>
        <p className="text-gray-500 mt-2 text-lg">Manage your events and registrations</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] overflow-hidden group hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-8 px-8">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Total Events</CardTitle>
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
              <CalendarDays className="h-5 w-5 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="text-5xl font-bold tracking-tighter text-gray-900">{totalEvents}</div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] overflow-hidden group hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-8 px-8">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Active Events</CardTitle>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100/50 group-hover:bg-emerald-100 transition-all duration-300">
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="text-5xl font-bold tracking-tighter text-gray-900">{activeEvents}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] overflow-hidden group hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-500 bg-gray-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-8 px-8">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Total Registrations</CardTitle>
            <div className="w-10 h-10 rounded-2xl bg-gray-800 flex items-center justify-center shadow-inner group-hover:bg-gray-700 transition-all duration-300">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="text-5xl font-bold tracking-tighter text-white">{totalRegistrations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Events Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Recent Events</h2>
        </div>
        
        {events.length === 0 ? (
          <div className="p-16 text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-[32px]">
            <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
              <CalendarDays className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-heading">No events found</h3>
            <p className="text-gray-500 mt-2">Create an event in the database to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {events.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
