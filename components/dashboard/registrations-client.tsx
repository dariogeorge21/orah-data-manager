"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const pathname = usePathname();

  // Reset loading state if the user navigates back to this page
  useEffect(() => {
    setLoadingId(null);
  }, [pathname]);

  const filteredData = initialData.filter((reg) => 
    reg.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.college?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            placeholder="Search by name, email, college..." 
            className="pl-12 h-12 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto bg-gray-50 p-1.5 rounded-2xl border border-gray-200/60 shadow-inner">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setView("table")}
            className={`rounded-xl px-4 h-9 font-medium transition-all duration-300 ${view === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
          >
            <List className="w-4 h-4 mr-2" />
            Table
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setView("card")}
            className={`rounded-xl px-4 h-9 font-medium transition-all duration-300 ${view === "card" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Cards
          </Button>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-gray-100/50">
            <User className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold font-heading text-gray-900">No registrations found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          {view === "table" ? (
            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/80 border-b border-gray-100/80">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-gray-500 h-14 px-6">Name</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-gray-500 h-14 px-6">Contact</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-gray-500 h-14 px-6 hidden md:table-cell">College</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-gray-500 h-14 px-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((reg) => (
                      <TableRow key={reg.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50/80">
                        <TableCell className="font-semibold text-gray-900 px-6 py-4">
                          {reg.name}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-col space-y-0.5">
                            <span className="text-sm font-medium text-gray-700">{reg.email}</span>
                            <span className="text-xs text-gray-500">{reg.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm font-medium text-gray-600 max-w-[200px] truncate px-6 py-4">
                          {reg.college}
                        </TableCell>
                        <TableCell className="text-right px-6 py-4">
                          <Link 
                            href={`/dashboard/events/${eventId}/registrations/${reg.id}`}
                            onClick={() => setLoadingId(reg.id)}
                            className="inline-flex items-center justify-center h-9 px-4 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors group"
                          >
                            {loadingId === reg.id ? (
                              <span className="flex items-center gap-2 text-gray-900">
                                <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></span>
                                Loading...
                              </span>
                            ) : (
                              <>
                                Manage <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                              </>
                            )}
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((reg) => (
                <Card key={reg.id} className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 border border-gray-100 rounded-[24px] group flex flex-col h-full">
                  <CardHeader className="p-7 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-semibold text-xl tracking-tight text-gray-900 line-clamp-1">{reg.name}</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1 line-clamp-1">{reg.college}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-7 pt-2 flex flex-col flex-1 justify-end">
                    <div className="space-y-2 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                      <p className="text-sm font-medium text-gray-700 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</span>
                        <span className="truncate ml-2">{reg.email}</span>
                      </p>
                      <p className="text-sm font-medium text-gray-700 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Phone</span>
                        <span>{reg.phone}</span>
                      </p>
                    </div>
                    <Link 
                      href={`/dashboard/events/${eventId}/registrations/${reg.id}`}
                      onClick={() => setLoadingId(reg.id)}
                      className={`w-full h-12 flex items-center justify-center font-semibold rounded-xl transition-all duration-300 shadow-sm ${
                        loadingId === reg.id
                          ? "bg-gray-900 text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] pointer-events-none border border-gray-900" 
                          : "bg-white border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900"
                      }`}
                    >
                      {loadingId === reg.id ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Loading...
                        </span>
                      ) : (
                        "View Details"
                      )}
                    </Link>
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
