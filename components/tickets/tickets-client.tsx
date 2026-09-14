"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutGrid,
  List,
  Search,
  Download,
  Eye,
  Ticket as TicketIcon,
  QrCode,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Users,
  School,
  FileDown,
  FileSpreadsheet
} from "lucide-react";
import { EnrichedTicketData } from "@/features/actions/tickets";
import TicketModal from "./ticket-modal";
import DigitalTicket from "./digital-ticket";
import BulkExportModal from "./bulk-export-modal";
import CsvExportModal from "@/components/common/csv-export-modal";
import { downloadTicketAsPdf } from "@/lib/pdf-generator";
import { toast } from "sonner";

interface TicketsClientProps {
  initialTickets: EnrichedTicketData[];
}

export default function TicketsClient({ initialTickets }: TicketsClientProps) {
  const [view, setView] = useState<"table" | "card">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [affiliationFilter, setAffiliationFilter] = useState("all");
  const [institutionFilter, setInstitutionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Modal preview state
  const [selectedTicket, setSelectedTicket] = useState<EnrichedTicketData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkExportOpen, setIsBulkExportOpen] = useState(false);
  const [isCsvExportOpen, setIsCsvExportOpen] = useState(false);

  // Single direct download loading tracker
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Default to card view on small screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setView("card");
    }
  }, []);

  // Dynamic filter lists
  const affiliationOptions = useMemo(() => {
    return Array.from(
      new Set(
        initialTickets
          .map((t) => t.registration.affiliation)
          .filter((val): val is string => Boolean(val && val.trim()))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [initialTickets]);

  const institutionOptions = useMemo(() => {
    const items = new Set<string>();
    initialTickets.forEach((t) => {
      if (t.registration.college?.trim()) items.add(t.registration.college.trim());
      if (t.registration.institute?.trim()) items.add(t.registration.institute.trim());
    });
    return Array.from(items).sort((a, b) => a.localeCompare(b));
  }, [initialTickets]);

  // Filtered dataset
  const filteredTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return initialTickets.filter((item) => {
      const reg = item.registration;
      const matchesSearch =
        query === "" ||
        reg.name?.toLowerCase().includes(query) ||
        reg.phone?.toLowerCase().includes(query) ||
        reg.email?.toLowerCase().includes(query) ||
        reg.affiliation?.toLowerCase().includes(query) ||
        reg.college?.toLowerCase().includes(query) ||
        reg.institute?.toLowerCase().includes(query) ||
        item.ticketCode?.toLowerCase().includes(query) ||
        item.formattedNumber?.includes(query);

      const matchesAffiliation =
        affiliationFilter === "all" ||
        (reg.affiliation ?? "") === affiliationFilter;

      const matchesInstitution =
        institutionFilter === "all" ||
        reg.college === institutionFilter ||
        reg.institute === institutionFilter;

      return matchesSearch && matchesAffiliation && matchesInstitution;
    });
  }, [initialTickets, searchQuery, affiliationFilter, institutionFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, affiliationFilter, institutionFilter]);

  const hasActiveFilters =
    affiliationFilter !== "all" || institutionFilter !== "all" || searchQuery.trim() !== "";

  const clearFilters = () => {
    setAffiliationFilter("all");
    setInstitutionFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Direct single-click PDF download handler
  const handleDirectDownload = async (ticketData: EnrichedTicketData) => {
    const reg = ticketData.registration;
    setDownloadingId(reg.id);
    const canvasId = `ticket-canvas-${reg.id}`;
    const cleanName = (reg.name || "Participant").replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `ORAH2K26_Ticket_${cleanName}_${ticketData.ticketCode}.pdf`;

    toast.info(`Generating ticket for ${reg.name}...`, { duration: 2000 });

    try {
      const ok = await downloadTicketAsPdf(canvasId, fileName);
      if (ok) {
        toast.success(`Ticket for ${reg.name} downloaded successfully!`);
      } else {
        toast.error("Failed to generate PDF ticket");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error generating ticket PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenPreview = (ticketData: EnrichedTicketData) => {
    setSelectedTicket(ticketData);
    setIsModalOpen(true);
  };

  const renderAffiliationDetails = (reg: any) => {
    const aff = reg.affiliation?.trim() || "";
    if (aff === "College" && reg.college) {
      return (
        <div className="space-y-0.5">
          <div className="text-sm font-semibold text-gray-900 truncate max-w-[260px]" title={reg.college}>
            {reg.college}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
              College
            </span>
            {reg.year_of_study && <span>· {reg.year_of_study}</span>}
          </div>
        </div>
      );
    }

    if (aff === "Institutes" && reg.institute) {
      return (
        <div className="space-y-0.5">
          <div className="text-sm font-semibold text-gray-900 truncate max-w-[260px]" title={reg.institute}>
            {reg.institute}
          </div>
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md text-[10px]">
            Institute
          </span>
        </div>
      );
    }

    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800 font-semibold px-2.5 py-1 rounded-lg">
        {aff || "Participant"}
      </Badge>
    );
  };

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-50/60 via-indigo-50/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-900 text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ORAH 2K26 Digital Passes
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 tracking-tight">
              Participant Tickets
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl">
              Download, preview, and verify digital tickets with unique QR codes for every registered participant.
            </p>
          </div>

          {/* Quick Stat Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 bg-gray-50/80 border border-gray-100 px-4 py-2.5 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center border border-gray-100">
                <TicketIcon className="w-4 h-4 text-gray-700" />
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Tickets</div>
                <div className="text-lg font-bold text-gray-900 leading-tight">{initialTickets.length}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-gray-50/80 border border-gray-100 px-4 py-2.5 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center border border-gray-100">
                <School className="w-4 h-4 text-gray-700" />
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Institutions</div>
                <div className="text-lg font-bold text-gray-900 leading-tight">{institutionOptions.length}</div>
              </div>
            </div>

            {/* CSV Spreadsheet Export Button */}
            <Button
              variant="outline"
              onClick={() => setIsCsvExportOpen(true)}
              className="h-[52px] px-5 rounded-2xl border-gray-200 hover:border-gray-900 bg-white hover:bg-gray-50 text-gray-900 font-semibold flex items-center gap-2.5 shadow-2xs hover:shadow transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                Custom
              </span>
            </Button>

            {/* Batch Export Passes Button */}
            <Button
              onClick={() => setIsBulkExportOpen(true)}
              className="h-[52px] px-5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-semibold flex items-center gap-2.5 shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export Tickets</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                PDF / ZIP
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-5 bg-white p-4 sm:p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search participant, college, ticket code..."
              className="pl-12 h-12 text-base sm:text-sm bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all text-gray-900 font-medium placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 items-center gap-2 w-full sm:w-auto bg-gray-50 p-1.5 rounded-2xl border border-gray-200/60 shadow-inner">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("table")}
              className={`rounded-xl px-4 h-10 sm:h-9 font-medium transition-all ${
                view === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <List className="w-4 h-4 mr-2" />
              Table View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("card")}
              className={`rounded-xl px-4 h-10 sm:h-9 font-medium transition-all ${
                view === "card" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Card View
            </Button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Affiliation Filter */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500">Filter by Affiliation</p>
            <Select value={affiliationFilter} onValueChange={(val) => setAffiliationFilter(val ?? "all")}>
              <SelectTrigger className="w-full h-11 px-3.5 text-sm bg-gray-50/50 border-gray-200 hover:border-gray-300 rounded-xl">
                <SelectValue placeholder="All affiliations" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl">
                <SelectItem value="all">All affiliations</SelectItem>
                {affiliationOptions.map((aff) => (
                  <SelectItem key={aff} value={aff}>
                    {aff}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* College / Institution Filter */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500">Filter by College / Institute</p>
            <Select value={institutionFilter} onValueChange={(val) => setInstitutionFilter(val ?? "all")}>
              <SelectTrigger className="w-full h-11 px-3.5 text-sm bg-gray-50/50 border-gray-200 hover:border-gray-300 rounded-xl">
                <SelectValue placeholder="All institutions" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl max-h-72">
                <SelectItem value="all">All institutions</SelectItem>
                {institutionOptions.map((inst) => (
                  <SelectItem key={inst} value={inst}>
                    {inst}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results summary & reset */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-500 font-medium">
            Showing <span className="text-gray-900 font-semibold">{filteredTickets.length}</span> of{" "}
            {initialTickets.length} tickets
          </p>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-9 rounded-xl border-gray-200 text-gray-700 hover:text-gray-900 flex items-center gap-1.5 text-xs font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-gray-100/50">
            <TicketIcon className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold font-heading text-gray-900">No tickets found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="mt-5 rounded-xl">
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {view === "table" ? (
            /* ================= TABLE VIEW ================= */
            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/80 border-b border-gray-100/80">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-gray-500 h-14 px-6">
                        No.
                      </TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-gray-500 h-14 px-6">
                        Participant
                      </TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-gray-500 h-14 px-6">
                        Affiliation & Institution
                      </TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-gray-500 h-14 px-6">
                        Ticket Code
                      </TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-gray-500 h-14 px-6 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTickets.map((item) => {
                      const reg = item.registration;
                      const isDownloading = downloadingId === reg.id;

                      return (
                        <TableRow
                          key={reg.id}
                          className="hover:bg-gray-50/50 transition-colors border-b border-gray-50/80"
                        >
                          {/* Sequential Number */}
                          <TableCell className="px-6 py-4 font-mono font-bold text-xs text-gray-400">
                            #{item.formattedNumber}
                          </TableCell>

                          {/* Participant Name */}
                          <TableCell className="px-6 py-4">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-gray-900 text-base block">
                                {reg.name}
                              </span>
                              <span className="text-xs text-gray-500 font-mono">
                                {reg.phone}
                              </span>
                            </div>
                          </TableCell>

                          {/* Affiliation + College Name */}
                          <TableCell className="px-6 py-4">
                            {renderAffiliationDetails(reg)}
                          </TableCell>

                          {/* Ticket Code */}
                          <TableCell className="px-6 py-4">
                            <Badge
                              variant="outline"
                              className="font-mono text-xs font-bold text-gray-800 bg-gray-50 border-gray-200 px-3 py-1 rounded-lg"
                            >
                              {item.ticketCode}
                            </Badge>
                          </TableCell>

                          {/* Actions: Download & Preview */}
                          <TableCell className="text-right px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenPreview(item)}
                                className="h-9 px-3 rounded-xl border-gray-200 hover:bg-gray-100 text-xs font-semibold text-gray-700 shadow-xs"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                                Preview
                              </Button>

                              <Button
                                size="sm"
                                onClick={() => handleDirectDownload(item)}
                                disabled={isDownloading}
                                className="h-9 px-3.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                              >
                                {isDownloading ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    <span>Exporting...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            /* ================= CARD VIEW ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedTickets.map((item) => {
                const reg = item.registration;
                const isDownloading = downloadingId === reg.id;

                return (
                  <Card
                    key={reg.id}
                    className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border border-gray-100 rounded-[24px] flex flex-col justify-between overflow-hidden"
                  >
                    <CardHeader className="p-6 pb-3 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                            PASS #{item.formattedNumber}
                          </span>
                          <h3 className="font-bold text-xl tracking-tight text-gray-900 mt-2 line-clamp-1">
                            {reg.name}
                          </h3>
                        </div>

                        <Badge
                          variant="outline"
                          className="font-mono text-xs font-bold text-gray-900 bg-gray-50 border-gray-200 px-2.5 py-1 rounded-lg shrink-0"
                        >
                          {item.affiliationCode}
                        </Badge>
                      </div>

                      <div className="pt-1">
                        {renderAffiliationDetails(reg)}
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 pt-3 space-y-4">
                      {/* Ticket Code Box */}
                      <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Code
                        </span>
                        <span className="font-mono font-bold text-xs text-gray-900">
                          {item.ticketCode}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button
                          variant="outline"
                          onClick={() => handleOpenPreview(item)}
                          className="h-11 rounded-xl border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                          Preview
                        </Button>

                        <Button
                          onClick={() => handleDirectDownload(item)}
                          disabled={isDownloading}
                          className="h-11 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-xs"
                        >
                          {isDownloading ? (
                            <span className="flex items-center gap-1.5">
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                              Exporting...
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </span>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-xl border-gray-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-gray-600 px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl border-gray-200"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Hidden Render Targets for Direct PDF Downloads */}
      <div className="absolute left-[-9999px] top-[-9999px] pointer-events-none opacity-0">
        {paginatedTickets.map((item) => (
          <div key={`hidden-${item.registration.id}`} style={{ width: "940px", height: "300px" }}>
            <DigitalTicket
              id={`ticket-canvas-${item.registration.id}`}
              registration={item.registration}
              ticketCode={item.ticketCode}
              sequenceNumber={item.sequenceNumber}
              ticketId={item.ticket?.id || item.registration.id}
            />
          </div>
        ))}
      </div>

      {/* Ticket Preview & Export Modal */}
      {selectedTicket && (
        <TicketModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          registration={selectedTicket.registration}
          ticketCode={selectedTicket.ticketCode}
          sequenceNumber={selectedTicket.sequenceNumber}
          ticketId={selectedTicket.ticket?.id || selectedTicket.registration.id}
        />
      )}

      {/* Bulk Ticket Export Modal */}
      <BulkExportModal
        open={isBulkExportOpen}
        onOpenChange={setIsBulkExportOpen}
        allTickets={initialTickets}
        filteredTickets={filteredTickets}
      />

      {/* Enhanced CSV Export Modal */}
      <CsvExportModal
        open={isCsvExportOpen}
        onOpenChange={setIsCsvExportOpen}
        allItems={initialTickets}
        filteredItems={filteredTickets}
        title="Export Tickets to CSV"
        defaultFilename="ORAH_2K26_Tickets_Export"
        itemName="tickets"
      />
    </div>
  );
}

