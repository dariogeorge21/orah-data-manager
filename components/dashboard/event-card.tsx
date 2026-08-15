import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Users, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  event: any; // We'll type this properly later or just use any for now
}

export function EventCard({ event }: EventCardProps) {
  const regCount = event.registrations?.[0]?.count || 0;
  
  return (
    <Card className="flex flex-col overflow-hidden bg-white hover:shadow-lg transition-all duration-300 border-gray-100 group">
      <CardHeader className="border-b border-gray-50 pb-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="font-heading font-semibold text-lg text-gray-900 line-clamp-1">
              {event.name}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>
                {event.event_date ? format(new Date(event.event_date), "MMM d, yyyy") : "TBD"}
              </span>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={
              event.status === "ACCEPTING" 
                ? "bg-green-50 text-green-700 hover:bg-green-100" 
                : "bg-gray-100 text-gray-700"
            }
          >
            {event.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pt-4 pb-2 space-y-3">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="line-clamp-1">{event.location || "No location set"}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-100/50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Registrations</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {regCount}
            {event.max_capacity ? <span className="text-sm font-normal text-gray-400"> / {event.max_capacity}</span> : ""}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 pb-4">
        <Link 
          href={`/dashboard/events/${event.id}`} 
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
        >
          View Details
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  );
}
