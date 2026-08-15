"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LayoutGrid, List, Search, ArrowRight, User } from "lucide-react";

interface RegistrationsClientProps {
  eventId: string;
  initialData: any[];
}

export default function RegistrationsClient({ eventId, initialData }: RegistrationsClientProps) {
  const [view, setView] = useState<"table" | "card">("table");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = initialData.filter((reg) => 
    reg.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.college?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search by name, email, college..." 
            className="pl-9 bg-gray-50 border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto bg-gray-50 p-1 rounded-lg border border-gray-200">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setView("table")}
            className={view === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}
          >
            <List className="w-4 h-4 mr-2" />
            Table
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setView("card")}
            className={view === "card" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Cards
          </Button>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <User className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No registrations found</h3>
          <p className="text-gray-500">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          {view === "table" ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-gray-600">Name</TableHead>
                      <TableHead className="font-semibold text-gray-600">Contact</TableHead>
                      <TableHead className="font-semibold text-gray-600 hidden md:table-cell">College</TableHead>
                      <TableHead className="font-semibold text-gray-600 hidden lg:table-cell">Status</TableHead>
                      <TableHead className="text-right font-semibold text-gray-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((reg) => (
                      <TableRow key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">
                          {reg.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900">{reg.email}</span>
                            <span className="text-xs text-gray-500">{reg.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-gray-600 max-w-[200px] truncate">
                          {reg.college}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline" className={reg.confirmed ? "border-green-200 text-green-700 bg-green-50" : "border-amber-200 text-amber-700 bg-amber-50"}>
                            {reg.confirmed ? "Confirmed" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                            <Link href={`/dashboard/events/${eventId}/registrations/${reg.id}`}>
                              Manage <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((reg) => (
                <Card key={reg.id} className="bg-white shadow-sm hover:shadow-md transition-shadow border-gray-100 group">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{reg.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{reg.college}</p>
                      </div>
                      <Badge variant="outline" className={reg.confirmed ? "border-green-200 text-green-700 bg-green-50" : "border-amber-200 text-amber-700 bg-amber-50"}>
                        {reg.confirmed ? "Confirmed" : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <div className="space-y-1 mb-4">
                      <p className="text-sm text-gray-700">{reg.email}</p>
                      <p className="text-sm text-gray-500">{reg.phone}</p>
                    </div>
                    <Button asChild variant="secondary" className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900">
                      <Link href={`/dashboard/events/${eventId}/registrations/${reg.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
